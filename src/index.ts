Neutralino.init();

import constants from './shared/constants';//
import actions from './shared/actions';
import { global, setGlobal } from './shared/global';
import { SrvConfig, SrvTable, createSrvConfig } from './models/SrvConfig';
import { html } from './lib/html/html.js';
import { DataTable } from './lib/DataTable/src/index.js';
import { Utils } from './lib/Utils/Utils.js';
import { neutralinoService } from './services/NeutralinoService.js';
import { srvService } from './services/SrvService.js';
import Menu from './lib/Menu/Menu.js';
import Modal from './lib/Modal/Modal.js';
import Toast from './lib/Toast/Toast.js';
import { Icon, renderIcons } from './components/Icon.js';
import Buttons from "./components/Buttons.js";

const _columns = {
	//id: { displayName: 'Id', hidden: true },
	name: { displayName: 'Nome do campo', minWidth: 150 },
	description: { displayName: 'Descrição', minWidth: 150 },
	//subtype: { displayName: 'Subtipo', hidden: true },
	value: { displayName: 'Valor' },
	//objects: { displayName: 'Objetos', hidden: true },
	type: { displayName: 'Tipo', width: 150 },
	required: { displayName: 'Obrigatório', width: 90 },
	readonly: { displayName: 'Editável', minWidth: 90 },
};
let _ui = {
	layout: null,
	toolbarActionsLeft: null,
	toolbarActionsRight: null,
	toolbarTable: null,
	tables: null,
	tabs: null,
	itemsTotal: null,
};
let _globalProxy: any;
let _sheets = [];
let _dataTables = [];
let _activeDataTable;
let _observeDataChanges;

actions.saveFile = saveFile;
actions.closeWorkbook = srvService.closeWorkbook;
neutralinoService.setWindowTitle();
neutralinoService.setMenubar();
neutralinoService.setOnWindowClose();
start();
//observeSheets();

async function start() {
	const globalStored = await neutralinoService.storage('global');

	// Atualiza global
	if (globalStored && !_globalProxy)
		setGlobal(globalStored);

	global.appData.srvConfig = global.appData.srvConfig || createSrvConfig();
	_dataTables = [];

	// Observa alterações em global
	_observeDataChanges = false;

	_globalProxy = Utils().observe(global, {
		onChange: async () => {
			if (!_observeDataChanges) return;

			global.appData.state.saved = false;
			neutralinoService.setWindowTitle();
			neutralinoService.storage('global', global);
		},
	});

	// Cria a interface do usuário
	const result = await srvService.getSheets();

	if (result.data)
		_sheets = result.data;

	_ui = createUI();

	// Carrega a página
	document.body.innerHTML = '';
	document.body.appendChild(_ui.layout);
	loadTables();
	selectTable();
	window['lucide'].createIcons();
	_observeDataChanges = true;
}


// ACÕES

async function newFile() {
	const state = _globalProxy.appData.state;

	// Salva o arquivo atual
	if (state.opened && !state.saved) {
		const saved = await saveFile(!state.saved);

		if (saved == true)
			newFile();

		return;
	}

	// Fecha o arquivo atual
	let result = await srvService.closeWorkbook();

	if (result.error) {
		Toast({ message: `Não foi possível fechar o arquivo temp.xls(x)<br>${result.error}` }).show();
		return;
	}

	// Cria o novo arquivo
	result = await srvService.newFile({
		minimizeWindow: () => Neutralino.window.minimize(),
	});

	await Neutralino.window.unminimize();

	if (result.canceled) return;
	if (result.error) {
		Toast({ message: `Falha ao criar o arquivo.<br>${result.error}` }).show();
		return;
	}

	global.appData.srvConfig = result.data;
	start();
}

