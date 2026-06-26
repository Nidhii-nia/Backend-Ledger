const app = require("./src/App");
const connectUsingMongoose = require("./src/config/db");

//Connect to server
app.listen(3000, () => {
  //Connect to DB
  connectUsingMongoose();
  console.log("Server is running on port number 3000.");
});
