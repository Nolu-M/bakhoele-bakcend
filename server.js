const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const fetch = require('node-fetch'); // For making API requests

const app = express();

// CORS setup
const corsOptions = {
  origin: 'https://bakhoeleconsulting.com', // Replace with your website URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Route to handle contact form submissions
app.post('/send-email', async (req, res) => {
  const { firstName, lastName, email, phone, company, message } = req.body;

  // Combine the sender's name
  const name = `${firstName} ${lastName}`;

  // Email data for sending
  const emailData = {
    from: `${name} <${email}>`, // Sender's email (displayed as "from" in the email)
    to: process.env.RECIPIENT_EMAIL, // Your email where messages will be delivered
    subject: `New message from ${name} (${company || 'No company'})`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'No phone provided'}
      Company: ${company || 'No company provided'}
      Message: ${message}
    `,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'No phone provided'}</p>
      <p><strong>Company:</strong> ${company || 'No company provided'}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    // Make a request to Mailgun's API
    const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } else {
      const errorText = await response.text();
      console.error('Mailgun error:', errorText);
      return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
