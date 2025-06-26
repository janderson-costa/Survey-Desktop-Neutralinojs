import { global } from '../config/global.js';
import constants from '../config/constants.js';
import { neutralinoService } from './NeutralinoService.js';
import { SrvConfig, SrvTable, SrvTableRow, SrvInfo } from '../types/SrvConfig.js';
import Result from '../types/Result.js';

const srvService = SrvService();

export { srvService };

function SrvService() {
	return {
		newFile,
		openFile,
		getSheets,
		saveFile,
		saveWorkbook,
		closeWorkbook,
	};

	async function newFile(options = { minimizeWindow }) {
		let result = await neutralinoService.showFileDialog({
			title: 'Novo',
			filters: [
				{ name: 'Excel', extensions: ['xlsx', 'xls'] },
			],
		});

		if (result.canceled) {
			return result;
		}

		if (options.minimizeWindow)
			options.minimizeWindow();

		const filePath = result.data[0];
		const ext = filePath.substring(filePath.lastIndexOf('.'));
		const tempFileName = 'temp' + ext;

		// Limpa a pasta temp
		result = await neutralinoService.clearFolder({ folderPath: './temp' });

		if (result.error) {
			return result;
		}

		global.appData.tempFileName = tempFileName;

		// Copia o arquivo da planilha para pasta temp
		result = await neutralinoService.copyFile({
			fromFilePath: filePath,
			toFilePath: './temp/' + tempFileName,
		});

		if (result.error) {
			return result;
		}

		// Abre temp.xls(x) no Excel
		result = await neutralinoService.openFile({ filePath: `${constants.TEMP_FOLDER_PATH}/${tempFileName}` });

		if (result.error) {
			return result;
		}

		return new Promise(resolve => {
			// Aguarda o Excel abrir
			const interval = setInterval(async () => {
				result = await getSheets();

				const sheets = result.data || [];

				if (sheets.length) {
					clearInterval(interval);

					// Cria o arquivo config.json
					const srvConfig = SrvConfig();

					sheets.forEach((sheet, index) => {
						const table = SrvTable();

						table.id = sheet.Id; // ! Obs.: Id válido somente enquanto o arquivo do Excel estiver aberto
						table.name = sheet.Name;
						table.enabled = index == 0; // Habilita a primeira

						srvConfig.data.tables.push(table);
					});

					// Escreve o arquivo config.json
					result = await neutralinoService.writeFile({
						filePath: './temp/config.json',
						data: JSON.stringify(srvConfig),
					});

					if (result.error) {
						return result;
					}

					result.data = srvConfig;

					resolve(result);
				}
			}, 1000);
		});
	}

	async function openFile(options = { minimizeWindow }) {
		let result = await neutralinoService.showFileDialog({
			title: 'Abrir',
			filters: [
				{ name: 'Survey', extensions: ['srv'] },
			],
		});

		if (result.canceled) {
			return result;
		}

		if (options.minimizeWindow)
			options.minimizeWindow();

		let srvConfig = SrvConfig();
		const filePath = result.data[0];
		const fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

		global.appData.srvFilePath = filePath;
		global.appData.srvFileName = fileName;

		// Limpa a pasta temp
		result = await neutralinoService.clearFolder({ folderPath: './temp' });

		if (result.error) {
			return result;
		}

		// Extrai o conteúdo na pasta temp
		result = await neutralinoService.unzipFile({
			fromFilePath: filePath,
			toFolderPath: './temp',
		});

		if (result.error) {
			return result;
		}

		// Cria uma cópia da planilha com o nome padrão se necessário
		let tempFileName = result.data.find(x => x.startsWith('temp.xls')); // .xlsx | .xls

		if (!tempFileName) {
			const oldTempFileName = result.data.find(x => x.startsWith('spreadsheet')); // .xlsx | .xls
			const ext = oldTempFileName.substring(oldTempFileName.lastIndexOf('.'));

			tempFileName = 'temp' + ext;

			result = await neutralinoService.copyFile({
				fromFilePath: './temp/' + oldTempFileName,
				toFilePath: './temp/' + tempFileName,
			});

			if (result.error) {
				return result;
			}
		}

		global.appData.tempFileName = tempFileName;

		// Lê o arquivo config.json ou antigos: formdata.json, report.json e options.json
		const config = await neutralinoService.readFile({ filePath: './temp/config.json' });

		if (config.data) {
			srvConfig = JSON.parse(config.data);
		} else {
			const formdata = await neutralinoService.readFile({ filePath: './temp/formdata.json' });
			const report = await neutralinoService.readFile({ filePath: './temp/report.json' });

			if (formdata.data) {
				const data = JSON.parse(formdata.data);

				srvConfig.data = parseFormdata(data);
			}

			if (report.data) {
				const data = JSON.parse(report.data);

				srvConfig.info = parseReport(data);
			}

			result = await neutralinoService.writeFile({
				filePath: './temp/config.json',
				data: JSON.stringify(srvConfig),
			});

			if (result.error) {
				return result;
			}
		}

		// Abre spreadsheet.xls(x) no Excel
		neutralinoService.openFile({ filePath: `${constants.TEMP_FOLDER_PATH}/${tempFileName}` });

		return new Promise(resolve => {
			// Aguarda o Excel abrir
			const interval = setInterval(async () => {
				result = await getSheets();

				const sheets = result.data || [];

				if (sheets.length) {
					clearInterval(interval);

					sheets.forEach(sheet => {
						let isNewTable = true;

						// Atualizar o id da tabela
						srvConfig.data.tables.forEach(table => {
							if (sheet.Name == table.name) {
								table.id = sheet.Id; // ! Obs.: Id válido somente enquanto o arquivo do Excel estiver aberto
								isNewTable = false;
							}
						});

						// Para arquivos .srv de versões anteriores, adiciona o restante das planilhas como desabilitadas
						if (isNewTable) {
							const table = SrvTable();

							table.id = sheet.Id;
							table.name = sheet.Name;
							table.enabled = false;

							srvConfig.data.tables.push(table);
						}
					});

					result.data = srvConfig;

					resolve(result);
				}
			}, 1000);
		});
	}

	async function saveFile(srvConfig) {
		// Atualiza o arquivo config.json
		let result = await neutralinoService.writeFile({
			filePath: './temp/config.json',
			data: JSON.stringify(srvConfig),
		});

		if (result.error) {
			return result;
		}

		// Salva a planilha temp
		result = await saveWorkbook();

		let success = result.data;

		if (success) {
			// Empacota o arquivo .srv
			const srvFilePath = global.appData.srvFilePath;

			result = await neutralinoService.zipFile({
				fromFolderPath: './temp',
				toFilePath: srvFilePath,
			});
		}

		return result;
	}

	async function saveWorkbook() {
		// Salva o arquivo do Excel.

		const tempFileName = global.appData.tempFileName;
		const result = Result();

		if (!tempFileName)
			return result;

		const out = await Neutralino.os.execCommand(
			`${constants.EXCEL_API_PATH} workbookPath=${constants.TEMP_FOLDER_PATH}/${tempFileName} method=SaveWorkbook`,
			{ background: false }
		);

		if (out.stdOut)
			result.data = JSON.parse(out.stdOut).Data;

		if (out.stdErr)
			result.error = stdErr;

		return result;
	}

	async function getSheets() {
		// Retorna os nomes das planilhas disponíveis no arquivo do Excel.

		const tempFileName = global.appData.tempFileName;
		const result = Result();

		if (!tempFileName)
			return result;

		const out = await Neutralino.os.execCommand(
			`${constants.EXCEL_API_PATH} workbookPath=${constants.TEMP_FOLDER_PATH}/${tempFileName} method=GetSheets`,
			{ background: false }
		);

		if (out.stdOut)
			result.data = JSON.parse(out.stdOut).Data;

		if (out.stdErr)
			result.error = stdErr;

		return result;
	}

	async function closeWorkbook() {
		// Fecha o arquivo do Excel.

		const tempFileName = global.appData.tempFileName;
		const result = Result();

		if (!tempFileName)
			return result;

		const out = await Neutralino.os.execCommand(
			`${constants.EXCEL_API_PATH} workbookPath=${constants.TEMP_FOLDER_PATH}/${tempFileName} method=CloseWorkbook`,
			{ background: false }
		);

		if (out.stdOut)
			result.data = JSON.parse(out.stdOut).Data;

		if (out.stdErr)
			result.error = stdErr;

		return result;
	}
}

