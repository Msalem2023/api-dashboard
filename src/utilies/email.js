import nodemailer from "nodemailer";

async function sendEmail({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments = [],
} = {}) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  let info = await transporter.sendMail({
    from: `"Dashboard" <${process.env.gmail}>`, 
    to,
    cc,
    bcc,
    subject,
    html,
    attachments,
  });

  return info.rejected.length ? false : true;
}

export default sendEmail;
  