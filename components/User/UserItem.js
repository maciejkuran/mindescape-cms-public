import useRemoveModal from '@/hooks/useRemoveModal';
import { useSession } from 'next-auth/react';

import classes from './UserItem.module.scss';
import Card from '../UI/Card';
import PrimaryButton from '../UI/Buttons/PrimaryButton';
import ConfirmRemoval from '@/components/UI/Modals/ConfirmRemoval';
import formatDate from '@/utils/formatDate';
import Link from 'next/link';

const UserItem = props => {
  const { removeModalActive, openModalHandler, closeModalHandler } = useRemoveModal();
  const { data: session } = useSession();

  const { email, name, date, _id, content } = props.data;

  const removeItemHandler = () => {
    props.removeItemHandler(_id);
    closeModalHandler();
  };

  return (
    <Card className={classes.item}>
      <p>{content}</p>

      <div className={classes['item__user-data']}>
        <p>
          email: <span>{email}</span>
        </p>
        <p>
          name: <span>{name}</span>
        </p>
        <p>
          date: <span>{formatDate(date)}</span>
        </p>
      </div>

      <div className={classes['item__btns']}>
        {session && session.user.role === 'admin' && (
          <PrimaryButton
            attributes={{ onClick: openModalHandler }}
            className={classes['item__btn']}
          >
            Remove
          </PrimaryButton>
        )}
        {props.reply && (
          <Link href={`mailto:${email}?subject=Reply to: ${content}&body=Dear ${name}, `}>
            <PrimaryButton className={classes['item__btn']}>Reply</PrimaryButton>
          </Link>
        )}
      </div>
      {removeModalActive && (
        <ConfirmRemoval
          removeItemHandler={removeItemHandler}
          closeModalHandler={closeModalHandler}
        />
      )}
    </Card>
  );
};

export default UserItem;
