const mongoose = require('mongoose')

//<========= Schema Or Structure Define =============>//
const urlSchema = new mongoose.Schema({

    urlCode : {
        type: String,
        required: true,
        lowercase: true,
        trim:true,
        unique : true
    },

    longUrl : {
        type: String,
        required: true
    },

    shortUrl: {
        type: String,
        unique : true,
        required: true
    }

}, { timestamps : true })

module.exports = mongoose.model('Url', urlSchema)
