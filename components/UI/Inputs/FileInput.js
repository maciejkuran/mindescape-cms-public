import classes from './FileInput.module.scss';
import Image from 'next/image';
import Error from '../Modals/Error';

const FileInput = props => {
  const articleDataToEdit = props.articleDataToEdit && props.articleDataToEdit;

  return (
    <>
      <div className={classes.file}>
        <label onClick={props.onClick} className={classes['file__label']} htmlFor="file">
          {props.labelText}
        </label>
        <input
          onChange={props.onChange}
          accept="image/png, image/jpeg"
          className={classes['file__input']}
          id="file"
          type="file"
        />

        {props.uploadedImg && (
          <Image
            className={classes['file__img']}
            src={props.uploadedImg}
            height={50}
            width={50}
            alt="mindescape image upload"
          />
        )}

        {articleDataToEdit && articleDataToEdit.mainImage && !props.uploadedImg && (
          <Image
            className={classes['file__img']}
            src={articleDataToEdit.mainImage}
            height={50}
            width={50}
            alt="mindescape image upload"
          />
        )}

        {props.imgUploadError && (
          <Error message={props.imgUploadError} onClick={props.errorAccept} />
        )}
      </div>
    </>
  );
};

export default FileInput;
