import classes from './Sucess.module.scss';
import Card from '../Card';

const Success = props => {
  return (
    <Card className={classes.success}>
      <div>
        <h3>Success!</h3>
        <p>{props.message}</p>
      </div>
      <button onClick={props.onClick}>OK</button>
    </Card>
  );
};

export default Success;
