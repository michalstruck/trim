const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const marblesDir = "./marbles";
const outputDir = "./trimmed-marbles";
const batchSize = 200;
async function processBatch(files) {
  const promises = files.map(async (file) => {
    const filePath = path.join(marblesDir, file);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const outputFilePath = path.join(outputDir, file);

    try {
      await sharp(filePath).trim().toFile(outputFilePath);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  });

  await Promise.all(promises);
}

async function checkFiles() {
  try {
    const originalFiles = fs
      .readdirSync(marblesDir)
      .filter((file) => file.endsWith(".png"));
    const trimmedFiles = fs
      .readdirSync(outputDir)
      .filter((file) => file.endsWith(".png"));

    if (originalFiles.length !== trimmedFiles.length) {
      console.error("The number of files in the directories do not match.");
      return;
    }

    const originalSet = new Set(originalFiles);
    const trimmedSet = new Set(trimmedFiles);

    for (const file of originalSet) {
      if (!trimmedSet.has(file)) {
        console.error(`File ${file} is missing in the output directory.`);
        return;
      }
    }

    console.log(
      "Both directories have the same number of files with the same names."
    );
  } catch (error) {
    console.error("Error checking files:", error);
  }
}

async function main() {
  try {
    const files = fs
      .readdirSync(marblesDir)
      .filter((file) => file.endsWith(".png"));

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await processBatch(batch);
      console.log("Processed batch:", i);
    }
    console.log("All files processed, checking integrity...");
    await checkFiles();
  } catch (error) {
    console.error("Error reading files:", error);
  }
}

main();
