const admin = require('firebase-admin');

admin.initializeApp();

/**
 * An HTTP-triggered Cloud Function to grant a user the admin role.
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 */
exports.grantAdminRole = async (req, res) => {
  // Set CORS headers for preflight requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
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
