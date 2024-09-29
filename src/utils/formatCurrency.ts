export const formatCurrency = (
  amount: number,
  locale: string = "en-AU",
  currency: string = "AUD"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};
