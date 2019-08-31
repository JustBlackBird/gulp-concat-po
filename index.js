var through = require('through2'),
    PluginError = require('plugin-error'),
    File = require('vinyl'),
    PoFile = require('pofile'),
    _merge = require('lodash.merge'),
    _find = require('lodash.find'),
    _uniq = require('lodash.uniq'),
    path = require('path');

/**
 * Checks if an two items in of a PO file are equals.
 *
 * The function is curried, so it takes args by one.
 *
 * @param a
 * @returns {function(*): boolean}
 */
var equalItems = function (a) {
    return function (b) {
        return (a.msgid === b.msgid) && (a.msgctxt === b.msgctxt);
    };
};

/**
 * Concatenates several .po file into one.
 *
 * @param {String} fileName Name of the target file
 * @param {Object} options List of additional options.
 *
 * @returns {Function} A function which can be piped to files stream.
 */
var concatPoPlugin = function(fileName, options) {
    var combinedPo,
        firstFile = false;

    if (!options) {
        options = {};
    }

    if (!fileName) {
        throw new PluginError('gulp-concat-po', 'fileName argument must be set');
    }

    return through.obj(function(file, enc, callback) {
        var stream = this;

        if (file.isNull()) {
            callback();

            return;
        }

        if (file.isStream()) {
            stream.emit('error', new PluginError('gulp-concat-po', 'Streams are not supported'));
            callback();

            return;
        }

        var currentPo = PoFile.parse(file.contents.toString());

        if (!firstFile) {
            // The current file is the first file.
            firstFile = file;

            combinedPo = new PoFile();
            // Use headers from the first file
            combinedPo.headers = _merge(currentPo.headers, (options.headers || {}));
            // Array.prototype.concat([]) is used to clone the items array
            combinedPo.items = currentPo.items.concat([]);
        } else {
            // Merge files by merging their items
            for (var i = 0, l = currentPo.items.length; i < l; i++) {
                var currentItem = currentPo.items[i];

                // Check if the current item is already in the target po file.
                var sameItem = _find(combinedPo.items, equalItems(currentItem));

                if (sameItem) {
                    // Merge items by merging their references
                    sameItem.references = _uniq(sameItem.references.concat(currentItem.references));
                } else {
                    // Add item to the resulting file
                    combinedPo.items.push(currentItem);
                }
            }
        }

        callback();
    }, function(callback) {
        this.push(new File({
            cwd: firstFile.cwd,
            base: firstFile.base,
            path: path.join(firstFile.base, fileName),
            contents: new Buffer(combinedPo.toString()),
            stat: firstFile.stat
        }));

        callback();
    });
};

module.exports = concatPoPlugin;
