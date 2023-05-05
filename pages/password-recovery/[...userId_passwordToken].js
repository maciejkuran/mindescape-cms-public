import { useRouter } from 'next/router';
import useHttp from '@/hooks/useHttp';
import { useEffect, useRef } from 'react';

import classes from './index.module.scss';
import Card from '@/components/UI/Card';
import Input from '@/components/UI/Inputs/Input';
import PrimaryButton from '@/components/UI/Buttons/PrimaryButton';
import reqConfig from '@/utils/reqConfig';
import Error from '@/components/UI/Modals/Error';
import Success from '@/components/UI/Modals/Success';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';

const ChangePasswordPage = () => {
  const router = useRouter();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();

  const {
    sendFetchReq: sendPatchReq,
    isLoading: patchReqIsLoading,
    data: patchReqRes,
    error: patchReqErr,
    errorAccept: patchReqErrAccept,
    success: patchReqSuccess,
    successAccept: patchReqSuccessAccept,
  } = useHttp();

  //Redirect to login page if ok btn was clicked in success modal
  useEffect(() => {
    if (router.isReady && patchReqRes && !patchReqSuccess) {
      router.push('/auth');
    }
  }, [router.isReady, patchReqSuccess, patchReqRes]);

  const [userId, passwordToken] = router?.query?.userId_passwordToken ?? [];

  const changePasswordHandler = e => {
    e.preventDefault();

    const data = {
      userId,
      passwordToken,
      password: passwordInputRef.current.value,
      confirmPassword: confirmPasswordInputRef.current.value,
    };

    sendPatchReq('/api/password-recovery', reqConfig('PATCH', data));
  };

  return (
    <section className={classes.pw}>
      <Card className={classes['pw__card']}>
        <h3>mindescape</h3>
        <h1>Change password</h1>
        <form onSubmit={changePasswordHandler}>
          <div>
            <label htmlFor="password">Password</label>
            <Input
              ref={passwordInputRef}
              attributes={{ placeholder: 'password', type: 'password' }}
            ></Input>
          </div>
          <div>
            <label htmlFor="confirm-password">Confirm password</label>
            <Input
              ref={confirmPasswordInputRef}
              attributes={{ placeholder: 'confirm password', type: 'password' }}
            ></Input>
          </div>
          <div className={classes['pw__btn']}>
            <PrimaryButton
              attributes={{
                ...(patchReqIsLoading || patchReqSuccess || patchReqRes
                  ? { disabled: true }
                  : { disabled: false }),
              }}
            >
              Submit
            </PrimaryButton>
          </div>
        </form>
      </Card>
      {patchReqIsLoading && <LoadingSpinner />}
      {patchReqErr && <Error message={patchReqErr} onClick={patchReqErrAccept} />}
      {patchReqSuccess && <Success onClick={patchReqSuccessAccept} message={patchReqRes.message} />}
    </section>
  );
};

export default ChangePasswordPage;
