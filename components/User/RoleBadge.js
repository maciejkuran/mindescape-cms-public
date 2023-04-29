import classes from './RoleBadge.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const RoleBadge = props => {
  return (
    <div className={classes.badge}>
      <FontAwesomeIcon icon={faStar} /> {props.role}
    </div>
  );
};

export default RoleBadge;
