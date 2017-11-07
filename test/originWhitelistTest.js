const { expect } = require('chai');
const {
  isOriginWhitelisted,
  isUrlWhitelisted,
} = require('../src/originWhitelist');

const WHITELISTED_ORIGINS = [
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

const BLACKLISTED_ORIGINS = [
  'https://curriculum.code.org',
  'https://docs.code.org',
  'https://forum.code.org',
  'https://support.code.org',
  'https://wiki.code.org',
];

describe('isOriginWhitelisted', () => {
  WHITELISTED_ORIGINS.forEach((origin) => {
    it(`allows ${origin}`, () => {
      expect(isOriginWhitelisted(origin)).to.be.true;
    });
  });

  BLACKLISTED_ORIGINS.forEach((origin) => {
    it(`blocks ${origin}`, () => {
      expect(isOriginWhitelisted(origin)).to.be.false;
    });
  });
});

describe('isUrlWhitelisted', () => {
  WHITELISTED_ORIGINS.forEach((origin) => {
    it(`allows ${origin}`, () => {
      expect(isUrlWhitelisted(`${origin}/any/test/path`)).to.be.true;
    });
  });

  BLACKLISTED_ORIGINS.forEach((origin) => {
    it(`blocks ${origin}`, () => {
      expect(isUrlWhitelisted(`${origin}/any/test/path`)).to.be.false;
    });
  });
});
