# Code.org Browser [![GitHub release](https://img.shields.io/github/release/code-dot-org/browser.svg)](https://github.com/code-dot-org/browser/releases/latest) [![Build Status](https://travis-ci.org/code-dot-org/browser.svg?branch=master)](https://travis-ci.org/code-dot-org/browser) [![Build status](https://ci.appveyor.com/api/projects/status/s05fruj5b0hibar6?svg=true)](https://ci.appveyor.com/project/islemaster/browser)


See https://github.com/code-dot-org/code-dot-org/pull/15531.

## Options
The following environment variables are available to help with local development:

- `NODE_ENV` controls the default Code.org host.
  If set to `production` it will point at the live Code.org site.
  Otherwise it will point to http://localhost-studio.code.org:3000.
- `DASHBOARD_HOST` sets the dashboard host, overriding whatever would normally
  be selected by the `NODE_ENV` setting.  Omit any trailing slash.
  (Example: `DASHBOARD_HOST=https://dashboard-adhoc-maker.cdn-code.org yarn start`)
- `OPEN_DEV_TOOLS`, if set, will cause the developer tools for both the electron
  app and its contained webview to open when the app loads.
  (Example: `OPEN_DEV_TOOLS=1 yarn start`)

## Resources

- [electron-sample-apps/webview/browser](https://github.com/hokein/electron-sample-apps/tree/master/webview/browser)
- https://github.com/johnny-five-io/electron-serialport
- [The `<webview>` tag](https://electron.atom.io/docs/api/webview-tag/)
