from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_USER: str
    DB_PASSWORD: str
    WALLET_LOCATION: str
    WALLET_PASSWORD: str
    CONNECT_STRING: str
    JWT_SECRET_KEY: str
    SQL_ECHO: bool = False
    CORS_ORIGINS: str
    EMAIL_DELIVERY_MODE: str = "smtp"
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_FROM_NAME: str = "GymRats"
    SMTP_USE_TLS: bool = True

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
