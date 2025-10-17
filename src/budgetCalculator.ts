import { ExpenseWithAmount, BudgetAllocation } from "./types";
import { BudgetAllocationConfig } from "./configService";

/**
 * Service for budget allocation calculations
 */
export class BudgetCalculator {
  /**
   * Calculate budget allocation based on expenses and total budget
   * @param totalBudget Total monthly budget
   * @param expenses Array of expenses with amounts
   * @param allocationConfig Budget allocation configuration (optional, uses default if not provided)
   * @returns BudgetAllocation object
   */
  calculateAllocation(
    totalBudget: number,
    expenses: ExpenseWithAmount[],
    allocationConfig?: BudgetAllocationConfig
  ): BudgetAllocation {
    // Use provided config or default values
    const config = allocationConfig || {
      investments: 30,
      savings: 20,
      dailyExpenses: 50
    };

    // Convert percentages to decimals
    const investmentRate = config.investments / 100;
    const savingsRate = config.savings / 100;
    const dailyExpensesRate = config.dailyExpenses / 100;

    // Subtract priority 1 & 2 expenses from budget
    const criticalExpenses = expenses.filter((e) => e.priority <= 2);
    const criticalTotal = criticalExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    const remainingAfterCritical = totalBudget - criticalTotal;

    // Calculate allocations from remaining budget using config
    const investments = Math.floor(remainingAfterCritical * investmentRate);
    const savings = Math.floor(remainingAfterCritical * savingsRate);
    const dailyExpenses = Math.floor(remainingAfterCritical * dailyExpensesRate);

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
