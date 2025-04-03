// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//   // 1) Create a Transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
//   // const transporter = nodemailer.createTransport({
//   //     service: 'gmail',
//   //     auth: {
//   //         user: process.env.EMAIL_USERNAME,
//   //         pass: process.env.EMAIL_PASSWORD,
//   //     },
//   //     // Activate in gmail 'less secure app' option
//   // });

//   // 2) Define the email Options
//   const mailOptions = {
//     from: "Maxwell <obisikemaxwell@gmail.com>",
//     to: options.to,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3) Send the Email Message
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
