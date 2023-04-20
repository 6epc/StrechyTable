
export interface User {
  name: string;
  surname?: string;
  email: string;
  phone: string;
}

export interface Users {
  users: User[];
}
