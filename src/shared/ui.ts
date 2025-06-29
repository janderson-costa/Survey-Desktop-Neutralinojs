import { create, loadTables, addTable, selectTable } from '../services/UIService.js';

const ui = {
	layout: null,
	actions_left_buttons: null,
	actions_right_buttons: null,
	tables_buttons: null,
	tables_tabs: null,
	tables: null,
	footerTotal: null,
	activeDataTable: null,
	create,
	loadTables,
	addTable,
	selectTable,
};

export default ui;
