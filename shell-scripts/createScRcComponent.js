/*
*Create a user component dir.
*This file must work on node 8+.
*/

'use strict';

const colors = require('colors');
const program = require('commander');
const path = require('path');
const validateCompName = require('validate-npm-package-name');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;
const semver = require('semver');
const spawnSync = require('child_process').spawnSync;

const toolPackageJson = require('../package.json');
const compPackageJson = require('../template/package.json');

const COMPONENT_NAME = '<component-name>';
const OPTIONS = '[options]';
const ARGUMENTS = COMPONENT_NAME + ' ' + OPTIONS;
const MIN_NPM_VERSION = '3.0.0';

let componentName;
let removeComponentDir;

program
  .version(toolPackageJson.version)
  .arguments(ARGUMENTS)
  .usage(colors.green(ARGUMENTS))
  .action((name) => {
    componentName = name;
  })
  .parse(process.argv);

if (typeof componentName === 'undefined') {
  console.log(colors.cyan('-----------------------------------------------------------'));
  console.log('Please specify the component name:');
  console.log(`  ${colors.cyan(program.name())} ${colors.green(COMPONENT_NAME)}`);
  console.log();
  console.log('For example:');
  console.log(`  ${colors.cyan(program.name())} ${colors.green('my-component')}`);
  console.log();
  console.log(`Run ${colors.cyan(`${program.name()} --help`)} to get help information.`);
  console.log(colors.cyan('-----------------------------------------------------------'));
  process.exit(1);
}

function printCheckResult(results) {
  if (typeof results !== 'undefined') {
    results.forEach(error => {
      console.log(colors.cyan(`      ${error}`));
    });
  }
}

function checkCompName(compName) {
  const checkResult = validateCompName(compName);
  if (!checkResult.validForNewPackages) {
    console.log(
      `${colors.bgRed('Error')}: Could not create a component called ${colors.yellow(compName)} because of ${colors.yellow('npm naming restrictions')}:`
    );
    printCheckResult(checkResult.errors);
    printCheckResult(checkResult.warnings);
    process.exit(1);
  }
}

function mkdirForComp(root, compName) {
  const isExist = fs.pathExistsSync(root);
  if (isExist) {
    console.log(`${colors.bgRed('Error')}: The dir has already exist, try to using a new component name or remove the exist dir.`);
    process.exit(1);
  }
  fs.ensureDirSync(root);
  console.log(`Create a new component in ${colors.green(root)}`);
}

function createPackageJsonFile(root, compName) {
  compPackageJson.name = compName;
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(compPackageJson, null, 2)
  );
}

function createReadmeMdFile(root, compName) {
  const mdContent = `
  # ${compName.replace(/^(.)/, (n) => n.toUpperCase())}
  
  ## 代码演示
  
  ## API
  |属性|说明|类型|默认值|
  |---|---|---|---|
  `;
  fs.writeFileSync(
    path.join(root, 'README.md'),
    mdContent
  );
}

function createComponentTemplate(root, compName) {
  const template = `import React from 'react';
import './styles/index.less';

export default function CompName() {
  return (
    <div>test</div>
  );
}
`
  fs.writeFileSync(
    path.join(root, './component/index.js'),
    template
  );
}

function checkNpmValid() {
  let npmVersion = null;
  let npmVersionValid = false;
  try {
    npmVersion = execSync('npm --version')
      .toString()
      .trim();
    npmVersionValid = semver.gte(npmVersion, MIN_NPM_VERSION);
    if (!npmVersion) {
      console.log(`${colors.bgRed('Error')}: There is no npm in your environment.`);
      removeComponentDir();
      process.exit(1);
    }
  } catch (err) {
    console.log(err);
  }
}

function installPackages() {
  console.log(`${colors.bgCyan('Info')}: Installing dependencies and devDependencies. Please wait a while.`);
  const child = spawnSync('npm', ['install'], {stdio: 'inherit'});
  if (child.status !== 0) {
    console.log(`Error: The command ${colors.cyan('npm install has failed.')}`);
    process.exit(1);
  }
}

function componentInit(root, compName) {
  const templatePath = path.join(__dirname, '../template');
  fs.copySync(templatePath, root);
}

function outputSuccessInfo(compName) {
  console.log();
  console.log(`${colors.bgGreen('Success')}: You have created a component ${colors.green(compName)}`);
  console.log();
  console.log(`You can run command ${colors.cyan(`cd ${compName}`)} and then run commands below:`);
  console.log();
  console.log(colors.cyan(`   npm run dev   `) + '---start developing you component');
  console.log();
  console.log(colors.cyan(`   npm run test    `) + '---test you component with jest');
  console.log();
  console.log(colors.cyan(`   npm run publish   `) + '---publish you component to npm');
  console.log();
}

function createComponent(compName) {
  const root = path.resolve(compName);
  removeComponentDir = () => {
    fs.removeSync(root);
  };
  checkCompName(compName);
  mkdirForComp(root, compName);
  componentInit(root, compName);
  createPackageJsonFile(root, compName);
  createReadmeMdFile(root, compName);
  createComponentTemplate(root, compName);
  process.chdir(root);
  checkNpmValid();
  installPackages();
  outputSuccessInfo(compName);
}

createComponent(componentName);

