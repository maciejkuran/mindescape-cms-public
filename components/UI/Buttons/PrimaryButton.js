import classes from './PrimaryButton.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';

const PrimaryButton = props => {
  return (
    <button className={`${classes.button} ${props.className}`} {...props.attributes}>
      {props.children} <FontAwesomeIcon icon={faArrowRightLong} />
    </button>
  );
};

export default PrimaryButton;
