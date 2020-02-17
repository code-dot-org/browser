/** @file Default config values for Code.org Maker App. */

const DASHBOARD_HOST = process.env.DASHBOARD_HOST || (
  process.env.NODE_ENV === 'production'
    ? 'https://studio.code.org'
    : 'http://localhost-studio.code.org:3000'
);

module.exports = {
  HOME_URL: DASHBOARD_HOST + '/maker/home',
  MAKER_SETUP_URL: DASHBOARD_HOST + '/maker/setup',
  CLEVER_LOGIN_URL: 'https://clever.com/login',
  GOOGLE_LOGIN_URL: DASHBOARD_HOST + '/users/auth/google_oauth2',
};
