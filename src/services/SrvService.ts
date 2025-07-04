import constants from '../shared/constants';
import { appData } from '../shared/appData';
import { neutralinoService } from './NeutralinoService';
import { SrvConfig, createSrvConfig, createSrvInfo, createSrvTable, createSrvTableRow } from '../models/SrvConfig';
import { Result, createResult } from '../models/Result';

const srvService = SrvService();

export { srvService };

function SrvService() {
	return {
		newSrv,
		openSrv,
		saveSrv,
		getSheets,
		saveWorkbook,
		closeWorkbook,
	};
}

async function newSrv(filePath: string) {
	const ext = filePath.substring(filePath.lastIndexOf('.'));
	const excelFileName = 'temp' + ext;

	// Limpa a pasta temp
	let result = await neutralinoService.clearFolder({ folderPath: constants.temp_folder_path });

	if (result.error) {
		return result;
	}

	appData.excelFileName = excelFileName;

	// Copia o arquivo da planilha para pasta temp
	result = await neutralinoService.copyFile({
		fromFilePath: filePath,
		toFilePath: `${constants.temp_folder_path}/${excelFileName}`,
	});

	if (result.error) {
		return result;
	}

	// Abre temp.xls(x) no Excel
	result = await neutralinoService.openFile({ filePath: `${constants.temp_folder_path}/${excelFileName}` });

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

					srvTable.id = sheet.id; // ! Obs.: Id válido somente enquanto o arquivo do Excel estiver aberto
					srvTable.name = sheet.name;
					srvTable.enabled = index == 0; // Habilita a primeira

					srvConfig.data.tables.push(srvTable);
				});

				// Escreve o arquivo config.json
				result = await neutralinoService.writeFile({
					filePath: constants.temp_folder_path + '/config.json',
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

async function openSrv(filePath: string) {
	const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
	let srvConfig = createSrvConfig();

	appData.srvFilePath = filePath;
	appData.srvFileName = fileName;

	// Limpa a pasta temp
	let result = await neutralinoService.clearFolder({ folderPath: constants.temp_folder_path });

	if (result.error) {
		return result;
	}

	// Extrai o conteúdo na pasta temp
	result = await neutralinoService.unzipFile({
		fromFilePath: filePath,
		toFolderPath: constants.temp_folder_path,
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
			fromFilePath: `${constants.temp_folder_path}/${oldTempFileName}`,
			toFilePath: `${constants.temp_folder_path}/${tempFileName}`,
		});

		if (result.error) {
			return result;
		}
	}

	appData.excelFileName = tempFileName;

	// Lê o arquivo config.json ou antigos: formdata.json, report.json e options.json
	const config = await neutralinoService.readFile({ filePath: `${constants.temp_folder_path}/config.json` });

	if (config.data) {
		srvConfig = JSON.parse(config.data);
	} else {
		const formdata = await neutralinoService.readFile({ filePath: `${constants.temp_folder_path}/formdata.json` });
		const report = await neutralinoService.readFile({ filePath: `${constants.temp_folder_path}/report.json` });

		if (formdata.data) {
			const data = JSON.parse(formdata.data);

			srvConfig.data = parseFormdata(data);
		}

		if (report.data) {
			const data = JSON.parse(report.data);

			srvConfig.info = parseReport(data);
		}

		result = await neutralinoService.writeFile({
			filePath: `${constants.temp_folder_path}/config.json`,
			data: JSON.stringify(srvConfig),
		});

		if (result.error) {
			return result;
		}
	}

	appData.sheets = srvConfig.data.tables.map(srvTable => ({
		id: srvTable.id,
		name: srvTable.name,
	}));

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
					srvConfig.data.tables.forEach(srvTable => {
						if (sheet.name == srvTable.name) {
							srvTable.id = sheet.id; // ! Obs.: Id válido somente enquanto o arquivo do Excel estiver aberto
							isNewTable = false;
						}
					});

					// Para arquivos .srv de versões anteriores, adiciona o restante das planilhas como desabilitadas
					if (isNewTable) {
						const srvTable = createSrvTable();

						srvTable.id = sheet.id;
						srvTable.name = sheet.name;
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

async function saveSrv(srvConfig: SrvConfig) {
	// Atualiza o arquivo config.json
	let result = await neutralinoService.writeFile({
		filePath: `${constants.temp_folder_path}/config.json`,
		data: JSON.stringify(srvConfig),
	});

	if (result.error) {
		console.log(result.error);
		return result;
	}

	// Salva a planilha temp
	result = await saveWorkbook();

	let success = result.data;

	if (!success) {
		result.error = 'Não foi possível salvar a planilha.<br><br>Verifique se: <br> - O arquivo temp.xls(x) está aberto no Excel.<br> - Não há subjanelas abertas dentro do Excel.<br> - Células em modo de edição.<br> - Outro fator que esteja impedindo o salvamento.<br><br>Tente salvar novamente.';

		console.log(result.error);
		return result;
	}

	// Cria a pasta ./dist/temp/<saved>
	// Obs.: Necessáro para que não falhe ao zipar com 7zip
	const savedFolderPath = `${constants.temp_folder_path}/saved`;

	// Remove ./saved
	try {
		result = await neutralinoService.remove({ path: savedFolderPath });
	} catch (error) {}

	// Cria ./saved
	result = await neutralinoService.createDirectory({ path: savedFolderPath });

	if (result.error) {
		console.log(result.error);
		return result;
	}

	// Copia os arquivos para a nova pasta ./dist/temp/temp
	result = await neutralinoService.readDirectory({ path: constants.temp_folder_path });

	if (result.error) {
		console.log(result.error);
		return result;
	}

	const entries = result.data || [];

	entries.filter(x =>
		x.type.toLowerCase() == 'file' &&
		!x.entry.startsWith('~') 
	).forEach(async (file: any) => {
		result = await neutralinoService.copyFile({
			fromFilePath: file.path,
			toFilePath: `${savedFolderPath}/${file.entry}`,
		});
	});

	// Empacota o arquivo .srv para pasta ./dist/temp/saved
	result = await neutralinoService.zipFile({
		fromFolderPath: savedFolderPath,
		toFilePath: `${savedFolderPath}/${appData.srvFileName}`,
	});

	if (!result.error) {
		// Remove o arquivo .srv original (se existir)
		try {
			await neutralinoService.remove({ path: appData.srvFilePath });
		} catch (error) {}

		// Copia o arquivo .srv para a pasta de origem
		result = await neutralinoService.copyFile({
			fromFilePath: `${savedFolderPath}/${appData.srvFileName}`,
			toFilePath: appData.srvFilePath,
		});
	}

	if (result.error) {
		console.log(result.error);
	}

	return result;
}

async function saveWorkbook() {
	// Salva o arquivo do Excel.

	const tempFileName = appData.excelFileName;
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
			result.data = JSON.parse(out.stdOut).data;
		}
	})
	.catch(error => {
		result.error = error.message;
	})
	.then(() => result);
}

