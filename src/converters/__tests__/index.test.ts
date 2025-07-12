import { convertToUppercase, convertToLowercase } from '../string-converter';
import { convertClassToNamedFunction } from '../class-to-named-function';

describe('Converters Integration Tests', () => {
  describe('stringConverters integration', () => {
    it('should handle complete string transformation workflow', () => {
      const originalText = 'Hello World';

      // Test uppercase conversion
      const upperText = convertToUppercase(originalText);
      expect(upperText).toBe('HELLO WORLD');

      // Test lowercase conversion
      const lowerText = convertToLowercase(upperText);
      expect(lowerText).toBe('hello world');

      // Test round-trip conversion
      const roundTripText = convertToLowercase(convertToUppercase(originalText));
      expect(roundTripText).toBe('hello world');
    });

    it('should handle edge cases across all string converters', () => {
      const testCases = [
        '',
        'a',
        'A',
        'hello world',
        'HELLO WORLD',
        'HeLLo WoRLd',
        '123!@#',
        '  spaces  ',
        'HÉLLÖ WÖRLD'
      ];

      testCases.forEach(testCase => {
        const upperResult = convertToUppercase(testCase);
        const lowerResult = convertToLowercase(testCase);

        // Verify that uppercase of lowercase equals original uppercase
        expect(convertToUppercase(lowerResult)).toBe(upperResult);

        // Verify that lowercase of uppercase equals original lowercase
        expect(convertToLowercase(upperResult)).toBe(lowerResult);
      });
    });
  });

  describe('classToNamedFunction integration', () => {
    it('should handle complex class with multiple methods', () => {
      const complexClass = `
class UserService {
  static async getUser(id) {
    return userService.getUser(id);
  }
  static createUser(userData) {
    return userService.createUser(userData);
  }
  static updateUser(id, data) {
    return userService.updateUser(id, data);
  }
  static deleteUser(id) {
    return userService.deleteUser(id);
  }
}
module.exports = UserService;`;

      const result = convertClassToNamedFunction(complexClass);

      // Verify all methods are converted
      expect(result).toContain('function getUser(id)');
      expect(result).toContain('function createUser(userData)');
      expect(result).toContain('function updateUser(id, data)');
      expect(result).toContain('function deleteUser(id)');

      // Verify exports are created
      expect(result).toContain('exports.getUser = getUser;');
      expect(result).toContain('exports.createUser = createUser;');
      expect(result).toContain('exports.updateUser = updateUser;');
      expect(result).toContain('exports.deleteUser = deleteUser;');

      // Verify class declaration is removed
      expect(result).not.toContain('class UserService');
      expect(result).not.toContain('module.exports = UserService;');
    });

    it('should preserve method signatures exactly', () => {
      const classWithComplexSignatures = `
class ApiService {
  static async fetchData(url, options = {}) {
    return apiService.fetchData(url, options);
  }
  static postData(url, data, headers = {}) {
    return apiService.postData(url, data, headers);
  }
  static deleteResource(id, { force = false } = {}) {
    return apiService.deleteResource(id, { force });
  }
}
module.exports = ApiService;`;

      const result = convertClassToNamedFunction(classWithComplexSignatures);

      // Verify async keyword is preserved
      expect(result).toContain('async function fetchData(url, options = {})');

      // Verify default parameters are preserved
      expect(result).toContain('function postData(url, data, headers = {})');

      // Verify destructured parameters are preserved
      expect(result).toContain('function deleteResource(id, { force = false } = {})');
    });
  });

  describe('cross-module functionality', () => {
    it('should handle mixed transformations', () => {
      // Test that string converters work with class converter output
      const classCode = `
class TestClass {
  static getMessage() {
    return messageService.getMessage();
  }
}
module.exports = TestClass;`;

      const convertedClass = convertClassToNamedFunction(classCode);

      // Apply string transformation to the converted code
      const upperConverted = convertToUppercase(convertedClass);
      const lowerConverted = convertToLowercase(convertedClass);

      // Verify the transformations work on the converted code
      expect(upperConverted).toContain('FUNCTION GETMESSAGE()');
      expect(lowerConverted).toContain('function getmessage()');
    });

        it('should maintain consistency across all converters', () => {
      // Test that all converters handle edge cases consistently
      const emptyInputs = ['', '   ', '\n\t'];

      emptyInputs.forEach(input => {
        expect(convertToUppercase(input)).toBe(input);
        expect(convertToLowercase(input)).toBe(input);
        // convertClassToNamedFunction trims whitespace, so empty inputs become empty string
        expect(convertClassToNamedFunction(input)).toBe('');
      });
    });
  });
});