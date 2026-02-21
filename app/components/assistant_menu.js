import React, { Component } from 'react';
import {
  Animated,
  Alert,
  Dimensions,
  Linking,
  Platform,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Color from '../utils/Color.js';
import * as NavService from '../utils/navigationService';

const { width, height } = Dimensions.get('window');

export default class AssistantMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.position = new Animated.ValueXY({
      x: width - 64,
      y: Math.round(height * 0.55),
    });
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onMoveShouldSetPanResponderCapture: (_, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        this.position.setOffset({
          x: this.position.x.__getValue(),
          y: this.position.y.__getValue(),
        });
        this.position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: this.position.x, dy: this.position.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: () => {
        this.position.flattenOffset();
        const x = this.position.x.__getValue();
        const y = this.position.y.__getValue();
        const maxX = width - 56;
        const maxY = height - 120;
        const minX = 4;
        const minY = 90;
        this.position.setValue({
          x: Math.max(minX, Math.min(maxX, x)),
          y: Math.max(minY, Math.min(maxY, y)),
        });
      },
    });
  }

  closeMenu = () => {
    this.setState({ open: false });
  };

  openExternal = async (url, fallbackMessage) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) {
        Linking.openURL(url);
      } else {
        Alert.alert('App', fallbackMessage || 'App is not installed');
      }
    } catch (e) {
      Alert.alert('App', fallbackMessage || 'Cannot open app');
    }
  };

  openMessagesApp = async () => {
    if (Platform.OS === 'android') {
      try {
        // Open Google Messages app home only (no compose/new chat fallback)
        await Linking.openURL(
          'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.google.android.apps.messaging;end',
        );
      } catch (e) {
        Alert.alert('App', 'Cannot open Google Messages app home');
      }
      return;
    }
    try {
      await Linking.openURL('sms:');
    } catch (e) {
      Alert.alert('App', 'Messages app is not available');
    }
  };

  openTelegramApp = async () => {
    if (Platform.OS === 'android') {
      const tryUrls = [
        // Telegram app scheme
        'tg://',
        // Telegram deep-link scheme
        'tg://resolve?domain=telegram',
        // Telegram main app package launcher
        'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=org.telegram.messenger;end',
        // Telegram X
        'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=org.thunderdog.challegram;end',
      ];
      for (let i = 0; i < tryUrls.length; i++) {
        try {
          await Linking.openURL(tryUrls[i]);
          return;
        } catch (e) {}
      }
      Alert.alert('App', 'Cannot open Telegram');
      return;
    }
    try {
      await Linking.openURL('tg://');
    } catch (e) {
      Alert.alert('App', 'Cannot open Telegram');
    }
  };

  openViberApp = async () => {
    if (Platform.OS === 'android') {
      const pkgs = ['com.viber.voip', 'com.viber.voip.w4b'];
      const tryUrls = ['viber://', 'viber://chat'];
      pkgs.forEach((pkg) => {
        tryUrls.push(`android-app://${pkg}`);
        tryUrls.push(`intent://#Intent;package=${pkg};end`);
        tryUrls.push(`intent://chat#Intent;scheme=viber;package=${pkg};end`);
        tryUrls.push(
          `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${pkg};end`,
        );
      });
      for (let i = 0; i < tryUrls.length; i++) {
        try {
          await Linking.openURL(tryUrls[i]);
          return;
        } catch (e) {}
      }
      Alert.alert('App', 'Cannot open Viber');
      return;
    }
    try {
      await Linking.openURL('viber://');
    } catch (e) {
      Alert.alert('App', 'Cannot open Viber');
    }
  };

  renderAction(label, onPress) {
    return (
      <TouchableOpacity
        key={label}
        style={styles.actionBtn}
        onPress={() => {
          this.closeMenu();
          onPress();
        }}
      >
        <Text style={styles.actionTxt}>{label}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View pointerEvents="box-none" style={styles.root}>
        <Animated.View
          {...this.panResponder.panHandlers}
          style={[
            styles.floatingWrap,
            {
              transform: this.position.getTranslateTransform(),
            },
          ]}
        >
          {this.state.open && (
            <View style={styles.actionsWrap}>
              {this.renderAction('MAIN', () => NavService.navigate('Main'))}
              {this.renderAction('HOME', () => NavService.navigate('Home'))}
            </View>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bubble}
            onPress={() => this.setState({ open: !this.state.open })}
          >
            <Text style={styles.bubbleTxt}>{this.state.open ? 'X' : 'A'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
  },
  floatingWrap: {
    position: 'absolute',
    width: 52,
    alignItems: 'center',
  },
  bubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.35)',
    borderWidth: 1,
    borderColor: '#ffffff66',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsWrap: {
    marginBottom: 8,
    alignItems: 'center',
  },
  actionBtn: {
    minWidth: 70,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(31, 31, 31, 0.4)',
    marginBottom: 6,
    alignItems: 'center',
  },
  actionTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
