import { writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { Config } from "./types";

export * from "./polling";
export * from "./types";

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

export function createStatikFiles(config: Config): void {
  writeFileSync("./.statik/config.json", JSON.stringify(config, null, 2), {
    flag: "w",
  });
}
