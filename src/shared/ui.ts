import { create, loadTables, addTable, selectTable } from '../services/UIService.js';

const ui = {
	layout: null,
	actions_left_buttons: null,
	actions_right_buttons: null,
	table_buttons: null,
	table_tabs: null,
	tables: null,
	activeDataTable: null,
	footerTotal: null,
	create,
	loadTables,
	addTable,
	selectTable,
};

export default ui;
