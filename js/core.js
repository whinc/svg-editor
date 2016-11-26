    
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

        SvgCircle.prototype.toString = function () {
            var el = this.el;
            return 'SvgCircle[' + Object.keys(this.options).map(function (key) {
                return key + ": " + el.getAttribute(key);
            }).join(', ') + ']';
        }

        return SvgCircle;
    })(SvgBase);

    // SVG 根对象， 提供操作 SVG 的接口
    window.svgRoot = (function (id) {
        var self = document.querySelector('#' + id),
            svgObjects = [],
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
            // 点击空白地方，清除选中元素
            if (event.target === self) {
                activedElements = [];
            }

            if (event.target.dataWrapper) {
                console.log(event.target.dataWrapper.toString());
            }

        }


        function onMouseDown(event) {
            console.log(event.type);
            mousePressed = true;
            activedElements = [event.target];
            window.maskLayer.cover(event.target.dataWrapper);
        }

        function onMouseMove(event) {
            console.log(event.type);
            var mouseLeftBtnPressed = (event.buttons & 0x1 === 1);
            if (mousePressed && mouseLeftBtnPressed) {
                window.maskLayer.cover(event.target.dataWrapper);

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
            window.maskLayer.cover(event.target.dataWrapper);
        }
    })('svg-main');

    window.maskLayer = (function (id) {
        var self = document.querySelector('#' + id);

        return {
            cover: cover
        };

        function cover(svgObj) {
            if (!svgObj) {return;}

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