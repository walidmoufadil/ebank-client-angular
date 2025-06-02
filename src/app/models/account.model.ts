import { Customer } from './customer.model';

export type AccountStatus = 'CREATED' | 'ACTIVATED' | 'SUSPENDED' | 'BLOCKED';
export type AccountType = 'CurrentAccount' | 'SavingAccount';

export interface BaseAccount {
    type: AccountType;
    id: string;
    balance: number;
    createdAt: string;
    status: AccountStatus;
    customerDTO: Customer;
}

export interface CurrentAccount extends BaseAccount {
    type: 'CurrentAccount';
    overDraft: number;
}

export interface SavingAccount extends BaseAccount {
    type: 'SavingAccount';
    interestRate: number;
}

export type BankAccount = CurrentAccount | SavingAccount;

export interface AccountRequest {
    initialBalance: number;
    customerId: number;
    type: 'current' | 'saving';
    overDraft?: number;
    interestRate?: number;
}
