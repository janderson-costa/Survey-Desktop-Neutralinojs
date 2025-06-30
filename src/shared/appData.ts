import { SrvConfig } from "../models/SrvConfig";

interface AppData {
	tempFileName: string | null,
	tempFilePath: string | null,
	srvConfig: SrvConfig | null,
	srvFileName: string | null,
	srvFilePath: string | null,
	sheets: any[],
	state: {
		opened: boolean,
		saved: boolean,
	},
};

let appData: AppData = {
	tempFileName: null,
	tempFilePath: null,
	srvConfig: null,
	srvFileName: null,
	srvFilePath: null,
	sheets: [],
	state: {
		opened: false,
		saved: true,
	},
};

function setAppData(newAppData: AppData) {
	appData = newAppData;
}

export { AppData, appData, setAppData };
