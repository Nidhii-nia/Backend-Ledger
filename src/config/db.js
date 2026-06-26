const mongoose = require('mongoose');
const ApplicationLevelError = require('../middlewares/ApplicationError.middleware');

const connectUsingMongoose = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
    }catch(e){
        console.log("Error connecting to DB");
        throw new ApplicationLevelError(e.message,500);
        process.exit(1);
    }
}

module.exports = connectUsingMongoose