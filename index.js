// Import the NFTStorage class and File constructor from the 'nft.storage' package
const { NFTStorage, File, Blob } = require("nft.storage");

// allows us to access node process environment variables
require("dotenv").config();

// built in node module for reading files
const fs = require("fs/promises");

// module that helps us determine a file type
const mime = require("mime");

// api key
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;

// create a new NFTStorage client using our API key
const flclient = new NFTStorage({ token: NFT_STORAGE_KEY });


// NOT REQUIRED
// "image/jpg" => ".jpg"
function fileExtension(contentType) {
  return "." + contentType.split("/")[1]
}


// uploads nft (image/video) to filecoin/nft.storage, returns Token object
async function uploadNFTMetadata(image, contentType, nftMetadata) {
  // image = object- Buffer
  // contentType ex. = "image/jpg", "video/mp4", ...
  const imageFile = new File([image], nftMetadata.name + fileExtension(contentType), { type: contentType });
  // const imageFile = new File([image], nftMetadata.name, { type: contentType }); // THIS WORKS ALSO

  // stores ERC1155 nft data
  const metadata = await flclient.store({
    ...nftMetadata,
    image: imageFile,
  });
  console.log("metadata: ", metadata);
  //=> Token
  // {
  //   ipnft: 'bafyreidrdhqlfsyyo5sp5ejpnap4qllzbh7iofbdsgsar5dwtpy73xspie',
  //   url: 'ipfs://bafyreidrdhqlfsyyo5sp5ejpnap4qllzbh7iofbdsgsar5dwtpy73xspie/metadata.json'
  // }
  
  console.log("Content ID (CID):", metadata.ipnft) 
  // => "bafyreidrdhqlfsyyo5sp5ejpnap4qllzbh7iofbdsgsar5dwtpy73xspie"

  console.log("IPFS URL (Metadata URI):", metadata.url);
  //=> "ipfs://bafyreidrdhqlfsyyo5sp5ejpnap4qllzbh7iofbdsgsar5dwtpy73xspie/metadata.json"

  console.log("metadata.json contents:", metadata.data);
  //=>
  // {
  //   name: 'TEST 4 - string-theory',
  //   description: 'TEST 4 DESCRIPTION',
  //   external_url: '',
  //   attributes: [],
  //   image: URL {
  //     href: 'ipfs://bafybeighc4fkjnznrnps6ow34k3apyeibozroibwthueuy6tdizzwmat3a/TEST%204%20-%20string-theory.gif',
  //     origin: 'null',
  //     protocol: 'ipfs:',
  //     username: '',
  //     password: '',
  //     host: 'bafybeighc4fkjnznrnps6ow34k3apyeibozroibwthueuy6tdizzwmat3a',
  //     hostname: 'bafybeighc4fkjnznrnps6ow34k3apyeibozroibwthueuy6tdizzwmat3a',
  //     port: '',
  //     pathname: '/TEST%204%20-%20string-theory.gif',
  //     search: '',
  //     searchParams: URLSearchParams {},
  //     hash: ''
  //   }
  // }

  // NOTE
  // - IPFS addresses can only be accsessed by 1) using certain browsers (ex. Brave), 2) an HTTP gateway, or 3) locally
  // - HTTP Gateway = provide a bridge between the P2P IPFS protocol and HTTP
  //	 - https://<gateway-host>/ipfs/
  //   - ex. nftstorage.link gateway
  //   - https://nftstorage.link/ipfs/bafyreidrdhqlfsyyo5sp5ejpnap4qllzbh7iofbdsgsar5dwtpy73xspie/metadata.json
  //   - https://nftstorage.link/ipfs/bafybeighc4fkjnznrnps6ow34k3apyeibozroibwthueuy6tdizzwmat3a/TEST%204%20-%20string-theory.gif

  return metadata; //=> Token object
}


// The main entry point for the script
async function main() {
  const filePath = "./string-theory.gif";

  // read in file, and convert to base64 image
  // const base64Image = await fs.readFile(filePath, { encoding: "base64" }); // string- base64
  const image = await fs.readFile(filePath); // object- Buffer
  
  // get file type. ex "image/gif"
  const fileType = mime.getType(filePath);

  const metadata = {
    name: "TEST 4 - string-theory",
    description: "TEST 4 DESCRIPTION",
    external_url: "",
    attributes: [],
  };

  return await uploadNFTMetadata(image, fileType, metadata);
}


// Don't forget to actually call the main function!
// We can't `await` things at the top level, so this adds
// a .catch() to grab any errors and print them to the console.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
