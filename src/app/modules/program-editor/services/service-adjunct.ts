import { complement, compose, equals, toLower } from 'ramda';
import { Either } from 'ramda-fantasy';

const first5Letter = x => x.substring(0, 5);

export const hasError = compose(equals('error'), toLower, first5Letter);

export const hasNoError = complement(hasError);

export const { Left, Right } = Either;
