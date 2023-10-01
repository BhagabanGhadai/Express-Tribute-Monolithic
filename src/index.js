const express = require('express');
const { env } = require('./env');
const { connectDB } = require('./db');
const expressApp = require('./app');

const startServer = async() => {
    const app = express();
    await expressApp(app);
    await connectDB()
    app.listen(env.PORT, () => {
    console.log("⚙️  Server is running on port: " + env.PORT);
    }).on('error', (err) => {
        console.log(err)
        process.exit()
    })
    
  };
  startServer();
  