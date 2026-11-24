"""Isolated integration lifecycle tests using real Home Assistant fixtures."""
import pytest
from homeassistant import config_entries
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

@pytest.mark.asyncio
async def test_panel_lifecycle(hass, enable_custom_integrations):
    assert await async_setup_component(hass, "frontend", {})
    entry = MockConfigEntry(domain="vad", title="V.A.D.", data={}, unique_id="vad")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is config_entries.ConfigEntryState.LOADED
    assert hass.data["vad"]["assets_registered"]
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is config_entries.ConfigEntryState.LOADED
