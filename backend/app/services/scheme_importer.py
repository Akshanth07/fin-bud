import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scheme import GovernmentScheme, SchemeSyncLog
from app.services.importers.base_adapter import BaseSchemeAdapter
from app.services.importers.normalizer import SchemeNormalizer
from app.services.importers.validator import SchemeValidator
from app.services.importers.myscheme_adapter import MySchemeAdapter, DataGovAdapter
from app.services.importers.json_source_adapter import JSONSourceAdapter


class SchemeImporterService:
    """
    Main orchestrator for importing & synchronizing government schemes.
    Pipeline: Adapter -> Normalizer -> Validator -> Repository -> Database
    """

    def __init__(self, adapters: Optional[List[BaseSchemeAdapter]] = None):
        self.adapters = adapters or [
            MySchemeAdapter("seed_data/central_schemes.json"),
            DataGovAdapter("seed_data/state_schemes.json")
        ]

    async def sync_all_sources(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Executes sync pipeline across all configured adapters.
        Inserts new schemes, updates modified schemes (incrementing version),
        marks missing schemes as INACTIVE (never deletes), and logs sync execution.
        """
        overall_report = {
            "total_adapters": len(self.adapters),
            "new_count": 0,
            "updated_count": 0,
            "inactive_count": 0,
            "failed_count": 0,
            "status": "SUCCESS"
        }

        for adapter in self.adapters:
            source_name = adapter.source_name
            started_at = datetime.now(timezone.utc)

            # Create sync log record
            sync_log = SchemeSyncLog(
                id=uuid4(),
                source=source_name,
                started_at=started_at,
                sync_status="IN_PROGRESS"
            )
            db.add(sync_log)
            await db.flush()

            new_c, upd_c, inact_c, fail_c = 0, 0, 0, 0

            try:
                raw_schemes = await adapter.fetch_schemes()

                # Fetch all existing schemes in DB for this source (or all)
                result = await db.execute(select(GovernmentScheme))
                all_existing = result.scalars().all()
                existing_schemes_map = {s.scheme_code: s for s in all_existing if s.scheme_code}
                fetched_codes = set()

                for raw_obj in raw_schemes:
                    # 1. Normalize
                    norm_obj = SchemeNormalizer.normalize(raw_obj, default_source=source_name)

                    # 2. Validate
                    is_valid, error_msg = SchemeValidator.validate(norm_obj)
                    if not is_valid:
                        fail_c += 1
                        print(f"Validation failed for scheme {norm_obj.get('scheme_code')}: {error_msg}")
                        continue

                    code = norm_obj["scheme_code"]
                    fetched_codes.add(code)

                    now = datetime.now(timezone.utc)

                    if code in existing_schemes_map:
                        # Existing scheme: check if modified
                        existing = existing_schemes_map[code]
                        has_changes = (
                            existing.name != norm_obj["name"]
                            or existing.benefits != norm_obj["benefits"]
                            or existing.eligibility_rules != norm_obj["eligibility_rules"]
                            or existing.status != norm_obj["status"]
                        )

                        if has_changes:
                            existing.name = norm_obj["name"]
                            existing.scheme_name = norm_obj["name"]
                            existing.category = norm_obj["category"]
                            existing.description = norm_obj["description"]
                            existing.benefits = norm_obj["benefits"]
                            existing.eligibility_rules = norm_obj["eligibility_rules"]
                            existing.eligibility_summary = norm_obj["eligibility_summary"]
                            existing.official_url = norm_obj["official_url"]
                            existing.documents_required = norm_obj["documents_required"]
                            existing.application_process = norm_obj["application_process"]
                            existing.state = norm_obj["state"]
                            existing.ministry = norm_obj["ministry"]
                            existing.source = norm_obj["source"]
                            existing.version = existing.version + 1
                            existing.deadline = norm_obj["deadline"]
                            existing.status = norm_obj["status"]
                            existing.last_seen_at = now
                            existing.last_synced_at = now
                            upd_c += 1
                        else:
                            existing.last_seen_at = now
                            existing.last_synced_at = now
                    else:
                        # New scheme -> INSERT
                        new_scheme = GovernmentScheme(
                            id=uuid4(),
                            scheme_code=code,
                            name=norm_obj["name"],
                            scheme_name=norm_obj["name"],
                            category=norm_obj["category"],
                            description=norm_obj["description"],
                            benefits=norm_obj["benefits"],
                            eligibility_rules=norm_obj["eligibility_rules"],
                            eligibility_summary=norm_obj["eligibility_summary"],
                            official_url=norm_obj["official_url"],
                            documents_required=norm_obj["documents_required"],
                            application_process=norm_obj["application_process"],
                            state=norm_obj["state"],
                            ministry=norm_obj["ministry"],
                            source=norm_obj["source"],
                            version=1,
                            deadline=norm_obj["deadline"],
                            status=norm_obj["status"],
                            last_seen_at=now,
                            last_synced_at=now,
                        )
                        db.add(new_scheme)
                        new_c += 1

                # Mark schemes not present in current adapter fetch as INACTIVE (if matching source)
                for code, existing in existing_schemes_map.items():
                    if existing.source == source_name and code not in fetched_codes and existing.status == "ACTIVE":
                        existing.status = "INACTIVE"
                        existing.last_synced_at = datetime.now(timezone.utc)
                        inact_c += 1

                await db.commit()

                # Update sync log
                sync_log.completed_at = datetime.now(timezone.utc)
                sync_log.new_count = new_c
                sync_log.updated_count = upd_c
                sync_log.inactive_count = inact_c
                sync_log.failed_count = fail_c
                sync_log.sync_status = "SUCCESS"
                await db.commit()

            except Exception as e:
                await db.rollback()
                fail_c += 1
                try:
                    sync_log.completed_at = datetime.now(timezone.utc)
                    sync_log.failed_count = fail_c
                    sync_log.sync_status = "FAILED"
                    await db.commit()
                except Exception:
                    await db.rollback()
                print(f"Sync error for adapter {source_name}: {repr(e)}")

            overall_report["new_count"] += new_c
            overall_report["updated_count"] += upd_c
            overall_report["inactive_count"] += inact_c
            overall_report["failed_count"] += fail_c

        return overall_report


scheme_importer_service = SchemeImporterService()
