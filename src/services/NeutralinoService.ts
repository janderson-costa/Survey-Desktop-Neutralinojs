import { appData } from '../shared/appData';
import actions from '../shared/actions';
import { createResult } from '../models/Result';
import Modal from '../lib/Modal/Modal.js';

const neutralinoService = NeutralinoService();

export { neutralinoService };

function NeutralinoService() {
	return {
		setWindowTitle,
		setOnWindowClose,
		setMenubar,
		showFileDialog,
		readFile,
		writeFile,
		renameFile,
		copyFile,
		openFile,
		clearFolder,
		zipFile,
		unzipFile,
		storage,
	};
}


// Janela

async function setWindowTitle(options = { saved: null }) {
	const config = await Neutralino.app.getConfig();
	const name = config.name;
	const version = config.version;
	const saved = options.saved == true || appData.state.saved;

	return Neutralino.window.setTitle(`${name} - ${version} ${saved ? '' : '*'}`);
}

async function setOnWindowClose() {
	return Neutralino.events.on('windowClose', async () => {
		if (!appData.state.saved) {
			let result = await actions.saveFile(true); // true | false | 'error' | 'canceled'

			if (typeof result == 'boolean')
				await close();
		} else {
			await close();
		}
	});

	async function close() {
		// Fecha o arquivo temp.xls(x)
		const result = await actions.closeWorkbook();

		if (result.error) {
			Modal({
				title: 'Survey',
				content: `Não foi possível fechar o arquivo temp.xls(x)<br>${result.error}`,
				buttons: [
					{ name: 'OK', onClick: async modal => {
						modal.hide();
					}},
				],
			}).show();

			return;
		}

		// Limpa o cache
		await storage('appData', null);

		// Fecha a aplicação
		await Neutralino.app.exit();
	}
}

function setMenubar() {
	// const menubar = new nw.Menu({ type: 'menubar' });
	// const arquivo = new nw.Menu();

	// arquivo.append(new nw.MenuItem({ label: 'Novo', click: actions.newFile }));
	// arquivo.append(new nw.MenuItem({ label: 'Abrir', click: actions.openFile }));
	// arquivo.append(new nw.MenuItem({ label: 'Salvar', click: actions.saveFile }));
	// arquivo.append(new nw.MenuItem({ label: 'Salvar Como', click: actions.saveFileAs }));
	// arquivo.append(new nw.MenuItem({ type: 'separator' }));
	// arquivo.append(new nw.MenuItem({ label: 'Enviar por E-mail', click: actions.sendByEmail }));
	// arquivo.append(new nw.MenuItem({ type: 'separator' }));
	// arquivo.append(new nw.MenuItem({ label: 'Abrir Local do Arquivo', click: actions.openFileLocation }));
	// arquivo.append(new nw.MenuItem({ type: 'separator' }));
	// arquivo.append(new nw.MenuItem({ label: 'Sair', click: () => null }));

	// const exibir = new nw.Menu();

	// exibir.append(new nw.MenuItem({ label: 'Informações do Arquivo', click: actions.showFileInfo }));
	// exibir.append(new nw.MenuItem({ type: 'separator' }));
	// exibir.append(new nw.MenuItem({ label: 'Atualizar janela', click: nw.Window.get().reloadIgnoringCache }));

	// const ferramentas = new nw.Menu();

	// ferramentas.append(new nw.MenuItem({ label: 'Carregar Dados nas Planilhas' }));
	// ferramentas.append(new nw.MenuItem({ label: 'Limpar Dados das Planilhas' }));
	// ferramentas.append(new nw.MenuItem({ type: 'separator' }));
	// ferramentas.append(new nw.MenuItem({ label: 'Enviar por E-mail' }));
	// ferramentas.append(new nw.MenuItem({ type: 'separator' }));
	// ferramentas.append(new nw.MenuItem({ label: 'Visualizar no Dispositivo Móvel' }));

	// const ajuda = new nw.Menu();

	// ajuda.append(new nw.MenuItem({ label: 'Ajuda' }));
	// ajuda.append(new nw.MenuItem({ label: 'Sobre' }));

	// menubar.append(new nw.MenuItem({ label: 'Arquivo', submenu: arquivo }));
	// menubar.append(new nw.MenuItem({ label: 'Exibir', submenu: exibir }));
	// menubar.append(new nw.MenuItem({ label: 'Ferramentas', submenu: ferramentas }));
	// menubar.append(new nw.MenuItem({ label: 'Ajuda', submenu: ajuda }));

	// nw.Window.get().menu = menubar;
}

