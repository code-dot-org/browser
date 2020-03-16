# Code.org Maker App [![GitHub release](https://img.shields.io/github/release/code-dot-org/browser.svg)](https://github.com/code-dot-org/browser/releases/latest) [![Build Status](https://travis-ci.org/code-dot-org/browser.svg?branch=master)](https://travis-ci.org/code-dot-org/browser) [![Build status](https://ci.appveyor.com/api/projects/status/s05fruj5b0hibar6?svg=true)](https://ci.appveyor.com/project/islemaster/browser)

Simple browser exposing native node-serialport to web-based tools on allowlisted Code.org domains.

---

## Installation

- For installation links and setup instructions, see https://studio.code.org/maker/setup

### Silent install / group install

We support a few approaches for installing Code.org Maker App to a group of computers on a school network.

Here's our MSI package. Windows network administrators may find this is the easiest approach to deploy to computers on a network. Please note that auto-updates are disabled when the app is installed via MSI.

https://downloads.code.org/maker/Code.org+Maker+App-1.1.5-msi-win-win.msi

Another approach is a silent install using the installer we've provided on the downloads page. It accepts the following command switches:

- `/S` (case-sensitive) puts the installer in "silent" mode for unattended install
- `/D=<directory>` (also case-sensitive) lets you specify an install directory from the command line

Example:

```
Code.org Maker App-1.1.5-win.exe /S /D="C:\Program Files\Code.org Maker App"
```

These are standard install options for a [Nullsoft (NSIS)](https://en.wikipedia.org/wiki/Nullsoft_Scriptable_Install_System) installer. You can read more about them in the NullSoft manual in [chapter 3 (Installer Usage)](https://nsis.sourceforge.io/Docs/Chapter3.html#installerusage) and [chapter 4 (Silent Installers)](https://nsis.sourceforge.io/Docs/Chapter4.html#silent).
Please give these options a try and let us know if they work for you. We're always looking for feedback!

---

## Development setup

- Use Node v8: `nvm use v8.9.1` (`nvm install v8.9.1` if it's not available)
- Close the repository, then run `yarn` to install dependencies
- `yarn start` launches the app in development mode.
- `yarn release` will create OS X, Windows, and Linux builds, upload them to S3, and create a Github release. For full instructions, see below
  - For S3 deployment, the same AWS credential configuration that we use for other Code.org AWS work suffices
  - For Github (currently disabled due to a bug in the builder), you'll need to set an environment variable with a personal Github access token that has full "repo" permissions for this repository (you can set up personal access tokens at https://github.com/settings/tokens): `export GH_TOKEN="token_goes_here"`
  - To build an MSI installer, see below

---

## Releasing

**Note:** You can only release an OS X app from an OS X machine. If you are using Linux or Windows, you'll need to pair with someone with a Mac to release the Maker app! If you are on OS X, you can release on all platforms.

### Code signing

This is the process of setting up certificates (paired with private keys) on your personal machine that are required for releasing the Maker app.

1. Obtain the LastPass credentials for our Apple Developer account and log in to developer.apple.com.
2. Go to "Account" > "Certificates, Identifiers & Profiles" -- you should see a list of certificates.
3. Open the newest (i.e., expiration date that is farthest away) "Developer ID Application" and download it. This should download a .cer file.
4. Open the Keychain Access app (comes with OS X by default). Double-click the downloaded .cer file to add it to your keychain.
5. Examine the certificate in your keychain. It should look something like the table below, where the "Developer ID Application" is the outer certificate, and the "Code.org" private key is nested within that certificate. **If your certificate does not contain a private key, you will need to [generate a new certificate](#generating-a-new-developer-id-application) and perform steps 2-5 again.**
   |Name|Kind|Expires|Keychain|
   |----|----|-------|--------|
   |Developer ID Application: Code.org ([codeorg_id_here])|certificate|Mar 13, 2025|login|
   | > Code.org|private key|--|login|
6. In Keychain Access, right-click on the "Developer ID Application" and export it as a .p12 file for our Windows build. (If the certificate cannot be exported as .p12, that means it is improperly formatted, most likely missing its private key.)
7. To sign Windows builds, we need to set up two environment variables from the command line:
   1. `export WIN_CSC_LINK=/SecretsDirectory/codeorg-authenticode.p12` (where path matches your path to the .p12 file generated in step 6)
   2. `export WIN_CSC_KEY_PASSWORD=secret_password` (where `secret_password` is stored in the "MakerAppWindowsBuildPassword" note in LastPass)

### Releasing a new version

1. Bump the version in `package.json`
2. Run `yarn release`

### Generating a new Developer ID Application

1. Obtain the LastPass credentials for our Apple Developer account and log in to developer.apple.com.
2. Go to "Account" > "Certificates, Identifiers & Profiles."
3. Click the "+" button next to the "Certificates" header to create a new certificate.
4. Choose the "Software" > "Developer ID Application" option and click "Continue".
5. You should now be asked to upload a Certificate Signing Request (CSR). Open the Keychain Access app to create a CSR.
6. Within Keychain Access, use the top navbar to navigate to "Keychain Access" > "Certificate Assistant" > "Request a Certificate From a Certificate Authority"
7. Fill out the certificate information -- "User Email Address" is your Code.org email, "Common Name" is your name, "CA Email Address" is the email associated with our Apple Developer account, and "Request is: Saved to disk".
8. Upload the .certSigningRequest file to finish generating our new certificate.

## MSI Installer (for networked Windows installs)

- First time setup:
  - Copy the `codeorg-authenticode.p12` Windows code signing file into the `browser/config` directory
- Make sure Docker is running on your computer (https://docs.docker.com/docker-for-mac/install/ for OS X, should show up in your toolbar as running when you’re ready)
- Pull the `msi-installer` branch from this repo, merge desired changes in from master, and bump to the correct version number
- run `yarn msi-docker-build`
- The build will appear on the local machine in dist
- Copy to the S3 bucket (requires AWS CLI and Code.org credentials): `aws s3 cp ./dist/<filename>.msi s3://downloads.code/org/maker/`

---

## Options

The following environment variables are available to help with local development:

- `NODE_ENV` controls the default Code.org host.
  If set to `production` it will point at the live Code.org site.
  Otherwise it will point to http://localhost-studio.code.org:3000.
- `DASHBOARD_HOST` sets the dashboard host, overriding whatever would normally
  be selected by the `NODE_ENV` setting. Omit any trailing slash.
  (Example: `DASHBOARD_HOST=https://dashboard-adhoc-maker.cdn-code.org yarn start`)
- `OPEN_DEV_TOOLS`, if set, will cause the developer tools for both the electron
  app and its contained webview to open when the app loads.
  (Example: `OPEN_DEV_TOOLS=1 yarn start`)

---

## Resources

- [electron-sample-apps/webview/browser](https://github.com/hokein/electron-sample-apps/tree/master/webview/browser)
- https://github.com/johnny-five-io/electron-serialport
- [The `<webview>` tag](https://electron.atom.io/docs/api/webview-tag/)
- I used [libicns](http://icns.sourceforge.net/) via the [icnsutils package](https://packages.debian.org/stretch/icnsutils) to generate OSX icon files from Ubuntu.
