import useHttp from '@/hooks/useHttp';
import { useEffect } from 'react';
import classes from './index.module.scss';
import PostItem from '@/components/Post/PostItem';
import Error from '@/components/UI/Modals/Error';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';
import Success from '@/components/UI/Modals/Success';
import InfoCard from '@/components/UI/InfoCard';

const PublishedPage = () => {
  const {
    sendFetchReq,
    isLoading: isLoadingArticles,
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
      //If deleteSuccess state === null, it will trigger fetch function (in reality this will happen on component mount & when article is removed)
      if (!deleteSuccess) {
        sendFetchReq('/api/articles');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [deleteSuccess, sendFetchReq]);

  const removeDraftHandler = _id => {
    const config = { method: 'DELETE', headers: { 'Content-Type': 'application/json' } };
    sendDeleteReq(`/api/articles/article-id/${_id}`, config);
  };

  return (
    <section className={classes.published}>
      <h1>Published</h1>
      {data && data.articles && (
        <>
          <p>Items: {data.quantity}</p>
          <ul className={classes['published__items']}>
            {data.articles.map(item => (
              <li key={item._id}>
                <PostItem
                  removeItemHandler={removeDraftHandler}
                  comments={true}
                  articleData={item}
                  drafts={false}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {data && data.quantity === 0 && (
        <InfoCard
          heading="Oops nothing has been published!"
          description="Get to work and publish your first article right now 💪 "
        />
      )}

      {(isLoadingArticles || deleteReqIsLoading) && <LoadingSpinner />}

      {(fetchErr && <Error message={fetchErr} onClick={fetchErrAccept} />) ||
        (deleteErr && <Error message={deleteErr} onClick={deleteErrAccept} />)}

      {deleteSuccess && <Success onClick={deleteSuccessAccept} message={deleteRes.message} />}
    </section>
  );
};

export default PublishedPage;
