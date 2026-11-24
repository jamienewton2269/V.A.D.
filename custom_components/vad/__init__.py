"""V.A.D. — local, read-only visual automation inspector.

This integration only serves bundled static assets and an admin-only iframe
panel. It never reads/writes HA automation configuration or executes services.
"""
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

from .const import DOMAIN

PANEL_PATH = "vad"
ASSET_PATH = "/vad_static"
ASSET_DIR = Path(__file__).parent / "frontend"

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Allow config-entry setup."""
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register static assets and an admin-only panel, with no HA writes."""
    state = hass.data.setdefault(DOMAIN, {})
    if not state.get("assets_registered"):
        await hass.http.async_register_static_paths([
            StaticPathConfig(ASSET_PATH, str(ASSET_DIR), cache_headers=False)
        ])
        state["assets_registered"] = True
    frontend.async_register_built_in_panel(
        hass,
        component_name="iframe",
        sidebar_title="V.A.D.",
        sidebar_icon="mdi:source-branch",
        frontend_url_path=PANEL_PATH,
        config={"url": ASSET_PATH + "/index.html"},
        require_admin=True,
    )
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove panel when integration is unloaded."""
    frontend.async_remove_panel(hass, PANEL_PATH)
    return True
