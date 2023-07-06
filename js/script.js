/* eslint-disable no-param-reassign */
/* eslint-disable strict */

'use strict'
//console.log('script.js')
//Sidebar
function manageFilter() {
  const filters = document.querySelectorAll('.filter')
  if (filters.length) {
    filters.forEach(filter => {
      const filterName = filter.querySelector('.filter__name span')
      if (filterName && filter.classList.contains('filter__range')) {
        const itemsList = filter.querySelector('.filter__items-list')
        toggleItemsListByFilterName(itemsList, filterName.parentNode)
        handleRange(filter)
        addItemsCount(filter, null)
      }
      else if (filterName) {
        const itemsList = filter.querySelector('.filter__items-list')
        addExceptButtonToItems(filter)
        addItemsCount(filter, itemsList.childElementCount)
        handleCheckboxClick(filter)
        toggleItemsListByFilterName(itemsList, filterName.parentNode)
      }
    })

    function handleRange(filter) {
      //addEventListener('load', () => {
      let price = filter.querySelector('.sidebar-list__price-range');
      let min_el = filter.querySelector('.filter__range--min input');
      let max_el = filter.querySelector('.filter__range--max input');
      let min = +min_el?.value_extremum;
      let max = +max_el?.value_extremum;
      let current_min_value = +min_el?.value;
      let current_max_value = +max_el?.value;
      //let step = filter.querySelector('.filter__range--min input')

      if (typeof noUiSlider == "undefined") return;

      let slider;
      try {
        slider = noUiSlider.create(price, {
          start: [current_min_value, current_max_value],
          connect: true,
          step: 1,
          range: {
            min,
            max
          }
        });
      }
      catch (e) {
        console.log('Error during filter range handle', filter, e);
        return;
      }


      function fire_change(el) {
        if ("createEvent" in document) {
          let evt = document.createEvent("Event");
          evt.initEvent("_change", false, true);
          el.dispatchEvent(evt);
        }
      }

      let is_min = false;
      let is_max = false;
      slider.on('slide', function (values, handle, unencoded, tap, positions, noUiSlider) {
        is_min = false;
        is_max = false;
        if (+min_el.value != +values[0]) is_min = true;
        min_el.value = +values[0];
        if (+max_el.value != +values[1]) is_max = true;
        max_el.value = +values[1];
        // if (is_min) fire_change(min_el);
        // if (is_max) fire_change(max_el);
      });

      slider.on('change', function (values, handle, unencoded, tap, positions, noUiSlider) {
        if (is_min) fire_change(min_el);
        if (is_max) fire_change(max_el);
      });

      min_el.addEventListener('change', () => {
        slider.set([+min_el.value, null]);
        let new_val = slider.get(true)[0];
        if (new_val != +min_el.value) min_el.value = new_val;
        fire_change(min_el);
      });

      max_el.addEventListener('change', () => {
        slider.set([null, +max_el.value]);
        let new_val = slider.get(true)[1];
        if (new_val != +max_el.value) max_el.value = new_val;
        fire_change(max_el);
      });

      //})
    }

    function addExceptButtonToItems(filter) {
      const items = filter.querySelectorAll('.filter__item')
      items.forEach(item => {
        const exceptIcon = createExceptIcon()
        exceptIcon.addEventListener('click', () => {
          const isDisabled = listItem =>
            listItem.classList.contains('filter__item--disabled')
          items.forEach(listItem => {
            if (listItem !== item && !isDisabled(listItem)) {
              listItem.querySelector('.filter__checkbox')._checked = true
            }
          })
          const filterItemsCount = filter.querySelector('.filter__items-count')
          filterItemsCount.textContent = `(${getCheckedItems(filter).length}/${items.length
            })`
          // addMultipleItemsIcon(filter)
          // addCancelIcon(filter, items.length)
          // toggleExceptIcons(filter)
        })
        item.insertAdjacentElement('beforeend', exceptIcon)
      })

      function createExceptIcon() {
        const exceptIcon = document.createElement('span')
        exceptIcon.classList.add('filter__icon--except')
        exceptIcon.textContent = '—'
        return exceptIcon
      }
    }

    function addMultipleItemsIcon(filter) {
      const filterName = filter.querySelector('.filter__name')
      filterName.insertAdjacentHTML(
        'afterbegin',
        '<span class="svg-icon icon-square-box"><span>'
      )
    }

    function addCancelIcon(filter, itemsLength) {
      const filterName = filter.querySelector('.filter__name')
      const filterCount = filterName.querySelector('.filter__items-count')
      filterName.insertAdjacentHTML(
        'beforeend',
        '<span class="svg-icon icon-cancel-filter"><span>'
      )
      const cancel = filterName.parentNode.querySelector('.svg-icon.icon-cancel-filter')
      cancel.addEventListener('click', () => {
        const checkedItems = getCheckedItems(filter)
        checkedItems.forEach(item => {
          item._checked = false
        })
        filterCount.innerHTML = `(${itemsLength})`
        const icons = filterName.querySelectorAll('.svg-icon')
        icons.forEach(icon => icon.remove())
        toggleExceptIcons(filter)
      })
    }

    function getCheckedItems(itemsList) {
      return itemsList.querySelectorAll('input[type="checkbox"]:checked')
    }

    function toggleExceptIcons(filter) {
      const checkboxes = filter.querySelectorAll('.filter__checkbox')
      const someIsChecked = [].some.call(checkboxes, checkbox => checkbox._checked)
      const icons = filter.querySelectorAll('.filter__icon--except')
      icons.forEach(icon => {
        icon.style.display = someIsChecked ? 'none' : ''
      })
    }

    function addItemsCount(filter, count) {
      const filterName = filter.querySelector('.filter__name span')
      filterName.insertAdjacentHTML(
        'beforeend',
        `
				${count ? `<span class="filter__items-count">(${count})</span>` : ''}
				<span class="filter__icon filter__icon--arrow"></span>
				`
      )
    }

    function handleCheckboxClick(filter) {
      const items = filter.querySelectorAll('.filter__item')
      items.forEach(item => {
        const checkbox = item.querySelector('.filter__checkbox')
        if (itemIsDisabled(item)) {
          item.classList.add('filter__item--disabled')
          checkbox.disabled = true
        } else {
          let onchange_func = () => {
            toggleExceptIcons(filter)
            const filterName = filter.querySelector('.filter__name')
            const filterCount = filterName.querySelector('.filter__items-count')
            const count = getCheckedItems(filter).length
            if (count === 0) {
              filterCount.innerHTML = `(${items.length})`
              const icons = filterName.querySelectorAll('.svg-icon')
              icons.forEach(icon => icon.remove())
            } else {
              filterCount.innerHTML = `(${count}/${items.length})`
              if (!filterName.querySelector('.icon-square-box')) {
                addMultipleItemsIcon(filter)
                addCancelIcon(filter, items.length)
              }
            }
          };
          onchange_func();
          checkbox.addEventListener('change', onchange_func)
        }
      })

      function itemIsDisabled(item) {
        const filterItemQuantity = item.querySelector('.filter__item-quantity')
        if (filterItemQuantity) {
          return filterItemQuantity.textContent === '(+0)'
        }
        return false
      }
    }

    function toggleItemsListByFilterName(itemsList, filterName) {
      filterName.addEventListener('click', e => {
        e.preventDefault();
        if (!e.target.classList.contains('icon-cancel-filter')) {
          filterName.classList.toggle('filter__name--active')
          const itemsWrapper = itemsList.parentNode
          if (itemsWrapper.style.maxHeight) {
            itemsWrapper.removeAttribute('style')
          } else {
            const itemsListHeight = itemsList.clientHeight
            itemsWrapper.style.maxHeight = `${itemsListHeight}px`
          }
        }
        return false;
      })

      if (filterName.querySelector('[data-defaulty-open="true"]') || itemsList.querySelector('[data-defaulty-open="true"]'))
        filterName.click();
    }
  }
}

const allSidebars = document.querySelectorAll('.sidebar')
if (allSidebars.length) {
  const getWrapper = node => {
    const wrapper = node.closest('.sidebars__left') || node.closest('.sidebars__right')
    return wrapper
  }

  const getHiddenClass = wrapper => {
    const className = wrapper.classList.contains('sidebars__left')
      ? 'sidebars__left'
      : 'sidebars__right'
    return `${className}--hidden`
  }
  allSidebars.forEach(sidebar => {
    const btn = sidebar.querySelector('.sidebar__btn')
    btn.addEventListener('click', () => {
      const sidebarsWrapper = getWrapper(btn)
      const hiddenClass = getHiddenClass(sidebarsWrapper)
      const sidebars = sidebarsWrapper.querySelectorAll('.sidebar')

      const oldUpper = sidebarsWrapper.querySelector('.sidebar--upper')
      const newUpper = sidebar
      newUpper.classList.add('sidebar--upper')
      newUpper.classList.remove('sidebar--lower')
      document.body.classList.add('sidebar-open')
      if (sidebarsWrapper.classList.contains(hiddenClass)) {
        sidebarsWrapper.classList.remove(hiddenClass)
        sidebars.forEach(sidebar => {
          if (sidebar !== newUpper) {
            sidebar.classList.add('sidebar--lower')
          }
        })
      } else if (oldUpper && oldUpper !== newUpper) {
        oldUpper.classList.add('sidebar--lower')
        oldUpper.classList.remove('sidebar--upper')
        newUpper.classList.remove('sidebar--lower')
      } else {
        sidebarsWrapper.classList.add(hiddenClass)
        if (!document.querySelector('.sidebars__left:not(.sidebars__left--hidden), .sidebars__right:not(.sidebars__right--hidden)')) {
          //debugger;
          document.body.classList.remove('sidebar-open')
        }
      }
    })
    sidebar.addEventListener('transitionend', () => {
      const sidebarsWrapper = getWrapper(btn)
      const hiddenClass = getHiddenClass(sidebarsWrapper)
      if (sidebarsWrapper.classList.contains(hiddenClass)) {
        sidebar.classList.remove('sidebar--upper', 'sidebar--lower')
      }
    })
  })
  manageFilter()
}

//CONFLiCTS
const disableFixedCircles = circle => circle.classList.remove('conflict-circle--fixed')
const fixCircles = circle => circle.classList.add('conflict-circle--fixed')
const disableCirclesAsPrevious = circle => {
  if (!circle.classList.contains('conflict-circle--hover')) {
    circle.classList.add('conflict-circle--fixed--prev')
  }
}
const disablePrevCircles = circle => circle.classList.remove('conflict-circle--fixed--prev')
const unhoverCircles = circle => circle.classList.remove('conflict-circle--hover')
const hoverCircles = circle => circle.classList.add('conflict-circle--hover')
const toggleCircles = circle => circle.classList.toggle('conflict-circle--fixed')

function mapCirclesById(conflictId, callback) {
  const circles = document.querySelectorAll(
    `.pc-part[data-conflict-id~="${conflictId}"] .conflict-circle`
  )
  circles.forEach(callback)
}

function switchConflictsBlockItem(conflictsBlock, item) {
  const chosen = conflictsBlock.querySelector('.conflicts__item--chosen') || item
  //const isWarning = item => item.classList.contains('conflicts__item--question')
  //if (!isWarning(item)) {
  if (chosen === item) {
    chosen.classList.remove('conflicts__item--hover')
    chosen.classList.toggle('conflicts__item--chosen')
  } else {
    chosen.classList.remove('conflicts__item--chosen')
    item.classList.add('conflicts__item--chosen')
  }
  //}
}

function hoverConflictsBlockItem(conflictsBlock, item) {
  const toHover = item
  const chosen = conflictsBlock.querySelector('.conflicts__item--chosen')
  if (chosen !== toHover) {
    if (chosen) {
      chosen.classList.add('conflicts__item--prev')
    }
    toHover.classList.add('conflicts__item--hover')
  }
}

function unhoverConflictsBlockItem(conflictsBlock, item) {
  const toUnhover = item
  const previous = conflictsBlock.querySelector('.conflicts__item--prev')
  if (previous !== toUnhover) {
    if (previous) {
      previous.classList.remove('conflicts__item--prev')
    }
    toUnhover.classList.remove('conflicts__item--hover')
  }
}

function getConflictsBlockItemById(conflictId, target = document) { //prob sidebar conflicts specific
  const conflictsBlock = target.querySelector('.conflicts')
  return conflictsBlock.querySelector(`.conflicts__item[data-conflict-id="${conflictId}"]`)
}


