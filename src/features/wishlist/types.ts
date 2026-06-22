export type WishListMetricsData = {
  totalItems: {
    value: number;
    percentageChangeThisMonth?: number | null;
    currentMonth?: number | null;
    previousMonth?: number | null;
  };
  activeWishlists: {
    value: number;
    newThisWeek?: number | null;
  };
  totalParticipants: {
    value: number;
  };
  reservedItems: {
    value: number;
  };
};

export type WishListMetricsResponse = {
  code: number;
  message: string;
  data: WishListMetricsData;
};
