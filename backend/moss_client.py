"""
MOSS client singleton.
Falls back gracefully if MOSS credentials are not configured.
"""
from config import settings

_moss_client = None
_moss_available = False


def get_moss():
    global _moss_client, _moss_available
    if _moss_client is not None:
        return _moss_client

    if not settings.moss_project_id or not settings.moss_project_key:
        return None

    try:
        from moss import MossClient  # type: ignore
        _moss_client = MossClient(settings.moss_project_id, settings.moss_project_key)
        _moss_available = True
    except ImportError:
        _moss_client = None
        _moss_available = False

    return _moss_client


def is_moss_available() -> bool:
    return get_moss() is not None
