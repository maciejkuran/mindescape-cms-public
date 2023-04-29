import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import AccountNavbar from './AccountNavbar';
import classes from './Layout.module.scss';
import LoadingSpinner from '../UI/Modals/LoadingSpinner';

const Layout = props => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [session, status]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'authenticated') {
    return (
      <>
        <div className={classes.layout}>
          <AccountNavbar />
          <main>
            {props.children}
            <div className={classes['layout__seperator']} />
          </main>
        </div>
      </>
    );
  }
};

export default Layout;
