import "../styles/globals.css";

import App from "next/app";

import SessionContext from "../utils/SessionContext";
import { useMemo, useState } from "react";

const AppProvider = ({ children, initialData = {} }) => {
  return (
    <SessionContext.Provider value={initialData}>
      {children}
    </SessionContext.Provider>
  );
};

const MyApp = ({ Component, pageProps }) => {
  return (
    <AppProvider initialData={pageProps?.contextData}>
      <Component {...pageProps} />
    </AppProvider>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  if (process.browser) {
    return __NEXT_DATA__.props.pageProps;
  }
  const cookies = appContext.ctx.req.cookies;
  if (cookies) {
    try {
      // Map incoming client cookies and use them serverside
      const objectToCookie = Object.entries(cookies)
        .filter(([key, value]) => key.includes("ory_session"))
        .map(([k, v]) => [k, v].join("="))
        .join("; ");

      // Fetch session details in backend using Ory API

      const sessionRequest = await fetch(
        "http://localhost:3000/api/.ory/sessions/whoami",
        {
          headers: {
            Cookie: objectToCookie,
          },
        }
      );
      if (sessionRequest.status !== 200) {
        return { response: null, logoutUrl: null };
      }
      const response = await sessionRequest.json();

      // Return session details to be used in UI
      return {
        ...appProps,
        pageProps: {
          ...appProps?.pageProps,
          contextData: {
            session: response,
            sessionCookie: objectToCookie,
            logoutUrl: null,
          },
        },
      };
    } catch (error) {
      console.error("Failed to fetch Ory session.");
      console.error(error);
    }
  }
  return { ...appProps, contextData: { session: null, logoutUrl: null } };
};

export default MyApp;
