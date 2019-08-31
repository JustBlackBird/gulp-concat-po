var expect = require('chai').expect
    File = require('vinyl'),
    concatPo = require('../index.js');

describe('Plugin', function () {
    it('should concat two .po files', function () {
        var plugin = concatPo('messages.po');

        plugin.write(new File({
            path: '/src/first.po',
            contents: new Buffer('')
        }));
    });
});