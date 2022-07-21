//------------------- Application -------------------//

//------------------- Importing Modules -------------------//

const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route.js");
const { default: mongoose } = require("mongoose");
const app = express();
const testPort = 3000;

//------------------- Global or Application level Middleware-------------------//

app.use(bodyParser.json());

//------------------- Connection Establishment Between Application and Database -------------------//

mongoose
  .connect(
    "mongodb+srv://disha123:hl6LMcJIED1eCZhr@cluster0.hrerz.mongodb.net/group20Database",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected!"))
  .catch((err) => console.log(err));

app.use("/", route);

app.use("*", (req, res) => {
  return res
    .status(400)
    .send({ status: false, message: "plesae enter valid url endpoint" });
});

//------------------- Server Configuration -------------------//

app.listen(process.env.PORT || testPort, function () {
  console.log("Express app running on port " + (process.env.PORT || testPort));
});
