import "./App.css";
import { useForm } from "@tanstack/react-form";

const calculateMonthlySalaryWithTax = (yearlySalary: number): number => {
  if (yearlySalary < 0) {
    throw new Error("Yearly salary must be a non-negative value.");
  }

  // Tax brackets and rates for Australia (2023-2024)
  const taxBrackets: { threshold: number; rate: number }[] = [
    { threshold: 18200, rate: 0 }, // Tax-free threshold
    { threshold: 45000, rate: 0.19 }, // 19% for income over $18,200
    { threshold: 120000, rate: 0.325 }, // 32.5% for income over $45,000
    { threshold: 180000, rate: 0.37 }, // 37% for income over $120,000
    { threshold: Infinity, rate: 0.45 }, // 45% for income over $180,000
  ];

  let tax = 0;
  let previousThreshold = 0;

  for (const bracket of taxBrackets) {
    if (yearlySalary > bracket.threshold) {
      tax += (bracket.threshold - previousThreshold) * bracket.rate;
      previousThreshold = bracket.threshold;
    } else {
      tax += (yearlySalary - previousThreshold) * bracket.rate;
      break;
    }
  }

  const afterTaxSalary = yearlySalary - tax;
  const monthlySalary = afterTaxSalary / 12;

  return parseFloat(monthlySalary.toFixed(2));
};

const calculateMonthlyRentalIncome = (weeklyRental: number): number => {
  const calc = (weeklyRental * 52) / 12;
  return parseFloat(calc.toFixed(2));
};

const formatCurrency = (
  amount: number,
  locale: string = "en-AU",
  currency: string = "AUD"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

type Frequency =
  | "daily"
  | "weekly"
  | "fortnightly"
  | "monthly"
  | "quarterly"
  | "yearly";

const getMonthlyAmount = (amount: number, frequency: Frequency) => {
  switch (frequency) {
    case "daily":
      return amount * 30;
    case "weekly":
      return amount * 4;
    case "fortnightly":
      return amount * 2;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    default:
      throw new Error("Invalid frequency");
  }
};

const App = () => {
  const localStorageValues = JSON.parse(localStorage.getItem("fudget") ?? "{}");

  const form = useForm({
    defaultValues: {
      yearlySalary: (localStorageValues?.yearlySalary as string) || "0",
      weeklyRental: (localStorageValues?.weeklyRental as string) || "0",
      savingsTarget: (localStorageValues?.savingsTarget as string) || "0",
      expenses:
        (localStorageValues?.expenses as {
          name: string;
          amount: string;
          frequency: Frequency;
        }[]) || [],
    },
    onSubmit: async ({ value }) => {
      const monthlyRentalIncome = calculateMonthlyRentalIncome(
        parseFloat(value.weeklyRental)
      );

      const monthlySalaryIncome = calculateMonthlySalaryWithTax(
        parseFloat(value.yearlySalary)
      );

      const totalMonthlyIncome = monthlySalaryIncome + monthlyRentalIncome;

      const targetMonthlySavings =
        totalMonthlyIncome * (parseFloat(value.savingsTarget) / 100);

      const totalMonthlyExpenses = value.expenses.reduce(
        (total, expense) =>
          total +
          getMonthlyAmount(parseFloat(expense.amount), expense.frequency),
        0
      );

      window.localStorage.setItem(
        "fudget",
        JSON.stringify({
          ...value,
          monthlySalaryIncome,
          monthlyRentalIncome,
          totalMonthlyIncome,
          targetMonthlySavings,
          totalMonthlyExpenses,
        })
      );
    },
  });

  return (
    <>
      <h1>Fudget</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <section>
          <h2>Income</h2>
          <h3>Yearly base salary</h3>
          <form.Field
            name="yearlySalary"
            children={(field) => {
              return (
                <label>
                  Enter a salary
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                  />
                </label>
              );
            }}
          />

          <h3>Weekly rental income</h3>

          <form.Field
            name="weeklyRental"
            children={(field) => {
              return (
                <label>
                  Enter rent
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                  />
                </label>
              );
            }}
          />
        </section>

        <section>
          <h2>Savings target precentage</h2>
          <p>How much of your monthly income are you targetting to save?</p>
          <form.Field
            name="savingsTarget"
            children={(field) => {
              return (
                <label>
                  Enter percentage
                  <input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </label>
              );
            }}
          />
        </section>

        <section>
          <h2>Expenses</h2>
          <form.Field name="expenses" mode="array">
            {(field) => (
              <div key="expense=lis">
                {field.state.value.map((_, i: number) => {
                  return (
                    <ul>
                      <li>
                        <form.Field
                          key={`expense-name-${i}`}
                          name={`expenses[${i}].name`}
                        >
                          {(subField) => {
                            return (
                              <label>
                                Name
                                <input
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                />
                              </label>
                            );
                          }}
                        </form.Field>
                      </li>
                      <li>
                        <form.Field
                          key={`expense-amount-${i}`}
                          name={`expenses[${i}].amount`}
                        >
                          {(subField) => {
                            return (
                              <label>
                                Amount
                                <input
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                />
                              </label>
                            );
                          }}
                        </form.Field>
                      </li>

                      <li>
                        <form.Field
                          key={`expense-frequency-${i}`}
                          name={`expenses[${i}].frequency`}
                        >
                          {(subField) => {
                            return (
                              <>
                                <label htmlFor="frequency">Frequency</label>
                                <select
                                  id="frequency"
                                  value={subField.state.value}
                                  onChange={(e) =>
                                    subField.handleChange(
                                      e.target.value as Frequency
                                    )
                                  }
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="fortnightly">
                                    Fortnightly
                                  </option>
                                  <option value="monthly">Monthly</option>
                                  <option value="quarterly">Quarterly</option>
                                  <option value="yearly">Yearly</option>
                                </select>
                              </>
                            );
                          }}
                        </form.Field>
                      </li>
                    </ul>
                  );
                })}

                <button
                  key="add-expense"
                  onClick={() =>
                    field.pushValue({
                      name: "",
                      amount: "",
                      frequency: "monthly",
                    })
                  }
                  type="button"
                >
                  Add expense
                </button>
              </div>
            )}
          </form.Field>
        </section>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "..." : "Submit"}
            </button>
          )}
        />
      </form>

      <section>
        <h2>Calculations</h2>
        <h3>Savings</h3>
        <p>{formatCurrency(localStorageValues.targetMonthlySavings)}</p>

        <h3>Monthly spend available</h3>
        <p>
          {formatCurrency(
            localStorageValues.totalMonthlyIncome -
              localStorageValues.targetMonthlySavings -
              localStorageValues.totalMonthlyExpenses
          )}
        </p>
      </section>
    </>
  );
};

export default App;
