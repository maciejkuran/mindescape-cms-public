import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import useImageUpload from '@/hooks/useImageUpload';
import classes from './UserDataForm.module.scss';
import Image from 'next/image';
import Card from '../UI/Card';
import FileInput from '../UI/Inputs/FileInput';
import Input from '../UI/Inputs/Input';
import TextArea from '../UI/Inputs/TextArea';
import PrimaryButton from '../UI/Buttons/PrimaryButton';

const UserDataForm = props => {
  const [userRole, setUserRole] = useState('editor');
  const nameInputRef = useRef();
  const lastNameInputRef = useRef();
  const emailInpuRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();
  const bioInputRef = useRef();
  const { getImageFile, imgUrl, imgUploadError, errorAccept } = useImageUpload();
  const { data: session } = useSession();
  const getFileHandler = e => getImageFile(e, 'thumbnail');
  const userRoleHandler = e => setUserRole(e.target.value);

  const submitUserHandler = e => {
    e.preventDefault();

    //object contains user data
    const userData = {
      image:
        session && !imgUrl && new RegExp('change image', 'i').test(props.buttonText)
          ? session.user.image
          : imgUrl,
      role: session && !props.newUserPage ? session.user.role : userRole,
      name: nameInputRef.current.value.trim(),
      lastName: lastNameInputRef.current.value.trim(),
      email: emailInpuRef.current.value.trim().toLowerCase(),
      password: passwordInputRef.current.value.trim(),
      confirmPassword: confirmPasswordInputRef.current.value.trim(),
      bio: bioInputRef.current.value.trim(),
      //conditionally added property for email validation in users/[userId] API when user changes data
      ...(session && !props.newUserPage && { userId: session.user._id }),
    };
    props.getUserDataOnSubmit(userData);
  };

  return (
    <Card>
      <form onSubmit={submitUserHandler} className={classes.form}>
        <div className={`${classes['form__flex']} ${classes['form__flex__img']}`}>
          {session && !props.newUserPage && (
            <Image
              className={classes['form__flex__img--profile']}
              src={session.user.image}
              alt="mindescape profile photo"
              width={200}
              height={250}
            />
          )}
          <div className={classes['form__flex--internal']}>
            <FileInput
              imgUploadError={imgUploadError}
              errorAccept={errorAccept}
              uploadedImg={imgUrl}
              onChange={getFileHandler}
              labelText={props.buttonText}
            />
          </div>
          <span className={classes['form__flex__img-info']}>png, jpeg/max 512Kb</span>
        </div>

        {props.newUserPage && (
          <fieldset className={classes['form__fieldset']}>
            <legend>Select a user role:</legend>

            <div>
              <input onChange={userRoleHandler} name="role" type="radio" id="admin" value="admin" />
              <label htmlFor="admin">admin</label>
            </div>

            <div>
              <input
                onChange={userRoleHandler}
                name="role"
                type="radio"
                id="editor"
                value="editor"
                defaultChecked
              />
              <label htmlFor="editor">editor</label>
            </div>
          </fieldset>
        )}

        <div className={classes['form__flex']}>
          <div className={classes['form__flex__input']}>
            <label htmlFor="name">Name</label>
            <Input
              ref={nameInputRef}
              attributes={{
                id: 'name',
                type: 'text',
                placeholder: !props.newUserPage ? '' : 'Name',
                defaultValue:
                  !props.newUserPage && session && session.user.name ? session.user.name : '',
              }}
            />
          </div>
          <div className={classes['form__flex__input']}>
            <label htmlFor="lastName">Last Name</label>
            <Input
              ref={lastNameInputRef}
              attributes={{
                id: 'lastName',
                type: 'text',
                placeholder: !props.newUserPage ? '' : 'Last Name',
                defaultValue:
                  !props.newUserPage && session && session.user.lastName
                    ? session.user.lastName
                    : '',
              }}
            />
          </div>
        </div>
        <div className={classes['form__flex']}>
          <label htmlFor="email">Email</label>
          <Input
            ref={emailInpuRef}
            attributes={{
              id: 'email',
              type: 'text',
              placeholder: !props.newUserPage ? '' : 'Email address',
              defaultValue:
                !props.newUserPage && session && session.user.email ? session.user.email : '',
            }}
          />
        </div>
        <div className={classes['form__flex']}>
          <div className={classes['form__flex__input']}>
            <label htmlFor="pw">Password</label>
            <Input
              ref={passwordInputRef}
              attributes={{ id: 'pw', type: 'password', placeholder: 'Password' }}
            />
          </div>
          <div className={classes['form__flex__input']}>
            <label htmlFor="confirmPw">Confirm Password</label>
            <Input
              ref={confirmPasswordInputRef}
              attributes={{ id: 'confirmPw', type: 'password', placeholder: 'Confirm password' }}
            />
          </div>
        </div>
        <div className={classes['form__flex']}>
          <label htmlFor="bio">Short bio (2-3 sentences)</label>
          <TextArea
            ref={bioInputRef}
            attributes={{
              rows: 3,
              placeholder:
                (session && props.newUserPage) || (session && !session.user.bio)
                  ? 'Something interesting about you...'
                  : '',
              defaultValue:
                !props.newUserPage && session && session.user.bio ? session.user.bio : '',
            }}
          />
        </div>
        <div>
          <PrimaryButton>Submit</PrimaryButton>
        </div>
      </form>
    </Card>
  );
};

export default UserDataForm;
