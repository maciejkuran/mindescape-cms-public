import Card from './Card';
import Image from 'next/image';
import classes from './InfoCard.module.scss';

const InfoCard = props => {
  return (
    <Card className={classes['info-card']}>
      <h2>{props.heading}</h2>
      <p>{props.description}</p>
      <div>
        <Image src="/images/info.svg" height={150} width={150} alt="mindescape info card" />
      </div>
    </Card>
  );
};

export default InfoCard;
