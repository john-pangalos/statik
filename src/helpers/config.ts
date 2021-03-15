import { writeFileSync } from "fs";

export type Config = {
  packageName: string;
  buckets: {
    deploy: string;
    preview: string;
  };
  dynamoTable: {
    name: string;
  };
};

export type BucketNames = { deploy: string; preview: string };

export function createStatikFiles(config: Config): void {
  writeFileSync("./.statik/config.json", JSON.stringify(config, null, 2), {
    flag: "w",
  });
}
