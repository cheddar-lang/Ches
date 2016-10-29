import CheddarOperatorToken from '../literals/op';
import {PRECEDENCE, UNARY_PRECEDENCE, RA_PRECEDENCE, TYPE} from '../consts/ops';
import * as CheddarError from '../consts/err';
import CheddarLexer from './lex';

export default class CheddarShuntingYard extends CheddarLexer {
    exec(expression) {
        if (expression && expression.Code)
            this.Code = expression.Code;
        if (expression && expression.Index)
            this.Index = expression.Index;

        // Flatten the expression
        let current = expression;
        let tokens = [];
        if (!current ||
            !current.isExpression ||
            current._Tokens.length > 2
        )
            return this.close(expression);

        while (
            current &&
            current._Tokens.length === 2 &&
            (current._Tokens[1].isExpression || // prevents import recursion
                current._Tokens[1] instanceof CheddarShuntingYard)
        ) {
            if (current._Tokens[0].isExpression) //TODO: code, index
                tokens.push(new CheddarShuntingYard().exec(current._Tokens[0]));
            else
                tokens.push(current._Tokens[0]);
            if (current._Tokens[1] instanceof CheddarShuntingYard) {
                tokens.push(current._Tokens[1]);
                current = null;
                break;
            } else
                current = current._Tokens[1];
            //TODO: make sure this covers all cases; otherwise, see when this doesn't work
        }

        if (current && current._Tokens.length > 1) {
            this.Index = current.Index;
            return this.error(CheddarError.UNEXPECTED_TOKEN);
        }

        if (current &&
            current._Tokens.length === 1) {
            if (current._Tokens[0].isExpression)
                tokens.push(new CheddarShuntingYard().exec(current._Tokens[0]));
            else
                tokens.push(current._Tokens[0]);
        }

        // Reorder tokens
        let operators = [],
            precedences = [],
            unary = true;
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i],
                previousPrecedence = 0;
            if (token instanceof CheddarShuntingYard) {
                for (let i = 0; i < token._Tokens.length; i++)
                    this.Tokens = token._Tokens[i];
                unary = false;
            } else if (token.constructor.name === "CheddarOperatorToken") { // It's an operator
                if (RA_PRECEDENCE.has(token._Tokens[0]))
                    token.Tokens = TYPE.RTL;
                else if (unary)
                    token.Tokens = TYPE.UNARY;
                else
                    token.Tokens = TYPE.LTR;

                let precedence;
                switch (token._Tokens[1]) {
                    case TYPE.RTL:
                        precedence = RA_PRECEDENCE.get(token._Tokens[0]);
                        break;
                    case TYPE.UNARY:
                        precedence = UNARY_PRECEDENCE.get(token._Tokens[0]);
                        break;
                    case TYPE.LTR:
                        precedence = PRECEDENCE.get(token._Tokens[0]);
                        break;
                }

                let minus = token._Tokens[1] == TYPE.RTL ? 0 : 1;
                previousPrecedence = precedences[precedences.length - 1];
                while (precedence - minus < previousPrecedence) {
                    this.Tokens = operators.pop();
                    precedences.pop();
                    previousPrecedence = precedences[precedences.length - 1];
                }

                operators.push(token);
                precedences.push(precedence);
                previousPrecedence = precedence;
                unary = true;
            } else {
                this.Tokens = token;
                unary = false;
            }
        }

        this.Tokens.push(...operators.reverse());

        return this.close();
    }
}
