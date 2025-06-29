Neutralino.init();

import actions from './shared/actions';
import ui from './shared/ui';
import utils from './lib/Utils/Utils.js';
import { appData, setAppData } from './shared/appData';
import { createSrvConfig } from './models/SrvConfig';
import { neutralinoService } from './services/NeutralinoService';
import { srvService } from './services/SrvService';
import Modal from './lib/Modal/Modal.js';
import Toast from './lib/Toast/Toast.js';
import { renderIcons } from './components/Icon';

let _observeDataChanges: boolean;

actions.newFile = newFile;
actions.openFile = openFile;
actions.saveFile = saveFile;
actions.closeWorkbook = srvService.closeWorkbook;
actions.showFileInfo = showFileInfo;

neutralinoService.setWindowTitle();
neutralinoService.setMenubar();
neutralinoService.setOnWindowClose();

start();
//observeSheets();

async function start() {
	const appDataStored = await neutralinoService.storage('appData');

	// Atualiza appData
	if (appDataStored && !appData.proxy)
		setAppData(appDataStored);

	appData.srvConfig = appData.srvConfig || createSrvConfig();
	appData.dataTables = [];

	// Observa alterações em appData
	_observeDataChanges = false;

	appData.proxy = utils.observe(appData, {
		onChange: async () => {
			if (!_observeDataChanges) return;

			appData.state.saved = false;
			neutralinoService.setWindowTitle();
			neutralinoService.storage('appData', appData);
		},
	});

	// Cria a interface do usuário
	const result = await srvService.getSheets();

	if (result.data)
		appData.sheets = result.data;

	ui.create();

	// Carrega a página
	document.body.innerHTML = '';
	document.body.appendChild(ui.layout);
	ui.loadTables();
	ui.selectTable();
	renderIcons();
	_observeDataChanges = true;
}


// ACÕES

async function newFile() {
	const state = appData.state;

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

	appData.srvConfig = result.data;
	start();
}

async function openFile() {
	const state = appData.state;

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

	appData.srvConfig = result.data;
	appData.state.opened = true;
	appData.state.saved = true;
	start();
}

async function saveFile(confirm = false) {
	// Retorna true | false | 'error' | 'canceled'

	const srvFileName = appData.srvFileName;

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
		let result = await srvService.saveFile(appData.srvConfig);

		if (result.error) {
			Modal({
				title: 'Survey',
				content: `Falha ao salvar ${srvFileName}<br>${result.error}`,
				buttons: [{ name: 'OK', onClick: modal => modal.hide() }],
			}).show();

			return 'error';
		}

		appData.proxy.state.saved = true;

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

async function observeSheets() {
	// Observa as planilhas no arquivo do Excel.

	return;

	await utils.pause(1000);

	srvService.getSheets().then(async result => {
		if (result.data) {
			//appData.sheets = result.data;
			// result.data.find(sheet => {
			// 	if (!appData.sheets.find(x => x.Id == sheet.Id)) {
			// 		appData.sheets.push(sheet);
			// 		_globalProxy.appData.srvConfig.data.
			// 	}
			// });

			console.log(result.data);
			//observeSheets()
		}

		return

		// Arquivo temp.xls(x) fechado pelo usuário
		if (appData.state.opened && !result.data) {
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

						await utils.pause(5000);
						observeSheets();
					}},
				]
			}).show();

			return;
		}

		observeSheets();
	});
}
