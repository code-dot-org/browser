const _ = require('lodash');
const { expect } = require('chai');
const {URL} = require('url');
const {
  openUrlInDefaultBrowser,
  mayInjectNativeApi,
} = require('../src/originWhitelist');

const WHITELISTED_INTERNAL_PAGES = [
  // Production
  'https://code.org',
  'https://studio.code.org',
  // Test
  'https://test.code.org',
  'https://test-studio.code.org',
  // Ad-Hoc servers
  'https://adhoc-my-branch.cdn-code.org',
  'https://dashboard-adhoc-my-branch.cdn-code.org',
  // Local development
  'http://localhost.code.org:3000',
  'http://localhost-studio.code.org:3000',
];

const WHITELISTED_EXTERNAL_PAGES = [
  // Google OAuth
  'https://accounts.google.com',
  'https://accounts.google.com/signin/oauth',
  'https://accounts.google.com/signin/oauth/consent',
  'https://accounts.google.com/logout',
  'https://www.google.com/accounts/signin/continue?sarp=1&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent',

  // Facebook OAuth
  'https://www.facebook.com/v2.6/dialog/oauth',
  'https://www.facebook.com/logout.php',
  'https://www.facebook.com/logout.php?next=https://code.org/&access_token=XXXXXX|YYYYYYYYYYYY|ZZZZZZ',

  // Microsoft OAuth
  'https://login.live.com/oauth20_authorize.srf',
  'http://login.live.com/logout.srf',

  // Clever Log-in flow
  // Generic portal link
  'https://clever.com/login',
  // School-specific portal link
  'https://clever.com/in/codeorg-clever-dev',
  // Auth flow URLs
  'https://clever.com/oauth/sis/login?target=secret&skip=1&school_name=&default_badge=',
  'https://clever.com/oauth/authorize?response_type=code&state=secret&redirect_uri=https%3A%2F%2Fclever.com%2Fin%2Fauth_callback&client_id=secret&confirmed=true&channel=clever&new_login_flow=true&district_id=secret',
  'https://clever.com/in/auth_callback?code=secret&scope=read%3Adistrict_admins_limited%20read%3Aschool_admins_limited%20read%3Asections_limited%20read%3Astudents_launchpad%20read%3Astudents_limited%20read%3Ateachers_limited%20read%3Auser_id&state=secret',

  // Known school- and district-specific SSO portals
  'https://sso.pcsd1.org',
  'https://www.google.com/a/pcsd1.org/acs',
  'https://portal.id.cps.edu/idp/profile/SAML2/Redirect/SSO',
];

const BLACKLISTED_PAGES = [
  'https://curriculum.code.org',
  'https://docs.code.org',
  'https://forum.code.org',
  'https://support.code.org',
  'https://wiki.code.org',
  'https://www.google.com',
  'https://accounts.google.com.example.org', // subdomain loophole
  'https://example.org/?returnTo=accounts.google.com', // queryParam loophole
  'https://www.facebook.com',
  'https://live.com',
  'https://live.com.example.org', // subdomain loophole
  'https://example.org/?returnTo=live.com', // queryParam loophole
];

function originFromUrl(url) {
  return new URL(url).origin;
}

describe('openUrlInDefaultBrowser', () => {
  // These should load in the system default browser
  [
    ...BLACKLISTED_PAGES,
  ].forEach((url) => {
    it(`true for ${url}`, () => {
      expect(openUrlInDefaultBrowser(url)).to.be.true;
    });
  });

  // These should load within Code.org Maker App
  [
    ...WHITELISTED_INTERNAL_PAGES,
    ...WHITELISTED_EXTERNAL_PAGES,
  ].forEach((url) => {
    it(`false for ${url}`, () => {
      expect(openUrlInDefaultBrowser(url)).to.be.false;
    });
  });
});

describe('mayInjectNativeApi', () => {
  // These should get the native APIs injected into the page
  _.uniq(
    [
      ...WHITELISTED_INTERNAL_PAGES,
    ].map(originFromUrl)
  ).forEach((origin) => {
    it(`allows ${origin}`, () => {
      expect(mayInjectNativeApi(origin)).to.be.true;
    });
  });

  // These should never get native APIs injected into the page
  _.uniq(
    [
      ...WHITELISTED_EXTERNAL_PAGES,
      ...BLACKLISTED_PAGES,
    ].map(originFromUrl)
  ).forEach((origin) => {
    it(`blocks ${origin}`, () => {
      expect(mayInjectNativeApi(origin)).to.be.false;
    });
  });
});