async function openFile() {
	const state = _globalProxy.appData.state;

	// Salva o arquivo atual
	if (state.opened && !state.saved) {
		const saved = await saveFile(true);

		if (saved == true)
			newFile();

		return;
	}

	let result = await neutralinoService.showFileDialog({
		target: 'open',
		title: 'Abrir',
		filters: [{ name: 'Survey', extensions: ['srv'] }],
	});

	if (result.canceled) {
		return result;
	}

	const filePath = result.data[0];

	// Fecha o arquivo atual
	result = await srvService.closeWorkbook();

	if (result.error) {
		Toast({ message: `Não foi possível fechar o arquivo temp.xls(x)<br>${result.error}` }).show();
		return;
	}

	await Neutralino.window.minimize();

	// Abre o arquivo
	result = await srvService.openFile(filePath);

	await Neutralino.window.unminimize();

	if (result.error) {
		Toast({ message: `Falha ao abrir o arquivo.<br>${result.error}` }).show();
		return;
	}

	global.appData.srvConfig = result.data;
	global.appData.state.opened = true;
	global.appData.state.saved = true;
	start();
}

async function saveFile(confirm = false) {
	// Retorna true | false | 'error' | 'canceled'

	const srvFileName = _globalProxy.appData.srvFileName;

	// Confirmar se deseja salvar as alterações
	if (confirm) {
		return new Promise(async resolve => {
			Modal({
				title: 'Survey',
				content: `Deseja salvar as alterações em ${srvFileName}?`,
				hideOut: false,
				buttons: [
					{ name: 'Savar', primary: true, onClick: async modal => {
						modal.hide();

						const result = await save();

						resolve(result);
					}},
					{ name: 'Não salvar', onClick: modal => {
						modal.hide();
						resolve(false);
					}},
					{ name: 'Cancelar', onClick: modal => {
						modal.hide();
						resolve('canceled');
					}},
				],
			}).show();
		});
	} else {
		return save();
	}

	async function save() {
		let result = await srvService.saveFile(global.appData.srvConfig);

		if (result.error) {
			Modal({
				title: 'Survey',
				content: `Falha ao salvar ${srvFileName}<br>${result.error}`,
				buttons: [{ name: 'OK', onClick: modal => modal.hide() }],
			}).show();

			return 'error';
		}

		_globalProxy.appData.state.saved = true;

		return true;
	}
}

function showFileInfo() {
	const modal = Modal({
		title: 'Informações do arquivo',
		content: 'Informações do arquivo.',
		width: 360,
		hideOut: true,
		buttons: [
			{ name: 'OK', primary: true, onClick: () => modal.hide()},
		],
	});

	modal.show();
}


// UI

