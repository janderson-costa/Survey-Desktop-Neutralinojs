const constants = {
	root_path: '',
	get temp_folder_path() { return `${this.root_path}/dist/temp`; },
	//excel_api_path() { return `${this.root_path}/dist/tools/office/ExcelAPI.exe`; },
	excel_api_path: 'D:/_dev/Survey/2.0/Survey-Desktop/ExcelAPI/bin/Debug/net48/win-x86/ExcelAPI.exe',
};

export default constants;
