describe('', function () {
    it('test rgb', function () {
        expect(utils.convertRgb2Hex('rgb(255, 255, 255)')).toBe('#ffffff');
    });

    it('', function () {
        var target = {};
        utils.setAttrs(target, {
            name: 'a',
            age: 18
        });
        expect(target.name).toBe('a');
        expect(target.age).toBe(18);

        target = document.createElement('a');
        utils.setAttrs(target, {
            name: 'b'
        });
        expect(target.getAttribute('name')).toBe('b');
    });
});