"""UI configuration flow for V.A.D. (read-only development release)."""
from homeassistant import config_entries
from .const import DOMAIN

class VADConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Create one local V.A.D. configuration entry."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """No credentials, no remote connections, no automation writes."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        return self.async_create_entry(title="V.A.D. Visual Automation Editor", data={})
