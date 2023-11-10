const mongoose = require("mongoose");
// require('dotenv').config()

const mongoURI = process.env.MONGOURI
// mongoose.set("strictQuery", false);  
 
mongoose.connect(mongoURI).then((r) => {
  console.log("connected to mongo database");
}).catch((err) => {
  console.log(`not connected to mongo database: ${err}`);
})