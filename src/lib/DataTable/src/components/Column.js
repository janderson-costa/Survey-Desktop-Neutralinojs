import { utils } from '../utils.js';

export function Column(table, columnOptions) {
	// columnOptions: ColumnOptions

	const $cell = create();
	const _cell = {
		element: $cell,
		isHidden: columnOptions.hidden,
		isDisabled: columnOptions.disabled,
		options: columnOptions,
		show,
		checked,
		disable,
	};

	show(!columnOptions.hidden);
	disable(columnOptions.disabled);

	return _cell;

	function create() {
		const $cell = document.createElement('div');

		$cell.classList.add('dt-header-cell');

		if (columnOptions.checkbox) {
			$cell.classList.add('checkbox');
			$cell.insertAdjacentHTML('afterbegin', /*html*/`
				<label class="dt-row-checkbox">
					<input type="checkbox" />
				</label>
			`);

			const $checkbox = $cell.querySelector('label');

			$checkbox.addEventListener('change', event => {
				event.target.checked ?
					table.selectRows() :
					table.unselectRows(event);
			});
		} else {
			$cell.dataset.name = columnOptions.name;
			$cell.insertAdjacentHTML('afterbegin', /*html*/`
				<label class="name" title="${columnOptions.title || ''}">
					${columnOptions.displayName}
				</label>
				<span class="controls">
					<i class="sort asc" title="Sort"></i>
					<div class="resizer"></div>
				</span>
			`);

			const $iconSort = $cell.querySelector('.sort');

			if (table.options.sort && columnOptions.sort != false) {
				$cell.classList.add('sortable');

				$cell.addEventListener('click', () => {
					if (table.header.isDisabled || _cell.isDisabled)
						return;

					table.header.cells.forEach(cell =>
						cell.element.classList.remove('sorted')
					);

					let ascendent = !($iconSort.getAttribute('ascendent') == 'true');

					$cell.classList.add('sorted');
					$iconSort.classList.toggle('asc', ascendent);
					$iconSort.classList.toggle('desc', !ascendent);
					$iconSort.setAttribute('ascendent', ascendent);

					table.sort(columnOptions.name, ascendent);
				});
			}

			if (table.options.resize) {
				if (columnOptions.resize != false)
					$cell.classList.add('resizable');
			}

			if (columnOptions.style)
				utils.setElementStyle($cell, columnOptions.style);
		}

		if (table.options.borders.cells)
			$cell.classList.add('cell-border-right');

		return $cell;
	}

	function checked(checked = true) {
		const $checkbox = $cell.querySelector('.dt-row-checkbox input');

		if ($checkbox)
			$checkbox.checked = checked;
	}

	function show(show = true) {
		_cell.isHidden = !show;
		columnOptions.hidden = _cell.isHidden;

		$cell.classList.toggle('visible', show);
		$cell.classList.toggle('hidden', !show);

		table._setBorders();
	}

	function disable(disabled = true) {
		_cell.isDisabled = disabled;
		$cell.dataset.disabled = disabled; // complementa style.scss

		Array.from($cell.children).forEach($child =>
			$child.classList.toggle('disabled', disabled)
		);
	}
}
