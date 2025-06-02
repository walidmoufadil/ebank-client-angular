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
    userId?: string | null;
}

export interface TransactionHistory {
    transactions: Transaction[];
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalItems: number;
}
