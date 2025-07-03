import ui from '../shared/ui.js';
import utils from '../lib/Utils/Utils.js';
import { html } from '../lib/html/html.js';
import { DataTable } from '../lib/DataTable/src/index.js';
import { renderIcons } from '../components/Icon.js';
import { createSrvTableRow } from '../models/SrvConfig.js';
import Modal from '../lib/Modal/Modal.js';

const _columns = {
	//id: { displayName: 'Id', hidden: true },
	enabled: {
		title: 'Habilitar/Desabilitar no dispositivo móvel',
		displayName: '<i class="icon" data-lucide="smartphone"></i>',
		width: 60,
		style: { paddingLeft: 22 },
		resize: false,
	},
	readonly: { displayName: 'Editável', width: 60, title: 'Editável', },
	required: { displayName: 'Obrigatório', width: 60, title: 'Obrigatório', },
	name: { displayName: 'Nome do Campo ou Grupo', minWidth: 150 },
	description: { displayName: 'Descrição', minWidth: 150 },
	value: { displayName: 'Valor' },
	//objects: { displayName: 'Objetos', hidden: true },
	type: { displayName: 'Tipo' },
	//subtype: { displayName: 'Subtipo', hidden: true },
};
const _fieldTypes = [
	{ name: '', displayName: 'Texto' },
	{ name: '', displayName: 'Número' },
	{ name: '', displayName: 'E-mail' },
	{ name: '', displayName: 'Data' },
	{ name: '', displayName: 'Data/Hora' },
	{ name: '', displayName: 'Opção' },
	{ name: '', displayName: 'Opção Múltipla' },
	{ name: '', displayName: 'Imagem' },
	{ name: '', displayName: 'Assinatura' },
];

const dataTableService = DataTableService();

export { dataTableService };

function DataTableService() {
	return {
		createTable,
		removeTable,
		addTableRow,
		addTableRowGroup,
		moveSelectedRows,
		removeSelectedTableRows,
	};
}

