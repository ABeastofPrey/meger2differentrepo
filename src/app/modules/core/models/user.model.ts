export interface User {
  user: {
    username: string;
    fullName: string;
    permission: number;
    license: boolean;
  };
  token: string;
}
