#!/usr/bin/env node

import { select, input, confirm } from "@inquirer/prompts";
import { ExpenseService } from "./expenseService";
import { ReportService } from "./reportService";
import { BudgetCalculator } from "./budgetCalculator";
import { Expense, ExpenseWithAmount, MonthlyAccounting } from "./types";

/**
 * Main CLI application class for FinCLI
 */
class FinCLI {
  private expenseService = new ExpenseService();
  private reportService = new ReportService();
  private budgetCalculator = new BudgetCalculator();

  /**
   * Start the application and show welcome screen
   */
  async start(): Promise<void> {
    console.log("\n🏦 Welcome to FinCLI - Your Personal Finance Manager\n");

    const action = await select({
      message: "What would you like to do?",
      choices: [
        { name: "Create a new accounting", value: "create" },
        { name: "Edit past accountings", value: "edit" },
        { name: "Watch the criteria", value: "criteria" },
      ],
    });

    switch (action) {
      case "create":
        await this.createNewAccounting();
        break;
      case "edit":
        await this.editPastAccountings();
        break;
      case "criteria":
        await this.showCriteria();
        break;
    }
  }

  /**
   * Create a new monthly accounting
   */
  private async createNewAccounting(): Promise<void> {
    console.log("\n📊 Creating New Accounting\n");

    // Get total budget
    const budgetInput = await input({
      message: "What is your total budget for this month?",
      validate: (value) => {
        const num = parseInt(value);
        return !isNaN(num) && num > 0
          ? true
          : "Please enter a valid positive number";
      },
    });

    const totalBudget = parseInt(budgetInput) * 1000; // Convert to tomans
    console.log(`Budget set to: ${totalBudget.toLocaleString()} tomans\n`);

    // Load and process expenses
    let expenses = await this.expenseService.loadExpenses();
    const expensesWithAmounts: ExpenseWithAmount[] = [];

    // Ask about each existing expense
    for (const expense of expenses) {
      const hasExpense = await confirm({
        message: `Do you have ${expense.name} this month?`,
      });

      if (hasExpense) {
        const amountInput = await input({
          message: `How much is it?`,
          validate: (value) => {
            const num = parseInt(value);
            return !isNaN(num) && num >= 0
              ? true
              : "Please enter a valid number";
          },
        });

        const amount = parseInt(amountInput) * 1000; // Convert to tomans
        expensesWithAmounts.push({ ...expense, amount });
      }
    }

    // Ask for new expenses
    let addingNewExpenses = true;
    while (addingNewExpenses) {
      const addNew = await confirm({
        message: "Do you have a new expense to add?",
      });

      if (addNew) {
        const name = await input({
          message: "What is the name of the expense?",
        });

        const priorityInput = await input({
          message: "What is the priority (1-5)?",
          validate: (value) => {
            const num = parseInt(value);
            return !isNaN(num) && num >= 1 && num <= 5
              ? true
              : "Please enter a number between 1 and 5";
          },
        });

        const tagsInput = await input({
          message: "Enter tags (comma-separated):",
        });

        const amountInput = await input({
          message: "How much is it?",
          validate: (value) => {
            const num = parseInt(value);
            return !isNaN(num) && num >= 0
              ? true
              : "Please enter a valid number";
          },
        });

        const priority = parseInt(priorityInput);
        const tags = tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        const amount = parseInt(amountInput) * 1000; // Convert to tomans

        const newExpense: Expense = { name, priority, tags };
        expenses = await this.expenseService.addExpense(expenses, newExpense);
        expensesWithAmounts.push({ ...newExpense, amount });

        console.log(`Added new expense: ${name}\n`);
      } else {
        addingNewExpenses = false;
      }
    }

    // Calculate budget allocation
    const allocation = this.budgetCalculator.calculateAllocation(
      totalBudget,
      expensesWithAmounts
    );

    // Get output filename base (version will be appended automatically)
    const filenameBase = await input({
      message: "What should we name the output file? (base, without version)",
      validate: (value) =>
        value.trim().length > 0 ? true : "Please enter a filename",
    });
    const versionedName = await this.reportService.nextVersionName(
      filenameBase.trim()
    );

    // Create and save report
    const accounting: MonthlyAccounting = {
      filename: versionedName,
      totalBudget,
      expenses: expensesWithAmounts,
      allocation,
    };

    await this.reportService.generateReport(accounting);
    console.log(`\n✅ Accounting completed successfully as: ${versionedName} (saved in ./reports/reports and ./reports/json)\n`);
  }

