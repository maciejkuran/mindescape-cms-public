import { useRef } from 'react';
import { useSession } from 'next-auth/react';
import classes from './ArticleForm.module.scss';
import Input from '../UI/Inputs/Input';
import FileInput from '../UI/Inputs/FileInput';
import PrimaryButton from '../UI/Buttons/PrimaryButton';
import Card from '../UI/Card';
import TextArea from '../UI/Inputs/TextArea';
import RichTextEditor from './RichTextEditor';
import useImageUpload from '@/hooks/useImageUpload';

const ArticleForm = props => {
  const titleInputRef = useRef();
  const excerptInputRef = useRef();
  const featuredCheckboxRef = useRef();
  const richTextEditorRef = useRef();
  const { getImageFile, imgUrl, imgUploadError, errorAccept } = useImageUpload();
  const { data: session, status: authenticated } = useSession();

  //As this formComponent is reusable, there's existing article data passed via props, if we're not on edit page - undefined will be returned
  const articleDataToEdit = props.articleData && props.articleData;

  const getFileHandler = e => {
    getImageFile(e, 'image');
  };

  const submitFormHandler = e => {
    e.preventDefault();

    const bodyContent = richTextEditorRef.current.getRichTextContent();
    const { name, lastName, _id } = session.user;

    const article = {
      authorName: articleDataToEdit ? articleDataToEdit.authorName : name,
      authorLastName: articleDataToEdit ? articleDataToEdit.authorLastName : lastName,
      authorId: articleDataToEdit ? articleDataToEdit.authorId : _id,
      title: titleInputRef.current.value.trim(),
      excerpt: excerptInputRef.current.value.trim(),
      featured: featuredCheckboxRef.current.checked,
      mainImage: !imgUrl && articleDataToEdit ? articleDataToEdit.mainImage : imgUrl,
      body: bodyContent,
      ...(articleDataToEdit && { _id: articleDataToEdit._id }),
    };

    props.articleDataHandler(e, article);
  };

  return (
    <form onSubmit={submitFormHandler} className={classes.form}>
      <Card className={classes['form__inputs']}>
        <div className={classes['form__inputs__input']}>
          <label htmlFor="title">Title</label>
          <Input
            ref={titleInputRef}
            className={classes['form__inputs__input--element']}
            attributes={{
              id: 'title',
              type: 'text',
              defaultValue: articleDataToEdit ? articleDataToEdit.title : '',
              placeholder: !articleDataToEdit ? 'Title' : '',
            }}
          />
        </div>
        <div className={classes['form__inputs__input']}>
          <label htmlFor="excerpt">Excerpt (up to 50 words)</label>
          <TextArea
            ref={excerptInputRef}
            className={classes['form__inputs__input--element']}
            attributes={{
              id: 'excerpt',
              placeholder: 'Excerpt',
              rows: '3',
              defaultValue:
                articleDataToEdit && articleDataToEdit.excerpt !== ''
                  ? articleDataToEdit.excerpt
                  : '',
              placeholder: !articleDataToEdit || articleDataToEdit.excerpt === '' ? 'Excerpt' : '',
            }}
          />
        </div>
        <div className={classes['form__inputs__input--featured']}>
          <label htmlFor="featured">Featured</label>
          <input
            ref={featuredCheckboxRef}
            name="featured"
            id="featured"
            type="checkbox"
            defaultChecked={articleDataToEdit ? articleDataToEdit.featured : false}
          />
        </div>
        <div className={classes['form__inputs__input']}>
          <label>Main Image (png, jpeg/max 1mb)</label>
          <FileInput
            articleDataToEdit={articleDataToEdit}
            imgUploadError={imgUploadError}
            errorAccept={errorAccept}
            uploadedImg={imgUrl}
            onChange={getFileHandler}
            labelText="Upload Image"
          />
        </div>
        <div>
          <label htmlFor="rich-editor">Article Content</label>
          <RichTextEditor articleDataToEdit={articleDataToEdit} ref={richTextEditorRef} />
        </div>
      </Card>
      <div className={classes['form__btns']}>
        <PrimaryButton
          attributes={{
            type: 'submit',
            'data-button': 'draft',
            disabled: props.isLoading ? true : false,
          }}
          className={classes['form__btns--btn']}
        >
          Save as Draft
        </PrimaryButton>
        <PrimaryButton
          attributes={{
            type: 'submit',
            'data-button': 'publish',
            disabled: props.isLoading ? true : false,
          }}
          className={classes['form__btns--btn']}
        >
          Publish
        </PrimaryButton>
      </div>
    </form>
  );
};

export default ArticleForm;
