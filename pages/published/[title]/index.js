import { useRouter } from 'next/router';
import useHttp from '@/hooks/useHttp';
import { useEffect } from 'react';

import ArticleForm from '@/components/Form/ArticleForm';
import classes from './index.module.scss';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';
import Error from '@/components/UI/Modals/Error';
import Success from '@/components/UI/Modals/Success';
import reqConfig from '@/utils/reqConfig';

const PublishedEditPage = () => {
  const router = useRouter();
  //For handling 'GET' Request
  const {
    sendFetchReq,
    isLoading: getReqIsLoading,
    data,
    error: getReqError,
    errorAccept: getReqErrorAccept,
    success: getReqSuccess,
  } = useHttp();
  //For handling 'PATCH' Request
  const {
    sendFetchReq: sendPatchReq,
    isLoading: patchReqIsLoading,
    data: patchReqData,
    error: patchReqError,
    errorAccept: patchReqErrorAccept,
    success: patchReqSuccess,
    successAccept: patchReqSuccessAccept,
  } = useHttp();
  //For handling 'POST' Request
  const {
    sendFetchReq: sendPostReq,
    isLoading: postReqIsLoading,
    error: postReqError,
    errorAccept: postReqErrorAccept,
    success: postReqSuccess,
  } = useHttp();

  const { title } = router.query;
  const formattedArticleTitle = title && title.replaceAll('-', ' ');

  const article =
    data &&
    data.articles &&
    data.articles.find(
      article => article.title.toLowerCase() === formattedArticleTitle.toLowerCase()
    );

  useEffect(() => {
    if (router.isReady) {
      const timer = setTimeout(() => sendFetchReq(`/api/articles/article-title/${title}`), 200);
      return () => clearTimeout(timer);
    }
  }, [router.isReady, sendFetchReq]);

  //Redirect to 404 page if no article found
  useEffect(() => {
    if (getReqSuccess && !article) {
      router.push('/404');
    }
  }, [getReqSuccess, article]);

  //Redirect to drafts page if article is submitted to drafts
  useEffect(() => {
    if (postReqSuccess) {
      router.push('/drafts');
    }
  }, [postReqSuccess]);

  const addPostHandler = async (e, newArticle) => {
    const clickedButton = e.nativeEvent.submitter.dataset.button;

    //Depending on which button was clicked, there are 2 actions possible:
    //1) Publish post
    //2) Save as draft

    if (clickedButton === 'publish')
      await sendPatchReq('/api/articles', reqConfig('PATCH', newArticle));
    if (clickedButton === 'draft') await sendPostReq('/api/drafts', reqConfig('POST', newArticle));
  };

  const handleError = () => {
    if (getReqError) getReqErrorAccept();
    if (patchReqError) patchReqErrorAccept();
    if (postReqError) postReqErrorAccept();
  };

  return (
    <section className={classes.published}>
      {article && (
        <>
          {' '}
          <h1>Editing Published: {article.title}</h1>
          <ArticleForm
            isLoading={postReqIsLoading || patchReqIsLoading}
            articleDataHandler={addPostHandler}
            articleData={article}
          />
        </>
      )}
      {(getReqIsLoading || postReqIsLoading || patchReqIsLoading) && <LoadingSpinner />}

      {(getReqError || postReqError || patchReqError) && (
        <Error onClick={handleError} message={getReqError || postReqError || patchReqError} />
      )}

      {patchReqSuccess && (
        <Success onClick={patchReqSuccessAccept} message={patchReqData.message} />
      )}
    </section>
  );
};

export default PublishedEditPage;
