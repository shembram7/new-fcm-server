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
    // লক্ষ্য করুন: আপনি যদি লোকাল পিসিতে টেস্ট করেন এবং Environment Variable সেট না থাকে,
    // তবে এটি এরর দিতে পারে। লোকাল টেস্টের জন্য service-account.json ফাইল ব্যবহার করা ভালো।
    // কিন্তু Render-এ Environment Variable সেট থাকলে এই কোড ঠিক আছে।
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
 * ✅ Send Notification API (Updated with Dynamic Topic)
 */
app.post('/send-notification', async (req, res) => {
  console.log("📩 Request Received:", req.body);

  // ১. অ্যাপ থেকে 'topic' রিসিভ করা হচ্ছে
  const { title, body, topic } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      error: 'Title and Body are required'
    });
  }

  // ২. যদি টপিক পাঠানো হয়, সেটি ব্যবহার হবে। না হলে 'all' ব্যবহার হবে।
  const targetTopic = topic ? topic : 'all';

  const message = {
    notification: {
      title,
      body
    },
    topic: targetTopic // ৩. এখানে ডাইনামিক টপিক বসানো হলো
  };

  try {
    const response = await admin.messaging().send(message);

    console.log(✅ Notification Sent to topic '${targetTopic}':, response);

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
  console.log(`🚀 Server running on port ${PORT}`);
});
