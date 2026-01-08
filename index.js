import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import got from 'got'

class ChurchInstance extends InstanceBase {
	
	async init(config) {
		this.config = config
		this.pcStats = {}
		
		// ДВА РІЗНІ СПИСКИ
		this.processChoices = [{ id: 'obs64.exe', label: 'Waiting for scan...' }] // Для запущених (керування)
		this.appChoices = [{ id: 'manual', label: 'Waiting for scan...' }]     // Для встановлених (запуск)
		
		this.initVariables()
		this.initFeedbacks()
		this.initActions()
		
		this.startPolling()
		this.startProcessScan() // Запускає обидва сканери
	}

	async configUpdated(config) {
		this.config = config
		this.stopPolling()
		this.stopProcessScan()
		
		this.initVariables()
		this.initFeedbacks()
		this.initActions()
		
		this.startPolling()
		this.startProcessScan()
	}

	async destroy() {
		this.stopPolling()
		this.stopProcessScan()
	}

	// --- 1. ШВИДКЕ ОПИТУВАННЯ (1 сек) ---
	startPolling() {
		this.pollTimer = setInterval(async () => {
			for (let i = 1; i <= 10; i++) await this.checkPC(i)
		}, 1000)
	}
	stopPolling() { if (this.pollTimer) clearInterval(this.pollTimer) }

	// --- 2. СКАНЕРИ (РОЗДІЛЕНІ) ---
	startProcessScan() {
		// Запускаємо миттєво при старті
		this.scanRunningProcesses()
		this.scanInstalledApps()

		// Таймери
		this.scanTimerProc = setInterval(() => this.scanRunningProcesses(), 15000) // Процеси часто (15с)
		this.scanTimerApps = setInterval(() => this.scanInstalledApps(), 60000)    // Програми рідко (60с)
	}

	stopProcessScan() { 
		if (this.scanTimerProc) clearInterval(this.scanTimerProc)
		if (this.scanTimerApps) clearInterval(this.scanTimerApps)
	}

	// А) Скануємо ЗАПУЩЕНІ процеси (Для Universal Control і Feedback)
	async scanRunningProcesses() {
		let allProcs = new Set()
		for (let i = 1; i <= 10; i++) {
			const ip = this.config[`pc${i}_ip`]; const port = this.config[`pc${i}_port`]
			if (!ip) continue
			try {
				const res = await got.get(`http://${ip}:${port}/processes`, { timeout: { request: 2000 } })
				const data = JSON.parse(res.body)
				if (data.processes) data.processes.forEach(p => allProcs.add(p))
			} catch (e) {}
		}
		if (allProcs.size > 0) {
			const sortedProcs = Array.from(allProcs).sort()
			this.processChoices = sortedProcs.map(proc => ({ id: proc, label: proc }))
			this.processChoices.unshift({ id: 'manual', label: '-- TYPE MANUALLY --' })
			this.initActions() // Оновлюємо списки в діях
		}
	}

	// Б) Скануємо ВСТАНОВЛЕНІ програми (Тільки для запуску)
	async scanInstalledApps() {
		let allApps = new Map()
		for (let i = 1; i <= 10; i++) {
			const ip = this.config[`pc${i}_ip`]; const port = this.config[`pc${i}_port`]
			if (!ip) continue
			try {
				const res = await got.get(`http://${ip}:${port}/apps/list`, { timeout: { request: 5000 } })
				const data = JSON.parse(res.body)
				if (data.apps) {
					data.apps.forEach(app => {
						if (!allApps.has(app.path)) allApps.set(app.path, app.name)
					})
				}
			} catch (e) {}
		}
		if (allApps.size > 0) {
			const sortedApps = Array.from(allApps.entries()).sort((a, b) => a[1].localeCompare(b[1]))
			this.appChoices = sortedApps.map(([path, name]) => ({ id: path, label: name }))
			this.appChoices.unshift({ id: 'manual', label: '-- MANUAL PATH --' })
			this.initActions() // Оновлюємо списки в діях
		}
	}

