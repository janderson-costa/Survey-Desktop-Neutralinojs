/*
	Criado por Janderson Costa em  27/05/2024.
	Descrição: Caixa de diálogo do tipo modal simples.
*/
const __buttonDefaultOptions = {
	name: 'OK',
	primary: true,
	focused: false,
	onClick: null
};
const __modalDefaultOptions = {
	title: 'Title', // string,
	content: 'Content', // string | Element,
	width: 360, // number
	hideOut: true, // boolean - Fechar o modal ao clicar fora
	buttons: [], // __buttonDefaultOptions[]
	onHide: null, // function (opcional)
	onShow: null, // function (opcional)
};

export default function Modal(modalOptions) {
	modalOptions = { ...__modalDefaultOptions, ...modalOptions };

	let _blocked = false;
	let $overlay;
	let $buttons;

	const _context = {
		options: modalOptions,
		show,
		hide,
		block,
		showSpin,
	};

	return _context;

	function create() {
		const $overlay = document.createElement('div');

		$overlay.className = 'modal-overlay';
		$overlay.innerHTML = /*html*/`
			<div class="modal">
				<div class="modal-title">
					<span>${modalOptions.title}</span>
					<span class="modal-spin"></span>
				</div>
				<div class="modal-content"></div>
				<div class="modal-buttons"></div>
			</div>
		`;
		const $modal = $overlay.querySelector('.modal');
		const $content = $overlay.querySelector('.modal-content');

		// Overlay
		$overlay.addEventListener('click', () => {
			if (modalOptions.hideOut)
				hide();
		});

		// Modal
		$modal.addEventListener('click', event => event.stopPropagation());

		if (modalOptions.width)
			$modal.style.width = modalOptions.width + 'px';

		if (modalOptions.content instanceof HTMLElement)
			$content.appendChild(modalOptions.content);
		else
			$content.innerHTML = modalOptions.content;

		// Botões
		modalOptions.buttons = modalOptions.buttons || [];
		$buttons = $overlay.querySelector('.modal-buttons');

		modalOptions.buttons.forEach(button => {
			const $button = document.createElement('button');

			$button.type = 'button';
			$button.innerHTML = button.name;
			$button.classList.toggle('primary', !!button.primary);

			button.element = $button;

			if (button.onClick)
				$button.addEventListener('click', () => button.onClick(_context));

			$buttons.appendChild($button);
		});

		return $overlay;
	}

	function show() {
		$overlay = create();
		document.body.appendChild($overlay);
		$overlay.classList.remove('modal-invisible');
		$overlay.classList.add('modal-visible');
		window.addEventListener('keydown', onKeyDown);

		modalOptions.buttons.forEach(button => {
			if (button.focused)
				button.element.focus();
		});

		if (modalOptions.onShow)
			modalOptions.onShow(_context);
	}

	function hide() {
		destroy();
	}

	function block(block = true) {
		if (!modalOptions.buttons) return;

		_blocked = block;

		$buttons.querySelectorAll('button').forEach($button => {
			$button.blur();
			$button.classList.toggle('disabled', block);
		});
	}

	function showSpin(show = true) {
		$overlay.querySelector('.modal-spin').classList.toggle('visible', show);
	}

	function destroy() {
		if (_blocked) return;

		$overlay.classList.remove('modal-visible');
		$overlay.classList.add('modal-invisible');

		if (modalOptions.onHide)
			modalOptions.onHide(_context);

		setTimeout(() => {
			$overlay.remove();
			window.removeEventListener('keydown', onKeyDown);
		}, 200);
	}

	function onKeyDown(event) {
		if (event.key == 'Tab') {
			if (_blocked)
				event.preventDefault();
		}

		if (event.key == 'Escape') {
			destroy();
		}
	}
}
