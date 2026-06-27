const nodemailer = require("nodemailer");

//transporter to contact google's smtp server [that is why clientid, clientsecret, refreshtoken is required]
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN, // from oauth2
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting email to server: ", error);
  } else {
    console.log("Email server is ready to send messages!");
  }
});

//Function to send Email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`, //sender address
      to, // list of receivers
      subject, //content of sub
      text, //msg plain text
      html, //html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (e) {
    console.error("Error sending mail:", e);
  }
};

 exports.sendRegisterationEmail = async (userEmail, name) => {
  const subject = "Welcome to Backend Ledger!";
  const text = `Hello ${name}, \n\n Thankyou for registering at Bakend-Ledger. 
  We're excited to have you in our family! \n\n Best regards, \nThe Backend-Ledger Team `;
  const html = `<p>
  Hello ${name}, </p><p>Thankyou for registering at Bakend-Ledger. 
  We're excited to have you in our family!</p><p> Best regards, <br/>The Backend-Ledger Team 
  </p>`;

  await sendEmail(userEmail, subject, text, html);
};

exports.sendTransactionEmail = async (userEmail, name, amount, toAccount) => {
  const subject = "Transaction Successful!";
  const text = `Hello ${name}, \n\n Your transaction of $${amount} to account ${toAccount} was successful. \n\n Best regards, \n The Backend Ledger Team`;
  const html = `<p>Hello ${name}, </p><p> Your transaction of $${amount} to account ${toAccount} was successful. </p><p> Best regards, <br/> The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
};

exports.sendTransactionFailureEmail = async (
  userEmail,
  name,
  amount,
  toAccount,
) => {
  const subject = "Transaction Failed!";
  const text = `Hello ${name}, \n\n Your transaction of $${amount} to account ${toAccount} has failed. Please try again later. \n\n Best regards, \n The Backend Ledger Team`;
  const html = `<p>Hello ${name}, </p><p> Your transaction of $${amount} to account ${toAccount} has failed. Please try again later. </p><p> Best regards, <br/> The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
};
