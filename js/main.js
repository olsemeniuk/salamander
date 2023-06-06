//logic
//console.log('wee');
//console.log(filter);
let isInitted = false;
let filterDataOld;
let elements = {};
let data = {};
let oldUrl;
let currentState;

let mainAssemblage = null;
let mainAssemblageId = null;
let activeAssemblages = [];
let lastAssemblageChooseButtonIndex = 0;
let lastChoosenAssemblageButton = null;

const max_active_assemblages = 8;

let activatedFilter = {};
let isFilterLiveMod = true;

let actualSort = {};

let readyToManage = null;

let afterManageActions = [];

class Assemblage {
  _getAssemblage(id) {
    if (!id) return null;
    let assemblageLine = window.localStorage.getItem('assemblage_' + id);
    let assemblage = {};
    if (assemblageLine) assemblage = JSON.parse(assemblageLine);
    //console.log('getAssemblage', id, assemblageLine, assemblage);
    return assemblage;
  }

  constructor(arg, no_draw = false) {
    if (no_draw) {
      if (!Object.hasOwnProperty(this, 'no_draw')) Object.defineProperty(this, 'no_draw', { configurable: true, enumerable: false, writable: true, value: null });
      this.no_draw = no_draw;
    }
    if (!arg || arg instanceof Array) {
      this.id = window.localStorage.getItem('assemblage_last_id');
      if (!this.id) this.id = 1;
      else this.id++;

      let assembleges = getAssemblagesIds();
      //let activeAssembleges = getActiveAssemblagesIds();
      assembleges.push(this.id);
      //activeAssembleges.push(this.id);
      window.localStorage.setItem('assemblages', JSON.stringify(assembleges));
      //window.localStorage.setItem('activeAssemblages', JSON.stringify(activeAssembleges));
      //window.localStorage.setItem('assemblage_last_id', this.id);
      //this.itemsInfo = {};

      if (arg instanceof Array) this.items = arg;

      this.load = this._handleInit();
      this.save();
    }
    else if (arg instanceof Object) {
      this.handleObj(arg);
      this.load = this._handleInit();
      this.save();
    }
    else if (arg instanceof String || typeof arg === "string") {
      try {
        this.handleObj(JSON.parse(arg));
        this.load = this._handleInit();
        this.save();
      }
      catch (e) {
        console.log('Error, while creating new Assemblage with string arg', e, arg);
      }
    }
    else if (typeof arg === "number") {
      //console.log('constructor number')
      this.handleObj(this._getAssemblage(arg));
      this.load = this._handleInit();
    }
  }

  async add(id) {
    //console.log('add', this, id);
    this.restore();

    if (this.items.length >= 50) {
      message(message.ERROR, `В сборке ${this.name ? this.name + ' ' : ''}уже слишком много комплектующих!`);
      return false;
    }

    this.items.push(id);
    //await this.loadItemInfo(id);
    this.save();
    // this._drawItem(this.itemsInfo[id], this.items.length - 1);
    // this._calcPrice();
    this._redraw();

    message(message.ADDED, this.name ? this.name : '', 2000);
    handleAddToAssemblageButtons();
    handleAssemblageButtons();
    return true;
  }

  remove(id, metaid) {
    //console.log('remove', this, id, metaid);
    this.restore();
    //if (metaid) {
    this.items.splice(this.itemsMeta[metaid].pos, 1);
    for (let mid in this.itemsMeta) {
      if (this.itemsMeta[mid].pos > this.itemsMeta[metaid].pos)
        this.itemsMeta[mid].pos--;
    }
    //}
    //else this.items.splice(this.items.indexOf(id), 1);
    this.save();
    // this._undrawItem(metaid);
    // this._calcPrice();
    this._redraw();
    handleAddToAssemblageButtons();
    handleAssemblageButtons();
    message(message.REMOVED, this.name ? this.name : '', 2000);
  }

  contains(id) {
    //console.log('contains', id, this);
    if (typeof id == "string") id = parseInt(id);
    //this.restore();
    return this.items.includes(id);
  }

  includes(id) {
    return this.contains(id);
  }

  save() {
    this._generateLink();
    this._signature();
    window.localStorage.setItem('assemblage_' + this.id, JSON.stringify(this));
  }

  restore() {
    //console.log('restore', this);
    let isChanged = this.handleObj(this._getAssemblage(this.id));
    if (isChanged) {
      this._redraw();
      handleAddToAssemblageButtons();
      handleAssemblageButtons();
      // this._calcPrice();
    }
    this.handleChoosing();
  }

  handleObj(o) {
    let isChanged = false;
    //console.log('handleObj', JSON.stringify(this), JSON.stringify(o));
    for (let k in o) {
      if (JSON.stringify(this[k]) != JSON.stringify(o[k])) isChanged = true;
      this[k] = o[k];
    }
    if (isChanged) this._generateLink();
    return isChanged;
  }

  async _handleInit() {
    //console.log('_handleInit', this);
    if (!this.items) this.items = [];
    if (!Object.hasOwnProperty(this, 'itemsInfo')) Object.defineProperty(this, 'itemsInfo', { configurable: true, enumerable: false, writable: true, value: {} });
    if (!Object.hasOwnProperty(this, 'elements')) Object.defineProperty(this, 'elements', { configurable: true, enumerable: false, writable: true, value: {} });
    if (!Object.hasOwnProperty(this, 'itemsMeta')) Object.defineProperty(this, 'itemsMeta', { configurable: true, enumerable: false, writable: true, value: [] });
    if (!Object.hasOwnProperty(this, 'lastMetaId')) Object.defineProperty(this, 'lastMetaId', { configurable: true, enumerable: false, writable: true, value: 0 });
    if (!Object.hasOwnProperty(this, 'onMainChange')) Object.defineProperty(this, 'onMainChange', { configurable: true, enumerable: false, writable: true, value: null });
    if (!Object.hasOwnProperty(this, 'load')) Object.defineProperty(this, 'load', { configurable: true, enumerable: false, writable: true, value: null });
    if (!Object.hasOwnProperty(this, 'loadItems')) Object.defineProperty(this, 'loadItems', { configurable: true, enumerable: false, writable: true, value: null });
    if (!Object.hasOwnProperty(this, 'no_draw')) Object.defineProperty(this, 'no_draw', { configurable: true, enumerable: false, writable: true, value: null });
    if (!Object.hasOwnProperty(this, 'price')) Object.defineProperty(this, 'price', { configurable: true, enumerable: false, writable: true, value: {} });
    if (!Object.hasOwnProperty(this, 'chooseButton')) Object.defineProperty(this, 'chooseButton', { configurable: true, enumerable: false, writable: true, value: null });
    if (!Object.hasOwnProperty(this, 'oldAccord_data')) Object.defineProperty(this, 'oldAccord_data', { configurable: true, enumerable: false, writable: true, value: null });
    if (!Object.hasOwnProperty(this, 'benchmarkInfo')) Object.defineProperty(this, 'benchmarkInfo', { configurable: true, enumerable: false, writable: true, value: null });
    if (!Object.hasOwnProperty(this, 'loadBenchmark')) Object.defineProperty(this, 'loadBenchmark', { configurable: true, enumerable: false, writable: true, value: null });
    this.elements.categoryItems = {};
    this.elements.items = {};
    //await this.loadItemsInfo();
    this._generateLink();

    this.elements.main = create(null, 'div');
    this.elements.main.innerHTML = `
            <ul class="sidebar__pc-parts pc-parts">
                <li class="pc-parts__item" data-icon="cpu" data-category="cpu" data-name-choosing="процессора" data-name-choose="процессор"></li>
                <li class="pc-parts__item" data-icon="graphics-card" data-category="graphics-card"  data-name-choosing="видеокарты" data-name-choose="видеокарту" ></li>
                <li class="pc-parts__item" data-icon="ram" data-category="ram"  data-name-choosing="оп. памяти" data-name-choose="оп. память" data-multi="true"></li>
                <li class="pc-parts__item" data-icon="rom" data-category="rom"  data-name-choosing="постоянной памяти" data-name-choose="постоянную память" data-multi="true"></li>
                <li class="pc-parts__item" data-icon="motherboard" data-category="motherboard" data-name-choosing="мат. платы" data-name-choose="мат. плату"></li>
                <li class="pc-parts__item" data-icon="psu" data-category="psu" data-name-choosing="блока питания" data-name-choose="блок питания"></li>
                <li class="pc-parts__item" data-icon="cooler" data-category="cooler"  data-name-choosing="охлаждения" data-name-choose="охлаждение" data-multi="true"></li>
                <li class="pc-parts__item" data-icon="periphery" data-category="periphery"  data-name-choosing="периферии" data-name-choose="периферию" data-multi="true"></li>
                <li class="pc-parts__item" data-icon="case" data-category="case"  data-name-choosing="корпуса" data-name-choose="корпус"></li>
                
            </ul>
            <div class="sidebar__conflicts conflicts">
                <div class="conflicts__title"></div>
                <div class="conflicts__body"></div>
            </div>
        `;
    //<li class="pc-parts__item" data-icon="other"></li>
    this.elements.categoryItems.cpu = this.elements.main.querySelector('li');
    this.elements.categoryItems['graphics-card'] = this.elements.main.querySelector('li:nth-child(2)');
    this.elements.categoryItems['ram'] = this.elements.main.querySelector('li:nth-child(3)');
    this.elements.categoryItems['rom'] = this.elements.main.querySelector('li:nth-child(4)');
    this.elements.categoryItems['motherboard'] = this.elements.main.querySelector('li:nth-child(5)');
    this.elements.categoryItems['psu'] = this.elements.main.querySelector('li:nth-child(6)');
    this.elements.categoryItems['cooler'] = this.elements.main.querySelector('li:nth-child(7)');
    this.elements.categoryItems['periphery'] = this.elements.main.querySelector('li:nth-child(8)');
    this.elements.categoryItems['case'] = this.elements.main.querySelector('li:nth-child(9)');

    this.elements.conflictsBody = this.elements.main.querySelector('.conflicts__body');
    this.elements.conflictsTitle = this.elements.main.querySelector('.conflicts__title');

    //this.#handleChoose();
    // this.handleChoosing();
    //this._drawItems();
    await this._redraw(); //TODO is to await redraw???

    //this._calcPrice();
    //this._manageDataIconsAssemblage(this.elements.main);
  }

