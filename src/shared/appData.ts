import { SrvConfig } from "../models/SrvConfig";

interface AppData {
	proxy: AppData | null,
	tempFileName: string | null,
	tempFilePath: string | null,
	srvConfig: SrvConfig | null,
	srvFileName: string | null,
	srvFilePath: string | null,
	sheets: any[],
	dataTables: any[],
	state: {
		opened: boolean,
		saved: boolean,
	},
};

let appData: AppData = {
	proxy: null,
	tempFileName: null,
	tempFilePath: null,
	srvConfig: null,
	srvFileName: null,
	srvFilePath: null,
	sheets: [],
	dataTables: [],
	state: {
		opened: false,
		saved: true,
	},
};

function setAppData(newAppData: AppData) {
	appData = newAppData;
}

export { AppData, appData, setAppData };
