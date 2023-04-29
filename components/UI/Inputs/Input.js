import classes from './Input.module.scss';
import { forwardRef } from 'react';

const Input = forwardRef((props, ref) => {
  return (
    <input ref={ref} {...props.attributes} className={`${classes.input} ${props.className}`} />
  );
});

Input.displayName = 'Input'; //FIX at Vercel deploy: Error: Component definition is missing display name  react/display-name

export default Input;
