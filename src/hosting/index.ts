// import { Config } from "helpers";
// import {
// CloudFrontClient,
// CreateInvalidationCommand,
// } from "@aws-sdk/client-cloudfront";

// export async function invalidateCache(
// config: Config,
// id: string
// ): Promise<void> {
// if (config.cloudFront === undefined) return;

// const currDist = config.preview?.distributions?.find(
// (dist) => dist.previewId === id
// );

// console.log("Invalidating cache");
// const cloudFront = new CloudFrontClient({});
// const invalidateReq = new CreateInvalidationCommand({
// DistributionId: currDist?.cloudFrontId,
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
