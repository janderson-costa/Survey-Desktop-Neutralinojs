Neutralino.init();

import actions from './shared/actions';
import ui from './shared/ui';
import proxy from './shared/proxy';
import utils from './lib/Utils/Utils.js';
import { appData, setAppData } from './shared/appData';
import { createSrvConfig, createSrvTable, SrvTable } from './models/SrvConfig';
import { neutralinoService } from './services/NeutralinoService';
import { srvService } from './services/SrvService';
import Modal from './lib/Modal/Modal.js';
import Toast from './lib/Toast/Toast.js';
import { renderIcons } from './components/Icon';
import { dataTableService } from './services/DataTableService';
import constants from './shared/constants';

let _observeDataChanges: boolean;

actions.newFile = newFile;
actions.openFile = openFile;
actions.saveFile = saveFile;
actions.closeWorkbook = srvService.closeWorkbook;
actions.showFileInfo = showFileInfo;

neutralinoService.setWindowTitle();
neutralinoService.setOnWindowClose();
//neutralinoService.storage('appData', null); // ! *** Habilitar para produção ***

start();
observeSheets();

async function start() {
	constants.root_path = await Neutralino.filesystem.getAbsolutePath(NL_PATH);
	const appDataStored = await neutralinoService.storage('appData');

	// Atualiza appData
	if (appDataStored && !proxy.appData)
		setAppData(appDataStored);

	appData.srvConfig = appData.srvConfig || createSrvConfig();
	ui.dataTables = [];

	// Observa alterações em appData
	_observeDataChanges = false;

	proxy.appData = utils.observe(appData, {
		onChange: async (args: any) => {
			if (!_observeDataChanges) return;

			if (args.prop != 'saved')
				appData.state.saved = false;

			neutralinoService.setWindowTitle();
			neutralinoService.storage('appData', appData);
		},
	});

	// Renderiza a interface
	ui.create();
	document.body.innerHTML = '';
	document.body.appendChild(ui.layout);
	ui.selectTableTab();
	renderIcons();
	neutralinoService.storage('appData', appData);
	_observeDataChanges = true;
}


// ACÕES

async function newFile(confirmSave = true) {
	try {
		appData.state.creating = true;

		const state = appData.state;

		// Salva o arquivo atual
		if (confirmSave && !state.saved) {
			const saved = await saveFile(!state.saved);

			// Salvar | Não salvar
			if (typeof saved == 'boolean')
				newFile(false);

			return;
		}

		// Abre o seletor de arquivos
		let result = await neutralinoService.showFileDialog({
			target: 'open',
			title: 'Novo',
			filters: [
				{ name: 'Excel', extensions: ['xlsx', 'xls'] },
			],
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

		// Cria o novo arquivo
		result = await srvService.newSrv(filePath);

		await Neutralino.window.unminimize();

		if (result.error) {
			Toast({ message: `Falha ao criar o arquivo.<br>${result.error}` }).show();
			return;
		}

		appData.srvConfig = result.data;
		appData.state.opened = true;
		neutralinoService.setWindowTitle(false);
		start();
	} finally {
		appData.state.creating = false;
	}
}

async function openFile(confirmSave = true) {
	try {
		appData.state.opening = true;

		const state = appData.state;

		// Salva o arquivo atual
		if (confirmSave && !state.saved) {
			const saved = await saveFile(!state.saved);

			// Salvar | Não salvar
			if (typeof saved == 'boolean')
				openFile(false);

			return;
		}

		// Abre o seletor de arquivos
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
		result = await srvService.openSrv(filePath);

		await Neutralino.window.unminimize();

		if (result.error) {
			Toast({ message: `Falha ao abrir o arquivo.<br>${result.error}` }).show();
			return;
		}

		appData.srvConfig = result.data;
		appData.state.opened = true;
		appData.state.saved = true;
		neutralinoService.setWindowTitle(true);
		start();
	} finally {
		appData.state.opening = false;
	}
}

async function saveFile(confirm = false) {
	// Retorna true | false | 'error' | 'canceled'

	// Confirmar se deseja salvar as alterações
	if (confirm) {
		return new Promise(async resolve => {
			Modal({
				title: 'Survey',
				content: `Deseja salvar as alterações em ${appData.srvFileName}?`,
				hideOut: false,
				buttons: [
					{
						name: 'Savar', primary: true, onClick: async modal => {
							modal.hide();

							const result = await save();

							resolve(result);
						}
					},
					{
						name: 'Não salvar', onClick: modal => {
							modal.hide();
							resolve(false);
						}
					},
					{
						name: 'Cancelar', onClick: modal => {
							modal.hide();
							resolve('canceled');
						}
					},
				],
			}).show();
		});
	} else {
		return save();
	}

	async function save() {
		console.log(appData.srvFilePath);
		// Novo arquivo
		if (!appData.srvFilePath) {
			let result = await neutralinoService.showFileDialog({
				target: 'save',
				title: 'Novo',
				filters: [{ name: 'Survey', extensions: ['srv'] }],
			});

			if (result.canceled) {
				return 'canceled';
			}

			appData.srvFilePath = result.data;

			if (!appData.srvFilePath.toLowerCase().endsWith('.srv'))
				appData.srvFilePath += '.srv';

			appData.srvFileName = appData.srvFilePath.substring(appData.srvFilePath.lastIndexOf('/') + 1);
		}

		let result = await srvService.saveSrv(appData.srvConfig);

		if (result.error) {
			Modal({
				title: 'Survey',
				content: `Falha ao salvar ${appData.srvFileName}<br>${result.error.replaceAll('\n', '<br>')}`,
				buttons: [{ name: 'OK', onClick: modal => modal.hide() }],
			}).show();

			return 'error';
		}

		neutralinoService.setWindowTitle(true);

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
			{ name: 'OK', primary: true, onClick: () => modal.hide() },
		],
	});

	modal.show();
}

