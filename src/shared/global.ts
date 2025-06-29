let global = {
	appData: {
		tempFileName: null,
		tempFilePath: null,
		srvConfig: null,
		srvFileName: null,
		srvFilePath: null,
		state: {
			opened: false,
			saved: true,
		},
	},
};

function setGlobal(newGlobal: typeof global) {
	global = newGlobal;
}

export { global, setGlobal };