	async checkPC(index) {
		const ip = this.config[`pc${index}_ip`]; const port = this.config[`pc${index}_port`]
		const cName = this.config[`pc${index}_name`] || `PC ${index}`
		if (!ip) return

		try {
			const res = await got.get(`http://${ip}:${port}/stats`, { timeout: { request: 800 } })
			const d = JSON.parse(res.body)
			
			this.pcStats[index] = { online: true, cpu: d.cpu, ram: d.ram, mouse_x: d.mouse_x, mouse_y: d.mouse_y }
			
			this.setVariableValues({ 
				[`pc${index}_name`]: cName, 
				[`pc${index}_cpu`]: d.cpu, 
				[`pc${index}_ram`]: d.ram,
				[`pc${index}_mouse_x`]: d.mouse_x || 0,
				[`pc${index}_mouse_y`]: d.mouse_y || 0
			})
			this.updateStatus(InstanceStatus.Ok)
		} catch (e) {
			this.pcStats[index] = { online: false, cpu: 0, ram: 0 }
			this.setVariableValues({ [`pc${index}_name`]: cName, [`pc${index}_cpu`]: 0, [`pc${index}_ram`]: 0, [`pc${index}_mouse_x`]: 0, [`pc${index}_mouse_y`]: 0 })
		}
		this.checkFeedbacks('status', 'cpu_alert', 'ram_alert', 'process_state')
	}

	initVariables() {
		const vars = []; for(let i=1; i<=10; i++) {
			vars.push(
				{name:`PC${i} Name`, variableId:`pc${i}_name`}, 
				{name:`PC${i} CPU`, variableId:`pc${i}_cpu`}, 
				{name:`PC${i} RAM`, variableId:`pc${i}_ram`},
				{name:`PC${i} Mouse X`, variableId:`pc${i}_mouse_x`},
				{name:`PC${i} Mouse Y`, variableId:`pc${i}_mouse_y`}
			)
		}
		this.setVariableDefinitions(vars)
	}

	initFeedbacks() {
		const pcs = []; for(let i=1; i<=10; i++) pcs.push({id:`pc${i}`, label:this.config[`pc${i}_name`]||`PC ${i}`})
		this.setFeedbackDefinitions({
			status: { type:'boolean', name:'System: Connection Status', defaultStyle:{bgcolor:0xff0000, color:0xffffff}, options:[{type:'dropdown',label:'PC',id:'pc',default:'pc1',choices:pcs}], callback:(fb)=>{const i=fb.options.pc.replace('pc',''); return this.pcStats[i]&&!this.pcStats[i].online} },
			cpu_alert: { type:'boolean', name:'Alert: High CPU', defaultStyle:{bgcolor:0xff8800, color:0x000000}, options:[{type:'dropdown',label:'PC',id:'pc',default:'pc1',choices:pcs}, {type:'number',label:'Limit %',id:'limit',default:90}], callback:(fb)=>{const i=fb.options.pc.replace('pc',''); const s=this.pcStats[i]; return s&&s.online&&s.cpu>fb.options.limit} },
			ram_alert: { type:'boolean', name:'Alert: High RAM', defaultStyle:{bgcolor:0x800080, color:0xffffff}, options:[{type:'dropdown',label:'PC',id:'pc',default:'pc1',choices:pcs}, {type:'number',label:'Limit %',id:'limit',default:90}], callback:(fb)=>{const i=fb.options.pc.replace('pc',''); const s=this.pcStats[i]; return s&&s.online&&s.ram>fb.options.limit} },
			process_state: { type:'advanced', name:'App: Is Running? (Green)', options:[{type:'dropdown',label:'PC',id:'pc',default:'pc1',choices:pcs}, {type:'textinput',label:'Process Name',id:'proc',default:'obs64.exe'}], callback:async(fb)=>{const i=fb.options.pc.replace('pc',''); const ip=this.config[`${fb.options.pc}_ip`]; const p=this.config[`${fb.options.pc}_port`]; if(!ip||!this.pcStats[i]?.online)return{}; try{const r=await got.get(`http://${ip}:${p}/stats?check_process=${fb.options.proc}`,{timeout:{request:500}}); if(JSON.parse(r.body).process_found)return{bgcolor:0x00ff00, color:0x000000}}catch(e){}; return{}} }
		})
	}

