import { ThreeDots } from 'react-loader-spinner';
import classes from './LoadingSpinner.module.scss';

const LoadingSpinner = () => {
  return (
    <ThreeDots
      height="80"
      width="80"
      radius="9"
      color="#989898"
      ariaLabel="three-dots-loading"
      wrapperStyle={{}}
      wrapperClass={classes.spinner}
      visible={true}
    />
  );
};

export default LoadingSpinner;
