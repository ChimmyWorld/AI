require('dotenv').config();

module.exports = {
    // Server configuration
    PORT: process.env.PORT || 10000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // MongoDB configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://wogml0928:test1234@jimmy.0i3vs.mongodb.net/community-forum?retryWrites=true&w=majority&appName=Jimmy',

    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET,

    // Cloudinary configuration
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
};
