const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

// সার্ভিস অ্যাকাউন্ট ফাইল লোড করা হচ্ছে
// এই ফাইলটি index.js এর পাশেই থাকতে হবে
const serviceAccount = require('./service-account.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("✅ Firebase Admin Initialized Successfully!");
} catch (error) {
  console.error("❌ Firebase Initialization Failed:", error);
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// রুট রাউট (সার্ভার চেক করার জন্য)
app.get('/', (req, res) => {
  res.send('FCM Server is Running & Ready!');
});

// নোটিফিকেশন পাঠানোর রাউট
app.post('/send-notification', async (req, res) => {
  console.log("📩 Request Received:", req.body);

  const { title, body } = req.body;

  if (!title || !body) {
    console.error("❌ Missing Title or Body");
    return res.status(400).send({ success: false, error: 'Title and Body are required' });
  }

  const message = {
    notification: {
      title: title,
      body: body
    },
    topic: 'all' // অ্যাপের ইউজাররা এই টপিকে সাবস্ক্রাইব করা থাকতে হবে
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification Sent Successfully:', response);
    res.status(200).send({ success: true, messageId: response });
  } catch (error) {
    console.error('❌ Error Sending Notification:', error);
    // ঠিক কি কারণে এরর হচ্ছে তা এখানে দেখা যাবে
    res.status(500).send({ 
        success: false, 
        error: error.message,
        code: error.code 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`);
});