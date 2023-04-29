import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ArticleForm from '@/components/Form/ArticleForm';
import classes from './index.module.scss';
import useHttp from '@/hooks/useHttp';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';
import Error from '@/components/UI/Modals/Error';
import Success from '@/components/UI/Modals/Success';

const NewArticlePage = () => {
  const router = useRouter();

  const {
    sendFetchReq: sendArticlesPostReq,
    isLoading: isLoadingArticleSubmit,
    data: postArticleRes,
    error: postArticleError,
    success: postArticleSuccess,
    errorAccept: postArticleErrorAccept,
    successAccept: postArticleSuccessAccept,
  } = useHttp();
  const {
    sendFetchReq: sendDraftsPostReq,
    isLoading: isLoadingDraftSubmit,
    data: postDraftRes,
    error: postDraftError,
    success: postDraftSuccess,
    errorAccept: postDraftErrorAccept,
    successAccept: postDraftSuccessAccept,
  } = useHttp();

  //Redirect to /published page when article is published
  useEffect(() => {
    if (postArticleSuccess) {
      router.push('/published');
    }
  }, [postArticleSuccess]);

  const addPostHandler = async (e, newArticle) => {
    const clickedButton = e.nativeEvent.submitter.dataset.button;

    const config = {
      method: 'POST',
      body: JSON.stringify(newArticle),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    //Depending on which button was clicked, there are 2 actions possible:
    //1) Publish post
    //2) Save as draft

    if (clickedButton === 'publish') await sendArticlesPostReq('/api/articles', config);
    if (clickedButton === 'draft') await sendDraftsPostReq('/api/drafts', config);
  };

  return (
    <section className={classes.new}>
      <h1>New Article</h1>
      <ArticleForm
        isLoading={isLoadingArticleSubmit || isLoadingDraftSubmit}
        articleDataHandler={addPostHandler}
      />

      {(isLoadingArticleSubmit || isLoadingDraftSubmit) && <LoadingSpinner />}
      {postArticleError && <Error onClick={postArticleErrorAccept} message={postArticleError} />}
      {postDraftError && <Error onClick={postDraftErrorAccept} message={postDraftError} />}
      {postDraftSuccess && (
        <Success onClick={postDraftSuccessAccept} message={postDraftRes.message} />
      )}
    </section>
  );
};

export default NewArticlePage;
