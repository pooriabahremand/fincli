# FinCLI - Your Personal Finance Manager

FinCLI is a self-contained command-line interface (CLI) application designed to help you manage your monthly finances. Built with Node.js and TypeScript, it provides functionalities to create new accounting records, edit past ones, and understand expense prioritization criteria.

## Features

- **Interactive Welcome Screen**: Guides you through available actions.
- **Create New Accounting**: Helps you record your monthly budget and expenses, categorizing them by priority.
- **Dynamic Expense Input**: Asks about pre-defined expenses and allows adding new ones on the fly.
- **Budget Allocation**: Automatically allocates your budget into Investments, Savings, and Daily Expenses based on predefined percentages.
- **Report Generation**: Saves a detailed plain-text report of your monthly accounting.
- **Edit Past Accountings**: Allows you to view and modify previously generated reports.
- **Expense Criteria Explanation**: Provides clear definitions for expense priorities (Critical/Essential vs. Discretionary).

## Technical Details

- **Language**: TypeScript 5+
- **Runtime**: Node.js
- **Module System**: ES2022 with `moduleResolution: node16`
- **Interactive Prompts**: Powered by `@inquirer/prompts`.
- **Data Persistence**: Uses Node.js built-in `fs/promises` for file operations (no external databases).
- **Code Structure**: Organized into clear modules under `src/` (e.g., `cli.ts`, `expenseService.ts`, `reportService.ts`, `budgetCalculator.ts`, `types.ts`).
- **Linting**: Configured with ESLint for code quality and consistency.
- **Documentation**: Includes JSDoc comments for better code understanding.

## Installation and Usage

To run FinCLI, ensure you have Node.js installed on your system.

1.  **Clone the repository (or extract the project files):**

    ```bash
    git clone <repository-url>
    cd fincli
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the application:**

    ```bash
    npm start
    ```

    This will start the interactive CLI. Follow the prompts to manage your finances.

4.  **Build the project (optional):**

    ```bash
    npm run build
    ```

    This compiles the TypeScript code into JavaScript in the `dist/` directory.

5.  **Run Linting (optional):**

    ```bash
    npm run lint
    ```

## Project Structure

```
fincli/
├── src/
│   ├── cli.ts
│   ├── expenseService.ts
│   ├── reportService.ts
│   ├── budgetCalculator.ts
│   └── types.ts
├── reports/ (generated reports will be saved here)
├── expenses.json (initial expense data)
├── package.json
├── tsconfig.json
├── .eslintrc.json
└── README.md
```

## Example Run-through

Here's a sample interaction with FinCLI:

```
🏦 Welcome to FinCLI - Your Personal Finance Manager

? What would you like to do? (Use arrow keys)
❯ Create a new accounting
  Edit past accountings
  Watch the criteria

📊 Creating New Accounting

? What is your total budget for this month? 5000
Budget set to: 5,000,000 tomans

? Do you have house rent this month? Yes
? How much is it? 1000
? Do you have loan installment this month? Yes
? How much is it? 500
? Do you have war equipment this month? No
? Do you have gpt this month? Yes
? How much is it? 100
? Do you have tapsi installment this month? No
? Do you have house charge this month? Yes
? How much is it? 200
? Do you have mobile rent this month? Yes
? How much is it? 50
? Do you have internet fee this month? Yes
? How much is it? 30
? Do you have household expenses this month? Yes
? How much is it? 300
? Do you have a new expense to add? Yes
? What is the name of the expense? New Gadget
? What is the priority (1-5)? 5
? Enter tags (comma-separated): tech, fun
? How much is it? 200
Added new expense: New Gadget

? Do you have a new expense to add? No
? What should we name the output file? july-2025-accounting
Report saved to: ./reports/july-2025-accounting.txt

✅ Accounting completed successfully!
```

**Resulting `reports/july-2025-accounting.txt`:**

```
Monthly Accounting – july-2025-accounting
Total budget: 5,000,000 tomans

Priority 1 & 2 (Critical / Essential)
-------------------------------------
• house rent – 1,000,000
• loan installment – 500,000
• house charge – 200,000
• mobile rent – 50,000
• internet fee – 30,000
• household expenses – 300,000

Priority 3–5 (Postponable / Comfort / Luxury)
---------------------------------------------
• gpt – 100,000
• New Gadget – 200,000

Allocation Summary
------------------
Investments (30%): 876,000
Savings      (20%): 584,000
Daily use    (50%): 1,460,000  (after other expenses → 1,160,000)
```

## Architecture Overview

FinCLI follows a modular architecture, separating concerns into distinct services. The `cli.ts` acts as the main entry point, handling user interactions and orchestrating calls to other services. `expenseService.ts` manages loading and saving expense definitions. `reportService.ts` is responsible for generating, listing, reading, and updating accounting reports. `budgetCalculator.ts` encapsulates the logic for allocating the budget based on defined rules. Common interfaces and types are defined in `types.ts` to ensure strong typing and maintainability across the application.

