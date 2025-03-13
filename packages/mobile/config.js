require('dotenv').config();

// Remove any 'MONGODB_URI=' prefix if it exists in the environment variable
const cleanMongoUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.replace('MONGODB_URI=', '') : '';

module.exports = {
    // Server configuration
    PORT: process.env.PORT || 10000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // MongoDB configuration
    MONGODB_URI: cleanMongoUri || 'mongodb+srv://wogml0928:test1234@jimmy.0i3vs.mongodb.net/community-forum?retryWrites=true&w=majority&appName=Jimmy',

    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || '1ff0e0f5458683a38ff572128206c37811c8a810005607e22afbff07fa47e57b',

    // Cloudinary configuration
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
};
