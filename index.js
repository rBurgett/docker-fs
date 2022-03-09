const fs = require('fs-extra');
const path = require('path');
const rmrf = require('rmrf-promise');

const methods = {
  ensureDir: 'ensureDir',
  pathExists: 'pathExists',
  writeFile: 'writeFile',
  readFile: 'readFile',
  readdir: 'readdir',
  remove: 'remove',
};

(async function() {
  const { DATA } = process.env;
  if(!DATA)
    throw new Error('You must pass in a DATA environment variable containing base-64 encoded JSON');
  const dataBuf = Buffer.from(DATA, 'base64');
  const json = dataBuf.toString();

  const {
    method = '',
    params = [],
  } = JSON.parse(json);

  if(!method)
    throw new Error('The data object must include a method string');

  const baseDir = path.join('/', 'workdir');

  switch(method) {
    case methods.ensureDir: {
      const [ target ] = params;
      await fs.ensureDir(path.join(baseDir, target));
      process.stdout.write(JSON.stringify(true));
      break;
    } case methods.pathExists: {
      const [ target ] = params;
      const exists = await fs.pathExists(path.join(baseDir, target));
      process.stdout.write(JSON.stringify(exists));
      break;
    } case methods.writeFile: {
      const [ target, encoding ] = params;
      const content = await new Promise((resolve) => {
        const listener = function(data) {
          process.stdin.removeListener('data', listener);
          resolve(data.toString());
        };
        process.stdin.on('data', listener);
        process.stdout.write('\n');
      });
      await fs.writeFile(path.join(baseDir, target), content, encoding);
      process.stdout.write(JSON.stringify(true));
      break;
    } case methods.readFile: {
      const [ target, encoding ] = params;
      const content = await fs.readFile(path.join(baseDir, target), encoding);
      const json = content ? JSON.stringify(content) : '""';
      process.stdout.write(json);
      break;
    } case methods.readdir: {
      const [ target ] = params;
      const files = await fs.readdir(path.join(baseDir, target));
      process.stdout.write(JSON.stringify(files));
      break;
    } case methods.remove: {
      const [ target ] = params;
      await rmrf(path.join(baseDir, target));
      process.stdout.write(JSON.stringify(true));
      break;
    } default:
      throw new Error(`Unknown method ${method}`);
  }
  process.exit(0);
})();
