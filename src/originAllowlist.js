/**
 * @file Defines the allowlist of sites that are not allowed to load in the
 * Code.org Maker App and have our native Maker API (including Serialport)
 * injected.  Sites not on this allowlist will be loaded in the system's
 * native browser, not in Code.org Maker App.
 *
 * Process: Main or Renderer
 */

// Match origins:
// https://studio.code.org                          Production
// https://test-studio.code.org                     Test
// https://dashboard-adhoc-my-branch.cdn-code.org   Ad-Hoc servers
// http://localhost-studio.code.org:3000            Local development
const CODE_ORG_URL = /^https?:\/\/(?:[\w\d-]+\.)?(?:cdn-)?code\.org(?::\d+)?$/i;

/**
 * Navigation to urls matching any of the given origins will open the page in
 * the system default browser, instead of within Code.org Maker App, even
 * if the origin falls within our general Code.org origin allowlist.
 * @type {Array.<RegExp>}
 */
const INTERNAL_BLOCKLIST = [
  /curriculum\.code\.org$/i,
  /docs\.code\.org$/i,
  /forum\.code\.org$/i,
  /support\.code\.org$/i,
  /wiki\.code\.org$/i,
];

/**
 * @param {string} origin
 * @returns {boolean} whether we're allowed to inject a native API into a page
 *   loaded from the given origin.
 */
function mayInjectNativeApi(origin) {
  return CODE_ORG_URL.test(origin) &&
    !INTERNAL_BLOCKLIST.some(site => site.test(origin));
}

module.exports = {
  mayInjectNativeApi,
};