function updateConflictsLines() { //page conflicts specific

  let assemblageParts = document.querySelectorAll('.assemblage-parts__part')
  //console.log('updateConflictsLines', assemblageParts, assemblageParts?true:false);
  if (assemblageParts) {
    let conflicts = document.querySelectorAll('.assemblage-parts__part[data-conflict-id~="0"]')
    const getTitle = conflict => conflict.querySelector('.product__title')
    //console.log('	updateConflictsLines', conflicts);
    for (let i = 0; conflicts.length > 0;) {
      if (conflicts.length !== 1) {
        setConflictsLines2(i, ...[].map.call(conflicts, getTitle))
      }
      conflicts = document.querySelectorAll(
        `.assemblage-parts__part[data-conflict-id~="${++i}"]`
      )
    }
  }
}

function getCurrentConflictId(target = document) {
  const fixedSVG = target.querySelector('svg.fixed')
  const fixedId = fixedSVG === null ? undefined : fixedSVG.dataset.conflictId
  if (fixedId) {
    return fixedId
  }
  const fixedCircle = target.querySelector('.conflict-circle--fixed')
  if (fixedCircle) {
    let id = fixedCircle.closest('[data-conflict-id]').dataset.conflictId
    if (id.split(' ').length !== 1) {
      //TODO sometimes there is no document.querySelector('svg[data-conflict-id].fixed') WHY?
      id = target.querySelector('svg[data-conflict-id].fixed')?.dataset?.conflictId
    }
    return id
  }
  return null
}

function switchConflict(conflictId, target = document) {
  const conflictIdToSwitch = conflictId
  const fixedConflictId = getCurrentConflictId(target)
  const conflictSVGToSwitch = target.querySelector(`svg[data-conflict-id="${conflictId}"]`)
  const fixedSVG = target.querySelector('svg[data-conflict-id].fixed')
  if (conflictIdToSwitch !== fixedConflictId) {
    if (fixedSVG) {
      fixedSVG.classList.remove('fixed', 'fixed--prev', 'hover')
    }
    if (conflictSVGToSwitch) {
      conflictSVGToSwitch.classList.add('fixed')
    }
    mapCirclesById(fixedConflictId, unhoverCircles)
    mapCirclesById(fixedConflictId, disableFixedCircles)
    mapCirclesById(fixedConflictId, disablePrevCircles)
    mapCirclesById(conflictId, fixCircles)
  } else {
    if (conflictSVGToSwitch) {
      conflictSVGToSwitch.classList.remove('hover')
      conflictSVGToSwitch.classList.toggle('fixed')
    }
    mapCirclesById(conflictId, toggleCircles)
  }
}

function hoverConflict(conflictId, target = document) {
  const conflictIdToHover = conflictId
  const fixedConflictId = getCurrentConflictId(target)
  const conflictSVGToHover = target.querySelector(`svg[data-conflict-id="${conflictId}"]`)
  if (conflictSVGToHover) {
    conflictSVGToHover.classList.add('hover')
  }

  const fixedSVG = target.querySelector('svg[data-conflict-id].fixed')
  if (fixedConflictId && fixedConflictId !== conflictIdToHover) {
    if (fixedSVG) {
      fixedSVG.classList.add('fixed--prev')
    }
    mapCirclesById(fixedConflictId, disableCirclesAsPrevious)
  }
}

function unhoverConflict(conflictId, target = document) {
  const conflictIdToHover = conflictId
  const fixedPrevConflictId = getCurrentConflictId(target)
  const conflictSVGToUnhover = target.querySelector(`svg[data-conflict-id="${conflictId}"]`)
  if (conflictSVGToUnhover) {
    conflictSVGToUnhover.classList.remove('hover')
  }

  const fixedPrevSVG = target.querySelector('svg[data-conflict-id].fixed--prev')
  if (fixedPrevConflictId !== conflictIdToHover) {
    if (fixedPrevSVG) {
      fixedPrevSVG.classList.remove('fixed--prev')
    }
    mapCirclesById(fixedPrevConflictId, disablePrevCircles)
  }
}

function setConflictsLines(id, conflicts, target) {
  if (!target) target = document;
  if (!conflicts[0].offsetParent) return;
  const top1 = parseInt(conflicts[0].offsetParent.offsetTop)
  const topN = parseInt(conflicts[conflicts.length - 1].offsetParent.offsetTop)
  const len = topN - top1
  const lineHeight = 8
  const topAbs = top1 + lineHeight
  const createConflictDash = offsetTop => `
		<polyline
			points="
				1,${offsetTop - top1 + 5.5}
				6,${offsetTop - top1 + 5.5}
			"
			stroke="#e0a006"
		/>
		<polyline
			points="
				7.5,${offsetTop - top1}
				7.5,${offsetTop - top1 + 11}
			"
			stroke="#e0a006"
		/>
	`
  const linesToPart = conflicts
    .map(confilct => parseInt(confilct.offsetParent.offsetTop))
    .map(createConflictDash)
    .join('')
  const line = `
		<svg data-conflict-id="${id}"
			class="conflict-line-svg${target.querySelector(`.conflicts__item--question[data-conflict-id="${id}"]`) ? " conflict-line-svg--question" : ""}"
			style="position: absolute;top:${topAbs - 6}px;left:50px;"
			width="8" height="${len + 12}" viewBox="0 0 8 ${len + 12}"
			xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
		>
			<polyline
				points="
					1.5,6
					1.5,${len + 6}
				"
				fill="transparent" stroke="#e0a006" stroke-dasharray="4px"
			/>
			${linesToPart}
		</svg>
	`
  target.querySelector('.sidebar__pc-parts').insertAdjacentHTML('beforeend', line)
}

function setConflictsLines2(id, ...conflicts) {
  if (!conflicts[0]) {
    console.log('setConflictsLines2 return coz no conflicts');
    return;
  }
  const parentTop = parseInt(
    document.querySelector('.assemblage-parts').getBoundingClientRect().top
  )
  const top1 = parseInt(conflicts[0].getBoundingClientRect().top) - parentTop
  const topN = parseInt(conflicts[conflicts.length - 1].getBoundingClientRect().top) - parentTop
  const len = topN - top1
  const lineHeight = 10 + 7 //changed
  const topAbs = top1 + lineHeight
  const createConflictDash = conflict => `
		<polyline
			points="
				1,${conflict.getBoundingClientRect().top - parentTop - top1 + 5.5}
				6,${conflict.getBoundingClientRect().top - parentTop - top1 + 5.5}
			"
			stroke="#e0a006"
		/>
		<polyline
			points="
				7.5,${conflict.getBoundingClientRect().top - parentTop - top1}
				7.5,${conflict.getBoundingClientRect().top - parentTop - top1 + 11}
			"
			stroke="#e0a006"
		/>
	`
  const linesToPart = conflicts.map(createConflictDash).join('')
  const line = `
		<svg data-conflict-id="${id}"
			style="position: absolute;top:${topAbs}px;left:0px;"
			${document.querySelector(`.conflicts__item--question[data-conflict-id="${id}"]`) ? 'class="conflict-line-svg--question"' : ""}"
			width="8" height="${len + 12}" viewBox="0 0 8 ${len + 12}"
			xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
		>
			<polyline
				points="
					1.5,6
					1.5,${len + 6}
				"
				fill="transparent" stroke="#e0a006" stroke-dasharray="4px"
			/>
			${linesToPart}
		</svg>
	`
  document.querySelector('.assemblage-parts').insertAdjacentHTML('beforeend', line)
}

//---

function managePageConflicts() {
  let target = document.querySelector('.main');

  //cleaning
  let oldSvgs = target.querySelectorAll('svg[data-conflict-id]');
  for (let svg of oldSvgs) svg.remove();
  //target.querySelectorAll('.conflict-circle--fixed').forEach(e => e.classList.remove('conflict-circle--fixed'));
  target.querySelectorAll('.conflicts__item--chosen').forEach(e => e.classList.remove('conflicts__item--chosen'));
  //cleaning end

  const assemblageParts = target.querySelectorAll('.assemblage-parts__part')
  console.log('managePageConflicts', assemblageParts);
  if (assemblageParts.length) {
    assemblageParts.forEach(part => {
      //if (!part.classList.contains('listened')) {
      //part.classList.add('listened');
      const titleLinkSelector = '.product__title .product__link'
      const titleLinks = part.querySelector(titleLinkSelector)

      const getTitleLink = conflict => conflict.querySelector(titleLinkSelector)
      titleLinks.addEventListener('click', () => {
        part.classList.toggle('product--collapsed')

        const conflictsSVG = target.querySelectorAll('svg[data-conflict-id]')
        const fixedSVG = target.querySelector('svg.fixed')
        const fixedId = fixedSVG === null ? undefined : fixedSVG.dataset.conflictId
        conflictsSVG.forEach(svg => {
          const { conflictId: id } = svg.dataset
          const conflicts = target.querySelectorAll(
            `.assemblage-parts__part[data-conflict-id~="${id}"]`
          )

          svg.remove()
          setConflictsLines2(id, ...[].map.call(conflicts, getTitleLink))
          target.querySelector(`svg[data-conflict-id~="${id}"]`)
        })
        if (fixedId) {
          target
            .querySelector(`svg[data-conflict-id~="${fixedSVG.dataset.conflictId}"]`)
            .classList.add('fixed')
        }
      })
      //}
    })
  }

  updateConflictsLines()

  const conflictsBlock = target.querySelector('.conflicts')
  if (conflictsBlock) {
    const items = conflictsBlock.querySelectorAll(
      '.conflicts__item' //'.conflicts__item:not(.conflicts__item--question)'
    )
    items.forEach(item => {
      if (!item.classList.contains('listened')) console.log('HERE already listened');
      //if (!item.classList.contains('listened')) {
      item.classList.add('listened');
      item.addEventListener('click', () => {
        switchConflictsBlockItem(conflictsBlock, item)
        const { conflictId } = item.dataset
        mapCirclesById(conflictId, unhoverCircles)
        switchConflict(conflictId,)
      })
      item.addEventListener('mouseover', () => {
        item.classList.add('conflicts__item--hover')
        const { conflictId } = item.dataset
        mapCirclesById(conflictId, hoverCircles)
        hoverConflict(conflictId, target)
        hoverConflictsBlockItem(conflictsBlock, item)
      })
      item.addEventListener('mouseout', () => {
        item.classList.remove('conflicts__item--hover')
        const { conflictId } = item.dataset
        mapCirclesById(conflictId, unhoverCircles)
        unhoverConflict(conflictId, target)
        unhoverConflictsBlockItem(conflictsBlock, item)
      })
      //}
    })
  }
}

function manageConflicts(target) {
  if (!target) target = document.querySelector('.sidebars');

  //cleaning
  let oldSvgs = target.querySelectorAll('.conflict-line-svg');
  for (let svg of oldSvgs) svg.remove();
  target.querySelectorAll('.conflict-circle--fixed').forEach(e => e.classList.remove('conflict-circle--fixed'));
  target.querySelectorAll('.conflicts__item--chosen').forEach(e => e.classList.remove('conflicts__item--chosen'));
  //cleaning end

  // const pcParts = target.querySelector('.pc-parts')
  // if (pcParts) {
  // 	const prices = pcParts.querySelectorAll('.pc-part__price')
  // 	//const totalPrice = document_or_other_target.querySelector('.assemblage-items__total')
  // 	const reducer = (acc, price) => {
  // 		const priceContent = price.textContent
  // 		const priceValue = priceContent.replace(/\s/g, '').replace(/,/g, '.')
  // 		return acc + +priceValue
  // 	}
  // 	const sum = [].reduce.call(prices, reducer, 0)
  // 	//totalPrice.textContent = `${Math.round(sum).toLocaleString('ru-RU')} ₽`
  // }

  const conflictsBlock = target.querySelector('.sidebars .conflicts')
  if (conflictsBlock) {
    const items = conflictsBlock.querySelectorAll(
      '.conflicts__item' //'.conflicts__item:not(.conflicts__item--question)'
    )
    items.forEach(item => {
      if (!item.classList.contains('listened')) {
        item.classList.add('listened');
        item.addEventListener('click', () => {
          switchConflictsBlockItem(conflictsBlock, item)
          const { conflictId } = item.dataset
          mapCirclesById(conflictId, unhoverCircles)
          switchConflict(conflictId, target)
        })
        item.addEventListener('mouseover', () => {
          item.classList.add('conflicts__item--hover')
          const { conflictId } = item.dataset
          mapCirclesById(conflictId, hoverCircles)
          hoverConflict(conflictId, target)
          hoverConflictsBlockItem(conflictsBlock, item)
        })
        item.addEventListener('mouseout', () => {
          item.classList.remove('conflicts__item--hover')
          const { conflictId } = item.dataset
          mapCirclesById(conflictId, unhoverCircles)
          unhoverConflict(conflictId, target)
          unhoverConflictsBlockItem(conflictsBlock, item)
        })
      }
    })
  }


  //updateConflictsLines()

  const pcPartConflicts = target.querySelectorAll('.pc-part[data-conflict-id]')
  if (pcPartConflicts) {
    let conflicts = target.querySelectorAll('.pc-part[data-conflict-id~="s0"]')
    const getTitle = conflict => conflict.querySelector('.pc-part__title')
    for (let i = 0; conflicts.length > 0;) {
      if (conflicts.length !== 1) {
        setConflictsLines(/*conflicts[].dataset.conflictId*/`s${i}`, [].map.call(conflicts, getTitle), target)
      }
      conflicts = target.querySelectorAll(`.pc-part[data-conflict-id~="s${++i}"]`)
    }

    pcPartConflicts.forEach(item => {
      const title = item.querySelector('.pc-part__title')
      const circle = document.createElement('span')
      circle.classList.add('pc-part__conflict-circle', 'conflict-circle')
      circle.addEventListener('mouseover', () => {
        circle.closest('.pc-part').querySelector('.pc-part__price').style.color = '#bfbfbf'
        circle.classList.add('conflict-circle--hover')
        const conflictId = circle.closest('[data-conflict-id]').dataset.conflictId.split(' ')
        conflictId.forEach(id =>
          hoverConflictsBlockItem(conflictsBlock, getConflictsBlockItemById(id, target))
        )
      })
      circle.addEventListener('mouseout', () => {
        circle.closest('.pc-part').querySelector('.pc-part__price').removeAttribute('style')
        circle.classList.remove('conflict-circle--hover')
        const conflictId = circle.closest('[data-conflict-id]').dataset.conflictId.split(' ')
        conflictId.forEach(id =>
          unhoverConflictsBlockItem(conflictsBlock, getConflictsBlockItemById(id, target))
        )
      })
      title.insertAdjacentElement('afterbegin', circle)
    })
  }
}

