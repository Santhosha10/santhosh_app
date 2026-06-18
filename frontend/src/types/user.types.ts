export interface User {
  id: Int16Array;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}
