import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../config/.env') })
import { v2 as cloudinaryV2 } from 'cloudinary';
import stream from 'stream';



cloudinaryV2.config({
    api_key: "681949917398321",
    api_secret: "aOv3mhP6IWNdpK5Hx5wtneso5u8",
    cloud_name: "dgpppctei",
    secure: true
})
export async function uploadToCloudinary(fileBuffer) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinaryV2.uploader.upload_stream(
            {
                resource_type: 'auto', 
                folder: 'voice_notes',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);
        bufferStream.pipe(uploadStream);
    });
}

export async function Cloudinary(filePath) {
    return new Promise((resolve, reject) => {
        cloudinaryV2.uploader.upload(filePath, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url); 
            }
        });
    });
    
}
