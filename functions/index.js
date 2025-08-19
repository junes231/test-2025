const functions = require('firebase-functions');
const admin = require('firebase-admin');

// 在函数外部初始化 Admin SDK
admin.initializeApp();

/**
 * An HTTPS Callable function to grant a user the admin role.
 * This is the V2 standard for callable functions.
 */
exports.grantAdminRole = functions.https.onCall(async (data, context) => {

  // 安全检查：确保调用者是已登录的用户
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  
  const email = data.email;
  if (!(typeof email === 'string') || email.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "email" argument.');
  }

  try {
    // 获取目标用户的记录
    console.log(`Attempting to find user with email: ${email}`);
    const user = await admin.auth().getUserByEmail(email);

    // 设置自定义声明
    console.log(`Setting custom claim for UID: ${user.uid}`);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });

    // 返回成功信息
    const successMessage = `Success! ${email} has been made an admin.`;
    console.log(successMessage);
    return { message: successMessage };

  } catch (error) {
    console.error('Failed to set admin role:', error);
    // 将详细错误抛给客户端，方便调试
    throw new functions.https.HttpsError('internal', error.message, error);
  }
});
