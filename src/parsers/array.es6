import * as CheddarError from '../consts/err';
import {ARRAY_OPEN, ARRAY_CLOSE, ARRAY_SEPARATOR} from '../consts/chars';
import CheddarExpressionToken from './expr';
import CheddarLexer from '../tok/lex';
import CheddarPrimitive from '../literals/primitive';

import {ClassType} from '../consts/types';

export default class CheddarArrayToken extends CheddarPrimitive {
    exec(OPEN = ARRAY_OPEN, CLOSE = ARRAY_CLOSE, PARSER = CheddarExpressionToken, LOOSE = false) {
        var c = this.getChar();
        if (c !== OPEN)
            return this.error(CheddarError.EXIT_NOTFOUND);
        while (true) {

            this.jumpWhite();

            if (Array.isArray(PARSER)) {
                let parser = this.grammar(true, ...PARSER);
                if (!(parser instanceof CheddarLexer))
                    return this.error(parser);
            } else {
                let value = this.initParser(PARSER),
                    parsed = value.exec();

                this.Index = value.Index;
                if (parsed instanceof CheddarLexer)
                    this.Tokens = parsed;
                else
                    return this.error(parsed);
            }

            this.jumpWhite();

            switch (this.getChar()) {
                case CLOSE:
                    return this.close();
                case ARRAY_SEPARATOR:
                    break;
                default:
                    if (LOOSE === false) {
                        return this.error(CheddarError.UNEXPECTED_TOKEN);
                    } else {
                        return this.close(CheddarError.EXIT_NOTFOUND);
                    }
            }
        }
    }

    get Type() { return ClassType.Array }
}