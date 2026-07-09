import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mode: { label: "Mode", type: "text" }, // "signin" | "signup"
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;
        const mode = credentials.mode as string;

        if (mode === "signup") {
          const name = credentials.name as string;
          if (!name || !password) return null;

          const existing = await prisma.user.findUnique({ where: { email } });
          if (existing) throw new Error("Email already registered");

          const hashed = await bcrypt.hash(password, 10);
          const user = await prisma.user.create({
            data: { email, name, password: hashed } as any,
          });
          return { id: user.id, email: user.email!, name: user.name };
        }

        // signin
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("No account with that email");

        const userWithPw = user as any;
        if (!userWithPw.password) throw new Error("Invalid credentials");
        const valid = await bcrypt.compare(password, userWithPw.password);
        if (!valid) throw new Error("Invalid password");

        return { id: user.id, email: user.email!, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
