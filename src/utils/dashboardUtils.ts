
export const formatCurrencyFCFA = (amount: number) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M FCFA`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k FCFA`;
  }
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

export const getRevenueChange = (currentRevenue: number, lastMonthRevenue: number) => {
  if (lastMonthRevenue === 0) return { percentage: 0, isPositive: true };
  const change = (currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100;
  return {
    percentage: Math.abs(change),
    isPositive: change >= 0
  };
};
