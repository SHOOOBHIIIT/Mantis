from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    openai_api_key: str = ""
    gemini_api_key: str = ""
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"
    moss_project_id: str = ""
    moss_project_key: str = ""
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
