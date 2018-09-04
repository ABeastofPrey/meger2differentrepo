export interface User {
  user: {
    username: string;
    fullName: string;
    permission: number;
  };
  token: string;
}