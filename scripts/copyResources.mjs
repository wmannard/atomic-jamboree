import * as fs from "fs-extra";
import * as path from "path";

async function copyResource() {
  const source_lang = path.resolve(
    "./node_modules/@coveo/atomic/dist/atomic/lang"
  );
  const destination_lange = path.resolve("./public/lang");

  const source_asset = path.resolve(
    "./node_modules/@coveo/atomic/dist/atomic/assets"
  );
  const destination_asset = path.resolve("./public/assets");

  try {
    // Copy assets files
    await fs.copy(source_asset, destination_asset, {
      filter: (src) => {
        console.log(`Copying: ${src}`);
        return true;
      },
    });
    console.log("Asset Files copied successfully!");
  } catch (error) {
    console.error("Error copying files:", error);
  }

  try {
    // Copy lang files
    await fs.copy(source_lang, destination_lange, {
      filter: (src) => {
        console.log(`Copying: ${src}`);
        return true;
      },
    });

    console.log("Lang Files copied successfully!");
  } catch (error) {
    console.error("Error copying files:", error);
  }
}

copyResource();
