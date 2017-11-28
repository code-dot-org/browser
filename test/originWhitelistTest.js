const { expect } = require('chai');
const {
  openUrlInDefaultBrowser,
  mayInjectNativeApi,
} = require('../src/originWhitelist');

const WHITELISTED_INTERNAL_ORIGINS = [
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

const WHITELISTED_EXTERNAL_ORIGINS = [
  // Google OAuth
  'https://accounts.google.com',
];

const BLACKLISTED_ORIGINS = [
  'https://curriculum.code.org',
  'https://docs.code.org',
  'https://forum.code.org',
  'https://support.code.org',
  'https://wiki.code.org',
];

describe('openUrlInDefaultBrowser', () => {
  // These should load in the system default browser
  [
    ...BLACKLISTED_ORIGINS,
  ].forEach((origin) => {
    it(`true for ${origin}`, () => {
      expect(openUrlInDefaultBrowser(`${origin}/any/test/path`)).to.be.true;
    });
  });

  // These should load within Maker Toolkit
  [
    ...WHITELISTED_INTERNAL_ORIGINS,
    ...WHITELISTED_EXTERNAL_ORIGINS,
  ].forEach((origin) => {
    it(`false for ${origin}`, () => {
      expect(openUrlInDefaultBrowser(`${origin}/any/test/path`)).to.be.false;
    });
  });
});

describe('mayInjectNativeApi', () => {
  // These should get the native APIs injected into the page
  [
    ...WHITELISTED_INTERNAL_ORIGINS,
  ].forEach((origin) => {
    it(`allows ${origin}`, () => {
      expect(mayInjectNativeApi(origin)).to.be.true;
    });
  });

  // These should never get native APIs injected into the page
  [
    ...WHITELISTED_EXTERNAL_ORIGINS,
    ...BLACKLISTED_ORIGINS,
  ].forEach((origin) => {
    it(`blocks ${origin}`, () => {
      expect(mayInjectNativeApi(origin)).to.be.false;
    });
  });
});
