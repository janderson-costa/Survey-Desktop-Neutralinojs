import { uiService } from '../services/UIService.js';

interface UI {
	layout: Element,
	actions_left_buttons: Element,
	actions_right_buttons: Element,
	tables_buttons: Element,
	tables_tabs: Element,
	tables: Element,
	footer_total: Element,
	dataTables: any[],
	activeDataTable: any,
	create: Function,
	selectTableTab: Function,
};

const ui: UI = {
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
	selectTableTab: uiService.selectTableTab,
};

export default ui;
