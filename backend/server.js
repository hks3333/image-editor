const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = 5000;

// Set up S3 client
const s3 = new S3Client({
    region: "us-west-2",
    credentials: {
        accessKeyId: "AKIA2S2Y4VN7JB3477SD",
        secretAccessKey: "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",
    },
});

// Middleware
app.use(cors());
const upload = multer();

// S3 upload function
const uploadToS3 = async (file, filename) => {
    const params = {
        Bucket: 'cloudeditbucket',
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', 
    };

    try {
        const command = new PutObjectCommand(params);
        const result = await s3.send(command);
        return `https://${params.Bucket}.s3.us-west-2.amazonaws.com/${filename}`;
    } catch (error) {
        throw error;
    }
};

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const filename = `edited_image_${Date.now()}.png`;

    try {
        const fileUrl = await uploadToS3(req.file, filename);
        res.status(200).json({ message: 'File uploaded successfully!', url: fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
