// Import the NFTStorage class and File constructor from the 'nft.storage' package
// import { NFTStorage, File } from "nft.storage";

// require("dotenv/config");
require("dotenv").config();
const { NFTStorage, File, Blob } = require("nft.storage");

// const NFT_STORAGE_KEY = "REPLACE_ME_WITH_YOUR_KEY";

/**
 * The main entry point for the script that checks the command line arguments and
 * calls storeNFT.
 *
 * To simplify the example, we don't do any fancy command line parsing. Just three
 * positional arguments for imagePath, name, and description
 */
async function main() {
  // const args = process.argv.slice(2);
  // if (args.length !== 3) {
  //   console.error(
  //     `usage: ${process.argv[0]} ${process.argv[1]} <image-path> <name> <description>`
  //   );
  //   process.exit(1);
  // }
  // const [imagePath, name, description] = args;
  // const result = await storeNFT(imagePath, name, description);
  // console.log(result);
  console.log("process.env.NFT_STORAGE_KEY", process.env.NFT_STORAGE_KEY);
}

// Don't forget to actually call the main function!
// We can't `await` things at the top level, so this adds
// a .catch() to grab any errors and print them to the console.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
