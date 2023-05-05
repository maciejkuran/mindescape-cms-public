import useRemoveModal from '@/hooks/useRemoveModal';
import { useSession } from 'next-auth/react';

import Card from '../UI/Card';
import PrimaryButton from '../UI/Buttons/PrimaryButton';
import classes from './PostItem.module.scss';
import Image from 'next/image';
import formatDate from '@/utils/formatDate';
import ConfirmRemoval from '@/components/UI/Modals/ConfirmRemoval';
import Link from 'next/link';

const PostItem = props => {
  const { removeModalActive, openModalHandler, closeModalHandler } = useRemoveModal();
  const { data: session } = useSession();

  const { _id, authorName, authorLastName, authorImage, title, creationDate, authorId } =
    props.articleData;

  const removeItemHandler = () => {
    props.removeItemHandler(_id);
    closeModalHandler();
  };

  const formattedTitleToURL = title.replaceAll(' ', '-').toLowerCase();
  const lastModifiedDate = props.articleData.lastModified && props.articleData.lastModified;

  return (
    <>
      <Card data-postId={_id} className={classes.item}>
        <div className={classes['item__meta-data']}>
          <Image height={50} width={50} src={authorImage} alt={`${authorName} ${authorLastName}`} />
          <div>
            <h4>{title}</h4>
            <p>
              <span>Written by:</span> {authorName} {authorLastName}
            </p>
            <p>
              <span>Created:</span> {formatDate(creationDate)}
            </p>
            {lastModifiedDate && (
              <p>
                <span>Last modified:</span> {formatDate(lastModifiedDate)}
              </p>
            )}
          </div>
        </div>
        <div className={classes['item__btns']}>
          {(!props.drafts && session && session.user._id === authorId) ||
          (session && session.user.role === 'admin') ? (
            <PrimaryButton
              attributes={{ onClick: openModalHandler }}
              className={classes['item__btn']}
            >
              Remove
            </PrimaryButton>
          ) : (
            ''
          )}

          <Link
            href={
              props.drafts ? `/drafts/${formattedTitleToURL}` : `/published/${formattedTitleToURL}`
            }
          >
            {(!props.drafts && session && session.user._id === authorId) ||
            (session && session.user.role === 'admin') ? (
              <PrimaryButton className={classes['item__btn']}>Edit</PrimaryButton>
            ) : (
              ''
            )}
          </Link>
          {props.comments && (
            <Link href={`/published/${formattedTitleToURL}/comments`}>
              <PrimaryButton className={classes['item__btn']}>Comments</PrimaryButton>
            </Link>
          )}
        </div>
      </Card>
      {removeModalActive && (
        <ConfirmRemoval
          removeItemHandler={removeItemHandler}
          closeModalHandler={closeModalHandler}
        />
      )}
    </>
  );
};

export default PostItem;
