var utils = (function () {
    return {
        getSvgLength: getSvgLength,
        convertRgb2Hex: convertRgb2Hex,
        setAttrs: setAttrs
    };

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