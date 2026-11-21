# V.A.D. marketplace release readiness

**Status: NOT READY FOR PUBLIC RELEASE.** This is a development integration.

## Distribution architecture

- HACS custom integration directory: `custom_components/vad/`.
- Home Assistant config flow: local, single instance, no credentials.
- Admin-only sidebar iframe panel: serves packaged frontend at `/vad_static/index.html`.
- The editor has no API to read, edit or publish Home Assistant automations. Users import local files.
- YAML browser parsing currently loads js-yaml 4.1.0 from a third-party CDN. This dependency must be vendored locally and its license retained before release.

## Required gates

1. Run Node and Python unit tests in GitHub Actions; collect **passing** receipts.
2. Run `python tools/sync_frontend.py` and `python tools/release_gate.py`. Release gate must pass without exclusions.
3. Test config flow, sidebar, asset serving, and unload on a clean supported HAOS instance.
4. Verify YAML import, malformed input rejection, branch rendering and no-write behaviour in a real browser.
5. Verify no external requests, no credentials in browser storage, no HA automation modification.
6. Test upgrade/restart/uninstall; check HA logs for warnings and deprecations.
7. Implement native publishing only with an explicit reviewed diff, optimistic source version checks, backup, HA validation, rollback and tests. Until then, do not advertise native publishing.
8. Create a tagged release and document HACS custom repository installation after passing the above.

## Threat and compatibility notes

Static asset URLs are not sensitive, but the iframe must be restricted to admins. Importing an automation file may reveal sensitive entity names in the user's browser; files must not be uploaded to third parties. CDN parser loading currently violates the offline/no-third-party objective. Native HA preview is a limited, fail-closed approximation; it does not prove execution equivalence.

## Version policy

Do not tag v1.0 or claim marketplace readiness until integration testing and security review are complete. Use pre-release tags for opt-in testing.
