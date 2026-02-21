const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

function getOtherParticipantId(participantIds, senderId) {
  if (!Array.isArray(participantIds)) return null;
  return participantIds.find(id => String(id) !== String(senderId)) || null;
}

async function getUserToken(userId) {
  if (!userId) return null;
  const doc = await admin.firestore().collection('app_users').doc(String(userId)).get();
  if (!doc.exists) return null;
  const data = doc.data() || {};
  if (Array.isArray(data.tokens) && data.tokens.length) {
    return data.tokens.filter(Boolean);
  }
  return data.token || null;
}

async function getSenderName(chatDoc, senderId) {
  const participants = (chatDoc && chatDoc.participants) || {};
  const sender = participants[String(senderId)] || {};
  return sender.userNo || sender.userName || 'New message';
}

exports.onChatMessageCreate = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const msg = snap.data() || {};
    const chatId = context.params.chatId;
    const senderId = msg.senderId;
    if (!senderId) return null;

    const chatRef = admin.firestore().collection('chats').doc(chatId);
    const chatSnap = await chatRef.get();
    if (!chatSnap.exists) return null;
    const chat = chatSnap.data() || {};

    const otherId = getOtherParticipantId(chat.participantIds, senderId);
    if (!otherId) return null;

    const token = await getUserToken(otherId);
    if (!token || (Array.isArray(token) && token.length === 0)) return null;

    const title = await getSenderName(chat, senderId);
    const body = msg.text || 'New message';

    const payload = {
      notification: {
        title,
        body
      },
      data: {
        chatId: String(chatId),
        senderId: String(senderId),
        receiverId: String(otherId),
        text: String(msg.text || '')
      }
    };

    const options = {
      priority: 'high',
      timeToLive: 60 * 60
    };

    if (Array.isArray(token)) {
      return admin.messaging().sendToDevice(token, payload, options);
    }
    return admin.messaging().sendToDevice([token], payload, options);
  });
