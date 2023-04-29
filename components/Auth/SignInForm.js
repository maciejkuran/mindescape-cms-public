import { useRef } from 'react';
import classes from './SignInForm.module.scss';
import PrimaryButton from '../UI/Buttons/PrimaryButton';
import Input from '../UI/Inputs/Input';

const SignInForm = props => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const signInHandler = e => {
    e.preventDefault();
    const inputData = {
      email: emailInputRef.current.value,
      password: passwordInputRef.current.value,
    };
    props.authorizeUserHandler(inputData);
  };

  return (
    <form onSubmit={signInHandler} className={classes.form}>
      <h1>mindescape</h1>
      <div>
        <Input
          ref={emailInputRef}
          className={classes['form__input']}
          attributes={{
            required: 'required',
            placeholder: 'Email',
            type: 'text',
            autoComplete: 'on',
          }}
        />
      </div>
      <div>
        <Input
          ref={passwordInputRef}
          className={classes['form__input']}
          attributes={{
            required: 'required',
            placeholder: 'Password',
            type: 'password',
            autoComplete: 'on',
          }}
        />
      </div>

      <div className={classes['form__box']}>
        <PrimaryButton className={classes['form__box__btn']}>Sign in</PrimaryButton>
      </div>
    </form>
  );
};

export default SignInForm;
