export const calculateMonthlySalaryWithTax = (yearlySalary: number): number => {
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
