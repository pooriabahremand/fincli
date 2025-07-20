import { promises as fs } from 'fs';
import { Expense } from './types.js';

/**
 * Service for managing expense data
 */
export class ExpenseService {
  private readonly expensesFilePath = './expenses.json';

  /**
   * Load expenses from JSON file and sort by priority (ascending)
   * @returns Promise<Expense[]> Array of expenses sorted by priority
   */
  async loadExpenses(): Promise<Expense[]> {
    try {
      const data = await fs.readFile(this.expensesFilePath, 'utf-8');
      const expenses: Expense[] = JSON.parse(data);
      return expenses.sort((a, b) => a.priority - b.priority);
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  }

  /**
   * Save expenses to JSON file
   * @param expenses Array of expenses to save
   */
  async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      const data = JSON.stringify(expenses, null, 2);
      await fs.writeFile(this.expensesFilePath, data, 'utf-8');
    } catch (error) {
      console.error('Error saving expenses:', error);
      throw error;
    }
  }

  /**
   * Add a new expense to the list and persist it
   * @param expenses Current expenses array
   * @param newExpense New expense to add
   * @returns Updated expenses array
   */
  async addExpense(expenses: Expense[], newExpense: Expense): Promise<Expense[]> {
    const updatedExpenses = [...expenses, newExpense];
    await this.saveExpenses(updatedExpenses);
    return updatedExpenses;
  }
}

