const { Octokit } = require('@octokit/rest');
const fs = require('fs');

const accessToken = process.env.GITHUB_TOKEN;
const appVersion = `v${process.env.npm_package_version}`;
const buildNamePrefix = `Code.org Maker App-${process.env.npm_package_version}-`;
const buildNameSuffixes = ['mac.dmg', 'win.exe', 'linux.deb', 'linux.AppImage'];

if (accessToken) {
  (async() => {
    const octokit = new Octokit({
      auth: accessToken,
    });
    const release = await createRelease();
    const releaseId = release.data.id;

    await uploadAssets(releaseId);
    console.log(`Release drafted. Visit ${release.data.html_url} to publish.`);

    function createRelease() {
      console.log(`Drafting release ${appVersion}`);
      return octokit.rest.repos.createRelease({
        owner: 'code-dot-org',
        repo: 'browser',
        tag_name: appVersion,
        name: appVersion,
        draft: true,
      });
    }

    function uploadAssets(releaseId) {
      return new Promise(async(resolve, reject) => {
        for (let i = 0; i < buildNameSuffixes.length; i++) {
          let buildName = buildNamePrefix + buildNameSuffixes[i];
          let buildFile = fs.readFileSync(`./dist/${buildName}`);
          console.log(`Uploading ${buildName}`);
          await octokit.rest.repos.uploadReleaseAsset({
            owner: 'code-dot-org',
            repo: 'browser',
            release_id: releaseId,
            name: buildName,
            data: buildFile,
          });
        }
        resolve();
      });
    }
  })();
} else {
  console.error('GITHUB_TOKEN not set. Github release will not be created');
}