function parseFormdata(data) {
	// Converte os dados de versão antiga para o novo modelo.

	const planilhas = [...new Set(data.map(data => data.Planilha))]; // Somente os nomes das planilhas únicos
	const _data = {
		tables: [],
	};
	let lastGroup = '';

	planilhas.forEach(planilha => {
		const table = SrvTable();

		table.name = planilha;
		table.rows = [];

		data.filter(data => data.Planilha == planilha).forEach(item => {
			// Grupo
			if (item.Grupo && item.Grupo != lastGroup) {
				lastGroup = item.Grupo;

				const row = SrvTableRow();

				row.isGroup = true;
				row.name = item.Grupo;
				table.rows.push(row);
			}

			// Linha
			const row = SrvTableRow();

			row.id = item.Id;
			row.objects = JSON.parse(item.Objetos || '[]');
			row.name = item.Nome;
			row.description = item.Descricao;
			row.type = item.Tipo;
			row.subtype = item.SubTipo;
			row.value = item.Valor;
			row.required = item.Obrigatorio == '1';
			row.readonly = item.Editavel != '1';

			table.rows.push(row);
		});

		_data.tables.push(table);
	});

	return _data;
}

function parseReport(data) {
	// Converte os dados de versão antiga para o novo modelo.

	const info = SrvInfo();

	// info.id = data.id;
	info.createdBy = data.author;
	info.createdByEmail = data.mailAuthor;
	info.createdAt = data.created;
	// info.modifiedBy = data.modifiedBy;
	// info.modifiedByEmail = data.mailModifiedBy;
	// info.modifiedAt = data.modified;

	return info;
}