//CONFLICTS END



// function manageDataIconsAssemblage(where = document){
// 	const dataIcons = document.querySelectorAll('[data-icon]')
// 	if (dataIcons.length) {
// 		dataIcons.forEach(item => {
// 			const { icon } = item.dataset
// 			if (item.querySelector(`.svg-icon.icon-${icon}`)) return;
// 			if (item.classList.contains('pc-parts__choose-item')) {
// 				item.insertAdjacentHTML('afterbegin', `<span class="svg-icon icon-${icon}"></span>`)
// 			} else {
// 				const title = item.querySelector('.pc-part__title') || item
// 				title.insertAdjacentHTML('afterbegin', `<span class="svg-icon icon-${icon}"></span>`)
// 			}
// 		})
// 	}
// }


// function managePcPartsDescriptions(){
// 	const pcPartsDescriptions = document.querySelectorAll('.pc-part__description')
// 	if (pcPartsDescriptions) {
// 		pcPartsDescriptions.forEach(description => {
// 			const title = description.querySelector('.pc-part__title')
// 			const titleP = title.querySelector('p')
// 			const details = description.querySelector('.pc-part__details')
// 			if (titleP.getBoundingClientRect().width >= 215) {
// 				title.classList.add('pc-part__title--gradient')
// 			}
// 			else title.classList.remove('pc-part__title--gradient')
// 			if (details.getBoundingClientRect().width >= 215) {
// 				details.classList.add('pc-part__details--gradient')
// 			}
// 			else details.classList.remove('pc-part__details--gradient')
// 		})
// 	}
// }


const cancelButtons = document.querySelectorAll('.sidebar__close-btn')
cancelButtons.forEach(btn => {
  btn.addEventListener('click', () => { //should not be used not in mobile regime!
    const rightSidebars = document.querySelector('.sidebars__right')
    if (!rightSidebars.classList.contains('sidebars__right--hidden')) {
      rightSidebars.classList.add('sidebars__right--hidden')
    }
    //debugger;
    document.body.classList.remove('sidebar-open')
  })
})

function isMobileButtonsVisible() {
  const mobileSidebarButtons = document.querySelector('.section__mobile-buttons')
  if (!mobileSidebarButtons) {
    return false
  }
  const { bottom } = mobileSidebarButtons.getBoundingClientRect()
  return bottom > 0
}

function getSidebarsAndWrapper(wrapperSelector) {
  const wrapper = document.querySelector(wrapperSelector)
  const sidebars = wrapper.querySelectorAll('.sidebar')
  return [wrapper, sidebars]
}

function displayRightSidebars() {
  const [rightSidebarsWrapper, rightSidebars] = getSidebarsAndWrapper('.sidebars__right')
  const [leftSidebarsWrapper, leftSidebars] = getSidebarsAndWrapper('.sidebars__left')
  if (window.innerWidth <= 549 && leftSidebars.length) {
    const isRightSidebarsOpen = !rightSidebarsWrapper.classList.contains(
      'sidebars__right--hidden'
    )
    leftSidebars.forEach(sidebar => {
      sidebar.classList.remove('sidebar--upper', 'sidebar--lower')
      if (isRightSidebarsOpen) {
        sidebar.classList.add('sidebar--lower')
      }
      rightSidebarsWrapper.appendChild(sidebar)
    })
  } else if (window.innerWidth > 549 && !leftSidebars.length) {
    rightSidebarsWrapper.classList.add('sidebars__right--hidden')
    rightSidebars.forEach(sidebar => {
      sidebar.classList.remove('sidebar--upper')
      sidebar.classList.remove('sidebar--lower')
      if (!sidebar.classList.contains('sidebar--assemblage')) {
        leftSidebarsWrapper.appendChild(sidebar)
      }
    })
  }

  if (window.innerWidth > 768) {
    const activeTab = document.querySelector('.product-tabs__item--active')
    if (activeTab?.dataset.tab === 'photos') {
      const activeTabBody = document.querySelector(`#${activeTab.dataset.tab}`)
      activeTab.classList.remove('product-tabs__item--active')
      activeTabBody.classList.remove('product-tabs__block--active')

      const newActiveTab = document.querySelector(`[data-tab="shops"]`)
      const newActiveTabBody = document.querySelector(`#shops`)
      newActiveTab.classList.add('product-tabs__item--active')
      newActiveTabBody.classList.add('product-tabs__block--active')
    }
  }

  const rightSidebarsButtons = rightSidebarsWrapper.querySelectorAll('.sidebar__btn')
  if (+window.innerWidth <= 549 && rightSidebarsButtons && isMobileButtonsVisible()) {
    rightSidebarsButtons.forEach(sidebar => {
      sidebar.style.display = 'none'
    })
  } else {
    rightSidebarsButtons.forEach(sidebar => {
      sidebar.style = ''
    })
  }
}

window.addEventListener('scroll', displayRightSidebars)

function onResize() {
  displayRightSidebars()

  const sectionSlider = document.querySelector('.section__slider')
  if (sectionSlider && +window.innerWidth <= 373) {
    const products = sectionSlider.querySelectorAll('.product--short')
    products.forEach(product => {
      const title = product.querySelector('.product__title')
      if (title.getBoundingClientRect().height > 40) {
        title.classList.add('product__title--overflow')
        const productName = title.querySelector('.product__name')
        truncate(40, title, productName)
      }

      function truncate(maxHeight, parent, elToOverflow) {
        while (parent.offsetHeight > maxHeight) {
          elToOverflow.textContent = elToOverflow.textContent.substr(
            0,
            elToOverflow.textContent.length - 1
          )
        }
      }
    })
  }
  //TODO redo conflicts on arrangment page
  const conflicts = document.querySelectorAll('.assemblage__conflicts .conflicts__item')
  if (conflicts) {
    const conflictsSvg = document.querySelectorAll('.main svg[data-conflict-id]')
    conflictsSvg.forEach(svg => svg.remove())
    conflicts.forEach(conflict => {
      conflict.classList.remove('conflicts__item--chosen')
      conflict.classList.remove('conflicts__item--hover')
      conflict.classList.remove('conflicts__item--prev')
    })
  }
  updateConflictsLines() //TODO исправить это, было лучше
  // manageConflicts.updateConflictsLines();
}

window.addEventListener('resize', onResize)

//----------------
// manageAssemblage()
// function manageAssemblage(){
// 	manageDataIconsAssemblage();
// 	managePcPartsDescriptions();
// }


//----------------
if (readyToManage) readyToManage.then(manage);
else manage();

// function initManage(){
// 	manage();

// }

