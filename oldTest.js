// Import the NFTStorage class and File constructor from the 'nft.storage' package
const { NFTStorage, File, Blob } = require("nft.storage");

// allows us to access node process environment variables
require("dotenv").config();

// built in node module for reading files
const fs = require("fs");

// module that helps us determine a file type
const mime = require("mime");

// api key
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;

// create a new NFTStorage client using our API key
const flclient = new NFTStorage({ token: NFT_STORAGE_KEY });


// NOT REQUIRED
// "image/jpg" => ".jpg"
function getFileExtension(contentType) {
  return "." + contentType.split("/")[1]
}


// video support- but with warnings
async function uploadNFTMetadataV2(image, contentType, nftMetadata) {
  // image = string- base64
  // contentType ex. = "image/jpg", "video/mp4", ...

  // convert base64 string to object buffer
  let imageBuffer = Buffer.from(image, "base64")

  const fileExtension = getFileExtension(contentType)

  const imageFile = new File(
      [imageBuffer],
      nftMetadata.name + fileExtension, // fileExtension not required
      { type: contentType }
  )

  // stores ERC1155 nft data
  const metadata = await flclient.store({
      ...nftMetadata,
      image: imageFile // filecoin docs recommends this should be a thumbnail image instead of a video (if content is video)
  })
  console.log("metadata: ", metadata)
  //=> Token
  // {
  //   ipnft: 'bafyreidfwcgv6wdmsoxf4jba3zbztap26m5zbwp5jacmdz7kggbuvdgb2m',
  //   url: 'ipfs://bafyreidfwcgv6wdmsoxf4jba3zbztap26m5zbwp5jacmdz7kggbuvdgb2m/metadata.json'
  // }
  
  console.log("Content ID (CID):", metadata.ipnft)
  // => "bafyreidfwcgv6wdmsoxf4jba3zbztap26m5zbwp5jacmdz7kggbuvdgb2m"

  console.log("IPFS URL (Metadata URI):", metadata.url)
  //=> "ipfs://bafyreidfwcgv6wdmsoxf4jba3zbztap26m5zbwp5jacmdz7kggbuvdgb2m/metadata.json"

  console.log("http Metadata URL: ", `https://nftstorage.link/ipfs/${metadata.ipnft}/metadata.json`)
  //=> https://nftstorage.link/ipfs/bafyreidfwcgv6wdmsoxf4jba3zbztap26m5zbwp5jacmdz7kggbuvdgb2m/metadata.json

  console.log("http image URL: ", `https://nftstorage.link/ipfs/${metadata?.data?.image?.href?.slice(7)}`)
  //=> https://nftstorage.link/ipfs/bafybeifuqz2meine4uffnrbpy3uz6fq4rkcmsi5uojstoembcfosymnzcq/TEST%209%20-%20sailboat-starry-night.mp4

  console.log("metadata.json contents:", metadata.data)
  //=>
  // {
  //   name: 'TEST 9 - sailboat-starry-night',
  //   description: 'TEST 9 DESCRIPTION',
  //   external_url: '',
  //   attributes: [],
  //   image: URL {
  //     href: 'ipfs://bafybeifuqz2meine4uffnrbpy3uz6fq4rkcmsi5uojstoembcfosymnzcq/TEST%209%20-%20sailboat-starry-night.mp4',
  //     origin: 'null',
  //     protocol: 'ipfs:',
  //     username: '',
  //     password: '',
  //     host: 'bafybeifuqz2meine4uffnrbpy3uz6fq4rkcmsi5uojstoembcfosymnzcq',
  //     hostname: 'bafybeifuqz2meine4uffnrbpy3uz6fq4rkcmsi5uojstoembcfosymnzcq',
  //     port: '',
  //     pathname: '/TEST%209%20-%20sailboat-starry-night.mp4',
  //     search: '',
  //     searchParams: URLSearchParams {},
  //     hash: ''
  //   }
  // }

  return metadata //=> Token object
}


// The main entry point for the script
async function main() {
  // const filePath = "./string-theory.gif";
  const filePath = "./sailboat-starry-night.mp4";

  // read in file, and convert to base64 image
  const base64Image = await fs.promises.readFile(filePath, { encoding: "base64", }); // string- base64
  
  // get file type. ex "image/gif"
  const fileType = mime.getType(filePath);

  const metadata = {
    name: "TEST 9 - sailboat-starry-night",
    description: "TEST 9 DESCRIPTION",
    external_url: "",
    attributes: [],
  };

  return await uploadNFTMetadataV2(base64Image, fileType, metadata);
}


// Don't forget to actually call the main function!
// We can't `await` things at the top level, so this adds
// a .catch() to grab any errors and print them to the console.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
