import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadToS3 = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const fileStream = fs.createReadStream(localFilePath);
        const fileName = localFilePath.split('/').pop() || localFilePath.split('\\').pop();
        const fileKey = `uploads/${Date.now()}_${fileName}`;

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            Body: fileStream,
            ContentType: "image/jpeg", // or determine dynamically based on file extension
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        console.log("File is uploaded on S3: ", fileKey);
        fs.unlinkSync(localFilePath); // remove locally saved temp file

        // Return a mock URL or the actual public URL if bucket is configured for public access
        const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        
        return {
            url: url,
            key: fileKey 
        };

    } catch (error) {
        console.error("S3 Upload Error: ", error);
        if (fs.existsSync(localFilePath)) {
             fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

const deleteFromS3 = async (fileKey) => {
    try {
        if (!fileKey) return null;

        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
        };

        const command = new DeleteObjectCommand(deleteParams);
        const response = await s3Client.send(command);

        console.log("File is deleted from S3: ", fileKey);
        return response;
    } catch (error) {
        console.error("S3 Delete Error: ", error);
        return null;
    }
}

export { uploadToS3, deleteFromS3 };
