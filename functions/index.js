const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Explicitly initialize the Admin SDK with the Project ID
admin.initializeApp({
  projectId: "funnel-editor-netlify"
});

/**
 * An HTTPS Callable function to grant a user the admin role.
 */
exports.grantAdminRole = functions.https.onCall(async (data, context) => {

  // Security check: ensure the caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  
  const email = data.email;
  if (!(typeof email === 'string') || email.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "email" argument.');
  }

  try {
    console.log(`Attempting to find user with email: ${email}`);
    const user = await admin.auth().getUserByEmail(email);

    console.log(`Setting custom claim for UID: ${user.uid}`);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });

    const successMessage = `Success! ${email} has been made an admin.`;
    console.log(successMessage);
    return { message: successMessage };

  } catch (error) {
    console.error('Failed to set admin role:', error);
    throw new functions.https.HttpsError('internal', error.message, error);
  }
});
