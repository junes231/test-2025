const admin = require('firebase-admin');
admin.initializeApp();
exports.grantAdminRole = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  const email = req.body.data.email;
  if (!email) {
    res.status(400).send({ error: { message: "Request must have an 'email' in the data field." }});
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
};
