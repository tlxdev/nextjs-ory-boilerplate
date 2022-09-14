import Head from 'next/head';
import { useContext } from 'react';
import styles from '../styles/Home.module.css';
import SessionContext from '../utils/SessionContext';

const Home = () => {
  const { session } = useContext(SessionContext);

  return (
    <div className={styles.container}>
      <Head>
        <title>NextJS + Ory boilerplate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Ory + NextJS with serverside session handling</h1>
        <h1 className={styles.title}>
          <a href="/api/.ory/ui/login">Login with Ory</a>
        </h1>

        {!session && <p className={styles.description}>No session. Please login from above and session details will be displayed here.</p>}

        {session && (
          <>
            <p className={styles.description}>Ory session data from context:</p>
            <span>{JSON.stringify(session, 3)}</span>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
