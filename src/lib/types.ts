export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Accommodation' | 'Activities' | 'Other';
  date: Date;
};
