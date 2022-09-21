// Import the NFTStorage class and File constructor from the 'nft.storage' package
const { NFTStorage, File, Blob } = require("nft.storage");

// allows us to access node process environment variables
require("dotenv").config();

// built in node module for reading files
const fs = require("fs");

// modules for generating image thumbnail from video
const pathToFfmpeg = require("ffmpeg-static");
const genThumbnail = require("simple-thumbnail");

// module that helps us determine a file type
const mime = require("mime");

// api key
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;

// create a new NFTStorage client using our API key
const flclient = new NFTStorage({ token: NFT_STORAGE_KEY });


// NOT REQUIRED
// "image/jpg" => ".jpg"
function getFileExtension(contentType) {
  return "." + contentType.split("/")[1];
}


// fileExtension ex. = ".mp4"
function removeFiles(fileExtension) {
	fs.exists(`./video${fileExtension}`, (exists) => exists && fs.promises.unlink(`./video${fileExtension}`))
	fs.exists("./thumbnail.png", (exists) => exists && fs.promises.unlink("./thumbnail.png"))
}


async function fileFromPath(filePath) {
  const content = await fs.promises.readFile(filePath);
  const type = mime.getType(filePath);
  return new File([content], "thumbnail.png", { type });
}


// uploads nft (image/video) to filecoin/nft.storage, returns Token object
async function uploadNFTMetadata(image, contentType, nftMetadata) {
  // image = string- base64
  // contentType ex. = "image/jpg", "video/mp4", ...

  // convert base64 string to object buffer
  let imageBuffer = Buffer.from(image, "base64");

	const fileExtension = getFileExtension(contentType)

  const imageFile = new File(
    [imageBuffer],
    nftMetadata.name + fileExtension, // fileExtension not required
    { type: contentType }
  );

  const nft = {
    ...nftMetadata,
  };

	let metadata;

  try {
    // make image thumbnail of video- fixed width 250px and autoscale height
    if (contentType.includes("video")) {

      // write video to path in current directory
      await fs.promises.writeFile(
        "video" + fileExtension,
        imageBuffer
      );

      // generate thumbnail from video file path (writes "thumbnail.png" to current directory)
      await genThumbnail(
        "./video" + fileExtension,
        "thumbnail.png",
        "250x?",
        { path: pathToFfmpeg }
      );

      const imgThumbnail = await fileFromPath("./thumbnail.png");
      
      // add "image" thumbnail attribute to metadata (otherwise we will get a warning if we try to store a video at the image attribute)
      nft.image = imgThumbnail;

      // nft.storage recommends adding this properties attribute
      nft.properties = {
        type: contentType,
        video: imageFile,
      };

			// nft is NOT a video
    } else {
      nft.image = imageFile;
    }

		// stores ERC1155 nft data
		metadata = await flclient.store(nft);
		console.log("metadata: ", metadata);
		//=> Token
		// {
		// 	ipnft: 'bafyreiaceuzmzigf5vdxqczcieyrtw2bgpmdjypqnc622rwlsuoca2iwei',
		// 	url: 'ipfs://bafyreiaceuzmzigf5vdxqczcieyrtw2bgpmdjypqnc622rwlsuoca2iwei/metadata.json'
		// }
		
		console.log(" ");
		console.log("Content ID (CID):", metadata.ipnft);
		// => "bafyreiaceuzmzigf5vdxqczcieyrtw2bgpmdjypqnc622rwlsuoca2iwei"
	
		console.log(" ");
		console.log("IPFS URL (Metadata URI):", metadata.url);
		//=> "ipfs://bafyreiaceuzmzigf5vdxqczcieyrtw2bgpmdjypqnc622rwlsuoca2iwei/metadata.json"
	
		console.log(" ");
		console.log(
			"http Metadata URL: ",
			`https://nftstorage.link/ipfs/${metadata.ipnft}/metadata.json`
		);
		//=> https://nftstorage.link/ipfs/bafyreiaceuzmzigf5vdxqczcieyrtw2bgpmdjypqnc622rwlsuoca2iwei/metadata.json
	
		console.log(" ");
		console.log("http image URL: ", `https://nftstorage.link/ipfs/${(metadata?.data?.image?.href)?.slice(7)}`)
		//=> 	https://nftstorage.link/ipfs/bafybeidno2v5yfh2lo4bmkbdqe6xahscghni3crs5gzewplsgrsdcyk4fq/thumbnail.png

		console.log(" ");
		console.log("http video URL: ", `https://nftstorage.link/ipfs/${(metadata?.data?.properties?.video?.href)?.slice(7)}`)
		//=> 	https://nftstorage.link/ipfs/bafybeiczi42c2kjvu4bbcawd5ymlf64j6pp7b64asf65vhca6wzyknli6a/TEST%208%20-%20sailboat-starry-night.mp4

		console.log(" ");
		console.log("metadata.json contents:", metadata.data);
		//=>
		// {
		// 	name: 'TEST 8 - sailboat-starry-night',
		// 	description: 'TEST 8 DESCRIPTION',
		// 	external_url: '',
		// 	attributes: [],
		// 	properties: {
		// 		type: 'video/mp4',
		// 		video: URL {
		// 			href: 'ipfs://bafybeiczi42c2kjvu4bbcawd5ymlf64j6pp7b64asf65vhca6wzyknli6a/TEST%208%20-%20sailboat-starry-night.mp4',
		// 			origin: 'null',
		// 			protocol: 'ipfs:',
		// 			username: '',
		// 			password: '',
		// 			host: 'bafybeiczi42c2kjvu4bbcawd5ymlf64j6pp7b64asf65vhca6wzyknli6a',
		// 			hostname: 'bafybeiczi42c2kjvu4bbcawd5ymlf64j6pp7b64asf65vhca6wzyknli6a',
		// 			port: '',
		// 			pathname: '/TEST%208%20-%20sailboat-starry-night.mp4',
		// 			search: '',
		// 			searchParams: URLSearchParams {},
		// 			hash: ''
		// 		}
		// 	},
		// 	image: URL {
		// 		href: 'ipfs://bafybeidno2v5yfh2lo4bmkbdqe6xahscghni3crs5gzewplsgrsdcyk4fq/thumbnail.png',
		// 		origin: 'null',
		// 		protocol: 'ipfs:',
		// 		username: '',
		// 		password: '',
		// 		host: 'bafybeidno2v5yfh2lo4bmkbdqe6xahscghni3crs5gzewplsgrsdcyk4fq',
		// 		hostname: 'bafybeidno2v5yfh2lo4bmkbdqe6xahscghni3crs5gzewplsgrsdcyk4fq',
		// 		port: '',
		// 		pathname: '/thumbnail.png',
		// 		search: '',
		// 		searchParams: URLSearchParams {},
		// 		hash: ''
		// 	}
		// }
	
		// NOTE
		// - IPFS addresses can only be accsessed by 1) using certain browsers (ex. Brave), 2) an HTTP gateway, or 3) locally
		// - HTTP Gateway = provide a bridge between the P2P IPFS protocol and HTTP
		//	 - https://<gateway-host>/ipfs/
		//   - ex. nftstorage.link gateway
		//   - https://nftstorage.link/ipfs/bafyreidrdhqlfsyyo5sp5ejpnap4qllzbh7iofbdsgsar5dwtpy73xspie/metadata.json
		//   - https://nftstorage.link/ipfs/bafybeighc4fkjnznrnps6ow34k3apyeibozroibwthueuy6tdizzwmat3a/TEST%204%20-%20string-theory.gif
  } catch (error) {
		console.log("YEEEEEE")
    console.log(error);
  }

	removeFiles(fileExtension) // remove local copy of thumbnail and video
  return metadata; //=> Token object
}


// The main entry point for the script
async function main() {
  // const filePath = "./string-theory.gif";
  const filePath = "./sailboat-starry-night.mp4";

  // read in file, and convert to base64 image
  const base64Image = await fs.promises.readFile(filePath, { encoding: "base64", }); // string- base64
  // const image = await fs.readFile(filePath); // object- Buffer

  // get file type. ex "image/gif"
  const fileType = mime.getType(filePath);

  const metadata = {
    name: "TEST 8 - sailboat-starry-night",
    description: "TEST 8 DESCRIPTION",
    external_url: "",
    attributes: [],
  };	

  return await uploadNFTMetadata(base64Image, fileType, metadata);
}


// Don't forget to actually call the main function!
// We can't `await` things at the top level, so this adds
// a .catch() to grab any errors and print them to the console.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
