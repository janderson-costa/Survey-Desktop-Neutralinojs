import { AppData } from "./appData";

interface Proxy {
	appData: AppData,
};

const proxy: Proxy = {
	appData: null,
};

export default proxy;
