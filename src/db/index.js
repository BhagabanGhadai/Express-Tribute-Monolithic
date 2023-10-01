const mongoose=require('mongoose')
const {env}=require('../env')

exports.connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(env.DB_NAME);
    console.log(
      `☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
};