  async loadBenchmarkInfo() {
    let result = await load('get_assemblage_benchmark_game_stats', { items_id: this.items });

    if (!result /*|| !result.items*/) {
      //TODO error handling
      console.error('loadBenchmarkInfo ERROR', result, this.items);
      return;
    }

    this.benchmarkInfo = result.accord_data;
    //console.log(result);
    return this.benchmarkInfo;
  }

  async loadItemsInfo(force_reload = false) {
    // let allLoads = [];
    // console.log('loadItemsInfo', this)
    // for (let item_id of this.items) {
    //     allLoads.push(load('get_item', {item_id}).then(info => {
    //         this.itemsInfo[item_id] = info;
    //     }));
    // }
    // return Promise.all(allLoads);
    let items_id = [];
    if (force_reload) {
      items_id = this.items;
    }
    else {
      for (let item of this.items)
        if (!this.itemsInfo[item]) items_id.push(item);
    }

    if (items_id.length < 1) return;

    let result = await load('get_items', { items_id });
    //console.log('loadItemsInfo', result, items_id);
    if (!result || !result.items) {
      //TODO error handling
      console.error('loadItemsInfo ERROR', result, items_id);
      return;
    }
    //console.log('2 loadItemsInfo', result);
    for (let item in result.items) {
      this.itemsInfo[item] = result.items[item];
    }
    //console.log('loadItemsInfo', result, items_id);
  }

  async loadItemInfo(item_id) {
    let result = await load('get_item', { item_id });
    this.itemsInfo[item_id] = result;
  }

  //appearence

  _drawChoosing(categoryItem) {
    //TODO probably unnecessary
    for (let i in this.elements.categoryItems) {
      if (this.elements.categoryItems[i].classList.contains('pc-part--current'))
        this._drawChoose(this.elements.categoryItems[i]);
    }

    categoryItem.classList.add('pc-part--current');
    categoryItem.classList.add('pc-part');
    categoryItem.classList.remove('pc-parts__choose-item');
    categoryItem.innerHTML = `
            <span class="pc-part__current-icon">
                <span></span>
                <span></span>
                <span></span>
            </span>
            <p>Выбор ${categoryItem.dataset.nameChoosing}</p>`;

    //TODO redo, it shoould be a part of class
    //this._manageDataIconsAssemblage(this.elements.main);
  }

  _drawMultiChoosing(categoryItem) {
    //TODO probably unnecessary
    for (let i in this.elements.categoryItems) {
      if (this.elements.categoryItems[i].querySelector('.pc-parts--multi-current'))
        this._drawMultiChoose(this.elements.categoryItems[i]);
    }

    if (categoryItem.querySelector('.pc-parts__add-item')) categoryItem.querySelector('.pc-parts__add-item').remove();

    let currentDiv = create(categoryItem, 'div', 'pc-parts--multi-current');
    currentDiv.innerHTML = `
            <span class="pc-part__current-icon">
                <span></span>
                <span></span>
                <span></span>
            </span>
            <p>Выбор ${categoryItem.dataset.nameChoosing}</p>`;

  }

  _drawChoose(categoryItem) {
    categoryItem.classList.remove('pc-part--current');
    categoryItem.classList.remove('pc-part');
    categoryItem.classList.add('pc-parts__choose-item');
    categoryItem.innerHTML = `
            <a href="/category/${categoryItem.dataset.category}/">
                Выбрать ${categoryItem.dataset.nameChoose}
            </a>`;
  }

  _drawMultiChoose(categoryItem) {
    if (categoryItem.querySelector('.pc-parts--multi-current')) categoryItem.querySelector('.pc-parts--multi-current').remove();
    if (categoryItem.dataset.multi && !categoryItem.querySelector('.pc-parts__add-item')) {
      let addButton = create(categoryItem, 'a', 'pc-parts__add-item');
      addButton.append(`Добавить ${categoryItem.dataset.nameChoose}`);
      addButton.href = `/category/${categoryItem.dataset.category}/`;
    }
  }

  _manageDataIconsAssemblage(where = document) {
    const dataIcons = where.querySelectorAll('[data-icon]')
    if (dataIcons.length) {
      dataIcons.forEach(item => {
        const { icon } = item.dataset
        let oldIcon = item.querySelector(`.svg-icon.icon-${icon}`);
        if (oldIcon) oldIcon.remove();
        //TODO redo
        // if (!item.querySelector(`.svg-icon.icon-${icon}`)) {
        if (item.classList.contains('pc-parts__choose-item')) {
          item.insertAdjacentHTML('afterbegin', `<span class="svg-icon icon-${icon}"></span>`)
        } else {
          const title = item.querySelector('.pc-part__title') || item
          title.insertAdjacentHTML('afterbegin', `<span class="svg-icon icon-${icon}"></span>`)
        }
        // }
      })
    }
  }

  async _redraw() {
    //console.log('_redraw', this.no_draw, this);
    //TODO
    this.loadItems = this.loadItemsInfo();
    this.loadBenchmark = this.loadBenchmarkInfo();

    await this.loadItems;
    await this._handleAccording(false);


    //console.log('_redraw pre no_draw', this);
    if (this.no_draw) return;
    //console.log('_redraw after no_draw', this);

    this.itemsMeta = {};
    for (let mid in this.elements.items) this.elements.items[mid].remove();
    this._drawItems();
    this._calcPrice();

    this.elements.conflictsBody.innerHTML = '';
    this.elements.conflictsTitle.dataset.conflictsNum = this.accord_data.filter(e => e.type != "Notification").length;
    manageConflictsTitle(this.elements.conflictsTitle);
    // let conflicts_num = this.accord_data.filter(e => e.type != "Notification").length;
    // if (conflicts_num < 1) this.elements.conflictsTitle.innerText = `Нет конфликтов`;
    // else if (conflicts_num == 1) this.elements.conflictsTitle.innerText = `1 конфликт`;
    // else if (conflicts_num < 5) this.elements.conflictsTitle.innerText = `${this.accord_data.length} конфликта`;
    // else this.elements.conflictsTitle.innerText = `${this.accord_data.length} конфликтов`;

    for (let i = 0; i < this.accord_data.length; i++) {
      let c = create(this.elements.conflictsBody, 'p', 'conflicts__item');
      if (this.accord_data[i].type == "Notification") {
        c.classList.add('conflicts__item--question');
        //c.classList.remove('conflicts__item');
      }
      c.dataset.conflictId = `s${i}`;
      c.innerText = this.accord_data[i].txt;
    }

    window.requestAnimationFrame(() => this._redrawConflicts());
    //this._redrawConflicts();
    this.handleChoosing();
    this._manageDataIconsAssemblage();
  }

  _drawItems() {
    for (let i in this.items) {
      this._drawItem(this.itemsInfo[this.items[i]], +i);
    }
  }

  _undrawItem(metaId) {
    this.elements.items[metaId].remove();
    delete this.itemsMeta[metaId];
    // this.#handleChoose();
    this.handleChoosing();
    // this._manageDataIconsAssemblage(this.elements.main);
  }

  _drawItem(item, pos) {
    //console.log('_drawItem', this.elements.categoryItems[item.type.text_id], item);
    let categoryItem = this.elements.categoryItems[item.type.text_id];
    if (!categoryItem) return;
    //console.log('_drawItem 2', categoryItem, item);
    let meta = { id: ++this.lastMetaId, itemId: item.id, pos };
    this.itemsMeta[meta.id] = meta;
    let itemElement = create(null, 'div', 'pc-part');
    this.elements.items[meta.id] = itemElement;

    itemElement.innerHTML = `
        <div class="pc-part__description">
            <div class="pc-part__title">
                <a href="/${local('url')}/${item.text_id}/">${item.title}</a>
            </div>
            <p class="pc-part__details pc-part__details--gradient" title="${item.txt_short_info ? item.txt_short_info : ""}">${item.txt_short_info ? item.txt_short_info : ""}</p>
            <span class="pc-part__cancel svg-icon icon-cancel-filter"></span>
        </div>
        <span class="pc-part__price">${item?.min_price?.hasOwnProperty('value') ? item.min_price.value : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;–&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</span>
        `;

    {
      const description = itemElement.querySelector('.pc-part__description')
      const title = description.querySelector('.pc-part__title')
      const titleA = title.querySelector('a')
      const details = description.querySelector('.pc-part__details')
      if (titleA.getBoundingClientRect().width >= 215) {
        title.classList.add('pc-part__title--gradient')
      }
      else title.classList.remove('pc-part__title--gradient')
      if (details.getBoundingClientRect().width >= 215) {
        details.classList.add('pc-part__details--gradient')
      }
      else details.classList.remove('pc-part__details--gradient')
    }

    itemElement.querySelector('.pc-part__cancel').addEventListener('click', e => {
      //console.log('click remove', item.id);
      this.remove(item.id, meta.id);
    });

    categoryItem.classList.remove('pc-part--current');
    categoryItem.classList.remove('pc-part');
    categoryItem.classList.remove('pc-parts__choose-item');

    if (categoryItem.querySelector('.pc-parts__add-item')) categoryItem.querySelector('.pc-parts__add-item').before(itemElement);
    else if (categoryItem.querySelector('.pc-part__description')) categoryItem.append(itemElement);
    else categoryItem.replaceChildren(itemElement);

    let conflictsIds = this._getItemConflictsIds(item.id);
    if (conflictsIds.length) itemElement.dataset.conflictId = conflictsIds.map(e => `s${e}`).join(' ');



    // if (categoryItem.dataset.multi && !categoryItem.querySelector('.pc-parts__add-item')) {
    //     let addButton = create(categoryItem, 'a', 'pc-parts__add-item');
    //     addButton.append(`Добавить ${categoryItem.dataset.nameChoose}`);
    //     addButton.href = `/category/${categoryItem.dataset.category}/`;
    // }

    //this.handleChoosing();
    this._manageDataIconsAssemblage(this.elements.main);

  }