function createUI() {
	const srvConfig: SrvConfig = _globalProxy.appData.srvConfig;
	const _menu = Menu({ items: [] });

	const _toolbarActionsLeft = [
		{ title: 'Novo', icon: Icon('new'), onClick: () => newFile() },
		{ title: 'Abrir', icon: Icon('open'), onClick: () => openFile() },
		{ title: 'Salvar', icon: Icon('save'), onClick: () => saveFile() },
		{ title: 'Informações do arquivo', icon: Icon('info'), onClick: () => showFileInfo() },
		{ divider: true, hidden: false },
		{ title: 'Carregar dados nas planilhas', icon: Icon('load'), onClick: () => console.log('onClick') },
		{ title: 'Limpar dados das planilhas', icon: Icon('clear'), onClick: () => console.log('onClick') },
		{ title: 'Enviar por E-mail', icon: Icon('send'), onClick: () => console.log('onClick') },
	];
	const _toolbarActionsRight = [
		{ title: 'Visualizar no dispositivo móvel', icon: Icon('smartphone'), onClick: () => console.log('onClick') }
	];
	const _toolbarTable = [
		{ divider: true, hidden: false },
		{ title: 'Adicionar grupo', icon: Icon('addGroup'), onClick: () => console.log('onClick') },
		{ title: 'Adicionar item', icon: Icon('add'), onClick: () => console.log('onClick') },
		{ title: 'Mover item selecionado para cima', icon: Icon('arrowUp'), onClick: () => console.log('onClick') },
		{ title: 'Mover item selecionado para baixo', icon: Icon('arrowDown'), onClick: () => console.log('onClick') },
		{ title: 'Excluir item selecionado', icon: Icon('close'), onClick: () => console.log('onClick') },
	];

	const $toolbarActionsLeft = html`<div>${() => {
		_toolbarActionsLeft.forEach((control, index) => {
			if (!_globalProxy.appData.state.opened && index > 1)
				control.hidden = true;
		});

		return Buttons(_toolbarActionsLeft);
	}}</div>`;

	const $toolbarActionsRight = Buttons(_toolbarActionsRight);

	const $tabs = html`
		<div class="tabs flex gap-2">${() =>
			srvConfig.data.tables.filter(x => x.enabled).map((srvTable, index) => {
				const $tab = html`
					<button type="button" class="tab button h-10 px-3 whitespace-nowrap" id="${srvTable.id}" @onClick="${() => selectTable(srvTable)}">
						<span>${srvTable.name}</span>
					</button>
				`;

				if (_activeDataTable) {
					if (_activeDataTable.id == srvTable.id)
						$tab.classList.add('active');
				} else if (index == 0) {
					$tab.classList.add('active');
				}

				return $tab;
			})
		}</div>
	`;

	const $buttonAddTable = html`
		<button type="button" class="button add-sheet min-w-10 h-10" title="Adicionar planilha" @onClick="${async e => {
			e.event.stopPropagation();

			if (!_sheets.length) return;

			_menu.options.items = _sheets.map((sheet, index) => {
				const srvTable = srvConfig.data.tables.find(x => x.id == sheet.Id);

				if (srvTable) {
					return ({
						icon: srvTable.enabled ? Icon('check') : '',
						name: sheet.Name,
						onClick: () => addTable(srvTable, index),
					});
				}
			});
			_menu.show({
				trigger: e.element.closest('button'),
				position: 'bottom left',
			});

			renderIcons();
		}}">${Icon('gridPlus')}</button>
	`;

	const $toolbarTable = html`<div>${() => {
		_toolbarTable.forEach((control, index) => {
			if (index > 2) {
				control.hidden = true;

				if (_activeDataTable && _activeDataTable.rows.some(x => x.isSelected)) {
					control.hidden = false;
				}
			}
		});

		return Buttons(_toolbarTable);
	}}</div>`;

	const $tables = srvConfig.data.tables.map(table => {
		const dt = createDataTable(table);

		_dataTables.push(dt);

		return dt.element;
	});

	const $itemsTotal = html`<span class="flex items-center h-10">${() => {
		let total: number = 0;

		$tabs.querySelectorAll('.tab').forEach(($tab, index) => {
			if ($tab.classList.contains('active')) {
				const dt = _dataTables[index];

				total = dt.rows.length;
			}
		});

		return total ? `${total} item(s)` : '';
	}}</span>`;

	const $layout = html`
		<div class="layout flex h-screen">
			<div class="flex flex-col justify-between w-screen h-screen">
				<div>
					<!-- toolbar-actions -->
					<div class="toolbar-actions flex justify-between gap-4 px-4 py-4">
						<div class="left">${$toolbarActionsLeft}</div>
						<div class="right" @show="${_globalProxy.appData.state.opened}">${$toolbarActionsRight}</div>
					</div>

					<!-- toolbar-table -->
					<div class="toolbar-table flex gap-2 px-4 pb-4" @show="${_globalProxy.appData.state.opened}">
						<div class="flex gap-2 w-max-[600px] overflow-x-auto">${$tabs}</div>
						${$buttonAddTable}
						${$toolbarTable}
					</div>
				</div>

				<!-- tables -->
				<div class="tables flex-1 overflow-auto px-4">${$tables}</div>

				<!-- footer -->
				<div class="footer flex gap-4 px-4 py-4">${$itemsTotal}</div>
			</div>

			<!-- app viewer -->
			<div></div>
		</div>
	`;

	_ui = {
		layout: $layout,
		toolbarActionsLeft: $toolbarActionsLeft,
		toolbarActionsRight: $toolbarActionsRight,
		toolbarTable: $toolbarTable,
		itemsTotal: $itemsTotal,
		tabs: $tabs,
		tables: $layout.querySelector('.tables'),
	};

	return _ui;
}


