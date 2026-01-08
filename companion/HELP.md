## Win-control: Module Overview

Here is the concise, structured English documentation for your module:

🚀 Win-control: Module Overview
This module provides full remote control over your PC through the network. Below is a breakdown of all available features:

🔌 Power & System Control
Shutdown: Remotely power off the PC.

Restart: Quickly reboot the system.

Force Mode: Force power actions (ignores unsaved data warnings) for reliable automation.

📂 App & Process Management
Start App: Launch any software via its file path with optional arguments.

Close Window: Gently close the active window of a specific program.

Kill Process: Force-stop any process by its .exe name (useful for frozen apps).

Window States: Minimize, Maximize, Restore, or Focus (bring to front) any application.

🖱 Mouse & Keyboard Emulation
Clicks: Perform Left Click, Double Click, or Right Click.

Movement: Instantly move the cursor to specific X / Y coordinates.

Type Text: Input text directly into active fields (supports Unicode/Multilingual characters).

Hotkeys: Trigger system keys or complex keyboard combinations.

Volume: Adjust system volume or toggle Mute instantly.

📊 Live Telemetry (Companion Variables)
System Status: Real-time monitoring of CPU and RAM usage.

Cursor Tracking: Get the current position of the mouse.

Process Watcher: Check if a specific program is currently running.

📋 Ready-to-Use Button Tags
Copy and paste these into the Button Text field in Companion:

PC Status: $(admin:pc1_name)\nCPU:$(admin:pc1_cpu)%\nRAM:$(admin:pc1_ram)%

Mouse Position: X:$(admin:pc1_mouse_x)\nY:$(admin:pc1_mouse_y)
