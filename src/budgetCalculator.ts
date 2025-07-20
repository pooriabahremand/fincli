import { ExpenseWithAmount, BudgetAllocation } from "./types";

/**
 * Service for budget allocation calculations
 */
export class BudgetCalculator {
  /**
   * Calculate budget allocation based on expenses and total budget
   * @param totalBudget Total monthly budget
   * @param expenses Array of expenses with amounts
   * @returns BudgetAllocation object
   */
  calculateAllocation(
    totalBudget: number,
    expenses: ExpenseWithAmount[]
  ): BudgetAllocation {
    // Subtract priority 1 & 2 expenses from budget
    const criticalExpenses = expenses.filter((e) => e.priority <= 2);
    const criticalTotal = criticalExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    const remainingAfterCritical = totalBudget - criticalTotal;

    // Calculate allocations from remaining budget
    const investments = Math.floor(remainingAfterCritical * 0.3);
    const savings = Math.floor(remainingAfterCritical * 0.2);
    const dailyExpenses = Math.floor(remainingAfterCritical * 0.5);

    // Subtract priority 3-5 expenses from daily expenses
    const discretionaryExpenses = expenses.filter((e) => e.priority >= 3);
    const discretionaryTotal = discretionaryExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    const dailyExpensesRemaining = dailyExpenses - discretionaryTotal;

    return {
      investments,
      savings,
      dailyExpenses,
      dailyExpensesRemaining,
    };
  }
}
