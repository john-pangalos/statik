import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { Config } from "./config";
import { isUndefined } from "./checks";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getType } from "mime";

export function walkSync(currentDirPath: string): Array<string> {
  return readdirSync(currentDirPath, { withFileTypes: true }).reduce<string[]>(
    (acc, dirent) => {
      const filePath = join(currentDirPath, dirent.name);
      if (dirent.isFile()) return [...acc, filePath];
      return [...acc, ...walkSync(filePath)];
    },
    []
  );
}

export async function uploadFiles(
  config: Config,
  path?: string
): Promise<void> {
  const client = new S3Client({});
  const filePrefix = "build";

  console.log("Uploading files");

  let createKeyFromFile = (file: string) => file.replace(`${filePrefix}/`, "");
  if (!isUndefined(path))
    createKeyFromFile = (file: string) => file.replace(filePrefix, path);

  for (const file of walkSync(`./${filePrefix}`)) {
    await client.send(
      new PutObjectCommand({
        ACL: "public-read",
        Bucket: config.buckets.deploy,
        Key: createKeyFromFile(file),
        Body: readFileSync(file),
        ContentType: getType(file) ?? undefined,
      })
    );
  }
  client.destroy();

  console.log("Upload complete!");
}
