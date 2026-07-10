export type User = {
  id: string;
  nickname: string;
  avatarUrl?: string;
  avatarColor?: string;
};

export type Store = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  mealTimes: string[];
  rating: number;
  avgPrice: number;
  orderCount: number;
  description?: string;
  coverUrl?: string;
  createdBy?: User;
  updatedBy?: User;
};

export type Dish = {
  id: string;
  storeId: string;
  name: string;
  price: number;
  rating: number;
  disliked: boolean;
  coverUrl?: string;
};

export type OrderItemInput = {
  name: string;
  price: number;
  rating?: number;
  disliked?: boolean;
  note?: string;
};

export type Order = {
  id: string;
  user: User;
  store: Store;
  orderTime: string;
  mealTime: string;
  category: string;
  total: number;
  rating: number;
  disliked: boolean;
  note?: string;
  dishes: OrderItemInput[];
};

export type Review = {
  id: string;
  user: User;
  targetType: "order" | "dish" | "store";
  targetName: string;
  rating: number;
  disliked: boolean;
  content: string;
  createdAt: string;
  orderId?: string;
};

export type RandomPick = {
  id: string;
  store: Store;
  user: User;
  category: string;
  mealTime: string;
  rating: number;
  storeType: string;
  createdAt: string;
};
