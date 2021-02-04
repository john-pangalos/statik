import { walkSync } from "./index";
import * as fs from "fs";
jest.mock("fs");

function createDirentMock(name: string, isDir = false): fs.Dirent {
  return {
    name,
    isFile: () => !isDir,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isSymbolicLink: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    isDirectory: () => isDir,
  };
}

describe("Walk Sync function", () => {
  test("returns list of file paths", () => {
    const readdirMock = jest.spyOn<any, any>(fs, "readdirSync");

    readdirMock.mockImplementationOnce(() => {
      return [createDirentMock("index.html"), createDirentMock("dist", true)];
    });
    readdirMock.mockImplementationOnce(() => {
      return [
        createDirentMock("bundle.min.js"),
        createDirentMock("index.min.css"),
      ];
    });
    expect(walkSync("build")).toEqual([
      "build/index.html",
      "build/dist/bundle.min.js",
      "build/dist/index.min.css",
    ]);
  });
});
