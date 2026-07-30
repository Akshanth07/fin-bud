from abc import ABC, abstractmethod
from typing import Any, Dict, List


class BaseSchemeAdapter(ABC):
    """Abstract Base Class for all Government Scheme Data Source Adapters."""

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Returns the human-readable identifier of the data source."""
        pass

    @abstractmethod
    async def fetch_schemes(self) -> List[Dict[str, Any]]:
        """
        Fetches raw scheme objects from the underlying data source
        (REST API, JSON file, CSV, or dataset endpoint).
        """
        pass
