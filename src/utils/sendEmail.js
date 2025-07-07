const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email,otp) => {
  const resp = await resend.emails.send({
    from: 'noreply@mohammedjalal.in',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  });
};

module.exports = { sendOtpEmail };
