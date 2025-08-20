const functions = require('firebase-functions');
const admin = require('firebase-admin');

// --- PASTE YOUR JSON KEY CONTENT HERE ---
const serviceAccount = {
   "type": "service_account",
  "project_id": "funnel-editor-netlify",
  "private_key_id": "f807beca529db12c4b5f64519c4dd28d9410d06e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDfZbcKRri7MVUA\n1TcewF6NJJrVyxvZ+9nz/VuNPs8XGdoPVtRmf+jKHgQHbyIWIbXPrlRUnzgbaqFn\nJrHCDEgCUC/w478uQJEG14dw1Y33kKtodufSMENGcYJka/QT58paSC4i9b8fvqbu\n9Mv+FkEtAh0EQ6WuBXx/I5YWi9cTR0OjWTgfyv3ykxI8Y8Fbyt2WY7u+SadXs4cr\nxCwhJ8+NVz8HY9cGWzPIQOlCuinCCHs5OicoiZ+yRgzu45ldmq+gJTxN65NFMGxE\njMq2Ux8xN7vhWOm0n6PwxkhWdF21DTe/gzc9k65NcqCVHFWshwPcERCUnn9OCguJ\ndTTq37flAgMBAAECggEAGoN7G2mfBXyKjvw/O/5EhTI50Yj3HRfShi46M5knlqF3\nVh24khJj7GUZQPv0IDX6Wuk2UgrJlnDBMjm58YK9Tc+ljkysGo8IMgyEzc6oDaCq\nb04Oynf27BaPDWBwn1IscSr4QCb0JY4znXsJS6E+4AV3BdQKMbgDTsry8RRsv3lG\nLIWCvK0cGy3ap94jhoF1W91rfop+KkyvILX310StrC6bxdgnkW/jGTqXxXIElLEw\nhvc48HVc+jYS2Z4+GvQl4ndS0OnYzQs+AlTlUvuzNHZ4B3xk3XWfs/Z/qQGs9gPQ\nEV9AuSL4Dlwnk86C7TZN+nIyD3wAYAfF6H2ONhwcqwKBgQDy46qh7CRTDtq+UOq5\nwYkE9es6wtdXocJz4cgqm5jBJE6zCy0kaAGPAsOriKPXgJ9smRlePBjU+bMKNfRN\nJyVvxVbU3vhO0cYQPxnps7qTD09dsqEFv+l0kbDxSJXaAgd1Tl/WgOLAUEBEYcYq\nCrs8bwwqxreYYMDjEdsSU6qGdwKBgQDrdLNuzf6Sybho+JsvgR+a5N7W3+CLo/cj\nn2O5Er4QHvASgC9M/gXwrNY7PaEmxWAsqgVkyVLl+ccrbzwdKyqGz4QPwd5ItKWb\nH5Q7FF4v5RiKknk8NHryqqvsHCAyu8HdD+uPddAbp82tTdV2nyDCN6gSpbgVPUqh\nVIeFmO+fgwKBgQCVg1uH7Sq3Dg/M01aKHf5QVWkFdObGBMcEOlnTEJDJY6YmRJz3\nKia7d8InFyd0ArMgUGXzQh8vCr4RbQEDdTNwSBOZWd+T9UFswssatw4EdIowbUL9\nnRMCNKStAjdsSY95wFLyYcgzBbNp5J3tR0nWe60Lr+NYI0bZACbQczwnJQKBgEcX\nuYXfVNplZfTr+49gYXaXXGFsv5PqMhjja2zaJ+EeNkafxahtmsWMqjLA7QOT3PIf\nc/l2gD1IKccHkxMLkY+a4LkRRFiXktk/s7YS9E1p0vskNs7i2ayjs71a0K4A2www\nXmO2ott20zdcpPNoILADtg/LUcW39+y2ZSUFhHSZAoGBALJhG72zIAs+FJc84jNv\njYTKslxHwpRciPxU0P966jxwRoX5U0IgeTcbQR6z98BII96pQdftDNKxe/CLm18t\nGi4zvjg33NHha286OYGO22Zs7pQG/CSvL5I11S73Oi7VKRLyH3kz+vGqKcp6x/qC\nj/UBMKYnBXhYRl8ZaENz1wsM\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-admin-functions-617@funnel-editor-netlify.iam.gserviceaccount.com",
  "client_id": "112277576302465532185",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-admin-functions-617%40funnel-editor-netlify.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
  // Paste the entire content of your downloaded JSON file here
  // Example:
  // "type": "service_account",
  // "project_id": "funnel-editor-netlify",
  // ... and so on
};
// --- END OF PASTE SECTION ---

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * An HTTPS Callable function to grant a user the admin role.
 */
exports.grantAdminRole = functions.https.onCall(async (data, context) => {
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
