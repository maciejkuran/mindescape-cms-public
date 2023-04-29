import classes from './Error.module.scss';
import Card from '../Card';

const Error = props => {
  return (
    <Card className={classes.error}>
      <div>
        <h3>Error ⚠</h3>
        <p>{props.message}</p>
      </div>
      <button onClick={props.onClick}>OK</button>
    </Card>
  );
};

export default Error;
