import useRemoveModal from '@/hooks/useRemoveModal';
import { useSession } from 'next-auth/react';

import Card from '../UI/Card';
import PrimaryButton from '../UI/Buttons/PrimaryButton';
import Image from 'next/image';
import classes from './UserData.module.scss';
import RoleBadge from './RoleBadge';
import ConfirmRemoval from '@/components/UI/Modals/ConfirmRemoval';
import formatShortDate from '@/utils/formatShortDate';
import Link from 'next/link';

const UserData = props => {
  const { data: session } = useSession();

  const { _id, name, lastName, joinDate, publishedArticlesQuantity, role, image, email } =
    props.data;

  const { removeModalActive, openModalHandler, closeModalHandler } = useRemoveModal();

  const removeUserHandler = () => {
    props.removeUserHandler(_id);
    closeModalHandler();
  };

  return (
    <>
      <Card className={classes.user}>
        <div className={classes['user__data']}>
          {image ? (
            <Image src={image} alt={`${name} ${lastName}`} height={100} width={150} />
          ) : (
            <Image
              src="/images/user-placeholder.png"
              alt={`${name} ${lastName}`}
              height={100}
              width={150}
            />
          )}
          <div>
            <h4>
              {name} {lastName}
            </h4>
            <RoleBadge role={role} />
            <p className={classes['user__data__join-date']}>Joined {formatShortDate(joinDate)}</p>
            <p>Articles published: {publishedArticlesQuantity}</p>
          </div>
        </div>
        <div className={classes['user__btns']}>
          {session && session.user.role === 'admin' && (
            <PrimaryButton
              attributes={{ onClick: openModalHandler }}
              className={classes['user__btn']}
            >
              Remove
            </PrimaryButton>
          )}
          <Link href={`mailto:${email}`}>
            <PrimaryButton className={classes['user__btn']}>Contact</PrimaryButton>
          </Link>
        </div>
      </Card>
      {removeModalActive && (
        <ConfirmRemoval
          removeItemHandler={removeUserHandler}
          closeModalHandler={closeModalHandler}
        />
      )}
    </>
  );
};

export default UserData;