  _getItemConflictsIds(itemId) {
    let result = [];
    for (let i = 0; i < this.accord_data.length; i++) {
      if (this.accord_data[i].conflict_items.includes('' + itemId)) result.push(i);
      else if (this.accord_data[i].items.includes('' + itemId)) result.push(i);
    }
    return result;
  }
  // #handleChoose(){
  //     for (let categoryItemKey in this.elements.categoryItems) this._drawChoose(this.elements.categoryItems[categoryItemKey]);
  // }

  handleChoosing() {
    for (let itemKey in this.elements.categoryItems) {
      let categoryItem = this.elements.categoryItems[itemKey];
      let isChoosing = location.pathname.includes(`/category/${categoryItem.dataset.category}/`) || data?.item?.type?.text_id == categoryItem.dataset.category;
      if (categoryItem.dataset.category && !categoryItem.querySelector('.pc-part')) {
        if (isChoosing) {
          this._drawChoosing(categoryItem);
        }
        else if (categoryItem.classList.contains('pc-part--current') || !categoryItem.classList.contains('pc-parts__choose-item'))
          this._drawChoose(categoryItem);
      }
      else if (categoryItem.dataset.multi) {
        if (isChoosing && !categoryItem.querySelector('.pc-part--current')) {
          this._drawMultiChoosing(categoryItem);
        }
        else if (!isChoosing && !categoryItem.querySelector('.pc-parts__add-item'))
          this._drawMultiChoose(categoryItem);
      }
    }
    this._manageDataIconsAssemblage(this.elements.main);
  }

  _calcPrice() {
    let newPrice = { value: 0, uncalced: 0 };
    if (!this.price) this.price = {};

    for (let itemId of this.items) {
      if (this.itemsInfo[itemId].hasOwnProperty('min_price') && this.itemsInfo[itemId].min_price.hasOwnProperty('value')) {
        newPrice.value += +this.itemsInfo[itemId].min_price.value;
      }
      else newPrice.uncalced++;
    }

    newPrice.value = +newPrice.value.toFixed(2);

    if (newPrice.value != this.price.value || newPrice.uncalced != this.price.uncalced) {
      let oldPrice = this.price;
      this.price = newPrice;
      this._mainChange("price", this.price, oldPrice);
    }
  }

  _mainChange(type, newValue, oldValue) {
    if (typeof this.onMainChange === "function") {
      this.onMainChange(type, newValue, oldValue);
    }
  }

  setName(newName) {
    this.restore();
    let oldName = this.name;
    this.name = newName;
    this.save();
    this._mainChange("name", newName, oldName);
  }

  getName(no_placeholder = false) {
    let placeholder = no_placeholder ? "" : "Безымянная сборка";
    return this.name ? this.name : placeholder;
  }

  _generateLink() {
    let oldLink = this.link;
    this.link = `/${local('url')}/assemblage/${encodeURIComponent(this.getName(true))}/${this.items.join()}/`;

    if (oldLink != this.link) {
      this._mainChange("link", this.link, oldLink);
    }
  }

  deactivate() {
    //console.log('deactivate');
    let activeAssemblegesIds = getActiveAssemblagesIds();
    let pos = activeAssemblegesIds.indexOf(this.id);
    if (pos >= 0) {
      if (activeAssemblegesIds.length <= 1) {
        console.log('   deactivate return ', activeAssemblegesIds.length, pos, this.chooseButton);
        //TODO  
        return;
      }
      activeAssemblegesIds.splice(pos, 1);
      window.localStorage.setItem('activeAssemblages', JSON.stringify(activeAssemblegesIds));
    }
    console.log('   deactivate ', this.chooseButton, this.elements?.main);
    if (this.chooseButton) this.chooseButton.remove();
    if (this.elements?.main) this.elements.main.remove();
    handleAssemblageButtons();
    //if (window.localStorage.getItem('last_changed_assemblage_id') == this.id) window.localStorage.setItem('last_changed_assemblage_id', activeAssemblegesIds[activeAssemblegesIds.length - 1]);
  }

  activate() {
    let activeAssembleges = getActiveAssemblagesIds();
    activeAssembleges.push(this.id);
    window.localStorage.setItem('activeAssemblages', JSON.stringify(activeAssembleges));
    window.localStorage.setItem('assemblage_last_id', this.id);
    handleAssemblageButtons();
  }

  async _handleAccording(isRedrawConflicts = true) {
    // await load('accord_items', {items_id: this.items}).then(response => {
    //     this.accord_data = response.accord_data;

    // });
    this.oldAccord_data = this.accord_data;
    this.accord_data = (await load('accord_items', { items_id: this.items })).accord_data;
    //console.log('_handleAccording', this.accord_data);
    if (isRedrawConflicts && JSON.stringify(this.oldAccord_data) != JSON.stringify(this.accord_data)) this._redrawConflicts();
  }

  _redrawConflicts() {
    if (typeof manageConflicts == 'function') manageConflicts(this.elements.main);
  }

  choose() {
    this._is_choosen = true;
    this._redrawConflicts();
  }
  unchoose() {
    this._is_choosen = false;
  }

  is_choosed() {
    return this._is_choosen;
  }

  _signature() {
    this.signatureValue = Assemblage.getSignature(this.items);

    let assemblage_signatures_string = localStorage.getItem('assemblage_signatures');
    let assemblage_signatures = {};
    if (assemblage_signatures_string) assemblage_signatures = JSON.parse(assemblage_signatures_string);
    assemblage_signatures[this.id] = this.signatureValue;
    localStorage.setItem('assemblage_signatures', JSON.stringify(assemblage_signatures));

    return this.signatureValue;
  }

  get signature() {
    if (this.hasOwnProperty('signatureValue')) return this.signatureValue;
    return this._signature();
  }

  static getSignature(items) {
    return [...items].sort().reduce((a, e) => { let s = e.toString(36); while (s.length < 3) s = '0' + s; return ('' + a) + s; }, '');
  }

  isEqual(o) {
    //console.log('isEqual', this, o);
    if (typeof o == 'string') {
      return this.signature == o; //TODO redo no need in recalculation
    }
    else if (o instanceof Array) {
      return this.signature == Assemblage.getSignature(o);
    }
    else if (o instanceof Assemblage) {
      return this.signature == o.signature;
    }
    else return false;
  }

  async drawCard(target) {
    await this.loadItems;
    this._calcPrice();

    this.loadBenchmark = this.loadBenchmarkInfo();

    //console.log('drawCard', this)

    let generateMainElements = () => {

      let html = '';

      if (this.items.length < 1) return `
            <span class="placeholder-notification"> 
                Вы пока не добавили ни одной комплектующей ${smile('sad')}
            </span>
            `;

      for (let i in this.items) {
        let item = this.itemsInfo[this.items[i]];

        if (!['cpu', 'graphics-card'].includes(item.type.text_id)) continue;

        html += '\n' + `
                <a class="product__item-link" href="/${local('url')}/${item.text_id}/">
                    <div class="product__item">
                        <span class="product__item-icon svg-icon icon-${item.type.text_id}"></span>
                        <div class="product__item-info">
                            <div class="product__item-title">
                            ${item.title}
                            </div>
                            <div class="product__item-details">
                            ${item.txt_short_info ? item.txt_short_info : ""}
                            </div>
                        </div>
                        <div class="product__item-price">
                            ${item?.min_price?.hasOwnProperty('value') ? item.min_price.value : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;–&nbsp;&nbsp;&nbsp;&nbsp;'}${local('currency')}
                        </div>
                    </div>
                </a>
                `;
      }

      return html
    };

    let generateElements = () => {

      let html = '';

      let categories = {};

      for (let i in this.items) {
        let item = this.itemsInfo[this.items[i]];


        if (['cpu', 'graphics-card'].includes(item.type.text_id)) continue;
        if (categories[item.type.text_id]) categories[item.type.text_id].push(item);
        else categories[item.type.text_id] = [item];
      }

      let generateElement = (category_name, info_string, count = null) => {

        let title = categories[category_name].reduce((a, i) => a + (a ? ', ' : '') + i.title, '');
        let html = '\n' + `
                <div class="product__data-info">
                    <span class="product__data-icon svg-icon icon-${category_name}" title="${title}"></span>`;
        if (!count) count = categories[category_name].length;
        if (count > 1 /*|| info_string*/) html += `<span class="product__data-text">${'x' + count}${info_string && false ? ': ' + info_string : ''}</span>`;
        html += `</div>`;
        return html;
      }

      if (categories['motherboard']) html += generateElement('motherboard');

      if (categories['ram']) {
        let info_string = '';
        let ram = 0;
        let count = 0;
        let types = [];

        for (let i in categories['ram']) {
          let is_count_calced = false;
          for (let p of categories['ram'][i].property) {
            if (p.id == '11875' && !types.includes(p.value)) types.push(p.value);   //'Типы памяти'
            if (p.id == '11878') ram += +p.value;   //'Объем памяти'
            if (p.id == '11879') {  //'Количество планок'
              count += +p.value;
              is_count_calced = true;
            }
          }
          if (!is_count_calced) count++;
        }

        info_string = `${ram} ГБ, ${types.join('/')}`;

        html += generateElement('ram', info_string, categories['ram'].length/*count*/);
      }

      if (categories['rom']) {
        let info_string = '';
        let rom = 0;
        let types = [];

        for (let i in categories['rom']) {
          for (let p of categories['rom'][i].property) {
            if (p.id == '12107' && !types.includes(p.value)) types.push(p.value);   //'Тип памяти'
            if (p.id == '12106' || p.id == '12128') rom += +p.value;   //'Емкость'
          }
        }

        info_string = `${rom} ГБ, ${types.join('/')}`;

        html += generateElement('rom', info_string);
      }

      if (categories['psu']) {
        let info_string = '';
        let wt = [];

        for (let i in categories['psu']) {
          for (let p of categories['psu'][i].property) {
            if (p.id == '12398' || p.id == '12430') { //'Мощность'
              wt.push(p.value);
              //break;
            }
          }
        }

        info_string = `${wt.join('/')} Вт`;

        html += generateElement('psu', info_string);
      }

      if (categories['cooler']) html += generateElement('cooler');
      if (categories['periphery']) html += generateElement('periphery');
      if (categories['case']) html += generateElement('case');

      return html;
    };

    let el = create(target, 'div', 'section__product', 'product', 'product--long', 'product__assembly');
    let price = this.price.value + ' ' + local('currency');
    if (this.price.uncalced == 1) price = '>' + price;
    else if (this.price.uncalced > 1) price = '>>' + price;
    let html = `
                <div class="product__wrapper product__assembly-wrapper">

                    <div class="product__assembly-header">
                        <h2 class="product__assembly-title">
                            <a class="product__link product__assembly-link" href="${this.link}">
                                <span class="svg-icon icon-collection"></span>
                                ${this.getName()}
                            </a>
                        </h2>
                        <div class="product__assembly-info">
                            <button class="product__button product__button--small product__button--small--grey remove-assemblage">
                                <span class="svg-icon icon-cancel"></span>
                            </button>
                            <button class="product__assembly-add-btn elekanura_tukar_tenati" data-ids="${this.items.join()}" data-assemblage-personal-id="${this.id}">
                                <span class="svg-icon icon-add-assemblage"></span>
                            </button>
                            <div class="product__assembly-price">
                                от <span>
                                    ${price}
                                </span>
                            </div>
                        </div>
                        <!--<div class="sale">
                        -25%
                        </div>-->
                    </div>
                    <div class="product__assembly-body">
                        <div class="product__items">
                        
                            ${generateMainElements()}
                        
                        </div>
                        <div class="product__data">
                            ${generateElements()}
                        </div>

                        <div class="product__price-and-buttons">

                            <div class="product__buttons">
                                <a href="${this.link}">
                                    <button class="product__button product__button--big">
                                        <span class="svg-icon icon-link"></span>
                                        <span class="product__button-text">Страница сборки</span>
                                    </button>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
        `;
    //manageProductScoreRating(e);

    el.innerHTML = html;

    this.loadBenchmark.then(
      () => {
        let score = "";
        if (this.benchmarkInfo) {
          score = `
                    <span class="product__rating product-score-rating"
                        data-min-p="${this.benchmarkInfo.minrequirement.game_percent}"
                        data-rec-p="${this.benchmarkInfo.recrequirement.game_percent}"
                        data-min-y="${this.benchmarkInfo.minrequirement.max_year}"
                        data-rec-y="${this.benchmarkInfo.recrequirement.max_year}"
                    >
                        ${this.benchmarkInfo.total_mark}
                    </span>`;

          el.querySelector('.product__price-and-buttons').insertAdjacentHTML('afterbegin', score);
          manageProductScoreRating(el.querySelector('.product__rating'));
        }

      }

    );



    el.querySelector('.remove-assemblage').onclick = () => {
      dialogue('Вы уверены, что хотите насовсем удалить эту сборку?', (r) => {
        if (r) {
          el.remove();
          this._full_remove();

        }
      });
    };
    return el;
  }

