import oracledb, datetime

from sqlalchemy import create_engine, func
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Mapped, mapped_column

from app.core.config import settings

# Oracle Connection Pool
pool = oracledb.create_pool(
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
    creator=pool.acquire,
    echo=True,
    # echo False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    created_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now(),
    )

    updated_at: Mapped[datetime.datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
    )
