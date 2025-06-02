export type OperationType = 'DEBIT' | 'CREDIT';

export interface Operation {
  id: number;
  operationDate: string;
  amount: number;
  type: OperationType;
  description: string | null;
  userId: string | null;
}

export interface OperationHistory {
  operations: Operation[];
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}
