/**
 * @file Defines the whitelist of sites that are allowed to load in the
 * Maker Toolkit Browser and have our native Maker API (including Serialport)
 * injected.  Sites not on this whitelist will be loaded in the system's
 * native browser, not in Maker Toolkit Browser.
 *
 * Process: Main or Renderer
 */
const {URL} = require('url');

/**
 * Navigation to urls matching any of the given origins will open the page in
 * the system default browser, instead of within Maker Toolkit Browser, even
 * if the origin falls within our general Code.org origin whitelist.
 * @type {Array.<RegExp>}
 */
const BLACKLIST = [
  /curriculum\.code\.org$/i,
  /docs\.code\.org$/i,
  /forum\.code\.org$/i,
  /support\.code\.org$/i,
  /wiki\.code\.org$/i,
];

// Match origins:
// https://studio.code.org                          Production
// https://test-studio.code.org                     Test
// https://dashboard-adhoc-my-branch.cdn-code.org   Ad-Hoc servers
// http://localhost-studio.code.org:3000            Local development
const CODE_ORG_URL = /^https?:\/\/(?:[\w\d-]+\.)?(?:cdn-)?code\.org(?::\d+)?$/i;

/**
 * @param {string} origin
 * @returns {boolean} whether the origin is included in the whitelist
 */
function isOriginWhitelisted(origin) {
  return CODE_ORG_URL.test(origin) &&
    !BLACKLIST.some(site => site.test(origin));
}

/**
 * @param {string} url
 * @returns {boolean} whether the url is included in the whitelist
 */
function isUrlWhitelisted(url) {
  const origin = new URL(url).origin;
  return isOriginWhitelisted(origin);
}

module.exports = {
  isOriginWhitelisted,
  isUrlWhitelisted,
};
