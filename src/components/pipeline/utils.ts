
export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

export const getDaysInStage = (dateActivite: string) => {
  const today = new Date();
  const activityDate = new Date(dateActivite);
  const diffTime = Math.abs(today.getTime() - activityDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
