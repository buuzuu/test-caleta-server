const nodemailer = require('nodemailer');

    const emailAddress = "caleta.advertisement@gmail.com";
    const password = "datapac2021";

    var mail = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: emailAddress,
          pass: password
        },
        tls:{
          rejectUnauthorized:false
      }
      });

    exports.sendEmail = async (email,name,product,url) => {
         
    var emailOptions = {
        from: emailAddress,
        to: email,
        subject: "Get to know more about - "+product.toUpperCase(),
        html: 
        ` <h2>Hi, ${name}</h2>
        <h3>You are receiving this e-mail because you chose to get more infor about the ad you just saw while using our application.</h3>
        <p >Kind Regards</p>
        <p>Caleta Advertisement Team</p>`,
        attachments : [{filename:"advertisement.jpg",path:url}]
    }

    let resp = await wrapedSendMail(emailOptions);
    return resp;
  }


  async function wrapedSendMail(mailOptions){
    return new Promise((resolve,reject)=>{
    

 mail.sendMail(mailOptions, function(error, info){
    if (error) {
       resolve(false);
    } 
   else {
       resolve(true);
    }
   });
   })
   }