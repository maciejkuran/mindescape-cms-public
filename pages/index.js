import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import useHttp from '@/hooks/useHttp';

import classes from './index.module.scss';
import Card from '@/components/UI/Card';
import PrimaryButton from '@/components/UI/Buttons/PrimaryButton';

import Link from 'next/link';
import Image from 'next/image';

const HomePage = () => {
  const { data: session, status } = useSession();
  const { sendFetchReq, error, success, data } = useHttp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session && status !== 'loading') {
        sendFetchReq(`/api/articles/author-id/${session.user._id}`);
      }
    }, 200);

    return () => clearTimeout(timer);
    //sendFetchReq - memoized function with useCallback hook
  }, [session, status, sendFetchReq]);

  const progressInPercent = `${data && (100 * data.quantity) / 10}%`;
  const articlesPublishedTotal = `${data && data.quantity} published in total`;

  return (
    <>
      <div className={classes.home}>
        <div className={classes['home__wrapper']}>
          <Card className={`${classes['home__box']} ${classes['home__box--welcome']}`}>
            {session && <h1>Welcome {session.user.name} 👋</h1>}
            <p>Let your creative and imaginative mind run freely. Wishing you creative writing!</p>
            <Link href="/new">
              <PrimaryButton className={classes['home__box__btn']}>New Article</PrimaryButton>
            </Link>
          </Card>

          {error && (
            <Card className={`${classes['home__box']} ${classes['home__box--contribution']}`}>
              <h2>Your Contribution</h2>
              <p>Oops 🙄! Something went wrong. {error}</p>
            </Card>
          )}

          {!error && success && data.quantity < 10 && (
            <Card className={`${classes['home__box']} ${classes['home__box--contribution']}`}>
              <h2>Your Contribution</h2>
              <div className={classes['home__box__counter']}>
                <div style={{ width: progressInPercent }}></div>
              </div>
              <span>
                {progressInPercent} / {articlesPublishedTotal}
              </span>

              <p>
                Mindescape appreciates all your contribution! Publish 10 articles to receive a
                Veteran badge!
              </p>
            </Card>
          )}

          {!error && success && data.quantity >= 10 && (
            <Card className={`${classes['home__box']} ${classes['home__box--contribution']}`}>
              <h2>Your Contribution</h2>
              <div className={classes['home__box--contribution--trophy']}>
                <Image
                  src="/images/trophy.png"
                  height={200}
                  width={300}
                  alt="mindescape contribution"
                />
              </div>
              <p>
                {articlesPublishedTotal}. Mindescape appreciates all your contribution! You gained
                your Veteran status!
              </p>
            </Card>
          )}

          <Card className={`${classes['home__box']} ${classes['home__box--drafts-info']}`}>
            <h2>👉 Take your time when creating!</h2>
            <p>
              Great things do not come easily or quickly. You can divide the writing of an article
              into stages, where you save your progress in <span>drafts</span>.
            </p>
          </Card>
        </div>
        <div className={classes['home__img']}>
          <Image height={800} width={500} src="/images/dashboard.jpg" alt="Welcome to mindescape" />
        </div>
      </div>
    </>
  );
};

export default HomePage;
