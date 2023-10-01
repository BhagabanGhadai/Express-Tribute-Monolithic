const cloudinary = require('cloudinary').v2;
const { env } = require('../env')
const fs = require('fs')
let streamifier = require('streamifier');


cloudinary.config({
    cloud_name: env.cloudinary_cloud_name,
    api_key: env.cloudinary_api_key,
    api_secret: env.cloudinary_api_secret
});


const uploadToCloudinary = async (stream) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });

        stream.pipe(uploadStream);
    });
};

exports.UPLOAD_IMAGE = (path) => {
    const stream = fs.createReadStream(path.path);
    return uploadToCloudinary(stream)
}

exports.UPLOAD_MULTIPLE_IMAGE = async (imagePaths) => {
    const uploadPromises = imagePaths.map((imagePath) => {
        const stream = fs.createReadStream(imagePath.path);
        return uploadToCloudinary(stream);
    });

    try {
        const results = await Promise.all(uploadPromises);
        console.log('Images uploaded successfully');
        return results
    } catch (error) {
        console.error('Error uploading images:', error);
    }
}
exports.DELETE_IMAGE=async(cloudinary_id)=>{
    cloudinary.uploader
    .destroy(cloudinary_id)
    .then((result) => {
      response.status(200).send({
        message: "success",
        result,
      });
    })
    .catch((error) => {
      response.status(500).send({
        message: "Failure",
        error,
      });
    });
}

exports.UPLOAD_BUFFER=async (buffer)=>{
    return new Promise((resolve, reject) =>{
        let cld_upload_stream = cloudinary.uploader.upload_stream(
            {
              folder: "obituary-images"
            },
            function(error, result) {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        
        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    })
}