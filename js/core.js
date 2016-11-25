var utils = (function () {
    return {
        getSvgLength: getSvgLength
    };

    function getSvgLength(svgAnimatedLength) {
        return svgAnimatedLength.baseVal.value;
    }
})();

window.addEventListener('DOMContentLoaded', function (e) {
    initialize();
});

var maskLayer = null;
var selectedSvgElement = null;
var strokeInput = null;
var strokeWidthInput = null;

function initialize() {
    var svgEl = document.querySelector('#svg-main');

    maskLayer = (function (id) {
        var self = document.querySelector('#' + id);

        return {
            cover: cover
        };

        function cover (target) {
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
                        r  = utils.getSvgLength(target.r);
                    self.style.left = (cx - r) + 'px';
                    self.style.top = (cy - r) + 'px';
                    self.style.height = self.style.width = (2 * r) + 'px';
                    break
            }
        }
    })('mask-layer');

    svgEl.addEventListener('click', function (e) {
        if (selectedSvgElement && e.target === this) {
            setSelectStatus(selectedSvgElement, false);
        }
    });

    var allEl = svgEl.querySelectorAll('*');
    for (var i = 0; i < allEl.length; ++i) {
        var el = allEl.item(i);
        el.addEventListener('mouseenter', function (e) {
            e.target.setAttribute('class', 'hover');
            maskLayer.cover(e.target);
        });

        el.addEventListener('mouseleave', function (e) {
            if (e.target !== selectedSvgElement) {
                e.target.setAttribute('class', '');
            }
        });

        el.addEventListener('click', onSvgElementClicked);
    }

    strokeInput = document.querySelector('#stroke-input');
    strokeInput.addEventListener('keydown', function (e) {
        var valid = e.key === 'Backspace' 
            || (/^[#a-zA-Z0-9]$/g.test(e.key) && (this.value.trim().length <= 6));
        if (!valid) {
            e.preventDefault();
        }
    })
    strokeInput.addEventListener('input', function (e) {
        var hexColor = this.value;
        if (hexColor[0] !== '#') {
            hexColor = '#' + hexColor;
        }
        setStroke(hexColor);
    });

    strokeWidthInput = document.querySelector('#stroke-width-input');
    strokeWidthInput.addEventListener('keydown', function (e) {
        var valid = e.key === 'Backspace' || /^[0-9]{1,2}$/.test(e.key);
        if (!valid) { e.preventDefault(); }
    });
    strokeWidthInput.addEventListener('input', function (e) {
        if (selectedSvgElement) {
            selectedSvgElement.style.strokeWidth = this.value;
        }
    });
}

function setSelectStatus(el, selected) {
    if (el instanceof Element) {
        el.setAttribute('class', selected ? 'selected' : '');
    }
}

function setStroke(colorValue) {
    if (!strokeInput) return;

    colorValue = formatColorToHex(colorValue);

    strokeInput.value = colorValue
    strokeInput.style.backgroundColor = colorValue;
    if (selectedSvgElement) {
        selectedSvgElement.style.stroke = colorValue;
    }
}

function formatColorToHex(rgbStr) {
    if (!rgbStr || rgbStr.indexOf('rgb') === -1) return rgbStr;

    var rgbArr = rgbStr.slice(4, rgbStr.length - 1).split(',');

    var r = parseInt(rgbArr[0], 10),
        g = parseInt(rgbArr[1], 10),
        b = parseInt(rgbArr[2], 10);

    var hexColor = '#' 
        + (r === 0 ? '00' : r.toString(16)) 
        + (g === 0 ? '00' : g.toString(16)) 
        + (b === 0 ? '00' : b.toString(16)) 
    return hexColor;
}

function onSvgElementClicked (e) {
    /* 点击元素时，反选之前元素，  选中当前元素， 更新记录的当前选中元素 */
    if (selectedSvgElement) {
        setSelectStatus(selectedSvgElement, false);
    }
    setSelectStatus(e.target, true);
    selectedSvgElement = e.target;
    
    setStroke(selectedSvgElement.style.stroke);
    strokeWidthInput.value = selectedSvgElement.style.strokeWidth;
}