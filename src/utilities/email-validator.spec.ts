// eslint-disable-next-line import/extensions
import { emailValidator } from './email-validator';

describe('Validate Email', () => {
    test('Standard IBM email', () => {
        expect.assertions(1);
        const result = emailValidator('ibm@ibm.com');

        expect(result).toEqual(true);
    });

    test('Country identifier IBM email', () => {
        expect.assertions(1);
        const result = emailValidator('us.ibm@us.ibm.com');

        expect(result).toEqual(true);
    });

    test('Gmail email', () => {
        expect.assertions(1);
        const result = emailValidator('gmail@gmail.com');

        expect(result).toEqual(true);
    });
});

describe('Invalidate Email', () => {
    test('Non email address', () => {
        expect.assertions(1);
        const result = emailValidator('nonEmailAddress');

        expect(result).toEqual(false);
    });

    test('missing @', () => {
        expect.assertions(1);
        const result = emailValidator('nonEmailAddressibm.com');

        expect(result).toEqual(false);
    });

    test('Missing domain', () => {
        expect.assertions(1);
        const result = emailValidator('nonEmailAddress@');

        expect(result).toEqual(false);
    });

    test('missing domain type', () => {
        expect.assertions(1);
        const result = emailValidator('nonEmailAddress@test');

        expect(result).toEqual(false);
    });

    test('domain extension must be more than 1 letter', () => {
        expect.assertions(1);
        const result = emailValidator('nonEmailAddress@test.c');

        expect(result).toEqual(false);
    });
});
