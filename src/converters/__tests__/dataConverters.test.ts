import {
  detectInputFormat,
  convertFromJson,
  convertFromYaml,
  convertFromCsv,
  convertFromQueryString,
  convertDataFormat,
  dataConverterExamples
} from '../dataConverters';

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

    it('should detect XML format', () => {
      const input = '<person><name>John</name><age>30</age></person>';
      expect(detectInputFormat(input)).toBe('xml');
    });

    it('should detect CSV format', () => {
      const input = 'name,age\nJohn,30\nJane,25';
      expect(detectInputFormat(input)).toBe('csv');
    });

    it('should detect query string format', () => {
      const input = 'name=John&age=30&city=NY';
      expect(detectInputFormat(input)).toBe('query');
    });

    it('should return yaml for unrecognized format', () => {
      const input = 'random text';
      expect(detectInputFormat(input)).toBe('yaml');
    });
  });

  describe('convertFromJson', () => {
    it('should convert JSON to YAML', () => {
      const input = '{"name": "John", "age": 30}';
      const expected = 'name: John\nage: 30\n';
      expect(convertFromJson(input, 'yaml')).toBe(expected);
    });

    it('should convert JSON to minified JSON', () => {
      const input = '{"name": "John", "age": 30}';
      const expected = '{"name":"John","age":30}';
      expect(convertFromJson(input, 'minified')).toBe(expected);
    });

    it('should convert JSON to pretty JSON', () => {
      const input = '{"name":"John","age":30}';
      const expected = '{\n  "name": "John",\n  "age": 30\n}';
      expect(convertFromJson(input, 'pretty')).toBe(expected);
    });

    it('should convert JSON to query string', () => {
      const input = '{"name": "John", "age": 30}';
      const expected = 'name=John&age=30';
      expect(convertFromJson(input, 'query')).toBe(expected);
    });
  });

  describe('convertFromYaml', () => {
    it('should convert YAML to JSON', () => {
      const input = 'name: John\nage: 30';
      const expected = '{\n  "name": "John",\n  "age": 30\n}';
      expect(convertFromYaml(input, 'json')).toBe(expected);
    });

    it('should convert YAML to query string', () => {
      const input = 'name: John\nage: 30';
      const expected = 'name=John&age=30';
      expect(convertFromYaml(input, 'query')).toBe(expected);
    });
  });

  describe('convertFromCsv', () => {
    it('should convert CSV to JSON', () => {
      const input = 'name,age\nJohn,30\nJane,25';
      const expected = '[\n  {\n    "name": "John",\n    "age": "30"\n  },\n  {\n    "name": "Jane",\n    "age": "25"\n  }\n]';
      expect(convertFromCsv(input, 'json')).toBe(expected);
    });

    it('should convert CSV to YAML', () => {
      const input = 'name,age\nJohn,30\nJane,25';
      const expected = '- name: John\n  age: "30"\n- name: Jane\n  age: "25"\n';
      expect(convertFromCsv(input, 'yaml')).toBe(expected);
    });
  });

  describe('convertFromQueryString', () => {
    it('should convert query string to JSON', () => {
      const input = 'name=John&age=30&city=NY';
      const expected = '{\n  "name": "John",\n  "age": "30",\n  "city": "NY"\n}';
      expect(convertFromQueryString(input, 'json')).toBe(expected);
    });

    it('should convert query string to YAML', () => {
      const input = 'name=John&age=30&city=NY';
      const expected = 'name: John\nage: "30"\ncity: NY\n';
      expect(convertFromQueryString(input, 'yaml')).toBe(expected);
    });
  });

  describe('convertDataFormat', () => {
    it('should convert JSON to YAML', async () => {
      const input = '{"name": "John", "age": 30}';
      const expected = 'name: John\nage: 30\n';
      const result = await convertDataFormat(input, 'yaml');
      expect(result).toBe(expected);
    });

    it('should convert YAML to JSON', async () => {
      const input = 'name: John\nage: 30';
      const expected = '{\n  "name": "John",\n  "age": 30\n}';
      const result = await convertDataFormat(input, 'json');
      expect(result).toBe(expected);
    });

    it('should convert CSV to JSON', async () => {
      const input = 'name,age\nJohn,30\nJane,25';
      const result = await convertDataFormat(input, 'json');
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"age": "30"');
    });

    it('should convert query string to JSON', async () => {
      const input = 'name=John&age=30&city=NY';
      const result = await convertDataFormat(input, 'json');
      expect(result).toContain('"name": "John"');
      expect(result).toContain('"age": "30"');
      expect(result).toContain('"city": "NY"');
    });

    it('should handle unknown format gracefully', async () => {
      const input = 'random text';
      const result = await convertDataFormat(input, 'json');
      expect(result).toBe('"random text"');
    });
  });

  describe('examples', () => {
    it('should have valid JSON to YAML example', () => {
      const example = dataConverterExamples.jsonToYaml;
      expect(example.input).toBe('{"name": "John", "age": 30, "city": "New York"}');
      expect(example.output).toContain('name: John');
      expect(example.description).toBe('Convert JSON to YAML format');
    });

    it('should have valid YAML to JSON example', () => {
      const example = dataConverterExamples.yamlToJson;
      expect(example.input).toContain('name: John');
      expect(example.output).toContain('"name": "John"');
      expect(example.description).toBe('Convert YAML to JSON format');
    });

    it('should have valid CSV to JSON example', () => {
      const example = dataConverterExamples.csvToJson;
      expect(example.input).toContain('name,age,city');
      expect(example.output).toContain('"name": "John"');
      expect(example.description).toBe('Convert CSV to JSON format');
    });
  });
});