import prompts, { PromptObject } from "prompts";
import { readFileSync, mkdirSync, statSync } from "fs";
import { isUndefined, createStatikFiles, Config } from "../helpers";

import {
  dynamoRejectMessage,
  promptTableCreation,
  createDynamoTable,
} from "./dynamo";

import {
  s3BucketRejectMessage,
  createBucket,
  promptBucketCreation,
} from "./s3";

type PackageJson = {
  name: string;
};

async function promptProjectName(): Promise<string> {
  const data = readFileSync("./package.json", "utf-8");
  const packageJson: PackageJson = JSON.parse(data);

  const projectNameInput: PromptObject = {
    type: "text",
    name: "projectName",
    initial: packageJson.name,
    message: "The name of your project",
    validate: (value) => (value === "" ? "Project name required" : true),
  };

  const { projectName } = await prompts(projectNameInput);
  return projectName;
}

export async function init(): Promise<void> {
  try {
    statSync("./statik/config.json");
    return console.log(
      "Statik already exists in this project, exiting for now."
    );
  } catch {
    // Do nothing if file doesn't exist, this is the case we want
  }
  const projectName = await promptProjectName();
  if (!(await promptBucketCreation()))
    return console.log(s3BucketRejectMessage);
  const buckets = await createBucket(projectName);

  if (!(await promptTableCreation())) return console.log(dynamoRejectMessage);
  const dynamo = await createDynamoTable();

  mkdirSync("./.statik", { recursive: true });
  if (
    isUndefined(dynamo) ||
    isUndefined(dynamo.TableDescription) ||
    isUndefined(dynamo.TableDescription.TableName)
  )
    return console.log("Failed to create dynamo table");

  const config: Config = {
    packageName: projectName,
    buckets,
    dynamoTable: {
      name: dynamo.TableDescription.TableName,
    },
  };
  createStatikFiles(config);
  console.log("Initialization complete");

  // TODO Deal with people who have multiple statik deploys on the same AWS account
  // TODO Deal with people who have deleted there statik folder and want to reconnect
}
