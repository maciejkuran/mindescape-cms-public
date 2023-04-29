import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import classes from './index.module.scss';
import SignInForm from '@/components/Auth/SignInForm';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import Error from '@/components/UI/Modals/Error';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';

const AuthPage = () => {
  const [isError, setIsError] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [session, status]);

  const authorizeUserHandler = async inputData => {
    const login = await signIn('credentials', { ...inputData, redirect: false });

    if (login.error) setIsError(login.error);
  };

  const acceptErrorHandler = () => {
    setIsError(null);
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <>
      <section className={classes.section}>
        <div className={classes['section__form']}>
          <SignInForm authorizeUserHandler={authorizeUserHandler} />
        </div>
        <div className={classes['section__img']}>
          <Image
            src="/images/sign-in.jpg"
            height={1100}
            width={600}
            alt="mindescape sign in"
          ></Image>
        </div>
      </section>
      {isError && <Error message={isError} onClick={acceptErrorHandler} />}
    </>
  );
};

export default AuthPage;
