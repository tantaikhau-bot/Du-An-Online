# WISH WORLD V7.3 — Mobile Control

- Touch-first HUD automatically enabled on coarse pointers, or /play?mobile=1. Landscape fills browser viewport, portrait still has controls and rotate hint. Fullscreen and orientation lock are best-effort depending on browser; desktop controls unchanged.
- Analog joystick (12% deadzone, variable movement speed, sprint at high deflection), independent right-side drag camera, jump, context interaction, hold-to-run, auto-run toggle, quick map and inventory. Mobile menus expose existing social, quests, crafting, house, mount, photos, settings and account features. Legacy arrows retained in interiors.
- Per-orientation draggable HUD positions saved locally; reset layout, optional short vibration, safe-area offsets, pointer capture and release handling. Dialogs, blur and hidden tabs reset movement. Auto-run uses camera heading, not automatic pathfinding.
- Includes V7.1/V7.2 performance improvements. 15 inline scripts parsed and 1,685 synthetic analog/auto-run checks passed. No real-device touch, fullscreen, orientation, GPU or multiplayer runtime testing performed.
