import { useEffect } from 'react';
import useHttp from '@/hooks/useHttp';
import { useSession } from 'next-auth/react';

import classes from './index.module.scss';
import UserData from '@/components/User/UserData';
import PrimaryButton from '@/components/UI/Buttons/PrimaryButton';
import Link from 'next/link';
import Error from '@/components/UI/Modals/Error';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';
import Success from '@/components/UI/Modals/Success';

const UsersPage = () => {
  const { data: session } = useSession();

  const {
    sendFetchReq,
    isLoading: isLoadingUsers,
    data,
    error: fetchErr,
    errorAccept: fetchErrAccept,
  } = useHttp();

  const {
    sendFetchReq: sendDeleteReq,
    isLoading: deleteReqIsLoading,
    data: deleteRes,
    error: deleteErr,
    errorAccept: deleteErrAccept,
    success: deleteSuccess,
    successAccept: deleteSuccessAccept,
  } = useHttp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!deleteSuccess) {
        sendFetchReq('/api/users');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [deleteSuccess, sendFetchReq]);

  const removeUserHandler = _id => {
    const config = { method: 'DELETE', headers: { 'Content-Type': 'application/json' } };

    sendDeleteReq(`/api/users/${_id}`, config);
  };

  const users = data && data.users;

  return (
    <section className={classes.users}>
      <h1>Users</h1>
      {users && (
        <>
          <p>Users: {users.length}</p>
          <Link href="/users/new">
            {session && session.user.role === 'admin' && (
              <PrimaryButton className={classes['users__btn']}>Add New</PrimaryButton>
            )}
          </Link>
        </>
      )}
      <ul className={classes['users__items']}>
        {users &&
          users.map(user => (
            <li key={user._id}>
              <UserData removeUserHandler={removeUserHandler} data={user} />
            </li>
          ))}
      </ul>

      {(isLoadingUsers || deleteReqIsLoading) && <LoadingSpinner />}

      {(fetchErr && <Error message={fetchErr} onClick={fetchErrAccept} />) ||
        (deleteErr && <Error message={deleteErr} onClick={deleteErrAccept} />)}

      {deleteSuccess && <Success onClick={deleteSuccessAccept} message={deleteRes.message} />}
    </section>
  );
};

export default UsersPage;
