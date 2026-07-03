import oracledb

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


pool = oracledb.create_pool(
    config_dir=settings.WALLET_LOCATION,
    user=settings.DB_USER,
    password=settings.DB_PASSWORD,
    dsn=settings.CONNECT_STRING,
    wallet_location=settings.WALLET_LOCATION,
    wallet_password=settings.WALLET_PASSWORD,
    min=1,
    max=5,
    increment=1,
)

engine = create_engine(
    "oracle+oracledb://",
    creator=lambda: pool.acquire(),
    echo=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass