/**
 * @file Defines the whitelist of sites that are allowed to load in the
 * Code.org Maker App and have our native Maker API (including Serialport)
 * injected.  Sites not on this whitelist will be loaded in the system's
 * native browser, not in Code.org Maker App.
 *
 * Process: Main or Renderer
 */
const {URL} = require('url');

// Match origins:
// https://studio.code.org                          Production
// https://test-studio.code.org                     Test
// https://dashboard-adhoc-my-branch.cdn-code.org   Ad-Hoc servers
// http://localhost-studio.code.org:3000            Local development
const CODE_ORG_URL = /^https?:\/\/(?:[\w\d-]+\.)?(?:cdn-)?code\.org(?::\d+)?$/i;

/**
 * Navigation to urls matching any of the given origins will open the page in
 * the system default browser, instead of within Code.org Maker App, even
 * if the origin falls within our general Code.org origin whitelist.
 * @type {Array.<RegExp>}
 */
const INTERNAL_BLACKLIST = [
  /curriculum\.code\.org$/i,
  /docs\.code\.org$/i,
  /forum\.code\.org$/i,
  /support\.code\.org$/i,
  /wiki\.code\.org$/i,
];

/**
 * Limited set of non-Code.org pages we will load within Code.org Maker App,
 * mostly for things like OAuth or other integrations with external services.
 * We won't inject native APIs to these sites even though they load within the
 * app.
 * @type {Array.<RegExp>}
 */
const EXTERNAL_WHITELIST = [
  // Google OAuth
  /\/\/accounts\.google\.com(?:$|\/)/i,
  // Google GSuite prefix sometimes used for district-specific redirects.
  /\/\/www\.google\.com\/a\//i,
  // Facebook OAuth
  /\/\/www\.facebook\.com\/v2.6\/dialog\/oauth/i,
  /\/\/www\.facebook\.com\/logout/i,
  // Microsoft OAuths
  /\/\/login\.live\.com(?:$|\/)/i,
  // Clever Auth
  /\/\/clever.com\/(?:in|login|oauth)(?:$|\/)/i,
  // School- and District-specific portals
  /\/\/sso.pcsd1.org(?:$|\/)/i,
];

/**
 * @param {string} url
 * @returns {boolean} whether the url should be opened in the system default
 *   browser.
 */
function openUrlInDefaultBrowser(url) {
  const origin = new URL(url).origin;
  return !(originIsOnInternalWhitelist(origin) || urlIsOnExternalWhitelist(url));
}

/**
 * @param {string} origin
 * @returns {boolean} whether we're allowed to inject a native API into a page
 *   loaded from the given origin.
 */
function mayInjectNativeApi(origin) {
  return originIsOnInternalWhitelist(origin);
}

function originIsOnInternalWhitelist(origin) {
  return CODE_ORG_URL.test(origin) &&
    !INTERNAL_BLACKLIST.some(site => site.test(origin));
}

function urlIsOnExternalWhitelist(url) {
  return EXTERNAL_WHITELIST.some(site => site.test(url));
}

module.exports = {
  openUrlInDefaultBrowser,
  mayInjectNativeApi,
};
