import {
  DynamoDBClient,
  CreateTableCommand,
  CreateTableCommandInput,
  ListTablesCommand,
  CreateTableCommandOutput,
} from "@aws-sdk/client-dynamodb";

import prompts, { PromptObject } from "prompts";

import { TABLE_PREFIX } from "helpers/constants";

export const dynamoRejectMessage =
  "As of now the creation of a Dynamo table required for statik to work,\nwe hope you come back in the future to try statik again.";

export async function promptTableCreation(): Promise<boolean> {
  const createBucketsCheck: PromptObject = {
    type: "confirm",
    name: "createBucketConfirm",
    message:
      "Statik will now create a dynamo table in your AWS account, is this okay?",
  };

  const { createBucketConfirm } = await prompts(createBucketsCheck);
  return createBucketConfirm;
}

const createTableInput: CreateTableCommandInput = {
  TableName: "Deploys",
  BillingMode: "PROVISIONED",
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  AttributeDefinitions: [
    {
      AttributeName: "Id",
      AttributeType: "S",
    },
    {
      AttributeName: "Project",
      AttributeType: "S",
    },
  ],
  KeySchema: [
    {
      AttributeName: "Id",
      KeyType: "HASH",
    },
    {
      AttributeName: "Project",
      KeyType: "RANGE",
    },
  ],
  GlobalSecondaryIndexes: [{}],
  StreamSpecification: {
    StreamEnabled: false,
  },
};

export async function createDynamoTable(): Promise<CreateTableCommandOutput> {
  const client = new DynamoDBClient({});
  const createTable = new CreateTableCommand(createTableInput);
  const res = await client.send(createTable);
  client.destroy();
  return res;
}

export async function findDynamoTables(): Promise<string[]> {
  // TODO Missing case of when user has more than 100 dynamo tables
  const client = new DynamoDBClient({});
  const listTables = new ListTablesCommand({});
  const res = await client.send(listTables);
  client.destroy();
  if (res.TableNames === undefined) return [];
  return res.TableNames.filter((name: string) => name.startsWith(TABLE_PREFIX));
}