// DATATABLES

function createDataTable(srvTable: SrvTable) {
	return DataTable({
		id: srvTable.id,
		data: [],
		place: null,
		checkbox: false,
		sort: false,
		resize: true,
		//width: 'fit-content',
		height: '100%',
		columns: _columns,
		borders: {
			table: {
				all: true,
				// top: false,
				// bottom: false,
				radius: 6,
			},
			rows: true,
			cells: true,
		},
		footer: {
			hidden: true,
		},
		rows: {
			selectOnClick: true,
		},
		cells: {
			name: {
				display: ({ row, item, value }) => {
					return html`
						<input type="text" value="${value}" @onChange="${e => {
							item.name = e.element.value.trim();
						}}"/>
					`;
				}
			},
			description: {
				display: ({ row, item, value }) => {
					const $field = html`
						<textarea rows="1" @onChange="${e => {
							item.description = e.element.value.trim();
						}}" @onInput="${e => {
							Utils().form().field().autoHeight(e.element);
						}}">${value}</textarea>
					`;

					Utils().form().field().autoHeight($field);

					return $field;
				}
			},
			type: {
				display: ({ row, item, value }) => {
					const $field = html`
						<select @onChange="${e => {
							item.type = e.element.value;
						}}">${constants.TABLE_ROW_FIELD_TYPES.map(type => /*html*/`
							<option value="${type.displayName}">${type.displayName}</option>
						`)}</select>
					`;

					$field['value'] = value;

					return $field;
				},
			},
			value: {
				display: ({ row, item, value }) => {
					if (item.type == 'Texto') {
						const $field = html`
							<textarea rows="1" @onChange="${e => {
								item.value = e.element.value;
							}}" @onInput="${e => {
								Utils().form().field().autoHeight(e.element);
							}}">${item.value}</textarea>
						`;

						Utils().form().field().autoHeight($field);

						return $field;
					} else if (item.type == 'Número') {
						return html`
							<input type="number" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'E-mail') {
						return html`
							<input type="email" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Data') {
						return html`
							<input type="date" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Data/Hora') {
						return html`
							<input type="datetime-local" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Horário') {
						return html`
							<input type="time" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Opção') {
						const $field = html`
							<select @onChange="${e => {
								item.value = e.element.value;
							}}">${constants.TABLE_ROW_FIELD_TYPES.map(type => /*html*/`
								<option value="${type.displayName}">${type.displayName}</option>
							`)}</select>
						`;

						$field['value'] = value;

						return $field;
					} else if (item.type == 'Opcão Múltipla') {
						//
					} else if (item.type == 'Imagem') {
						//
					} else if (item.type == 'Assinatura') {
						//
					}

					return html`
						<input type="text" value="${item.value}" @onChange="${e => {
							item.value = e.element.value;
						}}"/>
					`;
				},
			},
			required: {
				display: ({ row, item, value }) => {
					return html`
						<label class="flex items-center justify-center w-[80px] h-[32px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.required}" @onChange="${e => {
								item.required = e.element.checked;
							}}" class="scale-[1.1]"/>
						</label>
					`;
				},
			},
			readonly: {
				display: ({ row, item, value }) => {
					return html`
						<label class="flex items-center justify-center w-[56px] h-[32px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.readonly}" @onChange="${e => {
								item.readonly = e.element.checked;
							}}" class="scale-[1.1]"/>
						</label>
					`;
				},
			},
		},
		onSelectRows: ({ rows }) => {
			_ui.toolbarTable = _ui.toolbarTable.reload();
			renderIcons();
		},
		onUnselectRows: () => {
			_ui.toolbarTable = _ui.toolbarTable.reload();
			renderIcons();
		},
		onClickOut: ({ event }) => {
			// Cancela a chamada de onUnselectRows()
			return false;
		},
	});
}

