import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

type Deploy = {
  id: string;
  project: string;
  preview: boolean;
  createdAt: Date;
  updatedAt: Date;
  cloudFrontId: string;
};

export async function getProductionDeploy(): Promise<void> {
  const client = new DynamoDBClient({});
  const query = new QueryCommand({
    TableName: "temp",
  });
  await client.send(query);
}
