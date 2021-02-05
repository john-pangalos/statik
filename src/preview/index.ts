import { readFileSync } from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createStatikFiles, walkSync, Config } from "../helpers";
import {
  CloudFrontClient,
  CreateDistributionCommand,
  CreateCachePolicyCommand,
  CreateCloudFrontOriginAccessIdentityCommand,
  CreateInvalidationCommand,
  CreateCachePolicyCommandOutput,
  CreateCloudFrontOriginAccessIdentityCommandOutput,
  CreateDistributionCommandOutput,
} from "@aws-sdk/client-cloudfront";
import { getType } from "mime";
import { v4 as uuid } from "uuid";

async function uploadFiles(config: Config, id: string): Promise<void> {
  const client = new S3Client({});
  const filePrefix = "build";

  console.log("Uploading files");

  for (const file of walkSync(`./${filePrefix}`)) {
    await client.send(
      new PutObjectCommand({
        ACL: "public-read",
        Bucket: config.buckets.preview,
        Key: file.replace(filePrefix, id),
        Body: readFileSync(file),
        ContentType: getType(file) ?? undefined,
      })
    );
  }
  client.destroy();

  console.log("Upload complete!");
}

async function invalidateCache(config: Config, id: string) {
  if (config.cloudFront === undefined) return;

  const currDist = config.preview?.distributions?.find(
    (dist) => dist.previewId === id
  );

  console.log("Invalidating cache");
  const cloudFront = new CloudFrontClient({});
  const invalidateReq = new CreateInvalidationCommand({
    DistributionId: currDist?.cloudFrontId,
    InvalidationBatch: {
      CallerReference: new Date().getTime().toString(),
      Paths: {
        Items: ["/*"],
        Quantity: 1,
      },
    },
  });
  await cloudFront.send(invalidateReq);
  cloudFront.destroy();
  console.log("Finished invalidating cache");
}

async function createCachePolicy(
  config: Config
): Promise<CreateCachePolicyCommandOutput> {
  const cloudFront = new CloudFrontClient({});

  const cachePolicyReq = new CreateCachePolicyCommand({
    CachePolicyConfig: {
      Name: config.buckets.preview,
      Comment: "",
      MinTTL: 0,
      MaxTTL: 0,
    },
  });

  const cacheRes = await cloudFront.send(cachePolicyReq);
  cloudFront.destroy();
  return cacheRes;
}

async function createOriginAccessIdentity(): Promise<CreateCloudFrontOriginAccessIdentityCommandOutput> {
  console.log("Creating Access Identity");
  const cloudFront = new CloudFrontClient({});
  const identityReq = new CreateCloudFrontOriginAccessIdentityCommand({
    CloudFrontOriginAccessIdentityConfig: {
      CallerReference: new Date().getTime().toString(),
      Comment: "",
    },
  });

  const identityRes = await cloudFront.send(identityReq);
  cloudFront.destroy();
  console.log("Access Identity Creation Complete");

  return identityRes;
}

function errorResponse(errorCode: number) {
  return {
    ErrorCode: errorCode,
    ResponsePagePath: "/index.html",
    ResponseCode: "200",
  };
}

async function createDistribution(
  { preview, buckets }: Config,
  id: string
): Promise<CreateDistributionCommandOutput> {
  console.log("Creating Cloud Front");
  const client = new CloudFrontClient({});
  const originId = uuid();
  const cloudFrontReq = new CreateDistributionCommand({
    DistributionConfig: {
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: originId,
            DomainName: `${buckets.preview}.s3.eu-west-1.amazonaws.com`,
            OriginPath: `/${id}`,
            S3OriginConfig: {
              OriginAccessIdentity: `origin-access-identity/cloudfront/${preview?.originAccessIdentityId}`,
            },
          },
        ],
      },
      CallerReference: new Date().getTime().toString(),
      DefaultCacheBehavior: {
        CachePolicyId: preview?.cachePolicyId,
        TargetOriginId: originId,
        ViewerProtocolPolicy: "redirect-to-https",
      },
      Enabled: true,
      Comment: "",
      DefaultRootObject: "index.html",
      CustomErrorResponses: {
        Quantity: 2,
        Items: [errorResponse(403), errorResponse(404)],
      },
    },
  });

  const cloudFrontRes = await client.send(cloudFrontReq);
  client.destroy();
  if (cloudFrontRes.Distribution?.Id === undefined)
    throw new Error("Could not create cloud front distribution");

  return cloudFrontRes;
}

export default async function (id: string): Promise<void> {
  const data = readFileSync("./.statik/config.json");
  const config: Config = JSON.parse(data.toString());
  await uploadFiles(config, id);

  if (
    config.preview?.distributions?.find((dist) => dist.previewId === id) !==
    undefined
  ) {
    await invalidateCache(config, id);
    return;
  }

  if (config.preview === undefined) config.preview = {};
  if (config.preview.distributions === undefined)
    config.preview.distributions = [];

  if (config.preview.cachePolicyId === undefined) {
    const cacheRes = await createCachePolicy(config);
    if (cacheRes.CachePolicy?.Id === undefined)
      throw new Error("Could not create cache policy");
    config.preview.cachePolicyId = cacheRes.CachePolicy.Id;
  }

  if (config.preview.originAccessIdentityId === undefined) {
    const identityRes = await createOriginAccessIdentity();
    if (identityRes.CloudFrontOriginAccessIdentity?.Id === undefined)
      throw new Error("Could not create origin access identity");
    config.preview.originAccessIdentityId =
      identityRes.CloudFrontOriginAccessIdentity.Id;
  }

  const cloudFrontRes = await createDistribution(config, id);
  if (cloudFrontRes.Distribution?.Id === undefined)
    throw new Error("Could not create cloud front distribution");
  config.preview.distributions.push({
    previewId: id,
    cloudFrontId: cloudFrontRes.Distribution.Id,
  });

  console.log(`https://${cloudFrontRes.Distribution.DomainName}`);
  createStatikFiles(config);
}
