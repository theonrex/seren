import { PinataSDK } from "pinata"; // Pinata SDK
import fs from "fs";
import path from "path";

// Initialize Pinata SDK
export const pinata = new PinataSDK({
  pinataJwt: `${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const filePath = path.resolve("path/to/your/file.jpg");
      const readableStreamForFile = fs.createReadStream(filePath);

      const options = {
        pinataMetadata: {
          name: "File to pin",
        },
        pinataOptions: {
          cidVersion: 1,
        },
      };

      const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to pin file" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
