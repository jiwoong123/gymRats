import datetime
import threading

import oracledb

from sqlalchemy import create_engine, func
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Mapped, mapped_column
from sqlalchemy.pool import NullPool

from app.core.config import settings

_oracle_pool = None
_pool_lock = threading.Lock()


def acquire_connection():
    """Create the driver pool on first use so imports and unit tests stay offline."""
    global _oracle_pool
    if _oracle_pool is None:
        with _pool_lock:
            if _oracle_pool is None:
                _oracle_pool = oracledb.create_pool(
                    user=settings.DB_USER,
                    password=settings.DB_PASSWORD,
                    dsn=settings.CONNECT_STRING,
                    wallet_location=settings.WALLET_LOCATION,
                    wallet_password=settings.WALLET_PASSWORD,
                    min=1,
                    max=5,
                    increment=1,
                )
    return _oracle_pool.acquire()

engine = create_engine(
    "oracle+oracledb://",
    creator=acquire_connection,
    echo=settings.SQL_ECHO,
    poolclass=NullPool,
    pool_pre_ping=True,
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
