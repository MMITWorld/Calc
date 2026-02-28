/**
 * Sample React Native App
 * https:   //github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Easing,
  FlatList,
  Animated,
  TextInput,
  AppState,
  NativeModules,
  BackHandler,
  ListView,
  Modal,
  Button,
  Picker,
  ActivityIndicator,
  AsyncStorage,
  DeviceEventEmitter,
  Clipboard,
  Share,
  Keyboard,
} from 'react-native';
import moment from 'moment';
var numeral = require("numeral");
import TextMarquee from '../components/textmarquee.js'
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import Toast, {DURATION} from 'react-native-easy-toast'
import UUIDGenerator from 'react-native-uuid-generator';
import Switch from 'react-native-switch-pro'
import dal from '../dal.js';
import Color from '../utils/Color.js'
const{width,height}=Dimensions.get('window')
import plusIcon from '../assets/images/plus.png';
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import back from "../assets/images/backward.png";
import close from "../assets/images/error.png";
import config from '../config/config.js'
import delete_icon from "../assets/images/delete.png";
import tickIcon from '../assets/images/tick.png';
import untickIcon from '../assets/images/untick.png';
import word from './data.json'
import refreshIcon from '../assets/images/refresh.png'
var Open=false,var_num="",var_unit="",var_chosen='',var_selected='num',var_total_unit=0,click_back=0,clearUnit=false
import EStyleSheet from 'react-native-extended-stylesheet';
import Loading from '../components/loading.js'
EStyleSheet.build({$rem: width / 380});
let dataProvider = new DataProvider((r1, r2) => {
  return r1===r2;
});
class sale extends Component {
    combineAmountTypeStorageKey = 'sale3d_combine_amount_type';
    getCombineAmountTypeFromUnitPrice(v){
      const n = Number(String(v == null ? '' : v).replace(/,/g,'').trim());
      if(n === 25) return '25';
      if(n === 100) return '100';
      return 'money';
    }
    normalizeCombineAmountType(v){
      return v === '25' || v === '100' || v === 'money' ? v : 'money';
    }
    setCombineAmountTypeLocal(v){
      const next = this.normalizeCombineAmountType(v);
      this.setState({ combineAmountType: next });
      AsyncStorage.setItem(this.combineAmountTypeStorageKey, next).catch(() => {});
    }
  constructor(props) {
        super(props);
        this.searchTimer = null;
        this._width = new Animated.Value(0);
        this._layoutProvider = new LayoutProvider(
          index => {
            return 0;
          },
          (type, dim) => {
            dim.width = width;
            dim.height = height*0.08;
          }
        );
        this._rowRenderer = this._rowRenderer.bind(this);
    this.state = {
          data:[],
          discount:this.props.navigation.state.params.user[0].Discount3D,
          refresh:false,
          value:true,
          hot_modal_show:false,
          hotnum:[],
          extras:[],
          bet_modal_show:false,
          send_modal_show:false,
          user:[],
          userid:this.props.navigation.state.params.user[0].UserID,
          loading:false,
          name:'',
          dataProvider:dataProvider.cloneWithRows([]),
          unitPrice:this.props.navigation.state.params.unitPrice,
          print: false,
          printData: [],
          slipNo: "",
          viewData:[],
          showViewModal:false,
          showDirectBuyModal:false,
          supplierInfo:null,
          otherInfo:null,
          showDownload:false,
          termsFromOther:[],
          termIdForOther:null,
          otherHots: [],
          otherLottType:'2D',
          showCombineModal: false,
      combineErrorMsg: '',
      combinePasteScrollY: 0,
      isEditingCombinePaste: false,
      combineErrorLineIdx: [],
      combineErrorMap: [],
          pasteTxt: '',
          findStr: '',
          replaceStr: '',
          disableOK: true,
          combineAmountType: this.getCombineAmountTypeFromUnitPrice(this.props.navigation.state.params.unitPrice),
          sameUnit:false,
          sameUnitR:false,
          showByNumModal: false,
          buyNums: [],
          allowExtra:false,
          UseMoneyInOut:this.props.navigation.state.params.user[0].UseMoneyInOut,
          dataforSwap:[],
          alertInfo: {
          showModal: false,
          alertMsg: "",
          showPrint: false,
          shareData: [],
          showOver: false,
          overSale: null,
        },
        
          userQuery:'',
          filteredUsers:[],
          showUserSuggest:false,
          selectedUser:null,
          
          userSearchText: '',
          filteredUsers: [],
          selectedUser: null,
          canSubmit: false,
          showUserSuggest: false,
          userSearchTimer: null,
          showUserSuggest: false,
          dropdownOpen: true,
           // ✅ FINAL selected user id (this is what you will save & pass to slip)
          selectedUserId: this.props.navigation.state.params.user[0].UserID,
        };
        this._lastClipboard = '';
    }
    getTotalUnit() {
      return (this.state.data || []).reduce((sum, value) => {
        return sum + (parseInt(value.unit, 10) || 0);
      }, 0);
    }
    async componentDidMount(){
      const allowExtra=await AsyncStorage.getItem('allowExtra')||"false"
      const savedCombineAmountType = await AsyncStorage.getItem(this.combineAmountTypeStorageKey);
      this.setState({
        allowExtra:allowExtra=='true'?true:false,
        combineAmountType: this.normalizeCombineAmountType(
          savedCombineAmountType || this.getCombineAmountTypeFromUnitPrice(this.props.navigation.state.params.unitPrice)
        )


      })
      this._appStateSub = AppState.addEventListener('change', this._handleAppStateChange);
      try {
        const initClip = await Clipboard.getString();
        this._lastClipboard = (initClip || '').trim();
      } catch (e) {}
      this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
      this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      //dal.getusers(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.user[0].UserID,(err,result)=>{
        dal.getUsers(this.props.navigation.state.params.endpoint,(err,result)=>{
        console.warn('usr===>> ',JSON.stringify(result))
        if(!err){
          {
          const users = (result.Data || []).map(u => ({
            ...u,
            __labelLower: ((u.UserNo || u.UserName || u.Name || '') + '').toLowerCase(),
          }));
          this.setState({user:users, filteredUsers: users});
        }
        }
      })
      this.getHotNum(true)

     console.log("SALE_3D params =", this.props.navigation.state.params);
    }

    _handleAppStateChange = async (nextState) => {
      if (nextState !== 'active') return;
      try {
        const clip = await Clipboard.getString();
        const text = (clip || '').trim();
        if (!text) return;
        if (text === this._lastClipboard) return;
        this._lastClipboard = text;
        this.setState(prev => ({
          pasteTxt: prev.pasteTxt ? `${prev.pasteTxt}\n\n\n${text}` : text
        }))
      } catch (e) {}
    }

    getHotListForOther(termId) {
      if (!termId) {
        this.setState({ otherHots: [] })
        return;
      }
      dal.getHotList(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), termId, (err, resp) => {
        if (err) {
          this.setState({ otherHots: [] })
        } else {
          this.setState({
            otherHots: resp.Data || []
          })
        }
      })
    }

    // ===========================
  // User Search (Search box + Dropdown)
  // - Exact match (by label) is required to enable OK / BUY / Direct Buy
  // - Debounced filtering for performance (1000+ users)
  // ===========================
  _normText(str) {
    return (str || '').toString().trim().toLowerCase();
  }

  getUserLabel(u) {
    if (!u) return '';
    const no = (u.UserNo ?? u.UserID ?? u.UserId ?? u.userno ?? '').toString();
    const name = (u.UserName ?? u.Name ?? '').toString();
    if (no && name) return `${no} - ${name}`;
    return (no || name || String(u.UserID || '')) + '';
  }

  _applyUser(u) {
    if (!u) {
      this.setState({
        selectedUserId: null,
        userid: null,
        canSubmit: false,
      });
      return;
    }
    this.setState({
      selectedUserId: u.UserID,
      userid: u.UserID,
      termDetails: [],
      discount: u.Discount2D,
      UseMoneyInOut: u.UseMoneyInOut,
      canSubmit: true,
      userSearchText: this.getUserLabel(u),
      showUserSuggest: false,
      dropdownOpen: true,
    });
  }

  _onPickUser(userId) {
    const u = (this.state.user || []).find(x => x.UserID == userId);
    if (u) this._applyUser(u);
    else this._applyUser(null);
  }

  _onSelectSuggestUser(u) {
    this._applyUser(u);
    this.setState({
      filteredUsers: [],
      showUserSuggest: false,
      dropdownOpen: true,
    });
  }

  _onSearchUser(text) {
    const q = this._normText(text);

    // typing => hide dropdown, show suggestions
    const typing = q.length > 0;

    // clear current selection until exact match happens
    this.setState({
      userSearchText: text,
      dropdownOpen: !typing,
      showUserSuggest: typing,
      canSubmit: !typing ? (this.state.userid != null) : false,
      filteredUsers: typing ? this.state.filteredUsers : [],
      userid: typing ? null : this.state.userid,
    });

    // debounce for performance
    if (this._userSearchDebounce) clearTimeout(this._userSearchDebounce);

    this._userSearchDebounce = setTimeout(() => {
      const users = this.state.user || [];
      if (!q || !users.length) {
        this.setState({ filteredUsers: [], showUserSuggest: false });
        return;
      }

      // use cache if available
      const cache = this._userSearchCache;
      const list = cache && cache.length
        ? cache
        : users.map(u => ({
            u,
            key: this._normText([
              u.UserNo,
              u.UserName,
              u.Name,
              u.UserID,
              u.UserId,
              u.userno,
              u.username
            ].filter(v => v !== null && v !== undefined && String(v).trim() !== '').join(' '))
          }));
// suggest: contains match (limit 30)
      const suggested = [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].key.includes(q)) {
          suggested.push(list[i].u);
          if (suggested.length >= 30) break;
        }
      }

      // exact match => auto-select + enable
      const exact = list.find(x => {
        const u = x.u || {};
        const candidates = [
          u.UserNo,
          u.UserName,
          u.Name,
          u.UserID,
          u.UserId,
          u.userno,
          u.username
        ].filter(v => v !== null && v !== undefined);
        return candidates.some(v => this._normText(String(v)) === q);
      });
      if (exact && exact.u) {
        this._applyUser(exact.u);
        this.setState({
          filteredUsers: suggested,
          showUserSuggest: false,
          dropdownOpen: true,
        });
      } else {
        this.setState({
          filteredUsers: suggested,
          showUserSuggest: true,
          dropdownOpen: false,
          canSubmit: false,
        });
      }
    }, 200);
  }

    renderBuyNumModal() {
      return (
          <Modal
              transparent={true}
              visible={this.state.showByNumModal}
              onRequestClose={() => {
                  this.setState({
                      showByNumModal: false
                  })
              }}
          >
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                  <View style={{ backgroundColor: Color.PRIMARYTEXTCOLOR, width: (width) - 10, borderRadius: 10, height: height }}>
                      <View style={{
                          width: width - 10,
                          height: 50,
                          borderBottomWidth: 1,
                          borderColor: Color.DIVIDERCOLOR,
                          flexDirection: 'row',
                          alignItems: 'center'
                      }}>
                          <View style={{
                              flex: 1
                          }}>
                              <Text style={{
                                  color: Color.YELLOWCOLOR,
                                  fontSize: 12,
                                  textAlign: 'center'
                              }}>
                                  {word[this.props.navigation.state.params.lg].user}
                              </Text>
                          </View>
                          <View style={{
                              flex: 1
                          }}>
                              <Text style={{
                                  color: Color.YELLOWCOLOR,
                                  fontSize: 12,

                                  textAlign: 'center'
                              }}>
                                  {word[this.props.navigation.state.params.lg].num}
                              </Text>
                          </View>
                          <View style={{
                              flex: 1,
                              marginRight: 10
                          }}>
                              <Text style={{
                                  color: Color.YELLOWCOLOR,
                                  fontSize: 12,
                                  textAlign: 'right'
                              }}>
                                  {word[this.props.navigation.state.params.lg].unit}
                              </Text>
                          </View>
                      </View>
                      <ScrollView>
                          <View>
                              {this.renderBuyNums()}
                          </View>
                      </ScrollView>

                      <View style={{ flexDirection: 'row', marginVertical: 5, marginHorizontal: 20 }}>
                          <TouchableOpacity style={{
                              flex: 1, alignItems: "center", justifyContent: 'center', backgroundColor: Color.DIVIDERCOLOR, paddingVertical: 10
                              , borderRadius: 7
                          }} onPress={() => {
                              this.setState({
                                  showByNumModal: false
                              })
                          }}>
                              <Text style={{ fontSize: 15, fontFamily: 'Roboto', color: Color.PRIMARYCOLOR }}>
                                  CANCEL
                              </Text>
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>
          </Modal>
      )
  }
  renderBuyNums() {
    return this.state.buyNums.map((value, index) => {
        return (
            <View style={{
                width: width - 10,
                height: 50,
                borderBottomWidth: 1,
                borderColor: Color.DIVIDERCOLOR,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <View style={{
                    flex: 1
                }}>
                    <Text style={{
                        color: '#262626',
                        fontSize: 12,
                        textAlign: 'center'
                    }}>
                        {value.CustomerName}
                    </Text>
                </View>
                <View style={{
                    flex: 1
                }}>
                    <Text style={{
                        color: '#262626',
                        fontSize: 12,

                        textAlign: 'center'
                    }}>
                        {value.Num}
                    </Text>
                </View>
                <View style={{
                    flex: 1,
                    marginRight: 10
                }}>
                    <Text style={{
                        color: '#262626',
                        fontSize: 12,
                        textAlign: 'right'
                    }}>
                        {value.Unit}
                    </Text>
                </View>
            </View>
        )
    })
}
APISlipDetail(TermDetailID, Num) {
  dal.APISlipDetail(this.props.navigation.state.params.endpoint, TermDetailID, Num, (err, resp) => {
      if (err) {
          Alert.alert(config.AppName, 'Can\'t retrieve slip data!')
          this.setState({
              loading: false
          })
      } else {
          console.log(resp)
          if (resp && resp.Status == 'OK' && resp.Data.length) {
              this.setState({
                  buyNums: resp.Data,
                  loading: false,
                  showByNumModal: true
              })
          } else {
              Alert.alert(config.AppName, resp.Status)
              this.setState({
                  buyNums: [],
                  loading: false
              })
          }
      }
  })
}
    componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
      AsyncStorage.removeItem(this.combineAmountTypeStorageKey).catch(() => {});
      this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
      this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
      var_num="",var_unit="",Open=false,var_selected='num',var_chosen='',var_total_unit=0,click_back=0
    }
    handleBackButton = () => {
      click_back+=1
      this.refs.err_toast.show('ထွက်ရန်တစ်ချက်ထပ်နှိပ်ပါ။',1000);
      setTimeout(() => {
        click_back=0
      }, 1000);
      if(click_back>=2){
        this.props.navigation.goBack(null)
      }
      return true;
    };
    _animateTo = (to) => {
      if (to == 0) {
        Open = false
        this.setState({
          dataProvider: dataProvider.cloneWithRows(this.state.data),
        })
      } else {
        Open = true
        this.setState({
          dataProvider: dataProvider.cloneWithRows(this.state.dataforSwap)
        })
      }
  
      Animated.timing(this._width, {
        toValue: to,
        duration: 400,
        easing: Easing.linear,
      }).start();
    };
    renderTitle(){
      return(
        <View style={{flexDirection:'row',backgroundColor:Color.PRIMARYCOLOR,height:height*0.08}}>
          <View style={{flex:1.5,justifyContent:'center',alignItems:'center'}}>
            <Text style={[estyles.mmTitleText]}>စဥ်</Text>
          </View>

          <View style={{flex:2,justifyContent:'center',alignItems:'center'}}>
            <Text style={estyles.mmTitleText}>ဂဏန်း</Text>
          </View >

          <View style={{flex:3,justifyContent:'center',alignItems:'center'}}>
            <Text style={estyles.mmTitleText}>ယူနစ်</Text>
          </View>

          <View style={{flex:2.2,justifyContent:'center',alignItems:'center'}}>
            <Text style={estyles.mmTitleText}>မှတ်ချက်</Text>
          </View>

          <View style={{flex:1.3}}>

          </View>
        </View>
      )
    }
    getDeletebyInvidual(uuid, index, num) {

      let temp = this.state.dataforSwap;
      let temp1 = this.state.data
      let j = this.state.data.findIndex(x => x.GroupID2 == uuid && x.num == num)
      let k = this.state.dataforSwap.findIndex(x => x.GroupID2 == uuid && x.num == num)
      temp.splice(k, 1);
      temp1.splice(j, 1)
      if (temp1.length > 0) {
        for (let i = 0; i < temp1.length; i++) {
          if (temp1[i].GroupID2 == uuid) {
            temp1[i].delete = false;
            temp1[i].GroupID = '';
            temp1[i].showsummary = true;
            temp1[i].summary = temp1[i].num;
          }
        }
      }
      if (temp.length > 0) {
        for (let i = 0; i < temp.length; i++) {
          if (temp[i].GroupID2 == uuid) {
            temp[i].delete = false;
            temp[i].GroupID = '';
            temp[i].showsummary = true;
            temp[i].summary = temp[i].num;
          }
        }
      }
      this.setState({ dataProvider: dataProvider.cloneWithRows(Open ? temp : temp1), data: temp1, dataforSwap: temp });
  
    }
    getDeletebyGroup(uuid, index) {
      let temp1 = this.state.data.filter(function (el) {
        return el.GroupID2 != uuid;
      });
      let temp = this.state.dataforSwap.filter(function (el) {
        return el.GroupID2 != uuid;
      });
      this.setState({ dataProvider: dataProvider.cloneWithRows(Open ? temp : temp1), data: temp1, dataforSwap: temp });
    }
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    
    ReplaceAll(str, find, replace) {
      return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }
    // ReplaceAll(Source, stringToFind, stringToReplace) {
    //   var temp = Source;
    //   var index = temp.indexOf(stringToFind);
  
    //   while (index != -1) {
    //     temp = temp.replace(stringToFind, stringToReplace);
    //     index = temp.indexOf(stringToFind);
    //   }
  
    //   return temp;
    // }
    getCombineErrorLineIndexes(pasteTxt, errorMsg) {
      const normalizeLine = (s) =>
        String(s || '')
          .replace(/[^0-9a-zA-Z\u1000-\u109F]/g, '')
          .toLowerCase();
      const errNorm = normalizeLine(errorMsg || '');
      if (!errNorm) return [];
      const lines = String(pasteTxt || '').split('\n');
      const idx = [];
      // Keep top-to-bottom order from paste text.
      lines.forEach((line, i) => {
        const n = normalizeLine(line);
        if (!n) return;
        if (errNorm.includes(n)) idx.push(i);
      });
      return idx;
    }
    buildCombineErrorMap(pasteTxt, errorMsg) {
      const normalizeLine = (s) =>
        String(s || '')
          .replace(/[^0-9a-zA-Z\u1000-\u109F]/g, '')
          .toLowerCase();
      const pasteLines = String(pasteTxt || '').split('\n');
      const errLines = String(errorMsg || '').split('\n');
      const used = new Set();
      const map = [];

      for (let i = 0; i < errLines.length; i++) {
        const e = normalizeLine(errLines[i]);
        if (!e) {
          map.push(-1);
          continue;
        }
        let found = -1;
        // exact match first
        for (let j = 0; j < pasteLines.length; j++) {
          if (used.has(j)) continue;
          const p = normalizeLine(pasteLines[j]);
          if (p && p === e) {
            found = j;
            break;
          }
        }
        // contains fallback
        if (found === -1) {
          for (let j = 0; j < pasteLines.length; j++) {
            if (used.has(j)) continue;
            const p = normalizeLine(pasteLines[j]);
            if (p && (p.includes(e) || e.includes(p))) {
              found = j;
              break;
            }
          }
        }
        map.push(found);
        if (found !== -1) used.add(found);
      }
      return map;
    }
    applyCombineErrorToPaste() {
      this.setState((prev) => {
        const pasteLines = String(prev.pasteTxt || '').split('\n');
        const map =
          (prev.combineErrorMap && prev.combineErrorMap.length)
            ? prev.combineErrorMap
            : this.buildCombineErrorMap(prev.pasteTxt, prev.combineErrorMsg);
        if (!map.length) return null;

        const incoming = String(prev.combineErrorMsg || '').split('\n');
        const nextPaste = [...pasteLines];

        // Stable mapping: right line i updates mapped left row map[i].
        for (let i = 0; i < map.length; i++) {
          const idx = map[i];
          if (idx < 0 || idx >= nextPaste.length) continue;
          if (incoming[i] !== undefined) {
            nextPaste[idx] = incoming[i];
          }
        }

        return {
          pasteTxt: nextPaste.join('\n'),
          combineErrorMap: map,
        };
      });
    }
    renderCombineModal() {
      const normalizeLine = (s) =>
        String(s || '')
          .replace(/[^0-9a-zA-Z\u1000-\u109F]/g, '')
          .toLowerCase();
      const errNorm = normalizeLine(this.state.combineErrorMsg || '');
      const pasteLines = String(this.state.pasteTxt || '').split('\n');
      const useLineHighlight = !!errNorm && !this.state.isEditingCombinePaste;
      const redIndexes = (this.state.combineErrorLineIdx && this.state.combineErrorLineIdx.length)
        ? this.state.combineErrorLineIdx
        : pasteLines
            .map((line, idx) => ({ line, idx }))
            .filter((x) => {
              const n = normalizeLine(x.line);
              return n !== '' && errNorm.includes(n);
            })
            .map((x) => x.idx);
      return (
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.showCombineModal}
          onRequestClose={() => {}}>
          <View
            style={{
              flex: 1,
              alignItems: 'stretch',
              justifyContent: 'flex-start',
              backgroundColor: '#fff',
            }}>
            <View
	              style={{
	                flex: 1,
	                width: width,
	                height: height,
	                backgroundColor: '#fff',
	                borderRadius: 0,
	              }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: Color.DarkBlack,
                  textAlign: 'center',
                  marginTop: 10,
                }}>
                {this.props.navigation.state.params.lg == 'uni' ? 'မက်ဆေ့ပေါင်းရန်' : 'မက္ေဆ့ေပါင္းရန္'}
              </Text>
              <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop:8 }}>
              <TouchableOpacity
                style={{ flexDirection:'row', alignItems:'center', marginHorizontal:10 }}
                onPress={() => this.setCombineAmountTypeLocal('money')}
              >
                  <Image source={this.state.combineAmountType=='money' ? radio_btn_selected : radio_btn_unselected} style={{width:22,height:22}} />
                  <Text style={{ marginLeft:6, color:'#262626', fontSize:15 }}>{'\u1004\u103d\u1031'}</Text>
                </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection:'row', alignItems:'center', marginHorizontal:10 }}
                onPress={() => this.setCombineAmountTypeLocal('25')}
              >
                  <Image source={this.state.combineAmountType=='25' ? radio_btn_selected : radio_btn_unselected} style={{width:22,height:22}} />
                  <Text style={{ marginLeft:6, color:'#262626', fontSize:15 }}>25</Text>
                </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection:'row', alignItems:'center', marginHorizontal:10 }}
                onPress={() => this.setCombineAmountTypeLocal('100')}
              >
                  <Image source={this.state.combineAmountType=='100' ? radio_btn_selected : radio_btn_unselected} style={{width:22,height:22}} />
                  <Text style={{ marginLeft:6, color:'#262626', fontSize:15 }}>100</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  paddingHorizontal: 5,
                  height: 70,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: Color.defaultGray,
                    marginRight: 5,
                    borderRadius: 5,
                  }}>
                  <TextInput
                    placeholder={this.props.navigation.state.params.lg == 'uni' ? 'Find' : 'Find'}
                    style={{height: 60,textAlignVertical: 'top',}}
                    contextMenuHidden={true}
                    placeholderTextColor={Color.defaultGray}
                    underlineColorAndroid="transparent"
                    tintColor="#262626"
                    value={this.state.findStr}
                    onChangeText={(text) => this.setState({findStr: text})}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: Color.defaultGray,
                    marginRight: 5,
                    borderRadius: 5,
                  }}>
                  <TextInput
                    placeholder={this.props.navigation.state.params.lg == 'uni' ? 'Replace' : 'Replace'}
                    style={{height: 60,textAlignVertical: 'top',}}
                    contextMenuHidden={true}
                    placeholderTextColor={Color.defaultGray}
                    underlineColorAndroid="transparent"
                    tintColor="#262626"
                    multiline
                    value={this.state.replaceStr}
                    onChangeText={(text) => this.setState({replaceStr: text})}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (
                      this.state.pasteTxt != '' &&
                      this.state.findStr != '' &&
                      this.state.replaceStr != ''
                    ) {
                      let pTxt = this.ReplaceAll(
                        this.state.pasteTxt,
                        this.state.findStr,
                        this.state.replaceStr,
                      );
                      console.log(pTxt);
                      this.setState({
                        pasteTxt: pTxt,
                      });
                    }
                    if (
                      this.state.pasteTxt != '' &&
                      this.state.findStr == '' &&
                      this.state.replaceStr != ''
                    ) {
                      let arr=this.state.pasteTxt.split('\n')
                      console.log(arr)
                      let str=''
                      arr.map((value,index)=>{
                        str+=value?`${value}=${this.state.replaceStr}\n`:``
                      })
                      // let pTxt = this.ReplaceAll(
                      //   this.state.pasteTxt,
                      //   '\n',
                      //   `=${this.state.replaceStr}\n`,
                      // );
                      // console.log(pTxt);
                      this.setState({
                        pasteTxt:str,
                      });
                    }
                  }}
                  style={{
                    paddingHorizontal: 15,
                    backgroundColor: Color.PRIMARYCOLOR,
                    borderRadius: 5,
                    height: 40,
                    justifyContent: 'center',
                  }}>
                  <Text style={{fontSize: 15, color: 'white'}}>REPLACE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const clip = await Clipboard.getString();
                      const text = (clip || '').trim();
                      if (!text) return;
                      this._lastClipboard = '';
                      this.setState(prev => ({
                        pasteTxt: prev.pasteTxt ? `${prev.pasteTxt}\n\n\n${text}` : text
                      }));
                      Clipboard.setString('');
                    } catch (e) {}
                  }}
                  style={{
                    paddingHorizontal: 15,
                    backgroundColor: Color.Green,
                    borderRadius: 5,
                    height: 40,
                    justifyContent: 'center',
                    marginLeft: 6,
                  }}>
                  <Text style={{ fontSize: 15, color: 'white' }}>PASTE+</Text>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 5,
                  alignItems: 'stretch',
                  justifyContent: 'center',
                  flex: 1,
                  marginTop: 6,
                  marginBottom: 8,
                }}>
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: Color.defaultGray,
                    marginRight: 5,
                    borderRadius: 5,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                  {useLineHighlight ? (
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        paddingHorizontal: 2,
                        transform: [{translateY: -(this.state.combinePasteScrollY || 0)}],
                      }}>
                      {pasteLines.map((line, idx) => {
                        const isErrLine = redIndexes.includes(idx);
                        return (
                          <Text
                            key={`hl-${idx}`}
                            style={{
                              fontSize: 14,
                              lineHeight: 20,
                              color: isErrLine ? 'red' : '#262626',
                            }}>
                            {line || ' '}
                          </Text>
                        );
                      })}
                    </View>
                  ) : null}
                  <TextInput
                    placeholder={
                      this.props.navigation.state.params.lg == 'uni' ? 'Paste Msg' : 'Paste Msg'
                    }
                    style={{
                      width: width * 0.4,
                      height: '100%',
                      textAlignVertical: 'top',
                      color: useLineHighlight ? 'transparent' : '#262626',
                      lineHeight: 20,
                      fontSize: 14,
                    }}
                    multiline
                    scrollEnabled={true}
                    scrollEventThrottle={16}
                    onScroll={(e) =>
                      this.setState({
                        combinePasteScrollY:
                          e?.nativeEvent?.contentOffset?.y || 0,
                      })
                    }
                    selectionColor={'#262626'}
                    onFocus={() => this.setState({isEditingCombinePaste: true})}
                    onBlur={() => this.setState({isEditingCombinePaste: false})}
                    placeholderTextColor={Color.defaultGray}
                    underlineColorAndroid="transparent"
                    tintColor="#262626"
                    value={this.state.pasteTxt}
                    onChangeText={(text) => this.setState({pasteTxt: text})}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: Color.defaultGray,
                    borderRadius: 5,
                    paddingTop: 4,
                  }}>
                  <TouchableOpacity
                    style={{
                      alignSelf: 'flex-end',
                      marginRight: 6,
                      marginBottom: 4,
                      paddingHorizontal: 10,
                      height: 28,
                      borderRadius: 5,
                      backgroundColor: Color.PRIMARYCOLOR,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => this.applyCombineErrorToPaste()}>
                    <Text style={{color: '#fff', fontSize: 13, fontWeight: '500'}}>Change</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={{
                      color: 'red',
                      width: width * 0.4,
                      flex: 1,
                      textAlignVertical: 'top',
                    }}
                    multiline
                    editable={true}
                    scrollEnabled={true}
                    underlineColorAndroid="transparent"
                    tintColor="#262626"
                    value={this.state.combineErrorMsg}
                    onChangeText={(text) => this.setState({combineErrorMsg: text})}
                    onBlur={() => this.applyCombineErrorToPaste()}
                  />
                </View>
              </View>
              <View
                style={{
                  height: 64,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: 5,
                  flexDirection: 'row',
                  marginBottom: 6,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      showCombineModal: false,
                      findStr: '',
                      replaceStr: '',
                      pasteTxt: '',
                      combineErrorMsg: '',
                      combineErrorLineIdx: [],
                      combineErrorMap: [],
                      disableOK: true,
                    });
                  }}
                  style={{
                    backgroundColor: 'red',
                    borderRadius: 5,
                    flex: 1,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 5,
                  }}>
                  <Text style={{fontSize: 16, fontWeight: '500', color: 'white'}}>
                    CANCEL
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={this.state.loading}
                  onPress={() => {
                    Keyboard.dismiss();
                    this.setState({isEditingCombinePaste: false});
                    if (this.state.loading) {
                      return;
                    }
                    if (this.state.pasteTxt == '') {
                      return;
                    }
                    console.warn("Call checkSMS=======>")
                    const uid = this.state.userid ?? this.state.selectedUserId ?? (this.props.navigation.state.params.user && this.props.navigation.state.params.user[0]?.UserID);
                    console.warn("UserID"+uid)
                    console.warn("TermDetailID"+this.props.navigation.state.params.termdetailsid)
                    console.warn("PasteText"+this.state.pasteTxt)
                    this.setState({ loading: true }, () => {
                      const selectedUnitPrice =
                                this.state.combineAmountType == '25'
                                  ? 25
                                  : this.state.combineAmountType == '100'
                                    ? 100
                                    : 1;
                      dal.checkSMS(
                        this.props.navigation.state.params.endpoint,
                        uid,
                        this.props.navigation.state.params.termdetailsid,
                        selectedUnitPrice,
                        this.state.pasteTxt,
                        (err, resp) => {
                          console.log('Resp ' + JSON.stringify(resp));
                          console.log('Err ' + err);
                          if (resp.length > 0) {
                            //Alert.alert(config.AppName,'Combine successfully!')
                            this.setState({
                              loading: false,
                              combineErrorMsg: resp[0].ErrorMsg,
                              combineErrorLineIdx: this.getCombineErrorLineIndexes(this.state.pasteTxt, resp[0].ErrorMsg),
                              combineErrorMap: this.buildCombineErrorMap(this.state.pasteTxt, resp[0].ErrorMsg),
                              disableOK: false,
                            });
                          } else {
                            Alert.alert(config.AppName, resp);
                            this.setState({
                              loading: false,
                              errorMsg: 'Something went wrong',
                              disableOK: true,
                            });
                          }
                        },
                      );
                    });
                  }}
                  style={{
                    backgroundColor: this.state.loading ? '#7aa8ff' : Color.PRIMARYCOLOR,
                    borderRadius: 5,
                    flex: 1,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 5,
                  }}>
                  {this.state.loading && (
                    <ActivityIndicator size="small" color="#fff" style={{position:'absolute',left:10}} />
                  )}
                  <Text style={{fontSize: 16, fontWeight: '500', color: 'white'}}>
                    {this.props.navigation.state.params.lg == 'uni' ? 'စစ်ရန် ==>' : 'စစ္ရန္ ==>'}
                  </Text>
                </TouchableOpacity>
                {!this.state.disableOK ? (
                  <TouchableOpacity
                    disabled={this.state.loading}
                    onPress={() => {
                      if (this.state.loading) {
                        return;
                      }
                      if (this.state.pasteTxt == '') {
                        return;
                      }
                      this.setState({ loading: true }, () => {
                        const selectedUnitPrice =
                                this.state.combineAmountType == '25'
                                  ? 25
                                  : this.state.combineAmountType == '100'
                                    ? 100
                                    : 1;
                        dal.checkSMS(
                          this.props.navigation.state.params.endpoint,
                          this.state.userid,
                          this.props.navigation.state.params.termdetailsid,
                          selectedUnitPrice,
                          this.state.pasteTxt,
                          (err, resp) => {
                            console.log('Resp ' + JSON.stringify(resp));
                            console.log('Err ' + err);
                            if (resp.length > 0) {
                              //Alert.alert(config.AppName,'Combine successfully!')
                            this.setState({
                              loading: false,
                              combineErrorMsg: resp[0].ErrorMsg,
                              combineErrorLineIdx: this.getCombineErrorLineIndexes(this.state.pasteTxt, resp[0].ErrorMsg),
                              combineErrorMap: this.buildCombineErrorMap(this.state.pasteTxt, resp[0].ErrorMsg),
                            });
                              let t = [];
                              const toNum = (v) => {
                                const n = Number(String(v == null ? '' : v).replace(/,/g, '').trim());
                                return isNaN(n) ? 0 : n;
                              };
                              const unitPriceRaw = toNum(
                                this.state.unitPrice || this.props.navigation?.state?.params?.unitPrice || 1
                              );
                              const unitPrice = unitPriceRaw > 0 ? unitPriceRaw : 1;
                              const selectedUnitPrice =
                                this.state.combineAmountType == '25'
                                  ? 25
                                  : this.state.combineAmountType == '100'
                                    ? 100
                                    : 1;

                              // 1) Change Unit from API reply first
                              const normalized = (resp || []).map((value) => {
                                const rawUnit = toNum(value.Unit);
                                console.warn("RAWUNIT=======>"+rawUnit)
                                const convertedUnit =rawUnit; 
                                return {
                                  ...value,
                                  Unit: Number.isInteger(convertedUnit)
                                    ? convertedUnit
                                    : Number(convertedUnit.toFixed(2)),
                                };
                              });

                              // 2) Bind transformed data to list
                              normalized.map((value, index) => {
                                if (value.Num) {
                                  t.push({
                                    num: value.Num,
                                    unit: value.Unit,
                                    summary: value.Summary,
                                    discount: this.state.discount,
                                    GroupID: value.GroupID,
                                    GroupID2:value.GroupID,
                                    delete: false,
                                    showsummary: true,
                                  });
                                }
                              });
                              let __data = this.state.dataProvider.getAllData();
            this.setState(
              {
                dataProvider: dataProvider.cloneWithRows(
                  t.concat(__data),
                ),
                data: this.state.data.concat(t),
                dataforSwap: t.concat(__data),
                                  disableOK: true,
                                  showCombineModal: false,
                                  findStr: '',
                                  replaceStr: '',
                                  pasteTxt: '',
                                  combineErrorMsg: '',
                                  combineErrorLineIdx: [],
                                  combineErrorMap: [],
                                },
                                () => {
                                  this.refs.toast.show(
                                    'Combined Successfully!',
                                    1000,
                                  );
                                },
                              );
                            } else {
                              Alert.alert(config.AppName, resp);
                              this.setState({
                                loading: false,
                                errorMsg: 'Something went wrong',
                                disableOK: true,
                              });
                            }
                          },
                        );
                      });
                    }}
                    style={{
                      borderRadius: 5,
                      flex: 1,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: this.state.loading ? '#8bc34a99' : Color.Green,
                    }}>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                      {this.state.loading && (
                        <ActivityIndicator size="small" color="#fff" style={{marginRight:6}} />
                      )}
                      <Text
                        style={{fontSize: 16, fontWeight: '500', color: 'white'}}>
                        {this.state.loading ? 'Loading...' : 'OK'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </Modal>
      );
    }
    renderButtons(){
      return(
        <View style={{width:width,height:height*0.08,justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
          <TouchableOpacity style={{marginHorizontal:5,flex:1,justifyContent:'center',
          alignItems:'center',backgroundColor:Color.Green,paddingHorizontal:15,paddingVertical:10,borderRadius:5}}
          onPress={this._animateTo.bind(this,height*0.6)}>
            <Text style={estyles.btnText}>ဂဏန်းရိုက်ရန်</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'red',
            padding: 5,
            borderRadius: 5,
          }}
	          onPress={async () => {
	            const text = await Clipboard.getString();
              const savedCombineAmountType = await AsyncStorage.getItem(this.combineAmountTypeStorageKey);
	            this.setState({
	              showCombineModal: true,
                combineAmountType: this.normalizeCombineAmountType(savedCombineAmountType || this.state.combineAmountType),
	              pasteTxt: text,
	            });
	          }}>
          <Image
            source={plusIcon}
            style={{width: 30, height: 30, tintColor: '#fff'}}
          />
        </TouchableOpacity>
          <TouchableOpacity style={{marginHorizontal:5,flex:1,justifyContent:'center',
          alignItems:'center',backgroundColor:Color.yellow,paddingHorizontal:15,paddingVertical:10,borderRadius:5}}
          onPress={()=>{
              if(this.state.data.length>0){
                var_total_unit=this.getTotalUnit()
                this.setState({bet_modal_show:true})
              }
            }}>
            <Text style={estyles.btnText}>သိမ်းရန်</Text>
          </TouchableOpacity>
        </View>
      )
    }
    renderHeader(){
      return(
        <View style={[styles.header,{backgroundColor:Color.PRIMARYCOLOR}]}>
              <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}}
                onPress={()=>{
                  this.props.navigation.goBack()
                }}>
                <Image source={back} style={{width:30,height:30,resizeMode:"contain",marginHorizontal:8,tintColor:'#fff'}}/>
              </TouchableOpacity>
              <View style={{flex:2}}>
                  <Text style={{ color:'#fff', fontSize:12, marginLeft:5 }}>
                    {config.AppName || 'App'}
                  </Text>
                  <Text style={estyles.headerText} numberOfLines={1} ellipsizeMode={'tail'}>
                    {this.props.navigation.state.params.title}
                  </Text>
              </View>

           <View style={{ flexDirection: "row", marginRight: 10 }}>
            {/*  */}
            {/* <TouchableOpacity onPress={()=>{
                    this.setState({send_modal_show:true})
                  }}>
                    <Image source={message} style={{width:25,height:25,resizeMode:"contain",marginRight:8,tintColor:'#fff'}}/>
                  </TouchableOpacity> */}

            {/* <TouchableOpacity onPress={this.getHotNum.bind(this,true)}>
                    <Text style={[estyles.headerText,{fontSize:14}]}>{this.state.lg=='uni'?'ဟော့ဂဏန်း':'ေဟာ့ဂဏန္း'}</Text>
                  </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() => {
                console.warn("UserID============>"+ this.state.selectedUserId)
                this.props.navigation.navigate("Slip", {
                  endpoint: this.props.navigation.state.params.endpoint,
                   lg: "uni",
                termId3D:this.props.navigation.state.params.termId,
                termDetailsId3D:
                  this.props.navigation.state.params.termdetailsid,

                  // ✅ user id if you want auto user
                  userId: this.state.selectedUserId,  
                                 // GUID or int depending on your system

                  type: "3D",
                  autoView: true
                });
              }}
              style={{
                paddingHorizontal: 15,
                paddingVertical: 5,
                backgroundColor: "red",
                borderRadius: 5,
              }}
            >
              <Text style={[estyles.headerText, { fontSize: 14 }]}>
                {"စလစ်"}
              </Text>
              
            </TouchableOpacity>
          </View>
              
              <View style={{flexDirection:'row'}} >
              {/* TZT */}
                {/* <TouchableOpacity onPress={()=>{
                  this.setState({send_modal_show:true})
                }}>
                  <Image source={message} style={{width:25,height:25,resizeMode:"contain",marginRight:8,tintColor:'#fff'}}/>
                </TouchableOpacity> */}
                <TouchableOpacity onPress={()=>{
                  this.props.navigation.navigate('Ledger',
                  {
                    user:this.props.navigation.state.params.user,
                    termdetailsid:this.props.navigation.state.params.termdetailsid,
                    endpoint:this.props.navigation.state.params.endpoint,
                    lg:this.props.navigation.state.params.lg
                  })
                }}>
                  <Text style={[estyles.headerText,{fontSize:14,marginRight:7}]}>Ledger</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={this.getHotNum.bind(this,false)}>
                  <Text style={[estyles.headerText,{fontSize:14}]}>Extra</Text>
                </TouchableOpacity> */}
                  
              </View>
          </View>
      )
    }
    getHotNum(hot){
      if(hot){
        dal.getHotNum(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.termdetailsid,(err,result)=>{
          console.log('err ',err,' resp ',result)
          if(!err){
            if(result.Status=='OK'){
              this.setState({hotnum:result.Data})
            }else{
              //Alert.alert(dal.APP_NAME,this.props.navigation.state.params.lg=='uni'?"ဟော့ဂဏန်းမရှိပါ":"ေဟာ့ဂဏန္းမရွိပါ",[{text:'Ok',onPress:()=>{console.warn('ok')}}])
            }
          }
        })
      }else{
        dal.getExtraNum(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.termdetailsid,(err,result)=>{
          if(!err){
            if(result.Status=='OK'){
              this.setState({extras:result.Data,hot_modal_show:true})
            }else{
              Alert.alert(config.AppName,'No Extra Number',[{text:'Ok',onPress:()=>{console.warn('ok')}}])
            }
          }
        })
      }
    }
    renderHotnum(){
      return this.state.extras.map((value,index)=>{
        return(
          <View style={{width:width*0.85,height:height*0.08,justifyContent:'center'}}>
            <Text style={{marginLeft:15,color:'#262626',fontSize:14}}>{value.Num}</Text>
          </View>
        )
      })
    }
    renderUsers(){
      if(this.state.user.length>0){
        return this.state.user.map((value,index)=>{
          return(
            <Picker.Item label={value.UserNo} value={value.UserID} key={index} />
          )
        })
      }
    }

    // ===== User Search + Dropdown (combined) =====
