import classes from './ConfirmRemoval.module.scss';
import Card from '../Card';
import PrimaryButton from '../Buttons/PrimaryButton';

const ConfirmRemoval = props => {
  return (
    <>
      <Card className={classes.modal}>
        <h3>ℹ Are you sure you want to remove?</h3>
        <p>Please note that this decision is irreversible.</p>
        <div>
          <PrimaryButton
            attributes={{ onClick: props.closeModalHandler }}
            className={classes['modal__btn']}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            attributes={{ onClick: props.removeItemHandler }}
            className={`${classes['modal__btn']} ${classes['modal__btn--remove']}`}
          >
            Remove
          </PrimaryButton>
        </div>
      </Card>
    </>
  );
};

export default ConfirmRemoval;
