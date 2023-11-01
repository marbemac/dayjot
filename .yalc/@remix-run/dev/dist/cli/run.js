/**
 * @remix-run/dev v2.2.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var arg = require('arg');
var semver = require('semver');
var colors = require('../colors.js');
var commands = require('./commands.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var arg__default = /*#__PURE__*/_interopDefaultLegacy(arg);
var semver__default = /*#__PURE__*/_interopDefaultLegacy(semver);

const helpText = `
${colors.logoBlue("R")} ${colors.logoGreen("E")} ${colors.logoYellow("M")} ${colors.logoPink("I")} ${colors.logoRed("X")}

  ${colors.heading("Usage")}:
    $ remix init [${colors.arg("projectDir")}]
    $ remix build [${colors.arg("projectDir")}]
    $ remix dev [${colors.arg("projectDir")}]
    $ remix routes [${colors.arg("projectDir")}]
    $ remix watch [${colors.arg("projectDir")}]

  ${colors.heading("Options")}:
    --help, -h          Print this help message and exit
    --version, -v       Print the CLI version and exit
    --no-color          Disable ANSI colors in console output
  \`build\` Options:
    --sourcemap         Generate source maps for production
  \`dev\` Options:
    --command, -c       Command used to run your app server
    --manual            Enable manual mode
    --port              Port for the dev server. Default: any open port
    --tls-key           Path to TLS key (key.pem)
    --tls-cert          Path to TLS certificate (cert.pem)
  \`init\` Options:
    --no-delete         Skip deleting the \`remix.init\` script
  \`routes\` Options:
    --json              Print the routes as JSON

  ${colors.heading("Values")}:
    - ${colors.arg("projectDir")}        The Remix project directory
    - ${colors.arg("remixPlatform")}     \`node\` or \`cloudflare\`

  ${colors.heading("Initialize a project:")}:

    Remix project templates may contain a \`remix.init\` directory
    with a script that initializes the project. This script automatically
    runs during \`remix create\`, but if you ever need to run it manually
    (e.g. to test it out) you can:

    $ remix init

  ${colors.heading("Build your project")}:

    $ remix build
    $ remix build --sourcemap
    $ remix build my-app

  ${colors.heading("Run your project locally in development")}:

    $ remix dev
    $ remix dev -c "node ./server.js"

  ${colors.heading("Start your server separately and watch for changes")}:

    # custom server start command, for example:
    $ remix watch

    # in a separate tab:
    $ node --inspect --require ./node_modules/dotenv/config --require ./mocks ./build/server.js

  ${colors.heading("Show all routes in your app")}:

    $ remix routes
    $ remix routes my-app
    $ remix routes --json

  ${colors.heading("Reveal the used entry point")}:

    $ remix reveal entry.client
    $ remix reveal entry.server
    $ remix reveal entry.client --no-typescript
    $ remix reveal entry.server --no-typescript
`;

/**
 * Programmatic interface for running the Remix CLI with the given command line
 * arguments.
 */
async function run(argv = process.argv.slice(2)) {
  // Check the node version
  let versions = process.versions;
  if (versions && versions.node && semver__default["default"].major(versions.node) < 18) {
    throw new Error(`️🚨 Oops, Node v${versions.node} detected. Remix requires a Node version greater than 18.`);
  }
  let args = arg__default["default"]({
    "--no-delete": Boolean,
    "--dry": Boolean,
    "--force": Boolean,
    "--help": Boolean,
    "-h": "--help",
    "--json": Boolean,
    "--sourcemap": Boolean,
    "--token": String,
    "--typescript": Boolean,
    "--no-typescript": Boolean,
    "--version": Boolean,
    "-v": "--version",
    // dev server
    "--command": String,
    "-c": "--command",
    "--manual": Boolean,
    "--port": Number,
    "-p": "--port",
    "--tls-key": String,
    "--tls-cert": String
  }, {
    argv
  });
  let input = args._;
  let flags = Object.entries(args).reduce((acc, [key, value]) => {
    key = key.replace(/^--/, "");
    acc[key] = value;
    return acc;
  }, {});
  if (flags.help) {
    console.log(helpText);
    return;
  }
  if (flags.version) {
    let version = require("../package.json").version;
    console.log(version);
    return;
  }
  if (flags["tls-key"]) {
    flags.tlsKey = flags["tls-key"];
    delete flags["tls-key"];
  }
  if (flags["tls-cert"]) {
    flags.tlsCert = flags["tls-cert"];
    delete flags["tls-cert"];
  }
  if (args["--no-delete"]) {
    flags.delete = false;
  }
  flags.interactive = flags.interactive ?? require.main === module;
  if (args["--no-typescript"]) {
    flags.typescript = false;
  }
  let command = input[0];

  // Note: Keep each case in this switch statement small.
  switch (command) {
    case "init":
      await commands.init(input[1] || process.env.REMIX_ROOT || process.cwd(), {
        deleteScript: flags.delete
      });
      break;
    case "routes":
      await commands.routes(input[1], flags.json ? "json" : "jsx");
      break;
    case "build":
      if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
      await commands.build(input[1], process.env.NODE_ENV, flags.sourcemap);
      break;
    case "watch":
      if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";
      await commands.watch(input[1], process.env.NODE_ENV);
      break;
    case "setup":
      commands.setup();
      break;
    case "reveal":
      {
        // TODO: simplify getting started guide
        await commands.generateEntry(input[1], input[2], flags.typescript);
        break;
      }
    case "dev":
      await commands.dev(input[1], flags);
      break;
    default:
      // `remix ./my-project` is shorthand for `remix dev ./my-project`
      await commands.dev(input[0], flags);
  }
}

exports.run = run;
