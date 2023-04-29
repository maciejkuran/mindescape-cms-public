import useHttp from '@/hooks/useHttp';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import classes from './new.module.scss';
import UserDataForm from '@/components/Form/UserDataForm';
import Error from '@/components/UI/Modals/Error';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';

const NewUserPage = () => {
  const { sendFetchReq, isLoading, data, error, success, errorAccept, successAccept } = useHttp();
  const router = useRouter();

  //Redirect if user has been successfully added.
  useEffect(() => {
    if (data && success) {
      router.push('/users');
    }
  }, [data, success]);

  const submitUserDataHandler = async userData => {
    const config = {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    await sendFetchReq('/api/users', config);
  };

  return (
    <section className={classes['new-user']}>
      <h1>Add New User</h1>
      <UserDataForm
        getUserDataOnSubmit={submitUserDataHandler}
        newUserPage={true}
        buttonText="Add image"
      />
      {isLoading && <LoadingSpinner />}
      {error && <Error message={error} onClick={errorAccept} />}
    </section>
  );
};

export default NewUserPage;
