import { convertClassToNamedFunction } from '../classToNamedFunction';

describe('convertClassToNamedFunction', () => {
  describe('basic static method conversion', () => {
    it('should convert a simple static method to named function', () => {
      const input = `
class MyClass {
  static getUser(id) {
    return userService.getUser(id);
  }
}
module.exports = MyClass;`;

      const expected = `function getUser(id) {
  return userService.getUser(id);
}
exports.getUser = getUser;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should convert multiple static methods', () => {
      const input = `
class MyClass {
  static getUser(id) {
    return userService.getUser(id);
  }
  static createUser(userData) {
    return userService.createUser(userData);
  }
}
module.exports = MyClass;`;

      const expected = `function getUser(id) {
  return userService.getUser(id);
}
exports.getUser = getUser;

function createUser(userData) {
  return userService.createUser(userData);
}
exports.createUser = createUser;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle async static methods', () => {
      const input = `
class MyClass {
  static async getUser(id) {
    return userService.getUser(id);
  }
}
module.exports = MyClass;`;

      const expected = `async function getUser(id) {
  return userService.getUser(id);
}
exports.getUser = getUser;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle methods with complex parameters', () => {
      const input = `
class MyClass {
  static getUser(id, options = {}) {
    return userService.getUser(id, options);
  }
}
module.exports = MyClass;`;

      const expected = `function getUser(id, options = {}) {
  return userService.getUser(id, options);
}
exports.getUser = getUser;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle methods with no parameters', () => {
      const input = `
class MyClass {
  static getAllUsers() {
    return userService.getAllUsers();
  }
}
module.exports = MyClass;`;

      const expected = `function getAllUsers() {
  return userService.getAllUsers();
}
exports.getAllUsers = getAllUsers;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle class with no methods', () => {
      const input = `
class MyClass {
}
module.exports = MyClass;`;

      const expected = `//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle class with non-static methods (should not convert)', () => {
      const input = `
class MyClass {
  getUser(id) {
    return userService.getUser(id);
  }
  static getStaticUser(id) {
    return userService.getUser(id);
  }
}
module.exports = MyClass;`;

      const expected = `getUser(id) {
    return userService.getUser(id);
  }
function getStaticUser(id) {
  return userService.getUser(id);
}
exports.getStaticUser = getStaticUser;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle class with different service names', () => {
      const input = `
class MyClass {
  static getData(id) {
    return dataService.getData(id);
  }
  static saveData(data) {
    return storageService.saveData(data);
  }
}
module.exports = MyClass;`;

      const expected = `function getData(id) {
  return dataService.getData(id);
}
exports.getData = getData;

function saveData(data) {
  return storageService.saveData(data);
}
exports.saveData = saveData;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle class with complex method bodies', () => {
      const input = `
class MyClass {
  static async processUser(userId, options = {}) {
    return await userService.processUser(userId, { ...options, timestamp: Date.now() });
  }
}
module.exports = MyClass;`;

      // This does not match the regex, so the method is left as-is
      const expected = `static async processUser(userId, options = {}) {
    return await userService.processUser(userId, { ...options, timestamp: Date.now() });
  }
//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle class with different export syntax', () => {
      const input = `
class MyClass {
  static getUser(id) {
    return userService.getUser(id);
  }
}
exports.MyClass = MyClass;`;

      const expected = `function getUser(id) {
  return userService.getUser(id);
}
exports.getUser = getUser;

}
exports.MyClass = MyClass;`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle class with no export statement', () => {
      const input = `
class MyClass {
  static getUser(id) {
    return userService.getUser(id);
  }
}`;

      const expected = `function getUser(id) {
  return userService.getUser(id);
}
exports.getUser = getUser;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle empty input', () => {
      const input = '';
      const expected = '';
      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle input with only whitespace', () => {
      const input = '   \n  \t  ';
      const expected = '';
      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle class with methods that don\'t match the pattern', () => {
      const input = `
class MyClass {
  static getUser(id) {
    console.log('Getting user');
    const user = userService.getUser(id);
    return user;
  }
}
module.exports = MyClass;`;

      // This should not match the regex pattern since it has additional code
      const expected = `static getUser(id) {
    console.log('Getting user');
    const user = userService.getUser(id);
    return user;
  }
//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });
  });

  describe('method signature variations', () => {
    it('should handle methods with destructured parameters', () => {
      const input = `
class MyClass {
  static getUser({ id, includeProfile = false }) {
    return userService.getUser({ id, includeProfile });
  }
}
module.exports = MyClass;`;

      const expected = `function getUser({ id, includeProfile = false }) {
  return userService.getUser({ id, includeProfile });
}
exports.getUser = getUser;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle methods with rest parameters', () => {
      const input = `
class MyClass {
  static createUser(name, ...args) {
    return userService.createUser(name, ...args);
  }
}
module.exports = MyClass;`;

      const expected = `function createUser(name, ...args) {
  return userService.createUser(name, ...args);
}
exports.createUser = createUser;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });

    it('should handle methods with default parameters', () => {
      const input = `
class MyClass {
  static searchUsers(query = '', limit = 10) {
    return userService.searchUsers(query, limit);
  }
}
module.exports = MyClass;`;

      const expected = `function searchUsers(query = '', limit = 10) {
  return userService.searchUsers(query, limit);
}
exports.searchUsers = searchUsers;

//injection`;

      expect(convertClassToNamedFunction(input)).toBe(expected);
    });
  });
});