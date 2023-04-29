import useHttp from '@/hooks/useHttp';
import { useEffect } from 'react';

import classes from './index.module.scss';
import PostItem from '../../components/Post/PostItem';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';
import Error from '@/components/UI/Modals/Error';
import Success from '@/components/UI/Modals/Success';
import InfoCard from '@/components/UI/InfoCard';

const DraftsPage = () => {
  const {
    sendFetchReq: sendDeleteReq,
    isLoading: deleteReqIsLoading,
    data: deleteRes,
    error: deleteErr,
    errorAccept: deleteErrAccept,
    success: deleteSuccess,
    successAccept: deleteSuccessAccept,
  } = useHttp();
  //______________________________________________
  const {
    sendFetchReq,
    isLoading: isLoadingDrafts,
    data,
    error: fetchErr,
    errorAccept: fetchErrAccept,
  } = useHttp();

  useEffect(() => {
    const timer = setTimeout(() => {
      //deleteSuccess also declared as dependency by default is null so will trigger this function on component mount. Later when item is removed with success, this state becomes true and when user clicks on SuccessModal => OK, state becomes again null and will trigger fetch again so data is up to date.
      if (!deleteSuccess) {
        sendFetchReq('/api/drafts');
      }
    }, 200);
    //cleanup function to avoid sending multiple requests
    return () => clearTimeout(timer);
  }, [deleteSuccess, sendFetchReq]);

  const removeDraftHandler = _id => {
    const config = { method: 'DELETE', headers: { 'Content-Type': 'application/json' } };
    sendDeleteReq(`/api/drafts/article-id/${_id}`, config);
  };

  return (
    <section className={classes.drafts}>
      <h1>Drafts</h1>

      {data && !isLoadingDrafts && <p>Items: {data && data.quantity >= 1 ? data.quantity : 0}</p>}

      {data && data.quantity === 0 && (
        <InfoCard
          heading="Take your time and save drafts!"
          description=" In this tab you will find all the current articles you are working on. You can divide
            the writing of an article into stages, where you save your progress. Sounds great? 😀"
        />
      )}
      <ul className={classes['drafts__items']}>
        {data &&
          data.articles &&
          data.articles.map(item => (
            <li key={item._id}>
              <PostItem
                removeItemHandler={removeDraftHandler}
                articleData={item}
                comments={false}
                drafts={true}
              />
            </li>
          ))}
      </ul>
      {(isLoadingDrafts || deleteReqIsLoading) && <LoadingSpinner />}

      {(fetchErr && <Error message={fetchErr} onClick={fetchErrAccept} />) ||
        (deleteErr && <Error message={deleteErr} onClick={deleteErrAccept} />)}

      {deleteSuccess && <Success onClick={deleteSuccessAccept} message={deleteRes.message} />}
    </section>
  );
};

export default DraftsPage;
