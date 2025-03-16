import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";

// 環境変数のデフォルト値（開発・デモ用）
const googleClientId = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      // セッションにユーザーIDを追加
      if (session?.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // 初めてのサインイン時にユーザー情報をトークンに設定
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
