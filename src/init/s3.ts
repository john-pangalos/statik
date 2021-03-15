import {
  S3Client,
  Bucket,
  ListBucketsCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";

import prompts, { PromptObject } from "prompts";

import { v4 as uuid } from "uuid";
import { BucketNames, isUndefined } from "helpers";

import { DEPLOY_PREFIX, PREVIEW_PREFIX } from "helpers/constants";

export const s3BucketRejectMessage = `As of now the creation of S3 buckets is required for statik to work,
we hope you come back in the future to try statik again.`;

function getBucketPrefix(name: string, prefix: string): string {
  const s3SafeName = name.toLocaleLowerCase().replace(/[^\w\s\-.]/g, "");
  return `${s3SafeName}-${prefix}`;
}

export async function promptBucketCreation(): Promise<boolean> {
  const createBucketsCheck: PromptObject = {
    type: "confirm",
    name: "createBucketConfirm",
    message:
      "Statik will now create two S3 buckets in your AWS account, is this okay?",
  };

  const { createBucketConfirm } = await prompts(createBucketsCheck);
  return createBucketConfirm;
}

export async function findStatikBuckets(name: string): Promise<Array<Bucket>> {
  const client = new S3Client({});
  const { Buckets: buckets } = await client.send(new ListBucketsCommand({}));
  client.destroy();

  if (isUndefined(buckets)) return [];

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

export async function createBucket(name: string): Promise<BucketNames> {
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
