import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useHttp from '@/hooks/useHttp';

import classes from './comments.module.scss';
import UserItem from '@/components/User/UserItem';
import InfoCard from '@/components/UI/InfoCard';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';
import Error from '@/components/UI/Modals/Error';
import Success from '@/components/UI/Modals/Success';

const CommentsPage = () => {
  const {
    sendFetchReq,
    isLoading: getReqIsLoading,
    data,
    error: getReqError,
    success: getReqSuccess,
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

  const router = useRouter();
  const { title } = router.query;

  const formattedArticleTitle = title && title.replaceAll('-', ' ');

  const article =
    data &&
    data.articles &&
    data.articles.find(
      article => article.title.toLowerCase() === formattedArticleTitle.toLowerCase()
    );

  useEffect(() => {
    if (!deleteReqSuccess && router.isReady) {
      const timer = setTimeout(() => sendFetchReq(`/api/articles/article-title/${title}`), 200);

      return () => clearTimeout(timer);
    }
  }, [deleteReqSuccess, router.isReady, sendFetchReq]);

  //Redirect if article doesn't exist
  useEffect(() => {
    if (!article && getReqSuccess) router.push('/404');
  }, [getReqSuccess, article]);

  const removeItemHandler = commentId => {
    const config = { method: 'DELETE', headers: { 'Content-Type': 'application/json' } };

    sendDeleteReq(`/api/comments/${article._id}/${commentId}`, config);
  };

  return (
    <section className={classes.comments}>
      <h1>Comments: {article && article.title}</h1>

      {getReqSuccess && article && article.comments && <p>Comments: {article.comments.length}</p>}
      {getReqSuccess && article && (!article.comments || article.comments.length === 0) && (
        <InfoCard heading="No comments!" description="It seems like no one left a comment yet 🙄" />
      )}

      <ul className={classes['comments__items']}>
        {article &&
          article.comments &&
          article.comments.map(comment => (
            <li key={comment._id}>
              <UserItem removeItemHandler={removeItemHandler} data={comment} reply={false} />
            </li>
          ))}
      </ul>

      {(getReqIsLoading || deleteReqIsLoading) && <LoadingSpinner />}

      {(getReqError && <Error message={getReqError} onClick={getReqErrorAccept} />) ||
        (deleteReqError && <Error message={deleteReqError} onClick={deleteReqErrorAccept} />)}

      {deleteReqSuccess && (
        <Success onClick={deleteReqSuccessAccept} message={deleteReqRes.message} />
      )}
    </section>
  );
};

export default CommentsPage;
