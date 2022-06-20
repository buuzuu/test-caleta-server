const emailService = require("../config/nodemailer")
const nodemailer = require('nodemailer')
const { Organizations } = require('../models/organizations')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'caleta.advertisement@gmail.com',
      pass: 'datapac2021'
    },
    secureConnection: false,
    requireTLS:true,
    port: 587,
    tls:{
      rejectUnauthorized:false
  }
  });

 

exports.getAds = async (req, res) => {

    const existing = await Organizations.findOne({ domainName: { $eq: req.params.domain } })
    if (!existing) return res.status(404).send({ msg: "Domain not registered." })
    if (existing.adsAllowed == true) {
        return res.status(200).send(existing.advertisements)
    } else {
        return res.status(204).send({ msg: "Organization doesn't allow advertisement" });
    }
}

exports.createAd = async (req, res) => {

    const existing = await Organizations.findOne({ domainName: { $eq: req.params.domain } })
    if (!existing) return res.status(404).send({ msg: "Domain not registered." })
    let adList = existing.advertisements
    const data = {
        printCount: 0,
        fileName: req.params.fileName,
        product: req.params.productName,
        id: adList.length + 1,
        url: "https://www.caletasolutions.com:5000/" + req.params.domain + "/" + req.params.fileName
    };
    adList.push(data)
    existing.advertisements = adList
    await existing.save()
    return res.status(201).send({ msg: "Advertisement added." })
}


exports.addPrintCount = async (req, res) => {

    const existing = await Organizations.findOne({ domainName: { $eq: req.params.domain } })
    if (!existing) return res.status(404).send({ msg: "Domain not registered." })
    let adList = existing.advertisements
    adList.forEach(async function (value, index) {
        if (req.params.id == value.id) {
            var currentAd = value
            currentAd.printCount = currentAd.printCount + 1
            adList[index] = currentAd
            existing.advertisements = adList
            await existing.save()
            return res.status(200).send({ msg: "Count Updated." })
        }
    })
    return res.status(404).send({ msg: "Ad not found." })

};

exports.getPrintCount = async (req, res) => {
    
        const existing = await Organizations.findOne({ domainName: { $eq: req.params.domain } })
        if (!existing) return res.status(404).send({ msg: "Domain not registered." })
        let adList = existing.advertisements
        adList.forEach( function (value) {
            if (req.params.id == value.id) {
                return res.status(200).send({ printCount: value.printCount })
            }
        })
       
    
};

exports.sendEmail = async (req,res) => {
    let org = req.body.domain;
    let adId = (req.body.adId)
    let email = req.body.email;
    let name = req.body.name;
    
    const existing = await Organizations.findOne({ domainName: { $eq: org } })
    if (!existing) return res.status(404).send({ msg: "Domain not registered." })
        let adList = existing.advertisements
        adList.forEach(async function (value) {
            if (adId === value.id) {
                console.log("Inside")
                var mailOptions = {
                    from: 'caleta.advertisement@gmail.com',
                    to: email,
                    subject: 'Sending Email using Node.js',
                    text: `Hi Smartherd, thank you for your nice Node.js tutorials.
                            I will donate 50$ for this course. Please send me payment options.`
                          
                  };
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                      res.status(400).send(false)
                    } else {
                      console.log('Email sent: ' + info.response);
                      res.status(400).send(true)
                    }
                  });
                            
            }
        })
        
}

