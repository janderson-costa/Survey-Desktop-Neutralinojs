import constants from '../shared/constants';
import { appData } from '../shared/appData';
import { neutralinoService } from './NeutralinoService';
import { SrvConfig, createSrvConfig, createSrvInfo, createSrvTable, createSrvTableRow } from '../models/SrvConfig';
import { Result, createResult } from '../models/Result';

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

	async function newFile(options = { minimizeWindow: null }) {
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

		if (options.minimizeWindow)
			options.minimizeWindow();

		const filePath = result.data[0];
		const ext = filePath.substring(filePath.lastIndexOf('.'));
		const tempFileName = 'temp' + ext;

		// Limpa a pasta temp
		result = await neutralinoService.clearFolder({ folderPath: './dist/temp' });

		if (result.error) {
			return result;
		}

		appData.tempFileName = tempFileName;

		// Copia o arquivo da planilha para pasta temp
		result = await neutralinoService.copyFile({
			fromFilePath: filePath,
			toFilePath: './dist/temp/' + tempFileName,
		});

		if (result.error) {
			return result;
		}

		// Abre temp.xls(x) no Excel
		result = await neutralinoService.openFile({ filePath: `${constants.temp_folder_path}/${tempFileName}` });

		if (result.error) {
			return result;
		}

		return new Promise<Result<any>>(resolve => {
			// Aguarda o Excel abrir
			const interval = setInterval(async () => {
				result = await getSheets();

				const sheets = result.data || [];

				if (sheets.length) {
					clearInterval(interval);

					// Cria o arquivo config.json
					const srvConfig = createSrvConfig();

					sheets.forEach((sheet, index) => {
						const srvTable = createSrvTable();

						srvTable.id = sheet.Id; // ! Obs.: Id válido somente enquanto o arquivo do Excel estiver aberto
						srvTable.name = sheet.Name;
						srvTable.enabled = index == 0; // Habilita a primeira

						srvConfig.data.tables.push(srvTable);
					});

					// Escreve o arquivo config.json
					result = await neutralinoService.writeFile({
						filePath: './dist/temp/config.json',
						data: JSON.stringify(srvConfig),
					});

					if (!result.error) {
						result.data = srvConfig;
					}

					resolve(result);
				}
			}, 1000);
		});
	}

	async function openFile(filePath) {
		const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
		let srvConfig = createSrvConfig();

		appData.srvFilePath = filePath;
		appData.srvFileName = fileName;

		// Limpa a pasta temp
		let result = await neutralinoService.clearFolder({ folderPath: './dist/temp' });

		if (result.error) {
			return result;
		}

		// Extrai o conteúdo na pasta temp
		result = await neutralinoService.unzipFile({
			fromFilePath: filePath,
			toFolderPath: './dist/temp',
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
				fromFilePath: './dist/temp/' + oldTempFileName,
				toFilePath: './dist/temp/' + tempFileName,
			});

			if (result.error) {
				return result;
			}
		}

		appData.tempFileName = tempFileName;

		// Lê o arquivo config.json ou antigos: formdata.json, report.json e options.json
		const config = await neutralinoService.readFile({ filePath: './dist/temp/config.json' });

		if (config.data) {
			srvConfig = JSON.parse(config.data);
		} else {
			const formdata = await neutralinoService.readFile({ filePath: './dist/temp/formdata.json' });
			const report = await neutralinoService.readFile({ filePath: './dist/temp/report.json' });

			if (formdata.data) {
				const data = JSON.parse(formdata.data);

				srvConfig.data = parseFormdata(data);
			}

			if (report.data) {
				const data = JSON.parse(report.data);

				srvConfig.info = parseReport(data);
			}

			result = await neutralinoService.writeFile({
				filePath: './dist/temp/config.json',
				data: JSON.stringify(srvConfig),
			});

			if (result.error) {
				return result;
			}
		}

		// Abre spreadsheet.xls(x) no Excel
		neutralinoService.openFile({ filePath: `${constants.temp_folder_path}/${tempFileName}` });

		return new Promise<Result<any>>(resolve => {
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
							const srvTable = createSrvTable();

							srvTable.id = sheet.Id;
							srvTable.name = sheet.Name;
							srvTable.enabled = false;

							srvConfig.data.tables.push(srvTable);
						}
					});

					result.data = srvConfig;

					resolve(result);
				}
			}, 1000);
		});
	}

	async function saveFile(srvConfig: SrvConfig) {
		// Atualiza o arquivo config.json
		let result = await neutralinoService.writeFile({
			filePath: './dist/temp/config.json',
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
			const srvFilePath = appData.srvFilePath;

			result = await neutralinoService.zipFile({
				fromFolderPath: './dist/temp',
				toFilePath: srvFilePath,
			});
		}

		return result;
	}

	async function saveWorkbook() {
		// Salva o arquivo do Excel.

		const tempFileName = appData.tempFileName;
		const result = createResult();

		if (!tempFileName)
			return result;

		return Neutralino.os.execCommand(
			`${constants.excel_api_path} workbookPath=${constants.temp_folder_path}/${tempFileName} method=SaveWorkbook`,
			{ background: false },
		)
		.then(out => {
			if (out.stdErr) {
				result.error = out.stdErr;
			} else if (out.stdOut) {
				result.data = JSON.parse(out.stdOut).Data;
			}
		})
		.catch(error => {
			result.error = error.message;
		})
		.then(() => result);
	}

	async function getSheets() {
		// Retorna os nomes das planilhas disponíveis no arquivo do Excel.

		const tempFileName = appData.tempFileName;
		const result: Result<any> = createResult();

		if (!tempFileName)
			return result;

		return Neutralino.os.execCommand(
			`${constants.excel_api_path} workbookPath=${constants.temp_folder_path}/${tempFileName} method=GetSheets`,
			{ background: false },
		)
		.then(out => {
			if (out.stdErr) {
				result.error = out.stdErr;
			} else if (out.stdOut) {
				result.data = JSON.parse(out.stdOut).Data;
			}
		})
		.catch(error => {
			result.error = error.message;
		})
		.then(() => result);
	}

	async function closeWorkbook() {
		// Fecha o arquivo do Excel.

		const tempFileName = appData.tempFileName;
		const result = createResult();

		if (!tempFileName)
			return result;

		return Neutralino.os.execCommand(
			`${constants.excel_api_path} workbookPath=${constants.temp_folder_path}/${tempFileName} method=CloseWorkbook`,
			{ background: false },
		)
		.then(out => {
			if (out.stdErr) {
				result.error = out.stdErr;
			} else if (out.stdOut) {
				result.data = JSON.parse(out.stdOut).Data;
			}
		})
		.catch(error => {
			result.error = error.message;
		})
		.then(() => result);
	}
}

