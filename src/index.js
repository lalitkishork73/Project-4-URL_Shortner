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
    "mongodb+srv://lalitkishork73:UzPr9bb6Wvxda9eC@cluster0.o2wavxe.mongodb.net/project-4-db-grp-20?retryWrites=true&w=majority",
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