function manage() {
  //manageFilter();
  manageStars();
  manageTabs();
  manageMessageBoxes();
  manageConflictsTitles();
  manageRandomSmiles();
  manageSort();
  manageSocialButtons();
  manageShopShowMore();
  manageRegion();
  manageBeta();

  // manageDataIconsAssemblage();
  // managePcPartsDescriptions();
  const mobileSidebarButtons = document.querySelector('.section__mobile-buttons')
  if (mobileSidebarButtons) {
    const openButtons = mobileSidebarButtons.querySelectorAll('.section__button:not(.managed)')
    openButtons.forEach(btn => {
      btn.classList.add('managed')
      btn.addEventListener('click', () => {
        const rightSidebarsWrapper = document.querySelector('.sidebars__right')
        rightSidebarsWrapper.classList.remove('sidebars__right--hidden')

        const rightSidebars = rightSidebarsWrapper.querySelectorAll('.sidebar')
        rightSidebars.forEach(sidebar => {
          sidebar.classList.remove('sidebar--upper')
          sidebar.classList.add('sidebar--lower')
        })

        const sidebarToOpen = rightSidebarsWrapper.querySelector(`.${btn.dataset.sidebar}`)
        sidebarToOpen.classList.remove('sidebar--lower')
        sidebarToOpen.classList.add('sidebar--upper')

        document.body.classList.add('sidebar-open')
      })
    })
  }

  displayRightSidebars()
  //Tabs
  function manageTabs() {
    const productTabsWrapper = document.querySelector('.product-tabs__items')
    if (productTabsWrapper) {
      const productSlides = document.querySelectorAll('.swiper-slide')
      if (productSlides) {
        productTabsWrapper.insertAdjacentHTML(
          'beforeend',
          '<li data-tab="photos" class="product-tabs__item">Изображения</li>'
        )

        const photosTab = document.querySelector('.product-photos-tab')
        productSlides.forEach(img => {
          const src = img.getAttribute('src')
          photosTab.insertAdjacentHTML(
            'beforeend',
            `<div class="product-description__image-wrapper">
							<img src="${src}" class="product-description__image"></img>
						</div>`
          )
        })
      }
      const tabs = productTabsWrapper.querySelectorAll('.product-tabs__item')
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const activeTab = document.querySelector('.product-tabs__item--active')
          const activeTabBody = document.querySelector(`#${activeTab.dataset.tab}`)
          activeTab.classList.remove('product-tabs__item--active')
          activeTabBody.classList.remove('product-tabs__block--active')

          const newActiveTabBody = document.querySelector(`#${tab.dataset.tab}`)
          tab.classList.add('product-tabs__item--active')
          newActiveTabBody.classList.add('product-tabs__block--active')
        })
      })
    }
  }

  //Stars rating
  function manageStars() {
    const stars = document.querySelectorAll('.product-rating__star')
    if (stars.length) {
      stars.forEach(star => {
        const parent = star.parentNode

        if (parent.dataset.totalValue !== '0') {
          const userValue = parent.querySelector('.product-rating__average');
          //debugger;
          //TODO fix
          if (userValue) userValue.textContent = parent.dataset.totalValue
          star.classList.add('product-rating__star--disabled')
        } else {
          star.addEventListener('click', () => {
            const { value } = star.dataset
            parent.dataset.totalValue = value
            const note = document.querySelector('.product-rating__note')
            note.classList.add('product-rating__note--hidden')
            handleRating(value)
          })
        }
      })
    }
  }

  const yearRates = document.querySelectorAll('.year-rate')
  if (yearRates.length) {
    const value = document.querySelectorAll('.year-rate__value')
    value.forEach(yearRate => {
      if (yearRate.querySelector('svg')) return
      const percentValue = parseInt(yearRate.textContent)
      const circumference = 2 * Math.PI * 13
      const offset = circumference - (percentValue / 100) * circumference
      const circle = `
			<svg class="percent-circle" width="30" height="30">
				<circle
					transform="rotate(270, 15, 15)"
					stroke="#fff" fill="transparent"
					stroke-width="2" cx="15" cy="15" r="13"
					stroke-linecap="round"
					stroke-dasharray="${circumference} ${circumference}"
					stroke-dashoffset="${offset}"/>
			</svg>
			`
      yearRate.innerHTML = percentValue === 100 ? '★' : `${percentValue}`
      yearRate.innerHTML += circle
    })
  }

  //Comment votes
  const commentVotes = document.querySelectorAll('.comment-vote')
  if (commentVotes.length) {
    commentVotes.forEach(vote => {
      const upvoteBtn = vote.querySelector('.comment-vote__btn--up')
      const downvoteBtn = vote.querySelector('.comment-vote__btn--down')
      const rating = vote.querySelector('.comment-vote__rating')
      upvoteBtn.addEventListener('click', () => {
        rating.textContent++
        checkRating(rating)
      })
      downvoteBtn.addEventListener('click', () => {
        rating.textContent--
        checkRating(rating)
      })

      checkRating(rating)
    })

    function checkRating(rating) {
      const comment = rating.closest('.product-comment')
      if (rating.textContent >= 10) {
        comment.classList.add('product-comment--good')
      } else if (rating.textContent <= -5) {
        comment.classList.add('product-comment--bad')
      } else {
        comment.classList.remove('product-comment--good')
        comment.classList.remove('product-comment--bad')
      }
    }
  }

  //Price at shops
  const pricesAtShops = document.querySelectorAll('.product-price__price')
  if (pricesAtShops.length) {
    pricesAtShops.forEach(price => {
      if (!price.textContent.trim().localeCompare('нет в наличии')) {
        price.style.border = 'none'
      }
    })
  }


  const productRating = document.querySelectorAll('.product-score-rating')
  if (productRating.length) {
    productRating.forEach(manageProductScoreRating)
  }

  const sectionSlider = document.querySelector('.section__slider')
  if (sectionSlider) {
    const products = sectionSlider.querySelectorAll('.product--short')
    products.forEach(product => {
      const title = product.querySelector('.product__title')
      if (title.getBoundingClientRect().height > 40) {
        title.classList.add('product__title--overflow')
        const productName = title.querySelector('.product__name')
        truncate(40, title, productName)
      }

      function truncate(maxHeight, parent, elToOverflow) {
        while (parent.offsetHeight > maxHeight) {
          elToOverflow.textContent = elToOverflow.textContent.substr(
            0,
            elToOverflow.textContent.length - 1
          )
        }
      }
    })
  }

  const searchBars = document.querySelectorAll('.search-bar')
  if (searchBars.length) {
    searchBars.forEach(sb => {
      sb.addEventListener('click', () => {
        sb.classList.add('search-bar--active')
        document.querySelector('body').addEventListener('click', e => {
          if (!sb.contains(e.target)) {
            sb.classList.remove('search-bar--active')
          }
        })
      })
    })
  }

  const menuBtn = document.querySelector('.header .icon-menu')
  if (menuBtn) {
    const headerSign = document.querySelector('.header__sign')
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('icon-menu--opened')
      headerSign.classList.toggle('header__sign--opened')
    })
    document.addEventListener('click', e => {
      if (!headerSign.contains(e.target) && !menuBtn.contains(e.target)) {
        headerSign.classList.remove('header__sign--opened')
      }
    })
  }

  const productPhotos = document.querySelector('.product__photos')
  if (productPhotos) {
    const slides = productPhotos.querySelectorAll('.swiper-slide')
    const slidesCount = slides.length

    const getSlideClone = idx => {
      const imgClone = slides[idx].cloneNode()
      imgClone.removeAttribute('role')
      imgClone.removeAttribute('style')
      imgClone.removeAttribute('aria-label')
      imgClone.removeAttribute('class')
      return imgClone
    }

    slides.forEach((slide, i) => {
      slide.addEventListener('click', () => {
        if (slide.dataset.modalSlide) {
          const imgClone = getSlideClone(i)
          imgClone.classList = 'product__image'
          imgClone.dataset.modalSlide = slide.dataset.modalSlide
          slide.removeAttribute('data-modal-slide')

          const prevModalNum = productPhotos.querySelector('.product__image').dataset
            .modalSlide
          const prevModalImg = productPhotos.querySelector(
            `.swiper-slide:nth-child(${prevModalNum})`
          )
          prevModalImg.dataset.modalSlide = prevModalNum

          const productImgWrapper = productPhotos.firstElementChild
          const productImg = productImgWrapper.firstElementChild
          productImgWrapper.replaceChild(imgClone, productImg)
          manageImageBackrounds()
        }
      })
    })

    const productModal = document.querySelector('.product-modal')
    const closeModalButton = productModal.querySelector('.product-modal__close')
    const imageWrapper = productModal.querySelector('.product-modal__img')

    const openModal = () => {
      productModal.classList.add('product-modal--visible')
    }
    const closeModal = () => {
      productModal.classList.remove('product-modal--visible')
    }

    const closeTarget = [productModal, imageWrapper, closeModalButton]
    productModal.addEventListener('click', e => {
      if (closeTarget.some(target => target === e.target)) {
        closeModal()
      }
    })

    const prevBtn = productModal.querySelector('.product-modal__prev')
    const nextBtn = productModal.querySelector('.product-modal__next')
    prevBtn.addEventListener('click', () => plusSlides(-1))
    nextBtn.addEventListener('click', () => plusSlides(1))

    let slideIndex = 1
    const plusSlides = n => {
      showSlides((slideIndex += n))
    }
    const currentSlide = n => {
      showSlides((slideIndex = n))
    }

    const productPhotosMain = productPhotos.firstElementChild
    productPhotosMain.addEventListener('click', () => {
      openModal()
      currentSlide(productPhotosMain.firstElementChild.dataset.modalSlide - 1)
    })

    function showSlides(n) {
      const wrapper = document.querySelector('.product-modal__img')
      if (n > slidesCount - 1) {
        slideIndex = 0
      } else if (n < 0) {
        slideIndex = slidesCount - 1
      }
      wrapper.innerHTML = ''
      const slideClone = getSlideClone(slideIndex)
      wrapper.appendChild(slideClone)
        (slideClone.setAttribute('sizes', '(max-width: 1200px) 90vw, 1200px'));
    }
  }

  // Handle comment's button click
  const productComments = document.querySelector('.product-comments')
  if (productComments) {
    const replyToWrapper = productComments.querySelector('.comment-form__reply-to')
    const replyCancel = replyToWrapper.querySelector('.icon-cancel-filter')
    replyCancel.addEventListener('click', () => {
      replyToWrapper.style.display = 'none'
      const activeButton = productComments.querySelector(
        '.product-comment__respond-btn--pressed '
      )
      activeButton.classList.remove('product-comment__respond-btn--pressed')
    })
    const replyUsername = replyToWrapper.querySelector('.comment-form__reply-username')

    const productComment = productComments.querySelectorAll('.product-comment')
    productComment.forEach(comment => {
      const username = comment.querySelector('.product-comment__author').textContent.trim()
      const respondButton = comment.querySelector('.product-comment__respond-btn')
      respondButton.addEventListener('click', () => {
        const activeButton = productComments.querySelector(
          '.product-comment__respond-btn--pressed '
        )
        if (activeButton) {
          activeButton.classList.remove('product-comment__respond-btn--pressed')
        }
        if (activeButton !== respondButton) {
          respondButton.classList.add('product-comment__respond-btn--pressed')
          replyToWrapper.removeAttribute('style')
          replyUsername.textContent = username
        } else {
          replyToWrapper.style.display = 'none'
        }
      })
    })
  }

  const viewTypes = document.querySelectorAll('.view-types__type')
  if (viewTypes.length) {
    //const defaultType = document.querySelector('.view-types__type--active')
    manageProductsViewType()

    viewTypes.forEach(type => {
      type.addEventListener('click', () => {
        // const active = document.querySelector('.view-types__type--active')
        // if (type !== active) {
        // 	if (active) {
        // 		active.classList.remove('view-types__type--active')
        // 	}
        // 	type.classList.add('view-types__type--active')
        // 	saveProductsViewType(type)
        // 	manageProductsViewType()
        // }
        saveProductsViewType(type)
        manageProductsViewType()
      })
    })
  }

  //swiper


  let mySwiper = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    spaceBetween: 1,

    // Navigation arrows
    navigation: {
      nextEl: '.product-slider__button_next',
      prevEl: '.product-slider__button_prev',
      disabledClass: 'product-slider__button_disabled'
    },
  })


  // let mySwiper;

  function initSwiper() {
    const sectionContainer = document.querySelector('.section-slider')
    if (!sectionContainer) return;
    sectionContainer.classList.remove('section-slider--reach-end')
    sectionContainer.classList.add('section-slider--reach-beg')

    mySwiper = new Swiper('.swiper-container', {
      slidesPerView: 'auto',
      grabCursor: true,
      resistance: false,
      navigation: {
        nextEl: '.section-slider__btn--next',
        prevEl: '.section-slider__btn--prev',
        disabledClass: 'section-slider__btn--disabled'
      },
    })

    mySwiper.on('reachEnd', () => {
      sectionContainer.classList.add('section-slider--reach-end')
    })
    mySwiper.on('reachBeginning', () => {
      sectionContainer.classList.add('section-slider--reach-beg')
    })
    mySwiper.on('fromEdge', () => {
      sectionContainer.classList.remove('section-slider--reach-end')
      sectionContainer.classList.remove('section-slider--reach-beg')
    })
  }
  initSwiper()
  const toggleSwiperBtn = document.querySelector('.section-slider__btn--toggle')
  if (toggleSwiperBtn) toggleSwiperBtn.addEventListener('click', () => {
    const slider = document.querySelector('.slider-container');
    if (slider.classList.contains('slider-container--opened')) {
      slider.classList.remove('slider-container--opened')
      initSwiper()
    } else {
      mySwiper.destroy()
      slider.classList.add('slider-container--opened')
    }
  })


  //check all product images
  manageImageBackrounds();

  managePageConflicts();

  if (afterManageActions) {
    for (let f of afterManageActions) f();
    afterManageActions = [];
  }
}

//image backgrounds
function manageImageBackrounds() {
  const productImageWrappers = document.querySelectorAll('.product__image-wrapper');
  productImageWrappers.forEach(productImageWrapper => {
    if (productImageWrapper.querySelector('img[src$=".jpg"]') || productImageWrapper.querySelector('img[src$=".jpeg"]') || productImageWrapper.querySelector('img[data-source-format="jpg"]')) {
      //console.log('here')
      productImageWrapper.style.backgroundColor = '#fff';
    }
    else productImageWrapper.style.backgroundColor = null;
  })
}

//productViewTypes
function manageProductsViewType() {
  let type = getProductsViewType();
  const toActivateType = document.querySelector(`.view-types__type.${type}`)
  const active = document.querySelector('.view-types__type--active')
  if (active) {
    active.classList.remove('view-types__type--active')
  }
  toActivateType.classList.add('view-types__type--active')

  const products = document.querySelectorAll('.product')
  const container = document.querySelector('.container')
  if (type === 'lines') {
    products.forEach(product => {
      product.classList.add('product--long')
      product.classList.remove('product--flex')
    })
    container.classList.remove('container--full-width')
  } else if (type === 'flex-lines') {
    products.forEach(product => {
      product.classList.add('product--flex')
      product.classList.remove('product--long')
    })
    container.classList.remove('container--full-width')
  } else if (type === 'blocks') {
    products.forEach(product => {
      product.classList.add('product--flex')
      product.classList.remove('product--long')
    })
    container.classList.add('container--full-width')
  }
}

function manageProductScoreRating(rating) {
  if (rating.querySelector('svg')) return;

  if (rating.dataset.hasOwnProperty('minP')) {
    rating.title = `
			Поддерживается ${rating.dataset.minP}% игр на минимальных и ${rating.dataset.recP}% на рекомендуемых.
Поддерживаются все игры до ${rating.dataset.minY} года на минимальных и до ${rating.dataset.recY} на рекомендуемых.
		`;
  }


  const value = parseInt(rating.textContent)
  if (!value) {
    rating.title = `К сожалению, невозможно сделать оценку данной сборки. Устраните конфликты и добавьте все необходимые комплектующие.`;
    return;
  }
  const DASH_LEN = 11
  const GAP_LEN = 5
  const CIRCUMFERENCE = 2 * Math.PI * 13
  const svg = `
	<svg class="rate-ring" width="30" height="30">
	<circle
		transform="rotate(270, 15, 15)"
		stroke="#fff" fill="transparent" stroke-width="2" cx="15" cy="15" r="13"
		stroke-dasharray="
		${Array(value).fill(DASH_LEN).join(` ${GAP_LEN} `)}
		${CIRCUMFERENCE - 16 * value + GAP_LEN}
		"
	></circle>
	</svg>
	`
  rating.insertAdjacentHTML('beforeend', svg)
}

function saveProductsViewType(typeElement) {
  let type = 'flex-lines';
  if (typeElement.classList.contains('lines')) {
    type = 'lines';
  } else if (typeElement.classList.contains('flex-lines')) {
    type = 'flex-lines';
  } else if (typeElement.classList.contains('blocks')) {
    type = 'blocks';
  }
  window.localStorage.setItem('productsViewType', type);
}