getUserLabel = (u) => {
  if(!u) return '';
  return (u.UserNo || u.UserName || u.Name || String(u.UserID || '')) + '';
};

_norm = (s) => (s || '').toString().trim().toLowerCase();

_applyUser = (u) => {
  if(!u){
    this.setState({
      selectedUserId: null,
      userid: null,
      selectedUser: null,
      discount: '',
      UseMoneyInOut: false,
      canSubmit: false,
    });
    return;
  }
  this.setState({
    selectedUserId: u.UserID,
    userid: u.UserID,
    selectedUser: u,
    discount: u.Discount3D,
    UseMoneyInOut: u.UseMoneyInOut,
    canSubmit: true,
    userSearchText: this.getUserLabel(u),
    filteredUsers: [],
    showUserSuggest: false,
    dropdownOpen: true,  // ✅ select လုပ်ပြီး dropdown ပြန်ဖွင့်
  });
};


_onSearchUser = (text) => {
  const typing = (text || '').length > 0;

  // typing => hide dropdown, show suggest
  this.setState({
    userSearchText: text,
    showUserSuggest: true,
    dropdownOpen: !typing, // text ရှိရင် dropdown hide
  });

  if(this.state.userSearchTimer) clearTimeout(this.state.userSearchTimer);

  const timer = setTimeout(() => {
    const q = this._norm(text);
    const list = this.state.user || [];

    if(!q){
      this.setState({
        filteredUsers: [],
        selectedUser: null,
        selectedUserId: null,
        userid: null,
        canSubmit: false,
        showUserSuggest: false,
        dropdownOpen: true, // empty => dropdown show
      });
      return;
    }

    const filtered = [];
    for(let i=0;i<list.length;i++){
      const u = list[i];
      const label = this._norm(this.getUserLabel(u));
      if(label.includes(q)){
        filtered.push(u);
        if(filtered.length >= 30) break;
      }
    }

    // exact match
    let exact = null;
    for(let i=0;i<filtered.length;i++){
      if(this._norm(this.getUserLabel(filtered[i])) === q){
        exact = filtered[i];
        break;
      }
    }

    if(exact){
      // exact => enable (dropdown still hidden because typing)
      this.setState({
        filteredUsers: filtered,
        selectedUser: exact,
        userid: exact.UserID,
        discount: exact.Discount3D,
        UseMoneyInOut: exact.UseMoneyInOut,
        canSubmit: true,
        selectedUserId: exact.UserID,
      });
    }else{
      this.setState({
        filteredUsers: filtered,
        selectedUser: null,
        userid: null,
        canSubmit: false,
        selectedUserId: null,
      });
    }
  }, 250);

  this.setState({ userSearchTimer: timer });
};


