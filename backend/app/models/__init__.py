from .user import User
from .exercise import Exercise
from .personal_record import PersonalRecord
from .refresh_token import RefreshToken
from .routine import Routine
from .routine_exercise import RoutineExercise
from .workout_exercise import WorkoutExercise
from .workout_session import WorkoutSession
from .workout_set import WorkoutSet

# uv run alembic revision --autogenerate -m "commit memo"
# uv run alembic upgrade head
