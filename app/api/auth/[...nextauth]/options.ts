// app/api/auth/[...nextauth]/options.ts
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Example: hardcoded admin login
        if (
          credentials?.email === "admin@swapnaija.com.ng" &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", email: credentials.email }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async session({ session, token }) {
      // Attach user email (so we can check in layout)
      if (session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
}
