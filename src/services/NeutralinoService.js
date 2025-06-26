import { global } from '../config/global.js';
import Result from '../types/Result.js';

const neutralinoService = NeutralinoService();

export { neutralinoService };

function NeutralinoService() {
	return {
		setWindowTitle,
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


	// Janela

	function setWindowTitle() {
		const config = global.neutralino.config;
		const version = config.version;
		const title = config.modes.window.title;

		return Neutralino.window.setTitle(`${title} - ${version} ${global.appData.state.saved ? '' : '*'}`);
	}

	function setMenubar() {
		// const menubar = new nw.Menu({ type: 'menubar' });
		// const arquivo = new nw.Menu();

		// arquivo.append(new nw.MenuItem({ label: 'Novo', click: global.actions.newFile }));
		// arquivo.append(new nw.MenuItem({ label: 'Abrir', click: global.actions.openFile }));
		// arquivo.append(new nw.MenuItem({ label: 'Salvar', click: global.actions.saveFile }));
		// arquivo.append(new nw.MenuItem({ label: 'Salvar Como', click: global.actions.saveFileAs }));
		// arquivo.append(new nw.MenuItem({ type: 'separator' }));
		// arquivo.append(new nw.MenuItem({ label: 'Enviar por E-mail', click: global.actions.sendByEmail }));
		// arquivo.append(new nw.MenuItem({ type: 'separator' }));
		// arquivo.append(new nw.MenuItem({ label: 'Abrir Local do Arquivo', click: global.actions.openFileLocation }));
		// arquivo.append(new nw.MenuItem({ type: 'separator' }));
		// arquivo.append(new nw.MenuItem({ label: 'Sair', click: () => null }));

		// const exibir = new nw.Menu();

		// exibir.append(new nw.MenuItem({ label: 'Informações do Arquivo', click: global.actions.showFileInfo }));
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

	async function showFileDialog(options = { title, target, filters }) {
		// Abre uma janela de dialogo para selecionar um arquivo, diretório ou salvar como.

		const defaultOptions = {
			title: 'Abrir',
			target: 'open', // open | save | folder
			filters: [
				{ name: 'Survey', extensions: ['srv'] },
			],
		};
		const result = Result();
		let entries;

		options = { ...defaultOptions, ...options };

		if (options.target == 'open') {
			entries = await Neutralino.os.showOpenDialog(options.title, { filters: options.filters });
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

	function readFile(options = {}) {
		// Lê o conteúdo do arquivo e retorna como string.

		const result = Result();

		return fs.readFile(options.filePath, 'utf8').then(data => {
			result.data = data;
			return result;
		}).catch(err => {
			result.error = err;
			return result;
		});
	}

	async function writeFile (options = {}) {
		const writeResult = await Neutralino.filesystem.writeFile(options.filePath, options.data);
		const result = Result();

		if (!writeResult.success) {
			result.error = writeResult.message;
		}

		return result;
	}

	async function renameFile (options = {}) {
		const dir = options.filePath.substring(0, options.filePath.lastIndexOf('/'));
		const ext = options.filePath.substring(options.filePath.lastIndexOf('.'));
		const newPath = dir + options.name + ext;
		const moveResult = await Neutralino.filesystem.move(options.filePath, newPath);
		const result = Result();

		if (!moveResult.success) {
			result.error = moveResult.message;
		}

		return result;
	}

	async function copyFile(options = {}) {
		const copyResult = await Neutralino.filesystem.copy(options.fromFilePath, options.toFilePath);
		const result = Result();

		if (!copyResult.success) {
			result.error = copyResult.message;
		}

		return result;
	}

	async function openFile(options = {}) {
		const openResult = await Neutralino.os.open(options.filePath); // fullpath
		const result = Result();

		if (!openResult.success) {
			result.error = openResult.message;
		}

		return result;
	}

	async function clearFolder(options = {}) {
		// Remomve todos os arquivos da pasta.

		// Remove a pasta
		const removeResult = await Neutralino.filesystem.remove(options.folderPath);
		const result = Result();

		if (!removeResult.success) {
			result.error = removeResult.message;
		}

		// Recria a pasta
		const createResult = await Neutralino.filesystem.createDirectory(options.folderPath);

		if (!createResult.success) {
			result.error = createResult.message;
		}

		return result;
	}

	async function zipFile(options = {}) {
		const out = await Neutralino.os.execCommand(
			`powershell.exe Compress-Archive -Path ${options.fromFolderPath}/* -DestinationPath ${options.toFilePath} -Force`,
			{ background: false }
		);
		const result = Result();

		if (out.stdOut)
			result.data = JSON.parse(out.stdOut).Data;

		if (out.stdErr)
			result.error = stdErr;

		return result;
	}

	async function unzipFile(options = {}) {
		const out = await Neutralino.os.execCommand(
			`powershell.exe Expand-Archive -Path ${options.fromFilePath} -DestinationPath ${options.toFolderPath} -Force`,
			{ background: false }
		);
		const result = Result();

		if (out.stdOut)
			result.data = JSON.parse(out.stdOut).Data;

		if (out.stdErr)
			result.error = stdErr;

		return result;
	}

	// Dados

	function storage(key, value) {
		// get
		if (value == undefined) {
			return Neutralino.storage.getData(key).then(data => {
				if (!data.message) {
					if (data != '')
						return JSON.parse(data);

					return data;
				}
			}).catch(() => null);
		}

		// set
		else {
			if (typeof value != 'string')
				value = JSON.stringify(value);

			return Neutralino.storage.setData(key, value).then(() => true).catch(() => false);
		}
	}
}
