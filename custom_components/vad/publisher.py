"""Guarded publishing transaction. No production adapter is provided."""
import hashlib
import json
import asyncio

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()

class PublishError(RuntimeError):
    pass

class Publisher:
    def __init__(self, adapter):
        self.adapter = adapter
        self.lock = asyncio.Lock()

    async def publish(self, automation_id, candidate, expected, approved_digest):
        if not isinstance(automation_id, str) or not automation_id or not isinstance(candidate, dict):
            raise PublishError("Invalid candidate")
        candidate = json.loads(json.dumps(candidate, allow_nan=False))
        if candidate.get("id") != automation_id:
            raise PublishError("Candidate identity mismatch")
        if approved_digest != digest(candidate):
            raise PublishError("Candidate not approved")
        async with self.lock:
            original = await self.adapter.read(automation_id)
            if digest(original) != expected:
                raise PublishError("Source changed since review")
            if not await self.adapter.validate(candidate):
                raise PublishError("Native validation failed")
            backup = await self.adapter.backup(automation_id, original)
            if not backup:
                raise PublishError("Backup failed")
            # Adapter must implement atomic compare-and-swap, not a blind write.
            if not await self.adapter.compare_and_swap(automation_id, expected, candidate):
                raise PublishError("Concurrent source change")
            try:
                await self.adapter.reload()
                if digest(await self.adapter.read(automation_id)) != approved_digest:
                    raise PublishError("Verification failed")
            except Exception as exc:
                if not await self.adapter.compare_and_swap(automation_id, approved_digest, original):
                    raise PublishError("Rollback conflict; manual recovery required") from exc
                await self.adapter.reload()
                if digest(await self.adapter.read(automation_id)) != expected:
                    raise PublishError("Rollback verification failed") from exc
                raise PublishError("Publish failed; original restored") from exc
            return {"status": "verified", "backup": backup}