  /**
   * Edit past accounting reports
   */
  private async editPastAccountings(): Promise<void> {
    console.log("\n📝 Edit Past Accountings\n");

    const reports = await this.reportService.listReports();

    if (reports.length === 0) {
      console.log("No past accountings found.\n");
      return;
    }

    const selectedReport = await select({
      message: "Select a report to edit:",
      choices: reports.map((report) => ({ name: report, value: report })),
    });

    // Load structured accounting (JSON if exists, else parse from text)
    let accounting = await this.reportService.loadAccounting(selectedReport);

    // Recompute allocation to ensure consistency when loaded from legacy text
    accounting.allocation = this.budgetCalculator.calculateAllocation(
      accounting.totalBudget,
      accounting.expenses
    );

    // Allow changing total budget first
    const changeBudget = await confirm({
      message: `Do you want to change the total budget? (current: ${accounting.totalBudget.toLocaleString()} tomans)`,
    });
    if (changeBudget) {
      const newBudgetInput = await input({
        message: "Enter new total budget (in thousands of tomans):",
        default: String(Math.floor(accounting.totalBudget / 1000)),
        validate: (value) => {
          const num = parseInt(value);
          return !isNaN(num) && num > 0
            ? true
            : "Please enter a valid positive number";
        },
      });
      accounting.totalBudget = parseInt(newBudgetInput) * 1000;
    }

    // Iterate current expenses and allow edits
    for (let i = 0; i < accounting.expenses.length; i++) {
      const exp = accounting.expenses[i];
      const doEdit = await confirm({
        message: `Edit expense "${exp.name}" (current: ${exp.amount.toLocaleString()} tomans)?`,
      });
      if (!doEdit) continue;

      const whatToEdit = await select({
        message: "What would you like to change?",
        choices: [
          { name: "Name", value: "name" },
          { name: "Amount", value: "amount" },
          { name: "Both", value: "both" },
          { name: "Skip", value: "skip" },
        ],
      });

      if (whatToEdit === "name" || whatToEdit === "both") {
        const newName = await input({
          message: `New name for "${exp.name}":`,
          default: exp.name,
        });
        exp.name = newName.trim();
      }

      if (whatToEdit === "amount" || whatToEdit === "both") {
        const newAmountInput = await input({
          message: `New amount for "${exp.name}" (in thousands):`,
          default: String(Math.floor(exp.amount / 1000)),
          validate: (value) => {
            const num = parseInt(value);
            return !isNaN(num) && num >= 0 ? true : "Enter a valid number";
          },
        });
        exp.amount = parseInt(newAmountInput) * 1000;
      }

      accounting.expenses[i] = exp;
    }

    // Allow adding new expenses
    let adding = true;
    while (adding) {
      const addNew = await confirm({
        message: "Do you want to add a new expense?",
      });
      if (!addNew) break;

      const name = await input({ message: "Expense name:" });
      const priorityInput = await input({
        message: "Priority (1-5):",
        validate: (value) => {
          const num = parseInt(value);
          return !isNaN(num) && num >= 1 && num <= 5
            ? true
            : "Enter a number between 1 and 5";
        },
      });
      const amountInput = await input({
        message: "Amount (in thousands):",
        validate: (value) => {
          const num = parseInt(value);
          return !isNaN(num) && num >= 0 ? true : "Enter a valid number";
        },
      });

      accounting.expenses.push({
        name: name.trim(),
        priority: parseInt(priorityInput),
        tags: [],
        amount: parseInt(amountInput) * 1000,
      });
    }

    // Recompute allocation after edits
    accounting.allocation = this.budgetCalculator.calculateAllocation(
      accounting.totalBudget,
      accounting.expenses
    );

    // Bump version for edited accounting and save as new version
    accounting.filename = await this.reportService.bumpVersionName(
      accounting.filename
    );
    await this.reportService.saveAccounting(accounting);
    console.log(`\n✅ Report updated successfully as: ${accounting.filename} (new version)\n`);
  }

  /**
   * Display expense priority criteria
   */
  private async showCriteria(): Promise<void> {
    console.log("\n📋 Expense Priority Criteria\n");

    console.log("Priorities 1 & 2 – Emergency & Essential");
    console.log("---------------------------------------");
    console.log(
      "These costs are non‑negotiable. Failing to pay them jeopardises your life, health,"
    );
    console.log(
      "or legal standing (e.g., rent, loan instalments, critical healthcare, staple food,"
    );
    console.log(
      "core infrastructure like internet or AI services required for work).\n"
    );

    console.log("Priorities 3 to 5 – Discretionary");
    console.log("---------------------------------");
    console.log(
      "While useful or pleasant, these expenditures can be postponed, scaled down,"
    );
    console.log(
      "or eliminated without creating immediate risk. Handle them only after securing"
    );
    console.log(
      "survival‑critical items and strategic financial goals (investment and savings).\n"
    );
  }
}

/**
 * Application entry point
 */
async function main(): Promise<void> {
  try {
    const app = new FinCLI();
    await app.start();
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

// Run the application
main();