function getProductsViewType() {
  let type = window.localStorage.getItem('productsViewType');
  if (!type) type = 'flex-lines';
  return type;
}

function manageMessageBoxes() {
  let ms = document.querySelectorAll('.message-box');

  for (let m of ms) {
    if (m.querySelector('span.cross')) continue;
    let cross = create(null, 'span', 'cross');
    m.prepend(cross);
    cross.innerHTML = '✖';

    let isShown = false;

    cross.addEventListener('click', e => {
      if (m.dataset.messageBox) {
        let closedMessages = window.localStorage.getItem('closedMessageBoxes');
        if (!closedMessages) closedMessages = [];
        else {
          try {
            closedMessages = JSON.parse(closedMessages);
          }
          catch (e) {
            closedMessages = [];
          }
        }
        closedMessages.push(m.dataset.messageBox);
        window.localStorage.setItem('closedMessageBoxes', JSON.stringify(closedMessages));
      }
      else if (m.dataset.messageBoxCookie) {
        document.cookie = `${m.dataset.messageBoxCookie}=true; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
      }

      m.remove()
    });

    if (window.innerWidth > 549) {
      m.querySelectorAll('details')?.forEach(e => e?.setAttribute('open', true));
    }

    let closedMessages = window.localStorage.getItem('closedMessageBoxes');
    if (!closedMessages) closedMessages = [];
    else {
      try {
        closedMessages = JSON.parse(closedMessages);
      }
      catch (e) {
        closedMessages = [];
      }
    }

    if (m.dataset.messageBox) {
      if (!closedMessages.includes(m.dataset.messageBox)) {
        //m.style.display = 'block';
        isShown = true;
      }
      else continue;
    }



    if (m.dataset.messageBoxChance) {
      if (!m.dataset.messageBoxChanceGroup) {
        let chance = + m.dataset.messageBoxChance;
        //console.log('chance', chance);
        if (chance >= Math.random()) {
          //m.style.display = 'block';
          isShown = true;
        }
      }
      else {
        if (!manageMessageBoxes.chanceGroups) manageMessageBoxes.chanceGroups = {};
        if (!manageMessageBoxes.chanceGroups[m.dataset.messageBoxChanceGroup])
          manageMessageBoxes.chanceGroups[m.dataset.messageBoxChanceGroup] = {
            isFired: false,
            chanceSum: 0,
            roll: Math.random()
          };
        if (manageMessageBoxes.chanceGroups[m.dataset.messageBoxChanceGroup].isFired) continue;
        manageMessageBoxes.chanceGroups[m.dataset.messageBoxChanceGroup].chanceSum += +m.dataset.messageBoxChance;
        if (manageMessageBoxes.chanceGroups[m.dataset.messageBoxChanceGroup].chanceSum >= manageMessageBoxes.chanceGroups[m.dataset.messageBoxChanceGroup].roll) {
          manageMessageBoxes.chanceGroups[m.dataset.messageBoxChanceGroup].isFired = true;
          // m.style.display = 'block';
          isShown = true;
        }
      }
    }

    if (m.dataset.messageBoxShowCount) {
      let messageBoxesInfo = window.localStorage.getItem('messageBoxesInfo');
      if (!messageBoxesInfo) messageBoxesInfo = {};
      else {
        try {
          messageBoxesInfo = JSON.parse(messageBoxesInfo);
        }
        catch (e) {
          messageBoxesInfo = {};
        }
      }
      if (messageBoxesInfo[m.dataset.messageBox]) {
        if (isShown) messageBoxesInfo[m.dataset.messageBox].showCount++;
        messageBoxesInfo[m.dataset.messageBox].maxShowCount = +m.dataset.messageBoxShowCount;
        messageBoxesInfo[m.dataset.messageBox].chance = +m.dataset.messageBoxChance;
        messageBoxesInfo[m.dataset.messageBox].chanceGroup = m.dataset.messageBoxChanceGroup;
      }
      else {
        messageBoxesInfo[m.dataset.messageBox] = {
          maxShowCount: m.dataset.messageBoxShowCount,
          showCount: 1,
          id: m.dataset.messageBox,
          chance: m.dataset.messageBoxChance,
          chanceGroup: m.dataset.messageBoxChanceGroup
        };
      }
      if (messageBoxesInfo[m.dataset.messageBox].showCount >= messageBoxesInfo[m.dataset.messageBox].maxShowCount) {
        closedMessages.push(m.dataset.messageBox);
        window.localStorage.setItem('closedMessageBoxes', JSON.stringify(closedMessages));
      }

      window.localStorage.setItem('messageBoxesInfo', JSON.stringify(messageBoxesInfo));
    }

    if (isShown) m.style.display = 'block';
  }
}

function manageConflictsTitles() {
  let cs = document.querySelectorAll('.conflicts__title');
  for (let c of cs) manageConflictsTitle(c);
}
function manageConflictsTitle(c) {
  if (c.dataset.hasOwnProperty('conflictsNum')) {
    c.innerHTML = '';
    let conflicts_num = c.dataset.conflictsNum;
    if (conflicts_num < 1) c.innerText = `Нет конфликтов`;
    else if (conflicts_num == 1) c.innerText = `1 конфликт`;
    else if (conflicts_num < 5) c.innerText = `${conflicts_num} конфликта`;
    else c.innerText = `${conflicts_num} конфликтов`;
  }
}

function manageRandomSmiles() {
  let ss = document.querySelectorAll('[data-random-smile]');
  for (let s of ss) {
    s.innerHTML = smile(s.dataset.randomSmile);
  }
}



function manageRegionAppearence() {
  if (document.querySelectorAll('.region')) {
    document.querySelectorAll('.region').forEach((region) => {
      const btnWrapper = region.querySelector('.region__btn-wrapper'),
        regionBtn = region.querySelector('.region__btn'),
        regionMenu = region.querySelector('.region__list'),
        regionItem = region.querySelectorAll('.region__item'),
        regionInput = region.querySelector('.region__input'),
        regionIcon = region.querySelector('.region__icon');

      const tabsOverflow = (visibility) => {
        document.querySelectorAll('.product-tabs__items').forEach((tabs) => {
          tabs.style.overflow = visibility;
        });
      };

      const headerRegionAdaptive = () => {
        if (document.documentElement.scrollWidth < 549) {
          if (!regionMenu.classList.contains('region__list-vertical')) {
            if (regionMenu.classList.contains('region__list-inline--active')) {
              regionMenu.style.maxHeight = regionMenu.scrollHeight + 8 + 'px';
            } else {
              regionMenu.style.maxHeight = 0;
            };
          };
        };
      };

      btnWrapper.addEventListener('click', () => {
        btnWrapper.classList.toggle('region__btn-wrapper--active');

        if (regionMenu.classList.contains('region__list-inline')) {
          regionMenu.classList.toggle('region__list-inline--active');
          regionIcon.classList.toggle('header__region-icon--active');

          if (regionMenu.classList.contains('region__list-inline--active')) {
            regionMenu.style.maxWidth = regionMenu.scrollWidth + 'px';
          } else {
            regionMenu.style.maxWidth = 0;
          };
        } else if (regionMenu.classList.contains('region__list-vertical')) {
          regionMenu.classList.toggle('region__list-vertical--active');
          regionIcon.classList.toggle('shop-region__icon--active');

          if (regionMenu.classList.contains('region__list-vertical--active')) {
            regionMenu.style.maxHeight = regionMenu.scrollHeight + 8 + 'px';
            tabsOverflow('visible');
          } else {
            regionMenu.style.maxHeight = 0;
            tabsOverflow('auto');
          };
        };

        headerRegionAdaptive();

        window.addEventListener('resize', () => {
          headerRegionAdaptive();
        });
      });

      const closeRegion = () => {
        btnWrapper.classList.remove('region__btn-wrapper--active');

        if (regionMenu.classList.contains('region__list-inline')) {
          regionMenu.classList.remove('region__list-inline--active');
          regionIcon.classList.remove('header__region-icon--active');
          regionMenu.style.maxWidth = 0;

          if (document.documentElement.scrollWidth < 549) {
            regionMenu.style.maxHeight = 0;
          } else {
            regionMenu.style.maxHeight = regionMenu.scrollHeight + 'px'
          };

          window.addEventListener('resize', () => {
            if (document.documentElement.scrollWidth < 549) {
              regionMenu.style.maxHeight = 0;
            } else {
              regionMenu.style.maxHeight = regionMenu.scrollHeight + 'px'
            };
          });

        } else if (regionMenu.classList.contains('region__list-vertical')) {
          regionMenu.classList.remove('region__list-vertical--active');
          regionIcon.classList.remove('shop-region__icon--active');
          regionMenu.style.maxHeight = 0;
          tabsOverflow('auto');
        }
      };

      const itemDisplay = () => {
        for (let i = 0; i < regionItem.length; i++) {
          if (regionItem[i].innerText === regionBtn.innerText) {
            regionItem[i].style.display = 'none';
          } else {
            regionItem[i].style.display = 'block';
          };
        };
      };

      regionItem.forEach((item) => {
        itemDisplay();

        item.addEventListener('click', () => {
          regionBtn.innerText = item.innerText;
          closeRegion();
          itemDisplay();
          regionInput.value = regionBtn.innerText;

          let evt = new CustomEvent("region_change", {
            detail: {
              cc: item.dataset.cc, caller: item
            },
            bubbles: true
          });
          item.dispatchEvent(evt);

        });
      });

      document.querySelector('body').addEventListener('click', e => {
        if (!region.contains(e.target)) {
          closeRegion();
        };
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === 'Escape') {
          closeRegion();
        };
      });
    });
  };
}

function manageSort() {
  // document.querySelector("body > div.container > main > section > div.section__header > form").insertAdjacentHTML('afterEnd',
  // 	`
  // 	<div class="section__button section__button--sort sort">
  // 		<ul class="sort__list">
  // 			<li class="sort__item" data-sort-by="standard">
  // 				<span class="sort__btn svg-icon icon-sort"></span>
  // 				<span class="order-direction">
  // 					<a class="order-direction__arrow order-direction__arrow-top icon-arrow-top"
  // 						href="#"></a>
  // 					<a class="order-direction__arrow order-direction__arrow-bottom icon-arrow-down"
  // 						href="#"></a>
  // 				</span>
  // 			</li>
  // 			<li class="sort__item" data-sort-by="min_price">
  // 				<span class="sort__btn svg-icon icon-dollar"></span>
  // 				<span class="order-direction">
  // 					<a class="order-direction__arrow order-direction__arrow-top icon-arrow-top"
  // 						href="#"></a>
  // 					<a class="order-direction__arrow order-direction__arrow-bottom icon-arrow-down"
  // 						href="#"></a>
  // 				</span>
  // 			</li>
  // 		</ul>
  // 	</div>
  // 	<div class="mobile-sort">
  // 		<button class="mobile-sort__btn">
  // 			<span class="sort__btn svg-icon icon-sort"></span>
  // 		</button>
  // 		<div class="mobile-sort__menu sidebar .mobile-sort__menu--active">
  // 			<p class="sidebar__title mobile-sort__title">
  // 				<span>Сортировка по</span>
  // 				<span class="mobile-sort__close-btn">✖</span>
  // 			</p>
  // 			<ul class="mobile-sort__list">
  // 				<li class="mobile-sort__item">
  // 					<a class="mobile-sort__link" href="#" data-sort-by="min_price" data-sort-direction="ASC">
  // 						<span class="mobile-sort__arrows">
  // 							<span
  // 								class="icon-arrow-top mobile-sort__arrow mobile-sort__arrow--active"></span>
  // 							<span
  // 								class="icon-arrow-down mobile-sort__arrow mobile-sort__arrow--disabled"></span>
  // 						</span>
  // 						<span>Цена возрастание</span>
  // 					</a>
  // 				</li>
  // 				<li class="mobile-sort__item">
  // 					<a class="mobile-sort__link" href="#" data-sort-by="min_price" data-sort-direction="DESC">
  // 						<span class="mobile-sort__arrows">
  // 							<span
  // 								class="icon-arrow-top mobile-sort__arrow mobile-sort__arrow--disabled"></span>
  // 							<span
  // 								class="icon-arrow-down mobile-sort__arrow mobile-sort__arrow--active"></span>
  // 						</span>
  // 						<span>Цена убывание</span>
  // 					</a>
  // 				</li>
  // 				<li class="mobile-sort__item">
  // 					<a class="mobile-sort__link" href="#" data-sort-by="standard" data-sort-direction="ASC">
  // 						<span class="mobile-sort__arrows">
  // 							<span
  // 								class="icon-arrow-top mobile-sort__arrow mobile-sort__arrow--active"></span>
  // 							<span
  // 								class="icon-arrow-down mobile-sort__arrow mobile-sort__arrow--disabled"></span>
  // 						</span>
  // 						<span>Стандартная возрастание</span>
  // 					</a>
  // 				</li>
  // 				<li class="mobile-sort__item">
  // 					<a class="mobile-sort__link" href="#" data-sort-by="standard" data-sort-direction="DESC">
  // 						<span class="mobile-sort__arrows">
  // 							<span
  // 								class="icon-arrow-top mobile-sort__arrow mobile-sort__arrow--disabled"></span>
  // 							<span
  // 								class="icon-arrow-down mobile-sort__arrow mobile-sort__arrow--active"></span>
  // 						</span>
  // 						<span>Стандартная убывание</span>
  // 					</a>
  // 				</li>
  // 			</ul>
  // 		</div>
  // 	</div>
  // 	`
  // );
  // let sectionHeaderIconsTemp = create(null, 'div', 'section__header-icons');
  // document.querySelector("body > div.container > main > section > div.section__header .section__title").after(sectionHeaderIconsTemp);
  // sectionHeaderIconsTemp.append(document.querySelector("body > div.container > main > section > div.section__header > form"));
  // sectionHeaderIconsTemp.append(document.querySelector("body > div.container > main > section > div.section__header .section__button--sort"));
  // sectionHeaderIconsTemp.append(document.querySelector("body > div.container > main > section > div.section__header .mobile-sort"));
  // if (document.querySelector("body > div.container > main > section > div.section__header .section__button--view-types")) sectionHeaderIconsTemp.append(document.querySelector("body > div.container > main > section > div.section__header .section__button--view-types"));

  function fireSortChange(sort_by, sort_direction, caller) {
    let evt = new CustomEvent("sort_change", {
      detail: {
        sort_by, sort_direction, caller
      },
      bubbles: true
    });
    caller.dispatchEvent(evt);

    console.log('fireSortChange', sort_by, sort_direction, caller);
  }



  if (document.querySelectorAll('.sort')) {
    const allSortButtons = document.querySelectorAll('.sort__btn'),
      sortArrows = document.querySelectorAll('.order-direction__arrow'),
      sortItem = document.querySelectorAll('.sort__item');

    sortItem.forEach((item) => {
      const sortBtn = item.querySelector('.sort__btn'),
        sortArrowTop = item.querySelector('.order-direction__arrow-top'),
        sortArrowBottom = item.querySelector('.order-direction__arrow-bottom');

      const removeActiveButtons = () => {
        for (let i = 0; i < allSortButtons.length; i++) {
          allSortButtons[i].classList.remove('sort__btn--active');
        };
      };

      const removeActiveArrows = () => {
        for (let i = 0; i < sortArrows.length; i++) {
          sortArrows[i].classList.remove('order-direction__arrow--active');
        };
      };

      const changeActiveArrow = (thisArrow, anotherArrow) => {
        removeActiveButtons();
        sortBtn.classList.add('sort__btn--active');

        if (thisArrow.classList.contains('order-direction__arrow--active')) {
          thisArrow.classList.remove('order-direction__arrow--active');
          anotherArrow.classList.add('order-direction__arrow--active');
        } else {
          removeActiveArrows();
          thisArrow.classList.add('order-direction__arrow--active');
        };
      };

      let change = (sortBtn) => fireSortChange(item.dataset.sortBy, sortArrowTop.classList.contains('order-direction__arrow--active') ? 'ASC' : 'DESC', sortBtn);

      sortBtn.addEventListener('click', () => {
        removeActiveButtons();
        sortBtn.classList.add('sort__btn--active');

        if (sortArrowBottom.classList.contains('order-direction__arrow--active')) {
          sortArrowBottom.classList.remove('order-direction__arrow--active');
          sortArrowTop.classList.add('order-direction__arrow--active');
        } else if (sortArrowTop.classList.contains('order-direction__arrow--active')) {
          sortArrowTop.classList.remove('order-direction__arrow--active');
          sortArrowBottom.classList.add('order-direction__arrow--active');
        } else {
          removeActiveArrows();
          sortArrowBottom.classList.add('order-direction__arrow--active');
        };

        change(sortBtn);
      });

      sortArrowTop.addEventListener('click', (e) => {
        e.preventDefault();
        changeActiveArrow(sortArrowTop, sortArrowBottom);
        change(sortArrowTop);
      });

      sortArrowBottom.addEventListener('click', (e) => {
        e.preventDefault();
        changeActiveArrow(sortArrowBottom, sortArrowTop);
        change(sortArrowBottom);
      });
    });

    /*
   блок сортировки на экранах меньше 568px
   */
    if (document.querySelector('.mobile-sort')) {
      const mobileSortBtn = document.querySelector('.mobile-sort__btn'),
        mobileSortMenu = document.querySelector('.mobile-sort__menu'),
        mobileSortCloseBtn = document.querySelector('.mobile-sort__close-btn'),
        mobileSortLink = document.querySelectorAll('.mobile-sort__link');

      mobileSortBtn.addEventListener('click', () => {
        mobileSortMenu.classList.add('mobile-sort__menu--active');
      });

      mobileSortCloseBtn.addEventListener('click', () => {
        mobileSortMenu.classList.remove('mobile-sort__menu--active');
      });

      mobileSortLink.forEach((link) => {
        link.addEventListener('click', () => {
          for (let i = 0; i < mobileSortLink.length; i++) {
            mobileSortLink[i].classList.remove('mobile-sort__link--active');
          };
          link.classList.add('mobile-sort__link--active');

          mobileSortCloseBtn.click();
          fireSortChange(link.dataset.sortBy, link.dataset.sortDirection, link);
        });
      });
    };
  };


  // const sectionHeaderIcons = document.querySelector('.section__header-icons'),
  // 	  sectionTitle = document.querySelector('.section__title');

  // sectionTitle.style.maxWidth = `calc(100% - ${sectionHeaderIcons.offsetWidth}px)`;


  let url = new URL(window.location.href);
  let sort_by = url.searchParams.get('sort_by') ?? 'standard';
  let sort_direction = url.searchParams.get('sort_direction') ?? 'DESC';
  document.querySelector(`.mobile-sort__menu .mobile-sort__link[data-sort-by="${sort_by}"][data-sort-direction="${sort_direction}"]`)?.classList.add('mobile-sort__link--active');
  document.querySelector(`.section__button--sort .sort__item[data-sort-by="${sort_by}"] .sort__btn`)?.classList.add('sort__btn--active');
  document.querySelector(`.section__button--sort .sort__item[data-sort-by="${sort_by}"] .order-direction__arrow-${sort_direction == 'ASC' ? 'top' : 'bottom'}`)?.classList.add('order-direction__arrow--active');

  if (actualSort && url.searchParams.has('sort_by')) actualSort = { sort_by, sort_direction, is_actual: true };
}

function manageSocialButtons() {
  if (document.querySelectorAll('.section__button--actions')) {
    document.querySelectorAll('.section__button--actions').forEach((buttons) => {
      const shareBtn = buttons.querySelector('.section__button-share'),
        hidingButtons = buttons.querySelectorAll('.section__button-hiding'),
        socialList = buttons.querySelector('.social-list');

      socialList.style.maxWidth = 0;

      shareBtn.addEventListener('click', () => {
        shareBtn.classList.toggle('section__button-share--active');
        socialList.classList.toggle('social-list--active');

        if (socialList.classList.contains('social-list--active')) {
          socialList.style.maxWidth = socialList.scrollWidth + 'px';
        } else {
          socialList.style.maxWidth = 0;
        };

        hidingButtons.forEach((hidingBtn) => {
          hidingBtn.classList.toggle('section__icon-button--off');
        });
      });

      document.querySelector('body').addEventListener('click', e => {
        if (!buttons.contains(e.target)) {
          shareBtn.classList.remove('section__button-share--active');
          socialList.classList.remove('social-list--active');

          socialList.style.maxWidth = 0;

          hidingButtons.forEach((hidingBtn) => {
            hidingBtn.classList.remove('section__icon-button--off');
          });
        };
      });
    });
  };
}

function manageRegion() {
  if (manageRegion.isInitted || !rec_locale.show) return;
  document.querySelector('.header__buttons').insertAdjacentHTML('afterend',
    `
		<div class="header__region region">
			<div class="region__btn-wrapper">
				<span class="svg-icon icon-planet region__icon header__region-icon"></span>
				<button class="region__btn">RU</button>
			</div>
			<ul class="region__list region__list-inline">
				<li class="region__item" data-cc="ru">RU</li>
				<li class="region__item" data-cc="ua">UA</li>
			</ul>
			<input type="text" class="region__input" value="">
		</div>
	`);

  manageRegionAppearence();

  let s = new URLSearchParams(location.search);
  let hint;
  let region = locale.url;//location.pathname.split('/')?.[1];//s.get('cc');
  let recRegion = rec_locale.country/*'ru'*/; //should be getting of reccomendation
  if (localStorage.getItem('choosed_region') !== null) recRegion = localStorage.getItem('choosed_region');

  if (region) {
    document.querySelector(`.region__item[data-cc="${region}"]`)?.click();
    if (region != recRegion) {
      document.querySelector(".header__region .region__btn-wrapper").classList.add('warning');

      hint = window.hint({
        hintId: 'region_notify',
        hintSide: 'bottom',
        ...window.defaultHintOptions,
        title: 'Проверьте регион!',
        text: 'Вы попали на страницу другого региона, используя специальную ссылку.',
        target: document.querySelector(".header__region.region .icon-planet"),
        button: {
          icon: { styles: ['btn-icon-new', 'btn-user-settings', 'static'] },
          type: 'div',
          text: 'Вернуться к региону ' + recRegion.toLocaleUpperCase(),
          onclick: (e, info) => {
            info.cancelButton.click();
            document.querySelector(`.region__item[data-cc="${recRegion}"]`)?.click();
            document.querySelector(".header__region .region__btn-wrapper").classList.remove('warning');
          }
        },
        // close: () => document.querySelector(".header__region .region__btn-wrapper").classList.remove('warning')
      });
    }
  }

  document.addEventListener('region_change', e => {
    hint?.doClose();
    document.querySelector(".header__region .region__btn-wrapper").classList.remove('warning');
    console.log('cc', e.detail.cc, e);
    localStorage.setItem('choosed_region', e.detail.cc);
    let path = location.pathname.split('/');
    if (path.length > 1) path[1] = e.detail.cc;
    else path.push(e.detail.cc);
    let url = new URL(location.href);
    url.pathname = path.join('/');
    // loadPage(url.href);
    location = url.href;
  });
  manageRegion.isInitted = true;
}


{
  //HINTS
  let clearing_without_close_handlers = false;
  let hints = {
    //'subscribe3': {hintSide: 'right', hintPosOnSide: 'top', elPos: 'start', title: 'Ждете снижения цены?', text: 'Воспользуйтесь нашей функцией оповещения о снижении минимальной цены!', button: {text: 'кнопка', onclick: ()=>console.log('тыць')}, nextHints: ['subscribe5']},
    'subscribe': { hintSide: 'right', hintPosOnSide: 'top', title: 'Ждете снижения цены?', text: 'Воспользуйтесь нашей функцией оповещения о снижении минимальной цены!' },
    'prices-chart': { hintSide: 'left', title: 'График изменения цены', text: 'На графике вы увидите историю изменения минимальной цены и сможете попробовать спрогнозировать ее в будущем :)', prevHints: ['subscribe', 'price-filter'] },
    'price-header': { options: { isImportant: true }, title: 'Цены в разных магазинах', text: 'В этом блоке вы можете видеть цены на данную игру в разных магазинах', nextHints: ['price-filter'] },
    'price-filter': { options: { isImportant: true }, hintSide: 'bottom', hintPosOnSide: 'left', title: 'Фильтр цен', text: 'Вы можете выбрать предпочитае\u00adмые системы оплаты (при выводе цены мы учитываем комиссии), вид товара (физический или цифровой) и  платформу.', prevHints: ['price-header'] },
    'sr': {
      options: { isImportant: true }, hintSide: 'right', title: 'Проверьте свой ПК', text: 'Не разбираетесь в технических характеристиках? Не беда. Мы сами сверим основные характеристики за вас. Для этого авторизуйтесь и заполните информацию о вашем ПК.', prevHints: ['price-header'],
      mask: (el, effectiveRule) => {
        if (!document.querySelector(".short-game-description-mobile")) return true;
        return !document.querySelector(".short-game-description-mobile").contains(el);
      },
      button: {
        icon: { styles: ['btn-icon-new', 'btn-user-settings', 'static'] },
        type: 'a',
        text: 'Настройки',
        styles: ['animated'],
        //onclick: ()=>{document.location.pathname = '/user/settings'},
        oninit: (el) => { el.href = '/user/settings' }
      }
    },
    'subscribe-error': {
      hintSide: 'right', title: 'Введите свой email', text: 'Пожалуйста, введите в настройках свой адрес элекстронной почты, чтобы иметь возможность следить за изменением минимальных цен на игры.',
      button: {
        icon: { styles: ['btn-icon-new', 'btn-user-settings', 'static'] },
        type: 'a',
        text: 'Настройки',
        styles: ['animated'],
        oninit: (el) => { el.href = '/user/settings' }
      }
    },
    //'comment': {title: 'Помните о правилах', text: 'Прежде чем публиковать свой комментарий, пожалуйста, ознакомьтесь с правилами.'},
  }

  let intervals = [];

  //(function() {
  {
    var throttle = function (type, name, obj) {
      obj = obj || window;
      var running = false;
      var func = function () {
        if (running) { return; }
        running = true;
        requestAnimationFrame(function () {
          obj.dispatchEvent(new CustomEvent(name));
          running = false;
        });
      };
      obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");
  }
  //)();
  function create(target, type, ...classesAndAttributes) {
    let el = document.createElement(type);
    classesAndAttributes.forEach((c) => {
      if (typeof c == 'string') el.classList.add(c);
      else Object.keys(c).forEach((k) => el.setAttribute(k, c[k]));
    });
    if (target) target.append(el);
    return el;
  }

  function getCoords(elem) {  // кроме IE8-
    var box = elem.getBoundingClientRect();

    return {
      top: box.y + scrollY,//pageYOffset,
      left: box.x + scrollX,//pageXOffset,
      bottom: box.y + box.height + scrollY,//pageYOffset /*+ elem.offsetHeight*/,
      right: box.x + box.width + scrollX,//pageXOffset/* + elem.offsetWidth*/,
      offsetWidth: elem.offsetWidth,
      offsetHeight: elem.offsetHeight,
      width: box.width,
      height: box.height
    };
  }

  function notSide(side) {
    if (side == 'left') return 'right';
    if (side == 'right') return 'left';
    if (side == 'top') return 'bottom';
    if (side == 'bottom') return 'top';
    return '';
  }

  function isHorSide(side) {
    return side == 'left' || side == 'right';
  }

  function checkTopCoord(coord, size) {
    let padding = 5
    if (coord - padding < 0) return - (coord - padding);
    let scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );

    if (coord + size + padding > scrollHeight) return scrollHeight - (coord + size + padding);
    return 0;
  }

  function checkLeftCoord(coord, size) {
    let padding = 5
    if (coord - padding < 0) return -(coord - padding);

    let scrollWidth = Math.max(
      document.body.scrollWidth, document.documentElement.scrollWidth,
      document.body.offsetWidth, document.documentElement.offsetWidth,
      document.body.clientWidth, document.documentElement.clientWidth
    );

    if (coord + size + padding > scrollWidth) return scrollWidth - (coord + size + padding);
    return 0;
  }

  function generateCoords(el, hint, hintSide, hintPosOnSide, elPos) {
    let leftShift = 8;
    let topShift = 8;

    let elLeftShift = -26;
    let elTopShift = -26;

    let coords = getCoords(el);

    let horCoords = (hintSide == 'left' || hintPosOnSide == 'left') ? 'right' : 'left';
    //if (hintPosOnSide == 'middle') horCoords = 'middle';
    let verCoords = (hintSide == 'top' || hintPosOnSide == 'top') ? 'bottom' : 'top';

    if (elPos == 'middle') {
      elLeftShift -= coords.width / 2;
      elTopShift -= coords.height / 2;
    }
    else if (elPos == 'end') {
      elLeftShift -= coords.width;
      elTopShift -= coords.height;
    }

    if (isHorSide(hintSide)) topShift += elTopShift;
    else leftShift += elLeftShift;

    if (hintPosOnSide.startsWith('middle')) {
      if (!isHorSide(hintSide)) {
        leftShift -= (-8 - 26 + hint.offsetWidth) / 2;
      }
      else topShift -= (-8 - 26 + hint.offsetHeight) / 2;
      //else
      console.log('middle topShift', topShift);
    }

    if (verCoords == 'top') topShift = -(topShift + hint.offsetHeight);
    if (horCoords == 'left') leftShift = -(leftShift + hint.offsetWidth);
    //if (hintPosOnSide == 'middle' || hintPosOnSide == 'middle_none')  leftShift = -(leftShift - hint.offsetWidth / 2) ;

    let left = coords[horCoords] + leftShift;
    let top = coords[verCoords] + topShift;
    let right = left + hint.offsetWidth;
    let bottom = top + hint.offsetHeight;
    //shoud be
    //middle topShift -124
    //middle 30 392.078125 230 550.078125 left middle_ver middle 426.078125
    //
    //is
    //middle topShift -124
    //middle 30 405.640625 230 563.640625 left middle_ver middle 439.640625
    //dif 13.5625
    if (hintPosOnSide.startsWith('middle')) console.log('middle', left, top, right, bottom, hintSide, hintPosOnSide, elPos, coords[verCoords], verCoords, horCoords)
    return { left, top, right, bottom, hintSide, hintPosOnSide, elPos };
  }

  function handleCoords(el, hint, hintSide, hintPosOnSide, elPos, options = {}) {
    let coords = generateCoords(el, hint, hintSide, hintPosOnSide, elPos);
    let leftShift = checkLeftCoord(coords.left, hint.offsetWidth);
    if (leftShift) {
      if (isHorSide(hintSide)) {
        coords = generateCoords(el, hint, notSide(hintSide), hintPosOnSide, elPos);
        leftShift = 0;
      }
      else {
        coords.left += leftShift;
        coords.right += leftShift;
      }
      if (checkLeftCoord(coords.left, hint.offsetWidth)) return null;
    }

    let topShift = checkTopCoord(coords.top, hint.offsetHeight);
    if (topShift) {
      if (!isHorSide(hintSide)) {
        coords = generateCoords(el, hint, notSide(hintSide), hintPosOnSide, elPos);
        topShift = 0;
      }
      else {
        coords.top += topShift;
        coords.bottom += topShift;
      }
      if (checkTopCoord(coords.top, hint.offsetHeight)) return null;
    }
    coords.topShift = topShift;
    coords.leftShift = leftShift;
    return coords;
  }

  function isHided(el) {
    if (el.style.display == 'none') return true;
    if (el.parentElement) return isHided(el.parentElement);
    return false;
  }

  function setAppearence(hintWrapper, el, hint, hintSide, hintPosOnSide, elPos) {
    let coords = handleCoords(el, hint, hintSide, hintPosOnSide, elPos)
    if (!coords) {
      hintWrapper.style.display = 'none';
      return;
    }

    hintWrapper.style.left = coords.left + 'px';
    hintWrapper.style.top = coords.top + 'px';

    function setTriangleStyle(style, value, units = 'px') {
      //console.log('setTriangleStyle', hint, style, value, units = 'px');
      if (notSide(style)) hint.querySelector('.down').style[notSide(style)] = '';
      if (notSide(style)) hint.querySelector('.up').style[notSide(style)] = '';
      hint.querySelector('.down').style[style] = value + units;
      hint.querySelector('.up').style[style] = value + units;
    }

    if (coords.hintSide == 'left') setTriangleStyle('left', -4 - coords.leftShift);
    else if (coords.hintSide == 'right') setTriangleStyle('right', -4 + coords.leftShift);
    else if (coords.hintSide == 'top') setTriangleStyle('top', -4 - coords.topShift);
    else if (coords.hintSide == 'bottom') setTriangleStyle('bottom', -4 + coords.topShift);

    if (coords.hintPosOnSide == 'left') setTriangleStyle('left', 14 - coords.leftShift);
    else if (coords.hintPosOnSide == 'right') setTriangleStyle('right', 14 + coords.leftShift);
    else if (coords.hintPosOnSide == 'top') setTriangleStyle('top', 14 - coords.topShift);
    else if (coords.hintPosOnSide == 'bottom') setTriangleStyle('bottom', 14 + coords.topShift);
    else if (coords.hintPosOnSide == 'none' || coords.hintPosOnSide == 'middle_none') setTriangleStyle('display', 'none', '');
    else if (coords.hintPosOnSide == 'middle_hor') setTriangleStyle('left', /*14 - coords.leftShift +*/(hint.offsetWidth) / 2 - 4);
    else if (coords.hintPosOnSide == 'middle_ver') setTriangleStyle('top', /*14 - coords.leftShift +*/(hint.offsetHeight) / 2 - 4);

    if (isHided(el)) hintWrapper.style.display = 'none';
  }

  function generateHint(el, title, text, hintSide = 'left', hintPosOnSide = 'top', elPos = 'middle', close = null, button = null, options = {}) {
    let hintWrapper = create(document.body, 'div', 'hint-hg-wrapper');
    let hint = create(hintWrapper, 'div', 'hint-hg-block', 'block');
    if (options && options.isImportant) hint.classList.add('hint-important');

    let cancelButton = create(hint, 'span', 'btn-icon-new', 'btn-cancel');
    let doClose = () => {
      hintWrapper.remove();
      if (typeof close === 'function') close(hintWrapper, el, title, text, hintSide, hintPosOnSide, elPos);
    };
    cancelButton.addEventListener('click', doClose);
    create(hint, 'p', 'title').append(title);
    create(hint, 'p', 'text').append(text);
    create(hint, 'div', 'down');
    create(hint, 'div', 'up');

    if (button) {
      button.styles = button.styles ?? [];
      button.type = button.type ?? 'div';
      let buttonEl = create(hint, button.type, 'button', ...button.styles);
      if (button.icon) {
        button.icon.styles = button.icon.styles ?? [];
        create(buttonEl, 'span', ...button.icon.styles);
      }
      buttonEl.append(button.text);
      if (typeof button.onclick === 'function') buttonEl.addEventListener('click', e => button.onclick(e, { buttonEl, hintWrapper, close, button, options, cancelButton }));
      if (typeof button.oninit === 'function') {
        button.oninit(buttonEl, button);
      }
    }

    setAppearence(hintWrapper, el, hint, hintSide, hintPosOnSide, elPos);
    let onOptimizedResize = () => setAppearence(hintWrapper, el, hint, hintSide, hintPosOnSide, elPos);

    let initElCoords = getCoords(el);
    let onTimerShiftCheck = () => {
      let elCoords = getCoords(el);
      for (let key in initElCoords)
        if (initElCoords[key] != elCoords[key]) onOptimizedResize();
    }
    return { hintWrapper, onOptimizedResize, onTimerShiftCheck, doClose };
    //window.addEventListener("optimizedResize", ()=>setAppearence(hintWrapper, el, hint, hintSide, hintPosOnSide, elPos));
  }

  let storage = window.parent.localStorage;
  let hint_key = 'hint';
  let data = JSON.parse(storage.getItem(hint_key));
  if (!data) {
    data = {};
  }
  let dataNotRemember = {};

  let createdHints = {};

  function hint(p, options = {}) {
    console.log('hint', p)
    let el;
    let hintId;
    let rule;
    if (typeof p === "string") {
      hintId = p;
      el = document.querySelector(`[data-hint="${hintId}"]`);
      rule = hints[hintId];
    }
    else if (p instanceof Element) {
      el = p;
      hintId = el.dataset.hint;
      rule = hints[hintId];
    }
    else if (p instanceof Object) {
      rule = p;
      hintId = rule.hintId;
      if (!hints[hintId]) hints[hintId] = rule;
      else if (hints[hintId].interval) {
        rule.interval = hints[hintId].interval;
      }
      // else {
      // 	rule = hints[hintId];
      // 	rule.target = p.target;
      // }
    }
    else return;

    if (!el) {
      if (typeof rule.target === "string") {
        el = document.querySelector(rule.target);
      }
      else if (rule.target instanceof Element) {
        el = rule.target;
      }
    }

    //console.log('hint', hintId, el);

    //let rule = hints[hintId];
    //console.log('rule', rule);
    if (!el || !hintId || !rule || createdHints[hintId] || !rule.repeatable && (data[hintId] || dataNotRemember[hintId])) return;

    if (rule.prevHints) {
      if (rule.isNotRemember) {
        for (let prevHintId of rule.prevHints) {
          if (!dataNotRemember[prevHintId]) return;
        }
      }
      else {
        for (let prevHintId of rule.prevHints) {
          if (!data[prevHintId]) return;
        }
      }
    }



    let effectiveRule = {};
    for (let key in rule) {
      effectiveRule[key] = el.dataset['hint' + key] ? el.dataset['hint' + key] : rule[key];
    }
    effectiveRule.hintSide = effectiveRule.hintSide ?? 'left';
    effectiveRule.hintPosOnSide = effectiveRule.hintPosOnSide ?? 'top';
    effectiveRule.elPos = effectiveRule.elPos ?? 'middle';
    effectiveRule.options = effectiveRule.options ?? {};


    function onTimeout() {
      if (!effectiveRule.interval?.is?.() && !effectiveRule.interval.finished) hint(p);
      else if (effectiveRule.interval?.is?.() && !effectiveRule.interval.finished) {
        timeout = setTimeout(onTimeout, effectiveRule.interval.time ?? 10000);
        intervals.push(timeout);
      }
    }
    let timeout;

    if (effectiveRule.interval?.deferred) {
      hints[hintId].interval.deferred = false;
      if (p instanceof Object) p.interval.deferred = false;
      timeout = setTimeout(onTimeout, effectiveRule.interval.time ?? 10000);
      intervals.push(timeout);
      return;
    }


    let listener = null;
    let isFired = false;
    let m;
    let t;
    let k;
    if (effectiveRule.closeOnClick) {
      listener = (type) => (e) => {
        if (isFired) return;
        if (e.target == createdHints[hintId]?.hintWrapper || createdHints[hintId]?.hintWrapper.contains(e.target)) return;
        isFired = true;

        console.log('click', type, e);
        document.removeEventListener('mousedown', m, { capture: true });
        document.removeEventListener('touchstart', t, { capture: true });
        document.removeEventListener('keypress', k, { capture: true });
        createdHints[hintId]?.doClose?.();//.hintWrapper.querySelector('span.btn-icon-new.btn-cancel').click();
        //close(createdHints[hintId].hintWrapper, el, effectiveRule.title, effectiveRule.text, effectiveRule.hintSide, effectiveRule.hintPosOnSide, effectiveRule.elPos);
      };
      let now = Date.now();
      m = listener('mousedown_' + now);
      t = listener('touchstart_' + now);
      k = listener('keypress_' + now);

      document.addEventListener('mousedown', m, { capture: true });
      document.addEventListener('touchstart', t, { capture: true });
      document.addEventListener('keypress', k, { capture: true });
    }

    let close = (hintWrapper, el, title, text, hintSide, hintPosOnSide, elPos) => {
      console.log('close call', arguments);
      document.querySelector('.hint-bubble')?.remove();
      if (!effectiveRule.isNotRemember) {
        data[hintId] = true;
        storage.setItem(hint_key, JSON.stringify(data));
      }
      else dataNotRemember[hintId] = true;

      if (rule.nextHints && !clearing_without_close_handlers && (!effectiveRule.interval || effectiveRule.interval?.is?.() || effectiveRule.interval.finished)) {
        for (let nextHintId of rule.nextHints) {
          //console.log('nextHints', nextHintId);
          hint(nextHintId);
        }
      }

      if (listener) {
        document.removeEventListener('mousedown', m, { capture: true });
        document.removeEventListener('touchstart', t, { capture: true });
      }
      if (typeof effectiveRule.close === 'function' && !clearing_without_close_handlers) effectiveRule.close(hintWrapper, el, title, text, hintSide, hintPosOnSide, elPos);
      delete createdHints[hintId];

      if (effectiveRule.interval) {
        timeout = setTimeout(onTimeout, effectiveRule.interval.time ?? 10000);
        intervals.push(timeout);
      }
    };


    if (typeof effectiveRule.mask === 'function') {
      if (!effectiveRule.mask(el, effectiveRule)) return;
    }

    if (!rule.bubbleOptions?.noDarkening) {
      document.querySelector('.hint-bubble')?.remove();
      let divHint = create(document.getElementById('quiz'), 'div', 'hint-bubble');
      let targetInfo = (rule.bubbleTarget ? rule.bubbleTarget : rule.target).getBoundingClientRect();
      let width = targetInfo.width;
      let height = targetInfo.height;
      let widthChange = width / 4;
      let heightChange = height / 4;
      widthChange = Math.max(widthChange, heightChange);
      heightChange = widthChange;
      console.log(targetInfo, widthChange, heightChange)

      divHint.style.width = rule.bubbleOptions?.width ?? (width + widthChange + 'px');
      divHint.style.height = rule.bubbleOptions?.height ?? (height + heightChange + 'px');

      widthChange = divHint.getBoundingClientRect().width - width;
      heightChange = divHint.getBoundingClientRect().height - height;

      divHint.style.left = window.scrollX + targetInfo.left - (widthChange / 2) + 'px';
      divHint.style.top = window.scrollY + targetInfo.top - (heightChange / 2) + 'px';

      if (rule.bubbleOptions?.centeringTop) {
        divHint.style.top = window.scrollY + targetInfo.top - (heightChange / 2) - (height / 2) + 'px';
      }
    }

    createdHints[hintId] = { rule: effectiveRule, ...generateHint(el, effectiveRule.title, effectiveRule.text, effectiveRule.hintSide, effectiveRule.hintPosOnSide, effectiveRule.elPos, close, effectiveRule.button, effectiveRule.options) };

    if (effectiveRule.interval) {
      document.addEventListener('intervaledHintFinish', function handler(e) {
        if (e.detail?.hintId != hintId) return;
        effectiveRule.interval.finished = true;
        createdHints[hintId]?.hintWrapper?.remove();
        clearTimeout(timeout);
        for (let i = 0; i < intervals.length; i++) {
          if (timeout == intervals[i]) {
            intervals.splice(i, 1);
            break;
          }
        }
        document.removeEventListener('intervaledHintFinish', handler);
      });
    }

    return createdHints[hintId];
  }

  let hintedElements = document.querySelectorAll('[data-hint]');
  //if (hintedElements.length) {
  for (hintedElement of hintedElements) {
    hint(hintedElement);
  }
  window.addEventListener("optimizedResize", () => {
    for (let hintId in createdHints) createdHints[hintId].onOptimizedResize();
  });
  let timerId = setInterval(() => {
    //if (!createdHints.length) return clearInterval(timerId);
    for (let hintId in createdHints) createdHints[hintId].onTimerShiftCheck();
  }, 1000);
  //}

  window.hint = (info) => {
    if (info.target.dataset) info.target.dataset.hint = info.hintId;

    return hint(info);
  };

  window.removeAllHints = (is_without_handlers) => {
    for (let i in intervals) {
      if (intervals[i]) clearInterval(intervals[i]);
    }
    intervals = [];
    clearing_without_close_handlers = is_without_handlers;
    Object.values(createdHints).forEach((e) => {
      e.doClose();
    });
    clearing_without_close_handlers = false;
  };
  document.addEventListener('intervaledHintFinish', function handler(e) {
    if (hints[e.detail?.hintId]) hints[e.detail?.hintId].interval.finished = true;
  });
  window.defaultHintOptions = {
    hintPosOnSide: 'right',
    isNotRemember: true,
    //closeOnClick: true,
  };

  window.defaultHintButtonOptions = {
    icon: { styles: ['btn-icon-new', 'btn-user-settings', 'static'] },
    type: 'div',
    text: 'Дальше',
    onclick: (e, info) => info.cancelButton.click()
  };

}
//HINTS END

//PRODUCTS SHOP SHOW MORE START
function manageShopShowMore() {
  const productShop = document.querySelectorAll('.product-shop');
  window.addEventListener('resize', () => {
    correctShopElementsPositions();
    setTimeout(() => {
      correctShopElementsPositions();
    }, 300);
  });
  window.addEventListener('load', correctShopElementsPositions);

  function correctShopElementsPositions() {
    productShop.forEach(shop => {
      correctPositions(shop);
    });
  }

  function correctPositions(shop) {
    const info = shop.querySelector('.product-shop__info');
    const buttonWrapper = shop.querySelector('.product-shop__show-more-wrapper');
    const button = shop.querySelector('.product-shop__show-more');
    const line = shop.querySelector('.product-shop__dashed-line');
    if (!button && !line) return;

    const buttonHeight = button.getBoundingClientRect().height;
    button.style.left = `${info.offsetLeft}px`;
    buttonWrapper.style.height = `${buttonHeight}px`;

    const shopsWrappers = document.querySelectorAll('.shops-wrapper');
    shopsWrappers.forEach(shopWrapper => {
      const list = shopWrapper.querySelector('.shops-wrapper__list');
      const listHeight = list.getBoundingClientRect().height;
      const isOpened = shopWrapper.classList.contains('shops-wrapper--opened');

      if (isOpened) {
        shopWrapper.style.height = `${listHeight}px`;
      }
    });
  }

  hideSimilarShops();

  function hideSimilarShops() {
    const shops = [];
    productShop.forEach(shop => {
      shops.push(shop.dataset.shop);
    });

    const uniqueShops = Array.from(new Set(shops));
    uniqueShops.forEach(shopName => {
      const sameShops = document.querySelectorAll(`.product-shop[data-shop="${shopName}"]`);

      if (sameShops.length < 2) return;
      const visibleShop = sameShops[0];
      visibleShop.classList.add('product-shop--visible')
      const shopsWrapperArray = createShopsWrapper(visibleShop);
      const wrapperForHiddenShops = shopsWrapperArray[0];
      const listForHiddenShops = shopsWrapperArray[1];
      const button = createShowMoreButton(visibleShop);

      const allPrices = [];
      let sign;

      sameShops.forEach((shop, index) => {
        let price = shop.querySelector('.price__value').textContent.trim();
        sign = price.slice(-1).trim();
        price = price.slice(0, price.length - 1).trim();
        price = Number(price);

        if (index !== 0) {
          shop.remove();
          listForHiddenShops.append(shop);
          allPrices.push(price);
        }
      });

      let minPrice = Math.min(...allPrices);
      let maxPrice = Math.max(...allPrices);

      let buttonHTML = '';
      let priceText = '';

      addTextToButton();
      correctPositions(visibleShop);

      button.addEventListener('click', () => {
        const wrapperHeight = toggleHiddenShops(wrapperForHiddenShops, listForHiddenShops);
        if (wrapperHeight === 0) {
          button.innerHTML = 'Свернуть цены в этом магазине';
          visibleShop.classList.add('product-shop--opened');
        } else {
          addTextToButton();
          visibleShop.classList.remove('product-shop--opened');
        }

        correctPositions(visibleShop);
      });

      function addTextToButton() {
        if (sameShops.length - 1 >= 2 && sameShops.length - 1 < 5) {
          priceText = 'другие цены';
        } else {
          priceText = 'других цен';
        }

        if (sameShops.length - 1 === 1) {
          buttonHTML = `Ещё <span>1</span> цена в этом магазине: <span>${minPrice.toFixed(2)}&nbsp;${sign}</span>`;
        } else if (minPrice === maxPrice) {
          buttonHTML = `Ещё <span>${sameShops.length - 1}</span> ${priceText} в этом магазине от <span>${minPrice.toFixed(2)}&nbsp;${sign}</span>`;
        } else {
          buttonHTML = `Ещё <span>${sameShops.length - 1}</span> ${priceText} в этом магазине от <span>${minPrice.toFixed(2)}&nbsp;${sign}</span> до <span>${maxPrice.toFixed(2)}&nbsp;${sign}</span>`;
        }

        button.innerHTML = buttonHTML;
      }
    });
  }

  function createShowMoreButton(parent) {
    const wrapper = document.createElement('div');
    wrapper.className = 'product-shop__show-more-wrapper';

    const button = document.createElement('button');
    button.className = 'product-shop__show-more';
    button.setAttribute('type', 'button');
    wrapper.append(button);

    const line = document.createElement('span');
    line.className = 'product-shop__dashed-line';
    wrapper.append(line);

    parent.append(wrapper);

    return button;
  }

  function createShopsWrapper(parent) {
    const wrapper = document.createElement('div');
    wrapper.className = 'shops-wrapper';

    const list = document.createElement('div');
    list.className = 'shops-wrapper__list';

    wrapper.append(list);
    parent.insertAdjacentElement('afterend', wrapper);
    return [wrapper, list];
  }

  function toggleHiddenShops(wrapper, list) {
    const listHeight = list.getBoundingClientRect().height;
    const wrapperHeight = wrapper.getBoundingClientRect().height;
    const isOpened = wrapper.classList.contains('shops-wrapper--opened');

    if (isOpened) {
      wrapper.style.height = 0;
      wrapper.classList.remove('shops-wrapper--opened');
    } else {
      wrapper.style.height = `${listHeight}px`;
      wrapper.classList.add('shops-wrapper--opened');
    }

    return wrapperHeight;
  }
}
//PRODUCTS SHOP SHOW MORE END

function manageBeta() {
  if ((new URLSearchParams(location.search)).has('beta')) {
    /*if (!manageBeta.testRegion) {
      manageRegion();
      manageBeta.testRegion = true;
    }*/
  }
}
