export type User = {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};
