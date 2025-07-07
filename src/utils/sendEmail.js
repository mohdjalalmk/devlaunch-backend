// const nodemailer = require("nodemailer");

// const EMAIL_USER = "jalalmohammed1818@gmail.com";
// const EMAIL_PASS = "buoq akpq nfbs ptvi";
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS,
//   },
// });

// const sendOtpEmail = async (to, otp) => {
//   await transporter.sendMail({
//     from: `"DevLaunch" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "Your verification code",
//     text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
//   });
// };

// module.exports = { sendOtpEmail };

const { Resend } = require("resend");

const resend = new Resend("re_KrQCREiy_HcwpNf2gsVs8uRmPs7Tp56ud");

const sendOtpEmail = async (email,otp) => {
  const resp = await resend.emails.send({
    from: 'noreply@mohammedjalal.in',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  });
  console.log(resp);
  
};

module.exports = { sendOtpEmail };
