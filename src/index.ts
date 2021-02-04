#!/usr/bin/env node
import { Command } from "commander";
import { version } from "../package.json";
import { init } from "./init";
import deploy from "./deploy";

const unexpectedErrorMessage = "An unexpected error has occured:";

const program = new Command();
program.version(version);
program
  .command("init")
  .description("initializes statik site require aws infrastructure")
  .action(async () => {
    try {
      await init();
    } catch (err) {
      console.error(unexpectedErrorMessage);
      console.error(err);
    }
  });

program
  .command("deploy")
  .description("deploy production static site")
  .action(async () => {
    try {
      await deploy();
    } catch (err) {
      console.error(unexpectedErrorMessage);
      console.error(err);
    }
  });

program.parse(process.argv);
