const urlModel = require('../models/urlModel')

const shortid = require('shortid')

const baseUrl = 'http://localhost:3000'

//request body check
const isValidRequestBody = (RequestBody) => {
    if (Object.keys(RequestBody).length == 0 || Object.keys(RequestBody).length > 1) return false
    return true;
};

//values in key
const isValid = (value) => {    
    if (typeof value === "undefined" || typeof value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

// regex for url
let regexUrl = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm


//create url
const createUrl = async (req, res) => {
    try {
        let longUrl = req.body.longUrl;
        if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, message: "Invalid request. Please provide url details", });

        if (!isValid(longUrl)) return res.status(400).send({ status: false, message: "Please provide longURL" })


       
        if (!regexUrl.test(longUrl.trim()))  return res.status(400).send({ status: false, message: "Provide valid url longUrl in request..." })


        // let checkDB = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        const urlCode = shortid.generate(longUrl).toLowerCase()

        let checkDBUrlCode = await urlModel.findOne({ urlCode: urlCode })
        if(checkDBUrlCode) return res.status(400).json({ status: false, message: "urlCode is needs unique" }) 

        const shortUrl = baseUrl + '/' + urlCode

        let checkDBshortUrl = await urlModel.findOne({ shortUrl: shortUrl })
        if(checkDBshortUrl) return res.status(400).json({ status: false, message: "shortUrl is needs unique" }) 

        const newUrl = { longUrl, shortUrl, urlCode }
        const short = await urlModel.create(newUrl)


        const newData = {
            longUrl: short.longUrl,
            shortUrl: short.shortUrl,
            urlCode: short.urlCode
        }

        return res.status(201).send({ status: true, data: newData })

    } catch (err) {
        return res.status(504).send({ status: false, msg: err.message });
    }
}




// get redirect uri
const getdata = async function (req, res) {
    try {
        let urlCode = req.params.urlCode;
        // console.log(urlCode)

        let data = await urlModel.findOne({ urlCode: urlCode });
        if (!data)
            return res.status(404).send({ status: false, msg: "No data found" });
        // console.log(data)

        return res.status(302).redirect(data.longUrl);

    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


module.exports = { createUrl, getdata }
