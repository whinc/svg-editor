
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

        return SvgBase;
    })();

    var SvgCircle = (function (Parent) {
        /* private */
        var _el = null,
            _options = null;

        /* constructor */
        function SvgCircle(options) {
            _options = options || {
                cx: 50,
                cy: 50,
                r: 50,
                'stroke': 'red',
                'stroke-width': '10'
            };

            Parent.call(this);

            _el = this.createElement('circle');
            _el.dataWrapper = this;         // 保存当前实例到元素中
            utils.setAttrs(_el, _options);
        }

        SvgCircle.prototype = new Parent();
        SvgCircle.prototype.constructor = SvgCircle;

        SvgCircle.prototype.getElement = function () {
            return _el;
        }

        SvgCircle.prototype.toString = function () {
            return 'SvgCircle[' + Object.keys(_options).map(function (key) {
                return key + ": " + _el.getAttribute(key);
            }).join(', ') + ']';
        }

        return SvgCircle;
    })(SvgBase);

    // SVG 根对象， 提供操作 SVG 的接口
    window.svgRoot = (function (id) {
        var self = document.querySelector('#' + id),
            activedElements = [],
            mousePressed = false;

        self.addEventListener('mousedown', onMouseDown);
        self.addEventListener('mousemove', onMouseMove);
        self.addEventListener('mouseup', onMouseUp);
        self.addEventListener('click', onClick);

        return {
            addElement: addElement,
            getActivedElements: function () {
                return activedElements;
            }
        };

        function addElement(type) {
            var svgObj = null ;
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

        /**
         * 点击 SVG 元素时触发
         */
        function onClick(event) {
            console.log(event.type);
            // 清除选中元素
            if (event.target === self) {
                activedElements = [];
            }

            if (event.target.dataWrapper) {
                console.log(event.target.dataWrapper.toString());
            }

            // switch (event.target.nodeName) {
            //     case SvgType.CIRCLE:
            //         ['stroke', 'stroke-width', 'cx', 'cy', 'r'].forEach(function (key) {
            //             console.log("%s: %O", key, event.target.getAttribute(key));
            //         })
            //         break;
            // }
        }


        function onMouseDown(event) {
            console.log(event.type);
            mousePressed = true;
            activedElements = [event.target];
        }

        function onMouseMove(event) {
            console.log(event.type);
            var mouseLeftBtnPressed = (event.buttons & 0x1 === 1);
            if (mousePressed && mouseLeftBtnPressed) {
                activedElements.forEach(function (el) {
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
        }
    })('svg-main');

    maskLayer = (function (id) {
        var self = document.querySelector('#' + id);

        return {
            cover: cover
        };

        function cover(target) {
            if (!target instanceof Element) { return; }

            switch (true) {
                case target instanceof SVGLineElement:
                    var x1 = utils.getSvgLength(target.x1),
                        y1 = utils.getSvgLength(target.y1),
                        x2 = utils.getSvgLength(target.x2),
                        y2 = utils.getSvgLength(target.y2);
                    self.style.left = x1 + 'px';
                    self.style.top = y1 + 'px';
                    self.style.width = (x2 - x1) + 'px';
                    self.style.height = (y2 - y1) + 'px';
                    break;
                case target instanceof SVGCircleElement:
                    var cx = utils.getSvgLength(target.cx),
                        cy = utils.getSvgLength(target.cy),
                        r = utils.getSvgLength(target.r);
                    self.style.left = (cx - r) + 'px';
                    self.style.top = (cy - r) + 'px';
                    self.style.height = self.style.width = (2 * r) + 'px';
                    break
            }
        }
    })('mask-layer');
});