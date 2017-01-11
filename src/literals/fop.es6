// Functionized operators
import {OP, UOP} from '../consts/ops';
import CheddarLexer from '../tok/lex';
import CheddarPrimitive from './primitive';
import * as CheddarError from '../consts/err';
import CheddarExpressionToken from '../parsers/expr';
import CheddarCustomLexer from '../parsers/custom';

const OPERATORS = UOP.concat(OP).sort((a, b) => b.length - a.length);


// ( :? (expr:)? uop|op (:expr)? )

export default class CheddarFunctionizedOperatorToken extends CheddarPrimitive {
    exec() {
        let start = this.Index;

        // Parse initial `(`
        if (!this.jumpLiteral("(")) {
            return CheddarError.EXIT_NOTFOUND;
        }
        this.jumpWhite();

        let isUnary = false;
        let leftExpression = null;
        let rightExpression = null;

        // Check if unary
        if (this.jumpLiteral(":")) {
            isUnary = true;
        } else {
            // If not unary, this is unapplicable
            this.jumpWhite();

            let startIndex = this.Index;

            let leftParser = this.initParser(CheddarExpressionToken);
            let leftAttempt = leftParser.exec();

            if (!(leftAttempt instanceof CheddarLexer)) {
                this.Index = leftParser.Index;
                return this.error(leftAttempt);
            }

            if (leftAttempt.Index !== startIndex) {
                // Something was actually matched, skip w/ `:`
                leftExpression = leftAttempt;
                this.Index = leftAttempt.Index;

                this.jumpWhite();
                if (!this.jumpLiteral(":")) {
                    return CheddarError.EXIT_NOTFOUND;
                }
            }
        }
        this.jumpWhite();

        // Match operator
        let op, i = 0, target = isUnary ? UOP : OP;
        for (; i < target.length; i++) {
            if (this.jumpLiteral(target[i])) {
                op = target[i];
                break;
            }
        }

        if (!op) {
            return CheddarError.EXIT_NOTFOUND;
        }
        this.jumpWhite();

        // Right bond
        if (this.jumpLiteral(":")) {
            let rightParser = this.initParser(CheddarExpressionToken);
            let rightAttempt = rightParser.exec(true);

            if (rightAttempt instanceof CheddarLexer) {
                rightExpression = rightAttempt;
                this.Index = rightAttempt.Index;
                this.jumpWhite();
            } else {
                this.Index = Math.max( this.Index, rightParser.Index );
                return this.error( CheddarError.UNEXPECTED_TOKEN );
            }
        }

        if (!this.jumpLiteral(")")) {
            this.Index = start;
            return this.error( CheddarError.UNMATCHED_DELIMITER );
        }

        this._Tokens = [
            isUnary,
            op,
            leftExpression || "",
            rightExpression || ""
        ];

        return this.close();
    }
}
