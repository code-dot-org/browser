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
  'https://accounts.google.com/logout',
  // Facebook OAuth
  'https://www.facebook.com/v2.6/dialog/oauth',
  'https://www.facebook.com/logout.php',
  'https://www.facebook.com/logout.php?next=https://code.org/&access_token=XXXXXX|YYYYYYYYYYYY|ZZZZZZ',
];

const BLACKLISTED_PAGES = [
  'https://curriculum.code.org',
  'https://docs.code.org',
  'https://forum.code.org',
  'https://support.code.org',
  'https://wiki.code.org',
  'https://www.google.com',
  'https://www.facebook.com',
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

  // These should load within Maker Toolkit Browser
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
