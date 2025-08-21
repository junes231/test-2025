const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');

// Initialize the app ONCE, outside the function handler
admin.initializeApp();

// Register an HTTP function
functions.http('grantAdminRole', async (req, res) => {
  // Set CORS headers for preflight and actual requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // End preflight requests immediately
    res.status(204).send('');
    return;
  }
  
  // To call this function, the Firebase client SDK (v9+) automatically wraps the
  // payload in a 'data' object. So we read from req.body.data.
  const email = req.body.data.email;

  if (!email) {
    console.error("Request body is missing 'data.email'");
    res.status(400).send({ error: { message: "Request body must have a 'data.email' field." } });
    return;
  }

  try {
    console.log(`Attempting to find user with email: ${email}`);
    const user = await admin.auth().getUserByEmail(email);
    
    console.log(`Setting custom claim for UID: ${user.uid}`);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    
    const successMessage = `Success! ${email} has been made an admin.`;
    console.log(successMessage);
    // When called from a Firebase client SDK, the response must also be wrapped in a 'data' object.
    res.status(200).send({ data: { message: successMessage } });

  } catch (error) {
    console.error("Failed to set admin role:", error);
    // Send a structured error back to the client
    res.status(500).send({ error: { message: `Internal server error: ${error.message}` } });
  }
});
