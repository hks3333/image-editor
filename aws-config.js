import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "us-west-2",
    credentials: {
      accessKeyId: "AKIA2S2Y4VN7JB3477SD",
      secretAccessKey: "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",
    },
  });


export function dataURItoBlob(dataURI) {
    // Convert base64/URLEncoded data component to raw binary data
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
  
    // Separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  
    // Write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
  
    return new Blob([ab], {type: mimeString});
  }


  export async function uploadToS3(file, fileName) {
    const params = {
      Bucket: 'cloudeditbucket',
      Key: fileName,
      Body: file,
      ContentType: file.type, // Optional: Set the MIME type of the file.
    };
  
    try {
      const command = new PutObjectCommand(params);
      const result = await s3.send(command);
      console.log("File uploaded successfully:", result);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }


