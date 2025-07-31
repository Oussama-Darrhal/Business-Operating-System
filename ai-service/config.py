import os
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Database settings
    database_url: str = "mysql://laravel:password@mysql:3306/laravel"
    db_host: str = "mysql"
    db_port: int = 3306
    db_username: str = "laravel"
    db_password: str = "password"
    db_database: str = "laravel"
    
    # Google Cloud settings
    google_application_credentials: Optional[str] = None
    google_cloud_project: Optional[str] = None
    
    # AI Service settings
    max_text_length: int = 10000
    default_language: str = "en"
    confidence_threshold: float = 0.5
    batch_size: int = 100
    
    # API settings
    api_title: str = "BOS AI Analysis Service"
    api_description: str = "AI-powered sentiment analysis and topic extraction"
    api_version: str = "1.0.0"
    
    # Logging settings
    log_level: str = "INFO"
    
    # CORS settings
    cors_origins: list = ["*"]
    cors_allow_credentials: bool = True
    cors_allow_methods: list = ["*"]
    cors_allow_headers: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Environment-specific configurations
def get_database_url() -> str:
    """Get database URL from environment or settings"""
    return os.getenv('DATABASE_URL', settings.database_url)

def get_google_credentials_path() -> Optional[str]:
    """Get Google Cloud credentials path"""
    return os.getenv('GOOGLE_APPLICATION_CREDENTIALS', settings.google_application_credentials)

def is_development() -> bool:
    """Check if running in development mode"""
    return os.getenv('ENVIRONMENT', 'development').lower() == 'development'

def is_production() -> bool:
    """Check if running in production mode"""
    return os.getenv('ENVIRONMENT', 'development').lower() == 'production' 