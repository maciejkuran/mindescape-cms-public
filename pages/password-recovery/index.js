import useHttp from '@/hooks/useHttp';
import { useRef } from 'react';

import classes from './index.module.scss';
import Card from '@/components/UI/Card';
import Input from '@/components/UI/Inputs/Input';
import PrimaryButton from '@/components/UI/Buttons/PrimaryButton';
import reqConfig from '@/utils/reqConfig';
import Error from '@/components/UI/Modals/Error';
import Success from '@/components/UI/Modals/Success';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';

const PasswordRecoveryPage = () => {
  const emailInputRef = useRef();

  const {
    sendFetchReq: sendPostReq,
    isLoading: postReqIsLoading,
    data: postReqRes,
    error: postReqErr,
    errorAccept: postReqErrAccept,
    success: postReqSuccess,
    successAccept: postReqSuccessAccept,
  } = useHttp();

  const accountRecoveryHandler = e => {
    e.preventDefault();
    const data = { email: emailInputRef.current.value };

    sendPostReq('/api/password-recovery', reqConfig('POST', data));
  };

  const resendLinkHandler = e => {
    e.preventDefault();
    const data = { email: emailInputRef.current.value };
    sendPostReq('/api/password-recovery/resend-link', reqConfig('POST', data));
  };

  return (
    <section className={classes.pw}>
      <Card className={classes['pw__card']}>
        <h3>mindescape</h3>
        <h1>Account Recovery</h1>
        <form onSubmit={accountRecoveryHandler}>
          <label htmlFor="email">Enter valid email address</label>
          <Input ref={emailInputRef} attributes={{ placeholder: 'email' }}></Input>
          <div className={classes['pw__btn']}>
            <PrimaryButton
              attributes={{
                ...(postReqIsLoading || postReqSuccess || postReqRes
                  ? { disabled: true }
                  : { disabled: false }),
              }}
            >
              Submit
            </PrimaryButton>
          </div>
          <div className={classes['pw__reset']}>
            <p>
              ⚠ Didn&apos;t you receive an email? We will reset the activation link and send an
              email once again.
            </p>
            <button onClick={resendLinkHandler}>Send again</button>
          </div>
        </form>
      </Card>
      {postReqIsLoading && <LoadingSpinner />}
      {postReqErr && <Error message={postReqErr} onClick={postReqErrAccept} />}
      {postReqSuccess && <Success onClick={postReqSuccessAccept} message={postReqRes.message} />}
    </section>
  );
};

export default PasswordRecoveryPage;
