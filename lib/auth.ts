import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { loginSchema } from "@/lib/validators";
import { upsertOAuthUser, verifyUser } from "@/services/user-service";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await verifyUser(parsed.data.email, parsed.data.password);
        return user;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const googleUser = await upsertOAuthUser({
          email: user?.email ?? token.email ?? null,
          name: user?.name ?? token.name ?? null,
          image: user?.image ?? token.picture ?? null
        });

        if (googleUser) {
          token.id = googleUser.id;
          token.name = googleUser.name;
          token.email = googleUser.email;
          token.picture = googleUser.image ?? undefined;
          return token;
        }
      }

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image ?? undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.name = token.name ?? session.user.name ?? "";
        session.user.email = token.email ?? session.user.email ?? "";
        session.user.image = token.picture ?? session.user.image ?? null;
      }

      return session;
    }
  }
};
