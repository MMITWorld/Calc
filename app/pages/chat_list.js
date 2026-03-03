import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import Color from '../utils/Color.js';

export default class ChatList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      chats: [],
      me: null,
    };
    this._unsub = null;
  }

  async componentDidMount() {
    const raw = await AsyncStorage.getItem('user');
    const arr = raw ? JSON.parse(raw) : [];
    const me = arr && arr.length ? arr[0] : null;
    this.setState({ me });

    if (!auth().currentUser) {
      try {
        await auth().signInAnonymously();
      } catch (e) {}
    }

    // store FCM token for push
    try {
      const token = await messaging().getToken();
      if (me && me.UserID && token) {
        await firestore().collection('app_users').doc(String(me.UserID)).set({
          userId: String(me.UserID),
          userNo: me.UserNo || '',
          userName: me.UserName || '',
          token: token,
          updatedAt: firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {}

    const meId = me && me.UserID ? String(me.UserID) : null;
    if (!meId) {
      this.setState({ loading: false, chats: [] });
      return;
    }

    this._unsub = firestore()
      .collection('chats')
      .where('participantIds', 'array-contains', meId)
      .orderBy('lastMessageAt', 'desc')
      .onSnapshot(snap => {
        const list = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        this.setState({ chats: list, loading: false });
      }, () => {
        this.setState({ loading: false });
      });
  }

  componentWillUnmount() {
    if (this._unsub) this._unsub();
  }

  _openChat = (chat) => {
    const me = this.state.me || {};
    const meId = String(me.UserID || '');
    const participants = chat.participants || {};
    let otherId = '';
    let otherNo = '';
    Object.keys(participants).forEach(k => {
      if (k !== meId) {
        otherId = k;
        otherNo = participants[k].userNo || '';
      }
    });
    this.props.navigation.navigate('ChatRoom', {
      chatId: chat.id,
      otherUserId: otherId,
      otherUserNo: otherNo,
      me: me
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chat</Text>
        {this.state.loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={this.state.chats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const last = item.lastMessage || '';
              const participants = item.participants || {};
              const me = this.state.me || {};
              const meId = String(me.UserID || '');
              let otherNo = '';
              Object.keys(participants).forEach(k => {
                if (k !== meId) otherNo = participants[k].userNo || '';
              });
              return (
                <TouchableOpacity style={styles.row} onPress={() => this._openChat(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{otherNo || 'User'}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>{last}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                No chats yet.
              </Text>
            }
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: Color.DARKPRIMARYTEXTCOLOR, marginBottom: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  rowTitle: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  rowSub: { fontSize: 13, color: '#666', marginTop: 2 }
});
