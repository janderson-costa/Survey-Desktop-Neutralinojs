/*
	Criado por Janderson Costa em  27/05/2024.
	Descrição: Caixa de diálogo do tipo modal simples.
*/

const buttonDefaultOptions = {
	name: 'OK',
	primary: true,
	focused: false,
	onClick: null,
};
const modalDefaultOptions = {
	title: 'Title', // string,
	content: 'Content', // string | Element,
	width: 360, // number
	hideOut: true, // boolean - Fechar o modal ao clicar fora
	buttons: [], // buttonDefaultOptions[]
	onHide: null, // function (opcional)
	onShow: null, // function (opcional)
};

export default function Modal(modalOptions) {
	modalOptions = { ...modalDefaultOptions, ...modalOptions };

	const _elements = {
		overlay: null,
		modal: null,
		title: null,
		content: null,
		buttons: null,
	};
	const _context = {
		options: modalOptions,
		elements: _elements,
		show,
		hide,
		showSpin,
		block,
	};
	let _blocked = false;

	return _context;

	function create() {
		_elements.overlay = document.createElement('div');
		_elements.overlay.className = 'modal-overlay';
		_elements.overlay.innerHTML = /*html*/`
			<div class="modal">
				<div class="modal-title">
					<div>${modalOptions.title}</div>
					<div class="modal-controls">
						<div class="modal-close">
							<button type="button" class="toast-button-icon" title="Fechar">
								<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" viewBox="0 0 14 14">
									<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
							</button>
						</div>
						<div class="modal-spin hidden">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
								<circle fill="none" stroke="currentColor" stroke-width="12" opacity="0.3" cx="50" cy="50" r="40"></circle>
								<circle fill="none" stroke="currentColor" stroke-width="12" opacity="0.9" stroke-dasharray="278" stroke-dashoffset="210" cx="50" cy="50" r="40"></circle>
							</svg>
						</div>
					</div>
				</div>
				<div class="modal-content"></div>
				<div class="modal-buttons hidden"></div>
			</div>
		`;

		// Elementos
		_elements.modal = _elements.overlay.querySelector('.modal');
		_elements.title = _elements.modal.querySelector('.modal-title')
		_elements.content = _elements.overlay.querySelector('.modal-content');
		_elements.buttons = _elements.overlay.querySelector('.modal-buttons');

		// Overlay
		_elements.overlay.addEventListener('click', () => {
			if (modalOptions.hideOut)
				hide();
		});

		// Modal
		_elements.modal.addEventListener('click', event => event.stopPropagation());
		_elements.title.querySelector('.modal-close').addEventListener('click', hide);

		if (modalOptions.width)
		_elements.modal.style.width = modalOptions.width + 'px';

		if (modalOptions.content instanceof Element)
			_elements.content.appendChild(modalOptions.content);
		else
			_elements.content.innerHTML = modalOptions.content;

		// Botões
		modalOptions.buttons = modalOptions.buttons || [];

		modalOptions.buttons.forEach(button => {
			const $button = document.createElement('button');

			$button.type = 'button';
			$button.innerHTML = button.name;
			$button.classList.toggle('primary', !!button.primary);

			button.element = $button;

			if (button.onClick)
				$button.addEventListener('click', () => button.onClick(_context));

			_elements.buttons.appendChild($button);
		});

		if (modalOptions.buttons.length)
			_elements.buttons.classList.remove('hidden');

		return _elements.overlay;
	}

	function show() {
		create();

		document.body.appendChild(_elements.overlay);
		_elements.overlay.classList.remove('modal-invisible');
		_elements.overlay.classList.add('modal-visible');
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

		_elements.buttons.querySelectorAll('button').forEach($button => {
			$button.blur();
			$button.classList.toggle('disabled', block);
		});
	}

	function showSpin(show = true) {
		_elements.overlay.querySelector('.modal-close').classList[show ? 'add' : 'remove']('hidden');
		_elements.overlay.querySelector('.modal-spin').classList[show ? 'remove' : 'add']('hidden');
	}

	function destroy() {
		if (_blocked) return;

		_elements.overlay.classList.remove('modal-visible');
		_elements.overlay.classList.add('modal-invisible');

		if (modalOptions.onHide)
			modalOptions.onHide(_context);

		setTimeout(() => {
			_elements.overlay.remove();
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
