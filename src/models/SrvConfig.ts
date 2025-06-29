export interface SrvConfig {
	versions: {
		desktop: string | null;
		mobile: string | null;
	};
	data: {
		tables: SrvTable[];
	};
	info: SrvInfo;
}

export interface SrvTable {
	id: string;
	name: string;
	enabled: boolean;
	rows: SrvTableRow[];
}

export interface SrvTableRow {
	id: string;
	name: string;
	description: string;
	type: string;
	subtype: string;
	value: string;
	objects: string;
	required: boolean;
	readonly: boolean;
	isGroup: boolean;
}

export interface SrvInfo {
	createdAt: string;
	createdBy: string;
	createdByEmail: string;
}


// Factory

export function createSrvConfig(): SrvConfig {
	return {
		versions: { desktop: null, mobile: null },
		data: { tables: [] },
		info: createSrvInfo(),
	};
}

export function createSrvTable(): SrvTable {
	return {
		id: '',
		name: '',
		enabled: true,
		rows: [createSrvTableRow()],
	};
}

export function createSrvTableRow(): SrvTableRow {
	return {
		id: '',
		name: '',
		description: '',
		type: '',
		subtype: '',
		value: '',
		objects: '',
		required: false,
		readonly: false,
		isGroup: false,
	};
}

export function createSrvInfo(): SrvInfo {
	return {
		createdAt: '',
		createdBy: '',
		createdByEmail: '',
	};
}
