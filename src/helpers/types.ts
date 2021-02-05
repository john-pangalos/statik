export type Config = {
  packageName: string;
  buckets: {
    deploy: string;
    preview: string;
  };
  cloudFront?: {
    cachePolicyId?: string;
    originAccessIdentityId?: string;
    cloudFrontId?: string;
  };
  preview?: {
    cachePolicyId?: string;
    originAccessIdentityId?: string;
    distributions?: Array<{ previewId: string; cloudFrontId: string }>;
  };
};
