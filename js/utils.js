var utils = (function () {
    return {
        getSvgLength: getSvgLength,
        convertRgb2Hex: convertRgb2Hex,
        setAttrs: setAttrs,
        getViewportSize: getViewportSize,
        getBoundingClientRect: getBoundingClientRect
    };

    // 获取视口大小
    function getViewportSize() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        };
    }

    // 获取元素相对视口坐标的大小
    function getBoundingClientRect(el) {
        var rect = el.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width || (rect.right - rect.left),
            height: rect.height || (rect.bottom - rect.top)
        }
    }

    function getSvgLength(svgAnimatedLength) {
        return svgAnimatedLength.baseVal.value;
    }

    function convertRgb2Hex(rgbStr) {
        var matchResult = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(rgbStr);
        if (!matchResult) {
            return '';
        }

        var r = parseInt(matchResult[1], 10).toString(16),
            g = parseInt(matchResult[2], 10).toString(16),
            b = parseInt(matchResult[3], 10).toString(16);

        var hexColor = '#' 
            + (r.length < 2 ? '0' + r : r)
            + (g.length < 2 ? '0' + g : g)
            + (b.length < 2 ? '0' + b : b);
        return hexColor;
    }

    function setAttrs(target, attrs) {
        Object.keys(attrs).forEach(function (name) {
            if (target instanceof Element) {
                target.setAttribute(name, attrs[name]);
            } else {
                target[name] = attrs[name];
            }
        });
    }
})();