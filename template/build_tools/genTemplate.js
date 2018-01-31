const fs = require('fs');
const path = require('path');
const MT = require('mark-twain');


const mdPath = path.join(__dirname, '../README.md');
const jsonPath = path.join(__dirname, '../dist/md.json');

const jsonML = MT(fs.readFileSync(mdPath).toString());
fs.writeFileSync(jsonPath, JSON.stringify(jsonML, null, 2));
const now = Date.now() / 1000;
const lastModifyTime = now - 11;
const lastAccessTime = now - 11;
// set the changing time to 11 seconds ago
fs.utimesSync(jsonPath, lastModifyTime, lastAccessTime);
