# gulp-concat-po

> Correctly concatenates .po files.


## Install

1. Install the plugin with the following command:

	```shell
	npm install gulp-concat-po --save-dev
	```


## Usage

```js
var gulp = require('gulp');
var concatPo = require('gulp-concat-po');

gulp.task('default', function () {
    return gulp.src(['src/gettext/*.po'])
        .pipe(concatPo('messages.pot'))
        .pipe(gulp.dest('release'));
});
```


## API

### concatPo(fileName, options)

#### fileName

Type: `String`

Name of the resulting file.

#### options.headers

Type: `Object`

A list of headers that will be used in the resulting .po file. The object can contain the following keys:

- Project-Id-Version
- Report-Msgid-Bugs-To
- POT-Creation-Date
- PO-Revision-Date
- Last-Translator
- Language
- Language-Team
- Content-Type
- Content-Transfer-Encoding
- Plural-Forms

Description of the fields can be found [here](https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html#Header-Entry).
If a field is not specified the value from the first file in the stream will be used.


## License

[MIT](http://opensource.org/licenses/MIT) © Dmitriy Simushev
