import classes from './Overlay.module.scss';

const Overlay = props => {
  return <div onClick={props.onClick} className={classes.overlay}></div>;
};

export default Overlay;
