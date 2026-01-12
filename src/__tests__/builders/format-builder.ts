import { formatJson } from '@/domain/format/json';
import { formatSql } from '@/domain/format/sql';

export class SqlFormatterBuilder {
  private sql = 'SELECT * FROM users';
  private options = {
    language: 'sql' as const,
    keywordCase: 'upper' as const,
    tabWidth: 2,
    linesBetweenQueries: 1,
  };

  withSql(sql: string): this {
    this.sql = sql;
    return this;
  }

  format(): string {
    // We invoke the domain service directly here for simplicity in test
    // Or just return the config?
    // Let's return the formatted result to make usage supersimple:
    // expect(new SqlBuilder().withSql('select 1').build()).toBe(...)
    return formatSql(this.sql, this.options);
  }

  // Or better, return the inputs so the test calls the service?
  // User asked for "easy write test".
  // Maybe: new SqlFormatterBuilder().withSql('...').getParams()
}

export class JsonFormatterBuilder {
  private json = '{"a":1}';
  private space: '2' | '4' | 'tab' | '0' = '2';
  private sort = false;

  withJson(json: string): this {
    this.json = json;
    return this;
  }

  withSpace(space: number): this {
    this.space = String(space) as '2' | '4' | '0';
    return this;
  }

  withSort(sort: boolean): this {
    this.sort = sort;
    return this;
  }

  format(): string {
    return formatJson(this.json, this.space, this.sort);
  }
}
