const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appleId = process.env.APPLEID;
  const appleIdPassword = process.env.APPLEIDPASS;

  if (appleId && appleIdPassword) {
    console.log('notarizing Mac app. This process can take several minutes.');
    await notarize({
      appBundleId: 'com.electron.codeorg-maker-app',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: appleId,
      appleIdPassword: appleIdPassword,
    });
  } else {
    console.log('APPLEID and APPLEIDPASS environment variables not set; skipped notarizing Mac app');
  }
};
