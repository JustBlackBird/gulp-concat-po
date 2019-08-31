var expect = require('chai').expect,
    File = require('vinyl'),
    concatPo = require('../index.js');

var getHeader = function (content) {
    return content.split(/\n\n/)[0] || '';
};

var getBody = function (content) {
    return content.split(/\n\n/).slice(1).join('\n\n');
};

describe('Plugin', function () {
    it('should combine items from all .po files', function (done) {
        var plugin = concatPo('messages.po');

        plugin.on('data', function (file) {
            expect(getBody(file.contents.toString())).equals([
                'msgid "first.message"',
                'msgstr "First one"',
                '',
                'msgid "second.message"',
                'msgstr "Second one"',
                ''
            ].join('\n'));
            done();
        });

        plugin.write(new File({
            path: '/src/first.po',
            contents: new Buffer([
                '# no header',
                '',
                'msgid "first.message"',
                'msgstr "First one"'
            ].join('\n'))
        }));

        plugin.write(new File({
            path: '/src/second.po',
            contents: new Buffer([
                '# no header',
                '',
                'msgid "second.message"',
                'msgstr "Second one"'
            ].join('\n'))
        }));

        plugin.end();
    });

    it('should use first definition on duplicates', function (done) {
        var plugin = concatPo('messages.po');

        plugin.on('data', function (file) {
            expect(getBody(file.contents.toString())).equals([
                'msgid "first.message"',
                'msgstr "First one"',
                ''
            ].join('\n'));
            done();
        });

        plugin.write(new File({
            path: '/src/first.po',
            contents: new Buffer([
                '# no header',
                '',
                'msgid "first.message"',
                'msgstr "First one"'
            ].join('\n'))
        }));

        plugin.write(new File({
            path: '/src/second.po',
            contents: new Buffer([
                '# no header',
                '',
                'msgid "first.message"',
                'msgstr "Second one"'
            ].join('\n'))
        }));

        plugin.end();
    });

    it('should merge references on duplicates', function (done) {
        var plugin = concatPo('messages.po');

        plugin.on('data', function (file) {
            expect(getBody(file.contents.toString())).equals([
                '#: src/server.c:338',
                '#: src/client.c:942',
                'msgid "first.message"',
                'msgstr "First one"',
                ''
            ].join('\n'));
            done();
        });

        plugin.write(new File({
            path: '/src/first.po',
            contents: new Buffer([
                '# no header',
                '',
                '#: src/server.c:338',
                'msgid "first.message"',
                'msgstr "First one"'
            ].join('\n'))
        }));

        plugin.write(new File({
            path: '/src/second.po',
            contents: new Buffer([
                '# no header',
                '',
                '#: src/client.c:942',
                'msgid "first.message"',
                'msgstr "Second one"'
            ].join('\n'))
        }));

        plugin.end();
    });

    it('should ignore headers from all files but the first one', function (done) {
        var plugin = concatPo('messages.po');

        plugin.on('data', function (file) {
            expect(getHeader(file.contents.toString())).equals([
                'msgid ""',
                'msgstr ""',
                '"Project-Id-Version: \\n"',
                '"Report-Msgid-Bugs-To: \\n"',
                '"POT-Creation-Date: \\n"',
                '"PO-Revision-Date: \\n"',
                '"Last-Translator: \\n"',
                '"Language: ru\\n"',
                '"Language-Team: \\n"',
                '"Content-Type: \\n"',
                '"Content-Transfer-Encoding: \\n"',
                '"Plural-Forms: \\n"'
            ].join('\n'));

            done();
        });

        plugin.write(new File({
            path: '/src/first.po',
            contents: new Buffer([
                'msgid ""',
                'msgstr ""',
                '"Language: ru\\n"',
                '',
                'msgid "first.message"',
                'msgstr "First one"'
            ].join('\n'))
        }));

        plugin.write(new File({
            path: '/src/second.po',
            contents: new Buffer([
                'msgid ""',
                'msgstr ""',
                '"Language-Team: example.com\\n"',
                '',
                'msgid "second.message"',
                'msgstr "Second one"'
            ].join('\n'))
        }));

        plugin.end();
    });

    it('should use headers from options', function (done) {
        var plugin = concatPo('messages.po', {
            headers: {
                'Project-Id-Version': '42',
                'Language': 'pt'
            }
        });

        plugin.on('data', function (file) {
            expect(getHeader(file.contents.toString())).equals([
                'msgid ""',
                'msgstr ""',
                '"Project-Id-Version: 42\\n"',
                '"Report-Msgid-Bugs-To: \\n"',
                '"POT-Creation-Date: \\n"',
                '"PO-Revision-Date: \\n"',
                '"Last-Translator: \\n"',
                '"Language: pt\\n"',
                '"Language-Team: example.com\\n"',
                '"Content-Type: \\n"',
                '"Content-Transfer-Encoding: \\n"',
                '"Plural-Forms: \\n"'
            ].join('\n'));

            done();
        });

        plugin.write(new File({
            path: '/src/first.po',
            contents: new Buffer([
                'msgid ""',
                'msgstr ""',
                '"Project-Id-Version: 99\\n"',
                '"Language: ru\\n"',
                '"Language-Team: example.com\\n"',
                '',
                'msgid "first.message"',
                'msgstr "First one"'
            ].join('\n'))
        }));

        plugin.end();
    });

    it('should build correct path for the resulting file', function (done) {
        var plugin = concatPo('messages.po');

        plugin.on('data', function (file) {
            expect(file.cwd).equal('/');
            expect(file.base).equals('/src');
            expect(file.path).equals('/src/messages.po');
            done();
        });

        plugin.write(new File({
            cwd: '/',
            base: '/src',
            path: '/src/first.po',
            contents: new Buffer([
                '# no header',
                '',
                'msgid "first.message"',
                'msgstr "First one"'
            ].join('\n'))
        }));

        plugin.end();
    });
});