async function showFileDialog(options = { title: '', target: '', filters: [] }) {
	// Abre uma janela de dialogo para selecionar um arquivo, diretório ou salvar como.

	const defaultOptions = {
		title: 'Abrir',
		target: 'open', // open | save | folder
		filters: [
			{ name: 'Survey', extensions: ['srv'] },
		],
	};
	const result = createResult();
	let entries: any;

	options = { ...defaultOptions, ...options };

	if (options.target == 'open') {
		entries = await Neutralino.os.showOpenDialog(options.title, { filters: options.filters, multiSelections: false });
	} else if (options.target == 'save') {
		entries = await Neutralino.os.showSaveDialog(options.title, { filters: options.filters });
	} else if (options.target == 'folder') {
		entries = await Neutralino.os.showFolderDialog(options.title);
	}

	result.canceled = !entries.length;

	if (entries.length)
		result.data = entries;

	return result;
}


// Sistema de arquivos

async function readFile(options = { filePath: '' }) {
	// Lê o conteúdo do arquivo e retorna como string.

	const result = createResult();

	return Neutralino.filesystem.readFile(options.filePath)
		.then(data => result.data = data)
		.catch(error => result.error = error.message)
		.then(() => result);
}

async function writeFile(options = { filePath: '', data: '' }) {
	const result = createResult();

	return Neutralino.filesystem.writeFile(options.filePath, options.data)
		.then((data: any) => {
			if (!data.success)
				result.error = data.message;
		})
		.catch(error => {
			result.error = error.message;
		})
		.then(() => {
			return result;
		});
}

async function renameFile(options = { filePath: '', name: '' }) {
	const dir = options.filePath.substring(0, options.filePath.lastIndexOf('/'));
	const ext = options.filePath.substring(options.filePath.lastIndexOf('.'));
	const newPath = dir + options.name + ext;
	const result = createResult();

	return Neutralino.filesystem.move(options.filePath, newPath)
		.then((data: any) => {
			if (!data.success)
				result.error = data.message;
		})
		.catch(error => {
			result.error = error.message;
		})
		.then(() => {
			return result;
		});
}

async function copyFile(options = { fromFilePath: '', toFilePath: '' }) {
	const result = createResult();

	return Neutralino.filesystem.copy(options.fromFilePath, options.toFilePath)
		.then((data: any) => {
			if (!data.success)
				result.error = data.message;
		})
		.catch(error => {
			result.error = error.message;
		})
		.then(() => {
			return result;
		});
}

async function openFile(options = { filePath: '' }) {
	const result = createResult();

	return Neutralino.os.open(options.filePath) // fullpath
		.then((data: any) => {
			if (!data.success)
				result.error = data.message;
		})
		.catch(error => {
			result.error = error.message;
		})
		.then(() => {
			return result;
		});
}

async function clearFolder(options = { folderPath: '' }) {
	// Remomve todos os arquivos da pasta.

	const result = createResult();

	// Remove a pasta
	await Neutralino.filesystem.remove(options.folderPath)
		.then((data: any) => {
			if (!data.success)
				result.error = data.message;
		})
		.catch(error => {
			result.error = error.message;
		});

	// Recria a pasta
	await Neutralino.filesystem.createDirectory(options.folderPath)
		.then((data: any) => {
			if (!data.success)
				result.error = data.message;
		})
		.catch(error => {
			result.error = error.message;
		});

	return result;
}

async function zipFile(options = { fromFolderPath: '', toFilePath: '' }) {
	const result = createResult();

	return Neutralino.os.execCommand(
		`.\\dist\\tools\\7zip\\7za.exe a -tzip -sccUTF-8 "${options.toFilePath}" "${options.fromFolderPath}/*" -y`,
		{ background: false }
	).then(out => {
		if (out.stdErr)
			result.error = out.stdErr;
	})
	.catch(error => {
		result.error = error.message;
	})
	.then(() => {
		return result;
	});
}

async function unzipFile(options = { fromFilePath: '', toFolderPath: '' }) {
	const result = createResult();

	return Neutralino.os.execCommand(
		`.\\dist\\tools\\7zip\\7za.exe x -sccUTF-8 "${options.fromFilePath}" -o"${options.toFolderPath}" -y`, // -y: sobreescreve
		{ background: false }
	)
	.then(async (out: any) => {
		if (out.stdErr) {
			result.error = out.stdErr;
		} else {
			await Neutralino.os.execCommand(`cmd /c dir "${options.toFolderPath}" /b /a-d`)
				.then(out => {
					const files = out.stdOut.split(/\r?\n/).filter(Boolean);

					result.data = files;
				})
				.catch(error => {
					result.error = error.message;
				});
		}
	})
	.catch(error => {
		result.error = error.message;
	})
	.then(() => {
		return result;
	});
}


// Dados

async function storage(key: string, value?: any) {
	// get
	if (typeof value == 'undefined') {
		return Neutralino.storage.getData(key)
			.then((data: any) => {
				if (!data.message) {
					if (data != '')
						return JSON.parse(data);

					return data;
				}
			})
			.catch(() => null);
	}

	// set
	else {
		if (typeof value == 'object' && value != null)
			value = JSON.stringify(value);

		return Neutralino.storage.setData(key, value)
			.then(() => true)
			.catch(() => false);
	}
}
