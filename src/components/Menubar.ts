import actions from '../shared/actions.js';
import { appData } from '../shared/appData.js';
import { html } from '../lib/html/html.js';
import Menu from '../lib/Menu/Menu.js';

const menubar = [
	{
		title: 'Arquivo', items: [
			{ name: 'Novo', onClick: () => actions.newFile() },
			{ name: 'Abrir', onClick: () => actions.openFile() },
			{ name: 'Salvar', onClick: () => actions.saveFile() },
			{ name: 'Salvar Como', onClick: () => actions.saveFileAs() },
			{ divider: true },
			{ name: 'Enviar por E-mail', onClick: () => null },
			{ divider: true },
			{ name: 'Abrir Local do Arquivo', onClick: () => null },
			{ divider: true },
			{ name: 'Sair', onClick: () => actions.exit() },
		]
	},
	{
		title: 'Exibir', items: [
			{ name: 'Informações do Arquivo', onClick: () => actions.showFileInfo(), hidden: true },
			{ divider: true, hidden: true },
			{ name: 'Atualizar janela', onClick: () => actions.reload() },
		]
	},
	{
		title: 'Ferramentas', items: [
			{ name: 'Carregar Dados nas Planilhas', onClick: () => null },
			{ name: 'Limpar Dados das Planilhas', onClick: () => null },
			{ divider: true },
			{ name: 'Enviar por E-mail', onClick: () => null },
			{ divider: true },
			{ name: 'Visualizar no Dispositivo Móvel', onClick: () => null },
		]
	},
	{
		title: 'Ajuda', items: [
			{ name: 'Ajuda', onClick: () => null },
			{ name: 'Sobre', onClick: () => null },
		]
	},
];
const menu = Menu({
	items: [],
	position: 'bottom left',
	onShow: menu => {
		menu.options.items.forEach(item => {
			const $item: Element = item.element;

			if ($item && !item.divider) {
				$item.classList.add('!min-h-[2.5rem]');

				if (item.name.startsWith('Informações')) {
					item.show(!!appData.srvConfig.info.createdAt);
				}
			}
		});
	}
});

export default function Menubar() {
	return html`
		<div class="flex gap-0.5">${() =>
			menubar.map(item =>
				html`
					<button type="button" class="button h-10 px-2.5" @onClick="${e => {
						e.event.stopPropagation();
						menu.options.items = item.items;
						menu.show({ trigger: e.element.closest('button') });
					}}">
						<span class="pb-[1px]">${item.title}</span>
					</button>
				`
			)}
		</div>
	`;
}
