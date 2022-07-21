//--------------------------------Importing Modules--------------------------------//

const urlModel = require("../models/urlModel");
const shortid = require("shortid");
const validUrl = require("valid-url");
const redis = require("redis");
const { promisify } = require("util");
const baseUrl = "http://localhost:3000";
const timeLimit = 10;

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
  /^(https[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;

//--------------------Connect to Redis-------->>>

const redisClient = redis.createClient(
  14064,
  "redis-14064.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);

redisClient.auth("PqUQxnu63j7X0pPsTqBoNRaHtrVMDuww", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function (err) {
  //------ Connect to the Server---------------->>
  console.log("Connected to Redis!");
});

//------- Connection Setup for Redis------->>

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//----------------------- API Controllers--------------------------------//

//--------------------------------Create URL-----------------------------//

const createUrl = async (req, res) => {
  try {
    const data = req.body;
    let longUrl = req.body.longUrl;

    //----------------- Intial Validation of Data ---------------------------//
    //-------- BodyData Validation -------->>

    if (!isValidRequestBody(data))
      return res.status(400).send({
        status: false,
        message: "Data required in request body!",
      });

    //----------- URL Validation ---------->>

    if (!isValid(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "Please provide longURL!" });

    if (!regexUrl.test(longUrl.trim()) || !validUrl.isWebUri(longUrl))
      return res.status(400).send({
        status: false,
        message: "Provide valid url longUrl in request!",
      });

    //--------- Get from the Cache Memory ---------->
    let cahcelongUrl = await GET_ASYNC(`${longUrl}`);
    console.log("redis data");

    if (cahcelongUrl) {
      return res.status(200).send({
        satus: true,
        message: "Data from Redis",
        data: JSON.parse(cahcelongUrl),
      });
    }

    const checklongUrl = await urlModel
      .findOne({ longUrl: longUrl })
      .select({ createdAt: 0, updatedAt: 0, __v: 0 });

    if (checklongUrl) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(checklongUrl), "EX", 10);

      
      // redisClient.expire(`${longUrl}`, 10);

     /*  redisClient.set(`${longUrl}`, JSON.stringify(checklongUrl), function (err, reply) {
        if (err) throw err;
        redisClient.expire(`${longUrl}`, 60 * 20, function (err, reply) {
          if (err) throw err;
          console.log(reply)})}) */

      return res.status(200).send({
        status: true,
        message: "data from mongoDb server  ",
        data: checklongUrl,
      });
    }

    // create urlcode
    const urlCode = shortid.generate(longUrl).toLowerCase();

    const shortUrl = baseUrl + "/" + urlCode;

    data["shortUrl"] = shortUrl;
    data["urlCode"] = urlCode;
    console.log("ok");

    const createData = await urlModel.create(data);
    const newData = {
      longUrl: createData.longUrl,
      urlCode: createData.urlCode,
      shortUrl: createData.shortUrl,
    };

     /* redisClient.set(`${longUrl}`, JSON.stringify(newData), function (err, reply) {
      if (err) throw err;
      redisClient.expire(`${longUrl}`, 60 * 20, function (err, reply) {
        if (err) throw err;
        console.log(reply)
      })}) */

    await SET_ASYNC(`${longUrl}`, JSON.stringify(newData),'EX',10);
    // redisClient.expire(`${longUrl}`, 10);
    await SET_ASYNC(`${shortUrl}`, JSON.stringify(longUrl));
    console.log("data create in mongoDb server");

    return res.status(201).send({
      status: true,
      message: "data create in mongoDb server and set to redis",
      data: newData,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// -------------------------------- Get Or Redirect URL --------------------------------//

// get redirect uri
const getUrl = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;

    if (!shortid.isValid(urlCode))
      return res.status(400).send({
        status: false,
        msg: "Enter valid length of shortid between 7-14 characters...!",
      });

    let cachedShortId = await GET_ASYNC(`${urlCode}`);

    let parsedShortId = JSON.parse(cachedShortId);

    if (parsedShortId)
      return res
        .status(302)
        .redirect(parsedShortId.longUrl); /*Checking Data From Cache */

    let data = await urlModel.findOne({ urlCode: urlCode });

    if (data) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(data));
      // redisClient.expire(`${urlCode}`, timeLimit);
      return res.status(302).redirect(data.longUrl);
    } else {
      return res.status(404).send({ status: false, msg: "No URL Found" });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//------------------------ Exporting Modules-------------------------//

module.exports = { createUrl, getUrl };
