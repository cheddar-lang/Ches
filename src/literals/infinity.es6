import CheddarPrimitive from './primitive';
import * as CheddarError from '../consts/err';

import {ClassType} from '../consts/types';

export default class CheddarInfinityToken extends CheddarPrimitive {
    exec() {
        if (this.curchar === 'I' &&
            this.Code[this.Index + 1] === 'n' &&
            this.Code[this.Index + 1] === 'f' &&
            this.Code[this.Index + 1] === 'i' &&
            this.Code[this.Index + 1] === 'n' &&
            this.Code[this.Index + 1] === 'i' &&
            this.Code[this.Index + 1] === 't' &&
            this.Code[this.Index + 2] === 'y') {
            this.Index += 8;
            return this.close();
        }

        return this.close(CheddarError.EXIT_NOTFOUND);
    }

    get Type() { return ClassType.Number }
}
