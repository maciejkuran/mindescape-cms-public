import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDb from '@/utils/dbConnect';
import bcrypt from 'bcrypt';
import { checker } from '@/rateLimitedMiddleware';
const get_ip = require('ipware')().get_ip;

const rateLimiter = {};

export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials, req) {
        const { email, password } = credentials;
        //I used the library to retreive user ip as req object for some reason doesn't contain any properties from which I can retreive ip.
        const ip = get_ip(req).clientIp;
        const rateLimitOk = checker(ip, rateLimiter);

        if (!rateLimitOk) {
          throw new Error('Blocked. Too Many Requests. Make another request after 1 minute.');
        }

        if (email === '' || !email.includes('.') || !email.includes('@')) {
          throw new Error('Invalid email address.');
        }

        if (!password) {
          throw new Error('Empty password input.');
        }

        let client;
        try {
          client = await connectDb();
        } catch (error) {
          throw new Error('Connecting to the database failed.');
        }

        const database = client.db('mindescape');
        const users = database.collection('users');

        const user = await users.find({ email: email }).toArray();

        if (!user[0]) {
          client.close();
          throw new Error('No user found');
        }

        //Validate if hashed password matches input password
        const hashedPassword = user[0].password; //hashed password
        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
          client.close();
          throw new Error('Invalid user password.');
        }
        client.close();
        return user[0];
      },
    }),
  ],
  //Callback cycle: authorize --> jwt --> session
  //jwt callback(cb) accepts the user object that authorize cb returns. By default jwt retuns the token and things return from there is then available in the token object of session cb.
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      if (!session) return;

      const sessionExpiration = session.expires;

      return { sessionExpiration, user: token };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
