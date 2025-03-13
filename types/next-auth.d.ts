import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * セッションに含まれるユーザー情報の型を拡張
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  
  /**
   * ユーザー型を拡張
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
