//--------------------------------Importing Modules--------------------------------//

const urlModel = require("../models/urlModel");
const shortid = require("shortid");
const validUrl = require("valid-url");
const { redisClient } = require("../redisServer");
const { promisify } = require("util");
const baseUrl = "http://localhost:3001"
const timeLimit = 10;




//-------------------------------- GLobal Validation Defined--------------------------------//

const isValidRequestBody = (RequestBody) => {
  if (!Object.keys(RequestBody).length > 0) return false;
  return true;
};

const isValid = (value) => {
  if (typeof value === "undefined" || typeof value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number") return false;
  if (typeof value !== "string") return false;
  return true;
};

let regexUrl =
  /^(https[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;

//------- Connection Setup for Redis------->>

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//----------------------- API Controllers--------------------------------//

//--------------------------Create URL-----------------------------//

const createUrl = async (req, res) => {
  try {


    const data = req.body;
    let longUrl = data.longUrl;

    //----------------- Intial Validation of Data ----------------//

    if (!isValidRequestBody(data))
      return res.status(400).send({
        status: false,
        message: "Data required in request body!",
      });

    if (!isValid(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "Please provide longURL!" });

    if (!regexUrl.test(longUrl.trim()) || !validUrl.isWebUri(longUrl))
      return res.status(400).send({
        status: false,
        message: "Provide valid url longUrl in request!",
      });

    //--------- Get DAta from the Cache Memory ---------->>

    let cahcelongUrl = await GET_ASYNC(`${longUrl}`);
    if (cahcelongUrl) {
      return res.status(200).send({
        status: true,
        message: "Data from Redis",
        data: JSON.parse(cahcelongUrl),
      });
    }

    //----- Find Data From Database and Set in Cache --------------->>

    const checklongUrl = await urlModel
      .findOne({ longUrl: longUrl })
      .select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0 });

    if (checklongUrl) {
      await SET_ASYNC(
        `${longUrl}`,
        JSON.stringify(checklongUrl),
        "EX",
        timeLimit
      );
      return res.status(200).send({
        status: true,
        message: "data from mongoDb server",
        data: checklongUrl,
      });
    }
    //------- another Method -----------//
    /*  redisClient.set(`${longUrl}`, JSON.stringify(checklongUrl), function (err, reply) {
        if (err) throw err;
        redisClient.expire(`${longUrl}`, 60 * 20, function (err, reply) {
          if (err) throw err;
          console.log(reply)})}) */

    // ---------------- Create Urlcode -------------------->>

    const urlCode = shortid.generate(longUrl).toLowerCase();

    const shortUrl = baseUrl + "/" + urlCode;

    data["shortUrl"] = shortUrl;
    data["urlCode"] = urlCode;

    const createData = await urlModel.create(data);
    const newData = {
      longUrl: createData.longUrl,
      urlCode: createData.urlCode,
      shortUrl: createData.shortUrl,
    };

    //-------another Method ------------//
    /* redisClient.set(`${longUrl}`, JSON.stringify(newData), function (err, reply) {
      if (err) throw err;
      redisClient.expire(`${longUrl}`, 60 * 20, function (err, reply) {
        if (err) throw err;
        console.log(reply)
      })}) */

    //---------------Set Data in Chache Memory Server-------->>

    await SET_ASYNC(`${longUrl}`, JSON.stringify(newData), "EX", timeLimit);
    console.log("testPort")

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

const getUrl = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;
    //---------- validation --------->>

    if (!shortid.isValid(urlCode))
      return res.status(400).send({
        status: false,
        massage: "Enter valid length of shortid between 7-14 characters...!",
      });

    //----------- Get Data From Cache Memory ----->>

    let cachedShortId = await GET_ASYNC(`${urlCode}`);
    let parsedShortId = JSON.parse(cachedShortId);
    if (parsedShortId) return res.status(302).redirect(parsedShortId.longUrl);

    //------ Get Data From Database And Set into The Cache ---->>

    let data = await urlModel.findOne({ urlCode: urlCode });

    if (data) {
      await SET_ASYNC(`${urlCode}`, JSON.stringify(data));
      return res.status(302).redirect(data.longUrl);
    } else {
      return res.status(404).send({ status: false, massage: "No URL Found" });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};
const getUrlByLongU = async function (req, res) {
  try {

    //------ Get Data From Database And Set into The Cache ---->>

    let data = await urlModel.find();

    if (data) {
      await SET_ASYNC(`${urlCode}`, JSON.stringify(data));
      return res.status(200).send({ status: true, data: data });
    } else {
      return res.status(404).send({ status: false, massage: "No URL Found" });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//------------------------ Exporting Modules-------------------------//

module.exports = { createUrl, getUrl, getUrlByLongU };
