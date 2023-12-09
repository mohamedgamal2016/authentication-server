import { ValidationError } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IErrorMessage = Record<string, any>;

export function formatErrorsHelper(errors: ValidationError[]): IErrorMessage[] {
  return errors.flatMap((item): IErrorMessage => {
    const { property, constraints, children } = item;
    const result: IErrorMessage = {};

    if (constraints) {
      return Object.values(constraints);
    }

    if (Array.isArray(children) && children.length > 0) {
      return formatErrorsHelper(children).flatMap(
        (childMessage) =>
          `Invalid nested attribute ${property}. ${childMessage}`,
      );
    }

    return result;
  });
}
