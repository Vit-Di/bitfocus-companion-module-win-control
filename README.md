# 📱 Windows Control Module for Bitfocus Companion

**[UA]** Клієнтський модуль для Bitfocus Companion, що дозволяє керувати Windows ПК.  
**[EN]** The client-side module for Bitfocus Companion to control Windows PCs.

---

## 🇺🇦 Опис (Українська)

Це репозиторій **Модуля** для системи Bitfocus Companion. Він дозволяє надсилати команди на віддалені комп'ютери (запуск програм, гарячі клавіші, керування живленням).

Для роботи цього модуля на цільових комп'ютерах має бути запущений Агент:  
👉 **[Завантажити Агента (Windows Agent)](https://github.com/Vit-Di/companion-agent-windows-control)**

### 🚀 Можливості
* **Мульти-контроль:** До 10 ПК одночасно.
* **Керування програмами:** Запуск, фокусування, закриття вікон.
* **Ввід:** Емуляція клавіатури та миші.
* **Зворотний зв'язок:** Відображення CPU/RAM у реальному часі.

### 🛠️ Інструкція зі встановлення

#### Крок 1: Встановлення Агента
Спочатку перейдіть за посиланням вище (на репозиторій Агента) та встановіть його на ваші Windows-комп'ютери.

#### Крок 2: Встановлення Модуля (Ви знаходитесь тут)
*(Виконуйте цей крок, якщо модуль ще не відображається у списку Companion)*

1.  Завантажте цей репозиторій (**Source code** або Release).
2.  Розпакуйте архів у будь-яку зручну папку (наприклад, `Documents\CompanionModules`).
3.  Відкрийте інтерфейс **Bitfocus Companion**.
4.  Натисніть на шестерню **Settings** (Налаштування) угорі праворуч.
5.  Перейдіть на вкладку **Developer Modules**.
6.  У рядку **"Base path for local developer modules"** натисніть кнопку папки 📂.
7.  Виберіть папку, куди ви розпакували цей модуль.
8.  Натисніть **Reload** або перезапустіть Companion. Модуль з'явиться у пошуку під назвою **"Windows Control Agent"**.

#### Крок 3: Налаштування
1.  Додайте модуль у Companion.
2.  Введіть **IP-адреси** ваших ПК, де вже запущено Агента.
3.  Порт за замовчуванням: `8001`.
4.  Збережіть. Статус має стати `OK`.


# 🚀 Детальний опис функцій (Detailed Features)

### 🇺🇦 Українська

#### 1. Керування Програмами (App Management)
Модуль використовує два розумні методи сканування:
* **Запуск програм (Launcher):** Агент сканує папку "Пуск" Windows і створює список усіх встановлених програм. Ви можете вибрати програму зі списку в Companion, щоб запустити її. Також підтримується запуск за вказаним вручну шляхом до `.exe`.
* **Керування вікнами (Window Control):** Агент сканує **запущені процеси** в реальному часі. Ви можете вибрати активний процес (наприклад, `obs64.exe`) і виконати дії:
    * `Focus` (Розгорнути/Вивести на передній план).
    * `Maximize` / `Minimize` / `Restore`.
    * `Close` (М'яке закриття).
    * `Kill` (Примусове завершення процесу).

#### 2. Емуляція Вводу (Input Simulation)
Дозволяє керувати ПК так, ніби ви сидите за ним:
* **Клавіатура:**
    * Натискання окремих клавіш (`F1`-`F12`, `Space`, `Enter` тощо).
    * Гарячі клавіші (Hotkeys): Наприклад, `Ctrl+S`, `Alt+F4`, `Ctrl+Shift+Z`.
    * **Друк тексту (Type Text):** Можливість надсилати цілі речення або команди (підтримується кирилиця та спецсимволи).
* **Миша:** Переміщення курсора в координати (X, Y), клік лівою/правою кнопкою, подвійний клік.

#### 3. Системні Інструменти (System & Utilities)
* **Живлення:** Вимкнення (Shutdown), Перезавантаження (Reboot), Сон (Sleep), Блокування (Lock), Вихід із системи (Log out).
* **Гучність:** Встановлення рівня гучності (0-100%), Mute/Unmute.
* **Утиліти:** Швидкий запуск Диспетчера завдань, Налаштувань, Провідника, Device Manager.
* **Скріншоти:** Збереження скріншоту всього екрану або виклик інструменту "Ножиці" (Snippet Tool).
* **Web:** Відкриття посилань у браузері за замовчуванням.

#### 4. Моніторинг та Фідбек (Feedback)
Companion отримує дані від ПК у реальному часі:
* **Змінні (Variables):** Ви можете вивести на кнопки ім'я ПК, завантаження CPU (%), використання RAM (%) та статус підключення.
* **Активність програм:** Якщо ви створили кнопку для певної програми (наприклад, vMix), вона **світитиметься зеленим**, коли ця програма запущена на віддаленому ПК.

---

## 🇺🇸 Description (English)

This is the **Module** repository for Bitfocus Companion. It serves as the interface to send commands (app launch, hotkeys, power control) to remote Windows PCs.

To use this, the Target PCs must be running the Agent software:  
👉 **[Get the Windows Agent here](https://github.com/Vit-Di/companion-agent-windows-control)**

### 🚀 Key Features
* **Multi-PC Control:** Up to 10 PCs simultaneously.
* **App Management:** Launch, Focus, Kill windows.
* **Input:** Keyboard and Mouse emulation.
* **Feedback:** Real-time CPU/RAM monitoring.

### 🛠️ Installation Guide

#### Step 1: Install the Agent
First, follow the link above to the Agent repository and set it up on your target Windows computers.

#### Step 2: Install the Module (You are here)
*(Perform this step if the module is not yet displayed in Companion)*

1.  Download this repository (**Source code** or Release).
2.  Extract it to any folder (e.g., `Documents\CompanionModules`).
3.  Open the **Bitfocus Companion** interface.
4.  Click on **Settings** (gear icon ⚙️) in the top right.
5.  Go to the **Developer Modules** tab.
6.  In the **"Base path for local developer modules"** field, click the folder icon 📂.
7.  Select the folder where you extracted this module.
8.  Click **Reload** (or restart Companion). Search for **"Windows Control Agent"** to add it.

#### Step 3: Configuration
1.  Add the module to your Companion surface.
2.  Enter the **IP Addresses** of your target PCs (where the Agent is running).
3.  Default Port: `8001`.
4.  Save. The status should turn **OK**.


# 🚀  Detailed Description of Functions
### 🇺🇸 English

#### 1. App & Window Management
The module employs two intelligent scanning methods:
* **App Launcher:** The Agent scans the Windows "Start Menu" to list all installed applications. You can select any app from the dropdown list in Companion to launch it. Manual `.exe` paths are also supported.
* **Window Control:** The Agent scans **running processes** in real-time. You can select an active process (e.g., `obs64.exe`) to perform actions:
    * `Focus` (Bring to front).
    * `Maximize` / `Minimize` / `Restore`.
    * `Close` (Soft close).
    * `Kill` (Force quit process).

#### 2. Input Simulation
Control the remote PC as if you were sitting in front of it:
* **Keyboard:**
    * Press single keys (`F1`-`F12`, `Space`, `Enter`, etc.).
    * Send Hotkeys (e.g., `Ctrl+S`, `Alt+F4`, `Ctrl+Shift+Z`).
    * **Type Text:** Send text strings or sentences (supports Unicode/Cyrillic characters).
* **Mouse:** Move cursor to specific (X, Y) coordinates, Left/Right Click, Double Click.

#### 3. System Utilities
* **Power:** Shutdown, Reboot, Sleep, Lock, Log out.
* **Audio:** Set system volume (0-100%), Mute/Unmute.
* **Tools:** Quick launch for Task Manager, Settings, File Explorer, Device Manager.
* **Screenshots:** Take a full-screen screenshot or open the Windows Snippet Tool.
* **Web:** Open URLs in the default browser.

#### 4. Live Feedback
Companion receives real-time telemetry from the target PCs:
* **Variables:** Display PC Name, CPU Usage (%), RAM Usage (%), and Connection Status directly on your buttons.
* **Process State:** If you map a button to a specific process (e.g., vMix), the button will **turn Green** automatically when that process is running on the remote machine.
