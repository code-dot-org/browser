# Code.org Maker App [![GitHub release](https://img.shields.io/github/release/code-dot-org/browser.svg)](https://github.com/code-dot-org/browser/releases/latest) [![Build Status](https://github.com/code-dot-org/browser/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/code-dot-org/browser/actions/workflows/main.yml)

Simple browser exposing native node-serialport to web-based tools on allowlisted Code.org domains.

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

## Development setup

- Use Node v14: `nvm use v14.16.1` (`nvm install v14.16.1` if it's not available)
- Clone the repository, then run `yarn` to install dependencies
- `yarn start` launches the app in development mode.
- `yarn win|mac|linux` will create builds for the given OS in the `./dist` directory
- `yarn release` will create OS X, Windows, and Linux builds and upload them to S3, and create a Github release (note: use the build command above to create pre-release builds and verify them on Windows, Mac, and Linux prior to releasing). For full instructions, see below
  - For S3 deployment, the same AWS credential configuration that we use for other Code.org AWS work suffices
  - For Github, you'll need to set an environment variable with a personal Github access token that has full "repo" permissions for this repository (you can set up personal access tokens at https://github.com/settings/tokens): `export GITHUB_TOKEN="token_goes_here"`
  - To build an MSI installer, see below

## Releasing

**Note:** You can only release an OS X app from an OS X machine. If you are using Linux or Windows, you'll need to pair with someone with a Mac to release the Maker app! If you are on OS X, you may be able to release on all platforms; depending on your hardware and OS version, you may need a Windows (virtual) machine to successfully create a build with native extensions. However you create the builds, it is important that you verify they run on their intended platforms before uploading to S3.

### AWS Access

First, read through the [AWS Account Login](https://docs.google.com/document/d/1dDfEOhyyNYI2zIv4LI--ErJj6OVEJopFLqPxcI0RXOA/edit) doc to make sure you have the correct credentials. Once you have AWS account access, we can set up access through your command line with the steps below (note that some steps are duplicative of steps in the Google Doc).

1. Run `brew info awscli` to make sure you have the AWS command line tool. If you don't, run `brew install awscli`.
2. From the root of the `code-dot-org` repository, run `./bin/aws_access`. A successful response should look like: `AWS access: GoogleSignIn/<your_codeorg_google_email>`.
3. Check that you have an AWS credentials file by running `cat ~/.aws/credentials`.
4. If your AWS credentials from step 2 are nested under a `[cdo]` profile, run `export AWS_PROFILE=cdo` to make cdo your default AWS profile.

### Code signing

This is the process of setting up certificates (paired with private keys) on your personal machine that are required for releasing the Maker app.

1. Download the .p12 file from the "MakerAppCertificate" note in LastPass. LastPass does not allow file downloads from its browser extension -- you have to have the desktop app for this.
2. Open the Keychain Access app (comes with OS X by default). Double-click the downloaded .p12 file to add it to your keychain. You will be prompted for a password, which is stored in the LastPass note description.
3. Examine the certificate in your keychain (make sure you're in the "login" Keychain and "Certificates" Category, which are found in the lefthand navigation). It should look something like the table below, where the "Developer ID Application" is the outer certificate, and the "Code.org" private key is nested within that certificate. **If your certificate does not contain a private key, you will most likely need to generate a new certificate by following the steps in [Generating a new Developer ID Application](#generating-a-new-developer-id-application).**
   |Name|Kind|Expires|Keychain|
   |----|----|-------|--------|
   |Developer ID Application: Code.org ([codeorg_id_here])|certificate|Mar 13, 2025|login|
   | > Code.org|private key|--|login|
4. To sign Windows builds, we need to set up two environment variables from the command line:
   1. `export WIN_CSC_LINK=/SecretsDirectory/codeorg_signing_certificate.p12` (where path corresponds to the .p12 file downloaded in step 1)
   2. `export WIN_CSC_KEY_PASSWORD='secret_password'` (`secret_password` is stored in the "MakerAppCertificate" note in LastPass)
5. To notarize the Mac builds, we need to set up two additional environment variables
   1. `export APPLEID=[Apple ID from LastPass]`
   2. `export APPLEIDPASS=[App specific password in Apple entry in LastPass]`

### Testing a build before release
Note: It is important to verify working builds for each operating system we support (Mac, Linux, Windows 32 and 64 bit) before creating a release.
1. Run `yarn win && yarn mac && yarn linux`
1. Find the builds in the `./dist` folder and run them on their intended OS verifying connectivity and core features

#### Verifying Windows and Linux builds using VirtualBox
1. Download and install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
1. Download the lastest Windows 64 bit (x64) and 32 bit (x86) VirtualBox archives from the [Microsoft Edge Tools site](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/) and unpack the zip files. For Linux, download the current [Ubuntu LTS version](https://ubuntu.com/download/desktop)
1. Set up each of the downloaded builds in VirtualBox:
   1. Go to File -> Import Appliance -> select the `.ovf` file from the downloaded archive
   1. Select the VM and open Settings
   1. Fix any incompatible settings by following the instructions shown with the :warning: icon.
   1. Select Storage -> Add New Storage Attachment (floppy disk icon) -> Optical Drive -> select VboxGuestAdditions.iso
   1. Select Ports -> USB -> Enable USB Controller
   1. Save and exit Settings
   1. Start the VM (default Windows password is `Passw0rd!`)
   1. In Windows/Linux open the CD drive and run `VBoxWindowsAdditions` accepting all default settings (restart if prompted)
1. In the running VM, install the Maker App build you would like to verify (copy installer from `./dist` on your host machine)
1. Connect a Circuit Playground and "capture" it in the VM by right clicking the USB icon in the bottom right and selecting your board
1. Open the Maker App, verify connectivity by clicking the Setup cog in the top toolbar, try out the core features using this [test project](https://studio.code.org/projects/applab/P-JzGsvERn5gESQ5MSym4i_RcmaMWiWr2EKWsXB-OjI)

### Releasing a new version

1. Bump the version in `package.json`
1. If all builds from the verify process above were built on your mac, simply run `yarn release`. If your Windows executable either failed to build or failed to run then you will need to rebuild it on a Windows virtual machine.

#### Using a Virtual Machine to build and release a new Windows version
1. Start the Windows 64 bit Virtual Machine that you installed in the **Verify** process above.
1. Using the built-in Edge browser, download and install NodeJS 14. Accept all default settings until you reach *Tool for Native Modules* screen and Check "Automatically install the necessary tools." Several install scripts will run. Accept any default settings when prompted.
1. Install [Visual Studio Community](https://visualstudio.microsoft.com/downloads/). Select "Desktop development with C++" when prompted (this is necessary to build the native Serial adapter).
1. See instruction in Code Signing above for downloading the `.p12` certificate. Copy it to the virtual machine
1. Copy over the the entire `browser` directory from your host machine to the VM (or download your branch from Github)
1. Open Powershell as Administrator (use search box on Windows toolbar)
   1. `cd path\to\browser`
   1. `node -v` v14.x.x
   1. `npm install -g yarn`
   1. `yarn install`
   1. `$Env:WIN_CSC_LINK = "/SecretsDirectory/codeorg_signing_certificate.p12"`
   1. `$Env:WIN_CSC_KEY_PASSWORD = "secret_password"` (`secret_password` is stored in the "MakerAppCertificate" note in LastPass)
   1. `yarn release-win`
1. Manually upload the files created in `./dist` to S3 (automated S3 publishing does not work from Windows) and also copy them to `./dist` on your host operating system.
1. On your host OS run `yarn release-mac && yarn release-linux && yarn github-release`. This will create the mac and linux builds, upload them to S3, and draft a release in Github).

### Generating a new Developer ID Application

These steps are only necessary if the certificate you have obtained from LastPass (or some other internal source) **does not contain the private key**. Try the steps in [Code signing](#code-signing) first before generating a new certificate. Apple allows 5 certificates before we have to start revoking older certificates.

1. Obtain the LastPass credentials for our Apple Developer account and log in to developer.apple.com. The Accounts/A-Team have permissions to share these credentials.
2. Go to "Account" > "Certificates, Identifiers & Profiles."
3. Click the "+" button next to the "Certificates" header to create a new certificate.
4. Choose the "Software" > "Developer ID Application" option and click "Continue".
5. You should now be asked to upload a Certificate Signing Request (CSR). Open the Keychain Access app (comes default on OS X) to create a CSR.
6. Within Keychain Access, use the top navbar to navigate to "Keychain Access" > "Certificate Assistant" > "Request a Certificate From a Certificate Authority"
7. Fill out the certificate information -- "User Email Address" is your Code.org email, "Common Name" is your name, "CA Email Address" is the email associated with our Apple Developer account, and "Request is: Saved to disk".
8. Upload the .certSigningRequest file to finish generating our new certificate.
9. Download the certificate. Double-click the downloaded file to add the certificate to your keychain.
10. Examine the certificate to make sure it includes a private key (see step 3 of [Code signing](#code-signing) for more details).
11. If a private key is present, you can export the certificate + private key as a .p12 file, which will be needed for step 4 of [Code signing](#code-signing).

## MSI Installer (for networked Windows installs)

- First time setup:
  - Download and unzip the `codeorg_signing_certificate.p12` (stored in the "MakerAppCertificate" note in LastPass) code signing file into the `browser/config` directory
- Make sure Docker is running on your computer (https://docs.docker.com/docker-for-mac/install/ for OS X, should show up in your toolbar as running when you’re ready)
- Pull the `msi-installer` branch from this repo, merge desired changes in from main, and bump to the correct version number
- run `yarn msi-docker-build`
- The build will appear on the local machine in dist
- Copy to the S3 bucket (requires AWS CLI and Code.org credentials): `aws s3 cp ./dist/<filename>.msi s3://downloads.code/org/maker/`

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

## Resources

- [electron-sample-apps/webview/browser](https://github.com/hokein/electron-sample-apps/tree/master/webview/browser)
- https://github.com/johnny-five-io/electron-serialport
- [The `<webview>` tag](https://electron.atom.io/docs/api/webview-tag/)
- I used [libicns](http://icns.sourceforge.net/) via the [icnsutils package](https://packages.debian.org/stretch/icnsutils) to generate OSX icon files from Ubuntu.