  _full_remove() {
    console.log('_full_remove id:', this.id);
    this.deactivate();
    removeAssemblageFromActive(this);

    if (!this.id) return;
    let assembleges = getAssemblagesIds();
    assembleges.splice(assembleges.indexOf(this.id), 1);
    window.localStorage.setItem('assemblages', JSON.stringify(assembleges));

    window.localStorage.removeItem('assemblage_' + this.id);

    let assemblage_signatures_string = localStorage.getItem('assemblage_signatures');
    let assemblage_signatures = {};
    if (assemblage_signatures_string) assemblage_signatures = JSON.parse(assemblage_signatures_string);
    if (this.id in assemblage_signatures) {
      delete assemblage_signatures[this.id];
      localStorage.setItem('assemblage_signatures', JSON.stringify(assemblage_signatures));
    }
  }
}

//handlers
//-----message
function dialogue(message, handler) {
  handler(confirm(message));
}

function message(typeOrOptions, text, time) {
  let options = { time: 5000 };
  let type;
  if (typeof typeOrOptions == "number") type = typeOrOptions;
  else if (typeOrOptions.template) {
    type = typeOrOptions.template;
    options.template = type;
  }

  if (typeof type == "number") {
    switch (type) {
      case message.ERROR:
        options.icon = { symbol: '✖', style: 'border-radius: 15px; padding: 0px 5px 1px 4px; background-color: #da0b29;' };
        options.title = 'Ошибка';
        break;
      case message.OK:
        options.icon = { symbol: '✔', style: 'border-radius: 15px; padding: 0 4px 1px 4px; background-color: green;' };
        break;
      case message.ADDED:
        options.icon = { symbol: '+', style: 'font-size: 18px; font-weight: 700;' };
        options.title = 'Добавлено в сборку';
        break;
      case message.REMOVED:
        options.icon = { symbol: '-', style: 'font-size: 18px; font-weight: 700;' };
        options.title = 'Удалено со сборки';
        break;
      case message.WARNING:
        options.icon = { symbol: '!', style: 'border-radius: 15px; padding: 0px 6px 1px; background-color: #e0a006;' };
        options.title = 'Внимание';
        break;
      case message.LOADING:
        options.icon = { html: '<div class="spiner-wrapper"><div class="big-spiner"></div><div class="small-spiner"></div></div>' };
        options.title = 'Загрузка';
        options.time = 0;
        break;
      case message.ERROR2:
        options.icon = { svg: true, class: 'icon-to-assemblage' };
        options.title = 'Error2';
        break;
    }
  }
  else options = typeOrOptions;

  if (options.template) {
    options = { ...options, ...typeOrOptions };
  }

  if (typeof time != 'undefined') options.time = time;
  else if (options.button) options.time = -1;

  let oldMessage = document.querySelector('#message_body')
  if (oldMessage) oldMessage.remove();

  let m = create(document.body, 'div', 'message', 'block');
  m.id = "message_body";
  if (options.icon) {
    let icon = create(m, 'span');
    if (options.icon.svg) icon.classList.add('svg-icon');
    if (options.icon.class) icon.classList.add(options.icon.class);
    if (options.icon.symbol) icon.innerText = options.icon.symbol;
    if (options.icon.style) icon.style = options.icon.style;
    if (options.icon.html) icon.innerHTML = options.icon.html;
  }

  let t = create(m, 'span');
  if (options.title) {
    t.innerText = options.title;
  }
  if (text) {
    t.innerText += (t.innerText ? ': ' : '') + text;
  }
  //t = 

  // m.innerHTML = `<span class="svg-icon icon-to-assemblage"></span> <span>test</span>`;

  if (options.buttons) {
    for (let button of options.buttons) {
      let b = create(m, 'span', 'message_button');
      b.innerText = button.text;
      b.addEventListener('click', () => {
        button.func?.();
        m.remove();
      });
    }
  }

  m.onclick = () => {
    m.remove();
  };
  if (options.time && options.time > 0) {
    setTimeout(() => m.remove(), options.time);
  }
  return m;
}
message.ERROR = 1;
message.OK = 2;
message.ADDED = 3;
message.REMOVED = 4;
message.WARNING = 5;
message.LOADING = 6;
//message.ERROR = 2;

//-----assemblage
//
function handleChooseAssemblageButtons() {
  lastAssemblageChooseButtonIndex = 0;
  for (let a of activeAssemblages) {
    if (a.chooseButton) a.chooseButton.querySelector('a').innerText = ++lastAssemblageChooseButtonIndex;
  }
}

function createAssemblageChooseButton(a) {
  if (a.chooseButton) a.chooseButton.remove();
  a.chooseButton = create(null, 'li', 'pagination__page-wrapper');
  document.querySelector('.assemblage-items__pages.pagination > ul > li:last-child').before(a.chooseButton);
  let link = create(a.chooseButton, 'a', 'pagination__page-button');
  link.innerText = ++lastAssemblageChooseButtonIndex;
  link.href = '#';

  link.onclick = (e) => {
    e.preventDefault();
    chooseAssemblage(a);
  };

  a.chooseButton.oncontextmenu = function oncontextmenu(e) {
    e.preventDefault();
    if (activeAssemblages.length == 1) {
      //TODO
      return;
    }
    function remove_additional_buttons(e) {

      //console.log('remove_additional_buttons', e);
      if (e && a.chooseButton.contains(e.target)) {
        //console.log('   remove_additional_buttons not now');
        return;
      }
      a.chooseButton.style.position = null;
      c.remove();
      a.chooseButton.oncontextmenu = oncontextmenu;
      document.body.removeEventListener('click', remove_additional_buttons);
      document.body.removeEventListener('contextmenu', remove_additional_buttons);
    };

    document.body.addEventListener('click', remove_additional_buttons);
    document.body.addEventListener('contextmenu', remove_additional_buttons);


    a.chooseButton.oncontextmenu = null;
    let c = create(a.chooseButton, 'a', 'pagination__page-button', 'cancel');
    a.chooseButton.style.position = 'relative';
    c.innerText = '✖';
    c.href = '#';

    c.onclick = (e) => {
      e.preventDefault();
      // if (a == mainAssemblage){
      //     //TODO
      //     return;
      // }
      handleAssemblageButtons();
      removeAssemblageFromActive(a);
      handleChooseAssemblageButtons();
      remove_additional_buttons();
    };


  };
}

function createPopup(content, ...classes) {
  let container = create(document.body, 'div', 'popup__container');
  let modal = create(container, 'div', 'block', 'popup__modal', ...classes);
  let close = create(modal, 'span', 'popup__close');

  close.append('✕');

  close.onclick = () => container.remove();

  if (content) modal.append(content);

  return { container, modal, close };
}

