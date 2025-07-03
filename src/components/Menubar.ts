import { html } from '../lib/html/html.js';
import Menu from '../lib/Menu/Menu.js';
import { appData } from '../shared/appData.js';

const menubar = [
	{
		title: 'Arquivo', items: [
			{ name: 'Novo' },
			{ name: 'Abrir' },
			{ name: 'Salvar' },
			{ name: 'Salvar Como' },
			{ divider: true },
			{ name: 'Enviar por E-mail' },
			{ divider: true },
			{ name: 'Abrir Local do Arquivo' },
			{ divider: true },
			{ name: 'Sair' },
		]
	},
	{
		title: 'Exibir', items: [
			{ name: 'Informações do Arquivo', hidden: true },
			{ divider: true, hidden: true },
			{ name: 'Atualizar janela' },
		]
	},
	{
		title: 'Ferramentas', items: [
			{ name: 'Carregar Dados nas Planilhas' },
			{ name: 'Limpar Dados das Planilhas' },
			{ divider: true },
			{ name: 'Enviar por E-mail' },
			{ divider: true },
			{ name: 'Visualizar no Dispositivo Móvel' },
		]
	},
	{
		title: 'Ajuda', items: [
			{ name: 'Ajuda' },
			{ name: 'Sobre' },
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
