import ReactGA from 'react-ga4';

export const initializeGA = () => {
  ReactGA.initialize('UA-000000-01'); 
};

export const logPageView = (url: string) => {
  ReactGA.send({ hitType: 'pageview', page: url });
};
