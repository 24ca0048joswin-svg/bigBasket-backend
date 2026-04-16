const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

function uploadToCloudinary(buffer){
    return new Promise((resolve, reject) =>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {folder: "products"},
            (error, result) => {
                if(error) reject(error);
                else resolve(result)
            }
        )
        uploadStream.end(buffer);
    });
};

async function deleteImageFromCloudinary(id){
    try{
        const result = await cloudinary.uploader.destroy(id);
        return result;
    }catch(err){
        console.log("Failed to delete the image")
    }
}

module.exports = { uploadToCloudinary, deleteImageFromCloudinary }