function assemblageInit() {
  mainAssemblageId = window.localStorage.getItem('last_changed_assemblage_id');
  activeAssemblages = getActiveAssemblages();
  if (activeAssemblages.length < 1) {
    let a = new Assemblage();
    a.activate();
    activeAssemblages.push(a);
  }
  if (!mainAssemblageId) {
    mainAssemblageId = activeAssemblages[activeAssemblages.length - 1].id;
    mainAssemblage = activeAssemblages[activeAssemblages.length - 1];
  }

  for (let a of activeAssemblages) {
    if (!mainAssemblage && a.id == mainAssemblageId) mainAssemblage = a;
    createAssemblageChooseButton(a);
  };

  if (!mainAssemblage) mainAssemblage = activeAssemblages[0];


  let assemblageNewButton = document.querySelector('.assemblage-items__pages.pagination > ul > li:last-child');
  if (activeAssemblages.length >= max_active_assemblages) assemblageNewButton.style.display = "none";
  assemblageNewButton.onclick = () => newAssemblageToActive();

  chooseAssemblage(mainAssemblage);
  handleAssemblageButtons();

  let qr = document.querySelector('.assemblage-items__pages.pagination .block-icon-links .icon-qr');
  //qr.dataset.href = this.link;

  // if (!this.elements.qr) this.elements.qr = create(null, 'div');

  qr.onclick = () => {
    let { modal } = createPopup('', 'qrcode');
    new QRCode(modal, {
      text: location.origin + qr.dataset.href,
      width: 800,
      height: 800,
      colorDark: '#fff',
      colorLight: '#ffffff00',
      correctLevel: QRCode.CorrectLevel.H
    });
  };
  if (!document.querySelector('.sidebar--assemblage').classList.contains('sidebar--upper') && window.innerWidth >= 1770) {
    afterManageActions.push(() => document.querySelector('.sidebar__btn--assemblage')?.click());
  }
}

function newAssemblageToActive(assemblage_info) { //id of user assemblage | array of items ids | undefined

  let assemblageNewButton = document.querySelector('.assemblage-items__pages.pagination > ul > li:last-child');
  if (activeAssemblages.length >= max_active_assemblages) {
    assemblageNewButton.style.display = "none";
    message(message.ERROR, 'Вы достигли максимального количества активных сборок. Удалить сборку можно, нажав правым кликом по ее номеру.');
    return;
  }

  let a = new Assemblage(assemblage_info);
  a.activate();

  activeAssemblages.push(a);
  createAssemblageChooseButton(a);
  if (activeAssemblages.length >= max_active_assemblages) {
    assemblageNewButton.style.display = "none";
    message(message.WARNING, 'Вы достигли максимального количества активных сборок. Удалить сборку можно, нажав правым кликом по ее номеру.');
  }
  return a;
}

function handleAddToAssemblageButtons() {
  //let addToAsseblageButtons = document.querySelectorAll('[data-add-to-assemblage]');
  let addToAsseblageButtons = document.querySelectorAll('[onclick^=addToMainAssemblage]');
  for (let b of addToAsseblageButtons) {
    if (isInActiveAssemblage(b.dataset.id)) {
      b.querySelector('.icon-to-assemblage').classList.add('added');
      b.querySelector('span + span').innerText = 'В сборке';
    }
    else {
      b.querySelector('.icon-to-assemblage').classList.remove('added');
      b.querySelector('span + span').innerText = 'В сборку';
    }
  }
}

function isInActiveAssemblage(id) {
  for (let a of activeAssemblages) {
    if (a.contains(id)) return true;
  }
  return false;
}

function removeAssemblageFromActive(a) {
  //console.log('removeAssemblageFromActive', a);
  let pos = activeAssemblages.indexOf(a);
  if (pos && activeAssemblages.length <= 1) newAssemblageToActive();

  if (a == mainAssemblage && activeAssemblages.indexOf(a) < activeAssemblages.length - 1) chooseAssemblage(activeAssemblages[activeAssemblages.indexOf(a) + 1]);
  else if (a == mainAssemblage && activeAssemblages.indexOf(a) == activeAssemblages.length - 1) chooseAssemblage(activeAssemblages[activeAssemblages.length - 2]);


  if (pos >= 0) {
    activeAssemblages.splice(pos, 1);
  }


  a.deactivate();

  if (activeAssemblages.length < max_active_assemblages) document.querySelector('.assemblage-items__pages.pagination > ul > li:last-child').style.display = null;
}

function getActiveAssemblagesIds() {
  let assemblagesLine = window.localStorage.getItem('activeAssemblages');
  let assemblagesIds = [];
  if (assemblagesLine) {
    try {
      assemblagesIds = JSON.parse(assemblagesLine);
    }
    catch (e) {
      console.log('Error in activeAssemblages');
      assemblagesIds = [];
    }

  }
  return assemblagesIds;
}

function getActiveAssemblages() {
  let assemblagesIds = getActiveAssemblagesIds();
  let assemblages = [];
  for (let id of assemblagesIds) assemblages.push(new Assemblage(id));
  return assemblages;
}

function getAssemblagesIds() {
  let assemblagesLine = window.localStorage.getItem('assemblages');
  let assemblagesIds = [];
  if (assemblagesLine) assemblagesIds = JSON.parse(assemblagesLine);
  return assemblagesIds;
}

function getAssemblages() {
  let assemblagesIds = getAssemblagesIds();
  let assemblages = [];
  for (let id of assemblagesIds) assemblages.push(new Assemblage(id, true));
  return assemblages;
}



function addToSomeAssemblage(id, e, el) {
  //e.preventDefault();
  //console.log('addToSomeAsseblage',id, el);
}

function addToMainAssemblage(id, e, el) {
  //console.log('addToMainAsseblage', id, el);
  let tongue = document.querySelector('.sidebars__right .sidebar--assemblage .sidebar__btn');
  if (tongue) {
    tongue.classList.add('hovered');
    setTimeout(() => tongue.classList.remove('hovered'), 300);
  }

  if (mainAssemblage.items.length <= 0) {
    if (document.querySelector('.sidebars__right--hidden .sidebar--assemblage') || document.querySelector('.sidebar--assemblage:not(.sidebar--upper)')) {
      document.querySelector('.sidebar__btn--assemblage')?.click();
    }
  }
  mainAssemblage.add(id);
  /*el.querySelector('.icon-to-assemblage').classList.add('added');
  el.querySelector('span + span').innerText = 'В сборке';*/

}

function handleChoosingInAssemblage() {
  for (let a of activeAssemblages) a.handleChoosing();
}

async function chooseAssemblage(a) {
  //console.log('chooseAssemblage', a);
  if (!a) a = newAssemblageToActive();
  await a.load;

  //console.log('   chooseAssemblage loaded');
  if (mainAssemblage) mainAssemblage.unchoose();

  mainAssemblage = a;
  mainAssemblageId = a.id;
  window.localStorage.setItem('last_changed_assemblage_id', a.id);

  let oldAssemblageDiv = document.querySelector('.assemblage-items > div:not(.assemblage-items__footer):not(.unchoosed)');
  //document.querySelector('.assemblage-items > div:not(.assemblage-items__footer)')?.remove();
  if (oldAssemblageDiv) {
    oldAssemblageDiv.classList.remove('choosed');
    oldAssemblageDiv.classList.add('unchoosed');
    oldAssemblageDiv.style.display = 'none';
  }

  a.elements.main.style.display = '';
  a.elements.main.classList.add('choosed');
  a.elements.main.classList.remove('unchoosed');
  if (!a.elements.main.isConnected) document.querySelector('.assemblage-items').prepend(a.elements.main);
  document.querySelector('.assemblage-items__name').onchange = function () {
    a.setName(this.value);
    message({ icon: { symbol: '✎', style: 'font-size: 18px; font-weight: 700;' }, title: 'Название сборки изменено' }, a.name, 2000);
  }

  let e = document.querySelector('.sidebar--assemblage .sidebar__title .sidebar__rating');
  e.innerHTML = '';
  a.loadBenchmark.then(
    () => {
      if (e) {
        if (a.benchmarkInfo) { //no need to wait for load. it is waited in load
          e.innerHTML = a.benchmarkInfo.total_mark;
          //             e.title = `
          //             Поддерживается ${a.benchmarkInfo.minrequirement.game_percent}% игр на минимальных и ${a.benchmarkInfo.recrequirement.game_percent}% на рекомендуемых.
          // Поддерживаются все игры до ${a.benchmarkInfo.minrequirement.max_year} года на минимальных и до ${a.benchmarkInfo.recrequirement.max_year} на рекомендуемых.
          //             `;
          e.dataset.minP = a.benchmarkInfo.minrequirement.game_percent;
          e.dataset.recP = a.benchmarkInfo.recrequirement.game_percent;
          e.dataset.minY = a.benchmarkInfo.minrequirement.max_year;
          e.dataset.recY = a.benchmarkInfo.recrequirement.max_year;
          //manageProductScoreRating(e);
        }
        else {
          e.innerHTML = ''; //✖
          //e.title = `К сожалению, невозможно сделать оценку данной сборки. Устраните конфликты и добавьте все необходимые комплектующие.`;
        }
        manageProductScoreRating(e);
      }
    }
  );


  //else console.log('error no sidebar__rating');

  function display(type, newValue, oldValue) {
    //console.log('display', type, newValue, oldValue, this);
    if (this != mainAssemblage) return;
    if (type == "price" || type == "all") {
      //console.log('   display changing price');
      if (this.price.uncalced <= 0) document.querySelector('.assemblage-items__total').innerText = this.price.value + ' ' + local('currency');
      else if (this.price.uncalced <= 1) document.querySelector('.assemblage-items__total').innerText = '>' + this.price.value + ' ' + local('currency');
      else document.querySelector('.assemblage-items__total').innerText = '>>' + this.price.value + ' ' + local('currency');
      //document.querySelector('.assemblage-items__total').innerText = '– ₽';
    }
    if (type == "name" || type == "all") {
      //console.log('   display changing name');
      document.querySelector('.assemblage-items__name').value = this.getName();
    }
    if (type == "link" || type == "all") {
      //console.log('   display changing link');
      let link = document.querySelector('.assemblage-items__pages.pagination .block-icon-links .icon-link');
      link.href = this.link;

      let qr = document.querySelector('.assemblage-items__pages.pagination .block-icon-links .icon-qr');
      qr.dataset.href = this.link;
    }
  }

  //display("all", a.price);

  if (lastChoosenAssemblageButton) lastChoosenAssemblageButton.classList.remove('pagination__page-wrapper--current');
  a.chooseButton.classList.add('pagination__page-wrapper--current');
  lastChoosenAssemblageButton = a.chooseButton;

  a.onMainChange = display;
  a.onMainChange("all");
  a.choose();
}

