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

const packageJson = require('../package.json');

const COMPONENT_NAME = '<component-name>';
const OPTIONS = '[options]';
const ARGUMENTS = COMPONENT_NAME + ' ' + OPTIONS;
const MIN_NPM_VERSION = '3.0.0';
const ALL_DEPENDENCIES = ['react', 'react-dom'];
const ALL_DEV_DEPENDENCIES = ['webpack'];

let componentName;
let removeComponentDir;

program
  // .command(packageJson.name)
  .version(packageJson.version)
  .arguments(ARGUMENTS)
  .usage(colors.green(ARGUMENTS))
  .action((name) => {
    componentName = name;
  })
  .parse(process.argv);

if (typeof componentName === 'undefined') {
  console.log(colors.cyan('-----------------------------------------------------------'));
  console.error('Please specify the component name:');
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
      console.error(colors.red(`      ${error}`));
    });
  }
}

function checkCompName(compName) {
  const checkResult = validateCompName(compName);
  if (!checkResult.validForNewPackages) {
    console.error(
      `Error:Could not create a component called ${colors.red(compName)}
      because of ${colors.green('npm naming restrictions')}:`
    );
    printCheckResult(checkResult.errors);
    printCheckResult(checkResult.warnings);
    process.exit(1);
  }
}

function mkdirOfComp(root, compName) {
  const isExist = fs.pathExistsSync(root);
  if (isExist) {
    console.error(
      `${colors.red(`Error:the dir ${compName} has already exist,
      try to using a new component name or remove the exist dir.`)}`
    );
    process.exit(1);
  }
  fs.ensureDirSync(root);
  console.log(`Create a new component in ${colors.green(root)}`);
}

function createPackageJsonFile(root, compName) {
  const packageJson = {
    "name": compName,
    "version": "1.0.0",
    "description": "add some your description about this component",
    "repository": {},
    "keywords": [
      "react",
    ],
    "license": "MIT",
  };
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
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
      console.log(colors.error(
        `Error:there is no npm in your environment.`
      ));
      removeComponentDir();
      process.exit(1);
    }
  } catch (err) {
    console.log(err);
  }
}

function installPackages(packages, options) {
  const packType = options === '--save' ? 'dependencies' : 'devDependencies';
  console.log(colors.green(`××××××××××installing ${packType}. Wait a while.`));
  const child = spawnSync('npm', ['install', options].concat(packages), {stdio: 'inherit'});
  if (child.status !== 0) {
    console.log(colors.red(
      `Error:the command ${colors.cyan(`npm install ${packType}`)} has failed.`
    ));
    removeComponentDir();
    process.exit(1);
  } else {
    console.log(colors.green(
      `Info:${packType} installed succesfully.`
    ));
  }
}

function componentInit(root, compName) {
  const templatePath = path.join(__dirname, '../template');
  fs.copySync(templatePath, root);
}

function createComponent(compName) {
  const root = path.resolve(compName);
  removeComponentDir = () => {
    fs.removeSync(root);
  };
  checkCompName(compName);
  mkdirOfComp(root, compName);
  createPackageJsonFile(root, compName);
  process.chdir(root);
  checkNpmValid();
  installPackages(ALL_DEPENDENCIES, "--save");
  installPackages(ALL_DEV_DEPENDENCIES, "--save-dev");
  componentInit(root, compName);
}

createComponent(componentName);

