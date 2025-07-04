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
		showFileDialog,
		createDirectory,
		readDirectory,
		readFile,
		writeFile,
		renameFile,
		remove,
		copyFolder,
		copyFile,
		openFile,
		clearFolder,
		zipFile,
		unzipFile,
		storage,
	};
}


// Janela

async function setWindowTitle(saved?: any) {
	const config = await Neutralino.app.getConfig();
	const name = config.name;
	const version = config.version;

	if (typeof saved == 'boolean') {
		appData.state.saved = saved;
	} else {
		saved = appData.state.saved;
	}

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

async function createDirectory(options = { path: '' }) {
	const result = createResult();

	return Neutralino.filesystem.createDirectory(options.path)
		.then(data => result.data = data)
		.catch(error => result.error = error.message)
		.then(() => result);
}

async function readDirectory(options = { path: '' }) {
	const result = createResult();

	return Neutralino.filesystem.readDirectory(options.path)
		.then(data => result.data = data)
		.catch(error => result.error = error.message)
		.then(() => result);
}

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

async function remove(options = { path: '' }) {
	const result = createResult();

	return Neutralino.filesystem.remove(options.path)
		.then(data => result.data = data)
		.catch(error => result.error = error.message)
		.then(() => result);
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

async function copyFolder(options = { fromFolderPath: '', toFolderPath: '' }) {
	const result = createResult();

	return Neutralino.filesystem.copy(options.fromFolderPath, options.toFolderPath)
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

	// return Neutralino.os.execCommand(
	// 	`.\\dist\\tools\\7zip\\7za.exe a -tzip -sccUTF-8 "${options.toFilePath}" "${options.fromFolderPath}/*" -y`,
	// 	{ background: false }
	// ).then(out => {
	// 	if (out.stdErr)
	// 		result.error = out.stdErr;
	// })
	// .catch(error => {
	// 	result.error = error.message;
	// })
	// .then(() => {
	// 	return result;
	// });
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
