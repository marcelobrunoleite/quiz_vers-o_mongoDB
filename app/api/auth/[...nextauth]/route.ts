import NextAuth from 'next-auth';
import { PrismaClient } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';

const prisma = new PrismaClient();

interface ExtendedToken extends JWT {
  role?: string;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são necessários');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Senha incorreta');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedToken> {
      if (user) {
        token.role = user.role;
      }
      return token as ExtendedToken;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.role = (token as ExtendedToken).role || 'user';
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST }; 