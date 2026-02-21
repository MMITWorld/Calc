import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  AsyncStorage,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Color from '../utils/Color.js';

export default class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      me: null,
      chatId: props.navigation.state.params.chatId || null,
      otherUserId: props.navigation.state.params.otherUserId || '',
      otherUserNo: props.navigation.state.params.otherUserNo || '',
      messages: [],
      text: ''
    };
    this._unsub = null;
  }

  async componentDidMount() {
    const raw = await AsyncStorage.getItem('user');
    const arr = raw ? JSON.parse(raw) : [];
    const me = arr && arr.length ? arr[0] : (this.props.navigation.state.params.me || null);
    this.setState({ me });

    if (!auth().currentUser) {
      try { await auth().signInAnonymously(); } catch (e) {}
    }

    let chatId = this.state.chatId;
    if (!chatId && me && me.UserID && this.state.otherUserId) {
      const ids = [String(me.UserID), String(this.state.otherUserId)].sort();
      chatId = ids.join('_');
      this.setState({ chatId });
    }

    if (chatId) {
      this._unsub = firestore()
        .collection('chats').doc(chatId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
          const list = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          this.setState({ messages: list });
        });
    }
  }

  componentWillUnmount() {
    if (this._unsub) this._unsub();
  }

  _send = async () => {
    const { text, chatId, me, otherUserId } = this.state;
    if (!text.trim() || !me || !me.UserID || !chatId) return;
    const meId = String(me.UserID);
    const otherId = String(otherUserId);
    const chatRef = firestore().collection('chats').doc(chatId);
    const msg = {
      text: text.trim(),
      senderId: meId,
      createdAt: firestore.FieldValue.serverTimestamp()
    };
    await chatRef.set({
      participantIds: [meId, otherId],
      participants: {
        [meId]: { userNo: me.UserNo || '', userName: me.UserName || '' },
        [otherId]: { userNo: this.state.otherUserNo || '', userName: '' }
      },
      lastMessage: msg.text,
      lastMessageAt: firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    await chatRef.collection('messages').add(msg);
    this.setState({ text: '' });
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{this.state.otherUserNo || 'Chat'}</Text>
        </View>
        <FlatList
          data={this.state.messages}
          keyExtractor={(item) => item.id}
          inverted
          renderItem={({ item }) => {
            const meId = this.state.me ? String(this.state.me.UserID) : '';
            const mine = item.senderId === meId;
            return (
              <View style={[styles.msgRow, mine ? styles.msgRight : styles.msgLeft]}>
                <Text style={[styles.msgText, mine ? styles.msgTextRight : styles.msgTextLeft]}>
                  {item.text}
                </Text>
              </View>
            );
          }}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={this.state.text}
            onChangeText={(t)=>this.setState({ text: t })}
            placeholder="Type message..."
          />
          <TouchableOpacity style={styles.sendBtn} onPress={this._send}>
            <Text style={{ color:'#fff', fontWeight:'bold' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 50, backgroundColor: Color.PRIMARYCOLOR, alignItems:'center', justifyContent:'center' },
  headerText: { color:'#fff', fontSize:16, fontWeight:'bold' },
  msgRow: { marginVertical:4, marginHorizontal:10, padding:8, borderRadius:8, maxWidth:'75%' },
  msgLeft: { alignSelf:'flex-start', backgroundColor:'#eee' },
  msgRight: { alignSelf:'flex-end', backgroundColor:Color.PRIMARYCOLOR },
  msgText: { fontSize:14 },
  msgTextLeft: { color:'#000' },
  msgTextRight: { color:'#fff' },
  inputRow: { flexDirection:'row', padding:8, borderTopWidth:1, borderColor:'#eee' },
  input: { flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:6, paddingHorizontal:10, height:40 },
  sendBtn: { marginLeft:8, backgroundColor:Color.PRIMARYCOLOR, borderRadius:6, paddingHorizontal:14, justifyContent:'center' }
});
