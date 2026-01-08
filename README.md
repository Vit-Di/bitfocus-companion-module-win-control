# companion-module-win-control

This module allows you to control up to **10 Windows PCs** over the local network using a custom Python Agent.

## ⚙️ Setup & Configuration

1.  **Install Agent:** Run `AdminAgent.exe` on the target Windows PC.
2.  **Dependencies:** Ensure `nircmd.exe` is in the same folder as the agent (required for volume, sleep, and window commands).
3.  **Firewall:** The agent listens on port **8001**. Ensure this port is open.
4.  **Companion:** Go to the module configuration and enter the **IP Addresses** of your target PCs.

## 🚀 Features

### App & Window Control
* **Start App:** Launch applications from a scanned list of installed software or by specifying a manual path (`.exe`).
* **Universal Control:** Focus, Minimize, Maximize, Restore, or Kill specific processes (e.g., `obs64.exe`).
* **Web:** Open URLs in the default browser.

### Input Simulation
* **Keyboard:**
    * Press single keys (e.g., `F5`, `Space`).
    * Send Hotkeys (e.g., `Ctrl+Shift+S`).
    * **Type Text:** Send text strings (supports Unicode/Cyrillic).
* **Mouse:** Move cursor to X/Y coordinates, Left/Right Click, Double Click.

### System Commands
* **Power:** Shutdown, Reboot, Sleep, Lock, Sign Out.
* **Utilities:** Open Task Manager, Device Manager, Settings, File Explorer.
* **Screenshots:** Take a full-screen screenshot or open the Snippet Tool.

### 📊 Feedback (Variables)
The module provides real-time feedback variables for each PC:
* `$(Admin:pc1_name)` - PC Name
* `$(Admin:pc1_cpu)` - CPU Usage (%)
* `$(Admin:pc1_ram)` - RAM Usage (%)
  
**Note:** Buttons mapped to specific processes will turn **Green** if that process is running on the target PC.
