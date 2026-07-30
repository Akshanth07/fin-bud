from typing import Any, Dict, List
from app.services.importers.base_adapter import BaseSchemeAdapter
from app.services.importers.json_source_adapter import JSONSourceAdapter


class MySchemeAdapter(BaseSchemeAdapter):
    """Adapter for myScheme portal data source."""

    def __init__(self, seed_file: str = "backend/seed_data/central_schemes.json"):
        self.delegate = JSONSourceAdapter(seed_file, source_identifier="myScheme")

    @property
    def source_name(self) -> str:
        return "myScheme"

    async def fetch_schemes(self) -> List[Dict[str, Any]]:
        return await self.delegate.fetch_schemes()


class DataGovAdapter(BaseSchemeAdapter):
    """Adapter for data.gov.in portal data source."""

    def __init__(self, seed_file: str = "backend/seed_data/state_schemes.json"):
        self.delegate = JSONSourceAdapter(seed_file, source_identifier="data.gov.in")

    @property
    def source_name(self) -> str:
        return "data.gov.in"

    async def fetch_schemes(self) -> List[Dict[str, Any]]:
        return await self.delegate.fetch_schemes()
