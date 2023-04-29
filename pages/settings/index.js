import useHttp from '@/hooks/useHttp';
import { useSession } from 'next-auth/react';
import classes from './index.module.scss';
import UserDataForm from '@/components/Form/UserDataForm';
import Error from '@/components/UI/Modals/Error';
import Success from '@/components/UI/Modals/Success';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';

const SettingsPage = () => {
  const { sendFetchReq, isLoading, data, error, success, errorAccept, successAccept } = useHttp();
  const { data: session } = useSession();

  const changeUserDataHandler = async inputData => {
    //Sending PATCH request passing user id
    const url = `/api/users/${session.user._id}`;
    const config = {
      method: 'PATCH',
      body: JSON.stringify(inputData),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    await sendFetchReq(url, config);
  };

  return (
    <section className={classes.settings}>
      <h1>Settings</h1>
      <UserDataForm
        getUserDataOnSubmit={changeUserDataHandler}
        newUserPage={false}
        buttonText="Change Image"
      />
      {isLoading && <LoadingSpinner />}
      {error && <Error onClick={errorAccept} message={error} />}
      {success && <Success onClick={successAccept} message={data.message} />}
    </section>
  );
};

export default SettingsPage;
