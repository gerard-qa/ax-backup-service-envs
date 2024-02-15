import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import moment from 'moment'

// Set to true if you wanted to store the envs into a sub-directory
const storeBackup = true;

async function copyFiles(origin: any, target: any) {
  try {
    if (fs.existsSync(origin)) {
      await fse.ensureDir(`${__dirname}/envs`);
      await fse.copy(origin, target);
      console.log(`Successfully copied ${origin}!`);
    } else {
      console.error(`File not found: ${origin}`);
    }
  } catch (err) {
    console.error(err);
  }
}

fs.readdir(`${__dirname}/..`, async (err, subDirectories) => {
  if (err) {
    console.log(err);
  } else {

    for (const directory of subDirectories) {
      const originPath = path.join('../', directory, '.env');
      let targetPath = path.join(__dirname, 'envs', directory, '.env');

      if (storeBackup) {
        const ts = moment().format('YYYY-DD-HH-MM-ss');
        targetPath = path.join(__dirname, 'envs', ts, directory, '.env');
      }
      await copyFiles(originPath, targetPath);
    }
  }
});