const express = require('express')
const cors = require("cors")
const mongoose = require('mongoose')
const app = express()
const https = require("https")
const fs = require('fs')
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const adService = require('./service/adService')
const loginService = require("./service/loginService")
const multer = require('multer')
const fsExtra = require('fs-extra')
const url = 'mongodb://localhost:27017/caleta_onedrive'

// mongoose.connect(url)
// .then(() => console.log('Connected to MongoDB.'))
// .catch(err => console.error('Could not connect to MongoDB', err))

app.use(express.static('Advertisements'))
app.use(express.static('uploads'))
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors({origin: 'true'}));

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname)
  }
}) 

const multerFilter = (req, file,cb) => {
  if(file.mimetype.split('/')[1] === 'pdf'){
    cb(null,true)
  }else{
    cb(new Error('Not a pdf file'),false)
  }
}

const upload = multer(
  {
    storage : multerStorage
  }
)

app.post("/checkCardNumber/:domain/:cardNumber",loginService.checkCardNumber)
app.post("/getAccessToken/:domain/:cardNumber/:authToken",loginService.getTokensFromAuth)
app.post("/createAd/:domain/:fileName/:productName", adService.createAd);
app.get("/getAds/:domain", adService.getAds);
app.get("/getPrintCount/:domain/:id",adService.getPrintCount)
app.put("/addPrintCount/:domain/:id",adService.addPrintCount);
app.post("/sendEmail",adService.sendEmail);

app.post("/addDomain/:domainName",loginService.addDomain);
app.get("/getAllOrganizations",loginService.getAllOrganizations);
app.post("/uploadFile",upload.array('myFile', 3) , async(req, res) =>{
  if (res.error === undefined){
    return res.status(200).send()
  }else{
    return res.status(500).send()
  }  
});
app.get("/clear", async(req,res) => {
  fsExtra.emptyDirSync('uploads')
  res.status(200).send()
})

app.get("/list", async(req,res) => {

  let w = []
  fs.readdirSync('uploads').forEach(file => {
    w.push(file.toString())
  });
  res.status(200).send(w)

})




const options = {
  definition: {
    info: {
      title: "Caleta Scan to OneDrive Server Application",
      description:
        "Server application that handles requests from the client application and the database"
     },
    servers: [{url:"localhost:5000"}]
  },
  apis: ["./docs/*.yaml"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);  
const port = process.env.PORT || 5000;
// https.createServer(serverOptions, app).listen(port , () =>{
//   console.log("Caleta OneDrive & Sharepoint Server Running on port 5000..")
// })

app.listen(port , () =>{
  console.log("Caleta OneDrive & Sharepoint Server Running on port "+port)
})