	getConfigFields() {
		const fields = [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'Make sure the Agent is running on the target PCs on port 8001.'
			}
		]

		for (let i = 1; i <= 10; i++) {
			fields.push(
				// 1. ЗАГОЛОВОК І ЛІНІЯ (Відділяє блоки візуально)
				{
					type: 'static-text',
					id: `sep_${i}`,
					width: 12,
					label: '',
					value: `<hr><h4>🖥️ PC ${i} Configuration</h4>`
				},
				// 2. НАЗВА (На весь рядок, щоб було гарно)
				{
					type: 'textinput',
					id: `pc${i}_name`,
					label: `Name (Friendly Name)`,
					width: 12,
					default: `PC ${i}`
				},
				// 3. IP АДРЕСА (Широке поле - 8/12)
				{
					type: 'textinput',
					id: `pc${i}_ip`,
					label: `IP Address`,
					width: 8,
					default: '',
					regex: this.REGEX_IP
				},
				// 4. ПОРТ (Вузьке поле поруч з IP - 4/12)
				{
					type: 'textinput',
					id: `pc${i}_port`,
					label: `Port`,
					width: 4,
					default: '8001',
					regex: this.REGEX_PORT
				}
			)
		}

		return fields
	}

	async send(pcId, ep, body) {
		const ip=this.config[`${pcId}_ip`]; const port=this.config[`${pcId}_port`]; if(!ip)return
		try{await got.post(`http://${ip}:${port}${ep}`,{json:body,timeout:{request:2000}})}catch(e){}
	}

	initActions() {
		const pcs = []; for(let i=1; i<=10; i++) pcs.push({id:`pc${i}`, label:this.config[`pc${i}_name`]||`PC ${i}`})

		// Переконайся, що тут використовується processChoices (старий список)
		const procListRunning = (this.processChoices && this.processChoices.length > 0) ? this.processChoices : [{ id: 'obs64.exe', label: 'Waiting for scan...' }]

		// А тут новий список для програм
		const appListInstalled = (this.appChoices && this.appChoices.length > 0) ? this.appChoices : [{ id: 'manual', label: 'Waiting for scan...' }]
		
		// Список популярних клавіш (Клавіатура)
		const keyList = [
			{id:'spc',label:'Space (Play/Pause)'}, {id:'enter',label:'Enter'}, {id:'esc',label:'Escape'},
			{id:'left',label:'Arrow Left'}, {id:'right',label:'Arrow Right'}, {id:'up',label:'Arrow Up'}, {id:'down',label:'Arrow Down'},
			{id:'f5',label:'F5 (Start Pres)'}, {id:'f11',label:'F11 (Fullscreen)'}, {id:'backspace',label:'Backspace'},
			{id:'tab',label:'Tab'}, {id:'home',label:'Home'}, {id:'end',label:'End'}, {id:'pageup',label:'Page Up'}, {id:'pagedown',label:'Page Down'},
			{id:'volume_mute',label:'Volume Mute'}, {id:'volume_up',label:'Volume Up'}, {id:'volume_down',label:'Volume Down'}
		]

		this.setActionDefinitions({
			// --- 1. КЛАВІАТУРА (З Hotkey та Typing) ---
			keyboard: {
				name: 'Keyboard: Keys & Typing',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					{type:'dropdown', label:'Mode', id:'mode', default:'press', choices:[
						{id:'press',label:'Single Key (Press)'}, 
						{id:'hotkey',label:'Hotkey Combo (e.g. ctrl+s)'},
						{id:'type',label:'Type Text (UKR/ENG support)'}
					]},
					
					// Вибір клавіші (тільки для режиму Press)
					{type:'dropdown', label:'Select Key', id:'key_std', default:'spc', choices:keyList, isVisible:(o)=>o.mode==='press'},
					
					// Поле для Hotkey або Тексту (для режимів Hotkey та Type)
					{type:'textinput', label:'Hotkey / Text', id:'key_custom', default:'', isVisible:(o)=>o.mode!=='press'}
				],
				callback: async(act) => {
					let val = act.options.mode === 'press' ? act.options.key_std : act.options.key_custom
					await this.send(act.options.pc, '/keyboard/action', {action:act.options.mode, text:val})
				}
			},

			// --- 2. УНІВЕРСАЛЬНИЙ КОНТРОЛЕР (Використовує ЗАПУЩЕНІ процеси) ---
			universal_control: {
				name: 'App: Universal Control (Window, Kill)',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					// ТУТ БЕРЕМО СПИСОК ПРОЦЕСІВ
					{type:'dropdown', label:'Select Process', id:'proc_menu', default: procListRunning[0].id, choices: procListRunning, allowCustom: true},
					{type:`textinput`, label:'Or Type Name (if Manual)', id:'proc_manual', isVisible: (opt) => opt.proc_menu === 'manual'},
					{type:'dropdown', label:'Action', id:'act', default:'focus', choices:[
						{id:'focus', label:'🔍 Focus Window'},
						{id:'maximize', label:'⬆️ Maximize Window'},
						{id:'minimize', label:'⬇️ Minimize Window'},
						{id:'restore', label:'🔄 Restore Window'},
						{id:'close_win', label:'❌ Close Window (Soft)'},
						{id:'kill', label:'💀 KILL PROCESS (Force)'}
					]}
				],
				callback: async(act) => {
					let target = act.options.proc_menu === 'manual' ? act.options.proc_manual : act.options.proc_menu
					await this.send(act.options.pc, '/universal/control', {path: target, action: act.options.act})
				}
			},

            // ... (інші дії) ...

			// --- 3.12 ЗАПУСК: ВАРІАНТ 2 (ЗІ СПИСКУ ВСТАНОВЛЕНИХ) ---
			app_start_list: {
				name: 'App: Start from Scanned List',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					// ТУТ БЕРЕМО СПИСОК ПРОГРАМ (Installed)
					{type:'dropdown', label:'Select App', id:'proc', default: appListInstalled[0].id, choices: appListInstalled, allowCustom: true}, 
					{type:'textinput', label:'Arguments', id:'args', default:''}
				],
				callback: async(act) => {
					await this.send(act.options.pc, '/apps/start', {path:act.options.proc, args:act.options.args})
				}
			},

			// --- НОВІ ОКРЕМІ БЛОКИ ---

			// 3.1. Ввід тексту (Окремий блок)
			text_input: {
				name: 'System: Type Text',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					{type:'textinput', label:'Text to Type', id:'text', default:''}
				],
				callback: async(act) => await this.send(act.options.pc, '/keyboard/action', {action:'type', text:act.options.text})
			},

			// 3.2. Згортання всіх вікон (Win+D)
			minimize_all: {
				name: 'System: Minimize All Windows ',
				options: [ {type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs} ],
				callback: async(act) => await this.send(act.options.pc, '/keyboard/action', {action:'hotkey', text:'lwin+d'})
			},

			// 3.3. Скрін екрану фул (PrintScreen)
			screenshot_full: {
				name: 'System: Screenshot (Full Screen)',
				options: [ {type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs} ],
				// lwin+printscreen зберігає файл у папку зображень, просто printscreen - у буфер
				callback: async(act) => await this.send(act.options.pc, '/keyboard/action', {action:'hotkey', text:'printscreen'})
			},

			// 3.4. Скрін екрану з вибором (Win+Shift+S)
			screenshot_area: {
				name: 'System: Screenshot Snippet ',
				options: [ {type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs} ],
				callback: async(act) => await this.send(act.options.pc, '/keyboard/action', {action:'hotkey', text:'lwin+shift+s'})
			},

			// 3.5. Перемикання віртуальних робочих столів
			virtual_desktop: {
				name: 'System: Switch Virtual Desktop',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					{type:'dropdown', label:'Direction', id:'dir', default:'right', choices:[{id:'left',label:'Previous (Left)'}, {id:'right',label:'Next (Right)'}]}
				],
				callback: async(act) => await this.send(act.options.pc, '/keyboard/action', {action:'hotkey', text:`ctrl+lwin+${act.options.dir}`})
			},

			// 3.6 - 3.9 Системні вікна (Task Manager, Device Manager, Settings, Explorer)
			system_window: {
				name: 'System: Open System Utility',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					{type:'dropdown', label:'Utility', id:'util', default:'explorer', choices:[
						{id:'taskmgr', label:'Task Manager (Ctrl+Shift+Esc)'},
						{id:'devmgr', label:'Device Manager (Command)'},
						{id:'settings', label:'Settings (Win+I)'},
						{id:'explorer', label:'File Explorer (Win+E)'}
					]}
				],
				callback: async(act) => {
					const util = act.options.util;
					if (util === 'taskmgr') await this.send(act.options.pc, '/keyboard/action', {action:'hotkey', text:'ctrl+shift+esc'});
					else if (util === 'settings') await this.send(act.options.pc, '/keyboard/action', {action:'hotkey', text:'lwin+i'});
					else if (util === 'explorer') await this.send(act.options.pc, '/keyboard/action', {action:'hotkey', text:'lwin+e'});
					else if (util === 'devmgr') await this.send(act.options.pc, '/apps/start', {path:'devmgmt.msc', args:''});
				}
			},

			// 3.10 Відкриття вебсайтів
			open_website: {
				name: 'App: Open Website',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					{type:'textinput', label:'URL', id:'url', default:'https://google.com'}
				],
				// Використовуємо команду start для відкриття дефолтного браузера
				callback: async(act) => await this.send(act.options.pc, '/apps/start', {path:'explorer', args:act.options.url})
			},

			

			// --- 3. МИШКА (КЛІК + РУХ + ЗАТРИМКА) ---
			mouse_click: {
				name: 'Mouse: Click at Coordinates',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					
					{type:'number', label:'X Coordinate', id:'x', default: 0, min: -10000, max: 10000},
					{type:'number', label:'Y Coordinate', id:'y', default: 0, min: -10000, max: 10000},
					{type:'number', label:'Delay (seconds)', id:'delay', default: 0.1, min: 0, max: 10, step: 0.1},
					
					{type:'dropdown', label:'Type', id:'type', default:'click', choices:[
						{id:'click', label:'Left Click'},
						{id:'dblclick', label:'Double Click'},
						{id:'rightclick', label:'Right Click'}
					]}
				],
				callback: async(act) => await this.send(act.options.pc, '/mouse/action', {x:act.options.x, y:act.options.y, action:act.options.type, delay:act.options.delay})
			},

			app_start: {
				name: 'App: Start',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					{type:'textinput', label:'Path', id:'path'},
					{type:'textinput', label:'Args', id:'args'}
				],
				callback: async(act) => await this.send(act.options.pc, '/apps/start', {path:act.options.path, args:act.options.args})
			},

			// --- 5. ЖИВЛЕННЯ (Оновлено) ---
			power: {
				name: 'System: Power Control',
				options: [
					{type:'dropdown', label:'PC', id:'pc', default:'pc1', choices:pcs},
					{type:'dropdown', label:'Action', id:'act', default:'lock', choices:[
						{id:'lock',label:'🔒 Lock PC'},
						{id:'sleep',label:'🌙 Sleep'},
						{id:'logout',label:'👋 Sign Out'},
						{id:'reboot',label:'🔄 Reboot'},
						{id:'shutdown',label:'🛑 Shutdown'}
					]},
					{type:'checkbox', label:'Force (for Reboot/Shutdown)', id:'force', default:false}
				],
				callback: async(act) => await this.send(act.options.pc, '/system/power', {action:act.options.act, force:act.options.force})
			}
		})
	}
}
runEntrypoint(ChurchInstance, [])