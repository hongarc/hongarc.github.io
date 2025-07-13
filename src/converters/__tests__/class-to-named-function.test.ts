import { convertClassToNamedFunction } from '../class-to-named-function';

describe('convertClassToNamedFunction', () => {
  it('should convert class to named function', () => {
    const input = `
class MyClass {
  constructor() {
    this.name = 'test';
  }

  method() {
    return this.name;
  }
}`;

    const expected = `constructor() {
    this.name = 'test';
  }

  method() {
    return this.name;
  }
//injection`;

    const result = convertClassToNamedFunction(input);
    expect(result.trim()).toBe(expected.trim());
  });

  it('should handle class with extends', () => {
    const input = `
class MyClass extends BaseClass {
  method() {
    return 'test';
  }
}`;

    const expected = `method() {
    return 'test';
  }
//injection`;

    const result = convertClassToNamedFunction(input);
    expect(result.trim()).toBe(expected.trim());
  });

  it('should handle class with implements', () => {
    const input = `
class MyClass implements MyInterface {
  method() {
    return 'test';
  }
}`;

    const expected = `method() {
    return 'test';
  }
//injection`;

    const result = convertClassToNamedFunction(input);
    expect(result.trim()).toBe(expected.trim());
  });

  it('should handle empty class', () => {
    const input = `
class EmptyClass {
}`;

    const expected = `//injection`;

    const result = convertClassToNamedFunction(input);
    expect(result.trim()).toBe(expected.trim());
  });
});
