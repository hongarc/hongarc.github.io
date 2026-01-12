import { type AlgorithmType } from '@/domain/crypto/hash';
import { type PasswordOptions } from '@/domain/crypto/password';

export class PasswordOptionsBuilder {
  private length = 12;
  private options: PasswordOptions = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  };

  withLength(length: number): this {
    this.length = length;
    return this;
  }

  withoutUppercase(): this {
    this.options.uppercase = false;
    return this;
  }

  withoutSymbols(): this {
    this.options.symbols = false;
    return this;
  }

  onlyNumbers(): this {
    this.options = {
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
    };
    return this;
  }

  build(): PasswordOptions {
    return { ...this.options };
  }

  getLength(): number {
    return this.length;
  }
}

export class HashOptionsBuilder {
  private algorithm: AlgorithmType = 'SHA-256';
  private input = 'hello world';

  withAlgorithm(algo: AlgorithmType): this {
    this.algorithm = algo;
    return this;
  }

  withInput(input: string): this {
    this.input = input;
    return this;
  }

  build() {
    return {
      input: this.input,
      algorithm: this.algorithm,
    };
  }
}
