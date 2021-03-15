import { readFileSync } from "fs";
import { Config, uploadFiles } from "../helpers";
import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";

// import { createStatikFiles, walkSync, Config } from "../helpers";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import {
// CloudFrontClient,
// CreateDistributionCommand,
// CreateCachePolicyCommand,
// CreateCloudFrontOriginAccessIdentityCommand,
// CreateInvalidationCommand,
// CreateCachePolicyCommandOutput,
// CreateCloudFrontOriginAccessIdentityCommandOutput,
// CreateDistributionCommandOutput,
// } from "@aws-sdk/client-cloudfront";
// import { getType } from "mime";
// import { v4 as uuid } from "uuid";

// async function invalidateCache(config: Config) {
// if (config.cloudFront === undefined) return;

// console.log("Invalidating cache");
// const cloudFront = new CloudFrontClient({});
// const invalidateReq = new CreateInvalidationCommand({
// DistributionId: config.cloudFront.cloudFrontId,
// InvalidationBatch: {
// CallerReference: new Date().getTime().toString(),
// Paths: {
// Items: ["/*"],
// Quantity: 1,
// },
// },
// });
// await cloudFront.send(invalidateReq);
// cloudFront.destroy();
// console.log("Finished invalidating cache");
// }

// async function createCachePolicy(
// config: Config
// ): Promise<CreateCachePolicyCommandOutput> {
// const cloudFront = new CloudFrontClient({});

// const cachePolicyReq = new CreateCachePolicyCommand({
// CachePolicyConfig: {
// Name: config.buckets.deploy,
// Comment: "",
// MinTTL: 0,
// },
// });

// const cacheRes = await cloudFront.send(cachePolicyReq);
// cloudFront.destroy();
// return cacheRes;
// }
// async function createOriginAccessIdentity(): Promise<CreateCloudFrontOriginAccessIdentityCommandOutput> {
// console.log("Creating Access Identity");
// const cloudFront = new CloudFrontClient({});
// const identityReq = new CreateCloudFrontOriginAccessIdentityCommand({
// CloudFrontOriginAccessIdentityConfig: {
// CallerReference: new Date().getTime().toString(),
// Comment: "",
// },
// });

// const identityRes = await cloudFront.send(identityReq);
// cloudFront.destroy();
// console.log("Access Identity Creation Complete");

// return identityRes;
// }

// function errorResponse(errorCode: number) {
// return {
// ErrorCode: errorCode,
// ResponsePagePath: "/index.html",
// ResponseCode: "200",
// };
// }

// async function createDistribution({
// cloudFront,
// buckets: { deploy },
// }: Config): Promise<CreateDistributionCommandOutput> {
// console.log("Creating Cloud Front");
// const client = new CloudFrontClient({});
// const originId = uuid();
// const cloudFrontReq = new CreateDistributionCommand({
// DistributionConfig: {
// Origins: {
// Quantity: 1,
// Items: [
// {
// Id: originId,
// DomainName: `${deploy}.s3.eu-west-1.amazonaws.com`,
// S3OriginConfig: {
// OriginAccessIdentity: `origin-access-identity/cloudfront/${cloudFront?.originAccessIdentityId}`,
// },
// },
// ],
// },
// CallerReference: new Date().getTime().toString(),
// DefaultCacheBehavior: {
// CachePolicyId: cloudFront?.cachePolicyId,
// TargetOriginId: originId,
// ViewerProtocolPolicy: "redirect-to-https",
// },
// Enabled: true,
// Comment: "",
// DefaultRootObject: "index.html",
// CustomErrorResponses: {
// Quantity: 2,
// Items: [errorResponse(403), errorResponse(404)],
// },
// },
// });

// const cloudFrontRes = await client.send(cloudFrontReq);
// client.destroy();
// if (cloudFrontRes.Distribution?.Id === undefined)
// throw new Error("Could not create cloud front distribution");

// return cloudFrontRes;
// }

export default async function (): Promise<void> {
  // const data = readFileSync("./.statik/config.json");
  // const config: Config = JSON.parse(data.toString());
  // await uploadFiles(config);

  const dynamoClient = new DynamoDBClient({});
  const query = new QueryCommand({
    TableName: "Deploys",
  });
  dynamoClient.send(query);
  // if (config.cloudFront !== undefined) {
  // await invalidateCache(config);
  // return;
  // }
  // config.cloudFront = {};
  // const cacheRes = await createCachePolicy(config);
  // if (cacheRes.CachePolicy?.Id === undefined)
  // throw new Error("Could not create cache policy");
  // config.cloudFront.cachePolicyId = cacheRes.CachePolicy.Id;
  // const identityRes = await createOriginAccessIdentity();
  // if (identityRes.CloudFrontOriginAccessIdentity?.Id === undefined)
  // throw new Error("Could not create origin access identity");
  // config.cloudFront.originAccessIdentityId =
  // identityRes.CloudFrontOriginAccessIdentity.Id;
  // const cloudFrontRes = await createDistribution(config);
  // if (cloudFrontRes.Distribution?.Id === undefined)
  // throw new Error("Could not create cloud front distribution");
  // config.cloudFront.cloudFrontId = cloudFrontRes.Distribution.Id;
  // console.log(`https://${cloudFrontRes.Distribution.DomainName}`);
  // createStatikFiles(config);
}
