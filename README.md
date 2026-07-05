# gymRats
Gym recording service


uv sync

cp .env.example .env

uv run alembic upgrade head

uv run uvicorn app.main:app --reload