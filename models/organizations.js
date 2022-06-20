const mongoose = require('mongoose')




const advertisement = mongoose.Schema({
    fileName: {type: String},
    id: {type: Number, required: true },
    printCount : {type: Number, required: true },
    product : {type: String, required: true },
    url : {type: String, required: true }
})

const user = mongoose.Schema({
    accessToken:{type: String },
    cardNumber : {type: String, required: true, unique: true },
    isRevoked : {type: Boolean, default: false },
    refreshToken : {type: String },
    updatedAt : {type: String, required: true }
})

const organization = mongoose.model('Organizations', new mongoose.Schema({

    domainName: {type: String, required: true, unique: true},
    adsAllowed: { type: Boolean, default: false},
    advertisements: [advertisement],
    users: [user]

}))

exports.Organizations = organization;