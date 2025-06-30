import { SrvConfig } from "../models/SrvConfig";

interface AppData {
	excelFileName: string | null,
	tempFilePath: string | null,
	srvConfig: SrvConfig | null,
	srvFileName: string | null,
	srvFilePath: string | null,
	sheets: any[],
	state: {
		creating: boolean,
		opening: boolean,
		opened: boolean,
		saved: boolean,
	},
};

let appData: AppData = {
	excelFileName: null,
	tempFilePath: null,
	srvConfig: null,
	srvFileName: null,
	srvFilePath: null,
	sheets: [],
	state: {
		creating: false,
		opening: false,
		opened: false,
		saved: true,
	},
};

function setAppData(newAppData: AppData) {
	appData = newAppData;
}

export { AppData, appData, setAppData };