async function observeSheets() {
	// Observa as planilhas no arquivo do Excel e atualiza as tabelas.

	await utils.pause(1000);

	if (
		appData.state.creating ||
		appData.state.opening ||
		!appData.state.opened
	) {
		observeSheets();
		return;
	};

	const result = await srvService.getSheets();

	if (result.data) {
		if (
			JSON.stringify(appData.sheets.map(x => x.name)) ==
			JSON.stringify(result.data.map(x => x.name))
		) {
			observeSheets();
			return;
		}

		appData.sheets = result.data;

		const currentSrvTables: SrvTable[] = [];

		appData.sheets.forEach(sheet => {
			const srvTable = createSrvTable();

			srvTable.id = sheet.id;
			srvTable.name = sheet.name;
			srvTable.enabled = false;

			currentSrvTables.push(srvTable);
		});

		currentSrvTables.forEach((currentSrvTable, index) => {
			const srvTable = appData.srvConfig.data.tables.find(x => x.id == currentSrvTable.id);
			let add = true;

			if (srvTable) {
				// Tabela existente
				currentSrvTables[index] = srvTable;
				add = false;
			}

			if (add) {
				// Nova tabela
				const dt = dataTableService.createDataTable(currentSrvTable.id);

				dt.load(currentSrvTable.rows);
				ui.tables.appendChild(dt.element);
			}
		});

		// Remove tabelas que não existem mais
		appData.srvConfig.data.tables.forEach(srvTable => {
			if (!currentSrvTables.some(currentSrvTable => currentSrvTable.id == srvTable.id)) {
				dataTableService.removeDataTable(srvTable.id);

				if (ui.activeDataTable.id == srvTable.id) {
					ui.activeDataTable = null;
					ui.tables_buttons = ui.tables_buttons['reload']();
				}
			}
		});

		proxy.appData.srvConfig.data.tables = currentSrvTables;
		ui.tables_tabs = ui.tables_tabs['reload']();
	} else {
		// Arquivo temp.xls(x) fechado pelo usuário
		Modal({
			title: 'Survey',
			content: 'Mantenha o arquivo temp.xls(x) aberto enquanto executa o aplicativo.',
			hideOut: false,
			buttons: [
				{ name: 'OK', onClick: modal => modal.hide() },
			],
			onHide: async modal => {
				// Abre o arquivo novamente
				await neutralinoService.openFile({ filePath: `${constants.temp_folder_path}/${appData.excelFileName}` });

				await utils.pause(5000);
				observeSheets();
			}
		}).show();

		return;
	}

	observeSheets();
}
