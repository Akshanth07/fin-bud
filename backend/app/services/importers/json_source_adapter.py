import json
from pathlib import Path
from typing import Any, Dict, List
from app.services.importers.base_adapter import BaseSchemeAdapter


class JSONSourceAdapter(BaseSchemeAdapter):
    """
    Adapter that loads government schemes from local seed JSON files
    (e.g., seed_data/central_schemes.json and seed_data/state_schemes.json).
    """

    def __init__(self, file_path: str, source_identifier: str = "JSONSource"):
        self.file_path = Path(file_path)
        self._source_name = source_identifier

    @property
    def source_name(self) -> str:
        return self._source_name

    async def fetch_schemes(self) -> List[Dict[str, Any]]:
        if not self.file_path.exists():
            return []

        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
                return []
        except Exception as e:
            print(f"Error reading JSON scheme dataset from {self.file_path}: {e}")
            return []
