import { type VietQRData } from '@/domain/vietqr/service';

export class VietQRDataBuilder {
  private data: VietQRData = {
    bankBin: '970415', // VietinBank
    accountNumber: '113366668888',
    amount: '0',
    description: '',
  };

  withBank(bin: string): this {
    this.data.bankBin = bin;
    return this;
  }

  withAccount(account: string): this {
    this.data.accountNumber = account;
    return this;
  }

  withAmount(amount: number): this {
    this.data.amount = String(amount);
    return this;
  }

  withMessage(msg: string): this {
    this.data.description = msg;
    return this;
  }

  build(): VietQRData {
    return { ...this.data };
  }
}
