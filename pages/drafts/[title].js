import { useRouter } from 'next/router';
import useHttp from '@/hooks/useHttp';
import { useEffect } from 'react';

import classes from './title.module.scss';
import ArticleForm from '@/components/Form/ArticleForm';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';
import Error from '@/components/UI/Modals/Error';
import Success from '@/components/UI/Modals/Success';
import reqConfig from '@/utils/reqConfig';

const EditDraftPage = () => {
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
  const article = data && data.article;

  useEffect(() => {
    if (router.isReady) {
      const timer = setTimeout(() => sendFetchReq(`/api/drafts/article-title/${title}`), 200);
      return () => clearTimeout(timer);
    }
  }, [router.isReady, sendFetchReq]);

  //Redirect to 404 page if no article
  useEffect(() => {
    if (getReqSuccess && !article) {
      router.push('/404');
    }
  }, [getReqSuccess, article]);

  //Redirect to published page if draft is published successfully
  useEffect(() => {
    if (postReqSuccess) {
      router.push('/published');
    }
  }, [postReqSuccess]);

  const addPostHandler = async (e, newArticle) => {
    const clickedButton = e.nativeEvent.submitter.dataset.button;

    //Depending on which button was clicked, there are 2 actions possible:
    //1) Publish post
    //2) Save as draft

    if (clickedButton === 'publish')
      await sendPostReq('/api/articles', reqConfig('POST', newArticle));
    if (clickedButton === 'draft')
      await sendPatchReq('/api/drafts', reqConfig('PATCH', newArticle));
  };

  const handleError = () => {
    if (getReqError) getReqErrorAccept();
    if (patchReqError) patchReqErrorAccept();
    if (postReqError) postReqErrorAccept();
  };

  return (
    <section className={classes.draft}>
      <>
        {article && (
          <>
            <h1>Editing draft: {article.title}</h1>
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
      </>
    </section>
  );
};

export default EditDraftPage;
