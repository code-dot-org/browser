const fs = require('fs');
const path = require('path');
const common = require('./_common.json');
const ci = require('./_ci.json');
const release = require('./_release.json');

function combineJson(targetName, ...sources) {
  return new Promise((resolve, reject) => {
    const result = {};
    sources.forEach(source => Object.assign(result, source));
    fs.writeFile(
      path.join(__dirname, `${targetName}.json`),
      JSON.stringify(result, null, 2),
      'utf8',
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

Promise.all([
  combineJson('ci', common, ci),
  combineJson('release', common, release),
]).then(() => {
  process.exit();
}).catch(err => {
  console.log(err);
  process.exit(1);
});
