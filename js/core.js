
window.addEventListener('DOMContentLoaded', function (e) {

    /**
     * 支持的 SVG 元素类型
     */
    var SvgType = {
        CIRCLE: 'circle',

        isSupport: function (type) {
            var self = this;
            return typeof type === 'string' && Object.keys(this).some(function (name) {
                return self[name] === type;
            });
        }
    };

    var SvgBase = (function () {
        function SvgBase() {
            this.createTime = Date.now();
        }

        SvgBase.prototype.createElement = function (tagName) {
            return document.createElementNS('http://www.w3.org/2000/svg', tagName);
        }

        SvgBase.prototype.getElement = function () {
            throw new Error('unimplemented');
        }

        SvgBase.prototype.toString = function () {
            return '[SvgBase Object]';
        }

        SvgBase.prototype.getSupportAttrs = function () {
            return {
                'stroke': '#000',
                'stroke-width': 10
            };
        }

        SvgBase.prototype.updateAttr = function (key, value) {
            utils.setAttrs(this.getElement(), {
                key: value
            });
        }

        /**
         * 属性变化时被调用
         */
        SvgBase.prototype.onAttrChanged = function (data) {
            var attrs = { };
            attrs[data.key] = data.value;
            utils.setAttrs(this.getElement(), attrs);
        }

        return SvgBase;
    })();

    var SvgCircle = (function (Parent) {
        /* shared private field and function */

        /* constructor */
        function SvgCircle(options) {
            this.options = options || {
                cx: 50,
                cy: 50,
                r: 50,
                'stroke': 'red',
                'stroke-width': '10'
            };

            Parent.call(this);

            this.el = this.createElement('circle');
            utils.setAttrs(this.el, this.options);
            this.el.dataWrapper = this;         // 保存当前实例到元素中
        }

        SvgCircle.prototype = new Parent();
        SvgCircle.prototype.constructor = SvgCircle;

        SvgCircle.prototype.getElement = function () {
            return this.el;
        }
        SvgCircle.prototype.getSupportAttrs = function () {
            var el = this.el;
            var supportAttrs = Parent.prototype.getSupportAttrs.call(this);
            utils.setAttrs(supportAttrs, {
                cx: el.getAttribute('cx'),
                cy: el.getAttribute('cy'),
                r : el.getAttribute('r')
            });
            return supportAttrs;
        }

        SvgCircle.prototype.toString = function () {
            var el = this.el;
            return 'SvgCircle[' + Object.keys(this.options).map(function (key) {
                return key + ": " + el.getAttribute(key);
            }).join(', ') + ']';
        }

        return SvgCircle;
    })(SvgBase);

    var attrsEditor = (function () {
        var tableDiv = document.querySelector('.table'),
            itemChangeListeners = []
        ;

        return {

            addItem: addItem,
            addItems: addItems,
            removeItem: removeItem,
            addItemChangeListener: addItemChangeListener,
            removeItemChangeListener: removeItemChangeListener,
            clear: clear
        }

        /**
         * 添加属性变化监听者（必须实现了 EventTarget 接口），
         * 每当属性编辑器中属性发生变化时，会向这些监听者发送 'attr-change' 事件，事件包含了新的属性值
         * 
         * 事件的 detail 数据结构如下：
         * event.detail = { key: string, value: string}
         */
        function addItemChangeListener (listener) {
            if (!listener instanceof EventTarget) { return; }

            var exist = itemChangeListeners.some(function (item) {
                return item === listener;
            });

            if (!exist) {
                itemChangeListeners.push(listener);
            }
        }

        function removeItemChangeListener (listener) {
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

        function clear () {
            var proto = tableDiv.firstElementChild;
            tableDiv.innerHTML = '';
            tableDiv.appendChild(proto);
        }

        function addItems (attrs) {
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
            var rowDiv = tableDiv.firstElementChild.cloneNode(true),
                labelText = rowDiv.firstElementChild.firstChild,
                valueInput = rowDiv.lastElementChild.firstElementChild
                ;
            labelText.data = key;
            valueInput.value = value;
            valueInput.addEventListener('change', function (e) {
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

        function addElement(type) {
            var svgObj = null;
            switch (type) {
                case SvgType.CIRCLE:
                    svgObj = new SvgCircle();
                    break;
                default:
                    break;
            }
            if (svgObj) {
                self.appendChild(svgObj.getElement());
            }
        }


        function clearActivedSvgBase () {
            activedSvgBase.forEach(function (svgBase) {
                attrsEditor.removeItemChangeListener(svgBase);
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
                var supportAttrs = svgBase.getSupportAttrs();
                attrsEditor.clear();
                attrsEditor.addItems(supportAttrs);
                attrsEditor.addItemChangeListener(svgBase);
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
                    var cx = svgObj.getElement().getAttribute('cx'),
                        cy = svgObj.getElement().getAttribute('cy'),
                        r = svgObj.getElement().getAttribute('r');
                    self.style.left = (cx - r) + 'px';
                    self.style.top = (cy - r) + 'px';
                    self.style.height = self.style.width = (2 * r) + 'px';
                    break
            }
        }
    })('mask-layer');

    // 添加测试元素
    window.svgRoot.addElement('circle');
    window.svgRoot.addElement('circle');
});