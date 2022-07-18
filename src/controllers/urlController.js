const urlModel = require("../models/urlModel");
const shortid = require("shortid");
const validUrl = require("valid-url");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const regURL =
  /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s])?$/gm;

const createUrl = async function (req, res) {
  try {
    const data = req.body;
    let { longUrl } = data;

    if (!Object.keys(data).length)
      return res
        .status(400)
        .send({ status: false, message: "Please provide URL details" });

    if (!isValid(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "Please provide Long URL." });

    // if (!regURL.test(longUrl.toString().trim())) {
    //   //URL validation
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Please Provide a Valid Long URL." });
    // }

    //Checking Data From urlModel

    let shortCode = shortid.generate();
    console.log(shortCode);
    const checkshortCode = await urlModel.findOne({ shortCode: shortCode });
    console.log(checkshortCode);
    // if (check) {
    //   shortCode = shortid.generate();
    // }

    const baseUrl = "http://localhost:3000";
    //Concat base baseURL & URLcode
    const shortUrl = baseUrl + "/" + shortCode;
    const NewUrl = {
      longUrl: longUrl,
      shortUrl: shortUrl,
      shortCode: shortCode,
    };
    const ShortenUrl = await urlModel.create({ NewUrl });

    return res.status(201).send({
      status: true,
      message: `Successfully Shorten the URL`,
      data: NewUrl,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

const getdata = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;
    let data = urlModel.findOne({ urlCode: urlCode });
    if (!data)
      return res.status(400).send({ status: false, msg: "No data found" });
    return res.status(200).redirect(data.longUrl);
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { createUrl };
