# Standalone visual canvas prototype

Open `index.html` in a modern browser. No build step, server, Home Assistant token, or network access required.

Implemented: draggable nodes, input/output port wiring, editable labels, deletion, undo/redo, structural validation, JSON draft import/export.

Not implemented: native Home Assistant import/export, automation semantics, simulation, recommendation engine, HACS sidebar registration, production publishing. The Simulate button explicitly reports this limitation.

All flows are drafts; the prototype cannot write to Home Assistant.