_onPickUser = (userId) => {
  const i = (this.state.user || []).findIndex(x => x.UserID == userId);
  if(i === -1){
    this._applyUser(null);
    return;
  }
  this._applyUser(this.state.user[i]);
};


    // ===== User Search (exact match required) =====
    getUserLabel(u){
      if(!u) return '';
      return (u.UserNo || u.UserName || u.Name || String(u.UserID||'')) + '';
    }

    onUserSearchChange(text){
      const t = (text || '');
      this.setState({
        userQuery: t,
        showUserSuggest: true,
        selectedUser: null,
        userid: null
      });

      if(this.searchTimer) clearTimeout(this.searchTimer);

      this.searchTimer = setTimeout(() => {
        const q = t.toLowerCase().trim();
        const users = this.state.user || [];

        if(!q){
          this.setState({ filteredUsers: users, showUserSuggest: false });
          return;
        }

        const filtered = users.filter(u => {
          const label = (u.__labelLower || this.getUserLabel(u).toLowerCase());
          const id = String(u.UserID || '').toLowerCase();
          return label.includes(q) || id.includes(q);
        });

        const exact = users.find(u => {
          const label = (u.__labelLower || this.getUserLabel(u).toLowerCase()).trim();
          return label === q;
        });

        if(exact){
          this.selectUser(exact);
        }else{
          this.setState({
            filteredUsers: filtered,
            showUserSuggest: true,
            selectedUser: null
          });
        }
      }, 200);
    }

    selectUser(u){
      if(!u) return;
      this.setState({
        selectedUser: u,
        userid: u.UserID,
        discount: u.Discount3D,
        UseMoneyInOut: u.UseMoneyInOut,
        userQuery: this.getUserLabel(u),
        filteredUsers: this.state.user || [],
        showUserSuggest: false
      });
    }

    getTermsFromOther(){
      dal.getTermsFromOther(this.state.supplierInfo.Website.replace('www.','http://luckyapi.'),this.state.otherInfo.UserID,(err,resp)=>{
          if(err){
              console.log(err)
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
              })
          }else{
              console.log(resp)
              if(resp.Status=='OK'&&resp.Data.length>0){
                  this.setState({
                      termsFromOther:resp.Data,
                      showDirectBuyModal:true,
                      loading:false
                  })
              }else{
                  Alert.alert(config.AppName,resp.Status)
                  this.setState({
                      loading:false,
                  })
              }
          }
      })
    }
    getUserFromOther(){
      dal.getUserFromOther(this.state.supplierInfo.Website.replace('www.','http://luckyapi.'),this.state.supplierInfo.UserNo,this.state.supplierInfo.Password,(err,resp)=>{
          if(err){
              console.log(err)
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
              })
          }else{
              console.log(resp)
              if(resp.Status=='OK'&&resp.Data.length>0){
                  this.setState({
                      otherInfo:resp.Data[0]
                  },()=>{
                      this.getTermsFromOther()
                  })
              }else{
                  Alert.alert(config.AppName,'Get User Info Fail!')
                  this.setState({
                      loading:false,
                  })
              }
          }
      })
    }
    pressDirectBuy(){
      if(this.state.userid==null){
        Alert.alert(config.AppName,'Please select the user!')
        return;
      }
      this.setState({
        loading:true,
      })
      dal.ApiSupplier(this.props.navigation.state.params.endpoint,this.state.userid,(err,resp)=>{
          if(err){
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
              })
          }else{
              if(resp&&resp.UserNo){
                  this.setState({
                      supplierInfo:resp
                  },()=>{
                      this.getUserFromOther()
                  })
              }else{
                  Alert.alert(config.AppName,'Get Supplier Fail!')
                  this.setState({
                      loading:false,
                  })
              }
              
              console.log('ApiSupplier resp ',typeof resp ,resp)
          }
      })
    }
    renderOtherTerms(){
      return this.state.termsFromOther.map((value,index)=>{
        return(
          <Picker.Item label={value.Name} value={value.TermDetailID} key={index} />
        )
      })
    }
    downloadSlipFromOther(){
      this.setState({
          loading:true,
          showDirectBuyModal:false
      })
      dal.downloadSlipFromOther(this.state.supplierInfo.Website.replace('www.','http://luckyapi.'),this.state.otherInfo.UserID,this.state.termIdForOther,(err,resp)=>{
          if(err){
              console.log(err)
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
                  showDownload:false
              })
          }else{
              console.log('============= downloda downloadSlipFromOther -===========')
              console.log(resp)
              if(resp.Status=='OK'&&resp.Data.length>0){
                  this.uploadSlipToServer(resp)
              }else{
                  Alert.alert(config.AppName,resp.Status)
                  this.setState({
                      loading:false,
                      showDownload:false
                  })
              }
          }
      })
    }
    uploadSlipToServer(data){
      dal.uploadSlipToServer(this.props.navigation.state.params.endpoint,this.state.userid,this.props.navigation.state.params.termdetailsid,data,(err,resp)=>{
          if(err){
              console.log('uploadSlipToServer err ',err)
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
                  showDownload:false
              })
          }else{
              console.log('=============  uploadSlipToServer -===========')
              console.log(resp)
              if(resp=='OK'){
                  this.downloadSlipDetailsFromOther()
              }else{
                  Alert.alert(config.AppName,resp)
                  this.setState({
                      loading:false,
                      showDownload:false
                  })
              }
              
              console.log('uploadSlipToServer resp ',typeof resp ,resp)
          }
      })
    }
    downloadSlipDetailsFromOther(){
      dal.downloadSlipDetailsFromOther(this.state.supplierInfo.Website.replace('www.','http://luckyapi.'),this.state.otherInfo.UserID,this.state.termIdForOther,(err,resp)=>{
          if(err){
              console.log(err)
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
                  showDownload:false
              })
          }else{
              console.log('=============  downloadSlipDetailsFromOther -===========')
              console.log(resp)
              if(resp.Status=='OK'&&resp.Data.length>0){
                  let data = resp.Data.map((item, index) => {
                      item.Unit = (item.Unit*this.state.supplierInfo.ServerUnit)/this.state.supplierInfo.UserUnit
                      return item;
                  });
                  this.uploadSlipDetailsToServer({Status:'OK',Data:data})
              }else{
                  Alert.alert(config.AppName,resp.Status)
                  this.setState({
                      loading:false,
                      showDownload:false
                  })
              }
          }
      })
    }
    uploadSlipDetailsToServer(data){
      dal.uploadSlipDetailsToServer(this.props.navigation.state.params.endpoint.replace('www.',''),data,(err,resp)=>{
          if(err){
              console.log('uploadSlipDetailsToServer err ',err)
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
                  showDownload:false
              })
          }else{
              console.log('=============  uploadSlipDetailsToServer -===========')
              console.log(resp)
              if(resp=='OK'){
                  this.setState({
                      loading:false,
                      showDirectBuyModal:false,
                      showDownload:false
                  })
                  this.clearData()
                  Alert.alert(config.AppName,'Download Successfully!')
              }else{
                  Alert.alert(config.AppName,resp)
                  this.setState({
                      loading:false,
                      showDownload:false
                  })
              }
          }
      })
    }
    saveSliptoOther(){
      let d=[]
      this.state.data.map((value,index)=>{
          let u=Math.ceil((value.unit*this.state.supplierInfo.UserUnit)/this.state.supplierInfo.ServerUnit)
          d.push(
              {
                  SaleDetailID:null,
                  SaleID:null,
                  Num:value.num,
                  Unit:u,
                  UnitUser:this.state.supplierInfo.UserUnit,
                  Summary:value.num,
                  Discount:this.state.otherLottType=='2D'?this.state.otherInfo.Discount2D:this.state.otherInfo.Discount3D,
                  GroupID:'',
                  GroupID2:moment().unix(),
              }
          )
      })
      console.log(d)
      dal.saveSliptoOther(this.state.supplierInfo.Website.replace('www.','http://luckyapi.'),this.state.otherInfo.UserID,this.state.termIdForOther,d,(err,resp)=>{
          if(err){
              console.log(err)
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
              })
          }else{
              console.log('=============  saveSliptoOther -===========')
              console.log(resp)
              if(JSON.parse(resp).Msg=='OK'){
                  Alert.alert(config.AppName,'Save successfully!')
                  this.setState({
                      loading:false,
                      showDownload:true
                  })
              }else{
                  Alert.alert(config.AppName,JSON.parse(resp).Msg)
                  this.setState({
                      loading:false,
                      showDownload:true
                  })
              }
          }
      })
    }
    renderDirectBuyModal(){
      return(
          <Modal
          transparent={true}
          visible={this.state.showDirectBuyModal}
          onRequestClose={()=>{
              this.setState({
                  showDirectBuyModal:false,
                  loading:false
              })
          }}
          >
              <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                  <View style={{backgroundColor:'#fff',alignItems:'center',width:width*0.8,borderRadius:5,padding:10}}>
                      <View style={{width:width*0.8,alignItems:'center',padding:15}}>
                          <View style={{width:((width*0.8)-30),height:40,justifyContent:'center',
                              borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,}}>
                              <Picker
                                  mode='dropdown'
                                  selectedValue={this.state.termIdForOther}
                                  style={{ height:40, width:((width*0.8)-30)}}
                                  onValueChange={(itemValue, itemIndex) =>{
                                      let i=this.state.termsFromOther.findIndex(x => x.TermDetailID==itemValue);
                                      if(i!==-1){
                                          this.setState({
                                              termIdForOther:itemValue,
                                              otherLottType:this.state.termsFromOther[i].LottType
                                          }, () => this.getHotListForOther(itemValue))
                                      }else{
                                          this.setState({
                                              termIdForOther:null,
                                              otherLottType:'2D',
                                              otherHots: []
                                          })
                                      }
                                  }}>
                                  <Picker.Item label={'Select Term'} value={null}/>
                                  {this.renderOtherTerms()}
                              </Picker>
                          </View>

                          {this.state.otherHots.length > 0 && (
                              <View style={{ marginTop: 8, width: ((width * 0.8) - 30) }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                      <Text style={{ color: '#262626', fontSize: 12, fontWeight: 'bold', flex: 1 }}>
                                          Hot Numbers
                                      </Text>
                                      <TouchableOpacity
                                          onPress={() => this.getHotListForOther(this.state.termIdForOther)}
                                          style={{ padding: 6 }}
                                      >
                                          <Image source={refreshIcon} style={{ width: 26, height: 26, tintColor: Color.Green }} />
                                      </TouchableOpacity>
                                  </View>
                                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                      {this.state.otherHots.map((x, idx) => (
                                          <View
                                              key={`${x.Num || ''}-${idx}`}
                                              style={{
                                                  paddingVertical: 4,
                                                  paddingHorizontal: 8,
                                                  borderWidth: 1,
                                                  borderColor: Color.DIVIDERCOLOR,
                                                  borderRadius: 4,
                                                  marginRight: 6,
                                                  marginBottom: 6,
                                                  backgroundColor: '#f7f7f7',
                                              }}
                                          >
                                              <Text style={{ fontSize: 12, color: '#262626', fontWeight: 'bold' }}>
                                                  {x.Num}
                                              </Text>
                                          </View>
                                      ))}
                                  </View>
                              </View>
                          )}
                              
                          <View style={{
                              flexDirection:'row',
                              alignItems:'center',
                              marginTop:10
                          }}>
                              <Text style={{color:'#262626',fontSize:14,marginRight:8}}>
                                  {word[this.props.navigation.state.params.lg].user}
                              </Text>
                              <View style={{
                                  flexDirection:'row',
                                  marginBottom:10,
                                  flex:1
                              }}>
                                  <TextInput
                                      style={{
                                          flex:1,
                                          paddingVertical:7,
                                          height:40,
                                          borderWidth:1,
                                          borderColor:Color.DARKPRIMARYTEXTCOLOR,
                                          borderRadius:5,
                                          marginRight:5,
                                          textAlign:'center',
                                          color:'#262626'
                                      }}
                                      placeholder={'Hot Num'}
                                      keyboardType='decimal-pad'
                                      underlineColorAndroid='transparent'
                                      value={this.state.otherInfo?this.state.otherInfo.UserNo:''}
                                      editable={false}
                                  />
                              </View>
                          </View>

                          <TouchableOpacity style={{
                              paddingHorizontal:30,
                              paddingVertical:10,
                              marginTop:20,
                              backgroundColor:Color.PRIMARYCOLOR,
                              borderRadius:10
                          }} onPress={()=>{
                            if(this.state.otherLottType!=this.props.navigation.state.params.LottType){
                              Alert.alert(config.AppName,'Invalid term details!')
                              return;
                            }
                              if(this.state.termIdForOther){
                                  if(this.state.showDownload){
                                      this.downloadSlipFromOther()
                                  }else{
                                      this.saveSliptoOther()
                                  }
                              }else{
                                  Alert.alert(config.AppName,'Please select the term!')
                                  return;
                              }
                              
                          }}>
                              <Text style={{color:'#262626',fontSize:14,}}>
                                  {this.state.showDownload?'Download':'Save'}
                              </Text>
                          </TouchableOpacity>

                      </View>
                  </View>
              </View>
          </Modal>
      )
    }
    pressSave(){
      const FETCH_TIMEOUT = 30000;
      let didTimeOut = false;
      //TZT
      let data = this.state.data.map((item, i) => {
        item.discount =this.state.discount
        item.summary=item.showsummary?item.summary:''
        return item;
      });
      console.log('data for save ',JSON.stringify({
        UserID:this.state.userid,
        TermDetailID:this.props.navigation.state.params.termdetailsid,
        CName:this.state.name,
        Data:data
     }))
      var options = {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },      
          body:JSON.stringify({
              UserID:this.state.userid,
              TermDetailID:this.props.navigation.state.params.termdetailsid,
              CName:this.state.name,
              Data:data
           }),
          
      };;
      var that=this
      new Promise(function(resolve, reject) {
          const timeout = setTimeout(function() {
              didTimeOut = true;
              reject(new Error('Request timed out'));
          }, FETCH_TIMEOUT);
          let url = that.state.UseMoneyInOut
      ? that.props.navigation.state.params.endpoint + 'api/apisale?PrintAPI=true&UseMoneyInOut=true'
      : that.props.navigation.state.params.endpoint + 'api/apisale?PrintAPI=true'
          let _url=that.state.allowExtra?that.props.navigation.state.params.endpoint+'api/apisaleAndroidOwner?IsSale=true&IsShare=true':url
          fetch(_url,options)
          .then((result) => result.text())
          .then(function(response) {
              // Clear the timeout as cleanup
              clearTimeout(timeout);
              if(!didTimeOut) {
                  console.warn('fetch good! ', response);
                  resolve(response);
              }
          })
          .catch(function(err) {
              console.warn('fetch failed! ', err);
              
              // Rejection already happened with setTimeout
              if(didTimeOut) return;
              // Reject with error
              reject(err);
          });
      })
      .then(function(response) {
          // Request success and no timeout
          //console.warn('good promise, no timeout! '+JSON.stringify(response));
          that.setState({loading:false})

          if (JSON.parse(response).Status == 200) {
            console.warn('Go to Slip Detail Get===========>')
                    that.clearData();
                    that.setState({
                      //TZT
                      printFormat: JSON.parse(response).Msg.includes("=")
                        ? "all"
                        : "group",
                      //printFormat:JSON.parse(response).Msg.includes('=')?'all':'all'
                    });
                    dal.getSlipDetail(
                      that.props.navigation.state.params.endpoint,
                      JSON.parse(response).SaleID,
                      (err, result) => {
                        if (err) {
                          console.warn(err);
                          that.setState({
                            alertInfo: {
                              showModal: true,
                              alertMsg: JSON.parse(response)
                                .Msg.replace(/\\n/g, "\n")
                                .replace(/\"/g, ""),
                              showPrint: true,
                              shareData: [],
                              showOver: JSON.parse(response).ShowOver,
                              overSale: JSON.parse(response).sale,
                            },
                          });
                          return;
                        }
                        if (result.Status == "OK") {
                          console.warn('ST OK==========>')
                          if (that.state.print) {
                            console.warn('Print ST OK========>')
                            that.setState(
                              {
                                printData: result.Data,
                                slipNo: JSON.parse(response).SlipNo,
                                alertInfo: {
                                  showModal: true,
                                  alertMsg: JSON.parse(response)
                                    .Msg.replace(/\\n/g, "\n")
                                    .replace(/\"/g, ""),
                                  showPrint: true,
                                  shareData: result.Data,
                                  showOver: JSON.parse(response).ShowOver,
                                  overSale: JSON.parse(response).sale,
                                },
                              },
                              () => {
                                setTimeout(() => {
                                  that.refs.viewShot.capture().then((uri) => {
                                    RNFS.moveFile(uri, imagePath)
                                      .then((success) => {
                                        console.warn("FILE MOVED!", imagePath);
                                        NativeModules.PrinterManager.printImage(
                                          imagePath,
                                          that.state.layoutWidth == 58 ? 384 : 576,
                                          (res) => {
                                            console.warn(res);
                                            if (res === "connected") {
                                              that.clearData();
                                              that.setState({
                                                name: "",
                                              });
                                              //do something
                                            } else {
                                              that.clearData();
                                              that.setState({
                                                name: "",
                                              });
                                              //do something
                                            }
                                          }
                                        );
                                        NativeModules.PrinterManager.printText("\n\n");
                                      })
                                      .catch((err) => {
                                        console.warn(err.message);
                                      });
                                  });
                                }, 1000);
                              }
                            );
                          } else {
                            console.warn('Show Modal =========>')
                            that.setState({
                              slipNo: JSON.parse(response).SlipNo,
                              alertInfo: {
                                showModal: true,
                                alertMsg: JSON.parse(response)
                                  .Msg.replace(/\\n/g, "\n")
                                  .replace(/\"/g, ""),
                                showPrint: true,
                                shareData: result.Data,
                                showOver: JSON.parse(response).ShowOver,
                                overSale: JSON.parse(response).sale,
                              },
                            });
                            that.clearData();
                          }
                        } else {
                          console.warn('Status Not OK=========>')
                          that.setState({
                            alertInfo: {
                              showModal: true,
                              alertMsg: JSON.parse(response)
                                .Msg.replace(/\\n/g, "\n")
                                .replace(/\"/g, ""),
                              showPrint: true,
                              shareData: [],
                              showOver: JSON.parse(response).ShowOver,
                              overSale: JSON.parse(response).sale,
                            },
                          });
                        }
                      }
                    );
                  } else {
                            that.setState({
                              alertInfo: {
                                showModal: true,
                                alertMsg: JSON.parse(response)
                                  .Msg.replace(/\\n/g, "\n")
                                  .replace(/\"/g, ""),
                                showPrint: false,
                                shareData: [],
                                showOver: JSON.parse(response).ShowOver,
                                overSale: JSON.parse(response).sale,
                              },
                            });
                          }
      })
      .catch(function(err) {
          // Error: response error, request timeout or runtime error
          that.setState({loading:false})
          that.clearData()
          Alert.alert(config.AppName,'ထိုးဂဏန်းများ ရ/မရ စလစ်ထဲပြန်စစ်ပါ',[{text:'Ok',onPress:()=>{
            
          }}])
          console.warn('promise error! ', err);
      });
    }

    pressBUY(){
      const FETCH_TIMEOUT = 30000;
      let didTimeOut = false;
      //TZT
      
      var options = {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },      
          body:JSON.stringify({
              UserID:this.state.userid,
              TermDetailID:this.props.navigation.state.params.termdetailsid,
              CName:this.state.name,
              Data:this.state.data
           }),
          
      };;
      var that=this
      new Promise(function(resolve, reject) {
          const timeout = setTimeout(function() {
              didTimeOut = true;
              reject(new Error('Request timed out'));
          }, FETCH_TIMEOUT);
          let _url=that.props.navigation.state.params.endpoint+'api/apisaleAndroidOwner?IsSale=false';
          fetch(_url,options)
          .then((result) => result.text())
          .then(function(response) {
              // Clear the timeout as cleanup
              clearTimeout(timeout);
              if(!didTimeOut) {
                  console.warn('fetch good! ', response);
                  resolve(response);
              }
          })
          .catch(function(err) {
              console.warn('fetch failed! ', err);
              
              // Rejection already happened with setTimeout
              if(didTimeOut) return;
              // Reject with error
              reject(err);
          });
      })
      .then(function(response) {
          // Request success and no timeout
          //console.warn('good promise, no timeout! '+JSON.stringify(response));
          that.setState({loading:false})
          that.clearData()
          Alert.alert(config.AppName,response.replace(/\\n/g,'\n').replace(/\"/g,''),[{text:'Ok',onPress:()=>{
            
          }}])
      })
      .catch(function(err) {
          // Error: response error, request timeout or runtime error
          that.setState({loading:false})
          that.clearData()
          Alert.alert(config.AppName,'ထိုးဂဏန်းများ ရ/မရ စလစ်ထဲပြန်စစ်ပါ',[{text:'Ok',onPress:()=>{
            
          }}])
          console.warn('promise error! ', err);
      });
    }

    clearData(){
      this.setState({
        data:[],
        name:'',
        dataProvider:dataProvider.cloneWithRows([]),
        dataforSwap:[]
      })
    }
    renderSaveModal(){
      const canSubmit = this.state.userid != null;
      const totalUnit = this.getTotalUnit();
      var_total_unit = totalUnit;
      return(
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.bet_modal_show}
            onRequestClose={() => {}}>


                <TouchableWithoutFeedback
                  onPress={()=>{
                    this.setState({
                      showUserSuggest:false,
                      dropdownOpen:true
                    })
                  }}
                >
              <View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#11030085"}}>



                <View style={{
                  width:Math.round(Dimensions.get("window").width*0.85),
                  backgroundColor:"#fff",borderRadius:10}}>
                  
                  <View style={{backgroundColor:'gray',height:1,width:width*0.75,marginHorizontal:width*0.05}}/>
                  <View style={{height:height*0.06,width:width*0.75,marginHorizontal:width*0.05,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                      <Text style={estyles.mmLargeText}>ကော်</Text>
                      <Text style={estyles.mmLargeText}>{this.state.discount}</Text>
                  </View>
                  <View style={{backgroundColor:'gray',height:1,width:width*0.75,marginHorizontal:width*0.05}}/>
                  <View style={{height:height*0.06,width:width*0.75,marginHorizontal:width*0.05,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                      <Text style={estyles.mmLargeText}>ယူနစ်ပေါင်း</Text>
                      <Text style={estyles.mmLargeText}>{dal.numberWithCommas(totalUnit)}</Text>
                  </View>
                  <View style={{backgroundColor:'gray',height:1,width:width*0.75,marginHorizontal:width*0.05}}/>
                  <View style={{height:height*0.06,width:width*0.75,marginHorizontal:width*0.05,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                      <Text style={estyles.mmLargeText}>ထိုးကြေး</Text>
                      <Text style={estyles.mmLargeText}>
                        {numeral(
                  totalUnit * this.state.unitPrice -
                    totalUnit *
                      this.state.unitPrice *
                      (parseInt(this.state.discount) / 100)
                ).format("0,0")}
                        </Text>
                  </View>

                    <TouchableWithoutFeedback onPress={()=>{}}>

                  <View style={{width:width*0.75,marginHorizontal:width*0.05,marginTop:10}}>

                    {/* Search box */}
                    <View style={{
                      height:45,
                      backgroundColor: Color.lightGray,
                      borderRadius:6,
                      justifyContent:'center',
                      paddingHorizontal:10
                    }}>
                        <TextInput
                          placeholder="ထိုးသားရွေးပါ။"
                        placeholderTextColor="#666"
                        value={this.state.userSearchText}
                        onChangeText={this._onSearchUser}
                        onFocus={()=>this.setState({showUserSuggest:true})}
                        style={{color:'#000',fontSize:14}}
                      />
                    </View>

                    {/* Suggest list */}
                    {this.state.showUserSuggest && this.state.filteredUsers.length > 0 ? (
                      <View style={{
                        maxHeight: 200,
                        borderWidth:1,
                        borderColor: Color.defaultGray,
                        borderRadius:6,
                        marginTop:6,
                        backgroundColor:'#fff'
                      }}>
                        <FlatList
                          keyboardShouldPersistTaps="handled"
                          data={this.state.filteredUsers}
                          keyExtractor={(item, idx)=>String(item.UserID || idx)}
                          renderItem={({item})=>(
                            <TouchableOpacity
                              onPress={()=>this._applyUser(item)}
                              style={{paddingVertical:10,paddingHorizontal:12,borderBottomWidth:0.5,borderColor:'#ddd'}}
                            >
                              <Text style={{color:'#000',fontSize:14}}>{this.getUserLabel(item)}</Text>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    ) : null}

                    {/* Dropdown (still available) */}
                    {this.state.dropdownOpen ? (
                    <View style={{
                      height:45,
                      borderWidth:1,
                      borderColor: Color.defaultGray,
                      borderRadius:6,
                      justifyContent:'center',
                      marginTop:8
                    }}>
                      <Picker
                        mode="dropdown"
                        selectedValue={this.state.userid}
                        style={{height:45,width:'100%'}}
                        onValueChange={(val)=> this._onPickUser(val)}
                      >
                        <Picker.Item label="ထိုးသားရွေးပါ။" value={null} />
                        {(this.state.user || []).map((u, idx)=>(
                          <Picker.Item
                            key={idx}
                            label={this.getUserLabel(u)}
                            value={u.UserID}
                          />
                        ))}
                      </Picker>
                    </View>
                    ) : null}
                  </View>
                  </TouchableWithoutFeedback>

                  <View style={styles.inputWrap}>
                    <TextInput
                      placeholder           = "ထိုးသားအမည်မှတ်သားရန်"
                      style                 = {styles.input}
                      placeholderTextColor  = "#000"
                      underlineColorAndroid = "transparent"
                      tintColor             = "#262626"
                      value={this.state.name}
                      onChangeText          = {(text)=>this.setState({name:text})}
                    />
                  </View>
                  <TouchableOpacity style={{
                  flexDirection:'row',
                  alignItems:'center',
                  marginLeft:width*0.05,
                  marginTop:8
                }}
                onPress={()=>{
                    AsyncStorage.setItem('allowExtra',this.state.allowExtra?'false':'true')
                    this.setState({
                      allowExtra:!this.state.allowExtra
                    })
                }}
                >
                  <Image style={{width:20,height:20,marginRight:4}}source={this.state.allowExtra?tickIcon:untickIcon}/>
                  <Text style={{fontSize:14,fontWeight:'bold',color:'red'}}>Allow Extra</Text>
                </TouchableOpacity>
                  <View style={{width:width*0.75,height:height*0.08,justifyContent:'space-between'
                  ,alignItems:'center',marginHorizontal:width*0.05,flexDirection:'row'}}
                    >
                    <TouchableOpacity onPress={()=>{ this.setState({bet_modal_show:false}) }}
                      style={{flex:1,marginHorizontal:5,paddingVertical:4,backgroundColor:'red',
                      borderRadius:5,alignItems:'center',justifyContent:'center'}}>
                      <Text style={{fontSize:14,fontWeight:'bold',color:'white'}}>CANCEL</Text>
                    </TouchableOpacity>

                   <TouchableOpacity
                  disabled={!canSubmit}
                  onPress={() => {
                    if (!canSubmit) {
                      Alert.alert(config.AppName, 'Please select the user!');
                      return;
                    }

                    this.setState({ bet_modal_show: false, loading: true });
                    dal.sendRequest((result) => {
                      if (true) {
                        this.pressSave();
                      } else {
                        this.setState({ loading: false });
                        Alert.alert(config.AppName, 'အင်တာနက်မမိပါ');
                      }
                    });
                  }}
                  style={{
                    marginRight: 5,
                    flex: 1,
                    paddingVertical: 5,
                    backgroundColor: canSubmit ? Color.Green : '#999',
                    borderRadius: 5,
                    opacity: canSubmit ? 1 : 0.6,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>OK</Text>
                </TouchableOpacity>

                  </View>
                  <View style={{width:width*0.75,height:height*0.08,justifyContent:'space-between'
                  ,alignItems:'center',marginHorizontal:width*0.05,flexDirection:'row'}}
                    >
                    <TouchableOpacity disabled={!canSubmit} onPress={()=>{ if(!canSubmit){ Alert.alert(config.AppName,'Please select the user!'); return; }
                        
                        this.setState({bet_modal_show:false,loading:true})
                        dal.sendRequest((result) => {
                          //if(result){
                            if(true){
                            //access internet
                            this.pressBUY() 
                          }else{
                            //no access internet
                            this.setState({loading:false})
                            Alert.alert(config.AppName,'အင်တာနက်မမိပါ')
                          }
                        })
                        
                      
                    }} style={{flex:1,marginHorizontal:5,paddingVertical:4,backgroundColor:canSubmit?Color.Green:'#999',borderRadius:5,opacity:canSubmit?1:0.6,
                      alignItems:'center',justifyContent:'center'}}>
                    <Text style={{fontSize:14,fontWeight:'bold',color:'white'}}>BUY</Text>
                  </TouchableOpacity>

                    <TouchableOpacity disabled={!canSubmit} onPress={()=>{ if(!canSubmit){ Alert.alert(config.AppName,'Please select the user!'); return; }
                        
                          this.setState({bet_modal_show:false,loading:true})
                          dal.sendRequest((result) => {
                            //if(result){
                              if(true){
                              //access internet
                              this.pressDirectBuy() 
                            }else{
                              //no access internet
                              this.setState({loading:false})
                              Alert.alert(config.AppName,'အင်တာနက်မမိပါ')
                            }
                          })
                          
                        
                      }} style={{marginRight:5,flex:1,paddingVertical:4,backgroundColor:canSubmit?Color.Green:'#999',borderRadius:5,opacity:canSubmit?1:0.6,
                        alignItems:'center',justifyContent:'center'}}>
                      <Text style={{fontSize:14,fontWeight:'bold',color:'white'}}>Direct Buy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
            </View>
            </TouchableWithoutFeedback>
          </Modal>
      )
    }

    renderOverModal() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.alertInfo.showModal}
        onRequestClose={() => {
          this.setState({
            alertInfo: {
              showModal: false,
              alertMsg: "",
              showPrint: false,
              shareData: [],
              showOver: false,
              overSale: null,
            },
          });
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#11030085",
          }}
        >
          <View
            style={{
              width: Math.round(Dimensions.get("window").width * 0.98),
              padding: 16,
              backgroundColor: "#fff",
              borderRadius: 5,
            }}
          >
            <ScrollView style={{ maxHeight: height * 0.35 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: Color.DarkBlack,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                {this.state.alertInfo.alertMsg}
              </Text>
            </ScrollView>
            <View
              style={{
                height: height * 0.08,
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 5,
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    alertInfo: {
                      showModal: false,
                      alertMsg: "",
                      showPrint: false,
                      shareData: [],
                      showOver: false,
                      overSale: null,
                    },
                  });
                }}
                style={{
                  backgroundColor: Color.Historyshipcove,
                  borderRadius: 5,
                  flex: 1,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 5,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "white" }}
                >
                  Ok
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const raw = (this.state.alertInfo.alertMsg || '')
                                       .replace(/\\n/g, "\n")
                                       .replace(/\"/g, "");
                                     const lines = raw.split(/\r?\n/);
                                     const onlyNums = lines
                                       .map(l => l.trim())
                                       .filter(l => l.includes('='))
                                       .filter(l => {
                                         const parts = l.split('=');
                                         if (parts.length < 2) return false;
                                         const left = (parts[0] || '').trim();
                                         const right = (parts.slice(1).join('=') || '').trim();
                                         return /\d/.test(left) && /\d/.test(right);
                                       });
                                     const text = onlyNums.join('\n');
                                     const msg = text.trim() !== '' ? text : raw;
                                     Share.share(
                                       { message: msg },
                                       {
                                         // Android only:
                                         dialogTitle:
                                           this.state.lg == "uni"
                                             ? "စာပို႔ရန်"
                                             : "စာပို႔ရန္",
                                       }
                                     );
                }}
                style={{
                  backgroundColor: Color.Historyshipcove,
                  borderRadius: 5,
                  flex: 1,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "white" }}
                >
                  Copy
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                height: height * 0.08,
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 5,
                flexDirection: "row",
                marginTop: 16,
              }}
            >
              

              {this.state.alertInfo.showPrint && (
                <TouchableOpacity
                  onPress={() => {
                    console.log('slipNo ==>>> ',this.state.slipNo);
                    let today = new Date();
                    var date =
                      today.getDate() +
                      "-" +
                      (today.getMonth() + 1) +
                      "-" +
                      today.getFullYear();
                    const time = this.formatAMPM(today);
                    const index = this.state.user.findIndex(
                      (x) => x.UserID == this.state.userid
                    );
                    const userName = `${
                      index != -1 ? this.state.user[index].UserName : ""
                    }${" > "}${this.state.name}`;
                    const printTime = `${date} ${time}`;
                    const termName = this.props.navigation.state.params.title;
                    let sharedata =
                      userName +
                      "\n" +
                      printTime +
                      "\n" +
                      termName +
                      "\nSlipNo=" +
                      this.state.slipNo +
                      "\n \t ............ \n";
                    var total = 0;
                    for (
                      let i = 0;
                      i < this.state.alertInfo.shareData.length;
                      i++
                    ) {
                      if (i == this.state.alertInfo.shareData.length - 1) {
                        let tempUnit =
                          this.state.printType == "unit"
                            ? this.state.alertInfo.shareData[i].Unit
                            : this.state.alertInfo.shareData[i].Unit *
                              this.state.alertInfo.shareData[i].UnitPrice;
                        total += tempUnit;
                        sharedata =
                          sharedata +
                          this.state.alertInfo.shareData[i].Num +
                          "=" +
                          tempUnit +
                          "\n";
                        const raw = (this.state.alertInfo.alertMsg || '')
                          .replace(/\\n/g, "\n")
                          .replace(/\"/g, "");
                        const onlyNums = raw
                          .split(/\r?\n/)
                          .map(l => l.trim())
                          .filter(l => l.includes('='))
                          .filter(l => {
                            const parts = l.split('=');
                            if (parts.length < 2) return false;
                            const left = (parts[0] || '').trim();
                            const right = (parts.slice(1).join('=') || '').trim();
                            return /\d/.test(left) && /\d/.test(right);
                          });
                        const alertNums = onlyNums
                          .map((l) => {
                            const idx = l.indexOf('=');
                            if (idx < 0) return l;
                            const left = l.slice(0, idx).trim();
                            const right = l.slice(idx + 1).trim();
                            return `${left}==>${right}`;
                          })
                          .join('\n')
                          .trim();
                        const finalMessage = alertNums
                          ? `${sharedata} \t ............ \nAmount=${total}\n\n!မရ!\n${alertNums}`
                          : `${sharedata} \t ............ \nAmount=${total}`;
                        Share.share(
                          {
                            message: finalMessage,
                          },
                          {
                            // Android only:
                            dialogTitle:
                                this.state.lg == "uni"
                                  ? "စာပို့ရန်"
                                  : "စာပို႔ရန္",
                          }
                        );
                      } else {
                        let tempUnit =
                          this.state.printType == "unit"
                            ? this.state.alertInfo.shareData[i].Unit
                            : this.state.alertInfo.shareData[i].Unit *
                              this.state.alertInfo.shareData[i].UnitPrice;
                        total += tempUnit;
                        sharedata =
                          sharedata +
                          this.state.alertInfo.shareData[i].Num +
                          "=" +
                          tempUnit +
                          "\n";
                      }
                    }
                    this.setState({
                      alertInfo:{
                        ...this.state.alertInfo
                      }
                    })
                  }}
                  style={{
                    borderRadius: 5,
                    flex: 1,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: Color.Historyshipcove,
                    marginRight:5
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "500", color: "white" }}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
              )}

              {this.state.alertInfo.showOver && (
                <TouchableOpacity
                  onPress={() => {
                    this.OverSale(true, "3D", this.state.alertInfo.overSale);
                    this.setState({
                      alertInfo: {
                        showModal: false,
                        alertMsg: "",
                        showPrint: false,
                        shareData: [],
                        showOver: false,
                        overSale: null,
                      },
                    });
                  }}
                  style={{
                    borderRadius: 5,
                    flex: 1,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: Color.Green,
                    marginRight: 5,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "500", color: "white" }}
                  >
                    Over ပြန်တင်ရန်
                  </Text>
                </TouchableOpacity>
              )}

            </View>
          </View>
        </View>
      </Modal>
    );
  }

    renderSendModal(){
      return(
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.send_modal_show}
            onRequestClose={() => {}}>
              <View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#11030085"}}>
                <View style={{width:Math.round(Dimensions.get("window").width*0.85)
                  ,height:height*0.5
                  ,backgroundColor:"#fff",borderRadius:10,alignItems:'center',justifyContent:'center'}}>
                  <View style={{width:width*0.75,height:height*0.08,justifyContent:'center',alignItems:'center',marginHorizontal:width*0.05}}>
                    <Picker
                      mode='dropdown'
                      selectedValue={this.state.userid}
                      style={{ height:height*0.08, width:(width*0.5)}}
                      onValueChange={(itemValue, itemIndex) =>{
                        let i=this.state.user.findIndex(x => x.UserID==itemValue);
                        this.setState({userid:itemValue,termDetails:[],discount:this.state.user[i].Discount3D})
                      }
                      }>
                      {this.renderUsers()}
                    </Picker>
                  </View>
                  <View style={styles.biginputWrap}>
                    <TextInput
                      placeholder           = ""
                      style                 = {styles.input}
                      placeholderTextColor  = "#000"
                      underlineColorAndroid = "transparent"
                      tintColor             = "#262626"
                      //maxLength={100}
                      multiline={true}
                      value={this.state.bigtext}
                      onChangeText          = {(text)=>this.setState({bigtext:text})}
                    />
                  </View>
                  <View style={styles.inputWrap}>
                    <TextInput
                      placeholder           = "အမည်ထည့်ရန်"
                      style                 = {styles.input}
                      placeholderTextColor  = "#000"
                      underlineColorAndroid = "transparent"
                      tintColor             = "#262626"
                      value={this.state.smalltext}
                      onChangeText          = {(text)=>this.setState({smalltext:text})}
                    />
                  </View>
                  <View style={{width:width*0.75,height:height*0.08,justifyContent:'space-between'
                  ,alignItems:'center',marginHorizontal:width*0.05,flexDirection:'row',marginTop:10}}
                    >
                    <TouchableOpacity onPress={()=>{
                        this.setState({send_modal_show:false})
                      }} style={{paddingHorizontal:15,paddingVertical:4,backgroundColor:'red',borderRadius:5}}>
                      <Text style={{fontSize:14,fontWeight:'bold',color:'white'}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{
                      this.setState({send_modal_show:false,loading:true})

                      console.warn(JSON.stringify({
                        bodySMS:this.state.bigtext
                     }));
                     console.warn(this.props.navigation.state.params.termdetailsid);


                      dal.sendSms(this.props.navigation.state.params.endpoint,this.state.userid,this.props.navigation.state.params.termdetailsid,this.state.smalltext,this.state.bigtext,(err,result)=>{
                        this.setState({loading:false,smalltext:'',bigtext:''})
                        if(!err){
                          console.warn(result)
                          Alert.alert(config.AppName,result.replace(/\\r/g,'\r').replace(/\\n/g,'\n').replace(/\"/g,''),[{text:'Ok',onPress:()=>{
                          }}])
                        }
                      })
                      }} style={{paddingHorizontal:30,paddingVertical:4,backgroundColor:Color.Green,borderRadius:5}}>
                      <Text style={{fontSize:14,fontWeight:'bold',color:'#fff'}}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
            </View>
          </Modal>
      )
    }

    formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

    renderModal(){
      return(
          <Modal
          animationType="slide"
            transparent={true}
            visible={this.state.hot_modal_show}
            onRequestClose={() => {this.setState({hot_modal_show:false})}}>
              <View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#11030085"}}>
                <View style={{width:Math.round(Dimensions.get("window").width*0.85)
                  ,height:height*0.72
                  ,backgroundColor:"#fff",borderRadius:10}}>
                  <View style={{width:width*0.85,height:height*0.08,justifyContent:'center',alignItems:'center'}}>
                    <Text style={estyles.mmTitleText1}>Extra</Text>
                  </View>
                  <ScrollView style={{width:Math.round(Dimensions.get("window").width*0.85)
                  ,height:height*0.56}}>
                    <View>
                      {this.renderHotnum()}
                    </View>
                  </ScrollView>
                  <TouchableOpacity style={{width:width*0.85,height:height*0.08,justifyContent:'center',alignItems:'flex-end'}}
                    onPress={()=>{this.setState({hot_modal_show:false})}}>
                    <Text style={{marginRight:15,fontSize:20,fontWeight:'bold',color:'red'}}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
            </View>
          </Modal>
      )
    }
    renderViewModal(){
      return(
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.showViewModal}
            onRequestClose={() => {
              this.setState({
                showViewModal:false,
                viewData:[]
              })
            }}>
              <View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#11030085"}}>
                <View style={{width:Math.round(Dimensions.get("window").width*0.85)
                  ,height:height*0.9
                  ,backgroundColor:"#fff",borderRadius:10}}>
                  <View style={{width:width*0.85,height:height*0.08,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:Color.DIVIDERCOLOR}}>
                    <View style={{
                      flex:1,
                      alignItems:'center'
                    }}>
                      <Text style={estyles.mmTitleText1}>Num</Text>
                    </View>
                    <View style={{
                      flex:1,
                      alignItems:'flex-end',
                      paddingRight:10
                    }}>
                      <Text style={estyles.mmTitleText1}>Unit</Text>
                    </View>
                  </View>
                  <ScrollView style={{width:Math.round(Dimensions.get("window").width*0.85)
                  ,height:height*0.56}}>
                    <View>
                      {
                        this.state.viewData.map((value,index)=>(
                          <View 
                            style={{width:width*0.85,height:height*0.08,flexDirection:'row',
                            alignItems:'center',borderWidth:1,borderColor:Color.DIVIDERCOLOR}}
                            key={index}
                          >
                            <View style={{
                              flex:1,
                              alignItems:'center'
                            }}>
                              <Text style={estyles.mmTitleText1}>{value.Num}</Text>
                            </View>
                            <View style={{
                              flex:1,
                              alignItems:'flex-end',
                              paddingRight:10
                            }}>
                              <Text style={estyles.mmTitleText1}>{value.Unit}</Text>
                            </View>
                          </View>
                        ))
                      }
                    </View>
                  </ScrollView>
                  <TouchableOpacity style={{width:width*0.85,height:height*0.08,justifyContent:'center',alignItems:'flex-end'}}
                    onPress={()=>{
                      this.setState({
                        showViewModal:false,
                        viewData:[]
                      })
                    }}>
                    <Text style={{marginRight:15,fontSize:20,fontWeight:'bold',color:'red'}}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
            </View>
          </Modal>
      )
    }
    containsOnlyNumbers(str) {
      return /^\d+$/.test(str);
    }
    pressNum(n){
      if(var_selected=='num'){
        var_num=var_num.length<3?var_num+n:var_num+''
        this.numComponent.setNativeProps({text:var_num})
        if(var_num.length==3&&this.containsOnlyNumbers(var_num)&&(this.state.sameUnit||this.state.sameUnitR)){
          if(var_unit==''){
            this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
            this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
            var_selected='unit'
            return;
          }
          setTimeout(() => {
            this.pressOk()
          }, 200);
          
          return;
        }
        if(var_num.length==3){
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_selected='unit'
        }

      }else{
        if (clearUnit) {
          var_unit = n;
          clearUnit = false;
        } else {
          var_unit += n;
        }
        this.unitComponent.setNativeProps({text:var_unit})
      }
    }
    pressDelete(){
      if(var_selected=='num'){
        var_num='',var_chosen=''
        this.numComponent.setNativeProps({text:var_num})
      }else{
        var_unit = '';
        this.unitComponent.setNativeProps({text:var_unit})
      }
    }
    getRemainUnits(num){
      this.setState({
        loading:true
      },()=>{
        dal.getRemainUnits(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.termdetailsid,num,(err,resp)=>{
          if(err){
              Alert.alert(config.AppName,'Something went wrong!')
              this.setState({
                  loading:false,
              })
          }else{
              console.log(resp)
              if(resp&&resp.Status=='OK'&&resp.Data.length){
                  this.setState({
                      loading:false,
                      showViewModal:true,
                      viewData:resp.Data
                  })
              }else{
                  Alert.alert(config.AppName,'No Data!')
                  this.setState({
                      loading:false,
                  })
              }
          }
        })
      })
      
    }
    pressView(){
      // if(var_selected=='num'){
      //   this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
      //   this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
      //   var_selected='unit'
      // }
      // else if(var_unit==''){
      //   this.refs.err_toast.show('ထိုးလိုသောယူနစ်ထည့်ရမည်။',1000);
      // }
      //else 
      if(var_chosen==''&&var_num.length!=3){
        this.refs.err_toast.show('ဂဏန်းသုံးလုံးဖြစ်ရမည် ',1000);
      }else{
        if(var_chosen=='break'){
          var t=[]
          for(let i=0;i<10;i++){
            for(let j=0;j<10;j++){
              for(let k=0;k<10;k++){
                if(var_num==(i+j+k)||('1'+var_num)==(i+j+k)||('2'+var_num)==(i+j+k)){
                  t.push(i+''+j+''+k)
                }
              }
            }
          }
          //to call view api
          this.getRemainUnits(t.toString())
        }
        //for Reverse
        else if(var_chosen=='reverse'){
          var arr=Array.from(var_num)
          if(arr[0]==arr[1]&&arr[1]==arr[2]&&arr[0]==arr[2]){
            var t=[]
            t.push(var_num) 
            //to call view api
            this.getRemainUnits(t.toString())

          }else if(arr[0]==arr[1]||arr[0]==arr[2]||arr[1]==arr[2]){
            var t=[];
            for(let i=0;i<3;i++){
              if(i==0){
                t.push(arr[0]+arr[1]+arr[2]) 
              }else if(i==1){
                if(arr[0]==arr[1]){
                  t.push(arr[0]+arr[2]+arr[1]) 
                }else if(arr[1]==arr[2]){
                  t.push(arr[1]+arr[0]+arr[2])
                }else{
                  t.push(arr[0]+arr[2]+arr[1])
                }
                
              }else{
                if(arr[0]==arr[1]){
                  t.push(arr[2]+arr[0]+arr[1])
                }else if(arr[1]==arr[2]){
                  t.push(arr[1]+arr[2]+arr[0])
                }else{
                  t.push(arr[1]+arr[2]+arr[0])
                }
              }
            }
            //to call view api
            this.getRemainUnits(t.toString())
          }else{
            var t=[];
            for(let i=0;i<6;i++){
              if(i==0){
                t.push(arr[0]+arr[1]+arr[2]) 
              }else if(i==1){
                t.push(arr[0]+arr[2]+arr[1])
              }else if(i==2){
                t.push(arr[1]+arr[0]+arr[2])
              }else if(i==3){
                t.push(arr[1]+arr[2]+arr[0])
              }else if(i==4){
                t.push(arr[2]+arr[0]+arr[1])
              }else {
                t.push(arr[2]+arr[1]+arr[0])
              }
            } 
            //to call view api
            this.getRemainUnits(t.toString())
          }
        }
        //for remain reverse
        else if(var_chosen=='remain'){
          var arr=Array.from(var_num)
          if(arr[0]==arr[1]&&arr[1]==arr[2]&&arr[0]==arr[2]){
            this.refs.err_toast.show('ဂဏန္းသံုးလံုးစလံုးမတူရပါ။',1000)
          }else if(arr[0]==arr[1]||arr[0]==arr[2]||arr[1]==arr[2]){
            var t=[];
              for(let i=0;i<2;i++){
                if(i==0){
                  t.push(arr[0]==arr[1]?arr[2]+arr[1]+arr[0]:arr[1]+arr[0]+arr[2])
                }else{
                  t.push(arr[0]==arr[2]?arr[2]+arr[0]+arr[1]:arr[1]+arr[2]+arr[0])
                }
              }
              //to call view api
              this.getRemainUnits(t.toString())
          }else{
            var t=[];
            for(let i=0;i<5;i++){
              if(i==0){
                t.push(arr[0]+arr[2]+arr[1])
              }else if(i==1){
                t.push(arr[1]+arr[0]+arr[2])
              }else if(i==2){
                t.push(arr[1]+arr[2]+arr[0])
              }else if(i==3){
                t.push(arr[2]+arr[0]+arr[1])
              }else {
                t.push(arr[2]+arr[1]+arr[0])
              }
            }
            //to call view api
            this.getRemainUnits(t.toString())
          }
        }
        //for front
        else if(var_chosen=='front'){
          var t=[];
          for(let i=0;i<10;i++){
            t.push(i+var_num)
          }
          //to call view api
          this.getRemainUnits(t.toString())
        }
        //for mid
        else if(var_chosen=='mid'){
          var t=[];
          for(let i=0;i<10;i++){
              t.push(Array.from(var_num)[0]+i+Array.from(var_num)[1])
          }
          //to call view api
          this.getRemainUnits(t.toString())
        }
        //for back
        else if(var_chosen=='back'){
          var t=[];
          for(let i=0;i<10;i++){
            t.push(var_num+i)
          }
          //to call view api
          this.getRemainUnits(t.toString())
        }
        //for tri
        else if(var_chosen=='tri'){
          var t=[];
          for(let i=0;i<10;i++){
            t.push(i+''+i+''+i)
          }
          //to call view api
          this.getRemainUnits(t.toString())
        }else{
          if(var_num.length!=3){
            this.refs.err_toast.show('ဂဏန်းသုံးလုံးဖြစ်ရမည် ',1000);
          }else{
            var t=[];
            t.push(var_num)
            //to call view api
            this.getRemainUnits(t.toString())
          }   
        }
      }
    }
    pressOk(){
      if(var_selected=='num'&&!this.state.sameUnit&&!this.state.sameUnitR){
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_selected='unit'
      }else if(var_unit==''){
        this.refs.err_toast.show('ထိုးလိုသောယူနစ်ထည့်ရမည်။',1000);
      }else if(var_chosen==''&&var_num.length!=3){
        this.refs.err_toast.show('ဂဏန်းသုံးလုံးဖြစ်ရမည် ',1000);
      }else{
        if(var_chosen=='break'){
          var t=[]
          UUIDGenerator.getRandomUUID().then((uuid) => {
            for(let i=0;i<10;i++){
              for(let j=0;j<10;j++){
                for(let k=0;k<10;k++){
                  if(var_num==(i+j+k)||('1'+var_num)==(i+j+k)||('2'+var_num)==(i+j+k)){
                    t.push({num:i+''+j+''+k,unit:var_unit,summary:var_num+'B',
                    discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:i==0&&j==0?false:true,showsummary:i==0&&j==0?true:false})
                  }
                }
              }
            }
            let __data = this.state.dataProvider.getAllData();
            this.setState(
              {
                dataProvider: dataProvider.cloneWithRows(
                  t.concat(__data),
                ),
                data: this.state.data.concat(t),
                dataforSwap: t.concat(__data),
            },()=>{
              this.refs.toast.show(var_num+'B'+' = '+var_unit,1000);
              this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
              this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
              var_selected='num',var_chosen='',clearUnit = true,var_num=''
              this.numComponent.setNativeProps({text:var_num})
              this.unitComponent.setNativeProps({text:var_unit})
            })
            // thi
          });
        }
        //for Reverse
        else if(var_chosen=='reverse'){
          var arr=Array.from(var_num)
          if(arr[0]==arr[1]&&arr[1]==arr[2]&&arr[0]==arr[2]){
            var t=[]
            UUIDGenerator.getRandomUUID().then((uuid) => {
              t.push({num:var_num,unit:var_unit,summary:var_num,
              discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true})  

              let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show(var_num+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })

            });

          }else if(arr[0]==arr[1]||arr[0]==arr[2]||arr[1]==arr[2]){
            var t=[];
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for(let i=0;i<3;i++){
                if(i==0){
                  t.push({num:arr[0]+arr[1]+arr[2],unit:var_unit,summary:var_num+'R',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true}) 
                }else if(i==1){
                  if(arr[0]==arr[1]){
                    t.push({num:arr[0]+arr[2]+arr[1],unit:var_unit,summary:var_num+'R',
                    discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false}) 
                  }else if(arr[1]==arr[2]){
                    t.push({num:arr[1]+arr[0]+arr[2],unit:var_unit,summary:var_num+'R',
                    discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                  }else{
                    t.push({num:arr[0]+arr[2]+arr[1],unit:var_unit,summary:var_num+'R'
                    ,discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                  }
                  
                }else{
                  if(arr[0]==arr[1]){
                    t.push({num:arr[2]+arr[0]+arr[1],unit:var_unit,summary:var_num+'R',
                    discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                  }else if(arr[1]==arr[2]){
                    t.push({num:arr[1]+arr[2]+arr[0],unit:var_unit,summary:var_num+'R',
                    discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                  }else{
                    t.push({num:arr[1]+arr[2]+arr[0],unit:var_unit,summary:var_num+'R',
                    discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                  }
                }
              }
              let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show(var_num+'R'+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
            });
          }else{
            var t=[];
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for(let i=0;i<6;i++){
                if(i==0){
                  t.push({num:arr[0]+arr[1]+arr[2],unit:var_unit,summary:var_num+'R',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true}) 
                }else if(i==1){
                  t.push({num:arr[0]+arr[2]+arr[1],unit:var_unit,summary:var_num+'R',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }else if(i==2){
                  t.push({num:arr[1]+arr[0]+arr[2],unit:var_unit,summary:var_num+'R',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }else if(i==3){
                  t.push({num:arr[1]+arr[2]+arr[0],unit:var_unit,summary:var_num+'R',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }else if(i==4){
                  t.push({num:arr[2]+arr[0]+arr[1],unit:var_unit,summary:var_num+'R',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }else {
                  t.push({num:arr[2]+arr[1]+arr[0],unit:var_unit,summary:var_num+'R',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }
              } 
              let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show(var_num+'R'+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
            });
            
          }
        }
        //for remain reverse
        else if(var_chosen=='remain'){
          var arr=Array.from(var_num)
          if(arr[0]==arr[1]&&arr[1]==arr[2]&&arr[0]==arr[2]){
            this.refs.err_toast.show('ဂဏန္းသံုးလံုးစလံုးမတူရပါ။',1000)
          }else if(arr[0]==arr[1]||arr[0]==arr[2]||arr[1]==arr[2]){
            var t=[];
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for(let i=0;i<2;i++){
                if(i==0){
                  t.push({num:arr[0]==arr[1]?arr[2]+arr[1]+arr[0]:arr[1]+arr[0]+arr[2],unit:var_unit,summary:var_num+'RR'
                  ,discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true})
                }else{
                  t.push({num:arr[0]==arr[2]?arr[2]+arr[0]+arr[1]:arr[1]+arr[2]+arr[0],unit:var_unit,summary:var_num+'RR'
                  ,discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }
              }
              let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show(var_num+'RR'+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
            });
            
          }else{
            var t=[];
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for(let i=0;i<5;i++){
                if(i==0){
                  t.push({num:arr[0]+arr[2]+arr[1],unit:var_unit,summary:var_num+'RR',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true})
                }else if(i==1){
                  t.push({num:arr[1]+arr[0]+arr[2],unit:var_unit,summary:var_num+'RR',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }else if(i==2){
                  t.push({num:arr[1]+arr[2]+arr[0],unit:var_unit,summary:var_num+'RR',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }else if(i==3){
                  t.push({num:arr[2]+arr[0]+arr[1],unit:var_unit,summary:var_num+'RR',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }else {
                  t.push({num:arr[2]+arr[1]+arr[0],unit:var_unit,summary:var_num+'RR',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }
              }
              let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show(var_num+'RR'+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
            });
          }
        }
        //for front
        else if(var_chosen=='front'){
          var t=[];
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for(let i=0;i<10;i++){
                if(i==0){
                  t.push({num:i+var_num,unit:var_unit,summary:'*'+var_num,
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true})
                }else{
                  t.push({num:i+var_num,unit:var_unit,summary:'*'+var_num,
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }
              }
              let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show('*'+var_num+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
            });
        }
        //for mid
        else if(var_chosen=='mid'){
          var t=[];
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for(let i=0;i<10;i++){
                if(i==0){
                  t.push({num:Array.from(var_num)[0]+i+Array.from(var_num)[1],unit:var_unit,
                    summary:Array.from(var_num)[0]+'*'+Array.from(var_num)[1],
                    discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true})
                }else{
                  t.push({num:Array.from(var_num)[0]+i+Array.from(var_num)[1],unit:var_unit,
                    summary:Array.from(var_num)[0]+'*'+Array.from(var_num)[1],
                    discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }
              }
              let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show(Array.from(var_num)[0]+'*'+Array.from(var_num)[1]+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
            });
        }
        //for back
        else if(var_chosen=='back'){
          var t=[];
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for(let i=0;i<10;i++){
                if(i==0){
                  t.push({num:var_num+i,unit:var_unit,summary:var_num+'*',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true})
                }else{
                  t.push({num:var_num+i,unit:var_unit,summary:var_num+'*',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }
              }
              let __data = this.state.dataProvider.getAllData();
              this.setState(
                {
                  dataProvider: dataProvider.cloneWithRows(
                    t.concat(__data),
                  ),
                  data: this.state.data.concat(t),
                  dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show(var_num+'*'+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
            });
        }
        //for tri
        else if(var_chosen=='tri'){
          var t=[];
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for(let i=0;i<10;i++){
                if(i==0){
                  t.push({num:i+''+i+''+i,unit:var_unit,summary:'T'
                  ,discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true})
                }else{
                  t.push({num:i+''+i+''+i,unit:var_unit,summary:'T',
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                }
              }
              let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show('T'+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
            });
        }else{
          if(var_num.length!=3){
            this.refs.err_toast.show('ဂဏန်းသုံးလုံးဖြစ်ရမည် ',1000);
          }else{
            if(this.state.sameUnitR){
              var arr=Array.from(var_num)
              if(arr[0]==arr[1]&&arr[1]==arr[2]&&arr[0]==arr[2]){
                var t=[]
                UUIDGenerator.getRandomUUID().then((uuid) => {
                  t.push({num:var_num,unit:var_unit,summary:var_num,
                  discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true})  

                  let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
                  },()=>{
                    this.refs.toast.show(var_num+' = '+var_unit,1000);
                    this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                    this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                    var_selected='num',var_chosen='',clearUnit = true,var_num=''
                    this.numComponent.setNativeProps({text:var_num})
                    this.unitComponent.setNativeProps({text:var_unit})
                  })

                });

              }else if(arr[0]==arr[1]||arr[0]==arr[2]||arr[1]==arr[2]){
                var t=[];
                UUIDGenerator.getRandomUUID().then((uuid) => {
                  for(let i=0;i<3;i++){
                    if(i==0){
                      t.push({num:arr[0]+arr[1]+arr[2],unit:var_unit,summary:var_num+'R',
                      discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true}) 
                    }else if(i==1){
                      if(arr[0]==arr[1]){
                        t.push({num:arr[0]+arr[2]+arr[1],unit:var_unit,summary:var_num+'R',
                        discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false}) 
                      }else if(arr[1]==arr[2]){
                        t.push({num:arr[1]+arr[0]+arr[2],unit:var_unit,summary:var_num+'R',
                        discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                      }else{
                        t.push({num:arr[0]+arr[2]+arr[1],unit:var_unit,summary:var_num+'R'
                        ,discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                      }
                      
                    }else{
                      if(arr[0]==arr[1]){
                        t.push({num:arr[2]+arr[0]+arr[1],unit:var_unit,summary:var_num+'R',
                        discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                      }else if(arr[1]==arr[2]){
                        t.push({num:arr[1]+arr[2]+arr[0],unit:var_unit,summary:var_num+'R',
                        discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                      }else{
                        t.push({num:arr[1]+arr[2]+arr[0],unit:var_unit,summary:var_num+'R',
                        discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                      }
                    }
                  }
                  let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
                  },()=>{
                    this.refs.toast.show(var_num+'R'+' = '+var_unit,1000);
                    this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                    this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                    var_selected='num',var_chosen='',clearUnit = true,var_num=''
                    this.numComponent.setNativeProps({text:var_num})
                    this.unitComponent.setNativeProps({text:var_unit})
                  })
                });
              }else{
                var t=[];
                UUIDGenerator.getRandomUUID().then((uuid) => {
                  for(let i=0;i<6;i++){
                    if(i==0){
                      t.push({num:arr[0]+arr[1]+arr[2],unit:var_unit,summary:var_num+'R',
                      discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:false,showsummary:true}) 
                    }else if(i==1){
                      t.push({num:arr[0]+arr[2]+arr[1],unit:var_unit,summary:var_num+'R',
                      discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                    }else if(i==2){
                      t.push({num:arr[1]+arr[0]+arr[2],unit:var_unit,summary:var_num+'R',
                      discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                    }else if(i==3){
                      t.push({num:arr[1]+arr[2]+arr[0],unit:var_unit,summary:var_num+'R',
                      discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                    }else if(i==4){
                      t.push({num:arr[2]+arr[0]+arr[1],unit:var_unit,summary:var_num+'R',
                      discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                    }else {
                      t.push({num:arr[2]+arr[1]+arr[0],unit:var_unit,summary:var_num+'R',
                      discount:this.state.discount,GroupID:uuid,GroupID2:uuid,delete:true,showsummary:false})
                    }
                  } 
                  let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
                  },()=>{
                    this.refs.toast.show(var_num+'R'+' = '+var_unit,1000);
                    this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                    this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                    var_selected='num',var_chosen='',clearUnit = true,var_num=''
                    this.numComponent.setNativeProps({text:var_num})
                    this.unitComponent.setNativeProps({text:var_unit})
                  })
                });
                
              }
              return;
            }
            if(this.state.sameUnit){
              var t=[];
              t.push({num:var_num,unit:var_unit,summary:var_num
                ,discount:this.state.discount,GroupID:'',GroupID2:moment().unix(),delete:false,showsummary:true})
                let __data = this.state.dataProvider.getAllData();
                this.setState(
                  {
                    dataProvider: dataProvider.cloneWithRows(
                      t.concat(__data),
                    ),
                    data: this.state.data.concat(t),
                    dataforSwap: t.concat(__data),
              },()=>{
                this.refs.toast.show(var_num+' = '+var_unit,1000);
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num',var_chosen='',clearUnit = true,var_num=''
                this.numComponent.setNativeProps({text:var_num})
                this.unitComponent.setNativeProps({text:var_unit})
              })
              return;
            }
            var t=[];
            t.push({num:var_num,unit:var_unit,summary:var_num
              ,discount:this.state.discount,GroupID:'',GroupID2:moment().unix(),delete:false,showsummary:true})
              let __data = this.state.dataProvider.getAllData();
              this.setState(
                {
                  dataProvider: dataProvider.cloneWithRows(
                    t.concat(__data),
                  ),
                  data: this.state.data.concat(t),
                  dataforSwap: t.concat(__data),
            },()=>{
              this.refs.toast.show(var_num+' = '+var_unit,1000);
              this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
              this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
              var_selected='num',var_chosen='',clearUnit = true,var_num=''
              this.numComponent.setNativeProps({text:var_num})
              this.unitComponent.setNativeProps({text:var_unit})
            })
          }   
        }
        if(!this.state.value){
          this._animateTo(0)
        }
      }
    }
    pressBreak(){
      var_chosen=''
      if(var_num.length!=1){
        this.refs.err_toast.show('ဘရိတ်ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။',1000);
      }else{
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_chosen='break',var_selected='unit'
        this.numComponent.setNativeProps({text:var_num+'B'})
      }
    }
    pressRemainReverse(){
      if(var_num.length!=3){
        this.refs.err_toast.show('ဂဏန်းသုံးလုံးထည့်ရမည်။',1000);
      }else{
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_chosen='remain',var_selected='unit'
        this.numComponent.setNativeProps({text:var_num+'RR'})
      }
    }
    pressReverse(){
      if(var_num.length!=3){
        this.refs.err_toast.show('ဂဏန်းသုံးလုံးထည့်ရမည်။',1000);
      }else{
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_chosen='reverse',var_selected='unit'
        this.numComponent.setNativeProps({text:var_num+'R'})
      }
    }
    pressTri(){
      if(var_num.length!=0){
        var_num=''
      }
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_chosen='tri',var_selected='unit'
        this.numComponent.setNativeProps({text:"T"})
    }
    pressFront(){
      if(var_num.length!=2){
        this.refs.err_toast.show('ဂဏန်းနှစ်လုံးသာထည့်ရမည်။',1000);
      }else{
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_chosen='front',var_selected='unit'
        this.numComponent.setNativeProps({text:"*"+var_num})
      }
    }
    pressMid(){
      if(var_num.length!=2){
        this.refs.err_toast.show('ဂဏန်းနှစ်လုံးသာထည့်ရမည်။',1000);
      }else{
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_chosen='mid',var_selected='unit'
        this.numComponent.setNativeProps({text:Array.from(var_num)[0]+"*"+Array.from(var_num)[1]})
      }
    }
    pressBack(){
      if(var_num.length!=2){
        this.refs.err_toast.show('ဂဏန်းနှစ်လုံးသာထည့်ရမည်။',1000);
      }else{
        this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
        this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
        var_chosen='back',var_selected='unit'
        this.numComponent.setNativeProps({text:var_num+"*"})
      }
    }
    _rowRenderer(type, item,index) {
      return (
        <View style={{flexDirection:'row',borderWidth:0.5,borderBottomColor:'gray',height:height*0.08}}>
          <View style={{flex:1.5,justifyContent:'center',alignItems:'center'}}>
            <Text style={[estyles.dataText]}>{this.state.data.length-index}</Text>
          </View>
          <View style={{flex:2,justifyContent:'center',alignItems:'center'}}>
            <Text style={estyles.dataText}>{item.num}</Text>
          </View >
          <View style={{flex:3,justifyContent:'center',alignItems:'center'}}>
            <Text style={estyles.dataText}>{item.delete?'':item.unit}</Text>
          </View>
          <View style={{flex:2.2,justifyContent:'center',alignItems:'center'}}>
            <Text style={estyles.dataText}>{item.showsummary?item.summary:''}</Text>
          </View>
          <TouchableOpacity style={{flex:1.3,justifyContent:'center',alignItems:'center'}}
            onPress={()=>{
              Alert.alert(
              config.AppName,
              'ဂဏန်းဖျက်ရန်',
              item.GroupID == '' ?
                [
                  {
                    text: 'CANCEL',
                    onPress: () => {
                      console.warn('cancel');
                    },
                  },
                  {
                    text: 'ONE',
                    onPress: () => {
                      this.getDeletebyInvidual(item.GroupID2, index, item.num);
                    },
                  },
                ] : [
                  {
                    text: 'CANCEL',
                    onPress: () => {
                      console.warn('cancel');
                    },
                  },
                  {
                    text: 'GROUP',
                    onPress: () => {
                      this.getDeletebyGroup(item.GroupID2, index, item.num);
                    },
                  },
                  {
                    text: 'ONE',
                    onPress: () => {
                      this.getDeletebyInvidual(item.GroupID2, index, item.num);
                    },
                  },
                ],
            );
              
            }}>
            <Image source={delete_icon} style={{width:height*0.032,height:height*0.032,resizeMode:'contain'}}/>
          </TouchableOpacity>
        </View>
      );
    }
  _shouldItemUpdate = (prev, next) => {
      return prev.item !== next.item;
  }
  renderMarqueeText(){
    let msg=''
    this.state.hotnum.map((value,index)=>{
      msg+=value.Num+', '
    })
    return(
      <View style={{
        backgroundColor:Color.Green,
        width:width,
        height:30
      }}>
        <TextMarquee
            style={{ fontSize: 21,color:'#1b1b1b',fontWeight:'bold'}}
            duration={msg.length>50?msg.length*200:msg.length*250}
            loop
            repeatSpacer={100}
            marqueeDelay={1000}
          >
            {msg}
          </TextMarquee>
      </View>
    )
  }
  render() {
    return (
        <View style={styles.container}>
          {this.renderCombineModal()}
          {this.renderHeader()}
          {this.renderMarqueeText()}
          {this.renderTitle()}
          <View style={{height:((height*0.76)-(StatusBar.currentHeight+30)),width:width,backgroundColor:'#fff'}}> 
          <RecyclerListView layoutProvider={this._layoutProvider} 
            dataProvider={this.state.dataProvider} 
            ref={ref => this.flatList = ref}
            rowRenderer={this._rowRenderer} 
            extendedState={this.state.dataProvider}
            // style={{
            //   transform: [
            //     { ScaleY: -1},
            //   ]
            // }}
            
            />
          </View>
          {this.renderModal()}
          {this.renderSaveModal()}
          {this.renderSendModal()}
          {this.renderDirectBuyModal()}
          {this.renderButtons()}
          {this.renderViewModal()}
          {this.renderBuyNumModal()}
          {this.renderOverModal()}
          <Animated.View style={{position:'absolute',bottom:0,left:0,right:0,
            width:width,height:this._width,backgroundColor:Color.lightGray}}>
            <View style={{width:width,height:height*0.05,flexDirection:'row'}}>
              <View style={{flex:1,alignItems:'center',marginLeft:8,flexDirection:'row'}}>
              <TouchableOpacity style={{
                  flexDirection:'row',
                  alignItems:'center'
                }}
                onPress={()=>{
                  if(this.state.sameUnit){
                    this.setState({
                      sameUnit:false
                    })
                  }else{
                    this.setState({
                      sameUnit:true,
                      sameUnitR:false
                    })
                  }
                }}
                >
                  <Image style={{width:20,height:20,marginRight:4}}source={this.state.sameUnit?tickIcon:untickIcon}/>
                  <Text style={{fontSize:14,fontWeight:'bold',color:Color.PRIMARYCOLOR}}>နှုန်းတူ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                  flexDirection:'row',
                  alignItems:'center',
                  marginHorizontal:8
                }}
                onPress={()=>{
                  if(this.state.sameUnitR){
                    this.setState({
                      sameUnitR:false
                    })
                  }else{
                    this.setState({
                      sameUnitR:true,
                      sameUnit:false
                    })
                  }
                }}
                >
                  <Image style={{width:20,height:20,marginRight:4}}source={this.state.sameUnitR?tickIcon:untickIcon}/>
                  <Text style={{fontSize:14,fontWeight:'bold',color:Color.PRIMARYCOLOR}}>နှုန်းတူR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingHorizontal:14,
                    marginLeft:8,
                    borderRadius:5,
                    paddingVertical:4,
                    backgroundColor:Color.PRIMARYCOLOR
                  }}
                  onPress={()=>{
                    this.pressView()
                  }}
                >
                  <Text style={{fontSize:14,fontWeight:'bold',color:'white'}}>?ကျန်</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingHorizontal:14,
                    marginLeft:8,
                    borderRadius:5,
                    paddingVertical:4,
                    backgroundColor:Color.PRIMARYCOLOR
                  }}
                  onPress={()=>{
                    this.APISlipDetail(this.props.navigation.state.params.termdetailsid,var_num)
                  }}
                >
                  <Text style={{fontSize:14,fontWeight:'bold',color:'white'}}>...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingHorizontal:14,
                    marginLeft:8,
                    borderRadius:5,
                    paddingVertical:4,
                    backgroundColor:'blue'
                  }}
                  onPress={()=>{
                    console.warn('Data============'+this.state.data.length)
                    var_total_unit = this.getTotalUnit()
                    console.warn('var_total_unit===>'+var_total_unit)
                    console.warn('UnitPrice='+this.state.unitPrice)
                    console.warn('Discount'+this.state.discount)
                    if(this.state.data.length>0){
                    this.setState({ bet_modal_show: true })
                    }
                  }}
                >
                  <Text style={{fontSize:14,fontWeight:'bold',color:'white'}}>Save</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{justifyContent:'center',alignItems:'flex-end'}}
                onPress={this._animateTo.bind(this,0)}>
                <Image source={close} style={{width:height*0.032,height:height*0.032,tintColor:'red',marginRight:8}}/>
              </TouchableOpacity>
            </View>
            
            <View style={{width:width,height:height*0.09,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
              <View style={{justifyContent:'center',alignItems:'center',marginLeft:5,fontSize:15}}>
                <Text style={{fontSize:18,fontWeight:'bold',color:'black'}}>ဂဏန်း</Text>
              </View>

              <TouchableWithoutFeedback onPress={()=>{
                this.numViewComponent.setNativeProps({style:{borderColor:"red"}})
                this.unitViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                var_selected='num'
                }} style={{flex:1}}>
                <View style={{flex:1,justifyContent:'center',alignItems:'center',
                  marginLeft:5,borderColor:'red',borderRadius:5,borderWidth:2,}}
                  ref={component=>this.numViewComponent=component}>
                  <TextInput editable={false} ref={component=>this.numComponent=component}
                  underlineColorAndroid='transparent'
                  style={estyles.txtInput}/>
                </View>
              </TouchableWithoutFeedback>
              
              <View style={{justifyContent:'center',alignItems:'center',marginLeft:5}}>
                <Text style={{fontSize:18,fontWeight:'bold',color:'black'}}>ယူနစ်</Text>
              </View>

              <TouchableWithoutFeedback onPress={()=>{
                this.numViewComponent.setNativeProps({style:{borderColor:Color.defaultGray}})
                this.unitViewComponent.setNativeProps({style:{borderColor:"red"}})
                var_selected='unit'
                }} style={{flex:1}}>
                <View style={{flex:1,justifyContent:'center',alignItems:'center',
                  marginLeft:5,borderColor:Color.defaultGray,borderRadius:5,borderWidth:2,}}
                  ref={component=>this.unitViewComponent=component}>
                  <TextInput editable={false} ref={component=>this.unitComponent=component} 
                  underlineColorAndroid='transparent'
                  style={estyles.txtInput}/>
                </View>
              </TouchableWithoutFeedback>
              
            </View>
            <View style={{width:width,height:height*0.09,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressFront.bind(this)}>
                <Text style={estyles.mmText}>ရှေ့စီးရီး</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressMid.bind(this)}>
                <Text style={estyles.mmText}>လယ်စီးရီး</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressBack.bind(this)}>
                <Text style={estyles.mmText}>နောက်စီးရီး</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginHorizontal:5,backgroundColor:Color.lightGreen,borderRadius:5}}
                onPress={this.pressBreak.bind(this)}>
                <Text style={estyles.mmText}>ဘရိတ်</Text>
              </TouchableOpacity>
            </View>
            <View style={{width:width,height:height*0.09,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'7')}>
                <Text style={estyles.NumText}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'8')}>
                <Text style={estyles.NumText}>8</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'9')}>
                <Text style={estyles.NumText}>9</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginHorizontal:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressTri.bind(this)}>
                <Text style={estyles.mmText}>ထွိုင်</Text>
              </TouchableOpacity>
            </View>
            <View style={{width:width,height:height*0.09,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
                onPress={this.pressNum.bind(this,'4')}>
                <Text style={estyles.NumText}>4</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'5')}>
                <Text style={estyles.NumText}>5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'6')}>
                <Text style={estyles.NumText}>6</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginHorizontal:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressRemainReverse.bind(this)}>
                <Text style={estyles.mmText}>ကျံR</Text>
              </TouchableOpacity>
            </View>
            <View style={{width:width,height:height*0.09,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'1')}>
                <Text style={estyles.NumText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'2')}>
                <Text style={estyles.NumText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'3')}>
                <Text style={estyles.NumText}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginHorizontal:5,backgroundColor:Color.lightGreen,borderRadius:5}}
                onPress={this.pressReverse.bind(this)}>
                <Text style={estyles.NumText}>R</Text>
              </TouchableOpacity>
            </View>
            <View style={{width:width,height:height*0.09,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'0')}>
                <Text style={estyles.NumText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
              onPress={this.pressNum.bind(this,'00')}>
                <Text style={estyles.NumText}>00</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginLeft:5,backgroundColor:Color.lightGreen,borderRadius:5}}
               onPress={this.pressDelete.bind(this)}>
                <Text style={estyles.NumText}>DEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:(width*0.25)-6.25,height:height*0.07,justifyContent:'center',alignItems:'center',marginHorizontal:5,backgroundColor:Color.lightGreen,borderRadius:5}}
                onPress={this.pressOk.bind(this)}>
                <Text style={estyles.NumText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          <Toast
              ref="toast"
              style={{backgroundColor:'black'}}
              position='top'
              positionValue={200}
              fadeInDuration={750}
              fadeOutDuration={1000}
              opacity={0.8}
              textStyle={{color:'white'}}
              />
          <Toast
              ref="err_toast"
              style={{backgroundColor:'red'}}
              position='top'
              positionValue={200}
              fadeInDuration={750}
              fadeOutDuration={1000}
              opacity={0.8}
              textStyle={{color:'white'}}
          />
          <Loading show={this.state.loading}/>
        </View>
        
            
    );
  }
}
const estyles = EStyleSheet.create({
  NumText:{
    fontSize:'20rem',
    fontWeight:'bold',
    color:'#000'
  },
  mmText:{
    fontSize:'14rem',
    color:'#000',
  },
  mmLargeText:{
    fontSize:'18rem',
    color:'#000',
  },
  btnText:{
    fontSize:'14rem',
    color:'#fff',
  },
  mmTitleText:{
    fontSize:'18rem',
    color:'#fff',
  },
  mmTitleText1:{
    fontSize:'18rem',
    color:'#000',
  },
  dataText:{
    fontSize:'18rem',
    color:'#000',
    fontWeight:'bold'
  },
  headerText:{
    fontSize:'16rem',color:'#fff'
  },
  txtInput:{
    color:"#000",
    fontWeight:'bold',
    paddingVertical:4
    ,fontSize:'20rem',textAlign:'center'}
});
const styles = StyleSheet.create({
  container: {
    flex           : 1,
    backgroundColor: "#fff",
  },
  header:{
    height:height*0.08,
    width:null,
    alignItems: 'center',
    flexDirection: 'row',
  },
  biginputWrap:{
    flexDirection  : "row",
    height         : height*0.24,
    width:width*0.75,
    marginHorizontal:width*0.05,
    backgroundColor: Color.lightGray,
    borderRadius:5,
    marginVertical: 5,
  },
  inputWrap:{
    flexDirection  : "row",
    height         : height*0.07,
    width:width*0.75,
    marginHorizontal:width*0.05,
    backgroundColor: Color.lightGray,
    borderRadius:5
  },
  
  input:{
    flex             : 1,
    paddingHorizontal: 10,
    backgroundColor  : "transparent",
    color            : "#262626",
    fontSize         : 13,
  },
});

module.exports = sale;



