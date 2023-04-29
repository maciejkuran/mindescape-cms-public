import classes from './TextArea.module.scss';
import { forwardRef } from 'react';

const TextArea = forwardRef((props, ref) => {
  return (
    <textarea
      ref={ref}
      className={`${classes.textarea} ${props.className}`}
      {...props.attributes}
    />
  );
});

TextArea.displayName = 'TextArea'; //FIX at Vercel deploy: Error: Component definition is missing display name  react/display-name

export default TextArea;