async function syncAssemblages() {
  //console.log('syncAssemblages');
  let assemblagesIds = getActiveAssemblagesIds();

  let i;
  for (i = 0; i < activeAssemblages.length; i++) {
    if (i > assemblagesIds.length || activeAssemblages[i].id != assemblagesIds[i]) {
      // activeAssemblages.splice(i, activeAssemblages.length);
      //console.log('syncAssemblages', 'removeAssemblageFromActive', activeAssemblages[i]);
      removeAssemblageFromActive(activeAssemblages[i]);
      i--;
      // continue;
    }
    else if (activeAssemblages[i].id == assemblagesIds[i]) {
      activeAssemblages[i].restore();
    }

  }
  for (; i < assemblagesIds.length; i++) {
    activeAssemblages.push(new Assemblage(assemblagesIds[i]));
    createAssemblageChooseButton(activeAssemblages[activeAssemblages.length - 1]);
  }
  //let newActiveAssembleges = getActiveAssemblages();
  handleChooseAssemblageButtons();
  handleAssemblageButtons();
}

function isUserAssemblage(itemsString, id = null) {
  //console.log('isUserAssemblage', itemsString, id);
  let result = { is: false };
  if (id != null) {
    result = { is: true, id: +id };

    for (let i = 0; i < activeAssemblages.length; i++) {
      if (+activeAssemblages[i].id == +result.id) {
        //console.log('   isUserAssemblage your active assemblage', i+1);
        result = { is: true, number: i + 1, name: activeAssemblages[i].name, id: activeAssemblages[i].id };
        break;
      }
    }

    return result;
  }
  let items;
  if (Array.isArray(itemsString)) items = itemsString;
  else items = itemsString.split(',').map(e => +e);
  let signature = Assemblage.getSignature(items);
  //console.log('isUserAssemblage', items)
  for (let i = 0; i < activeAssemblages.length; i++) {
    if (activeAssemblages[i].isEqual(signature)) {
      //console.log('   isEqual true');
      result = { is: true, number: i + 1, name: activeAssemblages[i].name, id: activeAssemblages[i].id };
      break;
    }
  }
  if (!result.is) {
    let assemblage_signatures = {};
    let assemblage_signatures_string = localStorage.getItem('assemblage_signatures');
    if (assemblage_signatures_string) assemblage_signatures = JSON.parse(assemblage_signatures_string);

    for (id in assemblage_signatures) {
      if (assemblage_signatures[id] == signature) {
        result = { is: true, id: +id };
        break;
      }
    }
  }
  // activeAssemblages.forEach((e, i) => {

  // });
  //console.log('   isEqual false');
  return result;
}

function handleAssemblageButtons() {

  function onAddedAssemblageClick() {
    message(message.WARNING, 'Эта сборка уже среди активных');
  }


  let buttons = document.querySelectorAll('.elekanura_tukar_tenati');

  buttons.forEach(e => {
    let is_text = false;
    if (e.classList.contains('assemblage__button--big')) is_text = true;
    let i = isUserAssemblage(e.dataset.ids, e.dataset.assemblagePersonalId);
    if (i.is) {
      if (i.number) {
        if (is_text) e.querySelector('span:last-of-type').innerText = 'Сборка ' + i.number;
        //if (i.name) 
        e.setAttribute('title', `${i.name ? '"' + i.name + '"' : 'Эта сборка'} уже среди активных сборок (сборка ${i.number})`);
        e.querySelector('span.svg-icon').classList.add('added');
        e.onclick = onAddedAssemblageClick;
      }
      else {
        if (is_text) e.querySelector('span:last-of-type').innerText = '№' + i.id;
        //if (i.name) 
        e.setAttribute('title', `У вас есть ${i.name ? '"' + i.name + '"' : 'эта сборка'} (№${i.id}). Нажмите, чтобы добавить в активные сборки`);
        e.querySelector('span.svg-icon').classList.remove('added');

        e.onclick = () => {
          newAssemblageToActive(i.id);
          handleAssemblageButtons();
        };
      }
    }
    else {
      if (is_text) e.querySelector('span:last-of-type').innerText = 'В сборки';
      e.querySelector('span.svg-icon').classList.remove('added');
      e.setAttribute('title', `Чужая сборка. Нажмите, чтобы добавить в активные сборки`);
      e.onclick = () => {
        newAssemblageToActive(e.dataset.ids.split(',').map(e => +e));
        handleAssemblageButtons();
      };
    }
  });
}

//-----filter
//let filterData = {};
function handleFilter(filterData) {
  document.querySelector('.sidebar-open .sidebars__right .sidebar--nav.sidebar--upper .sidebar__close-btn')?.click(); //to close menu on mobile

  if (filterDataOld && filterData && filterDataOld.item_type_id == filterData.item_type_id) {
    filterDataOld = filterData;
    handleFilterItemsCount(filterData);
    return;
  }

  let filter = {};
  elements.filter = filter;

  filter.root = document.querySelector('.sidebar--filter');
  if (!filter.root) {
    filter.root = create(elements.sidebarsLeft, 'aside', 'sidebar', 'sidebar--filter', 'sidebar--upper');

    filter.root.innerHTML = `
            <a class="sidebar__btn sidebar__btn--filter">
                <span class="sidebar__btn-icon sidebar__btn-icon--filter">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </a>
            <p class="sidebar__title"><span>Фильтр</span><span class="filter__unlive-button">🗘 Применить</span><span class="sidebar__close-btn">✖</span></p>`;
  }

  filter.title = filter.root.querySelector('.sidebar__title');
  filter.unliveButton = filter.title.querySelector('.filter__unlive-button')
  if (!filter.unliveButton) {
    filter.unliveButton = create(null, 'span', 'filter__unlive-button');
    filter.title.querySelector('span').after(filter.unliveButton);
    filter.unliveButton.innerText = '🗘 Применить';
  }
  filter.unliveButton.addEventListener('click', () => {
    if (filter.unliveButton.classList.contains('clickable')) {
      filter.unliveButton.classList.remove('clickable');
      loadPage(ganerateFilterSortURL(), { isNoDeleteFilterData: true });
    }
  });
  filter.list = filter.root.querySelector('.sidebar-list');
  if (!filter.list) filter.list = create(filter.root, 'ul', 'sidebar-list');

  filter.list.innerHTML = '';

  filter.button = filter.root.querySelector('.sidebar__btn');



  if (!filterData) {
    //filter.root.remove();
    //debugger;
    let nav = document.querySelector('.sidebar__btn--nav');
    if (filter.root.style.visibility = 'visible' && nav) {
      nav.click();
      nav.click();
    }
    filter.root.style.visibility = 'hidden';

    //filter.button.hidden = true;
    //elements.filter = null;
    filterDataOld = filterData;
    return;
  }
  else {
    filter.root.style.visibility = 'visible';
    //filter.root.hidden = false;
    //filter.button.hidden = false;
  }
  filterDataOld = filterData;

  handleFilterItems(filter.list, filterData.filter);
  handleFilterItemsCount(filterData);

  if (typeof manageFilter !== "undefined") manageFilter();

  if (/*Object.keys(activatedFilter).length && */filter.root.parentElement.classList.contains('sidebars__left--hidden') && window.innerWidth >= 1770) {
    //debugger;
    //TODO wtf timeout????
    afterManageActions.push(() => {
      filter.root.querySelector('.sidebar__btn--filter')?.click();
      //debugger;
    });
    //readyToManage.then(() => filter.root.querySelector('.sidebar__btn--filter')?.click());
    //setTimeout(() => filter.root.querySelector('.sidebar__btn--filter')?.click(), 1); 
  }
}

//legacy
function generateFilterURL(activatedFilter) {
  let url = new URL(location.href);
  url.searchParams.set('filter', generateFilterQueryParameter(activatedFilter));
  //console.log('generateFilterURL:', url.href);
  return url;
}

function ganerateFilterSortURL(options = { activatedFilter, actualSort }) {
  let url = new URL(location.href);
  if (Object.keys(activatedFilter).length) url.searchParams.set('filter', generateFilterQueryParameter(activatedFilter));
  else url.searchParams.set('filter', '');
  //console.log('generateFilterURL:', url.href);
  if (actualSort.is_actual) {
    url.searchParams.set('sort_by', actualSort.sort_by);
    url.searchParams.set('sort_direction', actualSort.sort_direction);
  }
  console.log(url);
  return url;
}

function generateFilterQueryParameter(activatedFilter) {
  let activatedItems = [];
  for (let key in activatedFilter) {
    if (key == 'suitable_assembly') {
      if (activatedFilter[key]) {
        activatedItems.push(`${key}=${activatedFilter[key].join()}`);
      }
      continue;
    }
    else if (typeof activatedFilter[key] == 'boolean') {
      activatedItems.push(`${key}=${activatedFilter[key]}`);
      continue;
    }
    else if (typeof activatedFilter[key].min != 'undefined' || typeof activatedFilter[key].max != 'undefined') {
      let min = activatedFilter[key].min ?? 'null';
      let max = activatedFilter[key].max ?? 'null';
      activatedItems.push(`${key}=${min}_from-to_${max}`);
      continue;
    }

    let activatedValues = [];
    for (let value in activatedFilter[key]) {
      if (activatedFilter[key][value]) activatedValues.push(encodeURIComponent(value));
    }
    if (activatedValues.length > 0) {
      activatedItems.push(`${key}=${activatedValues.join()}`);
    }
  }
  if (activatedItems.length > 0) {
    return activatedItems.join(';');
  }
  return '';
}

