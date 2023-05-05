import useHttp from '@/hooks/useHttp';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import classes from './index.module.scss';
import UserItem from '@/components/User/UserItem';
import Error from '@/components/UI/Modals/Error';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';
import Success from '@/components/UI/Modals/Success';
import InfoCard from '@/components/UI/InfoCard';
import reqConfig from '@/utils/reqConfig';

const MessagesPage = () => {
  const { data: session } = useSession();
  const { name, lastName, _id } = session.user ?? {};

  const {
    sendFetchReq,
    isLoading: getReqIsLoading,
    data,
    error: getReqError,
    errorAccept: getReqErrorAccept,
  } = useHttp();

  const {
    sendFetchReq: sendDeleteReq,
    isLoading: deleteReqIsLoading,
    data: deleteReqRes,
    error: deleteReqError,
    errorAccept: deleteReqErrorAccept,
    success: deleteReqSuccess,
    successAccept: deleteReqSuccessAccept,
  } = useHttp();

  const {
    sendFetchReq: sendPatchReq,
    isLoading: patchReqIsLoading,
    error: patchReqError,
    errorAccept: patchReqErrorAccept,
    success: patchReqSuccess,
  } = useHttp();

  const messages = data && data.messages;
  const quantity = data && data.quantity;

  useEffect(() => {
    if (!deleteReqSuccess) {
      const timer = setTimeout(() => sendFetchReq('/api/messages'), 200);

      return () => clearTimeout(timer);
    }
  }, [deleteReqSuccess, sendFetchReq, patchReqSuccess]);

  const removeItemHandler = messageId => {
    const config = { method: 'DELETE', headers: { 'Content-Type': 'application/json' } };

    sendDeleteReq(`/api/messages/${messageId}`, config);
  };

  const repliedCheckboxHandler = msgId => {
    const objectToSubmit = {
      msgId: msgId,
      replied: true,
      repliedBy: `${name} ${lastName}`,
      userId: _id,
    };

    //Send PATCH request to API
    sendPatchReq('/api/messages', reqConfig('PATCH', objectToSubmit));
  };

  return (
    <section className={classes.messages}>
      <h1>Messages</h1>
      {quantity && <p>Items: {quantity}</p>}
      {messages && (
        <ul className={classes['messages__items']}>
          {' '}
          {messages.map(msg => (
            <li key={msg._id}>
              <UserItem
                repliedCheckboxHandler={repliedCheckboxHandler}
                removeItemHandler={removeItemHandler}
                data={msg}
                reply={true}
                patchReqIsLoading={patchReqIsLoading}
              />
            </li>
          ))}
        </ul>
      )}

      {quantity && quantity === 0 && (
        <InfoCard heading="No messages!" description="It seems like no one sent a message yet 🙄" />
      )}

      {(getReqIsLoading || deleteReqIsLoading || patchReqIsLoading) && <LoadingSpinner />}

      {(getReqError && <Error message={getReqError} onClick={getReqErrorAccept} />) ||
        (deleteReqError && <Error message={deleteReqError} onClick={deleteReqErrorAccept} />) ||
        (patchReqError && <Error message={patchReqError} onClick={patchReqErrorAccept} />)}

      {deleteReqSuccess && (
        <Success onClick={deleteReqSuccessAccept} message={deleteReqRes.message} />
      )}
    </section>
  );
};

export default MessagesPage;
