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

/**
 * SVG 元素封装类型的基类型
 */
var SvgBase = (function () {
    /* constructor */
    function SvgBase() {
        this.createTime = Date.now();
    }

    /* 实例方法 */

    SvgBase.prototype.createElement = function (tagName) {
        return document.createElementNS('http://www.w3.org/2000/svg', tagName);
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

    /* 消息接口 */

    /**
     * 属性变化时被调用
     */
    SvgBase.prototype.onAttrChanged = function (data) {
        var attrs = {};
        attrs[data.key] = data.value;
        utils.setAttrs(this.getElement(), attrs);
    }

    /* 抽象接口 */

    /**
     * 获取保存的 SVGElement 对象
     * 每个封装类型对象的引用都会保存在 SVGElement.svgBase 属性中
     */
    SvgBase.prototype.getElement = function () {
        throw new Error('unimplemented');
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
        this.el.svgBase = this;         // 保存当前实例到元素中
    }

    SvgCircle.prototype = new Parent();
    SvgCircle.prototype.constructor = SvgCircle;

    /* 实例方法 */
    SvgCircle.prototype.toString = function () {
        var el = this.el;
        return 'SvgCircle[' + Object.keys(this.options).map(function (key) {
            return key + ": " + el.getAttribute(key);
        }).join(', ') + ']';
    }

    /* 抽象接口实现 */

    SvgCircle.prototype.getElement = function () {
        return this.el;
    }

    SvgCircle.prototype.getSupportAttrs = function () {
        var el = this.el;
        var supportAttrs = Parent.prototype.getSupportAttrs.call(this);
        utils.setAttrs(supportAttrs, {
            cx: el.getAttribute('cx'),
            cy: el.getAttribute('cy'),
            r: el.getAttribute('r')
        });
        return supportAttrs;
    }


    return SvgCircle;
})(SvgBase);
