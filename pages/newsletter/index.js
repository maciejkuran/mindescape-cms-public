import useHttp from '@/hooks/useHttp';
import { useEffect } from 'react';
import Card from '@/components/UI/Card';
import classes from './index.module.scss';
import formatDate from '@/utils/formatDate';
import InfoCard from '@/components/UI/InfoCard';
import Error from '@/components/UI/Modals/Error';
import LoadingSpinner from '@/components/UI/Modals/LoadingSpinner';

const NewsletterPage = () => {
  const { sendFetchReq, isLoading, data, error, errorAccept } = useHttp();

  useEffect(() => {
    const timer = setTimeout(() => sendFetchReq('/api/newsletter'), 200);
    return () => clearTimeout(timer);
  }, [sendFetchReq]);

  const newsletterList = data && data.list;

  return (
    <section className={classes.newsletter}>
      <h1>Newsletter</h1>
      {data && data.quantity ? <p>Subscribers: {data.quantity}</p> : ''}

      {newsletterList && (
        <ul className={classes['newsletter__items']}>
          {newsletterList.map(item => (
            <li key={item._id}>
              <Card className={classes['newsletter__item']}>
                <p>{item.email}</p>
                <time>{formatDate(item.date)}</time>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {isLoading && <LoadingSpinner />}
      {error && <Error onClick={errorAccept} message={error} />}
      {newsletterList && newsletterList.length === 0 && (
        <InfoCard
          heading="No subscribers!"
          description="Unfortunately, no one yet subscribed to your newsletter 🙄"
        />
      )}
    </section>
  );
};

export default NewsletterPage;
