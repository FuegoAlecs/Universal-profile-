import { type NextRequest, NextResponse } from "next/server"
import PinataClient from "@pinata/sdk"
import formidable from "formidable"
import sharp from "sharp"
import { Readable } from "stream"

// Ensure these are set in your .env file
const pinataApiKey = process.env.PINATA_API_KEY
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY

if (!pinataApiKey || !pinataSecretApiKey) {
  console.error("Pinata API keys are not set in environment variables.")
  // In a real application, you might want to throw an error or handle this more gracefully
}

const pinata = new PinataClient({ pinataApiKey, pinataSecretApiKey })

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to convert buffer to stream
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

export async function POST(req: NextRequest) {
  if (!pinataApiKey || !pinataSecretApiKey) {
    return NextResponse.json({ error: "Pinata API keys not configured." }, { status: 500 })
  }

  const form = formidable({ multiples: false })

  return new Promise((resolve, reject) => {
    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err)
        return resolve(NextResponse.json({ error: "Error parsing form data." }, { status: 500 }))
      }

      const file = files.file?.[0] // formidable returns an array for files
      if (!file) {
        return resolve(NextResponse.json({ error: "No file uploaded." }, { status: 400 }))
      }

      try {
        // Read the file into a buffer
        const fileBuffer = await new Promise<Buffer>((res, rej) => {
          const chunks: Buffer[] = []
          file.filepath // formidable stores the file temporarily
          const readStream = require("fs").createReadStream(file.filepath)
          readStream.on("data", (chunk: Buffer) => chunks.push(chunk))
          readStream.on("end", () => res(Buffer.concat(chunks)))
          readStream.on("error", rej)
        })

        // Process image with sharp (e.g., resize, convert to PNG)
        const processedImageBuffer = await sharp(fileBuffer)
          .resize(800) // Example: resize to a max width of 800px
          .png() // Ensure it's PNG for transparency and wider support
          .toBuffer()

        const stream = bufferToStream(processedImageBuffer)
        const options = {
          pinataMetadata: {
            name: file.originalFilename || "universal-profile-card.png",
          },
          pinataOptions: {
            cidVersion: 0,
          },
        }

        const result = await pinata.pinFileToIPFS(stream, options)
        console.log("Pinata upload result:", result)

        // Clean up the temporary file created by formidable
        require("fs").unlink(file.filepath, (unlinkErr: any) => {
          if (unlinkErr) console.error("Error deleting temporary file:", unlinkErr)
        })

        resolve(
          NextResponse.json(
            { ipfsHash: result.IpfsHash, pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}` },
            { status: 200 },
          ),
        )
      } catch (uploadError) {
        console.error("Error uploading to Pinata:", uploadError)
        resolve(NextResponse.json({ error: "Failed to upload to IPFS." }, { status: 500 }))
      }
    })
  })
}
