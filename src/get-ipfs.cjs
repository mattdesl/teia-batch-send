const Hash = require('ipfs-only-hash');
const fs = require('fs/promises');
const path = require('path');

(async() => {
  const file = path.resolve(__dirname, '../dist/index.html');
  const buf = await fs.readFile(file)
  const hash = await Hash.of(buf)
  console.log(hash);
})();