

window.addEventListener('DOMContentLoaded', function (e) {
    var svgMain = document.querySelector('#svg-main');

    var attrsEditor = (function () {
        var tableDiv = document.querySelector('.table'),
            itemChangeListeners = [],
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

    })();

    // 形状选择器
    var shapeSelector = (function () {
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
                window.svgRoot.addElement('circle', {
                    cx: e.clientX - svgRect.left - offsetX,
                    cy: e.clientY - svgRect.top - offsetY,
                    r: 50
                });

            }
        }
    })();

    // SVG 根对象， 提供操作 SVG 的接口
    window.svgRoot = (function (id, attrsEditor) {
        var self = document.querySelector('#' + id),
            svgObjects = [],
            activedSvgBase = [],
            mousePressed = false;

        self.addEventListener('mousedown', onMouseDown);
        self.addEventListener('mousemove', onMouseMove);
        self.addEventListener('mouseup', onMouseUp);

        return {
            addElement: addElement
        };

        function addElement(type, options) {
            var svgObj = null;
            switch (type) {
                case SvgType.CIRCLE:
                    svgObj = new SvgCircle(options);
                    break;
                default:
                    break;
            }
            if (svgObj) {
                self.appendChild(svgObj.getElement());
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
            var svgBase = event.target.dataWrapper;
            if (svgBase) {
                activedSvgBase.push(svgBase);
                attrsEditor.bind(svgBase);
            }
            window.maskLayer.cover(event.target.dataWrapper);
        }

        function onMouseMove(event) {
            console.log(event.type);
            var mouseLeftBtnPressed = (event.buttons & 0x1 === 1);
            if (mousePressed && mouseLeftBtnPressed) {
                window.maskLayer.cover(event.target.dataWrapper);

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
            window.maskLayer.cover(event.target.dataWrapper);
        }
    })('svg-main', attrsEditor);

    window.maskLayer = (function (id) {
        var self = document.querySelector('#' + id);

        return {
            cover: cover
        };

        function cover(svgObj) {
            if (!svgObj) { return; }

            switch (true) {
                case svgObj instanceof SvgCircle:
                    var rect = utils.getBoundingClientRect(svgObj.getElement());
                    self.style.left = rect.left + 'px';
                    self.style.top = rect.top + 'px';
                    self.style.width = rect.width + 'px';
                    self.style.height = rect.height + 'px';
                    break
            }
        }
    })('mask-layer');

    // 添加测试元素
    // window.svgRoot.addElement('circle');
    // window.svgRoot.addElement('circle');
});
