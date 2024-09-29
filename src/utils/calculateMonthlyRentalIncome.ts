export const calculateMonthlyRentalIncome = (weeklyRental: number): number => {
  const calc = (weeklyRental * 52) / 12;
  return parseFloat(calc.toFixed(2));
};
