(() => {
  // src/shared/actions.ts
  var actions = {
    newFile: null,
    openFile: null,
    saveFile: null,
    closeWorkbook: null,
    showFileInfo: null,
    addTableRow: null,
    addTableRowGroup: null,
    moveSelectedRows: null,
    removeSelectedTableRows: null
  };
  var actions_default = actions;

  // src/shared/proxy.ts
  var proxy = {
    appData: null
  };
  var proxy_default = proxy;

  // src/shared/appData.ts
  var appData = {
    excelFileName: null,
    tempFilePath: null,
    srvConfig: null,
    srvFileName: null,
    srvFilePath: null,
    sheets: [],
    state: {
      creating: false,
      opening: false,
      opened: false,
      saved: true
    }
  };
  function setAppData(newAppData) {
    appData = newAppData;
  }

  // src/lib/html/html.js
  _setHtmlStyle();
  function html(templateString, ...expressions) {
    const TEMPLATESTRING = templateString;
    const EXPRESSIONS = expressions;
    let _component = createComponent();
    let _xPath;
    return _component;
    function reload() {
      const newComponent = createComponent();
      _component.replaceWith(newComponent);
      _component = newComponent;
      focus();
      return newComponent;
    }
    function createComponent() {
      const html2 = parseTemplateString();
      const component = createElement(html2);
      setComponent(component);
      return component;
    }
    function parseTemplateString() {
      const htmlParts = TEMPLATESTRING;
      const html2 = htmlParts.reduce((acc, cur, i) => {
        acc = _compressTemplateString(acc);
        cur = _compressTemplateString(cur);
        if (i == 0)
          return cur;
        const index = i - 1;
        const part = _compressTemplateString(htmlParts[index]);
        const eventRegex = /@[a-zA-Z0-9]*="$/;
        let expression = EXPRESSIONS[index];
        let isFunction = typeof expression == "function";
        if (_isElement(expression)) {
          expression = `<element>${index}</element>`;
        } else if (isFunction && (part.endsWith(">") || !eventRegex.test(part))) {
          isFunction = false;
          expression = `<function>${index}</function>`;
        }
        return (acc + (isFunction ? index : expression) + cur).replaceAll('readonly="true"', "readonly").replaceAll('readonly="false"', "").replaceAll('disabled="true"', "disabled").replaceAll('disabled="false"', "").replaceAll('selected="true"', "selected").replaceAll('selected="false"', "").replaceAll('checked="true"', "checked").replaceAll('checked="false"', "");
      }, "");
      return html2;
    }
    function createElement(html2) {
      const template = document.createElement("template");
      template.innerHTML = html2.trim();
      return template.content.firstElementChild;
    }
    function setComponent(element) {
      const elements = element.querySelectorAll("element, function");
      elements.forEach((element2) => {
        const index = element2.textContent;
        const expression = EXPRESSIONS[index];
        const result = typeof expression == "function" ? expression() : expression;
        const results = result instanceof Array ? result : [result];
        if (!results.length)
          results.push("");
        results.forEach((result2, index2) => {
          element2.before(result2);
          if (index2 == results.length - 1)
            element2.remove();
        });
      });
      set(element);
      Array.from(element.children).forEach((child) => {
        set(child);
        if (child.children.length)
          setComponent(child);
      });
      function set(element2) {
        setPublicProperties(element2);
        Array.from(element2.attributes).forEach((attr) => {
          const attrName = attr.name.toLowerCase();
          const expression = EXPRESSIONS[attr.value];
          if (attrName.startsWith("@on")) {
            const _attrName = attrName.substring(3);
            element2.addEventListener(_attrName, (event) => {
              _xPath = _getXPath(event.target);
              expression({ event, element: element2, reload });
            });
            element2.removeAttribute(attrName);
          }
          if (attrName == "@show") {
            let show = typeof expression == "function" ? expression() : attr.value == "true";
            element2.classList[show ? "remove" : "add"]("html-hidden");
            element2.removeAttribute(attrName);
          }
        });
      }
    }
    function setPublicProperties(element) {
      if (!element.reload)
        element.reload = reload;
    }
    function focus() {
      const element = _getElementByXPath(_xPath);
      if (!element) return;
      const tagName = element.tagName.toLowerCase();
      const type = element.type;
      if (element && !(tagName == "textarea" || type.match(/text|number|password|email|url|search|tel/))) element.focus();
    }
    function _isElement(any) {
      return any instanceof Element || any[0] instanceof Element;
    }
    function _compressTemplateString(text) {
      return typeof text == "string" ? text.replace(/\n|\t/g, "") : "";
    }
    function _getElementByXPath(xPath) {
      if (!xPath)
        return null;
      return document.evaluate(
        xPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    }
    function _getXPath(element) {
      if (!(element instanceof Element))
        return null;
      const parts = [];
      while (element && element.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = element.previousElementSibling;
        while (sibling) {
          if (sibling.nodeName === element.nodeName)
            index++;
          sibling = sibling.previousElementSibling;
        }
        const tagName = element.nodeName.toLowerCase();
        const part = `${tagName}[${index}]`;
        parts.unshift(part);
        element = element.parentNode;
      }
      return `/${parts.join("/")}`;
    }
  }
  function _setHtmlStyle() {
    if (document.querySelector("style#html-style"))
      return;
    document.querySelector("head").appendChild(html`
		<style id="html-style">
			.html-hidden {
				display: none;
			}

			.html-disabled {
				opacity: .6;
				-webkit-user-select: none;
				-moz-user-select: none;
				user-select: none;
				pointer-events: none;
			}
		</style>
	`);
  }

  // src/lib/Menu/Menu.js
  var __itemDefaultOptions = {
    icon: null,
    // HTMLElement (opcional)
    id: null,
    // string (opcional)
    name: null,
    // string
    description: null,
    // string (opcional)
    hidden: false,
    // boolean (opcional)
    onClick: null,
    // function
    divider: false,
    // boolean
    // Funções geradas do item
    getIcon: null,
    // function
    setIcon: null,
    // function
    show: null,
    // function
    hide: null
    // function
  };
  var __menuDefaultOptions = {
    trigger: null,
    // HTMLElement - Ex.: button | a | div
    items: [],
    // __itemDefaultOptions[]
    position: "left",
    // 'left' | 'right' | 'top left' | 'top right'
    top: 0,
    // Ajuste de posição vertical (opcional)
    left: 0,
    // Ajuste de posição horizontal (opcional)
    maxHeight: null,
    // Altura máxima (px) do menu (opcional)
    onShow: null,
    onHide: null
  };
  var __menu;
  window.addEventListener("resize", (event) => {
    if (!__menu) return;
    destroy(__menu);
  });
  function Menu(menuDefaultOptions) {
    menuDefaultOptions = {
      ...__menuDefaultOptions,
      ...menuDefaultOptions
    };
    let $menu;
    let _classVisible = "";
    let _classInvisible = "";
    const _context = {
      options: menuDefaultOptions,
      element: null,
      show,
      hide
    };
    return _context;
    function create2() {
      menuDefaultOptions.items.forEach((item) => {
        item = {
          ...__itemDefaultOptions,
          ...item
        };
      });
      const $menu2 = document.createElement("div");
      $menu2.className = "ctx-menu";
      $menu2.innerHTML = /*html*/
      `${menuDefaultOptions.items.map((item) => {
        if (item.divider) {
          return (
            /*html*/
            `<div class="ctx-divider"></div>`
          );
        } else {
          return (
            /*html*/
            `
					<div class="ctx-item" name="${item.name}">
						<div class="ctx-icon"></div>
						<div class="ctx-text">
							<div class="ctx-name">${item.name}</div>
							<div class="ctx-description">${item.description || ""}</div>
						</div>
					</div>
				`
          );
        }
      }).join("")}`;
      if (menuDefaultOptions.maxHeight) {
        let unit = typeof menuDefaultOptions.maxHeight == "number" ? "px" : "";
        $menu2.style.maxHeight = menuDefaultOptions.maxHeight + unit;
      }
      $menu2.querySelectorAll(":scope > div").forEach(($item, index) => {
        const item = menuDefaultOptions.items[index];
        const $icon = $item.querySelector(".ctx-icon");
        item.element = $item;
        $item.data = item;
        item.getIcon = () => $icon;
        item.setIcon = (stringOrElement) => setIcon($icon, stringOrElement);
        item.show = (show2 = true) => $item.classList[show2 ? "remove" : "add"]("hidden");
        item.hide = (hide2 = true) => item.show(!hide2);
        if (item.hidden)
          item.hide();
        if (!item.divider) {
          setIcon($icon, item.icon);
          $item.addEventListener("click", (event) => {
            hide();
            if (item.onClick)
              item.onClick(event);
          });
        }
      });
      _context.element = $menu2;
      document.body.appendChild($menu2);
      return $menu2;
    }
    function setIcon($icon, stringOrElement) {
      if (typeof stringOrElement == "undefined" || stringOrElement == null) {
        $icon.classList.add("hidden");
        return;
      }
      $icon.innerHTML = "";
      if (typeof stringOrElement == "string")
        $icon.innerHTML = stringOrElement;
      else if (stringOrElement instanceof HTMLElement)
        $icon.appendChild(stringOrElement);
    }
    function show(options = {}) {
      destroy($menu);
      options = {
        ...menuDefaultOptions,
        ...options
      };
      let x = options.x || 0;
      let y = options.y || 0;
      $menu = create2();
      _classVisible = "ctx-menu-visible-left";
      _classInvisible = "ctx-menu-invisible-left";
      setTimeout(() => {
        if (options.trigger) {
          const trigger = options.trigger;
          x = trigger.offsetLeft;
          y = trigger.offsetTop + trigger.offsetHeight + 1;
          if (options.position.includes("top")) {
            y = trigger.offsetTop - $menu.offsetHeight - 1;
          }
          if (options.position.includes("right")) {
            x = x - $menu.offsetWidth + trigger.offsetWidth - 1;
          }
        }
        if (x + $menu.offsetWidth > window.innerWidth) {
          x = x - $menu.offsetWidth;
          _classVisible = "ctx-menu-visible-right";
          _classInvisible = "ctx-menu-invisible-right";
        }
        if (y + $menu.offsetHeight - window.innerHeight > 0)
          y = window.innerHeight - $menu.offsetHeight;
        $menu.className = "ctx-menu";
        $menu.classList.add(_classVisible);
        $menu.style.left = options.left + x + "px";
        $menu.style.top = options.top + y + "px";
        if (options.onShow)
          options.onShow(_context);
      });
      __menu = $menu;
      window.addEventListener("click", hide);
      window.addEventListener("keyup", hide);
    }
    function hide(event) {
      if (!$menu) return;
      if (event) {
        if (!(!event.target.closest(".ctx-menu") || event.key == "Escape")) return;
      }
      $menu.classList.remove(_classVisible);
      $menu.classList.add(_classInvisible);
      if (menuDefaultOptions.onHide)
        menuDefaultOptions.onHide(_context);
      setTimeout(() => destroy($menu), 200);
      window.removeEventListener("click", hide);
      window.removeEventListener("keyup", hide);
    }
  }
  function destroy($menu) {
    if (!$menu) return;
    $menu.remove();
    $menu = null;
  }

  // src/components/Menubar.ts
  var menubar = [
    {
      title: "Arquivo",
      items: [
        { name: "Novo" },
        { name: "Abrir" },
        { name: "Salvar" },
        { name: "Salvar Como" },
        { divider: true },
        { name: "Enviar por E-mail" },
        { divider: true },
        { name: "Abrir Local do Arquivo" },
        { divider: true },
        { name: "Sair" }
      ]
    },
    {
      title: "Exibir",
      items: [
        { name: "Informa\xE7\xF5es do Arquivo", hidden: true },
        { divider: true, hidden: true },
        { name: "Atualizar janela" }
      ]
    },
    {
      title: "Ferramentas",
      items: [
        { name: "Carregar Dados nas Planilhas" },
        { name: "Limpar Dados das Planilhas" },
        { divider: true },
        { name: "Enviar por E-mail" },
        { divider: true },
        { name: "Visualizar no Dispositivo M\xF3vel" }
      ]
    },
    {
      title: "Ajuda",
      items: [
        { name: "Ajuda" },
        { name: "Sobre" }
      ]
    }
  ];
  var menu = Menu({
    items: [],
    position: "bottom left",
    onShow: (menu2) => {
      menu2.options.items.forEach((item) => {
        const $item = item.element;
        if ($item && !item.divider) {
          $item.classList.add("!min-h-[2.5rem]");
          if (item.name.startsWith("Informa\xE7\xF5es")) {
            item.show(!!appData.srvConfig.info.createdAt);
          }
        }
      });
    }
  });
  function Menubar() {
    return html`
		<div class="flex gap-0.5">${() => menubar.map(
      (item) => html`
					<button type="button" class="button h-10 px-2.5" @onClick="${(e) => {
        e.event.stopPropagation();
        menu.options.items = item.items;
        menu.show({ trigger: e.element.closest("button") });
      }}">
						<span class="pb-[1px]">${item.title}</span>
					</button>
				`
    )}
		</div>
	`;
  }

  // src/components/Buttons.ts
  function Buttons(buttons, options = { width: 10 }) {
    return html`
		<div class="Buttons flex items-center gap-2">
			${() => buttons.filter((x) => !x.hidden).map((button) => {
      if (button.divider) {
        return html`<div class="divider h-5.5"></div>`;
      } else {
        return html`<button type="button" class="button w-${options.width} h-10" title="${button.title || ""}" @onClick="${(e) => button.onClick(e)}">
						${button.icon || ""}
						${button.name || ""}
					</button>`;
      }
    })}
		</div>
	`;
  }

  // src/lib/Utils/Utils.js
  var utils = Utils();
  var Utils_default = utils;
  function Utils() {
    return {
      generateUUID,
      form,
      pause,
      observe,
      css
    };
    function generateUUID() {
      return crypto.randomUUID();
    }
    function form() {
      return {
        field
      };
      function field() {
        return {
          autoHeight
        };
        function autoHeight(textarea) {
          textarea.style.height = "auto";
          textarea.style.height = textarea.scrollHeight + "px";
        }
      }
    }
    function pause(time = 1e3) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    function observe(obj, { onChange, onDelete = null }) {
      if (typeof obj !== "object" || obj === null)
        return obj;
      return new Proxy(obj, {
        get(target, prop, receiver) {
          const value = Reflect.get(target, prop, receiver);
          return typeof value === "object" && value !== null ? observe(value, { onChange, onDelete }) : value;
        },
        set(target, prop, value, receiver) {
          const old = target[prop];
          const success = Reflect.set(target, prop, value, receiver);
          if (success && old !== value && onChange) {
            onChange({ target, prop, value });
          }
          return success;
        },
        deleteProperty(target, prop) {
          const success = Reflect.deleteProperty(target, prop);
          if (success && onDelete) {
            onDelete({ target, prop });
          }
          return success;
        }
      });
    }
    function css(element, style = {}) {
      const pxProps = /* @__PURE__ */ new Set([
        "borderBottomLeftRadius",
        "borderBottomRightRadius",
        "borderBottomWidth",
        "borderLeftWidth",
        "borderRadius",
        "borderRightWidth",
        "borderTopLeftRadius",
        "borderTopRightRadius",
        "borderTopWidth",
        "borderWidth",
        "bottom",
        "columnGap",
        "fontSize",
        "gap",
        "height",
        "left",
        "letterSpacing",
        "lineHeight",
        "margin",
        "marginBottom",
        "marginLeft",
        "marginRight",
        "marginTop",
        "maxHeight",
        "maxWidth",
        "minHeight",
        "minWidth",
        "outlineWidth",
        "padding",
        "paddingBottom",
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "right",
        "rowGap",
        "top",
        "translateX",
        "translateY",
        "translateZ",
        "width"
      ]);
      const processedStyle = {};
      for (const [prop, value] of Object.entries(style)) {
        if (pxProps.has(prop) && typeof value == "number") {
          processedStyle[prop] = `${value}px`;
        } else {
          processedStyle[prop] = value;
        }
      }
      Object.assign(element.style, processedStyle);
    }
  }

  // src/lib/DataTable/src/utils.js
  var utils2 = new Utils2();
  function Utils2() {
    this.generateGuid = generateGuid;
    this.mergeProps = mergeProps;
    this.getElementIndex = getElementIndex;
    this.createRangeArray = createRangeArray;
    this.isArrayOfHTMLElement = isArrayOfHTMLElement;
    this.parseDimension = parseDimension;
    this.setElementAttr = setElementAttr;
    this.setElementStyle = setElementStyle;
    function generateGuid() {
      const guid = ("1000000-1000-4000-8000" + -1e11).replace(
        /[018]/g,
        (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
      return "a" + guid;
    }
    function mergeProps(target, source) {
      const merged = { ...target };
      for (const key in source) {
        if (source[key] instanceof Object && !(source[key] instanceof Array) && !(source[key] instanceof Function) && !(source[key] instanceof HTMLElement)) {
          merged[key] = mergeProps(target[key] || {}, source[key]);
        } else {
          merged[key] = source[key];
        }
      }
      return merged;
    }
    function getElementIndex($element) {
      const children = Array.from($element.parentElement.children);
      return children.indexOf($element);
    }
    function createRangeArray(startNumber, endNumber) {
      const isAscending = startNumber <= endNumber;
      return Array.from(
        { length: Math.abs(endNumber - startNumber) + 1 },
        (_, index) => isAscending ? startNumber + index : startNumber - index
      );
    }
    function isArrayOfHTMLElement(obj) {
      if (Array.isArray(obj))
        return obj.every((item) => item instanceof HTMLElement);
      return false;
    }
    function parseDimension(value) {
      return typeof value == "number" ? `${value}px` : value || "";
    }
    function setElementStyle(elements, attributes = {}) {
      setElementAttr(elements, attributes, "style");
    }
    function setElementAttr(elements, attributes = {}, objectName = "") {
      elements = elements instanceof Array ? elements : [elements];
      elements.forEach((x) => {
        for (const key in attributes) {
          let node = objectName ? x[objectName] : x;
          let value = attributes[key];
          if (objectName == "style") {
            let important = "";
            if (!key.match(/index|line|grid|order|tab|orphans|widows|columns|counter|opacity/i))
              value = typeof value == "number" ? value + "px" : value;
            if (value.match(/important/i)) {
              value = value.substring(0, value.indexOf("!") - 1).trim();
              important = "important";
            }
            if (important)
              node.setProperty(key, value, important);
            else
              node[key] = value;
          } else {
            typeof node[key] == "undefined" ? node.setAttribute(key, value) : node[key] = value;
          }
        }
      });
    }
  }

  // src/lib/DataTable/src/constants.js
  var TableOptions = class {
    id = null;
    // string
    data = [];
    /* [
    	{ fieldName1: value, fieldName2: value },
    	{ fieldName2: value, fieldName2: value },
    	..
    ] */
    place = null;
    // HTMLElement
    header = {
      hidden: false,
      // boolean
      disabled: false
      // boolean
    };
    columns = null;
    /* {
    	fieldName1: ColumnOptions,
    	fieldName2: ColumnOptions,
    	..
    } */
    rows = {
      selectOnClick: false,
      // boolean
      allowMultipleSelection: true
      // boolean
    };
    cells = null;
    /* {
    	fieldName1: {
    		display: ({ item, value }) => { return.. },
    		style: object,
    	},
    	fieldName2: {
    		display: ({ item, value }) => { return.. },
    		style: object,
    	}
    	..
    } */
    borders = {
      table: {
        top: false,
        // boolean
        bottom: false,
        // boolean
        all: false,
        // boolean
        radius: null
        // px
      },
      rows: true,
      // boolean
      cells: false
      // boolean
    };
    footer = {
      hidden: false,
      // boolean
      disabled: false,
      // boolean
      content: null
      // HTMLElement | string
    };
    width = null;
    // number
    height = null;
    // number
    style = null;
    // object: ex.: { color: red, 'min-width': 150 }
    checkbox = false;
    // boolean
    sort = false;
    // boolean
    resize = false;
    // boolean
    disabled = false;
    // boolean
    onAddRow = null;
    // function
    onSelectRows = null;
    // function
    onUnselectRows = null;
    // function
    onUpdateRow = null;
    // function
    onRemoveRows = null;
    // function
    onDoubleClickRow = null;
    // function
    onResizeColumn = null;
    // function
    onClickOut = null;
    // function
    onCopyClip = null;
    // function
    onScroll = null;
    // ! REMOVER EVENTO
    onScrollEnd = null;
    // function
  };
  var ColumnOptions = class {
    // private
    checkbox = false;
    // boolean
    // public
    name = null;
    // string
    displayName = null;
    // string
    width = null;
    // number | string
    minWidth = null;
    // number | string
    resize = true;
    // boolean
    hidden = false;
    // boolean
    disabled = false;
    // boolean
    style = null;
    // object: ex.: { color: red, 'min-width': 150 }
  };
  var CellOptions = class {
    // private
    row = null;
    // Row
    checkbox = false;
    // boolean
    data = null;
    // object
    value = null;
    // any
    // public
    name = null;
    // string
    hidden = false;
    // boolean
    disabled = false;
    // boolean
    display = null;
    // function
    style = null;
    // object: ex.: { color: red, 'min-width': 150 }
  };

  // src/lib/DataTable/src/components/Column.js
  function Column(table, options) {
    const $cell = create2();
    const _cell = {
      element: $cell,
      isHidden: options.hidden,
      isDisabled: options.disabled,
      options,
      show,
      checked,
      disable
    };
    show(!options.hidden);
    disable(options.disabled);
    return _cell;
    function create2() {
      const $cell2 = document.createElement("div");
      $cell2.classList.add("dt-header-cell");
      if (options.checkbox) {
        $cell2.classList.add("checkbox");
        $cell2.insertAdjacentHTML(
          "afterbegin",
          /*html*/
          `
				<label class="dt-row-checkbox">
					<input type="checkbox" />
				</label>
			`
        );
        const $checkbox = $cell2.querySelector("label");
        $checkbox.addEventListener("change", (event) => {
          event.target.checked ? table.selectRows() : table.unselectRows(event);
        });
      } else {
        $cell2.dataset.name = options.name;
        $cell2.insertAdjacentHTML(
          "afterbegin",
          /*html*/
          `
				<label class="name" title="${options.title || ""}">
					${options.displayName}
				</label>
				<span class="controls">
					<i class="sort asc" title="Sort"></i>
					<div class="resizer"></div>
				</span>
			`
        );
        const $iconSort = $cell2.querySelector(".sort");
        if (table.options.sort && options.sort != false) {
          $cell2.classList.add("sortable");
          $cell2.addEventListener("click", () => {
            if (table.header.isDisabled || _cell.isDisabled)
              return;
            table.header.cells.forEach(
              (cell) => cell.element.classList.remove("sorted")
            );
            let ascendent = !($iconSort.getAttribute("ascendent") == "true");
            $cell2.classList.add("sorted");
            $iconSort.classList.toggle("asc", ascendent);
            $iconSort.classList.toggle("desc", !ascendent);
            $iconSort.setAttribute("ascendent", ascendent);
            table.sort(options.name, ascendent);
          });
        }
        if (table.options.resize) {
          if (options.resize != false)
            $cell2.classList.add("resizable");
        }
        if (options.style)
          utils2.setElementStyle($cell2, options.style);
      }
      if (table.options.borders.cells)
        $cell2.classList.add("cell-border-right");
      return $cell2;
    }
    function checked(checked2 = true) {
      const $checkbox = $cell.querySelector(".dt-row-checkbox input");
      if ($checkbox)
        $checkbox.checked = checked2;
    }
    function show(show2 = true) {
      _cell.isHidden = !show2;
      options.hidden = _cell.isHidden;
      $cell.classList.toggle("visible", show2);
      $cell.classList.toggle("hidden", !show2);
      table._setBorders();
    }
    function disable(disabled = true) {
      _cell.isDisabled = disabled;
      $cell.dataset.disabled = disabled;
      Array.from($cell.children).forEach(
        ($child) => $child.classList.toggle("disabled", disabled)
      );
    }
  }

  // src/lib/DataTable/src/components/Header.js
  function Header(table) {
    const _header = {
      element: null,
      cells: [],
      isHidden: false,
      isDisabled: false,
      cell,
      show,
      disable
    };
    const $header = create2();
    return _header;
    function create2() {
      const $header2 = document.createElement("div");
      $header2.classList.add("dt-header");
      if (table.options.checkbox) {
        const options = new ColumnOptions();
        options.checkbox = true;
        options.resize = false;
        const cell2 = Column(table, options);
        _header.cells.push(cell2);
        $header2.appendChild(cell2.element);
      }
      for (const name in table.options.columns) {
        const column = table.options.columns[name];
        const options = utils2.mergeProps(new ColumnOptions(), column);
        options.name = name;
        const cell2 = Column(table, options);
        _header.cells.push(cell2);
        $header2.appendChild(cell2.element);
      }
      _header.element = $header2;
      return $header2;
    }
    function cell(nameOrIndex) {
      const cell2 = typeof nameOrIndex == "number" ? _header.cells[nameOrIndex] : _header.cells.find((cell3) => cell3.options.name == nameOrIndex);
      return cell2;
    }
    function show(show2 = true) {
      _header.isHidden = !show2;
      $header.classList.toggle("hidden", !show2);
    }
    function disable(disabled = true) {
      _header.isDisabled = disabled;
      Array.from($header.children).forEach(($child) => {
        $child.classList.toggle("disabled", disabled);
      });
    }
  }

  // src/lib/DataTable/src/components/Cell.js
  function Cell(table, options) {
    const $cell = create2();
    const _cell = {
      element: $cell,
      isHidden: options.hidden,
      isDisabled: options.disabled,
      options,
      value,
      display,
      checked,
      show,
      showContent,
      disable
    };
    show(!options.hidden);
    showContent(!options.hidden);
    display(value());
    return _cell;
    function create2() {
      const $cell2 = document.createElement("div");
      $cell2.classList.add("dt-body-row-cell");
      if (options.checkbox) {
        $cell2.classList.add("checkbox");
        $cell2.insertAdjacentHTML(
          "afterbegin",
          /*html*/
          `
				<label class="dt-row-checkbox">
					<input type="checkbox"/>
				</label>
			`
        );
        const $checkbox = $cell2.querySelector("label");
        $checkbox.addEventListener("click", (event) => event.stopPropagation());
        $checkbox.addEventListener("change", (event) => {
          table.header.cells[0].checked(false);
          options.row.select(event.target.checked, event);
        });
      } else {
        const value2 = options.value != void 0 ? options.value : "";
        const cell = table.options.cells ? table.options.cells[options.name] || {} : {};
        $cell2.dataset.name = options.name;
        $cell2.insertAdjacentHTML(
          "afterbegin",
          /*html*/
          `
				<div class="value-hidden">${value2}</div>
				<div class="value-display">${value2}</div>
			`
        );
        if (cell.style)
          utils2.setElementStyle($cell2, cell.style);
      }
      if (table.options.borders.cells)
        $cell2.classList.add("cell-border-right");
      if (table.options.borders.rows)
        $cell2.classList.add("cell-border-bottom");
      return $cell2;
    }
    function value(value2, _display = true) {
      const $value = $cell.querySelector(".value-hidden");
      if (!$value)
        return;
      if (value2 != void 0) {
        options.data[options.name] = value2;
        $value.textContent = value2;
        if (_display)
          display(value2);
      } else {
        value2 = options.value != void 0 ? options.value : $value.textContent;
        return value2;
      }
    }
    function display(value2) {
      const $display = $cell.querySelector(".value-display");
      const cell = table.options.cells ? table.options.cells[options.name] || {} : {};
      if (cell.display) {
        const result = cell.display({
          row: options.row,
          item: options.data,
          value: value2
        });
        $display.innerHTML = "";
        if (result instanceof HTMLElement) {
          $display.appendChild(result);
        } else if (utils2.isArrayOfHTMLElement(result)) {
          result.forEach((x) => $display.appendChild(x));
        } else {
          $display.innerHTML = result;
        }
      } else {
        if ($display)
          $display.innerHTML = value2;
      }
    }
    function show(show2 = true) {
      _cell.isHidden = !show2;
      $cell.classList.toggle("visible", show2);
      $cell.classList.toggle("hidden", !show2);
    }
    function showContent(show2 = true) {
      _cell.isHidden = !show2;
      Array.from($cell.children).forEach(($child) => {
        $child.classList.toggle("hidden", !show2);
      });
    }
    function checked(checked2 = true) {
      const $checkbox = $cell.querySelector(".dt-row-checkbox input");
      if ($checkbox)
        $checkbox.checked = checked2;
    }
    function disable(disabled = true) {
      _cell.isDisabled = disabled;
      Array.from($cell.children).forEach(($child) => {
        $child.classList.toggle("disabled", disabled);
      });
    }
  }

  // src/lib/DataTable/src/components/Row.js
  function Row(table, options) {
    const _row = {
      element: null,
      id: utils2.generateGuid(),
      cells: [],
      isSelected: false,
      isHidden: false,
      isDisabled: false,
      _data: options.data || {},
      // interno
      data,
      cell,
      index,
      show,
      disable,
      select,
      text,
      remove: remove2
    };
    const $row = create2();
    _loadCells();
    return _row;
    function create2() {
      const $row2 = document.createElement("div");
      $row2.id = _row.id;
      $row2.classList.add("dt-body-row");
      $row2.addEventListener("click", (event) => {
        if (!table.options.checkbox && table.options.rows.selectOnClick)
          select(true, event);
      });
      $row2.addEventListener("dblclick", (event) => {
        if (event.target.tagName == "INPUT" || event.target.tagName == "TEXTAREA") return;
        if (!table.options.rows.selectOnClick)
          return;
        if (window.getSelection)
          window.getSelection().removeAllRanges();
        if (table.options.onDoubleClickRow)
          table.options.onDoubleClickRow({ row: _row, event });
      });
      $row2.classList.toggle("selectable", table.options.rows.selectOnClick);
      _row.element = $row2;
      return $row2;
    }
    function _loadCells() {
      if (table.options.checkbox) {
        const options2 = new CellOptions();
        options2.row = _row;
        options2.checkbox = true;
        options2.resize = false;
        const cell2 = Cell(table, options2);
        _row.cells.push(cell2);
        $row.appendChild(cell2.element);
      }
      for (const name in table.options.columns) {
        const column = table.options.columns[name];
        const options2 = utils2.mergeProps(new CellOptions(), column);
        options2.row = _row;
        options2.name = name;
        options2.data = _row._data;
        options2.value = _row._data[name];
        const cell2 = Cell(table, options2);
        _row.cells.push(cell2);
        $row.appendChild(cell2.element);
      }
    }
    function cell(nameOrIndex) {
      const cell2 = typeof nameOrIndex == "number" ? _row.cells[nameOrIndex] : _row.cells.find((cell3) => cell3.options.name == nameOrIndex);
      return cell2;
    }
    function index() {
      return utils2.getElementIndex($row);
    }
    function show(show2 = true) {
      _row.isHidden = !show2;
      $row.classList.toggle("hidden", !show2);
    }
    function disable(disabled = true) {
      _row.isDisabled = disabled;
      $row.classList.toggle("disabled", disabled);
    }
    function select(selected = true, event) {
      if (event && event.shiftKey && window.getSelection)
        window.getSelection().removeAllRanges();
      if (table.options.checkbox) {
        _row.isSelected = selected;
        if (table.options.onSelectRows)
          table.options.onSelectRows({ rows: table.selectedRows() });
      } else {
        if (!table.options.rows.allowMultipleSelection || !event || !event.ctrlKey && !event.shiftKey) {
          table.unselectRows(event, false);
          table._lastRowSelected = null;
        }
        if (event && event.ctrlKey) {
          selected = !_row.isSelected;
        }
        if (event && event.shiftKey && table._lastRowSelected) {
          let indexes = utils2.createRangeArray(utils2.getElementIndex(table._lastRowSelected), utils2.getElementIndex($row));
          table.selectRows(indexes);
        }
        _row.isSelected = selected;
        if (!event || !event.shiftKey)
          table._lastRowSelected = $row;
        $row.classList.toggle("selected", selected);
        if (table.options.onSelectRows)
          table.options.onSelectRows({ rows: table.selectedRows() });
      }
    }
    function data(fields, meta = false) {
      if (fields) {
        for (const name in fields) {
          let value = fields[name];
          let cell2 = _row.cell(name);
          cell2.value(value);
        }
        if (table.options.onUpdateRow)
          table.options.onUpdateRow({ row: _row, fields });
      } else {
        if (!meta)
          return (({ meta: meta2, ...data2 }) => data2)(_row._data);
        return _row._data;
      }
    }
    function text(fieldNames) {
      let cells = fieldNames ? _row.cells.filter((x) => !!fieldNames.find((name) => name == x.options.name)) : _row.cells;
      let text2 = [];
      cells.forEach(
        (cell2) => text2.push(cell2.element.querySelector(".value-display").innerText.trim())
      );
      return text2;
    }
    function remove2() {
      table.removeRows(_row);
    }
  }

  // src/lib/DataTable/src/components/Footer.js
  function Footer(table) {
    const $footer = create2();
    const _footer = {
      element: $footer,
      isHidden: table.options.footer.hidden,
      isDisabled: table.options.footer.disabled,
      show,
      disable,
      content
    };
    content(table.options.footer.content);
    show(!_footer.isHidden);
    disable(_footer.isDisabled);
    return _footer;
    function create2() {
      const $footer2 = document.createElement("div");
      $footer2.classList.add("dt-footer");
      return $footer2;
    }
    function content(content2) {
      if (!content2) return;
      if (typeof content2 == "string") {
        $footer.innerHTML = content2;
      } else if (content2 instanceof HTMLElement) {
        $footer.appendChild(content2);
      }
    }
    function show(show2 = true) {
      _footer.isHidden = !show2;
      $footer.classList.toggle("hidden", !show2);
    }
    function disable(disabled = true) {
      _footer.isDisabled = disabled;
      $footer.classList.toggle("disabled", disabled);
    }
  }

  // src/lib/DataTable/src/components/Table.js
  function Table(options) {
    const _table = {
      options,
      id: options.id || utils2.generateGuid(),
      element: null,
      elements: {
        scrollable: null
      },
      header: null,
      body: {
        element: null
      },
      _columnWidths: null,
      rows: [],
      _lastRowSelected: null,
      footer: null,
      isDisabled: false,
      _data: options.data || [],
      data,
      append,
      load,
      reload,
      width,
      height,
      column,
      addRow,
      selectedRows,
      selectRows,
      unselectRows,
      rowsByFieldValue,
      moveSelectedRows: moveSelectedRows2,
      removeRows,
      removeSelectedRows,
      removeUnselectedRows,
      sort,
      disable,
      clear,
      export: _export,
      _setBorders
    };
    const $table = create2();
    const key_storedWidths = `${_table.id}-widths`;
    createHeader();
    createBody();
    createFooter();
    width(options.width);
    height(options.height);
    disable(options.disabled);
    load(options.data);
    return _table;
    function create2() {
      const $table2 = document.createElement("div");
      $table2.id = _table.id;
      $table2.classList.add("dt");
      const $scrollable = document.createElement("div");
      $scrollable.classList.add("scrollable");
      $table2.appendChild($scrollable);
      $scrollable.addEventListener("scroll", (event) => {
        let element = event.target;
        let atBottom = Math.ceil(element.scrollTop + element.clientHeight) >= element.scrollHeight - 1;
        if (atBottom && !element.alreadyAtBottom) {
          element.alreadyAtBottom = true;
          if (options.onScrollEnd)
            options.onScrollEnd({ event, end: true });
        } else if (!atBottom) {
          element.alreadyAtBottom = false;
        }
      });
      if (options.borders.table.all) {
        $table2.classList.add("table-border-all");
        if (options.borders.table.radius != null) {
          let radius = options.borders.table.radius;
          $table2.style.borderRadius = utils2.parseDimension(radius);
          $scrollable.style.borderRadius = utils2.parseDimension(radius);
        }
      } else {
        if (options.borders.table.top)
          $table2.classList.add("table-border-top");
        if (options.borders.table.bottom)
          $table2.classList.add("table-border-bottom");
      }
      if (options.style)
        utils2.setElementStyle($table2, options.style);
      _table.element = $table2;
      _table.elements.scrollable = $scrollable;
      return $table2;
    }
    function createHeader() {
      const header = Header(_table);
      _table.header = header;
      $table.querySelector(".scrollable").appendChild(header.element);
      header.show(!options.header.hidden);
      header.disable(options.header.disabled);
    }
    function createBody() {
      const $body = document.createElement("div");
      $body.classList.add("dt-body");
      _table.body.element = $body;
      $table.querySelector(".scrollable").appendChild($body);
    }
    function createFooter() {
      if (options.footer) {
        const footer = Footer(_table);
        _table.footer = footer;
        $table.appendChild(footer.element);
      }
    }
    function column(nameOrIndex) {
      return {
        show,
        disable: disable2
      };
      function show(show2 = true) {
        _table.header.cell(nameOrIndex).show(show2);
        _table.rows.forEach((row) => row.cell(nameOrIndex).show(show2));
        _setColumnWidths();
      }
      function disable2(disabled = true) {
        _table.header.cell(nameOrIndex).disable(disabled);
        _table.rows.forEach((row) => row.cell(nameOrIndex).disable(disabled));
      }
    }
    function width(width2) {
      if (width2 == void 0)
        return $table.clientWidth;
      $table.style.width = utils2.parseDimension(width2) || "auto";
    }
    function height(height2) {
      if (height2 == void 0)
        return $table.clientHeight;
      $table.style.height = utils2.parseDimension(height2) || "auto";
    }
    function data(data2, meta = false) {
      data2 = data2 || _table._data;
      if (data2.length) {
        for (const columnName in options.columns) {
          data2.forEach((item) => {
            if (!item.hasOwnProperty(columnName))
              item[columnName] = "";
          });
        }
      }
      _table._data = data2;
      if (!meta)
        return _table._data.map(({ meta: meta2, ...item }) => item);
      return _table._data;
    }
    function load(_data) {
      clear(!!_data);
      data(_data, true).forEach(
        (item) => addRow(item, false, false)
      );
      _setColumnWidths();
      _setColumnResizable();
      _setBorders();
      _table.elements.scrollable.scrollTop = 0;
    }
    function append(_data) {
      data([..._table._data, ..._data], true);
      _data.forEach(
        (item) => addRow(item, false, false)
      );
      _setBorders();
    }
    function reload() {
      load();
    }
    function clear(clearData = true) {
      if (clearData)
        data([]);
      _table.rows = [];
      _table.body.element.innerHTML = "";
      _table.header.cells[0].checked(false);
    }
    function addRow(data2, insert = true, setBorders = true) {
      const row = Row(_table, { data: data2 });
      _table.rows.push(row);
      _table.body.element.appendChild(row.element);
      data2.meta = {
        row: {
          id: row.id
        }
      };
      if (insert)
        _table._data.push(data2);
      if (setBorders)
        _setBorders();
      if (options.onAddRow)
        options.onAddRow({ row });
      return row;
    }
    function selectedRows() {
      return _table.rows.filter((x) => x.isSelected);
    }
    function rowsByFieldValue(fieldName, value) {
      if (fieldName == void 0 || value == void 0)
        return;
      return _table.rows.filter(
        (row) => row._data[fieldName] == value
      );
    }
    function selectRows(indexes) {
      if (indexes)
        indexes = indexes instanceof Array ? indexes : [indexes];
      _table.rows.forEach((row) => {
        let selected = false;
        if (indexes) {
          for (let i = 0; i < indexes.length; i++) {
            if (utils2.getElementIndex(row.element) == indexes[i]) {
              selected = true;
              break;
            }
          }
        } else {
          selected = true;
        }
        row.isSelected = selected;
        if (options.checkbox) {
          row.cells[0].checked(selected);
        } else {
          row.element.classList.toggle("selected", selected);
        }
      });
      if (options.checkbox)
        _table.header.cells[0].checked();
      if (options.onSelectRows)
        options.onSelectRows({ rows: selectedRows() });
    }
    function unselectRows(event, callback = true) {
      _table.header.cells[0].checked(false);
      selectedRows().forEach((row) => {
        row.isSelected = false;
        row.element.classList.remove("selected");
        row.cells[0].checked(false);
      });
      if (options.onUnselectRows && callback)
        options.onUnselectRows({ event });
    }
    function moveSelectedRows2(down = true) {
      if (options.sort) return;
      if (down) {
        for (let i = _table.rows.length - 1; i >= 0; i--) {
          let fromIndex = i;
          let toIndex = i + 1;
          if (_table.rows[i].isSelected) {
            if (toIndex < _table.rows.length)
              changePosition(fromIndex, toIndex);
            else
              break;
          }
        }
      } else {
        for (let i = 0; i < _table.rows.length; i++) {
          let fromIndex = i;
          let toIndex = i - 1;
          if (_table.rows[i].isSelected) {
            if (toIndex >= 0)
              changePosition(fromIndex, toIndex);
            else
              break;
          }
        }
      }
      _table.rows.forEach((row) => _table.body.element.appendChild(row.element));
      function changePosition(fromIndex, toIndex) {
        const row = _table.rows.splice(fromIndex, 1)[0];
        const item = _table._data.splice(fromIndex, 1)[0];
        _table.rows.splice(toIndex, 0, row);
        _table._data.splice(toIndex, 0, item);
      }
    }
    function removeRows(rows) {
      rows = rows instanceof Array ? rows : [rows];
      if (!rows.length)
        return;
      rows.forEach((row) => {
        _table.rows.forEach((_row, index) => {
          if (_row.id == row.id)
            _table.rows.splice(index, 1);
        });
        _table._data.forEach((item, index) => {
          if (item.meta.row.id == row.id)
            _table._data.splice(index, 1);
        });
        row.element.remove();
      });
      if (options.onRemoveRows)
        options.onRemoveRows();
    }
    function removeSelectedRows() {
      removeRows(selectedRows());
      _table.header.cells[0].checked(false);
    }
    function removeUnselectedRows() {
      removeRows(_table.rows.filter((row) => !row.isSelected));
    }
    function sort(fieldName, ascending = true) {
      _table.rows.sort((a, b) => {
        let va = a.cell(fieldName).value();
        let vb = b.cell(fieldName).value();
        if (typeof va == "string") {
          va = String(va).toLowerCase();
          vb = String(vb).toLowerCase();
        }
        if (va < vb)
          return ascending ? -1 : 1;
        if (va > vb)
          return ascending ? 1 : -1;
        return 0;
      });
      _table.rows.forEach((row) => _table.body.element.appendChild(row.element));
    }
    function disable(disabled = true) {
      _table.isDisabled = disabled;
      $table.classList.toggle("disabled", disabled);
    }
    function _export(rows, options2 = { separator: "	" }) {
      let text = (rows || _table.selectedRows()).map((row) => {
        let fieldNames = row.cells.filter((x) => !x.checkbox && !x.isHidden).map((x) => x.options.name);
        return row.text(fieldNames).join(options2.separator);
      }).join("\n");
      return text;
    }
    function _setColumnWidths() {
      let widths = _table._columnWidths;
      if (!widths) {
        widths = [];
        if (options.checkbox)
          widths.push("34px");
        for (let name in options.columns) {
          let column2 = options.columns[name];
          if (column2.hidden)
            continue;
          let width2 = column2.width;
          let minWidth = column2.minWidth;
          let minMaxWidth;
          if (!width2 && !minWidth) {
            minMaxWidth = "1fr";
          } else if (width2 == minWidth) {
            minMaxWidth = width2 + "px";
          } else {
            width2 = width2 ? width2 + "px" : "1fr";
            minWidth = minWidth ? minWidth + "px" : width2;
            minMaxWidth = `minmax(${minWidth}, ${width2})`;
          }
          widths.push(minMaxWidth);
        }
      }
      _table._columnWidths = widths;
      _table.header.element.style.gridTemplateColumns = widths.join(" ");
      _table.body.element.style.gridTemplateColumns = widths.join(" ");
    }
    function _setColumnResizable() {
      const $header = _table.header.element;
      const $headerCells = $header.querySelectorAll(".dt-header-cell:not(.hidden)");
      const $body = _table.body.element;
      let currentColumn = null;
      let currentColumnIndex;
      let columnWidths;
      let startX;
      let startWidth;
      let diff;
      let isResizing = false;
      if ($header.hasResizeHandler)
        return;
      $headerCells.forEach(($cell, index) => {
        const $resizer = $cell.querySelector(".resizer");
        if ($resizer) {
          $resizer.addEventListener("mousedown", (event) => startResize(event, index, $cell));
          $resizer.addEventListener("click", (event) => event.stopPropagation());
        }
      });
      $header.hasResizeHandler = true;
      function startResize(event, index, $column) {
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
        currentColumn = _table.header.cell($column.dataset.name);
        if (!options.resize && !currentColumn.options.resize)
          return;
        $header.classList.add("resizing");
        isResizing = true;
        currentColumnIndex = index;
        startX = event.pageX;
        columnWidths = getComputedStyle($header).gridTemplateColumns.split(" ");
        startWidth = parseFloat(columnWidths[currentColumnIndex]);
        document.body.style.cursor = "e-resize";
        document.body.style.userSelect = "none";
      }
      function resize(e) {
        if (!isResizing) return;
        diff = e.pageX - startX;
        let minWidth = currentColumn.options.minWidth || 50;
        let width2 = Math.max(minWidth, startWidth + diff);
        setColumnWidth(currentColumnIndex, width2);
      }
      function setColumnWidth(columnIndex, width2) {
        width2 = typeof width2 == "number" ? width2 + "px" : width2;
        columnWidths = getComputedStyle($header).gridTemplateColumns.split(" ");
        columnWidths[columnIndex] = width2;
        $header.style.gridTemplateColumns = columnWidths.join(" ");
        $body.style.gridTemplateColumns = columnWidths.join(" ");
        _table._columnWidths = columnWidths;
      }
      function stopResize() {
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
        if (!isResizing)
          return;
        isResizing = false;
        $header.classList.remove("resizing");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        if (diff && options.onResizeColumn) {
          options.onResizeColumn({ column: currentColumn, widths: _table._columnWidths });
          diff = 0;
        }
      }
    }
    function _setBorders() {
      if (!(data().length && _table.header && _table.body)) return;
      _table.header.element.querySelector(".visible:last-child").classList.remove("cell-border-right");
      _table.body.element.childNodes.forEach(($row, index) => {
        $row.querySelector(".visible:last-child").classList.remove("cell-border-right");
      });
      let radius = options.footer.hidden ? "inherit" : "0px";
      _table.elements.scrollable.style.borderBottomLeftRadius = radius;
      _table.elements.scrollable.style.borderbottomRightRadius = radius;
    }
  }

  // src/lib/DataTable/src/index.js
  function DataTable(options) {
    options = utils2.mergeProps(new TableOptions(), options);
    const _table = Table(options);
    if (options.place)
      options.place.appendChild(_table.element);
    _table.element.addEventListener("click", onWindowClick);
    _table.element.addEventListener("keydown", onKeyDown);
    _table.destroy = destroy2;
    return _table;
    function onWindowClick(event) {
      if (_table.isDisabled)
        return;
      if (!event.target.closest(".dt-header") && !event.target.closest(".dt-body")) {
        let cancel = false;
        if (options.onClickOut)
          cancel = !options.onClickOut({ event });
        if (!options.checkbox && !cancel)
          _table.unselectRows(event);
      }
    }
    function onKeyDown(event) {
      if (event.ctrlKey && event.key == "a" && (options.rows.selectOnClick && options.rows.allowMultipleSelection || options.checkbox)) {
        event.preventDefault();
        _table.selectRows();
      }
      if (options.onCopyClip && event.ctrlKey && event.key == "c" && (options.rows.selectOnClick || options.checkbox)) {
        options.onCopyClip({ text: _table.export() });
      }
      if (event.key == "Escape")
        _table.unselectRows(event);
    }
    function destroy2() {
      _table.element.removeEventListener("click", onWindowClick);
      _table.element.removeEventListener("keydown", onKeyDown);
      _table.element.remove();
    }
  }

  // src/components/Icon.ts
  var Icon = (name, options = { class: [] }) => {
    const icons = {
      add: () => html`<i class="icon" data-lucide="plus"></i>`,
      addGroup: () => html`<i class="icon" data-lucide="circle-plus"></i>`,
      new: () => html`<i class="icon" data-lucide="file-plus-2"></i>`,
      open: () => html`<i class="icon" data-lucide="folder-open"></i>`,
      edit: () => html`<i class="icon" data-lucide="pencil"></i>`,
      save: () => html`<i class="icon" data-lucide="save"></i>`,
      load: () => html`<i class="icon" data-lucide="import"></i>`,
      close: () => html`<i class="icon" data-lucide="x"></i>`,
      clear: () => html`<i class="icon" data-lucide="brush-cleaning"></i>`,
      send: () => html`<i class="icon" data-lucide="send-horizontal"></i>`,
      smartphone: () => html`<i class="icon" data-lucide="smartphone"></i>`,
      arrowUp: () => html`<i class="icon" data-lucide="arrow-up"></i>`,
      arrowDown: () => html`<i class="icon" data-lucide="arrow-down"></i>`,
      up: () => html`<i class="icon" data-lucide="chevron-up"></i>`,
      down: () => html`<i class="icon" data-lucide="chevron-down"></i>`,
      refresh: () => html`<i class="icon" data-lucide="refresh-cw"></i>`,
      info: () => html`<i class="icon" data-lucide="info"></i>`,
      ellipsisVertical: () => html`<i class="icon" data-lucide="ellipsis-vertical"></i>`,
      remove: () => html`<i class="icon" data-lucide="trash-2"></i>`,
      inputText: () => html`<i class="icon" data-lucide="text-cursor-input"></i>`,
      table: () => html`<i class="icon" data-lucide="table"></i>`,
      check: () => html`<i class="icon" data-lucide="check"></i>`,
      gridPlus: () => html`<i class="icon" data-lucide="grid-2x2-plus"></i>`
    };
    const $icon = icons[name]();
    if (options.class.length) {
      options.class.forEach(
        (className) => $icon.classList.add(className)
      );
    }
    return $icon;
  };
  var renderIcons = () => window["lucide"].createIcons();

  // src/models/SrvConfig.ts
  function createSrvConfig() {
    return {
      versions: { desktop: null, mobile: null },
      data: { tables: [] },
      info: createSrvInfo()
    };
  }
  function createSrvTable() {
    return {
      id: Utils_default.generateUUID(),
      name: "",
      enabled: true,
      rows: [createSrvTableRow()]
    };
  }
  function createSrvTableRow() {
    return {
      id: Utils_default.generateUUID(),
      name: "",
      description: "",
      type: "",
      subtype: "",
      value: "",
      objects: "",
      enabled: true,
      readonly: false,
      required: false,
      isGroup: false
    };
  }
  function createSrvInfo() {
    return {
      createdAt: "",
      createdBy: "",
      createdByEmail: ""
    };
  }

  // src/services/DataTableService.ts
  var _columns = {
    //id: { displayName: 'Id', hidden: true },
    enabled: {
      title: "Habilitar/Desabilitar no dispositivo m\xF3vel",
      displayName: '<i class="icon" data-lucide="smartphone"></i>',
      width: 60,
      style: { paddingLeft: 22 },
      resize: false
    },
    readonly: { displayName: "Edit\xE1vel", width: 60, title: "Edit\xE1vel" },
    required: { displayName: "Obrigat\xF3rio", width: 60, title: "Obrigat\xF3rio" },
    name: { displayName: "Nome do Campo ou Grupo", minWidth: 150 },
    description: { displayName: "Descri\xE7\xE3o", minWidth: 150 },
    value: { displayName: "Valor" },
    //objects: { displayName: 'Objetos', hidden: true },
    type: { displayName: "Tipo" }
    //subtype: { displayName: 'Subtipo', hidden: true },
  };
  var _fieldTypes = [
    { name: "", displayName: "Texto" },
    { name: "", displayName: "N\xFAmero" },
    { name: "", displayName: "E-mail" },
    { name: "", displayName: "Data" },
    { name: "", displayName: "Data/Hora" },
    { name: "", displayName: "Op\xE7\xE3o" },
    { name: "", displayName: "Op\xE7\xE3o M\xFAltipla" },
    { name: "", displayName: "Imagem" },
    { name: "", displayName: "Assinatura" }
  ];
  var dataTableService = DataTableService();
  function DataTableService() {
    return {
      createTable,
      removeTable,
      addTableRow,
      addTableRowGroup,
      moveSelectedRows,
      removeSelectedTableRows
    };
  }
  function createTable(srvTableId) {
    const dt = DataTable({
      id: srvTableId,
      data: [],
      place: null,
      checkbox: false,
      sort: false,
      resize: true,
      //width: 'fit-content',
      height: "100%",
      columns: _columns,
      borders: {
        table: {
          all: true,
          // top: false,
          // bottom: false,
          radius: 6
        },
        rows: true,
        cells: true
      },
      footer: {
        hidden: true
      },
      rows: {
        selectOnClick: true
      },
      cells: {
        enabled: {
          display: ({ row, item, value }) => {
            if (item.isGroup) return "";
            return html`
						<label class="flex items-center justify-center h-[32px] opacity-90">
							<input type="checkbox" checked="${() => item.enabled}" @onChange="${(e) => {
              item.enabled = e.element.checked;
            }}" class="scale-[1.1]"/>
						</label>
					`;
          }
        },
        readonly: {
          display: ({ row, item, value }) => {
            if (item.isGroup) return "";
            return html`
						<label class="flex items-center justify-center h-[32px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.readonly}" @onChange="${(e) => {
              item.readonly = e.element.checked;
            }}" class="scale-[1.1]"/>
						</label>
					`;
          }
        },
        required: {
          display: ({ row, item, value }) => {
            if (item.isGroup) return "";
            return html`
						<label class="flex items-center justify-center h-[32px] px-1.5 opacity-90">
							<input type="checkbox" checked="${() => item.required}" @onChange="${(e) => {
              item.required = e.element.checked;
            }}" class="scale-[1.1]"/>
						</label>
					`;
          }
        },
        name: {
          display: ({ row, item, value }) => {
            return html`
						<input type="text" value="${value}" @onChange="${(e) => {
              item.name = e.element.value.trim();
            }}"/>
					`;
          }
        },
        description: {
          display: ({ row, item, value }) => {
            if (item.isGroup) return "";
            const $field = html`
						<textarea rows="1" @onChange="${(e) => {
              item.description = e.element.value.trim();
            }}" @onInput="${(e) => {
              Utils_default.form().field().autoHeight(e.element);
            }}">${value}</textarea>
					`;
            Utils_default.form().field().autoHeight($field);
            return $field;
          }
        },
        value: {
          display: ({ row, item, value }) => {
            if (item.isGroup) return "";
            if (item.type == "Texto") {
              const $field = html`
							<textarea rows="1" @onChange="${(e) => {
                item.value = e.element.value;
              }}" @onInput="${(e) => {
                Utils_default.form().field().autoHeight(e.element);
              }}">${item.value}</textarea>
						`;
              Utils_default.form().field().autoHeight($field);
              return $field;
            } else if (item.type == "N\xFAmero") {
              return html`
							<input type="number" value="${item.value}" @onChange="${(e) => {
                item.value = e.element.value;
              }}"/>
						`;
            } else if (item.type == "E-mail") {
              return html`
							<input type="email" value="${item.value}" @onChange="${(e) => {
                item.value = e.element.value;
              }}"/>
						`;
            } else if (item.type == "Data") {
              return html`
							<input type="date" value="${item.value}" @onChange="${(e) => {
                item.value = e.element.value;
              }}"/>
						`;
            } else if (item.type == "Data/Hora") {
              return html`
							<input type="datetime-local" value="${item.value}" @onChange="${(e) => {
                item.value = e.element.value;
              }}"/>
						`;
            } else if (item.type == "Hor\xE1rio") {
              return html`
							<input type="time" value="${item.value}" @onChange="${(e) => {
                item.value = e.element.value;
              }}"/>
						`;
            } else if (item.type == "Op\xE7\xE3o") {
              const $field = html`
							<select @onChange="${(e) => {
                item.value = e.element.value;
              }}">${_fieldTypes.map((type) => (
                /*html*/
                `
								<option value="${type.displayName}">${type.displayName}</option>
							`
              ))}</select>
						`;
              $field["value"] = value;
              return $field;
            } else if (item.type == "Opc\xE3o M\xFAltipla") {
            } else if (item.type == "Imagem") {
            } else if (item.type == "Assinatura") {
            }
            return html`
						<input type="text" value="${item.value}" @onChange="${(e) => {
              item.value = e.element.value;
            }}"/>
					`;
          }
        },
        type: {
          display: ({ row, item, value }) => {
            if (item.isGroup) return "";
            const $field = html`
						<select @onChange="${(e) => {
              item.type = e.element.value;
            }}">${_fieldTypes.map((type) => (
              /*html*/
              `
							<option value="${type.displayName}">${type.displayName}</option>
						`
            ))}</select>
					`;
            $field["value"] = value;
            return $field;
          }
        }
      },
      onSelectRows: ({ rows }) => {
        ui_default.tables_buttons = ui_default.tables_buttons["reload"]();
        renderIcons();
      },
      onUnselectRows: () => {
        ui_default.tables_buttons = ui_default.tables_buttons["reload"]();
        renderIcons();
      },
      onClickOut: ({ event }) => {
        return false;
      }
    });
    dt.element.classList.add("!hidden");
    ui_default.dataTables.push(dt);
    return dt;
  }
  function removeTable(srvTableId) {
    let dt = ui_default.dataTables.find((x) => x.id == srvTableId);
    if (dt) {
      dt.element.remove();
      dt = null;
    }
  }
  function addTableRow() {
    const row = createSrvTableRow();
    ui_default.activeDataTable.addRow(row);
    ui_default.footer_total = ui_default.footer_total["reload"]();
  }
  function addTableRowGroup() {
    const row = createSrvTableRow();
    row.isGroup = true;
    ui_default.activeDataTable.addRow(row);
    ui_default.footer_total = ui_default.footer_total["reload"]();
  }
  function moveSelectedRows(down = true) {
    ui_default.activeDataTable.moveSelectedRows(down);
  }
  function removeSelectedTableRows() {
    ui_default.activeDataTable.removeSelectedRows();
    ui_default.footer_total = ui_default.footer_total["reload"]();
  }

  // src/services/UIService.ts
  var uiService = UIService();
  function UIService() {
    return {
      create,
      enableTableTab,
      selectTableTab
    };
  }
  function create() {
    const srvConfig = proxy_default.appData.srvConfig;
    const menu2 = Menu({ items: [] });
    const toolbar_actions_left_buttons = [
      { title: "Novo", icon: Icon("new"), onClick: () => actions_default.newFile() },
      { title: "Abrir", icon: Icon("open"), onClick: () => actions_default.openFile() },
      { title: "Salvar", icon: Icon("save"), onClick: () => actions_default.saveFile() },
      { title: "Informa\xE7\xF5es do arquivo", icon: Icon("info"), hidden: !appData.srvConfig.info.createdAt, onClick: () => actions_default.showFileInfo() },
      { divider: true, hidden: false },
      { title: "Carregar dados nas planilhas", icon: Icon("load"), onClick: () => console.log("onClick") },
      { title: "Limpar dados das planilhas", icon: Icon("clear"), onClick: () => console.log("onClick") },
      { title: "Enviar por E-mail", icon: Icon("send"), onClick: () => console.log("onClick") }
    ];
    const toolbar_actions_right_buttons = [
      { title: "Visualizar no dispositivo m\xF3vel", icon: Icon("smartphone"), onClick: () => console.log("onClick") }
    ];
    const toolbar_table_buttons = [
      { divider: true, hidden: false },
      { title: "Adicionar grupo", icon: Icon("addGroup"), onClick: () => actions_default.addTableRowGroup() },
      { title: "Adicionar item", icon: Icon("add"), onClick: () => actions_default.addTableRow() },
      { title: "Mover item selecionado para cima", icon: Icon("arrowUp"), onClick: () => actions_default.moveSelectedRows(false) },
      { title: "Mover item selecionado para baixo", icon: Icon("arrowDown"), onClick: () => actions_default.moveSelectedRows(true) },
      { title: "Excluir item selecionado", icon: Icon("close"), onClick: () => actions_default.removeSelectedTableRows() }
    ];
    const $toolbar_actions_left_buttons = html`<div>${() => {
      toolbar_actions_left_buttons.forEach((control, index) => {
        if (!proxy_default.appData.state.opened && index > 1)
          control.hidden = true;
      });
      return Buttons(toolbar_actions_left_buttons);
    }}</div>`;
    const $toolbar_actions_right_buttons = Buttons(toolbar_actions_right_buttons);
    const $toolbar_table_tabs = html`
		<div class="tabs flex gap-2">${() => {
      const srvTables = srvConfig.data.tables.filter((x) => x.enabled);
      return srvTables.map((srvTable, index) => {
        const $tab = html`
					<button type="button" class="tab button h-10 px-3 whitespace-nowrap" id="${srvTable.id}" @onClick="${() => selectTableTab(srvTable.id)}">
						<span>${srvTable.name}</span>
					</button>
				`;
        if (ui_default.activeDataTable) {
          if (ui_default.activeDataTable.id == srvTable.id)
            $tab.classList.add("active");
        }
        return $tab;
      });
    }}</div>
	`;
    const $button_add_table = html`
		<button type="button" class="button add-sheet min-w-10 h-10" title="Adicionar planilha" @onClick="${(e) => {
      e.event.stopPropagation();
      const srvTables = srvConfig.data.tables;
      if (!srvTables.length) return;
      menu2.options.items = srvTables.map((srvTable, index) => ({
        icon: srvTable.enabled ? Icon("check") : "",
        name: srvTable.name,
        onClick: () => enableTableTab(srvTable, index)
      }));
      menu2.show({
        trigger: e.element.closest("button"),
        position: "bottom left"
      });
      renderIcons();
    }}">${Icon("gridPlus")}</button>
	`;
    const $toolbar_table_buttons = html`<div @show="${() => !!ui_default.activeDataTable}">${() => {
      toolbar_table_buttons.forEach((control, index) => {
        if (index > 2) {
          control.hidden = true;
          if (ui_default.activeDataTable && ui_default.activeDataTable.rows.some((x) => x.isSelected)) {
            control.hidden = false;
          }
        }
      });
      return Buttons(toolbar_table_buttons);
    }}</div>`;
    const $tables = srvConfig.data.tables.map((srvTable) => {
      const dt = dataTableService.createTable(srvTable.id);
      dt.load(srvTable.rows);
      return dt.element;
    });
    const $footer_total = html`<span class="flex items-center h-10">${() => {
      const dt = ui_default.activeDataTable;
      return dt ? `${dt.rows.length} item(s)` : "";
    }}</span>`;
    const $layout = html`
		<div class="layout flex h-screen">
			<div class="flex flex-col justify-between w-screen h-screen">
				<div>
					<!-- menubar -->
					<div class="menubar flex p-1.5">
						${Menubar()}
					</div>

					<!-- toolbar-actions -->
					<div class="toolbar-actions flex justify-between gap-4 px-4 py-4">
						<div class="left">
							${$toolbar_actions_left_buttons}
						</div>
						<div class="right" @show="${proxy_default.appData.state.opened}">
							${$toolbar_actions_right_buttons}
						</div>
					</div>

					<!-- toolbar-table -->
					<div class="toolbar-table flex gap-2 px-4 pb-4" @show="${proxy_default.appData.state.opened}">
						<div class="flex gap-2 w-max-[600px] overflow-x-auto">
							${$toolbar_table_tabs}
						</div>
						${$button_add_table}
						${$toolbar_table_buttons}
					</div>
				</div>

				<!-- tables -->
				<div class="tables flex-1 overflow-auto px-4">
					${$tables}
				</div>

				<!-- footer -->
				<div class="footer flex gap-4 px-4 py-4">
					${$footer_total}
				</div>
			</div>

			<!-- app viewer -->
			<div></div>
		</div>
	`;
    ui_default.layout = $layout;
    ui_default.actions_left_buttons = $toolbar_actions_left_buttons;
    ui_default.actions_right_buttons = $toolbar_actions_right_buttons;
    ui_default.tables_buttons = $toolbar_table_buttons;
    ui_default.tables_tabs = $toolbar_table_tabs;
    ui_default.tables = $layout.querySelector(".tables");
    ui_default.footer_total = $footer_total;
  }
  function enableTableTab(srvTable, index) {
    const srvTables = appData.srvConfig.data.tables;
    const enabled = srvTables.filter((x) => x.enabled);
    if (enabled.length == 1 && srvTable.enabled)
      return;
    srvTable.enabled = !srvTable.enabled;
    if (srvTable.enabled) {
      ui_default.activeDataTable = ui_default.dataTables[index];
    } else {
      let _index = srvTables.findIndex((x) => x.id == ui_default.activeDataTable.id);
      if (!srvTables[_index].enabled) {
        _index = srvTables.findIndex((x, i) => i > index && x.enabled);
        if (_index == -1) {
          _index = [...srvTables].reverse().findIndex((x, i) => i < index && x.enabled);
        }
      }
      _index = _index >= 0 ? _index : 0;
      srvTable = srvTables[_index];
      ui_default.activeDataTable = ui_default.dataTables[_index];
    }
    ui_default.tables_tabs = ui_default.tables_tabs["reload"]();
    selectTableTab(srvTable.id);
  }
  function selectTableTab(srvTableId) {
    const srvTable0 = appData.srvConfig.data.tables[0];
    srvTableId = srvTableId || (srvTable0 ? srvTable0.id : null);
    if (!srvTableId) return;
    ui_default.activeDataTable = ui_default.dataTables.find((dt) => dt.id == srvTableId);
    ui_default.tables_tabs = ui_default.tables_tabs["reload"]();
    ui_default.dataTables.forEach((dt, _index) => {
      dt.element.classList.add("!hidden");
      if (dt.id == srvTableId)
        dt.element.classList.remove("!hidden");
    });
    ui_default.tables_buttons = ui_default.tables_buttons["reload"]();
    renderIcons();
    ui_default.footer_total = ui_default.footer_total["reload"]();
  }

  // src/shared/ui.ts
  var ui = {
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
    selectTableTab: uiService.selectTableTab
  };
  var ui_default = ui;

  // src/models/Result.ts
  function createResult() {
    return {
      data: null,
      error: null,
      canceled: false
    };
  }

  // src/lib/Modal/Modal.js
  var defaultOptions = {
    title: "",
    // string,
    content: "",
    // string/HTMLElement,
    width: 360,
    // number
    hideOut: true,
    // boolean - Fechar o modal ao clicar fora
    buttons: null,
    /* [
    	{
    		name: 'OK',
    		primary: true,
    		focused: true,
    		onClick: function
    	}, 
    	{
    		name: 'Cancelar',
    		primary: false,
    		onClick: function
    	}
    ]*/
    onHide: null
  };
  function Modal(options) {
    options = { ...defaultOptions, ...options };
    let _blocked = false;
    let $overlay;
    let $buttons;
    const _context = {
      options,
      show,
      hide,
      block,
      showSpin
    };
    return _context;
    function create2() {
      const $overlay2 = document.createElement("div");
      $overlay2.className = "modal-overlay";
      $overlay2.innerHTML = /*html*/
      `
			<div class="modal">
				<div class="modal-title">
					<span>${options.title}</span>
					<span class="modal-spin"></span>
				</div>
				<div class="modal-content"></div>
				<div class="modal-buttons"></div>
			</div>
		`;
      const $modal = $overlay2.querySelector(".modal");
      const $content = $overlay2.querySelector(".modal-content");
      $overlay2.addEventListener("click", () => {
        if (options.hideOut)
          hide();
      });
      $modal.addEventListener("click", (event) => event.stopPropagation());
      if (options.width)
        $modal.style.width = options.width + "px";
      if (options.content instanceof HTMLElement)
        $content.appendChild(options.content);
      else
        $content.innerHTML = options.content;
      options.buttons = options.buttons || [];
      $buttons = $overlay2.querySelector(".modal-buttons");
      options.buttons.forEach((button) => {
        const $button = document.createElement("button");
        $button.type = "button";
        $button.innerHTML = button.name;
        $button.classList.toggle("primary", !!button.primary);
        button.element = $button;
        if (button.onClick)
          $button.addEventListener("click", () => button.onClick(_context));
        $buttons.appendChild($button);
      });
      return $overlay2;
    }
    function show() {
      $overlay = create2();
      document.body.appendChild($overlay);
      $overlay.classList.remove("modal-invisible");
      $overlay.classList.add("modal-visible");
      window.addEventListener("keydown", onKeyDown);
      options.buttons.forEach((button) => {
        if (button.focused)
          button.element.focus();
      });
    }
    function hide() {
      destroy2();
    }
    function block(block2 = true) {
      if (!options.buttons) return;
      _blocked = block2;
      $buttons.querySelectorAll("button").forEach(($button) => {
        $button.blur();
        $button.classList.toggle("disabled", block2);
      });
    }
    function showSpin(show2 = true) {
      $overlay.querySelector(".modal-spin").classList.toggle("visible", show2);
    }
    function destroy2() {
      if (_blocked) return;
      $overlay.classList.remove("modal-visible");
      $overlay.classList.add("modal-invisible");
      if (options.onHide)
        options.onHide(_context);
      setTimeout(() => {
        $overlay.remove();
        window.removeEventListener("keydown", onKeyDown);
      }, 200);
    }
    function onKeyDown(event) {
      if (event.key == "Tab") {
        if (_blocked)
          event.preventDefault();
      }
      if (event.key == "Escape") {
        destroy2();
      }
    }
  }

  // src/services/NeutralinoService.ts
  var neutralinoService = NeutralinoService();
  function NeutralinoService() {
    return {
      setWindowTitle,
      setOnWindowClose,
      showFileDialog,
      createDirectory,
      readDirectory,
      readFile,
      writeFile,
      renameFile,
      remove,
      copyFolder,
      copyFile,
      openFile,
      clearFolder,
      zipFile,
      unzipFile,
      storage
    };
  }
  async function setWindowTitle(saved) {
    const config = await Neutralino.app.getConfig();
    const name = config.name;
    const version = config.version;
    if (typeof saved == "boolean") {
      appData.state.saved = saved;
    } else {
      saved = appData.state.saved;
    }
    return Neutralino.window.setTitle(`${name} - ${version} ${saved ? "" : "*"}`);
  }
  async function setOnWindowClose() {
    return Neutralino.events.on("windowClose", async () => {
      if (!appData.state.saved) {
        let result = await actions_default.saveFile(true);
        if (typeof result == "boolean")
          await close();
      } else {
        await close();
      }
    });
    async function close() {
      const result = await actions_default.closeWorkbook();
      if (result.error) {
        Modal({
          title: "Survey",
          content: `N\xE3o foi poss\xEDvel fechar o arquivo temp.xls(x)<br>${result.error}`,
          buttons: [
            { name: "OK", onClick: async (modal) => {
              modal.hide();
            } }
          ]
        }).show();
        return;
      }
      await storage("appData", null);
      await Neutralino.app.exit();
    }
  }
  async function showFileDialog(options = { title: "", target: "", filters: [] }) {
    const defaultOptions3 = {
      title: "Abrir",
      target: "open",
      // open | save | folder
      filters: [
        { name: "Survey", extensions: ["srv"] }
      ]
    };
    const result = createResult();
    let entries;
    options = { ...defaultOptions3, ...options };
    if (options.target == "open") {
      entries = await Neutralino.os.showOpenDialog(options.title, { filters: options.filters, multiSelections: false });
    } else if (options.target == "save") {
      entries = await Neutralino.os.showSaveDialog(options.title, { filters: options.filters });
    } else if (options.target == "folder") {
      entries = await Neutralino.os.showFolderDialog(options.title);
    }
    result.canceled = !entries.length;
    if (entries.length)
      result.data = entries;
    return result;
  }
  async function createDirectory(options = { path: "" }) {
    const result = createResult();
    return Neutralino.filesystem.createDirectory(options.path).then((data) => result.data = data).catch((error) => result.error = error.message).then(() => result);
  }
  async function readDirectory(options = { path: "" }) {
    const result = createResult();
    return Neutralino.filesystem.readDirectory(options.path).then((data) => result.data = data).catch((error) => result.error = error.message).then(() => result);
  }
  async function readFile(options = { filePath: "" }) {
    const result = createResult();
    return Neutralino.filesystem.readFile(options.filePath).then((data) => result.data = data).catch((error) => result.error = error.message).then(() => result);
  }
  async function writeFile(options = { filePath: "", data: "" }) {
    const result = createResult();
    return Neutralino.filesystem.writeFile(options.filePath, options.data).then((data) => {
      if (!data.success)
        result.error = data.message;
    }).catch((error) => {
      result.error = error.message;
    }).then(() => {
      return result;
    });
  }
  async function renameFile(options = { filePath: "", name: "" }) {
    const dir = options.filePath.substring(0, options.filePath.lastIndexOf("/"));
    const ext = options.filePath.substring(options.filePath.lastIndexOf("."));
    const newPath = dir + options.name + ext;
    const result = createResult();
    return Neutralino.filesystem.move(options.filePath, newPath).then((data) => {
      if (!data.success)
        result.error = data.message;
    }).catch((error) => {
      result.error = error.message;
    }).then(() => {
      return result;
    });
  }
  async function remove(options = { path: "" }) {
    const result = createResult();
    return Neutralino.filesystem.remove(options.path).then((data) => result.data = data).catch((error) => result.error = error.message).then(() => result);
  }
  async function copyFile(options = { fromFilePath: "", toFilePath: "" }) {
    const result = createResult();
    return Neutralino.filesystem.copy(options.fromFilePath, options.toFilePath).then((data) => {
      if (!data.success)
        result.error = data.message;
    }).catch((error) => {
      result.error = error.message;
    }).then(() => {
      return result;
    });
  }
  async function copyFolder(options = { fromFolderPath: "", toFolderPath: "" }) {
    const result = createResult();
    return Neutralino.filesystem.copy(options.fromFolderPath, options.toFolderPath).then((data) => {
      if (!data.success)
        result.error = data.message;
    }).catch((error) => {
      result.error = error.message;
    }).then(() => {
      return result;
    });
  }
  async function openFile(options = { filePath: "" }) {
    const result = createResult();
    return Neutralino.os.open(options.filePath).then((data) => {
      if (!data.success)
        result.error = data.message;
    }).catch((error) => {
      result.error = error.message;
    }).then(() => {
      return result;
    });
  }
  async function clearFolder(options = { folderPath: "" }) {
    const result = createResult();
    await Neutralino.filesystem.remove(options.folderPath).then((data) => {
      if (!data.success)
        result.error = data.message;
    }).catch((error) => {
      result.error = error.message;
    });
    await Neutralino.filesystem.createDirectory(options.folderPath).then((data) => {
      if (!data.success)
        result.error = data.message;
    }).catch((error) => {
      result.error = error.message;
    });
    return result;
  }
  async function zipFile(options = { fromFolderPath: "", toFilePath: "" }) {
    const result = createResult();
    return Neutralino.os.execCommand(
      `.\\dist\\tools\\7zip\\7za.exe a -tzip -sccUTF-8 "${options.toFilePath}" "${options.fromFolderPath}/*" -y`,
      { background: false }
    ).then((out) => {
      if (out.stdErr)
        result.error = out.stdErr;
    }).catch((error) => {
      result.error = error.message;
    }).then(() => {
      return result;
    });
  }
  async function unzipFile(options = { fromFilePath: "", toFolderPath: "" }) {
    const result = createResult();
    return Neutralino.os.execCommand(
      `.\\dist\\tools\\7zip\\7za.exe x -sccUTF-8 "${options.fromFilePath}" -o"${options.toFolderPath}" -y`,
      // -y: sobreescreve
      { background: false }
    ).then(async (out) => {
      if (out.stdErr) {
        result.error = out.stdErr;
      } else {
        await Neutralino.os.execCommand(`cmd /c dir "${options.toFolderPath}" /b /a-d`).then((out2) => {
          const files = out2.stdOut.split(/\r?\n/).filter(Boolean);
          result.data = files;
        }).catch((error) => {
          result.error = error.message;
        });
      }
    }).catch((error) => {
      result.error = error.message;
    }).then(() => {
      return result;
    });
  }
  async function storage(key, value) {
    if (typeof value == "undefined") {
      return Neutralino.storage.getData(key).then((data) => {
        if (!data.message) {
          if (data != "")
            return JSON.parse(data);
          return data;
        }
      }).catch(() => null);
    } else {
      if (typeof value == "object" && value != null)
        value = JSON.stringify(value);
      return Neutralino.storage.setData(key, value).then(() => true).catch(() => false);
    }
  }

  // src/shared/constants.ts
  var constants = {
    root_path: "",
    get temp_folder_path() {
      return `${this.root_path}/dist/temp`;
    },
    //excel_api_path() { return `${this.root_path}/dist/tools/office/ExcelAPI.exe`; },
    excel_api_path: "D:/_dev/Survey/2.0/Survey-Desktop/ExcelAPI/bin/Debug/net48/win-x86/ExcelAPI.exe"
  };
  var constants_default = constants;

  // src/services/SrvService.ts
  var srvService = SrvService();
  function SrvService() {
    return {
      newSrv,
      openSrv,
      saveSrv,
      getSheets,
      saveWorkbook,
      closeWorkbook
    };
  }
  async function newSrv(filePath) {
    const ext = filePath.substring(filePath.lastIndexOf("."));
    const excelFileName = "temp" + ext;
    let result = await neutralinoService.clearFolder({ folderPath: constants_default.temp_folder_path });
    if (result.error) {
      return result;
    }
    appData.excelFileName = excelFileName;
    result = await neutralinoService.copyFile({
      fromFilePath: filePath,
      toFilePath: `${constants_default.temp_folder_path}/${excelFileName}`
    });
    if (result.error) {
      return result;
    }
    result = await neutralinoService.openFile({ filePath: `${constants_default.temp_folder_path}/${excelFileName}` });
    if (result.error) {
      return result;
    }
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        result = await getSheets();
        const sheets = result.data || [];
        if (sheets.length) {
          clearInterval(interval);
          const srvConfig = createSrvConfig();
          sheets.forEach((sheet, index) => {
            const srvTable = createSrvTable();
            srvTable.id = sheet.id;
            srvTable.name = sheet.name;
            srvTable.enabled = index == 0;
            srvConfig.data.tables.push(srvTable);
          });
          result = await neutralinoService.writeFile({
            filePath: constants_default.temp_folder_path + "/config.json",
            data: JSON.stringify(srvConfig)
          });
          if (!result.error) {
            result.data = srvConfig;
          }
          resolve(result);
        }
      }, 1e3);
    });
  }
  async function openSrv(filePath) {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    let srvConfig = createSrvConfig();
    appData.srvFilePath = filePath;
    appData.srvFileName = fileName;
    let result = await neutralinoService.clearFolder({ folderPath: constants_default.temp_folder_path });
    if (result.error) {
      return result;
    }
    result = await neutralinoService.unzipFile({
      fromFilePath: filePath,
      toFolderPath: constants_default.temp_folder_path
    });
    if (result.error) {
      return result;
    }
    let tempFileName = result.data.find((x) => x.startsWith("temp.xls"));
    if (!tempFileName) {
      const oldTempFileName = result.data.find((x) => x.startsWith("spreadsheet"));
      const ext = oldTempFileName.substring(oldTempFileName.lastIndexOf("."));
      tempFileName = "temp" + ext;
      result = await neutralinoService.copyFile({
        fromFilePath: `${constants_default.temp_folder_path}/${oldTempFileName}`,
        toFilePath: `${constants_default.temp_folder_path}/${tempFileName}`
      });
      if (result.error) {
        return result;
      }
    }
    appData.excelFileName = tempFileName;
    const config = await neutralinoService.readFile({ filePath: `${constants_default.temp_folder_path}/config.json` });
    if (config.data) {
      srvConfig = JSON.parse(config.data);
    } else {
      const formdata = await neutralinoService.readFile({ filePath: `${constants_default.temp_folder_path}/formdata.json` });
      const report = await neutralinoService.readFile({ filePath: `${constants_default.temp_folder_path}/report.json` });
      if (formdata.data) {
        const data = JSON.parse(formdata.data);
        srvConfig.data = parseFormdata(data);
      }
      if (report.data) {
        const data = JSON.parse(report.data);
        srvConfig.info = parseReport(data);
      }
      result = await neutralinoService.writeFile({
        filePath: `${constants_default.temp_folder_path}/config.json`,
        data: JSON.stringify(srvConfig)
      });
      if (result.error) {
        return result;
      }
    }
    appData.sheets = srvConfig.data.tables.map((srvTable) => ({
      id: srvTable.id,
      name: srvTable.name
    }));
    neutralinoService.openFile({ filePath: `${constants_default.temp_folder_path}/${tempFileName}` });
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        result = await getSheets();
        const sheets = result.data || [];
        if (sheets.length) {
          clearInterval(interval);
          sheets.forEach((sheet) => {
            let isNewTable = true;
            srvConfig.data.tables.forEach((srvTable) => {
              if (sheet.name == srvTable.name) {
                srvTable.id = sheet.id;
                isNewTable = false;
              }
            });
            if (isNewTable) {
              const srvTable = createSrvTable();
              srvTable.id = sheet.id;
              srvTable.name = sheet.name;
              srvTable.enabled = false;
              srvConfig.data.tables.push(srvTable);
            }
          });
          result.data = srvConfig;
          resolve(result);
        }
      }, 1e3);
    });
  }
  async function saveSrv(srvConfig) {
    let result = await neutralinoService.writeFile({
      filePath: `${constants_default.temp_folder_path}/config.json`,
      data: JSON.stringify(srvConfig)
    });
    if (result.error) {
      console.log(result.error);
      return result;
    }
    result = await saveWorkbook();
    let success = result.data;
    if (!success) {
      result.error = "N\xE3o foi poss\xEDvel salvar a planilha temp.xls(x).<br><br>Verifique se: <br> - O arquivo est\xE1 aberto no  Excel.<br> - N\xE3o h\xE1 subjanelas abertas dentro do Excel.<br> - C\xE9lulas em modo de edi\xE7\xE3o.<br> - Outro fator que esteja impedindo o salvamento<br><br>Tente salvar novamente.";
      console.log(result.error);
      return result;
    }
    const savedFolderPath = `${constants_default.temp_folder_path}/saved`;
    try {
      result = await neutralinoService.remove({ path: savedFolderPath });
    } catch (error) {
    }
    result = await neutralinoService.createDirectory({ path: savedFolderPath });
    if (result.error) {
      console.log(result.error);
      return result;
    }
    result = await neutralinoService.readDirectory({ path: constants_default.temp_folder_path });
    if (result.error) {
      console.log(result.error);
      return result;
    }
    const entries = result.data || [];
    entries.filter(
      (x) => x.type.toLowerCase() == "file" && !x.entry.startsWith("~")
    ).forEach(async (file) => {
      result = await neutralinoService.copyFile({
        fromFilePath: file.path,
        toFilePath: `${savedFolderPath}/${file.entry}`
      });
    });
    result = await neutralinoService.zipFile({
      fromFolderPath: savedFolderPath,
      toFilePath: `${savedFolderPath}/${appData.srvFileName}`
    });
    if (!result.error) {
      try {
        await neutralinoService.remove({ path: appData.srvFilePath });
      } catch (error) {
      }
      result = await neutralinoService.copyFile({
        fromFilePath: `${savedFolderPath}/${appData.srvFileName}`,
        toFilePath: appData.srvFilePath
      });
    }
    if (result.error) {
      console.log(result.error);
    }
    return result;
  }
  async function saveWorkbook() {
    const tempFileName = appData.excelFileName;
    const result = createResult();
    if (!tempFileName)
      return result;
    return Neutralino.os.execCommand(
      `${constants_default.excel_api_path} workbookPath=${constants_default.temp_folder_path}/${tempFileName} method=SaveWorkbook`,
      { background: false }
    ).then((out) => {
      if (out.stdErr) {
        result.error = out.stdErr;
      } else if (out.stdOut) {
        result.data = JSON.parse(out.stdOut).data;
      }
    }).catch((error) => {
      result.error = error.message;
    }).then(() => result);
  }
  async function getSheets() {
    const tempFileName = appData.excelFileName;
    const result = createResult();
    if (!tempFileName)
      return result;
    return Neutralino.os.execCommand(
      `${constants_default.excel_api_path} workbookPath=${constants_default.temp_folder_path}/${tempFileName} method=GetSheets`,
      { background: false }
    ).then((out) => {
      if (out.stdErr) {
        result.error = out.stdErr;
      } else if (out.stdOut) {
        result.data = JSON.parse(out.stdOut).data;
      }
    }).catch((error) => {
      result.error = error.message;
    }).then(() => result);
  }
  async function closeWorkbook() {
    const tempFileName = appData.excelFileName;
    const result = createResult();
    if (!tempFileName)
      return result;
    return Neutralino.os.execCommand(
      `${constants_default.excel_api_path} workbookPath=${constants_default.temp_folder_path}/${tempFileName} method=CloseWorkbook`,
      { background: false }
    ).then((out) => {
      if (out.stdErr) {
        result.error = out.stdErr;
      } else if (out.stdOut) {
        result.data = JSON.parse(out.stdOut).data;
      }
    }).catch((error) => {
      result.error = error.message;
    }).then(() => result);
  }
  function parseFormdata(data) {
    const planilhas = [...new Set(data.map((data2) => data2.planilha))];
    const _data = {
      tables: []
    };
    let lastGroup = "";
    planilhas.forEach((planilha) => {
      const srvTable = createSrvTable();
      srvTable.name = planilha;
      srvTable.rows = [];
      data.filter((data2) => data2.planilha == planilha).forEach((item) => {
        if (item.grupo && item.grupo != lastGroup) {
          lastGroup = item.grupo;
          const srvRow2 = createSrvTableRow();
          srvRow2.isGroup = true;
          srvRow2.name = item.grupo;
          srvTable.rows.push(srvRow2);
        }
        const srvRow = createSrvTableRow();
        srvRow.id = item.id;
        srvRow.objects = JSON.parse(item.objetos || "[]");
        srvRow.name = item.nome;
        srvRow.description = item.descricao;
        srvRow.type = item.tipo;
        srvRow.subtype = item.subTipo;
        srvRow.value = item.valor;
        srvRow.required = item.obrigatorio == "1";
        srvRow.readonly = item.editavel != "1";
        srvTable.rows.push(srvRow);
      });
      _data.tables.push(srvTable);
    });
    return _data;
  }
  function parseReport(data) {
    const srvInfo = createSrvInfo();
    srvInfo.createdBy = data.author;
    srvInfo.createdByEmail = data.mailAuthor;
    srvInfo.createdAt = data.created;
    return srvInfo;
  }

  // src/lib/Toast/Toast.js
  var defaultOptions2 = {
    icon: null,
    // HTMLElement | string
    message: null,
    // string (text | html)
    position: "bottom center",
    // string ('top left' | 'top center' | 'top right' | 'bottom left' | 'bottom center' | 'bottom right')
    gap: 12,
    // number (pixels)
    inset: 12,
    // number (pixels)
    time: 5,
    // number (seconds)
    spin: false,
    // boolean (Exibe o spin girando)
    buttonClose: false,
    // boolean (Exibe o botão X)
    onHide: null,
    // function
    onClose: null,
    // function
    onBeforeClose: null
    // function
  };
  var $toasts = document.querySelector(".toasts");
  if (!$toasts) {
    $toasts = document.createElement("div");
    $toasts.className = "toasts";
    $toasts.addEventListener("mouseover", () => $toasts.classList.add("scrollable", "mouseover"));
    $toasts.addEventListener("mouseout", () => $toasts.classList.remove("scrollable", "mouseover"));
    document.body.after($toasts);
  }
  function Toast(options = {}) {
    options = { ...defaultOptions2, ...options };
    let $toastWrapper;
    let _interval;
    $toasts.style.inset = `${options.inset}px`;
    create2();
    return {
      message,
      show,
      hide
    };
    function create2() {
      $toastWrapper = document.createElement("div");
      $toastWrapper.classList.add("toast-wrapper");
      $toastWrapper.innerHTML = /*html*/
      `
			<div class="toast">
				<div class="toast-icon"></div>
				<div class="toast-body">
					<div class="toast-content">
						${options.message}
					</div>
				</div>
				<div class="toast-controls">
					<div class="toast-button hidden">
						<button type="button" class="toast-button-icon" title="Fechar">\u2716</button>
					</div>
					<div class="toast-spin hidden"></div>
				</div>
			</div>
		`;
      const $toast = $toastWrapper.querySelector(".toast");
      const $icon = $toast.querySelector(".toast-icon");
      const $controls = $toast.querySelector(".toast-controls");
      const $button = $toast.querySelector(".toast-button");
      const $spin = $toast.querySelector(".toast-spin");
      $toast.addEventListener("mouseover", () => $toast.classList.add("mouseover"));
      $toast.addEventListener("mouseout", () => $toast.classList.remove("mouseover"));
      $toastWrapper.prepend($toast);
      if (options.icon) {
        if (options.icon instanceof HTMLElement)
          $icon.appendChild(options.icon);
        else
          $icon.innerHTML = options.icon;
        $toast.prepend($icon);
      }
      if (options.buttonClose) {
        $button.classList.remove("hidden");
        $button.querySelector("button").addEventListener("click", async () => {
          if (options.onBeforeClose) {
            let closed = await options.onBeforeClose();
            if (closed)
              hide();
          } else {
            hide();
          }
        });
      }
      if (options.spin) {
        $spin.classList.remove("hidden");
        $button.classList.add("hidden");
      }
      $controls.addEventListener("mouseover", () => {
        if (options.buttonClose && options.spin) {
          $spin.classList.add("hidden");
          $button.classList.remove("hidden");
        }
      });
      $controls.addEventListener("mouseout", () => {
        if (options.buttonClose && options.spin) {
          $spin.classList.remove("hidden");
          $button.classList.add("hidden");
        }
      });
    }
    function message(text) {
      $toastWrapper.querySelector(".toast-content").innerHTML = text || "";
    }
    function show() {
      let positionX = "center";
      if (options.position.match("left")) {
        positionX = "left";
      } else if (options.position.match("right")) {
        positionX = "right";
      }
      $toastWrapper.classList.add(positionX);
      if (options.position.match("top")) {
        $toasts.querySelectorAll(".toast-wrapper.bottom").forEach((x) => x.remove());
        $toastWrapper.classList.add("top");
        $toastWrapper.style.transform = "scale(0.8) translateY(-16px)";
        $toasts.prepend($toastWrapper);
        const height = $toastWrapper.offsetHeight;
        setTimeout(() => {
          $toastWrapper.style.transform = "scale(1)";
          $toastWrapper.style.transform = "translateY(0px)";
          $toastWrapper.style.opacity = 1;
        }, 0);
        const $items = $toasts.querySelectorAll(".toast-wrapper");
        $items.forEach(($toastWrapper2, index) => {
          if (index == 0) return;
          const translateY = Number($toastWrapper2.style.transform.replace(/\D/g, ""));
          $toastWrapper2.style.transform = `translateY(calc(${translateY + height}px + ${options.gap}px))`;
        });
      }
      if (options.position.match("bottom")) {
        $toasts.querySelectorAll(".toast-wrapper.top").forEach((x) => x.remove());
        $toastWrapper.classList.add("bottom");
        $toastWrapper.style.transform = "scale(0.8) translateY(16px)";
        $toasts.appendChild($toastWrapper);
        const height = $toastWrapper.offsetHeight;
        setTimeout(() => {
          $toastWrapper.style.transform = "scale(1)";
          $toastWrapper.style.transform = "translateY(0px)";
          $toastWrapper.style.opacity = 1;
        }, 0);
        const $items = $toasts.querySelectorAll(".toast-wrapper");
        $items.forEach(($toastWrapper2, index) => {
          if (index == $items.length - 1) return;
          const translateY = Number($toastWrapper2.style.transform.replace(/\D/g, ""));
          $toastWrapper2.style.transform = `translateY(calc(-1 * (${translateY + height}px + ${options.gap}px)))`;
        });
      }
      _interval = setInterval(() => {
        if (!options.buttonClose && !options.spin && !$toasts.querySelectorAll(".toast.mouseover").length) {
          hide();
        }
      }, options.time * 1e3);
    }
    function hide() {
      $toastWrapper.style.transform = `translateY(${$toastWrapper.style.transform})`;
      $toastWrapper.style.opacity = 0;
      const isTop = options.position.match("top");
      let $items = Array.from($toasts.querySelectorAll(".toast-wrapper"));
      let height;
      $items = isTop ? $items : $items.reverse();
      for (const $tw of $items) {
        if ($tw == $toastWrapper) {
          height = $toastWrapper.offsetHeight;
          continue;
        }
        if (height) {
          let translateY = Number($tw.style.transform.replace(/\D/g, ""));
          translateY = isTop ? `${translateY - height - options.gap}px` : `calc(-1 * ${translateY - height - options.gap}px)`;
          $tw.style.transform = `translateY(${translateY})`;
        }
      }
      setTimeout(() => $toastWrapper.remove(), 300);
      if (options.onHide)
        options.onHide();
      if (options.onClose)
        options.onClose();
      clearInterval(_interval);
    }
  }

  // src/index.ts
  Neutralino.init();
  var _observeDataChanges;
  actions_default.newFile = newFile;
  actions_default.openFile = openFile2;
  actions_default.saveFile = saveFile;
  actions_default.showFileInfo = showFileInfo;
  actions_default.closeWorkbook = srvService.closeWorkbook;
  actions_default.addTableRow = dataTableService.addTableRow;
  actions_default.addTableRowGroup = dataTableService.addTableRowGroup;
  actions_default.moveSelectedRows = dataTableService.moveSelectedRows;
  actions_default.removeSelectedTableRows = dataTableService.removeSelectedTableRows;
  neutralinoService.setWindowTitle();
  neutralinoService.setOnWindowClose();
  start();
  observeSheets();
  async function start() {
    constants_default.root_path = await Neutralino.filesystem.getAbsolutePath(NL_PATH);
    const appDataStored = await neutralinoService.storage("appData");
    if (appDataStored && !proxy_default.appData)
      setAppData(appDataStored);
    appData.srvConfig = appData.srvConfig || createSrvConfig();
    ui_default.dataTables = [];
    _observeDataChanges = false;
    proxy_default.appData = Utils_default.observe(appData, {
      onChange: async (args) => {
        if (!_observeDataChanges) return;
        if (args.prop != "saved")
          appData.state.saved = false;
        neutralinoService.setWindowTitle();
        neutralinoService.storage("appData", appData);
      }
    });
    neutralinoService.setWindowTitle();
    ui_default.create();
    document.body.innerHTML = "";
    document.body.appendChild(ui_default.layout);
    ui_default.selectTableTab();
    renderIcons();
    neutralinoService.storage("appData", appData);
    _observeDataChanges = true;
  }
  async function newFile(confirmSave = true) {
    try {
      appData.state.creating = true;
      const state = appData.state;
      if (confirmSave && !state.saved) {
        const saved = await saveFile(!state.saved);
        if (typeof saved == "boolean")
          newFile(false);
        return;
      }
      let result = await neutralinoService.showFileDialog({
        target: "open",
        title: "Novo",
        filters: [
          { name: "Excel", extensions: ["xlsx", "xls"] }
        ]
      });
      if (result.canceled) {
        return result;
      }
      const filePath = result.data[0];
      result = await srvService.closeWorkbook();
      if (result.error) {
        Toast({ message: `N\xE3o foi poss\xEDvel fechar o arquivo temp.xls(x)<br>${result.error}` }).show();
        return;
      }
      await Neutralino.window.minimize();
      result = await srvService.newSrv(filePath);
      await Neutralino.window.unminimize();
      if (result.error) {
        Toast({ message: `Falha ao criar o arquivo.<br>${result.error}` }).show();
        return;
      }
      appData.srvConfig = result.data;
      appData.state.opened = true;
      neutralinoService.setWindowTitle(false);
      start();
    } finally {
      appData.state.creating = false;
    }
  }
  async function openFile2(confirmSave = true) {
    try {
      appData.state.opening = true;
      const state = appData.state;
      if (confirmSave && !state.saved) {
        const saved = await saveFile(!state.saved);
        if (typeof saved == "boolean")
          openFile2(false);
        return;
      }
      let result = await neutralinoService.showFileDialog({
        target: "open",
        title: "Abrir",
        filters: [{ name: "Survey", extensions: ["srv"] }]
      });
      if (result.canceled) {
        return result;
      }
      const filePath = result.data[0];
      result = await srvService.closeWorkbook();
      if (result.error) {
        Toast({ message: `N\xE3o foi poss\xEDvel fechar o arquivo temp.xls(x)<br>${result.error}` }).show();
        return;
      }
      await Neutralino.window.minimize();
      result = await srvService.openSrv(filePath);
      await Neutralino.window.unminimize();
      if (result.error) {
        Toast({ message: `Falha ao abrir o arquivo.<br>${result.error}` }).show();
        return;
      }
      appData.srvConfig = result.data;
      appData.state.opened = true;
      appData.state.saved = true;
      neutralinoService.setWindowTitle(true);
      start();
    } finally {
      appData.state.opening = false;
    }
  }
  async function saveFile(confirm = false) {
    if (confirm) {
      return new Promise(async (resolve) => {
        Modal({
          title: "Survey",
          content: `Deseja salvar as altera\xE7\xF5es em ${appData.srvFileName}?`,
          hideOut: false,
          buttons: [
            {
              name: "Savar",
              primary: true,
              onClick: async (modal) => {
                modal.hide();
                const result = await save();
                resolve(result);
              }
            },
            {
              name: "N\xE3o salvar",
              onClick: (modal) => {
                modal.hide();
                resolve(false);
              }
            },
            {
              name: "Cancelar",
              onClick: (modal) => {
                modal.hide();
                resolve("canceled");
              }
            }
          ]
        }).show();
      });
    } else {
      return save();
    }
    async function save() {
      console.log(appData.srvFilePath);
      if (!appData.srvFilePath) {
        let result2 = await neutralinoService.showFileDialog({
          target: "save",
          title: "Novo",
          filters: [{ name: "Survey", extensions: ["srv"] }]
        });
        if (result2.canceled) {
          return "canceled";
        }
        appData.srvFilePath = result2.data;
        if (!appData.srvFilePath.toLowerCase().endsWith(".srv"))
          appData.srvFilePath += ".srv";
        appData.srvFileName = appData.srvFilePath.substring(appData.srvFilePath.lastIndexOf("/") + 1);
      }
      let result = await srvService.saveSrv(appData.srvConfig);
      if (result.error) {
        Modal({
          title: "Survey",
          content: `Falha ao salvar ${appData.srvFileName}<br>${result.error.replaceAll("\n", "<br>")}`,
          buttons: [{ name: "OK", onClick: (modal) => modal.hide() }]
        }).show();
        return "error";
      }
      neutralinoService.setWindowTitle(true);
      return true;
    }
  }
  function showFileInfo() {
    const modal = Modal({
      title: "Informa\xE7\xF5es do arquivo",
      content: "Informa\xE7\xF5es do arquivo.",
      width: 360,
      hideOut: true,
      buttons: [
        { name: "OK", primary: true, onClick: () => modal.hide() }
      ]
    });
    modal.show();
  }
  async function observeSheets() {
    await Utils_default.pause(1e3);
    if (appData.state.creating || appData.state.opening || !appData.state.opened) {
      observeSheets();
      return;
    }
    ;
    const result = await srvService.getSheets();
    if (result.data) {
      if (JSON.stringify(appData.sheets.map((x) => x.name)) == JSON.stringify(result.data.map((x) => x.name))) {
        observeSheets();
        return;
      }
      appData.sheets = result.data;
      const currentSrvTables = [];
      appData.sheets.forEach((sheet) => {
        const srvTable = createSrvTable();
        srvTable.id = sheet.id;
        srvTable.name = sheet.name;
        srvTable.enabled = false;
        currentSrvTables.push(srvTable);
      });
      currentSrvTables.forEach((currentSrvTable, index) => {
        const srvTable = appData.srvConfig.data.tables.find((x) => x.id == currentSrvTable.id);
        let add = true;
        if (srvTable) {
          currentSrvTables[index] = srvTable;
          add = false;
        }
        if (add) {
          const dt = dataTableService.createTable(currentSrvTable.id);
          dt.load(currentSrvTable.rows);
          ui_default.tables.appendChild(dt.element);
        }
      });
      appData.srvConfig.data.tables.forEach((srvTable) => {
        if (!currentSrvTables.some((currentSrvTable) => currentSrvTable.id == srvTable.id)) {
          dataTableService.removeTable(srvTable.id);
          if (ui_default.activeDataTable.id == srvTable.id) {
            ui_default.activeDataTable = null;
            ui_default.tables_buttons = ui_default.tables_buttons["reload"]();
          }
        }
      });
      proxy_default.appData.srvConfig.data.tables = currentSrvTables;
      ui_default.tables_tabs = ui_default.tables_tabs["reload"]();
    } else {
      Modal({
        title: "Survey",
        content: "Mantenha o arquivo temp.xls(x) aberto enquanto executa o aplicativo.",
        hideOut: false,
        buttons: [
          { name: "OK", onClick: (modal) => modal.hide() }
        ],
        onHide: async (modal) => {
          await neutralinoService.openFile({ filePath: `${constants_default.temp_folder_path}/${appData.excelFileName}` });
          await Utils_default.pause(5e3);
          observeSheets();
        }
      }).show();
      return;
    }
    observeSheets();
  }
})();
