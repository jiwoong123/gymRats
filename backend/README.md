alembic revision --autogenerate -m ""

uv sync

cp .env.example .env

alembic upgrade head

uvicorn app.main:app --reload

초기화
DROP TABLE routines CASCADE CONSTRAINTS;
