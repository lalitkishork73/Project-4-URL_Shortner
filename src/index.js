const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose
  .connect(
    "mongodb+srv://disha123:hl6LMcJIED1eCZhr@cluster0.hrerz.mongodb.net/group20Database",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected..."))
  .catch((err) => console.log(err));

mongoose.connect("mongodb+srv://disha123:hl6LMcJIED1eCZhr@cluster0.hrerz.mongodb.net/group20Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected..."))
.catch ( err => console.log(err) );

app.use('/', route);

app.use("*", (req, res) => {
    return res
      .status(400)
      .send({ status: false, message: "plesae enter valid url endpoint" });
  });
  


app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
