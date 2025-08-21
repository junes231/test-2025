const admin = require('firebase-admin');
const functions = require('@google-cloud/functions-framework');

admin.initializeApp();

functions.http('grantAdminRole', async (req, res) => {
  // Set CORS headers to allow requests from any origin (including our tool)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // End preflight requests immediately
    res.status(204).send('');
    return;
  }

  const email = req.body.data.email;
  if (!email) {
    res.status(400).send({ error: { message: "Request body must have a 'data.email' field." } });
    return;
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    res.status(200).send({ data: { message: `Success! ${email} has been made an admin.` } });
  } catch (error) {
    console.error("Failed to set admin role:", error);
    res.status(500).send({ error: { message: `Internal server error: ${error.message}` } });
  }
});
