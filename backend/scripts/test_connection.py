import oracledb

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


def run_app():
    try:
        CONNECT_STRING = "gymrats_medium"
        pool = oracledb.create_pool(
            config_dir=settings.WALLET_LOCATION,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            dsn=settings.CONNECT_STRING,
            wallet_location=settings.WALLET_LOCATION,
            wallet_password=settings.WALLET_PASSWORD,
        )
        with pool.acquire() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM DUAL")
                result = cursor.fetchone()
                if result:
                    print(f"Connected successfully! Query result: {result[0]}")
    except oracledb.Error as e:
        print(f"Could not connect to the database - Error occurred: {str(e)}")
    except Exception as e:
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    run_app()
