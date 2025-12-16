const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * ✅ Firebase Admin Initialization (Render / Production Safe)
 * Service Account JSON আসবে Environment Variable থেকে
 */
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log("✅ Firebase Admin Initialized Successfully!");
  }
} catch (error) {
  console.error("❌ Firebase Initialization Failed:", error);
}

/**
 * ✅ Root Route (Health Check)
 */
app.get('/', (req, res) => {
  res.send('FCM Server is Running & Ready!');
});

/**
 * ✅ Send Notification API
 */
app.post('/send-notification', async (req, res) => {
  console.log("📩 Request Received:", req.body);

  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      error: 'Title and Body are required'
    });
  }

  const message = {
    notification: {
      title,
      body
    },
    topic: 'all' // Android app-এ "all" topic subscribe থাকতে হবে
  };

  try {
    const response = await admin.messaging().send(message);

    console.log('✅ Notification Sent:', response);

    res.status(200).json({
      success: true,
      messageId: response
    });
  } catch (error) {
    console.error('❌ Error Sending Notification:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

/**
 * ✅ Server Start (Render Compatible)
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(🚀 Server running on port ${PORT});
});
