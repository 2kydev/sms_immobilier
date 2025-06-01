
export const formatCurrencyFCFA = (amount: number) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M `;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k `;
  }
  return `${amount.toLocaleString('fr-FR')} `;
};

export const getRevenueChange = (currentRevenue: number, lastMonthRevenue: number) => {
  if (lastMonthRevenue === 0) return { percentage: 0, isPositive: true };
  const change = (currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100;
  return {
    percentage: Math.abs(change),
    isPositive: change >= 0
  };
};
