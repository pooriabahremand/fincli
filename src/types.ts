/**
 * Expense interface representing a financial expense item
 */
export interface Expense {
  name: string;
  priority: number;
  tags: string[];
}

/**
 * Expense with amount for accounting calculations
 */
export interface ExpenseWithAmount extends Expense {
  amount: number;
}

/**
 * Budget allocation breakdown
 */
export interface BudgetAllocation {
  investments: number;
  savings: number;
  dailyExpenses: number;
  dailyExpensesRemaining: number;
}

/**
 * Monthly accounting data
 */
export interface MonthlyAccounting {
  filename: string;
  totalBudget: number;
  expenses: ExpenseWithAmount[];
  allocation: BudgetAllocation;
}

