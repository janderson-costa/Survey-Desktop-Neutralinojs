import ui from '../shared/ui';
import actions from '../shared/actions';
import { AppData, appData } from '../shared/appData';
import { SrvConfig, SrvTable } from '../models/SrvConfig';
import { html } from '../lib/html/html.js';
import Menu from '../lib/Menu/Menu.js';
import Buttons from '../components/Buttons';
import { createDataTable } from '../components/DataTable.js';
import { Icon, renderIcons } from '../components/Icon.js';

export function create(appDataProxy: AppData) {
	const srvConfig = appDataProxy.srvConfig;
	const menu = Menu({ items: [] });
	const toolbar_actions_left_buttons = [
		{ title: 'Novo', icon: Icon('new'), onClick: () => actions.newFile() },
		{ title: 'Abrir', icon: Icon('open'), onClick: () => actions.openFile() },
		{ title: 'Salvar', icon: Icon('save'), onClick: () => actions.saveFile() },
		{ title: 'Informações do arquivo', icon: Icon('info'), onClick: () => actions.showFileInfo() },
		{ divider: true, hidden: false },
		{ title: 'Carregar dados nas planilhas', icon: Icon('load'), onClick: () => console.log('onClick') },
		{ title: 'Limpar dados das planilhas', icon: Icon('clear'), onClick: () => console.log('onClick') },
		{ title: 'Enviar por E-mail', icon: Icon('send'), onClick: () => console.log('onClick') },
	];
	const toolbar_actions_right_buttons = [
		{ title: 'Visualizar no dispositivo móvel', icon: Icon('smartphone'), onClick: () => console.log('onClick') }
	];
	const toolbar_table_buttons = [
		{ divider: true, hidden: false },
		{ title: 'Adicionar grupo', icon: Icon('addGroup'), onClick: () => console.log('onClick') },
		{ title: 'Adicionar item', icon: Icon('add'), onClick: () => console.log('onClick') },
		{ title: 'Mover item selecionado para cima', icon: Icon('arrowUp'), onClick: () => console.log('onClick') },
		{ title: 'Mover item selecionado para baixo', icon: Icon('arrowDown'), onClick: () => console.log('onClick') },
		{ title: 'Excluir item selecionado', icon: Icon('close'), onClick: () => console.log('onClick') },
	];


	// Componentes

	const $toolbar_actions_left_buttons = html`<div>${() => {
		toolbar_actions_left_buttons.forEach((control, index) => {
			if (!appDataProxy.state.opened && index > 1)
				control.hidden = true;
		});

		return Buttons(toolbar_actions_left_buttons);
	}}</div>`;

	const $toolbar_actions_right_buttons = Buttons(toolbar_actions_right_buttons);

	const $toolbar_table_tabs = html`
		<div class="tabs flex gap-2">${() =>
			srvConfig.data.tables.filter(x => x.enabled).map((srvTable, index) => {
				const $tab = html`
					<button type="button" class="tab button h-10 px-3 whitespace-nowrap" id="${srvTable.id}" @onClick="${() => selectTable(srvTable)}">
						<span>${srvTable.name}</span>
					</button>
				`;

				if (ui.activeDataTable) {
					if (ui.activeDataTable.id == srvTable.id)
						$tab.classList.add('active');
				} else if (index == 0) {
					$tab.classList.add('active');
				}

				return $tab;
			})
		}</div>
	`;

	const $button_add_table = html`
		<button type="button" class="button add-sheet min-w-10 h-10" title="Adicionar planilha" @onClick="${async e => {
			e.event.stopPropagation();

			if (!appData.sheets.length) return;

			menu.options.items = appData.sheets.map((sheet, index) => {
				const srvTable = srvConfig.data.tables.find(x => x.id == sheet.Id);

				if (srvTable) {
					return ({
						icon: srvTable.enabled ? Icon('check') : '',
						name: sheet.Name,
						onClick: () => addTable(srvConfig, srvTable, index),
					});
				}
			});
			menu.show({
				trigger: e.element.closest('button'),
				position: 'bottom left',
			});

			renderIcons();
		}}">${Icon('gridPlus')}</button>
	`;

	const $toolbar_table_buttons = html`<div>${() => {
		toolbar_table_buttons.forEach((control, index) => {
			if (index > 2) {
				control.hidden = true;

				if (ui.activeDataTable && ui.activeDataTable.rows.some(x => x.isSelected)) {
					control.hidden = false;
				}
			}
		});

		return Buttons(toolbar_table_buttons);
	}}</div>`;

	const $tables = srvConfig.data.tables.map(srvTable => {
		const dt = createDataTable({ srvTable });

		appData.dataTables.push(dt);

		return dt.element;
	});

	const $footer_total = html`<span class="flex items-center h-10">${() => {
		let total: number = 0;

		$toolbar_table_tabs.querySelectorAll('.tab').forEach(($tab, index) => {
			if ($tab.classList.contains('active')) {
				const dt = appData.dataTables[index];

				total = dt.rows.length;
			}
		});

		return total ? `${total} item(s)` : '';
	}}</span>`;

	const $layout = html`
		<div class="layout flex h-screen">
			<div class="flex flex-col justify-between w-screen h-screen">
				<div>
					<!-- toolbar-actions -->
					<div class="toolbar-actions flex justify-between gap-4 px-4 py-4">
						<div class="left">${$toolbar_actions_left_buttons}</div>
						<div class="right" @show="${appDataProxy.state.opened}">${$toolbar_actions_right_buttons}</div>
					</div>

					<!-- toolbar-table -->
					<div class="toolbar-table flex gap-2 px-4 pb-4" @show="${appDataProxy.state.opened}">
						<div class="flex gap-2 w-max-[600px] overflow-x-auto">${$toolbar_table_tabs}</div>
						${$button_add_table}
						${$toolbar_table_buttons}
					</div>
				</div>

				<!-- tables -->
				<div class="tables flex-1 overflow-auto px-4">${$tables}</div>

				<!-- footer -->
				<div class="footer flex gap-4 px-4 py-4">${$footer_total}</div>
			</div>

			<!-- app viewer -->
			<div></div>
		</div>
	`;

	ui.layout = $layout;
	ui.actions_left_buttons = $toolbar_actions_left_buttons;
	ui.actions_right_buttons = $toolbar_actions_right_buttons;
	ui.table_buttons = $toolbar_table_buttons;
	ui.table_tabs = $toolbar_table_tabs;
	ui.tables = $layout.querySelector('.tables');
}