function handleFilterCheckboxChange(e, isPresettedValue = false) {
  //console.log(e);
  let checkbox = e.target;
  let checked = checkbox.checked;
  //console.log(e.target.value_id, e.target.item_id, e.target.item_text_id);

  if (!activatedFilter[checkbox.item_text_id])
    activatedFilter[checkbox.item_text_id] = {}

  if (checkbox.itemtype == 'single') activatedFilter[checkbox.item_text_id] = checked;
  else activatedFilter[checkbox.item_text_id][checkbox.value] = checked;
  //console.log(activatedFilter);
  if (!isPresettedValue) {
    //debugger;
    handleFilterChange();
  }
}

function createSubitem(target, subitem) {
  let li = create(target, 'li', 'filter__item', { 'data-filter-item-id': subitem.value_id });
  let label = create(li, 'label');
  let input = create(label, 'input', 'filter__checkbox');
  if (!createSubitem.isInputCheckedHandled) {
    createSubitem.isInputCheckedHandled = true;
    const { get, set } = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked');
    //console.log('isInputCheckedHandled');

    Object.defineProperty(HTMLInputElement.prototype, '_checked', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        let result = set.call(this, newVal);
        //console.log('New value assigned to input: ' + newVal);
        if ("createEvent" in document) {
          let evt = document.createEvent("HTMLEvents");
          evt.initEvent("change", false, true);
          this.dispatchEvent(evt);
        }
        else
          this.fireEvent("onchange");
        return result;
      }
    });
  }
  input.type = 'checkbox';
  if (subitem.value_id) input.value_id = subitem.value_id;
  if (subitem.value) input.value = subitem.value;
  input.item_id = subitem.item_id;
  input.item_text_id = subitem.item_text_id;
  if (subitem.type) input.itemtype = subitem.type;

  if (subitem.default) input._checked = subitem.default;

  if (subitem.checked) {
    input._checked = subitem.checked;
    if (subitem.func) subitem.func({ target: input }, true);
    else handleFilterCheckboxChange({ target: input }, true);
    input.dataset.defaultyOpen = true;
  }

  let span = create(label, 'span', 'fake-checkbox');
  let spanName = create(label, 'span');
  spanName.innerText = subitem.name;
  if (subitem.func) input.addEventListener('change', subitem.func);
  else input.addEventListener('change', handleFilterCheckboxChange);
  //if (subitem.isPreRun) input.dispatchEvent(new Event("change", {"bubbles":true, "cancelable":false}));

  return li;
}

function createSubitemsList(target, subitems) {
  let result = {};
  result.ul = create(target, 'ul', 'filter__items-list');
  result.li = [];
  for (let subitem of subitems) {
    result.li.push(createSubitem(result.ul, subitem));
  }

  return result;
}

function handleFilterRangeChange(e, isPresettedValue = false) {
  //console.log(e);
  let input = e.target;
  //console.log(e.target.value_type, e.target.item_id, e.target.item_text_id);

  if (!activatedFilter[input.item_text_id])
    activatedFilter[input.item_text_id] = {}

  activatedFilter[input.item_text_id][input.value_type] = input.value;

  if (input.value == input.value_extremum) activatedFilter[input.item_text_id][input.value_type] = null;
  //console.log(activatedFilter);
  if (!isPresettedValue) {
    //debugger;
    handleFilterChange();
  }
}

function createRangeItem(target, info) {
  //console.log('createRangeItem', info);
  if (!info.values || !info.values.length) return;
  let min = +info.values[0].value;
  let max = min;
  for (let value of info.values) {
    let v = +value.value;
    if (v > max) max = v;
    else if (v < min) min = v;
  }

  let current_min_value = min;
  let current_max_value = max;

  if (info.checked_data) {
    if (info.checked_data.from && info.checked_data.from != "null") current_min_value = info.checked_data.from;
    if (info.checked_data.to && info.checked_data.to != "null") current_max_value = info.checked_data.to;
  }

  target.innerHTML = `
        <ul class="filter__items-list">
            <li class="filter__item--price">
                <div class="sidebar-list__price-range"></div>
                <div class="sidebar-list__price-row">
                    <div class="sidebar-list__price-low filter__range--min">
                        <span class="sidebar-list__price-text">от</span>
                        <input class="sidebar-list__price-num sidebar-list__price-num--min" value="${current_min_value}" type="number">
                    </div>
                    <div class="sidebar-list__price-high filter__range--max">
                        <span class="sidebar-list__price-text">до</span>
                        <input class="sidebar-list__price-num sidebar-list__price-num--max" value="${current_max_value}" type="number">
                    </div>
                </div>
            </li>
        </ul>
        `;

  let min_field = target.querySelector('.filter__range--min input');
  min_field.value_type = 'min';
  min_field.value_extremum = min;
  let max_field = target.querySelector('.filter__range--max input');
  max_field.value_type = 'max';
  max_field.value_extremum = max;

  min_field.item_id = info.id;
  max_field.item_id = info.id;
  min_field.item_text_id = info.text_id;
  max_field.item_text_id = info.text_id;
  if (info.type) {
    min_field.itemtype = info.type;
    max_field.itemtype = info.type;
  }

  if (current_min_value != min) {
    min_field.dataset.defaultyOpen = true;
    handleFilterRangeChange({ target: min_field }, true);
  }
  if (current_max_value != max) {
    max_field.dataset.defaultyOpen = true;
    handleFilterRangeChange({ target: max_field }, true);
  }

  min_field.addEventListener('_change', info.func ? info.func : handleFilterRangeChange);
  max_field.addEventListener('_change', info.func ? info.func : handleFilterRangeChange);
}

function handleFilterChange() {
  if (isFilterLiveMod) loadPage(ganerateFilterSortURL(), { isNoDeleteFilterData: true });
  else {
    elements.filter.unliveButton.classList.add('clickable');
  }
}

function handleFilterItemsCount(filterData) {
  for (let f of filterData.filter) {
    if (f.range_in_filter && f.range_in_filter != '0') continue;
    if (!f.values) continue;

    for (let v of f.values) {
      let el = document.querySelector(`[data-filter-item-id="${v.id}"]`);
      if (!el) continue;
      let counter = el.querySelector('.filter-count');
      if (!counter) counter = create(el.querySelector('label'), 'span', 'filter-count');

      counter.innerText = `(${f.checked && v.items_count_filter > 0 ? '+' : ''}${v.items_count_filter})`;
    }
  }
}

function handleSortChange() {
  document.addEventListener('sort_change', e => {
    console.log(e);
    actualSort.sort_by = e.detail.sort_by;
    actualSort.sort_direction = e.detail.sort_direction;
    actualSort.is_actual = true;
    loadPage(ganerateFilterSortURL(), { isNoDeleteFilterData: true });
  });
}

function handleFilterItems(target, data) {
  //default subitems
  let defaultIsFilterLiveMod = true;
  if (window.localStorage.getItem('isFilterLiveMod')) defaultIsFilterLiveMod = JSON.parse(window.localStorage.getItem('isFilterLiveMod'));
  let { ul: singleUl } = createSubitemsList(create(target, 'li', 'sidebar-list__item', 'filter'),
    [
      {
        name: 'Только подходящие сборке', func: (e, isPresettedValue = false) => {
          //console.log(e);
          let checkbox = e.target;
          let checked = checkbox.checked;
          //console.log(e.target.value_id, e.target.item_id, e.target.item_text_id);

          if (!activatedFilter['suitable_assembly'])
            activatedFilter['suitable_assembly'] = {}

          if (checked) activatedFilter['suitable_assembly'] = mainAssemblage.items;
          else delete activatedFilter['suitable_assembly'];

          //console.log(activatedFilter);
          if (!isPresettedValue) {
            //debugger;
            handleFilterChange();
          }
        }
      },
      {
        name: '"Живое" использование фильтра', func: (e, isPresettedValue = false) => {
          //console.log(e);
          let checkbox = e.target;
          let checked = checkbox.checked;
          //console.log(e.target.value_id, e.target.item_id, e.target.item_text_id);

          if (checked) {
            elements.filter.unliveButton.classList.remove('active');
            isFilterLiveMod = true;
            //debugger;
            if (!isPresettedValue) handleFilterChange();
          }
          else {
            elements.filter.unliveButton.classList.add('active');
            isFilterLiveMod = false;
          }

          window.localStorage.setItem('isFilterLiveMod', JSON.stringify(isFilterLiveMod));
        }, default: defaultIsFilterLiveMod/*, isPreRun: true*/
      }
    ]);

  for (let key in data) {
    let item = data[key];

    if (item.type == 'single') {
      createSubitem(singleUl, {
        name: '' + item.title,
        // value_id: 0,
        // value: 0,
        item_id: item.id,
        item_text_id: item.text_id,
        type: item.type,
        checked: item.checked ? +item.checked : false
      });
    }
    else {
      let li = create(target, 'li', 'sidebar-list__item', 'filter', { 'data-filter-id': item.id });
      let a = create(li, 'a', 'filter__name', 'filter__name--active');
      a.href = '#';
      let span = create(a, 'span');
      span.innerText = item.title;
      if (item.range_in_filter && item.range_in_filter != '0' && item.measure_unit) span.innerText += ', ' + item.measure_unit;
      //create(span, 'span', 'filter__items-count').innerText = `(${item.values.length})`;
      //create(span, 'span', 'filter__icon', 'filter__icon--arrow');

      let div = create(li, 'div', 'filter__items-wrapper');

      if (!item.range_in_filter || item.range_in_filter == '0') {
        let units = item.measure_unit ? ' ' + item.measure_unit : '';
        createSubitemsList(div, Array.from(item.values, value => {
          return {
            name: '' + value.value + units,
            value_id: value.id,
            value: value.value,
            item_id: item.id,
            item_text_id: item.text_id,
            checked: value.checked ? +value.checked : false,
          }
        }));
      }
      else {
        li.classList.add('filter__range');
        createRangeItem(div, item);
      }


    }

  }
}
//-----rating

function handleRating(rating) {
  load('set_rating', { rating, item_id: data.item.id }).then((response) => {
    if (response?.item_rating?.rating) {
      document.querySelector('.product-rating__stars').dataset.totalValue = response.item_rating.rating;
      document.querySelector('.product-rating__average').innerText = response.item_rating.rating;
    }
  });
}

