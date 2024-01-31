var nodemailer = require("nodemailer");

async function mail({ email, html, sub }) {

    var transporter = nodemailer.createTransport({
        name: process.env.MAILNAME,
        host: process.env.MAILHOST,
        port: 465,
        secure: true,
        auth: { 
            user: process.env.MAILID,
            pass: process.env.MAILPASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    var mailOptions = {
        from: `"Otp" <${process.env.FROMMAILID}>`,
        to: email,
        subject: sub,
        html,
    };

    await new Promise((resolve, reject) => {
        transporter.verify(function (error, response) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Server is ready to take our messages');
                resolve(response);
            }
        });
    })

    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error(err)
                reject(err);
            } else {
                console.log(response)
                resolve(response);
            }
        });
    });
}

module.exports = mail