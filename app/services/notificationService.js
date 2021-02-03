const admin = require('firebase-admin')
const serviceAccount = require('../paddle-300111-firebase-adminsdk-dskg2-ef2ccbf2d1.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https:/paddle-300111.firebaseio.com'
})

async function sendNotification (deviceTokens, payload) {
  console.log('from notification service', deviceTokens)
  const tokens = []
  /* deviceTokens.forEach((token) => {
    if (token.device_token) {
      tokens.push(token.device_token)
    }
  }) */
  deviceTokens.forEach(token => {
    tokens.push(token)
  })
  console.log(tokens)
  const messageNotification = payload
  messageNotification.tokens = tokens
  // messageNotification.data.click_action = 'FLUTTER_NOTIFICATION_CLICK'
  // messageNotification.content_available = true
  // messageNotification.mutable_content = true
  try {
    console.log(messageNotification)
    const response = await admin.messaging().sendMulticast(messageNotification)
    console.log('Success Count:  ' + (response).successCount)
    return response.successCount
  } catch (err) {
    console.log(err)
    return 0
  }
}

module.exports = {
  sendNotification
}
