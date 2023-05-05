import '@/styles/globals.scss';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';

import Layout from '../components/Layout/Layout';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  const defaultHead = (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <title>Mindescape CMS Admin Panel</title>
      {/* Exclude the entire CMS from being INDEXED! */}
      <meta name="robots" content="noindex"></meta>
    </Head>
  );

  if (router.asPath === '/auth' || router.asPath.includes('password-recovery')) {
    return (
      <SessionProvider session={session}>
        {defaultHead}
        <Component {...pageProps} />
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session}>
      <Layout>
        {defaultHead}
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
