//--------------------------------Importing Modules--------------------------------//

const urlModel = require("../models/urlModel");
const shortid = require("shortid");
const validUrl = require("valid-url")
const redis = require("redis");
const { promisify } = require("util");
const baseUrl = "http://localhost:3000";



//Connect to redis
const redisClient = redis.createClient(
  14064,
  "redis-14064.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("PqUQxnu63j7X0pPsTqBoNRaHtrVMDuww", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//-------------------------------- GLobal Validation Defined--------------------------------//

const isValidRequestBody = (RequestBody) => {
  if (!Object.keys(RequestBody).length > 0) return false;
  return true;
};

const isValid = (value) => {
  if (typeof value === "undefined" || typeof value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

let regexUrl =
  (/^(https[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/);

//----------------------- API Controllers--------------------------------//

//--------------------------------Create URL--------------------------------//

const createUrl = async (req, res) => {
  try {
    let longUrl = req.body.longUrl;

    //data in body
    if (!isValidRequestBody(req.body))
      return res.status(400).send({
        status: false, message: "Data required in request body..."
      });

    // url present
    if (!isValid(longUrl))
      return res.status(400).send({ status: false, message: "Please provide longURL..." });

    // url valid
    if (!regexUrl.test(longUrl.trim()))
      return res.status(400).send({ status: false, message: "Provide valid url longUrl in request..." });

    if (!validUrl.isUri(longUrl))
      return res.status(400).send({ status: false, message: "Provide longUrl in rvalid formate ..." });

    //get from the cache
    let cahcelongUrl = await GET_ASYNC(`${longUrl}`)
    if (cahcelongUrl) {
      return res.status(200).send({ satus: true, message: "Data from Redis", data: JSON.parse(cahcelongUrl) })
    }

    // create urlcode
    const urlCode = shortid.generate(longUrl).toLowerCase();

    let checkDBUrlCode = await urlModel.findOne({ urlCode: urlCode });

    if (checkDBUrlCode)
      return res.status(400).send({ status: false, message: "urlCode is needs unique...!" });

    const shortUrl = baseUrl + "/" + urlCode;

    let checkDBshortUrl = await urlModel.findOne({ shortUrl: shortUrl });

    if (checkDBshortUrl)
      return res.status(400).send({ status: false, message: "shortUrl is needs unique...!" });

    const newUrl = { longUrl, shortUrl, urlCode };

    const short = await urlModel.create(newUrl);

    const newData = {
      longUrl: short.longUrl,
      shortUrl: short.shortUrl,
      urlCode: short.urlCode,
    };
    //set in the cache
    if (newData) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(newData));
      return res.status(201).send({ status: true, message: "Data from DB and it sets this data in Redis ", data: newData })
    }


  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// -------------------------------- Get Or Redirect URL --------------------------------//

// get redirect uri
const getUrl = async function (req, res) {
  try {
      let urlCode = req.params.urlCode;
     
      let cachedShortId = await GET_ASYNC(`${urlCode}`);

      let parsedShortId=JSON.parse(cachedShortId)

      if (parsedShortId) return res.status(302).redirect(parsedShortId.longUrl); /*Checking Data From Cache */
      

      let data = await urlModel.findOne({ urlCode: urlCode });

      if (data) {

          await SET_ASYNC(`${urlCode}`, JSON.stringify(data));
          res.status(302).redirect(data.longUrl);
          return

      } else {

          return res.status(404).send({ status: false, msg: "No URL Found" });
      }

      

  } catch (err) {
      res.status(500).send({ status: false, error: err.message });
  }
};

//------------------------ Exporting Modules-------------------------//

module.exports = { createUrl, getUrl };
