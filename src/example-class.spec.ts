import { ExampleClass } from './example-class';

describe('Example Class', () => {
    const exampleClass = new ExampleClass();

    test('example method returns true', () => {
        expect.assertions(1);
        expect(exampleClass.exampleMethod()).toBeTruthy();
    });
});
