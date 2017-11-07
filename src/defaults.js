/** @file Default config values for Maker Toolkit app. */

const DASHBOARD_HOST = process.env.DASHBOARD_HOST || (
  process.env.NODE_ENV === 'production'
    ? 'https://studio.code.org'
    : 'http://localhost-studio.code.org:3000'
);

module.exports = {
  HOME_URL: DASHBOARD_HOST + '/home',
  SIGN_IN_URL: DASHBOARD_HOST + '/users/sign_in',
  MAKER_SETUP_URL: DASHBOARD_HOST + '/maker/setup',
};
