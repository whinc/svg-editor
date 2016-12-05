window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
// window.addEventListener('beforeunload', onBeforeLoad);

function onDOMContentLoaded () {
    var centerDiv = document.querySelector('div.center'),
        svgMain = centerDiv.querySelector('#svg-main')
        rightDiv = document.querySelector('div.right'),
        tableDiv = rightDiv.querySelector('.table')
        ;

    var attrsEditor, svgEditor, shapeSelector, activeLayer; 

    attrsEditor = (function (tableDiv) {
        var itemChangeListeners = [],
            // 当前绑定的 SvgBase 对象
            _svgBase = null
            ;

        /* 将属性编辑与 SVG 元素双向绑定 */
        function bind(svgBase) {
            if (_svgBase) {
                unbind(_svgBase);
            }
            addItems(svgBase.getSupportAttrs());
            addItemChangeListener(svgBase);

            _svgBase = svgBase;
        }

        function unbind(svgBase) {
            clear();
            removeItemChangeListener(svgBase);
        }

        /**
         * 添加属性变化监听者（必须实现了 EventTarget 接口），
         * 每当属性编辑器中属性发生变化时，会向这些监听者发送 'attr-change' 事件，事件包含了新的属性值
         * 
         * 事件的 detail 数据结构如下：
         * event.detail = { key: string, value: string}
         */
        function addItemChangeListener(listener) {
            if (!listener instanceof EventTarget) { return; }

            var exist = itemChangeListeners.some(function (item) {
                return item === listener;
            });

            if (!exist) {
                itemChangeListeners.push(listener);
            }
        }

        function removeItemChangeListener(listener) {
            var foundIndex = -1;
            for (var i = 0; i < itemChangeListeners.length; ++i) {
                if (itemChangeListeners[i] === listener) {
                    foundIndex = i;
                    break;
                }
            }
            if (foundIndex !== -1) {
                itemChangeListeners.splice(foundIndex, 1);
            }
        }

        function clear() {
            tableDiv.innerHTML = '';
        }

        function addItems(attrs) {
            Object.keys(attrs).forEach(function (key) {
                addItem(key, attrs[key]);
            });
        }


        function removeItem(key) {
            var rowDivList = tableDiv.children;
            for (var i = 0; i < rowDivList.length; ++i) {
                var rowDiv = rowDivList.item(i);
                var _key = rowDiv.firstElementChild.firstChild.data;
                if (_key === key) {
                    tableDiv.removeChild(rowDiv);
                    break;
                }
            }
        }

        function addItem(key, value) {
            var rowDiv = document.createElement('div');
            rowDiv.classList.add('table-row');
            rowDiv.innerHTML = '<div class="table-cell"></div>'
                + '<div class="table-cell">'
                + '<input type="text"/>'
                + '</div>';

            rowDiv.firstElementChild.textContent = key;
            rowDiv.lastElementChild.firstElementChild.value = value;

            rowDiv.lastElementChild.firstElementChild.addEventListener('change', function (e) {
                // input 标签内容变化时通知所有监听者
                itemChangeListeners.forEach(function (listener) {
                    if (typeof listener.onAttrChanged === 'function') {
                        listener.onAttrChanged({
                            key: key,
                            value: e.target.value
                        });
                    }
                });
            });
            tableDiv.appendChild(rowDiv);
            return rowDiv;
        }

        return {
            bind: bind,
            unbind: unbind,
        }

    })(tableDiv);

    // 形状选择器
    shapeSelector = (function () {
        var circleDiv = document.querySelector('#shape-circle');

        // 注册拖拽事件
        circleDiv.addEventListener('dragstart', onDragStart);
        circleDiv.addEventListener('dragend', onDragEnd);

        // 拖拽图形时，拖拽点与正方形中心点的 X 和 Y 轴偏移量
        var offsetX = 0,
            offsetY = 0;
        function onDragStart(e) {
            var rect = e.target.getBoundingClientRect();
            offsetX = e.clientX - (rect.right + rect.left) / 2;
            offsetY = e.clientY - (rect.bottom + rect.top) / 2;
        }

        function onDragEnd(e) {
            var svgRect = svgMain.getBoundingClientRect();

            if (e.clientX >= svgRect.left && e.clientX <= svgRect.right
                && e.clientY >= svgRect.top && e.clientY <= svgRect.bottom) {

                var attrs = {};
                var svgShape = e.target.querySelector('svg').firstElementChild;
                // 拷贝属性
                for (var i = 0; i < svgShape.attributes.length; ++i) {
                    var attr = svgShape.attributes[i];
                    attrs[attr.name] = attr.value;
                }
                // 覆盖位置相关属性，使其位于恰当的位置上（根据shape类型）
                if (svgShape.tagName === SvgType.CIRCLE) {
                    utils.setAttrs(attrs, {
                        cx: e.clientX - svgRect.left - offsetX,
                        cy: e.clientY - svgRect.top - offsetY,
                        r: 50
                    });
                }
                svgEditor.addElement(svgShape.tagName, attrs);
            }
        }
    })();

    svgEditor = (function (svgMain, attrsEditor) {
        var self = svgMain,
            svgBaseects = [],
            activedSvgBase = [],
            mousePressed = false;

        self.addEventListener('mousedown', onMouseDown);
        self.addEventListener('mousemove', onMouseMove);
        self.addEventListener('mouseup', onMouseUp);

        return {
            addElement: addElement,
        };

        function addElement(type, options) {
            var svgBase = null;
            switch (type) {
                case SvgType.CIRCLE:
                    svgBase = new SvgCircle(options);
                    break;
                default:
                    break;
            }
            if (svgBase) {
                self.appendChild(svgBase.getElement());
            }
        }


        function clearActivedSvgBase() {
            activedSvgBase.forEach(function (svgBase) {
                attrsEditor.unbind(svgBase);
            });
            activedSvgBase.length = 0;
        }

        function onMouseDown(event) {
            console.log(event.type);
            mousePressed = true;

            clearActivedSvgBase();
            var svgBase = event.target.svgBase;
            if (svgBase) {
                activedSvgBase.push(svgBase);
                attrsEditor.bind(svgBase);
            }
            activeLayer.follow(event.target.svgBase);
        }

        function onMouseMove(event) {
            console.log(event.type);
            var mouseLeftBtnPressed = (event.buttons & 0x1 === 1);
            if (mousePressed && mouseLeftBtnPressed) {
                activeLayer.follow(event.target.svgBase);

                activedSvgBase.forEach(function (svgBase) {
                    var el = svgBase.getElement();
                    switch (el.nodeName) {
                        case SvgType.CIRCLE:
                            utils.setAttrs(el, {
                                cx: parseFloat(el.getAttribute('cx')) + event.movementX,
                                cy: parseFloat(el.getAttribute('cy')) + event.movementY
                            })
                            break;
                    }
                });
            }
        }

        function onMouseUp(event) {
            console.log(event.type);

            mousePressed = false;
            activeLayer.follow(event.target.svgBase);
        }
    })(svgMain, attrsEditor);

    // 元素激活层
    activeLayer = (function () {
        var layer = document.createElement('div');
        layer.classList.add('active-layer');
        centerDiv.appendChild(layer);

        return {
            follow: follow
        };

        /*
         * 跟随目标
         * @param {SvgBase|SVGElement} target - 目标对象
         */
        function follow(target) {
            var svgBase = null;
            if (target instanceof SvgBase) {
                svgBase = target;
            } else if (target instanceof SVGElement) {
                svgBase = target.svgBase;
            }

            if (!svgBase) return;

            switch (true) {
                case svgBase instanceof SvgCircle:
                    var rect = utils.getBoundingClientRect(svgBase.getElement());
                    layer.style.left = rect.left + 'px';
                    layer.style.top = rect.top + 'px';
                    layer.style.width = rect.width + 'px';
                    layer.style.height = rect.height + 'px';
                    break
            }
        }
    })();
}