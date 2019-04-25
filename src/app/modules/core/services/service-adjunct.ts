import { complement, compose, ifElse, prop, curry } from 'ramda';
import { Either, Maybe } from 'ramda-fantasy';
import { isNotNil } from 'ramda-adjunct';
import { MCQueryResponse } from './websocket.service';
import { ErrorFrame } from '../models/error-frame.model';

export const { Left, Right } = Either;

export const { Just, Nothing } = Maybe;

export interface Result { value: any; }

export const errProp = prop('err');

export const resProp = prop('result');

export const errMsgProp = prop('errMsg');

export type handResult = (result: string) => any;

export type handError = (err: ErrorFrame) => any;

export const hasError: (res: MCQueryResponse) => boolean = compose(isNotNil, errProp);

export const hasNoError: (res: MCQueryResponse) => boolean = complement(hasError);

/**
 * A curried function, register provided right and left handlder.
 *
 * @param {handResult} rightHandler handle result if the response has no error.
 * @param {handError} leftHandler handle result if the response has error.
 * @param {MCQueryResponse} response the response.
 * @return {Result} the result.
 */
export const handler = curry(function(rightHandler: handResult, leftHandler: handError, response: MCQueryResponse) {
    return ifElse(hasNoError, compose(Right, rightHandler, resProp), compose(Left, leftHandler, errProp))(response);
});
