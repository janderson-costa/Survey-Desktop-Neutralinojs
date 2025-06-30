import { uiService } from '../services/UIService.js';

const ui = {
	layout: null,
	actions_left_buttons: null,
	actions_right_buttons: null,
	tables_buttons: null,
	tables_tabs: null,
	tables: null,
	footer_total: null,
	dataTables: [],
	activeDataTable: null,
	create: uiService.create,
	loadTables: uiService.loadTables,
	addTable: uiService.addTable,
	selectTable: uiService.selectTable,
};

export default ui;
