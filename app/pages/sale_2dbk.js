/**
 * Sample React Native App
 * https:   //github.com/facebook/react-native
 * @flow
 * TODO:
 * FIXME:
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
  BackHandler,
  ListView,
  Modal,
  Picker,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import TextMarquee from '../components/textmarquee.js'
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import Toast, { DURATION } from 'react-native-easy-toast'
import Switch from 'react-native-switch-pro'
import dal from '../dal.js';
import plusIcon from '../assets/images/plus.png';
import tickIcon from '../assets/images/tick.png';
import untickIcon from '../assets/images/untick.png';
import Color from '../utils/Color.js'
import UUIDGenerator from 'react-native-uuid-generator';
const { width, height } = Dimensions.get('window')
import back from "../assets/images/backward.png";
import close from "../assets/images/error.png";
import delete_icon from "../assets/images/delete.png";
import EStyleSheet from 'react-native-extended-stylesheet';
import config from '../config/config.js'
import word from './data.json'
var Open = false
EStyleSheet.build({ $rem: width / 380 });
var Open = false, var_num = "", var_unit = "", var_chosen = '', var_selected = 'num', var_total_unit = 0, click_back = 0, clearUnit = false
var _data = require('./data.json');
let dataProvider = new DataProvider((r1, r2) => {
  return r1 === r2;
});
import Loading from '../components/loading.js'
class sale extends Component {
  constructor(props) {
    super(props);
    this._width = new Animated.Value(0);
    this._layoutProvider = new LayoutProvider(
      index => {
        return 0;
      },
      (type, dim) => {
        dim.width = width;
        dim.height = height * 0.08;
      }
    );
    this._rowRenderer = this._rowRenderer.bind(this);
    this.state = {
      modalshow: false,
      value: true,
      data: [],
      hot_modal_show: false,
      hotnum: [],
      bet_modal_show: false,
      send_modal_show: false,
      user: [],
      extras: [],
      userid: this.props.navigation.state.params.user[0].UserID,
      discount: this.props.navigation.state.params.user[0].Discount2D,
      unitPrice: this.props.navigation.state.params.unitPrice,
      UseMoneyInOut: this.props.navigation.state.params.user[0].UseMoneyInOut,
      loading: false,
      name: '',
      dataProvider: dataProvider.cloneWithRows([]),
      showDirectBuyModal: false,
      supplierInfo: null,
      otherInfo: null,
      showDownload: false,
      termsFromOther: [],
      termIdForOther: null,
      otherLottType: '2D',
      viewData: [],
      showViewModal: false,
      showCombineModal: false,
      combineErrorMsg: '',
      pasteTxt: '',
      findStr: '',
      replaceStr: '',
      disableOK: true,
      sameUnit: false,
      sameUnitR: false,
      showByNumModal: false,
      buyNums: [],
      allowExtra: false,
      dataforSwap: []
    };
  }
  async componentDidMount() {
    const allowExtra = await AsyncStorage.getItem('allowExtra') || "false"
    this.setState({
      allowExtra: allowExtra == 'true' ? true : false
    })
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    dal.getUsers(this.props.navigation.state.params.endpoint, (err, result) => {
      if (!err) {
        this.setState({ user: result.Data })
      }
    })
    this.getHotNum(true)
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
    Open = false, var_num = "", var_unit = "", var_chosen = '', var_selected = 'num', var_total_unit = 0, click_back = 0
  }
  handleBackButton = () => {
    click_back += 1
    this.refs.err_toast.show('ထွက်ရန်တစ်ချက်ထပ်နှိပ်ပါ။', 1000);
    setTimeout(() => {
      click_back = 0
    }, 1000);
    if (click_back >= 2) {
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
  renderTitle() {
    return (
      <View style={{ flexDirection: 'row', backgroundColor: Color.PRIMARYCOLOR }}>
        <View style={{ flex: 1.5, height: 50, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[estyles.mmTitleText]}>စဥ်</Text>
        </View>

        <View style={{ flex: 2, height: 50, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={estyles.mmTitleText}>ဂဏန်း</Text>
        </View >

        <View style={{ flex: 3, height: 50, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={estyles.mmTitleText}>ယူနစ်</Text>
        </View>

        <View style={{ flex: 2.2, height: 50, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={estyles.mmTitleText}>မှတ်ချက်</Text>
        </View>

        <View style={{ flex: 1.3, height: 50 }}>

        </View>
      </View>
    )
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
  renderCombineModal() {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.state.showCombineModal}
        onRequestClose={() => { }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#11030085',
          }}>
          <View
            style={{
              width: Math.round(width * 0.98),
              height: height * 0.58,
              backgroundColor: '#fff',
              borderRadius: 5,
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
                  style={{ height: 60, textAlignVertical: 'top', }}
                  contextMenuHidden={true}
                  placeholderTextColor={Color.defaultGray}
                  underlineColorAndroid="transparent"
                  tintColor="#262626"
                  value={this.state.findStr}
                  onChangeText={(text) => this.setState({ findStr: text })}
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
                  style={{ height: 60, textAlignVertical: 'top', }}
                  contextMenuHidden={true}
                  placeholderTextColor={Color.defaultGray}
                  underlineColorAndroid="transparent"
                  tintColor="#262626"
                  multiline
                  value={this.state.replaceStr}
                  onChangeText={(text) => this.setState({ replaceStr: text })}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (
                    this.state.pasteTxt == '' ||
                    this.state.findStr == '' ||
                    this.state.replaceStr == ''
                  ) {
                    return;
                  }
                  let pTxt = this.ReplaceAll(
                    this.state.pasteTxt,
                    this.state.findStr,
                    this.state.replaceStr,
                  );
                  console.log(pTxt);
                  this.setState({
                    pasteTxt: pTxt,
                  });
                }}
                style={{
                  paddingHorizontal: 15,
                  backgroundColor: Color.PRIMARYCOLOR,
                  borderRadius: 5,
                  height: 40,
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 15, color: 'white' }}>REPLACE</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 5,
                alignItems: 'center',
                justifyContent: 'center',
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
                  placeholder={
                    this.props.navigation.state.params.lg == 'uni' ? 'Paste Msg' : 'Paste Msg'
                  }
                  style={{
                    width: width * 0.4,
                    height: height * 0.5 - 120,
                    textAlignVertical: 'top',
                  }}
                  multiline
                  placeholderTextColor={Color.defaultGray}
                  underlineColorAndroid="transparent"
                  tintColor="#262626"
                  value={this.state.pasteTxt}
                  onChangeText={(text) => this.setState({ pasteTxt: text })}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: Color.defaultGray,
                  borderRadius: 5,
                }}>
                <TextInput
                  style={{
                    color: 'red',
                    width: width * 0.4,
                    height: height * 0.5 - 120,
                    textAlignVertical: 'top',
                  }}
                  multiline
                  editable={false}
                  underlineColorAndroid="transparent"
                  tintColor="#262626"
                  value={this.state.combineErrorMsg}
                  onChangeText={(text) =>
                    this.setState({ combineErrorMsg: text })
                  }
                />
              </View>
            </View>
            <View
              style={{
                height: height * 0.08,
                justifyContent: 'space-between',
                alignItems: 'center',
                marginHorizontal: 5,
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    showCombineModal: false,
                    findStr: '',
                    replaceStr: '',
                    pasteTxt: '',
                    combineErrorMsg: '',
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
                <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>
                  CANCEL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (this.state.pasteTxt == '') {
                    return;
                  }
                  dal.checkSMS(
                    this.props.navigation.state.params.endpoint,
                    this.state.userid,
                    this.props.navigation.state.params.termdetailsid,
                    this.state.pasteTxt,
                    (err, resp) => {
                      console.log('Resp ' + JSON.stringify(resp));
                      console.log('Err ' + err);
                      if (resp.length > 0) {
                        //Alert.alert(config.AppName,'Combine successfully!')
                        this.setState({
                          loading: false,
                          combineErrorMsg: resp[0].ErrorMsg,
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
                }}
                style={{
                  backgroundColor: Color.PRIMARYCOLOR,
                  borderRadius: 5,
                  flex: 1,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 5,
                }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>
                  {this.props.navigation.state.params.lg == 'uni' ? 'စစ်ရန် ==>' : 'စစ္ရန္ ==>'}
                </Text>
              </TouchableOpacity>
              {!this.state.disableOK ? (
                <TouchableOpacity
                  onPress={() => {
                    if (this.state.pasteTxt == '') {
                      return;
                    }
                    dal.checkSMS(
                      this.props.navigation.state.params.endpoint,
                      this.state.userid,
                      this.props.navigation.state.params.termdetailsid,
                      this.state.pasteTxt,
                      (err, resp) => {
                        console.log('Resp ' + JSON.stringify(resp));
                        console.log('Err ' + err);
                        if (resp.length > 0) {
                          //Alert.alert(config.AppName,'Combine successfully!')
                          this.setState({
                            loading: false,
                            combineErrorMsg: resp[0].ErrorMsg,
                          });
                          let t = [];
                          resp.map((value, index) => {
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
                  }}
                  style={{
                    borderRadius: 5,
                    flex: 1,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Color.Green,
                  }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>
                    OK
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  renderButtons() {
    return (
      <View style={{ width: width, height: height * 0.08, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
        <TouchableOpacity style={{
          marginHorizontal: 5, flex: 1, justifyContent: 'center',
          alignItems: 'center', backgroundColor: Color.darkGreen, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5
        }}
          onPress={this._animateTo.bind(this,height * 0.67)}>
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
            this.setState({
              showCombineModal: true,
              pasteTxt: text,
            });
          }}>
          <Image
            source={plusIcon}
            style={{ width: 30, height: 30, tintColor: '#fff' }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{
          marginHorizontal: 5, flex: 1, justifyContent: 'center',
          alignItems: 'center', backgroundColor: Color.yellow, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5
        }}
          onPress={() => {
            if (this.state.data.length > 0) {
              var total = 0
              this.state.data.map((value, index) => {
                total += parseInt(value.unit)
              })
              var_total_unit = total
              this.setState({ bet_modal_show: true })
            }
          }}>
          <Text style={estyles.btnText}>သိမ်းရန်</Text>
        </TouchableOpacity>
      </View>
    )
  }
  renderHeader() {
    return (
      <View style={[styles.header, { backgroundColor: Color.PRIMARYCOLOR }]}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => {
            this.props.navigation.goBack()
          }}>
          <Image source={back} style={{ width: 30, height: 30, resizeMode: "contain", marginHorizontal: 10, tintColor: '#fff' }} />
        </TouchableOpacity>
        <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={estyles.headerText} numberOfLines={1} ellipsizeMode={'tail'}>{this.props.navigation.state.params.title}</Text>
        </View>

        <View style={{ flexDirection: 'row' }} >
          {/* TZT */}
          {/* <TouchableOpacity onPress={()=>{
                  this.setState({send_modal_show:true})
                }}>
                  <Image source={message} style={{width:25,height:25,resizeMode:"contain",marginRight:10,tintColor:'#fff'}}/>
                </TouchableOpacity> */}
          <TouchableOpacity onPress={() => {
            this.props.navigation.navigate('Ledger',
              {
                user: this.props.navigation.state.params.user,
                termdetailsid: this.props.navigation.state.params.termdetailsid,
                endpoint: this.props.navigation.state.params.endpoint,
                lg: this.props.navigation.state.params.lg
              })
          }}>
            <Text style={[estyles.headerText, { fontSize: 14, marginRight: 7 }]}>Ledger</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={this.getHotNum.bind(this,false)}>
                  <Text style={[estyles.headerText,{fontSize:14}]}>Extra</Text>
                </TouchableOpacity> */}

        </View>
      </View>
    )
  }
  getHotNum(hot) {
    if (hot) {
      dal.getHotNum(this.props.navigation.state.params.endpoint, this.props.navigation.state.params.termdetailsid, (err, result) => {
        console.log('err ', err, ' resp ', result)
        if (!err) {
          if (result.Status == 'OK') {
            this.setState({ hotnum: result.Data })
          } else {
            //Alert.alert(dal.APP_NAME,this.state.lg=='uni'?"ဟော့ဂဏန်းမရှိပါ":"ေဟာ့ဂဏန္းမရွိပါ",[{text:'Ok',onPress:()=>{console.warn('ok')}}])
          }
        }
      })
    } else {
      dal.getExtraNum(this.props.navigation.state.params.endpoint, this.props.navigation.state.params.termdetailsid, (err, result) => {
        if (!err) {
          if (result.Status == 'OK') {
            this.setState({ extras: result.Data, hot_modal_show: true })
          } else {
            Alert.alert(config.AppName, 'No Extra Number', [{ text: 'Ok', onPress: () => { console.warn('ok') } }])
          }
        }
      })
    }
  }
  renderHotnum() {
    return this.state.extras.map((value, index) => {
      return (
        <View style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center' }}>
          <Text style={{ marginLeft: 15, color: '#262626', fontSize: 16 }}>{value.Num}</Text>
        </View>
      )
    })
  }
  renderUsers() {
    if (this.state.user.length > 0) {
      return this.state.user.map((value, index) => {
        return (
          <Picker.Item label={value.UserNo} value={value.UserID} key={index} />
        )
      })
    }
  }
  getTermsFromOther() {
    dal.getTermsFromOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.otherInfo.UserID, (err, resp) => {
      if (err) {
        console.log(err)
        Alert.alert(config.AppName, 'Something went wrong!')
        this.setState({
          loading: false,
        })
      } else {
        console.log(resp)
        if (resp.Status == 'OK' && resp.Data.length > 0) {
          this.setState({
            termsFromOther: resp.Data,
            showDirectBuyModal: true,
            loading: false
          })
        } else {
          Alert.alert(config.AppName, resp.Status)
          this.setState({
            loading: false,
          })
        }
      }
    })
  }
  getUserFromOther() {
    dal.getUserFromOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.supplierInfo.UserNo, this.state.supplierInfo.Password, (err, resp) => {
      if (err) {
        console.log(err)
        Alert.alert(config.AppName, 'Something went wrong!')
        this.setState({
          loading: false,
        })
      } else {
        console.log(resp)
        if (resp.Status == 'OK' && resp.Data.length > 0) {
          this.setState({
            otherInfo: resp.Data[0]
          }, () => {
            this.getTermsFromOther()
          })
        } else {
          Alert.alert(config.AppName, 'Get User Info Fail!')
          this.setState({
            loading: false,
          })
        }
      }
    })
  }
  pressDirectBuy() {
    if (this.state.userid == null) {
      Alert.alert(config.AppName, 'Please select the user!')
      return;
    }
    this.setState({
      loading: true,
    })
    dal.ApiSupplier(this.props.navigation.state.params.endpoint, this.state.userid, (err, resp) => {
      if (err) {
        Alert.alert(config.AppName, 'Something went wrong!')
        this.setState({
          loading: false,
        })
      } else {
        if (resp && resp.UserNo) {
          this.setState({
            supplierInfo: resp
          }, () => {
            this.getUserFromOther()
          })
        } else {
          Alert.alert(config.AppName, 'Get Supplier Fail!')
          this.setState({
            loading: false,
          })
        }

        console.log('ApiSupplier resp ', typeof resp, resp)
      }
    })
  }
  renderOtherTerms() {
    return this.state.termsFromOther.map((value, index) => {
      return (
        <Picker.Item label={value.Name} value={value.TermDetailID} key={index} />
      )
    })
  }
  downloadSlipFromOther() {
    this.setState({
      loading: true,
      showDirectBuyModal: false
    })
    dal.downloadSlipFromOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.otherInfo.UserID, this.state.termIdForOther, (err, resp) => {
      if (err) {
        console.log(err)
        Alert.alert(config.AppName, 'Something went wrong!')
        this.setState({
          loading: false,
          showDownload: false
        })
      } else {
        console.log('============= downloda downloadSlipFromOther -===========')
        console.log(resp)
        if (resp.Status == 'OK' && resp.Data.length > 0) {
          this.uploadSlipToServer(resp)
        } else {
          Alert.alert(config.AppName, resp.Status)
          this.setState({
            loading: false,
            showDownload: false
          })
        }
      }
    })
  }
  uploadSlipToServer(data) {
    dal.uploadSlipToServer(this.props.navigation.state.params.endpoint, this.state.userid, this.props.navigation.state.params.termdetailsid, data, (err, resp) => {
      if (err) {
        console.log('uploadSlipToServer err ', err)
        Alert.alert(config.AppName, 'Something went wrong!')
        this.setState({
          loading: false,
          showDownload: false
        })
      } else {
        console.log('=============  uploadSlipToServer -===========')
        console.log(resp)
        if (resp == 'OK') {
          this.downloadSlipDetailsFromOther()
        } else {
          Alert.alert(config.AppName, resp)
          this.setState({
            loading: false,
            showDownload: false
          })
        }

        console.log('uploadSlipToServer resp ', typeof resp, resp)
      }
    })
  }
  downloadSlipDetailsFromOther() {
    dal.downloadSlipDetailsFromOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.otherInfo.UserID, this.state.termIdForOther, (err, resp) => {
      if (err) {
        console.log(err)
        Alert.alert(config.AppName, 'Something went wrong!')
        this.setState({
          loading: false,
          showDownload: false
        })
      } else {
        console.log('=============  downloadSlipDetailsFromOther -===========')
        console.log(resp)
        if (resp.Status == 'OK' && resp.Data.length > 0) {
          let data = resp.Data.map((item, index) => {
            item.Unit = (item.Unit * this.state.supplierInfo.ServerUnit) / this.state.supplierInfo.UserUnit
            return item;
          });
          this.uploadSlipDetailsToServer({ Status: 'OK', Data: data })
        } else {
          Alert.alert(config.AppName, resp.Status)
          this.setState({
            loading: false,
            showDownload: false
          })
        }
      }
    })
  }
  uploadSlipDetailsToServer(data) {
    dal.uploadSlipDetailsToServer(this.props.navigation.state.params.endpoint.replace('www.', ''), data, (err, resp) => {
      if (err) {
        console.log('uploadSlipDetailsToServer err ', err)
        Alert.alert(config.AppName, 'Something went wrong!')
        this.setState({
          loading: false,
          showDownload: false
        })
      } else {
        console.log('=============  uploadSlipDetailsToServer -===========')
        console.log(resp)
        if (resp == 'OK') {
          this.setState({
            loading: false,
            showDirectBuyModal: false,
            showDownload: false
          })
          this.clearData()
          Alert.alert(config.AppName, 'Download Successfully!')
        } else {
          Alert.alert(config.AppName, resp)
          this.setState({
            loading: false,
            showDownload: false
          })
        }
      }
    })
  }
  saveSliptoOther() {
    let d = []
    this.state.data.map((value, index) => {
      let u = Math.ceil((value.unit * this.state.supplierInfo.UserUnit) / this.state.supplierInfo.ServerUnit)
      d.push(
        {
          SaleDetailID: null,
          SaleID: null,
          Num: value.num,
          Unit: u,
          UnitUser: this.state.supplierInfo.UserUnit,
          Summary: value.num,
          Discount: this.state.otherLottType == '2D' ? this.state.otherInfo.Discount2D : this.state.otherInfo.Discount3D,
          GroupID: '',
          GroupID2:moment().unix(),
        }
      )
    })
    console.log(d)
    dal.saveSliptoOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.otherInfo.UserID, this.state.termIdForOther, d, (err, resp) => {
      if (err) {
        console.log(err)
        Alert.alert(config.AppName, 'Something went wrong!')
        this.setState({
          loading: false,
        })
      } else {
        console.log('=============  saveSliptoOther -===========')
        console.log(resp)
        if (JSON.parse(resp).Msg == 'OK') {
          Alert.alert(config.AppName, 'Save successfully!')
          this.setState({
            loading: false,
            showDownload: true
          })
        } else {
          Alert.alert(config.AppName, JSON.parse(resp).Msg)
          this.setState({
            loading: false,
            showDownload: true
          })
        }
      }
    })
  }
  renderDirectBuyModal() {
    return (
      <Modal
        transparent={true}
        visible={this.state.showDirectBuyModal}
        onRequestClose={() => {
          this.setState({
            showDirectBuyModal: false,
            loading: false
          })
        }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
          <View style={{ backgroundColor: '#fff', alignItems: 'center', width: width * 0.8, borderRadius: 5, padding: 10 }}>
            <View style={{ width: width * 0.8, alignItems: 'center', padding: 15 }}>
              <View style={{
                width: ((width * 0.8) - 30), height: 40, justifyContent: 'center',
                borderWidth: 1, borderColor: Color.DARKPRIMARYTEXTCOLOR, borderRadius: 5,
              }}>
                <Picker
                  mode='dropdown'
                  selectedValue={this.state.termIdForOther}
                  style={{ height: 40, width: ((width * 0.8) - 30) }}
                  onValueChange={(itemValue, itemIndex) => {
                    let i = this.state.termsFromOther.findIndex(x => x.TermDetailID == itemValue);
                    if (i !== -1) {
                      this.setState({
                        termIdForOther: itemValue,
                        otherLottType: this.state.termsFromOther[i].LottType
                      })
                    } else {
                      this.setState({
                        termIdForOther: null,
                        otherLottType: '2D'
                      })
                    }
                  }}>
                  <Picker.Item label={'Select Term'} value={null} />
                  {this.renderOtherTerms()}
                </Picker>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10
              }}>
                <Text style={{ color: '#262626', fontSize: 16, marginRight: 10 }}>
                  {word[this.props.navigation.state.params.lg].user}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  flex: 1
                }}>
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 7,
                      height: 40,
                      borderWidth: 1,
                      borderColor: Color.DARKPRIMARYTEXTCOLOR,
                      borderRadius: 5,
                      marginRight: 5,
                      textAlign: 'center',
                      color: '#262626'
                    }}
                    placeholder={'Hot Num'}
                    keyboardType='decimal-pad'
                    underlineColorAndroid='transparent'
                    value={this.state.otherInfo ? this.state.otherInfo.UserNo : ''}
                    editable={false}
                  />
                </View>
              </View>

              <TouchableOpacity style={{
                paddingHorizontal: 30,
                paddingVertical: 10,
                marginTop: 20,
                backgroundColor: Color.PRIMARYCOLOR,
                borderRadius: 10
              }} onPress={() => {
                if (this.state.otherLottType != this.props.navigation.state.params.LottType) {
                  Alert.alert(config.AppName, 'Invalid term details!')
                  return;
                }
                if (this.state.termIdForOther) {
                  if (this.state.showDownload) {
                    this.downloadSlipFromOther()
                  } else {
                    this.saveSliptoOther()
                  }
                } else {
                  Alert.alert(config.AppName, 'Please select the term!')
                  return;
                }

              }}>
                <Text style={{ color: '#262626', fontSize: 16, }}>
                  {this.state.showDownload ? 'Download' : 'Save'}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
    )
  }
  pressSave() {
    const FETCH_TIMEOUT = 30000;
    let didTimeOut = false;
    let data = this.state.data.map((item, i) => {
      item.discount = this.state.discount
      item.summary=item.showsummary?item.summary:''
      return item;
    });
    var options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserID: this.state.userid,
        TermDetailID: this.props.navigation.state.params.termdetailsid,
        CName: this.state.name,
        Data: data
      }),

    };;
    var that = this
    new Promise(function (resolve, reject) {
      const timeout = setTimeout(function () {
        didTimeOut = true;
        reject(new Error('Request timed out'));
      }, FETCH_TIMEOUT);
      let url = that.state.UseMoneyInOut
        ? that.props.navigation.state.params.endpoint + 'api/apisale?PrintAPI=true&UseMoneyInOut=true'
        : that.props.navigation.state.params.endpoint + 'api/apisale?PrintAPI=true'
      let _url = that.state.allowExtra ? that.props.navigation.state.params.endpoint + 'api/apisaleAndroidOwner?IsSale=true' : url


      fetch(_url, options)
        .then((result) => result.text())
        .then(function (response) {
          // Clear the timeout as cleanup
          clearTimeout(timeout);
          if (!didTimeOut) {
            console.warn('fetch good! ', response);
            resolve(response);
          }
        })
        .catch(function (err) {
          console.warn('fetch failed! ', err);

          // Rejection already happened with setTimeout
          if (didTimeOut) return;
          // Reject with error
          reject(err);
        });
    })
      .then(function (response) {
        // Request success and no timeout
        //console.warn('good promise, no timeout! '+JSON.stringify(response));
        that.setState({ loading: false })
        that.clearData()
        if(that.state.allowExtra){
          Alert.alert(config.AppName, response.replace(/\\n/g, '\n').replace(/\"/g, ''), [{
            text: 'Ok', onPress: () => {
            }
          }])
        }else{
          Alert.alert(
            config.AppName,
            JSON.parse(response).Msg.replace(/\\n/g, '\n').replace(/\"/g, ''),
            [
              {text: 'Ok', onPress: () => {}},
            {text: 'Copy', onPress: () => {
              //that.clearData();
              Clipboard.setString( JSON.parse(response).Msg.replace(/\\n/g, '\n').replace(/\"/g, ''))
            }},
            ]
          );
        }
        
      })
      .catch(function (err) {
        // Error: response error, request timeout or runtime error
        that.setState({ loading: false })
        that.clearData()
        Alert.alert(config.AppName, 'ထိုးဂဏန်းများ ရ/မရ စလစ်ထဲပြန်စစ်ပါ', [{
          text: 'Ok', onPress: () => {
          }
        }])
        
      });
  }

  pressBUY() {
    const FETCH_TIMEOUT = 30000;
    let didTimeOut = false;
    console.warn(this.state.name);
    var options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserID: this.state.userid,
        TermDetailID: this.props.navigation.state.params.termdetailsid,
        CName: this.state.name,
        Data: this.state.data
      }),

    };;
    var that = this
    new Promise(function (resolve, reject) {
      const timeout = setTimeout(function () {
        didTimeOut = true;
        reject(new Error('Request timed out'));
      }, FETCH_TIMEOUT);
      let _url = that.props.navigation.state.params.endpoint + 'api/apisaleAndroidOwner?IsSale=false'
      fetch(_url, options)
        .then((result) => result.text())
        .then(function (response) {
          // Clear the timeout as cleanup
          clearTimeout(timeout);
          if (!didTimeOut) {
            console.warn('fetch good! ', response);
            resolve(response);
          }
        })
        .catch(function (err) {
          console.warn('fetch failed! ', err);

          // Rejection already happened with setTimeout
          if (didTimeOut) return;
          // Reject with error
          reject(err);
        });
    })
      .then(function (response) {
        // Request success and no timeout
        //console.warn('good promise, no timeout! '+JSON.stringify(response));
        that.setState({ loading: false })
        that.clearData()
        Alert.alert(config.AppName, response.replace(/\\n/g, '\n').replace(/\"/g, ''), [{
          text: 'Ok', onPress: () => {
          }
        }])
      })
      .catch(function (err) {
        // Error: response error, request timeout or runtime error
        that.setState({ loading: false })
        that.clearData()
        Alert.alert(config.AppName, 'ထိုးဂဏန်းများ ရ/မရ စလစ်ထဲပြန်စစ်ပါ', [{
          text: 'Ok', onPress: () => {

          }
        }])
        console.warn('promise error! ', err);
      });
  }
  clearData() {
    this.setState({
      data: [],
      name: '',
      dataProvider: dataProvider.cloneWithRows([]),
      dataforSwap:[]
    })
  }
  renderSaveModal() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.bet_modal_show}
        onRequestClose={() => { }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#11030085" }}>
          <View style={{
            width: Math.round(Dimensions.get("window").width * 0.85)
            , backgroundColor: "#fff", borderRadius: 10
          }}>
            <View style={{ width: width * 0.75, height: height * 0.08, justifyContent: 'center', alignItems: 'center', marginHorizontal: width * 0.05 }}>
              <Picker
                mode='dropdown'
                selectedValue={this.state.userid}
                style={{ height: height * 0.08, width: (width * 0.5) }}
                onValueChange={(itemValue, itemIndex) => {
                  let i = this.state.user.findIndex(x => x.UserID == itemValue);
                  this.setState({
                    userid: itemValue,
                    termDetails: [],
                    discount: this.state.user[i].Discount2D,
                    UseMoneyInOut: this.state.user[i].UseMoneyInOut
                  })
                }
                }>
                {this.renderUsers()}
              </Picker>
            </View>
            <View style={{ backgroundColor: 'gray', height: 1, width: width * 0.75, marginHorizontal: width * 0.05 }} />
            <View style={{ height: height * 0.06, width: width * 0.75, marginHorizontal: width * 0.05, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={estyles.mmLargeText}>ကော်</Text>
              <Text style={estyles.mmLargeText}>{this.state.discount}</Text>
            </View>
            <View style={{ backgroundColor: 'gray', height: 1, width: width * 0.75, marginHorizontal: width * 0.05 }} />
            <View style={{ height: height * 0.06, width: width * 0.75, marginHorizontal: width * 0.05, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={estyles.mmLargeText}>ယူနစ်ပေါင်း</Text>
              <Text style={estyles.mmLargeText}>{dal.numberWithCommas(var_total_unit)}</Text>
            </View>
            <View style={{ backgroundColor: 'gray', height: 1, width: width * 0.75, marginHorizontal: width * 0.05 }} />
            <View style={{ height: height * 0.06, width: width * 0.75, marginHorizontal: width * 0.05, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={estyles.mmLargeText}>ထိုးကြေး</Text>
              <Text style={estyles.mmLargeText}>{dal.numberWithCommas(((var_total_unit * this.state.unitPrice) - (var_total_unit * this.state.unitPrice * (parseInt(this.state.discount) / 100))))}</Text>
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                placeholder="ထိုးသားအမည်မှတ်ရန်"
                style={styles.input}
                placeholderTextColor="#000"
                underlineColorAndroid="transparent"
                tintColor="#262626"
                value={this.state.name}
                onChangeText={(text) => this.setState({ name: text })}
              />
            </View>
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: width * 0.05,
              marginTop: 8
            }}
              onPress={() => {
                AsyncStorage.setItem('allowExtra', this.state.allowExtra ? 'false' : 'true')
                this.setState({
                  allowExtra: !this.state.allowExtra
                })
              }}
            >
              <Image style={{ width: 25, height: 25, marginRight: 5 }} source={this.state.allowExtra ? tickIcon : untickIcon} />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red' }}>Allow Extra</Text>
            </TouchableOpacity>
            <View style={{
              width: width * 0.75, height: height * 0.08, justifyContent: 'space-between'
              , alignItems: 'center', marginHorizontal: width * 0.05, flexDirection: 'row'
            }}
            >
              <TouchableOpacity onPress={() => {
                this.setState({ bet_modal_show: false })
              }} style={{
                flex: 1, marginHorizontal: 5, paddingVertical: 5, backgroundColor: 'red',
                borderRadius: 5, alignItems: 'center', justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {

                this.setState({ bet_modal_show: false, loading: true })
                dal.sendRequest((result) => {
                  //if (result) {
                    if (true) {
                    //access internet
                    this.pressSave()
                  } else {
                    //no access internet
                    this.setState({ loading: false })
                    Alert.alert(config.AppName, 'အင်တာနက်မမိပါ')
                  }
                })


              }} style={{
                marginRight: 5, flex: 1, paddingVertical: 5, backgroundColor: Color.Green, borderRadius: 5,
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>OK</Text>
              </TouchableOpacity>

            </View>
            <View style={{
              width: width * 0.75, height: height * 0.08, justifyContent: 'space-between'
              , alignItems: 'center', marginHorizontal: width * 0.05, flexDirection: 'row'
            }}
            >
              <TouchableOpacity onPress={() => {
                this.setState({ bet_modal_show: false, loading: true })
                dal.sendRequest((result) => {
                  //if (result) {
                    if (true) {
                    //access internet
                    this.pressBUY()
                  } else {
                    //no access internet
                    this.setState({ loading: false })
                    Alert.alert(config.AppName, 'အင်တာနက်မမိပါ')
                  }
                })
              }} style={{
                flex: 1, marginHorizontal: 5, paddingVertical: 5, backgroundColor: Color.Green, borderRadius: 5,
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>BUY</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                this.setState({ bet_modal_show: false, loading: true })
                dal.sendRequest((result) => {
                  //if (result) {
                    if (true) {
                    //access internet
                    this.pressDirectBuy()
                  } else {
                    //no access internet
                    this.setState({ loading: false })
                    Alert.alert(config.AppName, 'အင်တာနက်မမိပါ')
                  }
                })
              }} style={{
                marginRight: 5, flex: 1, paddingVertical: 5, backgroundColor: Color.Green, borderRadius: 5,
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Direct Buy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
  renderSendModal() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.send_modal_show}
        onRequestClose={() => { }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#11030085" }}>
          <View style={{
            width: Math.round(Dimensions.get("window").width * 0.85)
            , height: height * 0.5
            , backgroundColor: "#fff", borderRadius: 10, alignItems: 'center', justifyContent: 'center'
          }}>
            <View style={{ width: width * 0.75, height: height * 0.08, justifyContent: 'center', alignItems: 'center', marginHorizontal: width * 0.05 }}>
              <Picker
                mode='dropdown'
                selectedValue={this.state.userid}
                style={{ height: height * 0.08, width: (width * 0.5) }}
                onValueChange={(itemValue, itemIndex) => {
                  let i = this.state.user.findIndex(x => x.UserID == itemValue);
                  this.setState({ userid: itemValue, termDetails: [], discount: this.state.user[i].Discount2D })
                }
                }>
                {this.renderUsers()}
              </Picker>
            </View>
            <View style={styles.biginputWrap}>
              <TextInput
                placeholder=""
                style={styles.input}
                placeholderTextColor="#000"
                underlineColorAndroid="transparent"
                tintColor="#262626"
                //maxLength={100}
                multiline={true}
                value={this.state.bigtext}
                onChangeText={(text) => this.setState({ bigtext: text })}
              />
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                placeholder="အမည်"
                style={styles.input}
                placeholderTextColor="#000"
                underlineColorAndroid="transparent"
                tintColor="#262626"
                value={this.state.name}
                onChangeText={(text) => this.setState({ name: text })}
              />
            </View>
            <View style={{
              width: width * 0.75, height: height * 0.08, justifyContent: 'space-between'
              , alignItems: 'center', marginHorizontal: width * 0.05, flexDirection: 'row', marginTop: 10
            }}
            >
              <TouchableOpacity onPress={() => {
                this.setState({ send_modal_show: false })
              }} style={{ paddingHorizontal: 15, paddingVertical: 5, backgroundColor: 'red', borderRadius: 5 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                this.setState({ send_modal_show: false, loading: true })
                console.warn(JSON.stringify({
                  bodySMS: this.state.bigtext
                }));
                dal.sendSms(this.props.navigation.state.params.endpoint, this.state.userid, this.props.navigation.state.params.termdetailsid, this.state.smalltext, this.state.bigtext, (err, result) => {
                  this.setState({ loading: false, smalltext: '', bigtext: '' })
                  if (!err) {
                    console.warn(result)
                    Alert.alert(config.AppName, result.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\"/g, ''), [{
                      text: 'Ok', onPress: () => {
                      }
                    }])
                  }
                })
              }} style={{ paddingHorizontal: 30, paddingVertical: 5, backgroundColor: Color.Green, borderRadius: 5 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
  renderHotModal() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.hot_modal_show}
        onRequestClose={() => { this.setState({ hot_modal_show: false }) }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#11030085" }}>
          <View style={{
            width: Math.round(Dimensions.get("window").width * 0.85)
            , height: height * 0.72
            , backgroundColor: "#fff", borderRadius: 10
          }}>
            <View style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={estyles.mmTitleText1}>Extra</Text>
            </View>
            <ScrollView style={{
              width: Math.round(Dimensions.get("window").width * 0.85)
              , height: height * 0.56
            }}>
              <View>
                {this.renderHotnum()}
              </View>
            </ScrollView>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center', alignItems: 'flex-end' }}
              onPress={() => { this.setState({ hot_modal_show: false }) }}>
              <Text style={{ marginRight: 15, fontSize: 20, fontWeight: 'bold', color: 'red' }}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
  containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
  }
  pressNum(n) {
    if (var_selected == 'num') {

      if (var_num.length < 10) {
        var_num = var_num.length < 2 || var_chosen == '' ? var_num + n : var_num + ''
        this.numComponent.setNativeProps({ text: var_num })
        console.log('length ', var_num.length)
        console.log('check num ', this.containsOnlyNumbers(var_num))
        if (var_num.length == 2 && this.containsOnlyNumbers(var_num) && (this.state.sameUnit || this.state.sameUnitR)) {
          if (var_unit == '') {
            this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
            var_selected = 'unit'
            return;
          }
          setTimeout(() => {
            this.pressOk()
          }, 200);

          return;
        }
      }
    } else {
      if (clearUnit) {
        var_unit = n;
        clearUnit = false;
      } else {
        var_unit += n;
      }
      this.unitComponent.setNativeProps({ text: var_unit })
    }
  }
  pressDelete() {
    if (var_selected == 'num') {
      var_chosen = '', var_num = ''
      this.numComponent.setNativeProps({ text: var_num })
    } else {
      var_unit = '';
      this.unitComponent.setNativeProps({ text: var_unit })
    }
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
  getRemainUnits(num) {
    this.setState({
      loading: true
    }, () => {
      dal.getRemainUnits(this.props.navigation.state.params.endpoint, this.props.navigation.state.params.termdetailsid, num, (err, resp) => {
        if (err) {
          Alert.alert(config.AppName, 'Something went wrong!')
          this.setState({
            loading: false,
          })
        } else {
          console.log(resp)
          if (resp && resp.Status == 'OK' && resp.Data.length) {
            this.setState({
              loading: false,
              showViewModal: true,
              viewData: resp.Data
            })
          } else {
            Alert.alert(config.AppName, 'No Data!')
            this.setState({
              loading: false,
            })
          }
        }
      })
    })

  }
  pressView() {
    if (var_chosen == "" && var_num.length != 2) {
      this.refs.err_toast.show('ဂဏန်းနှစ်လုံးဖြစ်ရမည်။', 1000)
    } else {
      //for front even
      if (var_chosen == 'front_even') {
        var t = []
        for (let i = 0; i < 10; i++) {
          if (i % 2 == 0) {
            t.push(i + var_num)
          }
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for back even
      else if (var_chosen == 'back_even') {
        var t = []
        for (let i = 0; i < 10; i++) {
          if (i % 2 == 0) {
            t.push(var_num + i)
          }
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for front odd
      else if (var_chosen == 'front_odd') {
        var t = []
        for (let i = 0; i < 10; i++) {
          if (i % 2 != 0) {
            t.push(i + var_num)
          }
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for back odd
      else if (var_chosen == 'back_odd') {
        var t = []
        for (let i = 0; i < 10; i++) {
          if (i % 2 != 0) {
            t.push(var_num + i)
          }
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for front series
      else if (var_chosen == 'front') {
        var t = []
        for (let i = 0; i < 10; i++) {
          t.push(i + var_num)
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for back series
      else if (var_chosen == 'back') {
        var t = []
        for (let i = 0; i < 10; i++) {
          t.push(var_num + i)
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for break
      else if (var_chosen == 'break') {
        var t = []
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            if (var_num == (i + j) || ('1' + var_num) == (i + j)) {
              t.push(i + '' + j)
            }
          }
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for tri
      else if (var_chosen == 'tri') {
        var t = []
        for (let i = 0; i < 10; i++) {
          t.push(i + '' + i)
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for power
      else if (var_chosen == 'power') {
        var t = []
        for (let i = 0; i < 10; i++) {
          t.push(_data.w[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for N
      else if (var_chosen == 'k') {
        var t = []
        for (let i = 0; i < 10; i++) {
          t.push(_data.k[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for SP
      else if (var_chosen == 'sp') {
        var t = []
        for (let i = 0; i < 5; i++) {
          t.push(_data.sp[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for MP
      else if (var_chosen == 'mp') {
        var t = []
        for (let i = 0; i < 5; i++) {
          t.push(_data.mp[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for SS
      else if (var_chosen == 'ss') {
        var t = []
        for (let i = 0; i < 25; i++) {
          t.push(_data.ss[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for MM
      else if (var_chosen == 'mm') {
        var t = []
        for (let i = 0; i < 25; i++) {
          t.push(_data.mm[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for SM
      else if (var_chosen == 'sm') {
        var t = []
        for (let i = 0; i < 25; i++) {
          t.push(_data.sm[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for MS
      else if (var_chosen == 'ms') {
        var t = []
        for (let i = 0; i < 25; i++) {
          t.push(_data.ms[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for NK
      else if (var_chosen == 'nk') {
        var t = []
        for (let i = 0; i < 20; i++) {
          t.push(_data.nk[i])
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for Include
      else if (var_chosen == 'include') {
        var t = []
        for (let i = 0; i < 20; i++) {
          if (i < 10) {
            t.push(var_num + "" + _data.include[i])
          } else {
            if (var_num != _data.include[i]) {
              t.push(_data.include[i] + var_num + "")
            }
          }

        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for AP
      else if (var_chosen == 'ap') {
        var t = []
        var arr = Array.from(var_num)
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length; j++) {
            t.push(arr[i] + "" + arr[j])
          }
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for AP-
      else if (var_chosen == 'ap-') {
        var t = []
        var arr = Array.from(var_num)
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length; j++) {
            if (arr[i] != arr[j]) {
              t.push(arr[i] + "" + arr[j])
            }
          }
        }
        //to call view api
        this.getRemainUnits(t.toString())
      }
      //for R
      else if (var_chosen == 'reverse') {
        if (var_num.length == 2) {
          var t = []
          var arr = Array.from(var_num)
          for (let j = 0; j < 2; j++) {
            if (j == 0) {
              t.push(arr[0] + "" + arr[1])
            } else {
              t.push(arr[1] + "" + arr[0])
            }
          }
          //to call view api
          this.getRemainUnits(t.toString())
        } else {
          this.refs.err_toast.show('ဂဏန်းနှစ်လုံးဖြစ်ရမည်။', 1000)
        }
      }
      //for two digits
      else {
        if (var_num.length == 2) {
          var t = [];
          t.push(var_num)
          //to call view api
          this.getRemainUnits(t.toString())
        }
      }
    }
  }
  pressOk() {
    if (var_selected == 'num' && !this.state.sameUnit && !this.state.sameUnitR) {
      if (var_chosen == "" && var_num.length != 2) {
        this.refs.err_toast.show('ဂဏန်းနှစ်လုံးဖြစ်ရမည်။', 1000)
      } else {
        this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
        this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
        var_selected = 'unit'
      }
    } else if (var_unit == '') {
      this.refs.err_toast.show('ယူနစ်ထည့်ရန်။', 1000)
    } else {
      //for front even
      if (var_chosen == 'front_even') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            if (i % 2 == 0) {
              t.push({
                num: i + var_num, unit: var_unit, summary: 'S' + var_num,
                discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
              })
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
          }, () => {
            this.refs.toast.show('S' + var_num + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })

        });
      }
      //for back even
      else if (var_chosen == 'back_even') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            if (i % 2 == 0) {
              t.push({
                num: var_num + i, unit: var_unit, summary: var_num + 'S',
                discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
              })
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
          }, () => {
            this.refs.toast.show(var_num + 'S' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })

        });
      }
      //for front odd
      else if (var_chosen == 'front_odd') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            if (i % 2 != 0) {
              t.push({
                num: i + var_num, unit: var_unit, summary: 'M' + var_num,
                discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 1 ? false : true, showsummary: i == 1 ? true : false
              })
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
          }, () => {
            this.refs.toast.show('M' + var_num + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for back odd
      else if (var_chosen == 'back_odd') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            if (i % 2 != 0) {
              t.push({
                num: var_num + i, unit: var_unit, summary: var_num + 'M',
                discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 1 ? false : true, showsummary: i == 1 ? true : false
              })
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
          }, () => {
            this.refs.toast.show(var_num + 'M' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for front series
      else if (var_chosen == 'front') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            t.push({
              num: i + var_num, unit: var_unit, summary: '*' + var_num,
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('*' + var_num + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for back series
      else if (var_chosen == 'back') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            t.push({
              num: var_num + i, unit: var_unit, summary: var_num + '*',
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show(var_num + '*' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })

        });
      }
      //for break
      else if (var_chosen == 'break') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              if (var_num == (i + j) || ('1' + var_num) == (i + j)) {
                t.push({
                  num: i + '' + j, unit: var_unit, summary: var_num + 'B',
                  discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
                })
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
          }, () => {
            this.refs.toast.show(var_num + 'B' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })


        });
      }
      //for tri
      else if (var_chosen == 'tri') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            t.push({
              num: i + '' + i, unit: var_unit, summary: var_num + 'P',
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show(var_num + 'P' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for power
      else if (var_chosen == 'power') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            t.push({
              num: _data.w[i], unit: var_unit, summary: 'W',
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('W' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for N
      else if (var_chosen == 'k') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 10; i++) {
            t.push({
              num: _data.k[i], unit: var_unit, summary: 'K',
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('K' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for SP
      else if (var_chosen == 'sp') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 5; i++) {
            t.push({
              num: _data.sp[i], unit: var_unit, summary: 'SP',
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('SP' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for MP
      else if (var_chosen == 'mp') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 5; i++) {
            t.push({
              num: _data.mp[i], unit: var_unit, summary: 'MP',
              discount: this.state.discount, GroupID: uuid, GroupID2: uuid,delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('MP' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for SS
      else if (var_chosen == 'ss') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 25; i++) {
            t.push({
              num: _data.ss[i], unit: var_unit, summary: 'SS',
              discount: this.state.discount, GroupID: uuid, GroupID2: uuid,delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('SS' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })

        });
      }
      //for MM
      else if (var_chosen == 'mm') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 25; i++) {
            t.push({
              num: _data.mm[i], unit: var_unit, summary: 'MM',
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('MM' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for SM
      else if (var_chosen == 'sm') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 25; i++) {
            t.push({
              num: _data.sm[i], unit: var_unit, summary: 'SM',
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('SM' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for MS
      else if (var_chosen == 'ms') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 25; i++) {
            t.push({
              num: _data.ms[i], unit: var_unit, summary: 'MS',
              discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('MS' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for NK
      else if (var_chosen == 'nk') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 20; i++) {
            t.push({
              num: _data.nk[i], unit: var_unit, summary: 'NK',
              discount: this.state.discount, GroupID: uuid, GroupID2: uuid,delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
            })
          }
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show('NK' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for Include
      else if (var_chosen == 'include') {
        var t = []
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < 20; i++) {
            if (i < 10) {
              t.push({
                num: var_num + "" + _data.include[i], unit: var_unit, summary: var_num + 'P',
                discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
              })
            } else {
              if (var_num != _data.include[i]) {
                t.push({
                  num: _data.include[i] + var_num + "", unit: var_unit, summary: var_num + 'P',
                  discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 ? false : true, showsummary: i == 0 ? true : false
                })
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
          }, () => {
            this.refs.toast.show(var_num + 'P' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for AP
      else if (var_chosen == 'ap') {
        var t = []
        var arr = Array.from(var_num)
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length; j++) {
              t.push({
                num: arr[i] + "" + arr[j], unit: var_unit, summary: var_num + 'AP',
                discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: i == 0 && j == 0 ? false : true, showsummary: i == 0 && j == 0 ? true : false
              })
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
          }, () => {
            this.refs.toast.show(var_num + 'AP' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for AP-
      else if (var_chosen == 'ap-') {
        var t = []
        var arr = Array.from(var_num)
        UUIDGenerator.getRandomUUID().then((uuid) => {
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length; j++) {
              if (arr[i] != arr[j]) {
                t.push({
                  num: arr[i] + "" + arr[j], unit: var_unit, summary: var_num + 'AP-',
                  discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: t.length == 0 ? false : true, showsummary: t.length == 0 ? true : false
                })
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
          }, () => {
            this.refs.toast.show(var_num + 'AP-' + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        });
      }
      //for R
      else if (var_chosen == 'reverse') {
        if (var_num.length == 2) {
          var t = []
          var arr = Array.from(var_num)
          if (arr[0] == arr[1]) {
            UUIDGenerator.getRandomUUID().then((uuid) => {
              t.push({
                num: arr[0] + "" + arr[1], unit: var_unit, summary: var_num,
                discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: false, showsummary: true
              })
              let __data = this.state.dataProvider.getAllData();
              this.setState(
                {
                  dataProvider: dataProvider.cloneWithRows(
                    t.concat(__data),
                  ),
                  data: this.state.data.concat(t),
                  dataforSwap: t.concat(__data),
              }, () => {
                this.refs.toast.show(var_num + ' = ' + var_unit, 1000);
                this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
                this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
                var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
                this.numComponent.setNativeProps({ text: var_num })
                this.unitComponent.setNativeProps({ text: var_unit })
              })
            });
          } else {
            UUIDGenerator.getRandomUUID().then((uuid) => {
              for (let j = 0; j < 2; j++) {
                if (j == 0) {
                  t.push({
                    num: arr[0] + "" + arr[1], unit: var_unit, summary: var_num + 'R',
                    discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: false, showsummary: true
                  })
                } else {
                  t.push({
                    num: arr[1] + "" + arr[0], unit: var_unit, summary: var_num + 'R',
                    discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: false, showsummary: false
                  })
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
              }, () => {
                this.refs.toast.show(var_num + 'R' + ' = ' + var_unit, 1000);
                this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
                this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
                var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
                this.numComponent.setNativeProps({ text: var_num })
                this.unitComponent.setNativeProps({ text: var_unit })
              })
            });
          }

        } else {
          this.refs.err_toast.show('ဂဏန်းနှစ်လုံးဖြစ်ရမည်။', 1000)
        }
      }
      //for two digits
      else {
        if (var_num.length == 2) {
          if (this.state.sameUnitR) {
            var t = []
            var arr = Array.from(var_num)
            if (arr[0] == arr[1]) {
              UUIDGenerator.getRandomUUID().then((uuid) => {
                t.push({
                  num: arr[0] + "" + arr[1], unit: var_unit, summary: var_num,
                  discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: false, showsummary: true
                })
                let __data = this.state.dataProvider.getAllData();
                this.setState(
                  {
                    dataProvider: dataProvider.cloneWithRows(
                      t.concat(__data),
                    ),
                    data: this.state.data.concat(t),
                    dataforSwap: t.concat(__data),
                }, () => {
                  this.refs.toast.show(var_num + ' = ' + var_unit, 1000);
                  this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
                  this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
                  var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
                  this.numComponent.setNativeProps({ text: var_num })
                  this.unitComponent.setNativeProps({ text: var_unit })
                })
              });
            } else {
              UUIDGenerator.getRandomUUID().then((uuid) => {
                for (let j = 0; j < 2; j++) {
                  if (j == 0) {
                    t.push({
                      num: arr[0] + "" + arr[1], unit: var_unit, summary: var_num + 'R',
                      discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: false, showsummary: true
                    })
                  } else {
                    t.push({
                      num: arr[1] + "" + arr[0], unit: var_unit, summary: var_num + 'R',
                      discount: this.state.discount, GroupID: uuid,GroupID2: uuid, delete: false, showsummary: false
                    })
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
                }, () => {
                  this.refs.toast.show(var_num + 'R' + ' = ' + var_unit, 1000);
                  this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
                  this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
                  var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
                  this.numComponent.setNativeProps({ text: var_num })
                  this.unitComponent.setNativeProps({ text: var_unit })
                })
              });
            }
            return;
          }
          if (this.state.sameUnit) {
            var t = [];
            t.push({
              num: var_num, unit: var_unit, summary: var_num
              , discount: this.state.discount, GroupID: '',GroupID2:moment().unix(), delete: false, showsummary: true
            })
            let __data = this.state.dataProvider.getAllData();
                            this.setState(
                              {
                                dataProvider: dataProvider.cloneWithRows(
                                  t.concat(__data),
                                ),
                                data: this.state.data.concat(t),
                                dataforSwap: t.concat(__data),
            }, () => {
              this.refs.toast.show(var_num + ' = ' + var_unit, 1000);
              this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
              this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
              var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
              this.numComponent.setNativeProps({ text: var_num })
              this.unitComponent.setNativeProps({ text: var_unit })
            })
            return;
          }
          var t = [];
          t.push({
            num: var_num, unit: var_unit, summary: var_num
            , discount: this.state.discount, GroupID: '', GroupID2:moment().unix(),delete: false, showsummary: true
          })
          let __data = this.state.dataProvider.getAllData();
          this.setState(
            {
              dataProvider: dataProvider.cloneWithRows(
                t.concat(__data),
              ),
              data: this.state.data.concat(t),
              dataforSwap: t.concat(__data),
          }, () => {
            this.refs.toast.show(var_num + ' = ' + var_unit, 1000);
            this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
            this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
            var_selected = 'num', var_chosen = '', clearUnit = true, var_num = ''
            this.numComponent.setNativeProps({ text: var_num })
            this.unitComponent.setNativeProps({ text: var_unit })
          })
        }
      }
      if (!this.state.value) {
        this._animateTo(0)
      }
    }
  }
  pressBreak() {
    if (var_num.length != 1) {
      var_chosen = ''
      this.refs.err_toast.show('ဘရိတ်ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'break', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: var_num + 'B' })
    }
  }
  pressReverse() {
    if (var_num.length != 2) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'reverse', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: var_num + 'R' })
    }
  }

  pressFront() {
    if (var_num.length != 1) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'front', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: "*" + var_num })
    }
  }
  pressFront_Even() {
    if (var_num.length != 1) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'front_even', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: 'S' + var_num })
    }
  }
  pressTri() {
    if (var_num.length != 0) {
      var_num = ''
    }
    this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
    this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
    var_chosen = 'tri', var_selected = 'unit'
    this.numComponent.setNativeProps({ text: 'P' })
  }
  pressN() {
    if (var_num.length != 0) {
      var_num = ''
    }
    this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
    this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
    var_chosen = 'k', var_selected = 'unit'
    this.numComponent.setNativeProps({ text: 'K' })
  }
  pressPower() {
    if (var_num.length != 0) {
      var_num = ''
    }
    this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
    this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
    var_chosen = 'power', var_selected = 'unit'
    this.numComponent.setNativeProps({ text: 'W' })
  }
  pressSeries(name) {
    if (var_num.length != 0) {
      var_num = ''
    }
    this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
    this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
    var_chosen = name, var_selected = 'unit'
    this.numComponent.setNativeProps({ text: name.toUpperCase() })
    this.setState({ modalshow: false })
  }
  pressBack_Even() {
    if (var_num.length != 1) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'back_even', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: var_num + 'S' })
      this.setState({ chosen: 'back_even', selected: 'unit' })
    }
  }
  pressFront_Odd() {
    if (var_num.length != 1) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်းတစ်လုံးတည်ဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'front_odd', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: 'M' + var_num })
    }
  }
  pressBack_Odd() {
    if (var_num.length != 1) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'back_odd', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: var_num + "S" })
    }
  }
  pressAP_() {
    if (var_num.length < 2 || var_num.length >= 10) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်း ၂လုံး(သို့)၉လုံး ဖြစ်ရမည်', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'ap-', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: var_num })
    }
  }
  pressAP() {
    if (var_num.length < 2 || var_num.length >= 10) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်း ၂လုံး(သို့)၉လုံး ဖြစ်ရမည်', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'ap', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: var_num })
    }
  }
  pressBack() {
    if (var_num.length != 1) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'back', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: var_num + '*' })
    }
  }
  pressInclude() {
    if (var_num.length != 1) {
      var_chosen = ''
      this.refs.err_toast.show('ဂဏန်းတစ်လုံးတည်းဖြစ်ရမည်။', 1000)
    } else {
      this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
      this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
      var_chosen = 'include', var_selected = 'unit'
      this.numComponent.setNativeProps({ text: var_num })
    }
  }
  renderModal() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalshow}
        onRequestClose={() => { this.setState({ modalshow: false }) }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#11030085" }}>
          <View style={{
            width: Math.round(Dimensions.get("window").width * 0.85)
            , height: height * 0.72
            , backgroundColor: "#fff", borderRadius: 10
          }}>
            <View style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={estyles.mmTitleText1}>ထည့်လိုသောစီးရီးကိုရွေးပါ။</Text>
            </View>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center' }}
              onPress={this.pressSeries.bind(this, 'sp')}>
              <Text style={[styles.mmmodalText, { marginLeft: 15 }]}>စုံပူး</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center' }}
              onPress={this.pressSeries.bind(this, 'mp')}>
              <Text style={[styles.mmmodalText, { marginLeft: 15 }]}>မပူး</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center' }}
              onPress={this.pressSeries.bind(this, 'ss')}>
              <Text style={[styles.mmmodalText, { marginLeft: 15 }]}>စုံစုံ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center' }}
              onPress={this.pressSeries.bind(this, 'mm')}>
              <Text style={[styles.mmmodalText, { marginLeft: 15 }]}>မမ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center' }}
              onPress={this.pressSeries.bind(this, 'sm')}>
              <Text style={[styles.mmmodalText, { marginLeft: 15 }]}>စုံမ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center' }}
              onPress={this.pressSeries.bind(this, 'ms')}>
              <Text style={[styles.mmmodalText, { marginLeft: 15 }]}>မစုံ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center' }}
              onPress={this.pressSeries.bind(this, 'nk')}>
              <Text style={[styles.mmmodalText, { marginLeft: 15 }]}>ညီကို</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center', alignItems: 'flex-end' }}
              onPress={() => { this.setState({ modalshow: false }) }}>
              <Text style={{ marginRight: 15, fontSize: 20, fontWeight: 'bold', color: 'red' }}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }
  _rowRenderer(type, item, index) {
    return (
      <View style={{ flexDirection: 'row', borderWidth: 0.5, borderBottomColor: 'gray', height: height * 0.08 }}>
        <View style={{ flex: 1.5, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[estyles.dataText]}>{this.state.data.length - index}</Text>
        </View>
        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={estyles.dataText}>{item.num}</Text>
        </View >
        <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={estyles.dataText}>{item.delete ? '' : item.unit}</Text>
        </View>
        <View style={{ flex: 2.2, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={estyles.dataText}>{item.showsummary ? item.summary : ''}</Text>
        </View>
        <TouchableOpacity style={{ flex: 1.3, justifyContent: 'center', alignItems: 'center' }}
          onPress={() => {
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
          <Image source={delete_icon} style={{ width: height * 0.04, height: height * 0.04, resizeMode: 'contain' }} />
        </TouchableOpacity>
      </View>
    );
  }
  renderMarqueeText() {
    let msg = ''
    this.state.hotnum.map((value, index) => {
      msg += value.Num + ', '
    })
    return (
      <View style={{
        backgroundColor: Color.Green,
        width: width,
        height: 30
      }}>
        <TextMarquee
          style={{ fontSize: 21, color: '#1b1b1b', fontWeight: 'bold' }}
          duration={msg.length > 50 ? msg.length * 200 : msg.length * 250}
          loop
          repeatSpacer={100}
          marqueeDelay={1000}
        >
          {msg}
        </TextMarquee>
      </View>
    )
  }
  renderViewModal() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.showViewModal}
        onRequestClose={() => {
          this.setState({
            showViewModal: false,
            viewData: []
          })
        }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#11030085" }}>
          <View style={{
            width: Math.round(Dimensions.get("window").width * 0.85)
            , height: height * 0.9
            , backgroundColor: "#fff", borderRadius: 10
          }}>
            <View style={{ width: width * 0.85, height: height * 0.08, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Color.DIVIDERCOLOR }}>
              <View style={{
                flex: 1,
                alignItems: 'center'
              }}>
                <Text style={estyles.mmTitleText1}>Num</Text>
              </View>
              <View style={{
                flex: 1,
                alignItems: 'flex-end',
                paddingRight: 10
              }}>
                <Text style={estyles.mmTitleText1}>Unit</Text>
              </View>
            </View>
            <ScrollView style={{
              width: Math.round(Dimensions.get("window").width * 0.85)
              , height: height * 0.56
            }}>
              <View>
                {
                  this.state.viewData.map((value, index) => (
                    <View
                      style={{
                        width: width * 0.85, height: height * 0.08, flexDirection: 'row',
                        alignItems: 'center', borderWidth: 1, borderColor: Color.DIVIDERCOLOR
                      }}
                      key={index}
                    >
                      <View style={{
                        flex: 1,
                        alignItems: 'center'
                      }}>
                        <Text style={estyles.mmTitleText1}>{value.Num}</Text>
                      </View>
                      <View style={{
                        flex: 1,
                        alignItems: 'flex-end',
                        paddingRight: 10
                      }}>
                        <Text style={estyles.mmTitleText1}>{value.Unit}</Text>
                      </View>
                    </View>
                  ))
                }
              </View>
            </ScrollView>
            <TouchableOpacity style={{ width: width * 0.85, height: height * 0.08, justifyContent: 'center', alignItems: 'flex-end' }}
              onPress={() => {
                this.setState({
                  showViewModal: false,
                  viewData: []
                })
              }}>
              <Text style={{ marginRight: 15, fontSize: 20, fontWeight: 'bold', color: 'red' }}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        {this.renderMarqueeText()}
        {this.renderTitle()}
        <View style={{ height: ((height * 0.76) - (StatusBar.currentHeight + 30)), width: width, backgroundColor: '#fff' }}>
          <RecyclerListView layoutProvider={this._layoutProvider}
            dataProvider={this.state.dataProvider}
            extendedState={this.state}
            ref={ref => this.flatList = ref}
            rowRenderer={this._rowRenderer} />
          {this.renderModal()}
        </View>
        {this.renderHotModal()}
        {this.renderSaveModal()}
        {this.renderSendModal()}
        {this.renderDirectBuyModal()}
        {this.renderButtons()}
        {this.renderViewModal()}
        {this.renderCombineModal()}
        {this.renderBuyNumModal()}
        <Animated.View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          width: width, height: this._width, backgroundColor: Color.lightGray, borderWidth: 0.5, borderTopColor: '#ffffff80',
        }}>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row' }}>
            <View style={{ flex: 1, alignItems: 'center', marginLeft: 10, flexDirection: 'row' }}>
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}
                onPress={() => {
                  if (this.state.sameUnit) {
                    this.setState({
                      sameUnit: false
                    })
                  } else {
                    this.setState({
                      sameUnit: true,
                      sameUnitR: false
                    })
                  }
                }}
              >
                <Image style={{ width: 25, height: 25, marginRight: 5 }} source={this.state.sameUnit ? tickIcon : untickIcon} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Color.PRIMARYCOLOR }}>နှုန်းတူ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10
              }}
                onPress={() => {
                  if (this.state.sameUnitR) {
                    this.setState({
                      sameUnitR: false
                    })
                  } else {
                    this.setState({
                      sameUnitR: true,
                      sameUnit: false
                    })
                  }
                }}
              >
                <Image style={{ width: 25, height: 25, marginRight: 5 }} source={this.state.sameUnitR ? tickIcon : untickIcon} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Color.PRIMARYCOLOR }}>နှုန်းတူR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  paddingVertical: 5,
                  backgroundColor: Color.PRIMARYCOLOR
                }}
                onPress={() => {
                  this.pressView()
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>?ကျန်</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  marginLeft: 10,
                  borderRadius: 5,
                  paddingVertical: 5,
                  backgroundColor: Color.PRIMARYCOLOR
                }}
                onPress={() => {
                  this.APISlipDetail(this.props.navigation.state.params.termdetailsid, var_num)
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>...</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'flex-end', marginHorizontal: 10 }}
              onPress={this._animateTo.bind(this,0)}>
              <Image source={close} style={{ width: 30, height: 30, tintColor: 'red' }} />
            </TouchableOpacity>
          </View>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>ဂဏန်း</Text>
            </View>

            <TouchableWithoutFeedback onPress={() => {
              this.numViewComponent.setNativeProps({ style: { borderColor: "red" } })
              this.unitViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
              var_selected = 'num'
            }} style={{ flex: 1 }}>
              <View style={{
                flex: 1, justifyContent: 'center', alignItems: 'center',
                marginLeft: 5, borderColor: 'red', borderRadius: 5, borderWidth: 2,
              }}
                ref={component => this.numViewComponent = component}>
                <TextInput editable={false} ref={component => this.numComponent = component}
                  underlineColorAndroid='transparent'
                  style={estyles.txtInput} />
              </View>
            </TouchableWithoutFeedback>

            <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>ယူနစ်</Text>
            </View>

            <TouchableWithoutFeedback onPress={() => {
              this.numViewComponent.setNativeProps({ style: { borderColor: Color.defaultGray } })
              this.unitViewComponent.setNativeProps({ style: { borderColor: "red" } })
              var_selected = 'unit'
            }} style={{ flex: 1 }}>
              <View style={{
                flex: 1, justifyContent: 'center', alignItems: 'center',
                marginLeft: 5, borderColor: Color.defaultGray, borderRadius: 5, borderWidth: 2,
              }}
                ref={component => this.unitViewComponent = component}>
                <TextInput editable={false} ref={component => this.unitComponent = component}
                  underlineColorAndroid='transparent'
                  style={estyles.txtInput} />
              </View>
            </TouchableWithoutFeedback>

          </View>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressFront_Even.bind(this)}>
              <Text style={styles.mmText}>ရှေ့စုံ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressBack_Even.bind(this)}
            >
              <Text style={styles.mmText}>နောက်စုံ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressFront_Odd.bind(this)}>
              <Text style={styles.mmText}>ရှေ့မ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressBack_Odd.bind(this)}>
              <Text style={styles.mmText}>နောက်မ</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressAP.bind(this)}>
              <Text style={styles.mmText}>အပြီး</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressAP_.bind(this)}
            >
              <Text style={styles.mmText}>အပြီး-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressFront.bind(this)}>
              {/* TZT */}
              <Text style={styles.mmText}>ပိတ်</Text>
              {/* <Text style={styles.mmText}>ပိတ္</Text> */}
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressBack.bind(this)}>
              <Text style={styles.mmText}>ထိပ်</Text>
              {/* <Text style={styles.mmText}>ထိပ္</Text> */}
            </TouchableOpacity>
          </View>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressPower.bind(this)}>
              <Text style={styles.mmText}>ပါဝါ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressN.bind(this)}
            >
              <Text style={styles.mmText}>နက္ခတ်</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressBreak.bind(this)}>
              <Text style={styles.mmText}>ဘရိတ်</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={() => { this.setState({ modalshow: true }) }}>
              <Text style={styles.mmText}>...</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '7')}>
              <Text style={styles.NumText}>7</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '8')}>
              <Text style={styles.NumText}>8</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '9')}>
              <Text style={styles.NumText}>9</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressInclude.bind(this)}>
              <Text style={styles.mmText}>အပါ</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '4')}>
              <Text style={styles.NumText}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '5')}>
              <Text style={styles.NumText}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '6')}>
              <Text style={styles.NumText}>6</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressTri.bind(this)}>
              <Text style={styles.mmText}>အပူး</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '1')}>
              <Text style={styles.NumText}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '2')}>
              <Text style={styles.NumText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '3')}>
              <Text style={styles.NumText}>3</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressReverse.bind(this)}>
              <Text style={styles.NumText}>R</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: width, height: height * 0.07, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressNum.bind(this, '0')}>
              <Text style={styles.NumText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.25) - 6.25, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginLeft: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressDelete.bind(this)}>
              <Text style={styles.NumText}>DEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: (width * 0.5) - 7.5, height: height * 0.06, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, backgroundColor: Color.lightGreen, borderRadius: 5 }}
              onPress={this.pressOk.bind(this)}>
              <Text style={styles.NumText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        <Toast
          ref="toast"
          style={{ backgroundColor: 'black' }}
          position='top'
          positionValue={200}
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
          textStyle={{ color: 'white' }}
        />
        <Toast
          ref="err_toast"
          style={{ backgroundColor: 'red' }}
          position='top'
          positionValue={200}
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
          textStyle={{ color: 'white' }}
        />
        <Loading show={this.state.loading} />
      </View>


    );
  }
}
const estyles = EStyleSheet.create({
  NumText: {
    fontSize: '20rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  btnText: {
    fontSize: '14rem',
    color: '#fff',
  },
  mmText: {
    fontSize: '14rem',
    color: '#000',
  },
  mmLargeText: {
    fontSize: '18rem',
    color: '#000',
  },
  mmTitleText1: {
    fontSize: '18rem',
    color: '#000',
  },
  mmTitleText: {
    fontSize: '18rem',
    color: '#fff',
  },
  dataText: {
    fontSize: '18rem',
    color: '#000',
    fontWeight: 'bold'
  },
  headerText: {
    fontSize: '16rem', color: '#fff'
  },
  txtInput: {
    color: "#000",
    fontWeight: 'bold',
    fontSize: '20rem',
    textAlign: 'center',
    paddingVertical: 4
  }
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: height * 0.08,
    width: null,
    alignItems: 'center',
    flexDirection: 'row',
  },
  NumText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  mmText: {
    fontSize: 14,
    color: 'black',
  },
  mmmodalText: {
    fontSize: 17,
    color: '#df923a',
  },
  biginputWrap: {
    flexDirection: "row",
    height: height * 0.24,
    width: width * 0.75,
    marginHorizontal: width * 0.05,
    backgroundColor: Color.lightGray,
    borderRadius: 5,
    marginVertical: 5,
  },
  inputWrap: {
    flexDirection: "row",
    height: height * 0.07,
    width: width * 0.75,
    marginHorizontal: width * 0.05,
    backgroundColor: Color.lightGray,
    borderRadius: 5
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    color: "#262626",
    fontSize: 13,
  },

});

module.exports = sale;
