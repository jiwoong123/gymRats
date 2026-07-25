from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from app.api.weekly_summary.schema import (
    BodyPartSummary,
    DailyActivity,
    ExerciseSummary,
    WeeklySummaryResponse,
    WeeklyTotals,
)
from app.db.repositories.workoutRepository import WorkoutRepository


def get_weekly_summary(
    db: Session,
    user_id: int,
    requested_date: date,
) -> WeeklySummaryResponse:
    week_start = requested_date - timedelta(days=requested_date.weekday())
    week_end = week_start + timedelta(days=6)
    range_start = datetime.combine(week_start, time.min)
    range_end = datetime.combine(week_end + timedelta(days=1), time.min)
    sessions = WorkoutRepository.get_sessions_between(db, user_id, range_start, range_end)

    daily = {
        week_start + timedelta(days=offset): {"sets": 0, "volume": 0.0}
        for offset in range(7)
    }
    exercises: dict[int, dict] = {}
    body_parts: dict[int, dict] = {}
    total_sets = 0
    total_reps = 0
    total_volume = 0.0

    for session in sessions:
        session_date = session.started_at.date()
        for workout_exercise in session.exercises:
            exercise = workout_exercise.exercise
            exercise_total = exercises.setdefault(
                exercise.id,
                {
                    "exercise_id": exercise.id,
                    "name": exercise.name_kr,
                    "body_part": exercise.body_part,
                    "sets": 0,
                    "reps": 0,
                    "volume": 0.0,
                    "max_weight": 0.0,
                },
            )
            body_part_total = body_parts.setdefault(
                exercise.body_part,
                {"body_part": exercise.body_part, "sets": 0, "volume": 0.0},
            )

            for workout_set in workout_exercise.sets:
                if not workout_set.completed or workout_set.is_warmup:
                    continue
                reps = workout_set.reps or 0
                weight = float(workout_set.weight or 0)
                volume = weight * reps

                total_sets += 1
                total_reps += reps
                total_volume += volume
                daily[session_date]["sets"] += 1
                daily[session_date]["volume"] += volume
                exercise_total["sets"] += 1
                exercise_total["reps"] += reps
                exercise_total["volume"] += volume
                exercise_total["max_weight"] = max(exercise_total["max_weight"], weight)
                body_part_total["sets"] += 1
                body_part_total["volume"] += volume

    duration_minutes = sum(
        max(0, int((session.ended_at - session.started_at).total_seconds() // 60))
        for session in sessions
        if session.ended_at is not None
    )

    return WeeklySummaryResponse(
        week_start=week_start,
        week_end=week_end,
        totals=WeeklyTotals(
            workout_days=len({session.started_at.date() for session in sessions}),
            sessions=len(sessions),
            duration_minutes=duration_minutes,
            sets=total_sets,
            reps=total_reps,
            volume=total_volume,
        ),
        daily_activity=[
            DailyActivity(date=day, sets=values["sets"], volume=values["volume"])
            for day, values in daily.items()
        ],
        exercises=[
            ExerciseSummary(**values)
            for values in sorted(exercises.values(), key=lambda item: (-item["volume"], item["name"]))
        ],
        body_parts=[
            BodyPartSummary(**values)
            for values in sorted(body_parts.values(), key=lambda item: -item["volume"])
        ],
    )
