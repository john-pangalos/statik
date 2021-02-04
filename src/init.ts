import {
  S3Client,
  Bucket,
  ListBucketsCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import prompts, { PromptObject } from "prompts";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { v4 as uuid } from "uuid";

import { DEPLOY_PREFIX, PREVIEW_PREFIX } from "./constants";

type PackageJson = {
  name: string;
};

type BucketNames = { deploy: string; preview: string };

const s3BucketRejectMessage =
  "As of now the creation of S3 buckets is required for statik to work,\nwe hope you come back in the future to try statik again.";

function getBucketPrefix(name: string, prefix: string): string {
  const s3SafeName = name.toLocaleLowerCase().replace(/[^\w\s\-.]/g, "");
  return `${s3SafeName}-${prefix}`;
}

async function findStatikBuckets(name: string): Promise<Array<Bucket>> {
  const client = new S3Client({});
  const { Buckets: buckets } = await client.send(new ListBucketsCommand({}));
  client.destroy();

  if (buckets === undefined) return [];

  return buckets?.filter(
    (bucket) =>
      bucket.Name?.startsWith(getBucketPrefix(name, DEPLOY_PREFIX)) ||
      bucket.Name?.startsWith(getBucketPrefix(name, PREVIEW_PREFIX))
  );
}

function getCreateBucketReq(name: string): CreateBucketCommand {
  return new CreateBucketCommand({
    Bucket: name,
  });
}

async function createBucket(name: string): Promise<BucketNames> {
  const id = uuid();
  const buckets: BucketNames = {
    deploy: `${getBucketPrefix(name, DEPLOY_PREFIX)}-${id}`,
    preview: `${getBucketPrefix(name, PREVIEW_PREFIX)}-${id}`,
  };
  const client = new S3Client({});

  await client.send(getCreateBucketReq(buckets.deploy));
  await client.send(getCreateBucketReq(buckets.preview));
  return buckets;
}

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

async function promptBucketCreationCheck(): Promise<boolean> {
  const createBucketsCheck: PromptObject = {
    type: "confirm",
    name: "createBucketConfirm",
    message:
      "Statik will now create a deploy and preview S3 bucket in your AWS account, is this okay?",
  };

  const { createBucketConfirm } = await prompts(createBucketsCheck);
  return createBucketConfirm;
}

function createStatikFiles(projectName: string, buckets: BucketNames) {
  mkdirSync("./.statik");
  writeFileSync(
    "./.statik/config.json",
    JSON.stringify({ projectName, buckets }, null, 2),
    {
      flag: "w",
    }
  );
}

export async function init(): Promise<void> {
  const projectName = await promptProjectName();

  const exisitingBuckets = await findStatikBuckets(projectName);

  if (exisitingBuckets.length === 0) {
    if (!(await promptBucketCreationCheck())) {
      console.log(s3BucketRejectMessage);
      return;
    }

    const buckets = await createBucket(projectName);
    createStatikFiles(projectName, buckets);
    console.log("Initialization complete");
  }

  // TODO Deal with people who have multiple statik deploys on the same AWS account
  // TODO Deal with people who have deleted there statik folder and want to reconnect
}
