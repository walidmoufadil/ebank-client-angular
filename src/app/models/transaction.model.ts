export type TransactionType = 'DEBIT' | 'CREDIT' | 'TRANSFER';

export interface Transaction {
    id?: string;
    type: TransactionType;
    amount: number;
    description?: string;
    sourceAccountId: string;
    destinationAccountId?: string;
    timestamp?: string;
    status?: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface TransactionHistory {
    transactions: Transaction[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
