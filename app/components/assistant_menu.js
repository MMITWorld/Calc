import React, { Component } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
  AsyncStorage,
  DeviceEventEmitter,
  Dimensions,
  Linking,
  Modal,
  Platform,
  PanResponder,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Color from '../utils/Color.js';
import numeral from 'numeral';
import dal from '../dal.js';
import * as NavService from '../utils/navigationService';

const { width, height } = Dimensions.get('window');

export default class AssistantMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      breakLoading: false,
      showBreakPModal: false,
      breakPData: [],
      breakPTotalUnit: 0,
      breakPTotalWinUnit: 0,
      breakPTitle: '',
      breakPUserSearch: '',
      ledgerLoading: false,
      showLedgerByUserModal: false,
      ledgerRows: [],
      ledgerTotalUnit: 0,
      ledgerUserNo: '',
      ledgerTermDetailID: '',
      ledgerSortKey: 'unit',
      ledgerSortOrder: 'desc',
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

  shouldShowBreakAll = () => {
    const routeName = NavService.getCurrentRouteName ? NavService.getCurrentRouteName() : null;
    return routeName === 'Ledger' || routeName === 'Sale2D' || routeName === 'Sale3D';
  };

  callBreakAll = async () => {
    if (this.state.breakLoading) return;
    const route = NavService.getCurrentRoute ? NavService.getCurrentRoute() : null;
    const params = (route && route.params) ? route.params : {};
    const endpoint = params.endpoint || (await AsyncStorage.getItem('endpoint'));
    if (!endpoint) {
      Alert.alert('App', 'Endpoint not found');
      return;
    }
    const termDetailID =
      params.termdetailsid ||
      params.termId ||
      params.TermDetailID ||
      'All';
    this.setState({ breakLoading: true });
    dal.getBreakP(endpoint, 'All', termDetailID, 'All', (err, resp) => {
      this.setState({ breakLoading: false });
      if (err || !resp || resp.Status !== 'OK' || !Array.isArray(resp.Data)) {
        Alert.alert('App', 'No Data!');
        return;
      }
      const rows = resp.Data.map((r) => this.normalizeBreakPRow(r));
      if (!rows.length) {
        Alert.alert('App', 'No Data!');
        return;
      }
      let totalUnit = 0;
      let totalWinUnit = 0;
      rows.forEach((r) => {
        totalUnit += r.totalUnit;
        totalWinUnit += r.totalWinUnit;
      });
      this.setState({
        breakPData: rows,
        breakPTotalUnit: totalUnit,
        breakPTotalWinUnit: totalWinUnit,
        breakPTitle: rows[0] && rows[0].termDetailName ? rows[0].termDetailName : '',
        breakPUserSearch: '',
        showBreakPModal: true,
      });
    });
  };

  getCurrentBreakContext = async () => {
    const route = NavService.getCurrentRoute ? NavService.getCurrentRoute() : null;
    const params = (route && route.params) ? route.params : {};
    const routeName = (route && route.routeName) ? route.routeName : '';
    const endpoint = params.endpoint || (await AsyncStorage.getItem('endpoint'));
    const termDetailID = params.termdetailsid || params.termId || params.TermDetailID || 'All';
    let lottType = params.LottType || params.lottType || params.type || '';
    if (!lottType) {
      if (routeName === 'Sale2D') lottType = '2D';
      else if (routeName === 'Sale3D') lottType = '3D';
      else if (routeName !== 'Ledger') lottType = '2D';
    }
    return { endpoint, termDetailID, lottType };
  };

  renderLedgerListByUserNo = async (userNo, userID, originalTermDetailName, rowLottType, rowTermDetailID) => {
    if (this.state.ledgerLoading) return;
    const { endpoint, termDetailID, lottType } = await this.getCurrentBreakContext();
    if (!endpoint) {
      Alert.alert('App', 'Endpoint not found');
      return;
    }
    const selectedUserID = userID || '';
    if (!selectedUserID) {
      Alert.alert('App', 'UserID not found');
      return;
    }
    const effectiveTermDetailID = String(rowTermDetailID || termDetailID || 'All');
    const effectiveLottType = String(
      rowLottType ||
      this.inferLottTypeFromText(originalTermDetailName) ||
      lottType ||
      '',
    );
    const routeName = NavService.getCurrentRouteName ? NavService.getCurrentRouteName() : '';
    if (routeName === 'Ledger') {
      DeviceEventEmitter.emit('assistant_break_open_ledger_by_user', {
        userNo: String(userNo || 'All'),
        userID: String(selectedUserID),
        termDetailID: effectiveTermDetailID,
        lottType: effectiveLottType,
        termDetailName: String(originalTermDetailName || ''),
      });
      return;
    }
    this.setState({ ledgerLoading: true });
    dal.getLedgerList(endpoint, effectiveTermDetailID, effectiveLottType, selectedUserID, 'All', (err, resp) => {
      if (err || !resp || !Array.isArray(resp.Data)) {
        this.setState({ ledgerLoading: false });
        Alert.alert('App', 'No Data!');
        return;
      }
      const rows = resp.Data
        .map((x) => ({
          num: x && x.Num != null ? String(x.Num) : '',
          unit: this.toNumber(x && x.Unit != null ? x.Unit : 0),
        }))
        .filter((r) => this.toNumber(r.unit) !== 0);
      if (!rows.length) {
        this.setState({ ledgerLoading: false });
        Alert.alert('App', 'No Data!');
        return;
      }
      const total = rows.reduce((s, r) => s + this.toNumber(r.unit), 0);
      this.setState({
        ledgerLoading: false,
        ledgerRows: rows,
        ledgerTotalUnit: total,
        ledgerUserNo: String(userNo || 'All'),
        ledgerTermDetailID: String(originalTermDetailName || ''),
        ledgerSortKey: 'unit',
        ledgerSortOrder: 'desc',
        showLedgerByUserModal: true,
      });
    });
  };

  toggleLedgerSort = (key) => {
    this.setState((prev) => {
      if (prev.ledgerSortKey === key) {
        return { ledgerSortOrder: prev.ledgerSortOrder === 'asc' ? 'desc' : 'asc' };
      }
      return { ledgerSortKey: key, ledgerSortOrder: 'asc' };
    });
  };

  getSortedLedgerRows = () => {
    const rows = Array.isArray(this.state.ledgerRows) ? this.state.ledgerRows.slice() : [];
    const key = this.state.ledgerSortKey === 'unit' ? 'unit' : 'num';
    const order = this.state.ledgerSortOrder === 'desc' ? -1 : 1;
    rows.sort((a, b) => {
      let av = a && a[key] != null ? a[key] : '';
      let bv = b && b[key] != null ? b[key] : '';
      if (key === 'num') {
        av = this.toNumber(av);
        bv = this.toNumber(bv);
      } else {
        av = this.toNumber(av);
        bv = this.toNumber(bv);
      }
      if (av < bv) return -1 * order;
      if (av > bv) return 1 * order;
      return 0;
    });
    return rows;
  };

  buildLedgerShareText = () => {
    const rows = this.getSortedLedgerRows();
    if (!rows.length) return '';
    const lines = [];
    lines.push(`Ledger=${this.state.ledgerUserNo || 'All'}`);
    if (this.state.ledgerTermDetailID) {
      lines.push(String(this.state.ledgerTermDetailID));
    }
    rows.forEach((r) => {
      lines.push(`${r.num}=${String(this.toNumber(r.unit))}`);
    });
    lines.push(`Total=${String(this.toNumber(this.state.ledgerTotalUnit))}`);
    return lines.join('\n');
  };

  shareLedgerText = async () => {
    const message = this.buildLedgerShareText();
    if (!message) {
      Alert.alert('App', 'No Data!');
      return;
    }
    try {
      await Share.share({ message });
    } catch (e) {}
  };

  toNumber = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseFloat(String(v).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  };

  getWinNum = (str) => {
    if (!str) return null;
    const txt = String(str).replace(/\s+/g, ' ').trim();
    const m = txt.match(/\((\d{1,3})\)\s*$/);
    return m && m[1] ? m[1] : null;
  };

  formatBreakDayLabel = (label) => {
    const txt = String(label || '').replace(/\s+/g, ' ').trim();
    const dm = txt.match(/2D\s*\((\d{1,2})[\/,](\d{1,2})[\/,](\d{4})\)/i);
    const ap = txt.match(/\b(AM|PM)\b/i);
    const win = this.getWinNum(txt);
    if (!dm) return txt;
    const d = parseInt(dm[1], 10);
    const m = parseInt(dm[2], 10) - 1;
    const y = parseInt(dm[3], 10);
    const dt = new Date(y, m, d);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[dt.getDay()];
    const ampm = ap && ap[1] ? ap[1].toUpperCase() : '';
    return `${day}${ampm ? ' ' + ampm : ''}${win ? '(' + win + ')' : ''}`.trim();
  };

  inferLottTypeFromText = (txt) => {
    const s = String(txt || '').toUpperCase();
    if (s.indexOf('3D') !== -1) return '3D';
    if (s.indexOf('2D') !== -1) return '2D';
    return '';
  };

  normalizeBreakPRow = (r) => {
    const rawName = r.TermDetailName || r.Name || '';
    const fromApi = String(r.LottType || '').trim().toUpperCase();
    const infer = this.inferLottTypeFromText(rawName);
    return {
      userID: String(r.UserID || r.UserId || r.UID || '').trim(),
      userNo: String(r.UserNo || r.CustomerName || 'All').trim() || 'All',
      termDetailID: String(r.TermDetailID || '').trim(),
      lottType: fromApi || infer || '',
      originalTermDetailName: String(rawName || '').trim(),
      termDetailName: this.formatBreakDayLabel(rawName),
      totalUnit: this.toNumber(r.TotalUnit || r.Unit || r.SaleAmt),
      percentage: this.toNumber(r.Percentage || r.P),
      break: this.toNumber(r.Break || r.UnitBreak),
      totalWinUnit: this.toNumber(r.TotalWinUnit || r.WinUnit || r.Prize || r.Win),
    };
  };

  getBreakPGroups = () => {
    const map = {};
    (this.state.breakPData || []).forEach((r) => {
      const key = String(r.userNo || 'All').trim() || 'All';
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    const groups = Object.keys(map).map((k) => ({ userNo: k, rows: map[k] }));
    const key = String(this.state.breakPUserSearch || '').trim().toLowerCase();
    if (!key) return groups;
    return groups.filter((g) => String(g.userNo || '').toLowerCase().indexOf(key) !== -1);
  };

  getBreakDayColor = (termDetailName) => {
    const txt = String(termDetailName || '');
    const day = txt.split(' ')[0];
    const dayColors = {
      Mon: '#FFF3E0',
      Tue: '#E3F2FD',
      Wed: '#FFF8E1',
      Thu: '#FCE4EC',
      Fri: '#E0F7FA',
      Sat: '#F3E5F5',
      Sun: '#FFF3E0',
    };
    return dayColors[day] || '#FFFFFF';
  };

  render() {
    return (
      <View pointerEvents="box-none" style={styles.root}>
        {this.state.breakLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={Color.PRIMARYCOLOR} />
              <Text style={styles.loadingText}>Loading Break...</Text>
            </View>
          </View>
        )}
        {this.state.showBreakPModal && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={this.state.showBreakPModal}
            onRequestClose={() => this.setState({ showBreakPModal: false })}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Break</Text>
                <Text style={styles.modalSubTitle}>{this.state.breakPTitle || ''}</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="အမည်ရှာရန်။"
                  placeholderTextColor="#777"
                  value={this.state.breakPUserSearch}
                  onChangeText={(text) => this.setState({ breakPUserSearch: text })}
                  underlineColorAndroid="transparent"
                />
                {this.state.ledgerLoading && (
                  <View style={styles.inlineLoadingWrap}>
                    <ActivityIndicator size="small" color={Color.PRIMARYCOLOR} />
                    <Text style={styles.inlineLoadingText}>Loading Ledger...</Text>
                  </View>
                )}
                <View style={styles.modalHeaderRow}>
                  <Text style={[styles.hCell, { width: width * 0.18 }]}>နေ့</Text>
                  <Text style={[styles.hCell, { width: width * 0.25, textAlign: 'right' }]}>ရောင်းကြေး(%)</Text>
                  <Text style={[styles.hCell, { width: width * 0.18, textAlign: 'right' }]}>ဘရိတ်</Text>
                  <Text style={[styles.hCell, { width: width * 0.18, textAlign: 'right' }]}>ပေါက်သီး</Text>
                </View>
                <ScrollView style={{ maxHeight: height * 0.5 }}>
                  {this.getBreakPGroups().map((g, gIdx) => (
                    <View key={`abpg_${gIdx}`}>
                      <Text style={styles.groupTitle}>{`အမည်= ${g.userNo}`}</Text>
                      {g.rows.map((item, idx) => (
                        <TouchableOpacity
                          key={`abp_${gIdx}_${idx}`}
                          disabled={this.state.ledgerLoading}
                          onPress={() =>
                            this.renderLedgerListByUserNo(
                              g.userNo,
                              g.rows && g.rows[0] ? g.rows[0].userID : '',
                              item ? item.originalTermDetailName : '',
                              item ? item.lottType : '',
                              item ? item.termDetailID : '',
                            )
                          }
                          style={[
                            styles.dataRow,
                            { backgroundColor: this.getBreakDayColor(item.termDetailName) },
                            this.state.ledgerLoading ? { opacity: 0.6 } : null,
                          ]}
                        >
                          <Text style={{ width: width * 0.18, fontSize: 12 }}>{item.termDetailName}</Text>
                          <Text style={{ width: width * 0.25, fontSize: 12, textAlign: 'right' }}>
                            {`${numeral(item.totalUnit).format('0,0')}(${numeral(item.percentage).format('0,0')}%)`}
                          </Text>
                          <Text style={{ width: width * 0.18, fontSize: 12, textAlign: 'right' }}>{numeral(item.break).format('0,0')}</Text>
                          <Text style={{ width: width * 0.18, fontSize: 12, textAlign: 'right' }}>{numeral(item.totalWinUnit).format('0,0')}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.totalRow}>
                  <Text style={{ width: width * 0.18, fontSize: 13, fontWeight: 'bold' }}>Total</Text>
                  <Text style={{ width: width * 0.25, fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>
                    {numeral(this.state.breakPTotalUnit).format('0,0')}
                  </Text>
                  <Text style={{ width: width * 0.18 }} />
                  <Text style={{ width: width * 0.18, fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>
                    {numeral(this.state.breakPTotalWinUnit).format('0,0')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => this.setState({ showBreakPModal: false })}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        {this.state.showLedgerByUserModal && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={this.state.showLedgerByUserModal}
            onRequestClose={() => this.setState({ showLedgerByUserModal: false })}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{`Ledger - ${this.state.ledgerUserNo || 'All'}`}</Text>
                <Text style={styles.modalSubTitle}>{this.state.ledgerTermDetailID || ''}</Text>
                <View style={styles.modalHeaderRow}>
                  <TouchableOpacity
                    style={{ width: width * 0.35 }}
                    onPress={() => this.toggleLedgerSort('num')}
                  >
                    <Text style={[styles.hCell, { width: width * 0.35, fontSize: 14 }]}>
                      {`Num ${this.state.ledgerSortKey === 'num' ? (this.state.ledgerSortOrder === 'asc' ? '↑' : '↓') : ''}`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ width: width * 0.35, alignItems: 'flex-end' }}
                    onPress={() => this.toggleLedgerSort('unit')}
                  >
                    <Text style={[styles.hCell, { width: width * 0.35, textAlign: 'right', fontSize: 14 }]}>
                      {`Unit ${this.state.ledgerSortKey === 'unit' ? (this.state.ledgerSortOrder === 'asc' ? '↑' : '↓') : ''}`}
                    </Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: height * 0.5 }}>
                  {this.getSortedLedgerRows().map((r, i) => (
                    <View key={`lr_${i}`} style={styles.dataRow}>
                      <Text style={{ width: width * 0.35, fontSize: 14 }}>{r.num}</Text>
                      <Text style={{ width: width * 0.35, fontSize: 14, textAlign: 'right' }}>
                        {numeral(r.unit).format('0,0')}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.totalRow}>
                  <Text style={{ width: width * 0.35, fontSize: 15, fontWeight: 'bold' }}>Total Unit</Text>
                  <Text style={{ width: width * 0.35, fontSize: 15, fontWeight: 'bold', textAlign: 'right' }}>
                    {numeral(this.state.ledgerTotalUnit).format('0,0')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <TouchableOpacity
                    style={[styles.closeBtn, { flex: 1, marginTop: 0 }]}
                    onPress={() => this.setState({ showLedgerByUserModal: false })}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>CLOSE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.closeBtn, { flex: 1, marginTop: 0, marginLeft: 8, backgroundColor: Color.PRIMARYCOLOR }]}
                    onPress={this.shareLedgerText}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SHARE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
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
              {this.shouldShowBreakAll() &&
                this.renderAction(
                  this.state.breakLoading ? 'BREAK...' : 'BREAK ALL',
                  () => this.callBreakAll(),
                )}
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
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#00000033',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  loadingCard: {
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 6,
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  inlineLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inlineLoadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.92,
    maxHeight: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubTitle: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
  },
  searchInput: {
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#262626',
    marginBottom: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  hCell: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Color.PRIMARYCOLOR,
    marginTop: 8,
    marginBottom: 4,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 6,
  },
  closeBtn: {
    height: 40,
    backgroundColor: '#999',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
