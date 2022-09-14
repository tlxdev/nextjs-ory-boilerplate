import '../styles/globals.css';

import App from 'next/app';

import SessionContext from '../utils/SessionContext';

const AppProvider = ({ children, initialData = {} }) => {
  return <SessionContext.Provider value={initialData}>{children}</SessionContext.Provider>;
};

const MyApp = ({ Component, pageProps }) => {
  return (
    <AppProvider initialData={pageProps?.contextData}>
      <Component {...pageProps} />
    </AppProvider>
  );
};

const fetchOrySessionFromCookie = async (cookie) => {
  if (!cookie) {
    throw Error('fetchOrySessionFromCookie util function called without a cookie');
  }

  // Fetch session details in backend using Ory API

  const sessionRequest = await fetch('http://localhost:3000/api/.ory/sessions/whoami', {
    headers: {
      Cookie: cookie,
    },
  });

  if (sessionRequest.status !== 200) {
    throw Error('Failed to fetch session from Ory');
  }

  const orySessionResponse = await sessionRequest.json();

  return orySessionResponse;
};

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);

  // if browser, skip
  if (process.browser) {
    return __NEXT_DATA__.props.pageProps;
  }

  // if server, cookies from client are used to fetch Ory session details from API
  const cookies = appContext.ctx.req.cookies;

  if (cookies && !!Object.entries(cookies)) {
    try {
      // cookie starting with ory_session_ is the correct one. cookie name depends on used ory instance name.
      const cookie = Object.entries(cookies)
        .filter(([key, value]) => key.includes('ory_session'))
        .map(([key, value]) => [key, value].join('='))
        .join('; ');

      // If some cookies exist, but no session cookie => return null session
      if (!cookie) {
        return { ...appProps, contextData: { session: null } };
      }

      const session = await fetchOrySessionFromCookie(cookie);

      // Return session details back to client to be used in UI
      return {
        ...appProps,
        pageProps: {
          ...appProps?.pageProps,
          contextData: {
            session,
          },
        },
      };
    } catch (error) {
      console.error('Failed to fetch Ory session.');
      console.error(error);
    }
  }
  return { ...appProps, contextData: { session: null } };
};

export default MyApp;
