const fs = require('fs-extra');
const path = require('path');

const methods = {
  ensureDir: 'ensureDir',
  pathExists: 'pathExists',
  writeFile: 'writeFile',
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
      break;
    } case methods.pathExists: {
      const [ target ] = params;
      await fs.pathExists(path.join(baseDir, target));
      break;
    } case methods.writeFile: {
      const [ target, content, encoding ] = params;
      await fs.writeFile(path.join(baseDir, target), content, encoding);
      break;
    } default:
      throw new Error(`Unknown method ${method}`);
  }

})();
