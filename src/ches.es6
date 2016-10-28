#!/usr/bin/env node

import tok from './tok';
import lex from './tok/lex';
import readline from 'readline';
import tty from 'tty';
import util from 'util';

function locateInput(def) {
    let valid = [ '--ast', '--json', '--obj' ];
    let inputs = process.argv;
    for (let i = 0; i < inputs.length; i++) {
        if (valid.indexOf(inputs[i]) > -1) return inputs[i];
    }
    return def;
}

function prettyPrint() {
    return process.argv.indexOf('--pretty') > -1 || tty.isatty(0);
}

function simplify(obj) {
    let r = {
        Name: obj.constructor.name,
        Tokens: obj._Tokens.map(i => i instanceof lex ? simplify(i) : i)
    };
    return r;
}

function generateOutput(input, last) {
    let outFormat = locateInput(last).slice(2);
    let run = new tok(input, 0);
    let res = run.exec();
    if (!(res instanceof lex)) {
        return res;
    } else {
        switch (outFormat) {
            case "ast": return res.toAST();
            case "json": return JSON.stringify(simplify(res), null, prettyPrint() ? 2 : null);
            case "obj": return util.inspect(res, { showHidden: false, depth: null, colors: prettyPrint() })
            default: return "unsupported output format"
        }
    }
}

if (!module.parent) {
    if (tty.isatty(0)) {
        let read = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        read.setPrompt('\x1b[33mcheddar::parser>\x1b[0m ');
        read.prompt();

        read.on('line', function(input) {
            console.log(generateOutput(input, '--ast'));
            read.prompt();
        });
    }
    else {
        var c = require('./prog');
        var STDIN = "";
        var chunk;
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', function() {
            chunk = process.stdin.read();
            if (chunk !== null)
                STDIN += chunk;
        });
        process.stdin.on('end', function() {
            process.stdout.write(generateOutput(STDIN, '--json'));
        });
    }
} else {
    module.exports = function(extras) {
        if (extras) {
            Object.assign(tok, {
                Expression: require('./parsers/expr'),
                
                // Literals
                Array: require('./parsers/array'),
                Dictionary: require('./literals/dict'),

                FunctionalOperator: require('./literals/fop'),
                FunctionalProperty: require('./literals/fprop'),

                Number: require('./literals/number'),
                String: require('./literals/string'),
                Symbol: require('./literals/symbol'),
                Regex: require('./literals/regex'),

                Lambda: require('./parsers/function'),

                Boolean: require('./literals/boolean'),
                Nil: require('./literals/nil'),

                // Things to do with variables
                Property: require('./parsers/property'),
                Identifier: require('./parsers/var'),

                // Important things
                Lexer: require('./tok/lex'),

                // Helpers
                Helpers: {
                    Locate: require('./helpers/loc')
                }
            });
        }

        return tok;
    }
}
