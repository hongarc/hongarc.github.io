import {
  convertDataFormat,
  detectInputFormat,
  dataConverterExamples,
} from '../data-format-converter';

describe('dataConverters', () => {
  describe('detectInputFormat', () => {
    it('should detect JSON format', () => {
      const input = '{"name": "John", "age": 30}';
      expect(detectInputFormat(input)).toBe('json');
    });

    it('should detect YAML format', () => {
      const input = 'name: John\nage: 30';
      expect(detectInputFormat(input)).toBe('yaml');
    });

    it('should detect CSV format', () => {
      const input = 'name,age\nJohn,30\nJane,25';
      expect(detectInputFormat(input)).toBe('csv');
    });

    it('should detect query string format', () => {
      const input = 'name=John&age=30&city=NYC';
      expect(detectInputFormat(input)).toBe('query');
    });

    it('should detect XML format', () => {
      const input = '<root><name>John</name><age>30</age></root>';
      expect(detectInputFormat(input)).toBe('xml');
    });
  });

  describe('convertDataFormat', () => {
    it('should convert JSON to YAML', () => {
      const input = '{"name": "John", "age": 30}';
      const result = convertDataFormat(input, 'yaml');
      expect(result).toContain('name: John');
      expect(result).toContain('age: 30');
    });

    it('should convert YAML to JSON', () => {
      const input = 'name: John\nage: 30';
      const result = convertDataFormat(input, 'json');
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"age": 30');
    });

    it('should convert CSV to JSON', () => {
      const input = 'name,age\nJohn,30\nJane,25';
      const result = convertDataFormat(input, 'json');
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"age": "30"');
    });

    it('should convert query string to JSON', () => {
      const input = 'name=John&age=30&city=NYC';
      const result = convertDataFormat(input, 'json');
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"age": "30"');
      expect(result).toContain('"city": "NYC"');
    });

    it('should convert JSON to XML', () => {
      const input = '{"name": "John", "age": 30}';
      const result = convertDataFormat(input, 'xml');
      expect(result).toContain('<name>John</name>');
      expect(result).toContain('<age>30</age>');
    });

    it('should handle complex nested objects', () => {
      const input =
        '{"user": {"name": "John", "profile": {"age": 30, "city": "NYC"}}}';
      const result = convertDataFormat(input, 'yaml');
      expect(result).toContain('user:');
      expect(result).toContain('name: John');
    });

    it('should handle arrays', () => {
      const input = '[{"name": "John"}, {"name": "Jane"}]';
      const result = convertDataFormat(input, 'yaml');
      expect(result).toContain('- name: John');
      expect(result).toContain('- name: Jane');
    });

    it('should throw error for unsupported format', () => {
      const input = '{"name": "John"}';
      expect(() => convertDataFormat(input, 'unsupported')).toThrow();
    });

    it('should throw error for invalid input', () => {
      expect(() => convertDataFormat('', 'json')).toThrow(
        'Unable to detect input format'
      );
    });
  });

  describe('examples', () => {
    it('should have valid example data', () => {
      expect(dataConverterExamples.json).toBeDefined();
      expect(dataConverterExamples.yaml).toBeDefined();
      expect(dataConverterExamples.csv).toBeDefined();
      expect(dataConverterExamples.query).toBeDefined();
    });

    it('should have input and output for each example', () => {
      for (const example of Object.values(dataConverterExamples)) {
        expect(example.input).toBeDefined();
        expect(example.output).toBeDefined();
        expect(example.description).toBeDefined();
      }
    });
  });
});
