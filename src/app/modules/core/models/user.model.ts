export enum PermissionCode {
  Admin = 0,
  Programmer = 1,
  Operator = 2,
  Viewer = 3,
  Super = 99,
}
export interface User {
  user: {
    username: string;
    fullName: string;
    permission: PermissionCode;
    license: boolean;
  };
  token: string;
}
