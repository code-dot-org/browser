# Maker Toolkit Browser [![GitHub release](https://img.shields.io/github/release/code-dot-org/browser.svg)](https://github.com/code-dot-org/browser/releases/latest) [![Build Status](https://travis-ci.org/code-dot-org/browser.svg?branch=master)](https://travis-ci.org/code-dot-org/browser) [![Build status](https://ci.appveyor.com/api/projects/status/s05fruj5b0hibar6?svg=true)](https://ci.appveyor.com/project/islemaster/browser)

Simple browser exposing native node-serialport to web-based tools on whitelisted Code.org domains.

## Installation

- For installation links and setup instructions, see https://studio.code.org/maker/setup

## Development setup

- Use Node v8
- Close the repository, then run `yarn` to install dependencies
- `yarn start` launches the app in development mode.
- `yarn release` will create OS X, Windows, and Linux builds, upload them to S3, and create a Github release
  - For S3 deployment, the same AWS credential configuration that we use for other Code.org AWS work suffices
  - For Github, you'll need to set an environment variable with a personal Github access token that has full "repo" permissions for this repository (you can set up personal access tokens at https://github.com/settings/tokens): `export GH_TOKEN="token_goes_here"`

## Code signing

- If you build on OS X, you can sign both Windows and OS X applications when building. Code signing will happen automatically if you set up credentials correctly; if they are not provided, unsigned builds will be created.
- OS X: once you've obtained the credentials for OS X app signing, add them to your keychain
- Windows: to sign Windows builds, obtain the appropriate Authenticode p12 file and the password, and set the following environment variables on the command line (assuming you're using OS X or Linux):
  - `export WIN_CSC_LINK=/SecretsDirectory/codeorg-authenticode.p12`
  - `export WIN_CSC_KEY_PASSWORD=secret_password`

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
- I used [libicns](http://icns.sourceforge.net/) via the [icnsutils package](https://packages.debian.org/stretch/icnsutils) to generate OSX icon files from Ubuntu.
