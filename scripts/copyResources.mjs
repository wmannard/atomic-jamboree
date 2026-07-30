import * as fs from "fs-extra";
import * as path from "path";
import { existsSync } from "node:fs";

async function copyResource() {
  const source_lang = [
    path.resolve("./node_modules/@coveo/atomic/dist/lang"),
    path.resolve("./node_modules/@coveo/atomic/dist/atomic/lang"),
  ].find((p) => existsSync(p));

  const source_asset = [
    path.resolve("./node_modules/@coveo/atomic/dist/assets"),
    path.resolve("./node_modules/@coveo/atomic/dist/atomic/assets"),
  ].find((p) => existsSync(p));

  const destination_lang = path.resolve("./public/lang");
  const destination_asset = path.resolve("./public/assets");

  if (source_asset) {
    try {
      await fs.copy(source_asset, destination_asset);
      console.log("Asset files copied successfully!");
    } catch (error) {
      console.error("Error copying asset files:", error);
    }
  } else {
    console.warn("Warning: Could not find atomic assets directory");
  }

  if (source_lang) {
    try {
      await fs.copy(source_lang, destination_lang);
      console.log("Lang files copied successfully!");
    } catch (error) {
      console.error("Error copying lang files:", error);
    }
  } else {
    console.warn("Warning: Could not find atomic lang directory");
  }
}

copyResource();