export function loadTables(appDataProxy: AppData) {
	const srvConfig = appDataProxy.srvConfig;

	srvConfig.data.tables.forEach((srvTable, index) => {
		appData.dataTables[index].load(srvTable.rows);
	});
}

export function addTable(srvConfig: SrvConfig, srvTable: SrvTable, index: number) {
	const tablesCount = srvConfig.data.tables.filter(x => x.enabled).length;

	// Garante que pelo menos uma tabela esteja habilitada
	if (tablesCount == 1 && srvTable.enabled)
		return;

	srvTable.enabled = !srvTable.enabled;

	if (srvTable.enabled) {
		ui.activeDataTable = appData.dataTables[index];
	} else {
		// Índice do próximo selecionado que está habilitado
		const tables = srvConfig.data.tables;
		let _index = tables.findIndex(x => x.id == ui.activeDataTable.id);

		if (!tables[_index].enabled) {
			// Próximo a direita
			_index = tables.findIndex((x, i) => i > index && x.enabled);

			if (_index == -1) {
				// Próximo a esquerda
				_index = tables.reverse().findIndex((x, i) => i < index && x.enabled);
				tables.reverse();
			}
		}

		srvTable = tables[_index];
		ui.activeDataTable = appData.dataTables[_index];
	}

	ui.table_tabs = ui.table_tabs.reload();
	ui.selectTable(srvTable);
}

export function selectTable(srvTable?: SrvTable) {
	srvTable = srvTable || appData.srvConfig.data.tables[0];
	ui.activeDataTable = appData.dataTables.find(dt => dt.id == srvTable.id);

	// Tab ativa
	ui.table_tabs = ui.table_tabs.reload();

	// Exibe a tabela especificada
	appData.dataTables.forEach((dt, _index)=> {
		dt.element.classList.add('!hidden');

		if (dt.id == srvTable.id)
			dt.element.classList.remove('!hidden');
	});

	// Recarrega a barra de botões da tabela
	ui.table_buttons = ui.table_buttons.reload();
	renderIcons();

	// Total
	ui.footerTotal = ui.footerTotal.reload();
}
