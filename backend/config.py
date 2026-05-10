import os
from typing import List

class Settings:
    PROJECT_NAME = "Build Signal Intelligence"
    PROJECT_VERSION = "1.0.0"
    
    # Environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
    DEBUG = ENVIRONMENT != "production"
    
    # Server
    API_PREFIX = "/api"
    DOMAIN = os.getenv("DOMAIN", "buildsignalintell.com")
    API_DOMAIN = os.getenv("API_DOMAIN", "api.buildsignalintell.com")
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017/buildsignalintell")
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "https://buildsignalintell.com",
        "https://www.buildsignalintell.com",
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # API Configuration
    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

settings = Settings()
