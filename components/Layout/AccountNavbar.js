import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import classes from './AccountNavbar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//prettier-ignore
import {faPlus,faPenToSquare,faFolderOpen,faNewspaper,faEnvelope, faGear, faArrowRightFromBracket, faEllipsis, faUsers, faGauge
} from '@fortawesome/free-solid-svg-icons';
import Overlay from '../UI/Modals/Overlay';
import RoleBadge from '../User/RoleBadge';

const AccountNavbar = () => {
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const formatJoinDate = () => {
    if (session) {
      const joinDate = new Date(session.user.joinDate);
      let options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const formatted = new Intl.DateTimeFormat('en-US', options).format(joinDate);
      return formatted;
    }
  };

  const activePathname = router.pathname;

  useEffect(() => {
    setMobileNavActive(false);
  }, [activePathname]);

  const openMobileNavHandler = e => {
    e.preventDefault();
    setMobileNavActive(true);
  };

  const closeMobileNavHandler = () => {
    setMobileNavActive(false);
  };

  //sets active class on nav single item
  const navItemIsActive = path => {
    return activePathname === path ? classes['nav__link--active'] : '';
  };

  //sets active class on nav container
  const mobileNavActiveClass = mobileNavActive ? classes['nav--active'] : '';

  return (
    <>
      {mobileNavActive && <Overlay onClick={closeMobileNavHandler} />}
      <div className={classes.mobile}>
        <h3>mindescape</h3>
        <button onClick={openMobileNavHandler}>
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>
      <header className={`${classes.nav} ${mobileNavActiveClass}`}>
        <Link href="/">
          <h3>mindescape</h3>
        </Link>
        <div className={classes['nav__user-data']}>
          {session && !session.user.image && (
            <Image
              priority={true}
              height={80}
              width={80}
              src="/images/user-placeholder.png"
              alt="placeholder image"
            />
          )}
          {session && session.user.image && (
            <Image height={150} width={80} src={session.user.image} alt={session.user.lastName} />
          )}

          <h4>{session && `${session.user.name} ${session.user.lastName}`}</h4>
          <p>Member since {formatJoinDate()}</p>

          <RoleBadge role={session && session.user.role} />
        </div>
        <nav>
          <ul>
            <li>
              <Link className={`${classes['nav__link']} ${navItemIsActive('/')}`} href="/">
                <FontAwesomeIcon icon={faGauge} />
                Dashboard
              </Link>
            </li>
            <li>
              <Link className={`${classes['nav__link']} ${navItemIsActive('/new')}`} href="/new">
                <FontAwesomeIcon icon={faPlus} />
                New
              </Link>
            </li>
            <li>
              <Link
                className={`${classes['nav__link']} ${navItemIsActive('/drafts')}`}
                href="/drafts"
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                Drafts
              </Link>
            </li>
            <li>
              <Link
                className={`${classes['nav__link']} ${navItemIsActive('/published')}`}
                href="/published"
              >
                <FontAwesomeIcon icon={faFolderOpen} />
                Published
              </Link>
            </li>
            {session && session.user.role === 'admin' && (
              <>
                {' '}
                <li>
                  <Link
                    className={`${classes['nav__link']} ${navItemIsActive('/newsletter')}`}
                    href="/newsletter"
                  >
                    <FontAwesomeIcon icon={faNewspaper} />
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link
                    className={`${classes['nav__link']} ${navItemIsActive('/messages')}`}
                    href="/messages"
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    Messages
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                className={`${classes['nav__link']} ${navItemIsActive('/users')}`}
                href="/users"
              >
                <FontAwesomeIcon icon={faUsers} />
                Users
              </Link>
            </li>
            <li>
              <Link
                className={`${classes['nav__link']} ${navItemIsActive('/settings')}`}
                href="/settings"
              >
                <FontAwesomeIcon icon={faGear} />
                Settings
              </Link>
            </li>
            <li>
              <button onClick={() => signOut()}>
                Sign out <FontAwesomeIcon icon={faArrowRightFromBracket}></FontAwesomeIcon>
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default AccountNavbar;
