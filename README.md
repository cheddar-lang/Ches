<p align="center">
  <h1>Ches</h1>
  <h3>The cheddar parser</h3>
</p>

---

<p align="center">
  <a href="https://travis-ci.org/cheddar-lang/Ches"><img alt="Travis Status" src="https://travis-ci.org/cheddar-lang/Ches.svg?branch=master"></a>
  <a href="https://gitter.im/cheddar-lang/Cheddar?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"><img alt="Join the chat at https://gitter.im/cheddar-lang/Cheddar" src="https://badges.gitter.im/cheddar-lang/Cheddar.svg"></a>
  <a href="https://www.npmjs.com/package/cheddar-lang"><img alt='npm' src="https://img.shields.io/npm/dt/cheddar-lang.svg"></a>
  <img src='https://david-dm.org/cheddar-lang/Ches.svg' alt='Dependency Status' />
</p>

## Installation
Install the CLI (includes REPL) using:

```sh
$ npm i -g cheddar-parser
```

Install for your project using:

```sh
$ npm i --save cheddar-parser
```

## Usage

### CLI
Simply running `cheddar-parser` will open up a REPL. Otherwise, if not a TTY, STDIN will be used as input to STDOUT. Various output formats exist, through flags.

**`--ast`**: Outputs an AST. Best for manually reading the parse tree
**`--obj`**: Outputs an object. Provides in-depth data such as index & state
**`--json`**: Outputs a JSON. Best for processing through another program
**`--pretty`**: Pretty prints outputs. This includes syntax highlighting result & indenting JSON. Automatically assumed on the REPL.

### In Node.js
One installed simply access the given parser using:

```
require('cheddar-parser/dist/path/to/item')
```

Alternatively, most common parsers are available through simply the module itself. example:

```
require('cheddar-parser').Expression
```

The full list of parsers is [here](https://github.com/cheddar-lang/Ches/blob/master/src/ches.es6#L79).

---

To use a parser simply do:

```javascript
let parserInstance = new parser(code, startIndex);
let result = parserInstance.exec();
```

`result` may be an instanceof `CheddarLexer` (`ches.Lexer`), in which case it succesfully parsed, a string, in which it errored, the string is the error description, or a symbol, in which it is a symbol which represents the given error. 

An example, of the most common way a cheddar lexer is used:

```javascript
let run = new parser(code, 0);
let res = run.exec();

if (!(res instanceof ches.Lexer)) {
    // Error, propogate the error
    return `Syntax Error: ${res} at ${run.Index}`;
} else {
    
}
```

---

You can also use the `ches.Helper.Locate(code, index)` to retrieve an array of `[row, col, index]` of the index in the code.
