const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

const corsOption = {
    origin: 'https://bakhoeleconsulting.com',
    methods: ['GET','POST','DELETE','POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
}

// Middleware
app.use(cors(corsOption)); // Allow CORS
app.use(bodyParser.urlencoded({extended:false})); // Parse JSON bodies
app.use(bodyParser.json());


const PORT = process.env.PORT || 4000;

// Configure NodeMailer Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: '465',
  secure: 'true',
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_APP_PASSWORD, // Your email password or App Password
  },
});


// Route to handle contact form submissions
app.post("/send-email", (req, res) => {
  const {name, email, phone, company, message } = req.body;

  // Construct email options
  const mailOptions = {
    from: email, // Use the sender's email address as the "from" address
    to: process.env.RECIPIENT_EMAIL, // Your email address to receive messages
    subject: `New Message from ${name} (${company || "No Company"})`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone || "No phone provided"}
      Company: ${company || "No company provided"}
      Message: ${message}
    `,
    html: `
      <h3>BAKHOELE LL CONSULTING<h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "No phone provided"}</p>
      <p><strong>Company:</strong> ${company || "No company provided"}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ success: false, message: "Email failed to send." });
    }
    console.log("Email sent successfully:", info.response);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  });
});


// // Test the transporter connection
// transporter.sendMail(mailOptions, (error) => {
//   if (error) {
//     console.error('Error sending email:', error);
//     return res.status(500).json({ success: false, message: "Error sending email" });
//   }
//   res.status(200).json({ success: true, message: "Message Sent Successfully" });
// });


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
