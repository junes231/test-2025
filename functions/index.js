const functions = require('firebase-functions');
const admin = require('firebase-admin');

// --- PASTE YOUR JSON KEY CONTENT HERE ---
const serviceAccount = {
    "type": "service_account",
  "project_id": "funnel-editor-netlify",
  "private_key_id": "a3be83aaa4694f4d45f781bfec912e47f51a096a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWfWSdxJ1xRfnX\n/1oZVDclwqSxjlyJhcRLieLbPnNBZXNtsrccvCWgB0JfAvXSZOqSjHW8D+x1HjXL\nONHiLrE+qHz2W/euT2ejia2q8fTZSZH+jm640SNpSGe0w5B7k3zlXtqrlQq8qaMG\nxd1yU8IDgDK/1qy5keycDM8/CXUc9bttol6oOgkCn8WN0Hu8S8es1akYY+yda+Hu\n2oG2MHHjmZ7uYy5WO2I7oqOAwqvBAqztDPg8kIaJ+n7s/aIg20pMNjU5d2s3BXpA\niA1JwMVyfuXz5uQOlW+75HNylvAGhw0jgmi1KKDLDD8CilMdBxQpscWyloAhFB8C\ndKcXc09vAgMBAAECggEAFtjO0GKtQJprEApySZ4SV70sIiufXhi3vYdyTiyQm1KC\noUM277fM1tx0bJQZ+i9nWx/cufZaQhQV4nqVb18jiyCTBazrLOU8DWFGH0jcQ2RA\n9FlYoEAgDQAPko4oRDmEGsHn+fyLYxLmENEfvaSqrF50nsGaWWlFR6QHqVfJDUH0\n81RI+iJNqJj2S/cU/yAk/0aiyB7EcDi4VosMR+nGS2USG5r7Z3Q5w3DsFt+WOuPH\nYOzqr3FV9U7tJEosOckR6TfmSq+GKHNzU79fo7mc6XnokYC2YCeh0Qs6CXCLxtc3\nDlQVQPr8HbCRj6jlGE1XqUfKHER6PzgdPcWgLPwZXQKBgQD0eEAtF8I9bYUxInGR\nF2KxgmLeKrEc4ir9WYFJepAwcYwSjoeNfXgZpjb4/VR8ZbkChlfSwNqHiJ5SS3QS\nSnSzQaPD7JY5u0rzTd2UMKI8s1m77EArOmhI3tzZ/GbzjO83uX9w5eWFHf+UI9vu\njTEVYxkrB0VKbzai+5ea7fJ0JQKBgQDgmymGPhlMrVPHjHpIAlntbSMrfpGb67Dx\nB6o408NhMOXrD4/HQ0idRvwjyE5OqChgR6kBBKxhJvcT+TbcNUjOJgQArx/JH040\n5970X31IdrmRPvwhCWYvBcVAQ3ed4lWT2XCjY4LzQ2jTqj36agLe5CY4/E3DFovz\nw7jih4g3AwKBgCFI+hvpnzWz4q2U7fd+Qp6+jO2IzIKNPKMv+41glZ8y5opkQ4p9\nKcv8OIHgJA+n3e+9ENoODfLkJAI6abxPzOHXLw/u92k22faUhHW3xW8UUERo3zfD\nhQ1e4pz/Y5kHeE6TAAoEEyLzuaeW1kv9h1BNJNEZ9VI0IDFCphqfCSLNAoGBAKKC\nYacJo1CBUE7fa1JSsTJCduHvb/c6rwmWHCmFvqXBtXlABy2LlyyEwcY6Fb5/mMcg\n0j00XmzkvnyrInBt9UGC6/56tyrUBcftxLlXpdQaYuWehtp4bIC1UiTPK+sGahjR\niNgPFh5gtaYAVVur/Gu885LjqnfvBk/XWxw8J+h1AoGARf85Rb96/7Bzrh5uKIeN\nKsvp2B0SOhyxoPlXtDlcjvk5LkUiCbfuvbMeGfgfGVyRDJN1RmNRwjQ1gjx4vNU8\nHsqdMOKKTtMBTgpq4OCgC0M9n+idscqwOcMmo3n53nt6lxmGa8pobLz1AlK8s4Vx\nw72QGrEMsJEoPTWzGh04e2I=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-admin-functions@funnel-editor-netlify.iam.gserviceaccount.com",
  "client_id": "114366275037946860032",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-admin-functions%40funnel-editor-netlify.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
  // Paste the entire content of your downloaded JSON file here.
  // It will start with { "type": "service_account", ... }
};
// --- END OF PASTE SECTION ---

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.grantAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const email = data.email;
  if (!(typeof email === 'string') || email.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "email" argument.');
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    const successMessage = `Success! ${email} has been made an admin.`;
    return { message: successMessage };

  } catch (error) {
    console.error('Failed to set admin role:', error);
    throw new functions.https.HttpsError('internal', error.message, error);
  }
});