function parseFormdata(data: any[]) {
	// Converte os dados de versão antiga para o novo modelo.

	const planilhas = [...new Set(data.map(data => data.Planilha))]; // Somente os nomes das planilhas únicos
	const _data = {
		tables: [],
	};
	let lastGroup = '';

	planilhas.forEach((planilha: string) => {
		const srvTable = createSrvTable();

		srvTable.name = planilha;
		srvTable.rows = [];

		data.filter(data => data.Planilha == planilha).forEach(item => {
			// Grupo
			if (item.Grupo && item.Grupo != lastGroup) {
				lastGroup = item.Grupo;

				const srvRow = createSrvTableRow();

				srvRow.isGroup = true;
				srvRow.name = item.Grupo;
				srvTable.rows.push(srvRow);
			}

			// Linha
			const srvRow = createSrvTableRow();

			srvRow.id = item.Id;
			srvRow.objects = JSON.parse(item.Objetos || '[]');
			srvRow.name = item.Nome;
			srvRow.description = item.Descricao;
			srvRow.type = item.Tipo;
			srvRow.subtype = item.SubTipo;
			srvRow.value = item.Valor;
			srvRow.required = item.Obrigatorio == '1';
			srvRow.readonly = item.Editavel != '1';

			srvTable.rows.push(srvRow);
		});

		_data.tables.push(srvTable);
	});

	return _data;
}

function parseReport(data) {
	// Converte os dados de versão antiga para o novo modelo.

	const srvInfo = createSrvInfo();

	// info.id = data.id;
	srvInfo.createdBy = data.author;
	srvInfo.createdByEmail = data.mailAuthor;
	srvInfo.createdAt = data.created;
	// info.modifiedBy = data.modifiedBy;
	// info.modifiedByEmail = data.mailModifiedBy;
	// info.modifiedAt = data.modified;

	return srvInfo;
}