async function getSheets() {
	// Retorna os nomes das planilhas disponíveis no arquivo do Excel.

	const tempFileName = appData.excelFileName;
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
			result.data = JSON.parse(out.stdOut).data;
		}
	})
	.catch(error => {
		result.error = error.message;
	})
	.then(() => result);
}

async function closeWorkbook() {
	// Fecha o arquivo do Excel.

	const tempFileName = appData.excelFileName;
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
			result.data = JSON.parse(out.stdOut).data;
		}
	})
	.catch(error => {
		result.error = error.message;
	})
	.then(() => result);
}

function parseFormdata(data: any[]) {
	// Converte os dados de versão antiga para o novo modelo.

	const planilhas = [...new Set(data.map(data => data.planilha))]; // Somente os nomes das planilhas únicos
	const _data = {
		tables: [],
	};
	let lastGroup = '';

	planilhas.forEach((planilha: string) => {
		const srvTable = createSrvTable();

		srvTable.name = planilha;
		srvTable.rows = [];

		data.filter(data => data.planilha == planilha).forEach(item => {
			// Grupo
			if (item.grupo && item.grupo != lastGroup) {
				lastGroup = item.grupo;

				const srvRow = createSrvTableRow();

				srvRow.isGroup = true;
				srvRow.name = item.grupo;
				srvTable.rows.push(srvRow);
			}

			// Linha
			const srvRow = createSrvTableRow();

			srvRow.id = item.id;
			srvRow.objects = JSON.parse(item.objetos || '[]');
			srvRow.name = item.nome;
			srvRow.description = item.descricao;
			srvRow.type = item.tipo;
			srvRow.subtype = item.subTipo;
			srvRow.value = item.valor;
			srvRow.required = item.obrigatorio == '1';
			srvRow.readonly = item.editavel != '1';

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
