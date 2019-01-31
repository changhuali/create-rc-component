#!/usr/bin/env node

/*
*Check user's version of node, if it's smaller than the leastVersion, exit and promt the error.
*This file must work on node 0.10+.
*/

'use strict';

const colors = require('colors');
const leastVersion = 8;
const userNodeVersion  = process.versions.node;
const majorSemver = userNodeVersion.split('.')[0];

if (majorSemver < leastVersion) {
  console.error(
    colors.red(
      `Error:You are running Node ${userNodeVersion}.
      create scrc component requires Node 8 or higher.
      Please update your version of Node.`
    )
  );
  process.exit(1);
}

require('./createScRcComponent');