function createTable(srvTableId: string) {
	const dt = DataTable({
		id: srvTableId,
		data: [],
		place: null,
		checkbox: false,
		sort: false,
		resize: true,
		//width: 'fit-content',
		height: '100%',
		columns: _columns,
		borders: {
			table: {
				all: true,
				// top: false,
				// bottom: false,
				radius: 6,
			},
			rows: true,
			cells: true,
		},
		footer: {
			hidden: true,
		},
		rows: {
			selectOnClick: true,
		},
		cells: {
			enabled: {
				display: ({ row, item, value }) => {
					if (item.isGroup) return '';

					return html`
						<label class="flex items-center justify-center h-[32px] opacity-90">
							<input type="checkbox" checked="${() => item.enabled}" @onChange="${e => {
								item.enabled = e.element.checked;

								row.cell('required').disable(!item.enabled);
								row.cell('readonly').disable(!item.enabled);
							}}" class="scale-[1.1]"/>
						</label>
					`;
				},
			},
			readonly: {
				display: ({ row, item, value }) => {
					if (item.isGroup) return '';

					return html`
						<label class="flex items-center justify-center h-[32px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.readonly}" @onChange="${e => {
								item.readonly = e.element.checked;
							}}" class="scale-[1.1]"/>
						</label>
					`;
				},
			},
			required: {
				display: ({ row, item, value }) => {
					if (item.isGroup) return '';

					return html`
						<label class="flex items-center justify-center h-[32px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.required}" @onChange="${e => {
								item.required = e.element.checked;
							}}" class="scale-[1.1]"/>
						</label>
					`;
				},
			},
			name: {
				display: ({ row, item, value }) => {
					return html`
						<input type="text" value="${value}" @onChange="${e => {
							item.name = e.element.value.trim();
						}}"/>
					`;
				}
			},
			description: {
				display: ({ row, item, value }) => {
					if (item.isGroup) return '';

					const $field = html`
						<textarea rows="1" @onChange="${e => {
							item.description = e.element.value.trim();
						}}" @onInput="${e => {
							utils.form().field().autoHeight(e.element);
						}}">${value}</textarea>
					`;

					utils.form().field().autoHeight($field);

					return $field;
				}
			},
			value: {
				display: ({ row, item, value }) => {
					if (item.isGroup) return '';

					if (item.type == 'Texto') {
						const $field = html`
							<textarea rows="1" @onChange="${e => {
								item.value = e.element.value;
							}}" @onInput="${e => {
								utils.form().field().autoHeight(e.element);
							}}">${item.value}</textarea>
						`;

						utils.form().field().autoHeight($field);

						return $field;
					} else if (item.type == 'Número') {
						return html`
							<input type="number" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'E-mail') {
						return html`
							<input type="email" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Data') {
						return html`
							<input type="date" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Data/Hora') {
						return html`
							<input type="datetime-local" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Horário') {
						return html`
							<input type="time" value="${item.value}" @onChange="${e => {
								item.value = e.element.value;
							}}"/>
						`;
					} else if (item.type == 'Opção') {
						const $field = html`
							<select @onChange="${e => {
								item.value = e.element.value;
							}}">${_fieldTypes.map(type => /*html*/`
								<option value="${type.displayName}">${type.displayName}</option>
							`)}</select>
						`;

						$field['value'] = value;

						return $field;
					} else if (item.type == 'Opcão Múltipla') {
						//
					} else if (item.type == 'Imagem') {
						//
					} else if (item.type == 'Assinatura') {
						//
					}

					return html`
						<input type="text" value="${item.value}" @onChange="${e => {
							item.value = e.element.value;
						}}"/>
					`;
				},
			},
			type: {
				display: ({ row, item, value }) => {
					if (item.isGroup) return '';

					const $field = html`
						<select @onChange="${e => {
							item.type = e.element.value;
						}}">${_fieldTypes.map(type => /*html*/`
							<option value="${type.displayName}">${type.displayName}</option>
						`)}</select>
					`;

					$field['value'] = value;

					return $field;
				},
			},
		},
		onSelectRows: ({ rows }) => {
			ui.tables_buttons = ui.tables_buttons['reload']();
			renderIcons();
		},
		onUnselectRows: () => {
			ui.tables_buttons = ui.tables_buttons['reload']();
			renderIcons();
		},
		onClickOut: ({ event }) => {
			// Cancela a chamada de onUnselectRows()
			return false;
		},
	});

	dt.element.classList.add('!hidden');
	ui.dataTables.push(dt);

	return dt;
}

function removeTable(srvTableId: string) {
	let dt = ui.dataTables.find(x => x.id == srvTableId);

	if (dt) {
		dt.element.remove();
		dt = null;
	}
}

function addTableRow() {
	const row = createSrvTableRow();

	ui.activeDataTable.addRow(row);
	ui.footer_total = ui.footer_total['reload']();
}

function addTableRowGroup() {
	const row = createSrvTableRow();

	row.isGroup = true;
	ui.activeDataTable.addRow(row);
	ui.footer_total = ui.footer_total['reload']();
}

function moveSelectedRows(down = true) {
	ui.activeDataTable.moveSelectedRows(down);
}

function removeSelectedTableRows() {
	Modal({
		title: 'Exluir item',
		content: `O item selecionado será excluído de forma permanente.<br><br>Deseja continuar?`,
		buttons: [
			{
				name: 'Excluir', primary: true, onClick: async modal => {
					ui.activeDataTable.removeSelectedRows();
					ui.footer_total = ui.footer_total['reload']();
					modal.hide();
				}
			},
			{
				name: 'Cancelar', onClick: modal => modal.hide()
			},
		],
		onShow: modal => {
			modal.options.buttons[0].element.focus();
		}
	}).show();
}
