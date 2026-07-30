import asyncio
import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.core.database import AsyncSessionLocal
from app.services.scheme_importer import scheme_importer_service


async def main():
    print("==========================================")
    print("  FinancialOS Government Scheme Sync CLI  ")
    print("==========================================")
    print("Starting scheme sync pipeline across adapters...\n")

    async with AsyncSessionLocal() as db:
        report = await scheme_importer_service.sync_all_sources(db)

    print("\n--- SYNC REPORT SUMMARY ---")
    print(f"New Schemes Added : {report['new_count']}")
    print(f"Schemes Updated   : {report['updated_count']}")
    print(f"Schemes Inactive  : {report['inactive_count']}")
    print(f"Failed Records    : {report['failed_count']}")
    print(f"Overall Status    : {report['status']}")
    print("----------------------------")
    print("Completed Successfully!")


if __name__ == "__main__":
    asyncio.run(main())