function loadTables() {
	const srvConfig = _globalProxy.appData.srvConfig;

	srvConfig.data.tables.forEach((table, index) => {
		_dataTables[index].load(table.rows);
	});
}

function addTable(srvTable: SrvTable, index: number) {
	const srvConfig = _globalProxy.appData.srvConfig;
	const tablesCount = srvConfig.data.tables.filter(x => x.enabled).length;

	// Garante que pelo menos uma tabela esteja habilitada
	if (tablesCount == 1 && srvTable.enabled)
		return;

	srvTable.enabled = !srvTable.enabled;

	if (srvTable.enabled) {
		_activeDataTable = _dataTables[index];
	} else {
		// Índice do próximo selecionado que está habilitado
		const tables = srvConfig.data.tables;
		let _index = tables.findIndex(x => x.id == _activeDataTable.id);

		if (!tables[_index].enabled) {
			// Próximo a direita
			_index = tables.findIndex((x, i) => i > index && x.enabled);

			if (_index == -1) {
				// Próximo a esquerda
				_index = tables.reverse().findIndex((x, i) => i < index && x.enabled);
				tables.reverse();
			}
		}

		srvTable = tables[_index];
		_activeDataTable = _dataTables[_index];
	}

	_ui.tabs = _ui.tabs.reload();
	selectTable(srvTable);
}

function selectTable(srvTable?: SrvTable) {
	const srvConfig: SrvConfig = _globalProxy.appData.srvConfig;

	srvTable = srvTable || srvConfig.data.tables[0];
	_activeDataTable = _dataTables.find(dt => dt.id == srvTable.id);

	// Tab ativa
	_ui.tabs = _ui.tabs.reload();
	
	// Exibe a tabela especificada
	_dataTables.forEach((dt, _index)=> {
		dt.element.classList.add('!hidden');

		if (dt.id == srvTable.id)
			dt.element.classList.remove('!hidden');
	});

	// Recarrega a barra de botões da tabela
	_ui.toolbarTable = _ui.toolbarTable.reload();
	renderIcons();

	// Total
	_ui.itemsTotal = _ui.itemsTotal.reload();
}

async function observeSheets() {
	// Observa as planilhas no arquivo do Excel.

	return;

	await Utils().pause(1000);

	srvService.getSheets().then(async result => {
		if (result.data) {
			//_sheets = result.data;
			// result.data.find(sheet => {
			// 	if (!_sheets.find(x => x.Id == sheet.Id)) {
			// 		_sheets.push(sheet);
			// 		_globalProxy.appData.srvConfig.data.
			// 	}
			// });

			console.log(result.data);
			//observeSheets()
		}

		return

		// Arquivo temp.xls(x) fechado pelo usuário
		if (_globalProxy.appData.state.opened && !result.data) {
			Modal({
				title: 'Survey',
				content: 'Mantenha o arquivo temp.xls(x) aberto enquanto executa o aplicativo.',
				hideOut: false,
				buttons: [
					{ name: 'OK', onClick: async modal => {
						modal.hide();

						// Abre o arquivo novamente
						// await shared.actions.openFile({
						// 	filePath: constants.TEMP_FOLDER_PATH + '/' + _globalProxy.appData.tempFileName,
						// });

						await Utils().pause(5000);
						observeSheets();
					}},
				]
			}).show();

			return;
		}

		observeSheets();
	});
}