//-----loadMore
function handleLoadMore() {
  let button = document.querySelector('.pagination__show-more');
  if (!button) return;
  button.removeEventListener('click', onLoadMore);
  button.addEventListener('click', onLoadMore);
}

async function onLoadMore(e) {
  try {
    let paginationOld = this.parentElement;
    if (!paginationOld) throw new Error('No pagination!');
    let nextPageA = paginationOld.querySelector('.pagination__page-wrapper--current + .pagination__page-wrapper > a');
    if (!nextPageA) throw new Error('No next page!');
    let href = nextPageA.href;
    let url = new URL(href);
    let apiHost = 'api.salamander.one';
    url.hostname = apiHost;

    //console.log('onLoadMore', url);

    const response = await fetch(url, {
      credentials: 'include'
    });
    const json = await response.json();
    //console.log('Успех:', JSON.stringify(json));
    if (!response.ok) throw new Error('Ответ сети был не ok.');
    //debugger;
    if (!json?.response?.html) throw new Error('No HTML to display!');
    history.pushState({ response: json.response }, json.title, href);

    let mainSection;// = document.querySelector('.section');
    for (let p = this.parentElement; p && p != document; p = p.parentElement) {
      if (p.classList.contains('section')) {
        mainSection = p;
        break;
      }
    }
    if (!mainSection) throw new Error('No section!');

    let div = create(null, 'div');
    div.innerHTML = json?.response?.html;
    //TODO colud be 
    let products = div.querySelectorAll('.section__products > .product');
    if (products.length < 1) throw new Error('No products to display!');

    let sectionProducts = document.querySelector('.section__products');
    if (!sectionProducts) throw new Error('No sectionProducts!');
    sectionProducts.append(...products);

    let paginationNew = div.querySelector('.pagination');

    if (paginationNew) {
      mainSection.replaceChild(paginationNew, paginationOld);
      handleLoadMore();
    }
    else mainSection.removeChild(paginationOld);// paginationOld.remove();

    //TODO fix managing
    //manageProductsViewType()
    manage();
    handleAddToAssemblageButtons();

  } catch (error) {
    console.error('Ошибка:', error);
    //location.href = href;
  }
}

//links
window.onpopstate = function (e) {

  //console.log(`onpopstate:`, e);
  //console.log(`location: ${document.location}, state: `, e.state);
  //debugger;
  if (!(oldUrl.pathname == location.pathname && oldUrl.search == location.search)) {
    //console.log(`   changed`);
    if (e.state) handlePageState(e.state);
    else loadPage(document.location, { isNoHistory: true });
  }
  oldUrl = new URL(location.href);
}
window.onfocus = function (e) {
  syncAssemblages();
}

document.addEventListener('click', (e) => {
  if (e.ctrlKey) return;
  if (loadPage.isLoading) {
    console.log('click while loading');
    e.preventDefault();
    return;
  }
  //console.log('click:', e);
  // if (e.target instanceof HTMLAnchorElement) {
  //     e.preventDefault(); 
  //     console.log('link press:', e.target.href);
  // }
  if (!e.path) e.path = e.composedPath();
  for (let el of e.path) {
    if (el instanceof HTMLAnchorElement && el.href.startsWith('https://salamander.one/')) {
      //debugger;

      if (el.getAttribute("href").startsWith('#')) {
        // console.log('   fetched anchor press:', el.href);
        break;
      }
      let anchor_index = el.getAttribute("href").indexOf('#');
      if (anchor_index != -1) {
        let home_index = 0;
        if (el.getAttribute("href").startsWith(location.origin)) home_index += location.origin.length;
        else if (el.getAttribute("href").startsWith(location.hostname)) home_index += location.hostname.length;

        if (el.getAttribute("href").slice(home_index, anchor_index) == location.pathname) break;
      }

      e.preventDefault();
      //console.log('   fetched link press:', el.href);
      saveCurrentState();
      loadPage(el.href);
      return;
    }
  }

  //e.preventDefault(); 
});

async function loadPage(href, options = {}) {
  loadPage.isLoading = true;
  let loadMessage = message(message.LOADING);
  document.body.classList.add('loading');
  if (!options.isNoDeleteFilterData) activatedFilter = {};


  try {
    let url = new URL(href);
    let apiHost = 'api.salamander.one';
    url.hostname = apiHost;
    //console.log('loadPage', url);

    const response = await fetch(url, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ответ сети был не ok.');
    //console.log(response)
    const json = await response.json();
    //console.log('Успех:', JSON.stringify(json));
    //debugger;
    if (!json?.response?.html) throw new Error('No HTML to display!');

    let state = { response: json.response };
    if (!options.isNoHistory) history.pushState(state, json.title, href);
    else history.replaceState(state, json.title, href);
    oldUrl = new URL(location.href);

    handlePageState(state);
    //location.href = href;
  } catch (error) {
    console.error('Ошибка:', error);
    //location.href = href;
  }
  loadMessage?.remove();
  document.body.classList.remove('loading');
  loadPage.isLoading = false;
}

async function handleAssamblagesPage() {
  let target = document.querySelector("section > div.section__products");
  let assemblages = getAssemblages();

  let promises = [];
  for (let a of assemblages) {
    if (a.items.length <= 0 && !isUserAssemblage(a.items, a.id).number) {
      //debugger;
      a._full_remove();
    }
    else promises.push(a.drawCard(target));
  }
  await Promise.all(promises);
}

function handlePageState(state) {
  let promises = [];
  currentState = state;
  let response = state.response;
  console.log('handlePageState', state);
  let main = document.querySelector('main');
  if (!main) {
    console.log('alarm no main');
  }

  //TODO what is data???
  data = response;

  if (state.mainInnerHTML) {
    main.innerHTML = state.mainInnerHTML;
    //main.append(...(state.main.childNodes));
  }
  else {
    main.innerHTML = response.html;
  }
  main.parentElement?.classList.remove('container--full-width');

  if (state.href && state.href == `https://salamander.one/${local('url')}/assemblages/` || !state.href && location.pathname == `/${local('url')}/assemblages/`) promises.push(handleAssamblagesPage());

  handleFilter(response?.filter);
  handleLoadMore();
  handleChoosingInAssemblage();
  handleAddToAssemblageButtons();

  Promise.all(promises).then(() => {
    handleAssemblageButtons();
    manage();


    if (state.offset) {
      window.scroll(state.offset.x, state.offset.y);
    }
    else if (!state.href && location.hash) {
      let hash = location.hash;
      location.hash = "";
      location.hash = hash;
    }
    else window.scroll(0, 0);

    if (state.title) document.title = state.title;
    else if (state.response?.meta_tags?.title) document.title = state.response.meta_tags.title;
    else document.title = 'Title placeholder';
  });

}

function saveCurrentState() {
  //console.log('saveCurrentState');
  if (!currentState) currentState = {};
  let main = document.querySelector('main');
  if (!main) {
    console.log('saveCurrentState alarm no main');
  }
  currentState.mainInnerHTML = main.innerHTML;
  currentState.offset = { y: window.pageYOffset, x: window.pageXOffset };
  currentState.title = document.title;
  currentState.href = location.href;
  history.replaceState(currentState, currentState.title, currentState.href);
}

//base functions

async function load(method, data) {
  const API_URL_BASE = 'https://api.salamander.one/api.php';
  //console.log('load', method, data);
  try {
    const formData = new FormData();
    formData.append('data_json', JSON.stringify(data));
    formData.append('locale_url', local('url'));
    //Object.keys(data).forEach(key => formData.append(key, data[key]));
    let url = new URL(API_URL_BASE);
    url.searchParams.set('method', method);
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'include',
      //body: JSON.stringify(data)
      body: formData
    });
    if (!response.ok) throw new Error('Ответ сети был не ok.');
    const json = await response.json();
    // const json = await response.text();
    return json;
  } catch (error) {
    console.error('Ошибка load:', error);
    //location.href = href;
  }
}

//preset functions
function create(target, type, ...classesAndAttributes) {
  let el = document.createElement(type);
  classesAndAttributes.forEach((c) => {
    if (typeof c == 'string') el.classList.add(c);
    else Object.keys(c).forEach((k) => el.setAttribute(k, c[k]));
  });
  if (target) target.append(el);
  return el;
}

function smile(type) {
  let a = [];
  if (type == 'sad') a = ['😶', '😔', '😕', '🙁', '😞', '😟', '😦', '😧', '😩'];

  return a[Math.round(Math.random() * (a.length - 1))];
}

function local(name) {
  if (data?.locale) return data.locale[name];
  return locale[name];
}



//init 


init();

function init() {
  let promises = [];
  oldUrl = new URL(location.href);
  if (isInitted) return;
  isInitted = true;
  elements.sidebarsLeft = document.querySelector('.sidebars__left');
  elements.sidebarsRight = document.querySelector('.sidebars__left');

  if (typeof filter !== "undefined") data.filter = filter;
  if (typeof item !== "undefined") data.item = item;
  if (typeof locale !== "undefined") data.locale = locale;
  handleFilter(typeof filter !== "undefined" ? filter : null);

  assemblageInit();
  if (location.pathname == `/${local('url')}/assemblages/`) promises.push(handleAssamblagesPage());
  handleLoadMore();


  handleAddToAssemblageButtons();

  handleSortChange();

  readyToManage = Promise.all(promises).then(handleAssemblageButtons);
}


// products shop show more
const productShop = document.querySelectorAll('.product-shop');
productShop.forEach(shop => {
  placeDashedLine(shop);
});

window.addEventListener('resize', () => {
  productShop.forEach(shop => {
    placeDashedLine(shop);
  });
});

function placeDashedLine(shop) {
  const button = shop.querySelector('.product-shop__show-more');
  const line = shop.querySelector('.product-shop__dashed-line');
  if (!button && !line) return;
  
  const buttonHeight = button.getBoundingClientRect().height;
  line.style.top = `${buttonHeight / 2 + button.offsetTop}px`;
}