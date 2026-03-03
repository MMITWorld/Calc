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
  TextInput,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Button,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  Picker,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import tickIcon from '../assets/images/tick.png'
import untickIcon from '../assets/images/untick.png'
import deleteIcon from '../assets/images/delete.png'
import dal from '../dal.js';
import back from "../assets/images/backward.png";
import Color from '../utils/Color.js'
const {width,height}=Dimensions.get('window')
let adminAuthedSession = false;

class UserProfile extends Component {
constructor(props) {
        super(props);
        this.state = {
          name:'',
          oldpass:'',
          typedOldPass:'',
          newpass:'',
          phno:'',
          layoutWidth:58,
          lg:'uni',
          pSize:"22",
          directBuyEnabled:false,
          ledgerShareEnabled:false,
          showDirectBuyModal:false,
          apiEndpoint:'',
          directBuySupplier:'',
          directBuySuppliers:[],
          supplierList:[],
          supplierLoading:false,
          showSupplierEntry:false,
          showSupplierListModal:false,
          directBuyWebsite:'',
          directBuyUserNo:'',
          directBuyPassword:'',
          directBuyServerUnit:'',
          directBuyUserUnit:'',
          directBuyOver:false,
          directBuy2D:false,
          directBuy3D:false,
          directBuyOverAmount:'',
          directBuySrNo:'',
          directBuyStatus:'New',
          showLedgerShareModal:false,
          ledgerShareGroups:[],
          ledgerShareGroupId:'',
          ledgerShareLoading:false
          ,showLedgerGroupNewModal:false
          ,ledgerGroupName:''
          ,showLedgerGroupEditModal:false
          ,ledgerGroupEditName:''
          ,ledgerGroupEditId:''
          ,ledgerShareUsers:[]
          ,ledgerShareUsersLoading:false
          ,showLedgerShareEditModal:false
          ,ledgerShareEditUserNo:''
          ,ledgerShareEditBreak:''
          ,ledgerShareEditPercent:''
          ,ledgerShareEditItem:null
          ,ledgerShareEditStatus:'Edit'
          ,showLedgerShareUserModal:false
          ,ledgerShareUserNo:''
          ,ledgerShareUserBreak:''
          ,ledgerShareUserPercent:''
          ,ledgerShareUserItem:null
          ,showLedgerShareAddModal:false
          ,ledgerShareAddBreak:''
          ,ledgerShareAddPercent:''
          ,ledgerShareAddItem:null
          ,ledgerShareNewUsers:[]
          ,ledgerShareNewUsersLoading:false
          ,showLedgerShareNewUsers:true
          ,showTutorialModal:false
          ,tutorialList:[]
          ,tutorialLoading:false
          ,tutorialListIsAdmin:true
          ,showTutorialAddModal:false
          ,tutorialStatus:'New'
          ,tutorialId:''
          ,tutorialSrNo:''
          ,tutorialTitle:''
          ,tutorialDescription:''
          ,tutorialYoutubeLink:''
          ,tutorialIsAdmin:false
          ,showTelegramBotModal:false
          ,telegramBotList:[]
          ,telegramBotLoading:false
          ,showTelegramBotAddModal:false
          ,telegramBotStatus:'New'
          ,telegramBotId:''
          ,telegramBotUserName:''
          ,telegramBotBotName:''
          ,telegramBotApi:''
          ,telegramBotToken:''
          ,telegramBotOwnerId:''
          ,showAdminLogin:false
          ,adminLoginUser:''
          ,adminLoginPass:''
          ,adminAuthed:adminAuthedSession
          ,adminLoginTarget:''
        }
    }
 
    async componentDidMount() {
      const pSize=await AsyncStorage.getItem('pSize')||"22"
      const layoutWidth=await AsyncStorage.getItem('layoutWidth')||58
      const lg=await AsyncStorage.getItem('lg')||'uni'
      const directBuyEnabled=await AsyncStorage.getItem('directBuyEnabled')||"false"
      const ledgerShareEnabled=await AsyncStorage.getItem('ledgerShareEnabled')||"false"
      const endpoint=await AsyncStorage.getItem('endpoint')||""
      const directBuySuppliers=[]
      if(endpoint){
        dal.getSupplier(endpoint,(err,resp)=>{
          if(!err && resp){
            const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
            this.setState({ directBuySuppliers: list })
          }
        })
      }
      this.setState({
        layoutWidth:layoutWidth,
        lg:lg,
        pSize:pSize,
        directBuyEnabled:directBuyEnabled=='true'?true:false,
        ledgerShareEnabled:ledgerShareEnabled=='true'?true:false,
        apiEndpoint: endpoint,
        directBuySuppliers
      })
      
    }

  
    componentWillUnmount() {
      // Remember to remove listener
      AsyncStorage.setItem('lg',this.state.lg)
      AsyncStorage.setItem('layoutWidth',this.state.layoutWidth.toString())
      AsyncStorage.setItem('directBuyEnabled',this.state.directBuyEnabled?'true':'false')
      AsyncStorage.setItem('ledgerShareEnabled',this.state.ledgerShareEnabled?'true':'false')
    }
    renderHeader(){
      return(
        <View style={[styles.header,{backgroundColor:Color.PRIMARYCOLOR}]}>
              <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} 
                onPress={()=>{this.props.navigation.goBack()}}>
                <Image source={back} style={{width:30,height:30,resizeMode:"contain",marginHorizontal:10,tintColor:'#fff'}}/>
              </TouchableOpacity>
              <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                  <Text style={{color:'#fff',fontSize:16,fontWeight:'bold'}}>Setting</Text>
              </View>
              <View style={{flexDirection:'row',alignItems:'center',marginRight:10}}>
                {this.state.apiEndpoint && this.state.apiEndpoint.includes('zzz2323.com') ? (
                <TouchableOpacity
                  onPress={() => {
                    if(!this.state.adminAuthed){
                      this.setState({ showAdminLogin:true, adminLoginTarget:'telegram' })
                      return;
                    }
                    this.setState({ showTelegramBotModal:true, telegramBotLoading:true }, () => {
                      dal.getTelegramBotList((err, resp) => {
                        if (!err && resp) {
                          const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                          this.setState({ telegramBotList:list, telegramBotLoading:false });
                        } else {
                          this.setState({ telegramBotLoading:false });
                        }
                      })
                    })
                  }}
                  style={{paddingHorizontal:12,height:28,borderRadius:4,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginRight:8}}
                >
                  <Text style={{color:Color.PRIMARYCOLOR,fontSize:12,fontWeight:'bold'}}>Telegram Bot</Text>
                </TouchableOpacity>
                ) : null}
                {this.state.apiEndpoint && this.state.apiEndpoint.includes('zzz2323.com') ? (
                <TouchableOpacity
                  onPress={() => {
                    if(!this.state.adminAuthed){
                      this.setState({ showAdminLogin:true, adminLoginTarget:'tutorial' })
                      return;
                    }
                    this.setState({ showTutorialModal: true, tutorialLoading: true, tutorialListIsAdmin: true }, () => {
                      if (this.state.apiEndpoint) {
                        dal.getTutorialList(this.state.apiEndpoint, true, (err, resp) => {
                          if (!err && resp) {
                            const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                            this.setState({ tutorialList: list, tutorialLoading: false });
                          } else {
                            this.setState({ tutorialLoading: false });
                          }
                        })
                      } else {
                        this.setState({ tutorialLoading: false });
                      }
                    })
                  }}
                  style={{paddingHorizontal:12,height:28,borderRadius:4,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}}
                >
                  <Text style={{color:Color.PRIMARYCOLOR,fontSize:12,fontWeight:'bold'}}>Add Tutorial</Text>
                </TouchableOpacity>
                ) : null}
              </View>
          </View>
      )
    }
  render() {
      return (
        <View style={styles.container}>
            {this.renderHeader()}
            <View style={{
              flexDirection:'row',
              marginHorizontal:5,
              marginBottom:10,
              justifyContent:'center',
              marginTop:height*0.2
            }}>
              <Text style={{color:'#262626',fontSize:18,fontWeight:'bold'}}>Language :  </Text>
              <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                  onPress={()=>{
                      this.setState({
                        lg:'uni'
                      })
                  }}>
                  <Image source={this.state.lg=='uni'?radio_btn_selected:radio_btn_unselected} 
                  style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                  <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>Unicode</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                  onPress={()=>{
                      this.setState({
                        lg:'zg'
                      })
                  }}>
                  <Image source={this.state.lg=='zg'?radio_btn_selected:radio_btn_unselected} 
                  style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                  <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>Zawgyi</Text>
              </TouchableOpacity>
            </View>
            <View style={{
              flexDirection:'row',
              marginHorizontal:5,
              marginVertical:10,
              justifyContent:'center'
            }}>
              <Text style={{color:'#262626',fontSize:18,fontWeight:'bold'}}>Paper Size :  </Text>
              <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                  onPress={()=>{
                      this.setState({
                        layoutWidth:58
                      })
                  }}>
                  <Image source={this.state.layoutWidth==58?radio_btn_selected:radio_btn_unselected} 
                  style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                  <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>58 MM</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                  onPress={()=>{
                      this.setState({
                        layoutWidth:80
                      })
                  }}>
                  <Image source={this.state.layoutWidth==80?radio_btn_selected:radio_btn_unselected} 
                  style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                  <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>80 MM</Text>
              </TouchableOpacity>
            </View>
            <View style={{
              flexDirection:'row',
              marginHorizontal:10,
              marginTop:0,
              marginBottom:0,
              alignItems:'center',
              justifyContent:'center'
            }}>
              <Text style={{color:'#262626',fontSize:18,fontWeight:'bold'}}>Print Font Size :  </Text>
              <View style={{
                flexDirection  : "row",
                height         : 40,
                backgroundColor: "transparent",
                borderRadius:5,
                borderWidth: 1,
                borderColor: 'gray',
              }}>
                  <TextInput
                    style                 = {{
                      width             : width*0.4,
                      paddingHorizontal: 10,
                      backgroundColor  : "transparent",
                      color            : "#000",
                      fontSize         : 14
                    }}
                    placeholderTextColor  = "#000"
                    keyboardType='decimal-pad'
                    value={this.state.pSize.toString()}
                    underlineColorAndroid = "transparent"
                    onChangeText          = {(text)=>{
                      this.setState({pSize:text})
                    }}
                  />
                </View>
            </View>
            <View style={{
              flexDirection:'row',
              marginHorizontal:5,
              marginVertical:10,
              alignItems:'center',
              justifyContent:'center'
            }}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({ showSupplierListModal: true, supplierLoading: true }, () => {
                    if (this.state.apiEndpoint) {
                      dal.getSupplierList(this.state.apiEndpoint, (err, resp) => {
                        if (!err && resp) {
                          const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                          this.setState({ supplierList: list, supplierLoading: false });
                        } else {
                          this.setState({ supplierLoading: false });
                        }
                      })
                    } else {
                      this.setState({ supplierLoading: false });
                    }
                  })
                }}
                style={{
                  flex:1,
                  marginHorizontal:5,
                  height:40,
                  borderRadius:5,
                  backgroundColor: Color.PRIMARYCOLOR,
                  alignItems:'center',
                  justifyContent:'center'
                }}>
                <Text style={{color:'#fff',fontSize:15,fontWeight:'bold'}}>Suppler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.setState({ showLedgerShareModal: true, ledgerShareLoading: true }, () => {
                    if (this.state.apiEndpoint) {
                      dal.getGroup(this.state.apiEndpoint, (err, resp) => {
                        if (!err && resp) {
                          const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                          this.setState({ ledgerShareGroups: list, ledgerShareLoading: false });
                        } else {
                          this.setState({ ledgerShareLoading: false });
                        }
                      })
                    } else {
                      this.setState({ ledgerShareLoading: false });
                    }
                  })
                }}
                style={{
                  flex:1,
                  marginHorizontal:5,
                  height:40,
                  borderRadius:5,
                  backgroundColor: this.state.ledgerShareEnabled ? Color.Green : '#ccc',
                  alignItems:'center',
                  justifyContent:'center'
                }}>
                <Text style={{color:'#fff',fontSize:15,fontWeight:'bold'}}>Ledger Share</Text>
              </TouchableOpacity>
            </View>
            <View style={{flex:1,justifyContent:'flex-end',paddingBottom:10}}>
                  <TouchableOpacity onPress={()=>{
                      if(this.state.pSize==''){
                        Alert.alert(dal.APP_NAME,'Please enter the font size')
                        return;
                      }else{
                        AsyncStorage.setItem('pSize',this.state.pSize.toString())
                        AsyncStorage.setItem('lg',this.state.lg)
                        AsyncStorage.setItem('layoutWidth',this.state.layoutWidth.toString())
                        this.props.navigation.goBack()
                      }
                    }} style={{height:45,backgroundColor: Color.darkGreen,marginHorizontal:20,
                    alignItems     : "center",
                    justifyContent : "center",padding:10,borderRadius:5}}>
                      <Text style={styles.buttonText}>
                        SAVE FONT SIZE
                      </Text>
                  </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{
                        AsyncStorage.removeItem('user')
                        this.props.navigation.navigate('Login')  
                    }} style={{height:45,backgroundColor: Color.yellow,marginHorizontal:20,
                        alignItems     : "center",
                        marginTop:10,
                        justifyContent : "center",padding:10,borderRadius:5}}>
                        <Text style={[styles.buttonText,{color:'#fff'}]}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            <Modal
              transparent={true}
              visible={this.state.showSupplierListModal}
              onRequestClose={() => this.setState({ showSupplierListModal: false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066'}}>
                <View style={{flex:1,width:'100%',height:'100%',backgroundColor:'#fff',padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Supplier List</Text>
                  <View style={{maxHeight:200,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:6,marginBottom:10}}>
                    <View style={{flexDirection:'row',paddingVertical:6,backgroundColor:'#f5f5f5',borderBottomWidth:1,borderColor:'#eee'}}>
                      <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>Name</Text>
                      <Text style={{flex:1,textAlign:'center',fontSize:12,fontWeight:'bold'}}>Server</Text>
                      <Text style={{flex:1,textAlign:'center',fontSize:12,fontWeight:'bold'}}>User</Text>
                      <Text style={{width:36,textAlign:'center',fontSize:12,fontWeight:'bold'}}></Text>
                    </View>
                    {this.state.supplierLoading ? (
                      <View style={{padding:10}}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <ScrollView>
                        {this.state.supplierList.map((item, idx) => (
                          <View
                            key={idx}
                            style={{flexDirection:'row',paddingVertical:8,paddingHorizontal:10,borderBottomWidth:1,borderColor:'#eee'}}
                          >
                            <TouchableOpacity
                              style={{flex:1,flexDirection:'row'}}
                              onPress={() => {
                                const lottType = (item.LottType || '').toString();
                                this.setState({
                                  showSupplierListModal:false,
                                  showDirectBuyModal:true,
                                  showSupplierEntry:true,
                                  directBuyStatus:'Edit',
                                  directBuySupplier: item.SupplierID || item.UserID || '',
                                  directBuyWebsite: item.Website || item.URL || '',
                                  directBuyUserNo: item.UserNo || '',
                                  directBuyPassword: item.Password || '',
                                  directBuyServerUnit: (item.ServerUnit ?? '').toString(),
                                  directBuyUserUnit: (item.UserUnit ?? '').toString(),
                                  directBuyOver: item.IsOver == 1 || item.IsOver === true,
                                  directBuy2D: lottType.includes('2'),
                                  directBuy3D: lottType.includes('3'),
                                  directBuyOverAmount: (item.OverAmt ?? '').toString(),
                                  directBuySrNo: (item.SrNo ?? '').toString()
                                })
                              }}
                            >
                              <Text style={{flex:2,fontSize:13,textAlign:'center'}}>{item.Name || item.UserNo}</Text>
                              <Text style={{flex:1,textAlign:'center',fontSize:13}}>{item.ServerUnit}</Text>
                              <Text style={{flex:1,textAlign:'center',fontSize:13}}>{item.UserUnit}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{width:36,alignItems:'center',justifyContent:'center'}}
                              onPress={() => {
                                const supplierId = item.SupplierID || item.UserID || '';
                                if (!supplierId) {
                                  Alert.alert(dal.APP_NAME || 'App','Invalid supplier!');
                                  return;
                                }
                                Alert.alert('','Delete this supplier?',
                                [
                                  { text:'Cancel' },
                                  { text:'Delete', onPress:()=>{
                                    const lottType = (item.LottType || '').toString();
                                    const isOver = item.IsOver == 1 || item.IsOver === true ? 1 : 0;
                                    dal.saveSupplier(
                                      this.state.apiEndpoint || '',
                                      supplierId,
                                      item.Website || item.URL || '',
                                      item.UserNo || '',
                                      item.Password || '',
                                      Number(item.ServerUnit || 0),
                                      Number(item.UserUnit || 0),
                                      isOver,
                                      Number(item.OverAmt || 0),
                                      lottType,
                                      Number(item.SrNo || 0),
                                      'Delete',
                                      (err, resp) => {
                                        if (err) {
                                          Alert.alert(dal.APP_NAME || 'App','Delete failed!');
                                          return;
                                        }
                                        if (resp === 'OK' || resp?.Status === 'OK' || resp?.Msg === 'OK') {
                                          Alert.alert(dal.APP_NAME || 'App','Delete OK!');
                                          this.setState({ supplierLoading:true }, () => {
                                            if (this.state.apiEndpoint) {
                                              dal.getSupplierList(this.state.apiEndpoint, (err2, resp2) => {
                                                if (!err2 && resp2) {
                                                  const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                                  this.setState({ supplierList: list, supplierLoading:false });
                                                } else {
                                                  this.setState({ supplierLoading:false });
                                                }
                                              })
                                            } else {
                                              this.setState({ supplierLoading:false });
                                            }
                                          })
                                        } else {
                                          Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp));
                                        }
                                      }
                                    )
                                  }}
                                ])
                              }}
                            >
                              <Image source={deleteIcon} style={{width:18,height:18,tintColor:'#cc0000'}} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  <View style={{flexDirection:'row',marginTop:8}}>
                    <TouchableOpacity
                      onPress={() => this.setState({ showSupplierListModal: false })}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          showSupplierListModal:false,
                          showDirectBuyModal:true,
                          showSupplierEntry:true,
                          directBuyStatus:'New',
                          directBuySupplier:'',
                          directBuyWebsite:'',
                          directBuyUserNo:'',
                          directBuyPassword:'',
                          directBuyServerUnit:'',
                          directBuyUserUnit:'',
                          directBuyOver:false,
                          directBuy2D:false,
                          directBuy3D:false,
                          directBuyOverAmount:'',
                          directBuySrNo:''
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.Green,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>NEW</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showDirectBuyModal}
              onRequestClose={() => this.setState({ showDirectBuyModal: false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.9,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>
                    {this.state.directBuyStatus === 'Edit' ? 'Edit Supplier' : 'New Supplier'}
                  </Text>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Supplier</Text>
                    <View style={styles.modalInputWrap}>
                      <Picker
                        selectedValue={this.state.directBuySupplier}
                        style={{height:38}}
                        onValueChange={(v)=>this.setState({directBuySupplier:v})}
                      >
                        <Picker.Item label="Select Supplier" value="" />
                        {this.state.directBuySuppliers.map((s,idx)=>(
                          <Picker.Item label={s.Name || s.UserNo} value={s.SupplierID || s.UserID || ''} key={idx} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Website</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.directBuyWebsite}
                        onChangeText={(t)=>this.setState({directBuyWebsite:t})}
                        placeholder="Website"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>User No</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.directBuyUserNo}
                        onChangeText={(t)=>this.setState({directBuyUserNo:t})}
                        placeholder="User No"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Password</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.directBuyPassword}
                        onChangeText={(t)=>this.setState({directBuyPassword:t})}
                        placeholder="Password"
                        secureTextEntry
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Server Unit</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.directBuyServerUnit}
                        onChangeText={(t)=>this.setState({directBuyServerUnit:t})}
                        placeholder="Server Unit"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>User Unit</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.directBuyUserUnit}
                        onChangeText={(t)=>this.setState({directBuyUserUnit:t})}
                        placeholder="User Unit"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:8}}>
                    {[
                      {key:'directBuyOver',label:'Over'},
                      {key:'directBuy2D',label:'2D'},
                      {key:'directBuy3D',label:'3D'},
                    ].map((c)=>(
                      <TouchableOpacity
                        key={c.key}
                        style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}}
                        onPress={()=>this.setState({[c.key]:!this.state[c.key]})}
                      >
                        <Image
                          source={this.state[c.key]?tickIcon:untickIcon}
                          style={{width:20,height:20,marginRight:6,tintColor:Color.PRIMARYCOLOR}}
                        />
                        <Text style={{fontSize:14,fontWeight:'bold'}}>{c.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={[styles.modalRow,{marginTop:6}]}>
                    <Text style={styles.modalLabel}>Over Amount</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.directBuyOverAmount}
                        onChangeText={(t)=>this.setState({directBuyOverAmount:t})}
                        placeholder="Over Amount"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Sr No</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.directBuySrNo}
                        onChangeText={(t)=>this.setState({directBuySrNo:t})}
                        placeholder="Sr No"
                      />
                    </View>
                  </View>

                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={()=>this.setState({showDirectBuyModal:false, showSupplierListModal:true})}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={()=>{
                        if (!this.state.directBuySupplier) {
                          Alert.alert(dal.APP_NAME || 'App','Please select supplier');
                          return;
                        }
                        if (!this.state.directBuyWebsite || !this.state.directBuyWebsite.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter website');
                          return;
                        }
                        if (!this.state.directBuyUserNo || !this.state.directBuyUserNo.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter user no');
                          return;
                        }
                        if (!this.state.directBuyPassword || !this.state.directBuyPassword.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter password');
                          return;
                        }
                        if (this.state.directBuyServerUnit === '' || this.state.directBuyServerUnit === null || this.state.directBuyServerUnit === undefined) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter server unit');
                          return;
                        }
                        if (this.state.directBuyUserUnit === '' || this.state.directBuyUserUnit === null || this.state.directBuyUserUnit === undefined) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter user unit');
                          return;
                        }
                        const lottType =
                          (this.state.directBuy2D ? '2' : '') +
                          (this.state.directBuy3D ? '3' : '');
                        const isOver = this.state.directBuyOver ? 1 : 0;
                        const supplierId = this.state.directBuySupplier || '';
                        dal.saveSupplier(
                          this.state.apiEndpoint || '',
                          supplierId,
                          this.state.directBuyWebsite,
                          this.state.directBuyUserNo,
                          this.state.directBuyPassword,
                          Number(this.state.directBuyServerUnit || 0),
                          Number(this.state.directBuyUserUnit || 0),
                          isOver,
                          Number(this.state.directBuyOverAmount || 0),
                          lottType,
                          Number(this.state.directBuySrNo || 0),
                          this.state.directBuyStatus || 'New',
                          (err, resp) => {
                            if (err) {
                              Alert.alert(dal.APP_NAME, 'Save failed!');
                              return;
                            }
                            if (resp === 'OK' || resp?.Status === 'OK' || resp?.Msg === 'OK') {
                              Alert.alert(dal.APP_NAME, 'Save OK!');
                              AsyncStorage.removeItem('directBuySupplier')
                              AsyncStorage.removeItem('directBuyWebsite')
                              AsyncStorage.removeItem('directBuyUserNo')
                              AsyncStorage.removeItem('directBuyPassword')
                              AsyncStorage.removeItem('directBuyServerUnit')
                              AsyncStorage.removeItem('directBuyUserUnit')
                              AsyncStorage.removeItem('directBuyOver')
                              AsyncStorage.removeItem('directBuy2D')
                              AsyncStorage.removeItem('directBuy3D')
                              AsyncStorage.removeItem('directBuyOverAmount')
                              AsyncStorage.removeItem('directBuySrNo')
                              this.setState({
                                directBuySupplier:'',
                                directBuyWebsite:'',
                                directBuyUserNo:'',
                                directBuyPassword:'',
                                directBuyServerUnit:'',
                                directBuyUserUnit:'',
                                directBuyOver:false,
                                directBuy2D:false,
                                directBuy3D:false,
                                directBuyOverAmount:'',
                                directBuySrNo:'',
                                showDirectBuyModal:false,
                                showSupplierListModal:true,
                                directBuyStatus:'New',
                                supplierLoading:true
                              }, () => {
                                if (this.state.apiEndpoint) {
                                  dal.getSupplierList(this.state.apiEndpoint, (err2, resp2) => {
                                    if (!err2 && resp2) {
                                      const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                      this.setState({ supplierList: list, supplierLoading:false });
                                    } else {
                                      this.setState({ supplierLoading:false });
                                    }
                                  })
                                } else {
                                  this.setState({ supplierLoading:false });
                                }
                              })
                              return;
                            } else {
                              Alert.alert(dal.APP_NAME, typeof resp === 'string' ? resp : JSON.stringify(resp));
                            }
                          }
                        )
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={false}
              visible={this.state.showLedgerShareModal}
              onRequestClose={() => this.setState({ showLedgerShareModal: false })}
            >
              <View style={{flex:1,backgroundColor:'#fff'}}>
                <View style={{flex:1,width:'100%',height:'100%',backgroundColor:'#fff',padding:16}}>
                  <View style={{flex:1}}>
                  <ScrollView nestedScrollEnabled={true} contentContainerStyle={{paddingBottom:80}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Ledger Share</Text>
                  <View style={styles.modalRow}>
                    <Text style={[styles.modalLabel,{width:60}]}>Group</Text>
                    <View style={[styles.modalInputWrap,{flex:2.8,height:38}]}>
                      {this.state.ledgerShareLoading ? (
                        <ActivityIndicator />
                      ) : (
                        <Picker
                          selectedValue={this.state.ledgerShareGroupId}
                          style={{height:38}}
                          onValueChange={(v)=>{
                            this.setState({
                              ledgerShareGroupId:v,
                              ledgerShareUsersLoading:true,
                              ledgerShareUsers:[],
                              ledgerShareNewUsersLoading:true,
                              ledgerShareNewUsers:[]
                            }, () => {
                              if (!v) {
                                this.setState({ ledgerShareUsersLoading:false, ledgerShareNewUsersLoading:false });
                                return;
                              }
                              if (this.state.apiEndpoint) {
                                dal.getUserByLedgerShareGroupID(this.state.apiEndpoint, v, (err, resp) => {
                                  console.warn('getUserByLedgerShareGroupID', err, resp);
                                  if (!err && resp) {
                                    const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                                    this.setState({ ledgerShareUsers: list, ledgerShareUsersLoading:false });
                                  } else {
                                    this.setState({ ledgerShareUsersLoading:false });
                                  }
                                })
                                dal.getNewUser(this.state.apiEndpoint, v, (errN, respN) => {
                                  console.warn('getNewUser', errN, respN);
                                  if (!errN && respN) {
                                    const listN = Array.isArray(respN.Data) ? respN.Data : (Array.isArray(respN) ? respN : []);
                                    this.setState({ ledgerShareNewUsers: listN, ledgerShareNewUsersLoading:false });
                                  } else {
                                    this.setState({ ledgerShareNewUsersLoading:false });
                                  }
                                })
                              } else {
                                this.setState({ ledgerShareUsersLoading:false, ledgerShareNewUsersLoading:false });
                              }
                            })
                          }}
                        >
                          <Picker.Item label="Select Group" value="" />
                          {this.state.ledgerShareGroups.map((g,idx)=>(
                            <Picker.Item label={g.Name} value={g.LedgerShareGroupID} key={idx} />
                          ))}
                        </Picker>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={()=>{
                        const selId = this.state.ledgerShareGroupId;
                        if(!selId){
                          Alert.alert(dal.APP_NAME || 'App','Please select Group')
                          return;
                        }
                        const sel = (this.state.ledgerShareGroups || []).find(g => g.LedgerShareGroupID == selId);
                        this.setState({
                          showLedgerGroupEditModal:true,
                          ledgerGroupEditId: selId,
                          ledgerGroupEditName: sel ? sel.Name : ''
                        })
                      }}
                      style={{height:38,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',paddingHorizontal:10,marginLeft:6}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>EDIT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={()=>this.setState({showLedgerGroupNewModal:true, ledgerGroupName:''})}
                      style={{height:38,backgroundColor:Color.Green,borderRadius:5,alignItems:'center',justifyContent:'center',paddingHorizontal:10,marginLeft:6}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>NEW</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{marginTop:12,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:6,maxHeight:360}}>
                    <View style={{flexDirection:'row',paddingVertical:6,backgroundColor:'#f5f5f5',borderBottomWidth:1,borderColor:'#eee',alignItems:'center'}}>
                      <View style={{flex:2}}>
                        <Text style={{textAlign:'center',fontSize:12,fontWeight:'bold'}}>User No</Text>
                      </View>
                      <View style={{flex:1}}>
                        <Text style={{textAlign:'center',fontSize:12,fontWeight:'bold'}}>Break</Text>
                      </View>
                      <View style={{flex:1}}>
                        <Text style={{textAlign:'center',fontSize:12,fontWeight:'bold'}}>%</Text>
                      </View>
                      <View style={{width:24,marginLeft:6}} />
                    </View>
                    {this.state.ledgerShareUsersLoading ? (
                      <View style={{padding:10}}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <ScrollView nestedScrollEnabled={true}>
                        {this.state.ledgerShareUsers.map((item, idx) => {
                          const breakVal = item.LdgBreak ?? item.Break ?? item.UnitBreak ?? item.BreakAmount ?? '';
                          const percentVal = item.LdgP ?? item.Percent ?? item.Percentage ?? item.Pct ?? item['%'] ?? '';
                          return (
                            <View
                              key={idx}
                              style={{flexDirection:'row',paddingVertical:8,paddingHorizontal:10,borderBottomWidth:1,borderColor:'#eee',alignItems:'center'}}
                            >
                              <TouchableOpacity
                                style={{flex:1,flexDirection:'row',alignItems:'center'}}
                                onPress={()=>{
                                  this.setState({
                                    showLedgerShareUserModal:true,
                                    ledgerShareUserItem: item,
                                    ledgerShareUserNo: item.UserNo || '',
                                    ledgerShareUserBreak: (item.LdgBreak ?? item.Break ?? item.UnitBreak ?? item.BreakAmount ?? '').toString(),
                                    ledgerShareUserPercent: (item.LdgP ?? item.Percent ?? item.Percentage ?? item.Pct ?? item['%'] ?? '').toString()
                                  })
                                }}
                              >
                                <View style={{flex:2,alignItems:'center'}}>
                                  <Text style={{fontSize:13,textAlign:'center'}}>{item.UserNo || item.UserID || ''}</Text>
                                </View>
                                <View style={{flex:1,alignItems:'center'}}>
                                  <Text style={{fontSize:13}}>{breakVal}</Text>
                                </View>
                                <View style={{flex:1,alignItems:'center'}}>
                                  <Text style={{fontSize:13}}>{percentVal}</Text>
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  Alert.alert(
                                    dal.APP_NAME || 'App',
                                    'Are you sure you want to delete?',
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                      {
                                        text: 'OK',
                                        onPress: () => {
                                          const data=[]
                                          data.push({
                                            LedgerShareUserID: item.LedgerShareUserID || item.LedgerShareID,
                                            LedgerShareGroupID: item.LedgerShareGroupID || this.state.ledgerShareGroupId,
                                            UserID: item.UserID,
                                            TelegramID: item.TelegramID,
                                            UserNo: item.UserNo,
                                            PhoneNo: item.PhoneNo,
                                            LdgBreak: Number(item.LdgBreak ?? item.Break ?? item.UnitBreak ?? item.BreakAmount ?? 0),
                                            LdgP: Number(item.LdgP ?? item.Percent ?? item.Percentage ?? item.Pct ?? item['%'] ?? 0)
                                          })
                                          dal.saveBreakAndPercentage(this.state.apiEndpoint || '',data,'Delete',(err,resp)=>{
                                            if(err){
                                              Alert.alert(dal.APP_NAME || 'App','Delete failed!')
                                              return;
                                            }
                                            if(resp=='OK' || resp?.Status=='OK'){
                                              Alert.alert(dal.APP_NAME || 'App','Delete OK!')
                                              const gid = this.state.ledgerShareGroupId;
                                              if (gid && this.state.apiEndpoint) {
                                                this.setState({ ledgerShareUsersLoading: true, ledgerShareNewUsersLoading: true });
                                                dal.getUserByLedgerShareGroupID(this.state.apiEndpoint, gid, (err2, resp2) => {
                                                  if (!err2 && resp2) {
                                                    const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                                    this.setState({ ledgerShareUsers: list, ledgerShareUsersLoading:false });
                                                  } else {
                                                    this.setState({ ledgerShareUsersLoading:false });
                                                  }
                                                })
                                                dal.getNewUser(this.state.apiEndpoint, gid, (errN, respN) => {
                                                  if (!errN && respN) {
                                                    const listN = Array.isArray(respN.Data) ? respN.Data : (Array.isArray(respN) ? respN : []);
                                                    this.setState({ ledgerShareNewUsers: listN, ledgerShareNewUsersLoading:false });
                                                  } else {
                                                    this.setState({ ledgerShareNewUsersLoading:false });
                                                  }
                                                })
                                              }
                                            }else{
                                              Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp))
                                            }
                                          })
                                        }
                                      }
                                    ],
                                    { cancelable: true }
                                  )
                                }}
                                style={{width:24,height:24,alignItems:'center',justifyContent:'center',marginLeft:6}}
                              >
                                <Image source={deleteIcon} style={{width:16,height:16,tintColor:'#ff1744'}} />
                              </TouchableOpacity>
                            </View>
                          )
                        })}
                      </ScrollView>
                    )}
                    <View style={{flexDirection:'row',paddingVertical:8,paddingHorizontal:10,backgroundColor:'#f5f5f5',borderTopWidth:1,borderColor:'#eee',alignItems:'center'}}>
                      <View style={{flex:2,alignItems:'center'}}>
                        <Text style={{fontSize:12,fontWeight:'bold'}}>Total</Text>
                      </View>
                      <View style={{flex:1,alignItems:'center'}}>
                        <Text style={{fontSize:12,fontWeight:'bold'}}>
                          {dal.numberWithCommas((this.state.ledgerShareUsers || []).reduce((sum, item) => sum + Number(item.LdgBreak ?? item.Break ?? item.UnitBreak ?? item.BreakAmount ?? 0), 0))}
                        </Text>
                      </View>
                      <View style={{flex:1,alignItems:'center'}}>
                        <Text style={{fontSize:12,fontWeight:'bold'}}>
                          {dal.numberWithCommas((this.state.ledgerShareUsers || []).reduce((sum, item) => sum + Number(item.LdgP ?? item.Percent ?? item.Percentage ?? item.Pct ?? item['%'] ?? 0), 0))}
                        </Text>
                      </View>
                      <View style={{width:24,marginLeft:6}} />
                    </View>
                  </View>
                  {this.state.showLedgerShareNewUsers && (
                    <>
                      <Text style={{fontSize:16,fontWeight:'bold',marginTop:30,marginBottom:6}}>New Users</Text>
                      <View style={{borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:6,maxHeight:200}}>
                        <View style={{flexDirection:'row',paddingVertical:6,backgroundColor:'#f5f5f5',borderBottomWidth:1,borderColor:'#eee'}}>
                          <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>User No</Text>
                          <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>Phone No</Text>
                        </View>
                        {this.state.ledgerShareNewUsersLoading ? (
                          <View style={{padding:10}}>
                            <ActivityIndicator />
                          </View>
                        ) : (
                          <ScrollView nestedScrollEnabled={true}>
                            {this.state.ledgerShareNewUsers.map((item, idx) => (
                              <TouchableOpacity
                                key={idx}
                                style={{flexDirection:'row',paddingVertical:8,paddingHorizontal:10,borderBottomWidth:1,borderColor:'#eee'}}
                                onPress={()=>{
                                  this.setState({
                                    showLedgerShareNewUsers:false,
                                    showLedgerShareAddModal:true,
                                    ledgerShareAddItem: item,
                                    ledgerShareAddBreak: (item.LdgBreak ?? item.Break ?? item.UnitBreak ?? item.BreakAmount ?? '').toString(),
                                    ledgerShareAddPercent: (item.LdgP ?? item.Percent ?? item.Percentage ?? item.Pct ?? item['%'] ?? '').toString()
                                  })
                                }}
                              >
                                <Text style={{flex:2,fontSize:13}}>{item.UserNo || item.UserID || ''}</Text>
                                <Text style={{flex:2,textAlign:'center',fontSize:13}}>{item.PhoneNo || ''}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                    </>
                  )}
                  </ScrollView>
                  </View>
                  <View style={{position:'absolute',left:16,right:16,bottom:16}}>
                    <TouchableOpacity
                      onPress={()=>this.setState({showLedgerShareModal:false})}
                      style={{height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showLedgerGroupNewModal}
              onRequestClose={() => this.setState({ showLedgerGroupNewModal: false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.9,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>New Group</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Group Name</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerGroupName}
                        onChangeText={(t)=>this.setState({ledgerGroupName:t})}
                        placeholder="Group Name"
                      />
                    </View>
                  </View>
                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={()=>this.setState({showLedgerGroupNewModal:false})}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={()=>{
                        if(this.state.ledgerGroupName==''){
                          Alert.alert(dal.APP_NAME || 'App','Please enter Group Name')
                          return;
                        }
                        const data=[]
                        data.push({ Name: this.state.ledgerGroupName })
                        dal.saveGroup(this.state.apiEndpoint || '',data,'New',(err,resp)=>{
                          if(err){
                            Alert.alert(dal.APP_NAME || 'App','Save failed!')
                            return;
                          }
                          if(resp=='OK' || resp?.Status=='OK'){
                            Alert.alert(dal.APP_NAME || 'App','Save OK!')
                            this.setState({showLedgerGroupNewModal:false, ledgerGroupName:''}, () => {
                              if (this.state.apiEndpoint) {
                                this.setState({ ledgerShareLoading: true });
                                dal.getGroup(this.state.apiEndpoint, (err2, resp2) => {
                                  if (!err2 && resp2) {
                                    const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                    this.setState({ ledgerShareGroups: list, ledgerShareLoading: false });
                                  } else {
                                    this.setState({ ledgerShareLoading: false });
                                  }
                                })
                              }
                            })
                          }else{
                            Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp))
                          }
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showLedgerGroupEditModal}
              onRequestClose={() => this.setState({ showLedgerGroupEditModal: false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.9,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Edit Group</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Group Name</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerGroupEditName}
                        onChangeText={(t)=>this.setState({ledgerGroupEditName:t})}
                        placeholder="Group Name"
                      />
                    </View>
                  </View>
                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={()=>this.setState({showLedgerGroupEditModal:false})}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          dal.APP_NAME || 'App',
                          'Are you sure you want to delete?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'OK',
                              onPress: () => {
                                const data=[]
                                data.push({ Name: this.state.ledgerGroupEditName, LedgerShareGroupID: this.state.ledgerGroupEditId })
                                dal.saveGroup(this.state.apiEndpoint || '',data,'Delete',(err,resp)=>{
                                  if(err){
                                    Alert.alert(dal.APP_NAME || 'App','Delete failed!')
                                    return;
                                  }
                                  if(resp=='OK' || resp?.Status=='OK'){
                                    Alert.alert(dal.APP_NAME || 'App','Delete OK!')
                                    this.setState({
                                      showLedgerGroupEditModal:false,
                                      ledgerShareGroupId:''
                                    }, () => {
                                      if (this.state.apiEndpoint) {
                                        this.setState({ ledgerShareLoading: true, ledgerShareUsers: [], ledgerShareNewUsers: [] });
                                        dal.getGroup(this.state.apiEndpoint, (err2, resp2) => {
                                          if (!err2 && resp2) {
                                            const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                            this.setState({ ledgerShareGroups: list, ledgerShareLoading: false });
                                          } else {
                                            this.setState({ ledgerShareLoading: false });
                                          }
                                        })
                                      }
                                    })
                                  }else{
                                    Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp))
                                  }
                                })
                              }
                            }
                          ],
                          { cancelable: true }
                        )
                      }}
                      style={{flex:1,height:40,backgroundColor:'#cc0000',borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>DELETE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={()=>{
                        if(this.state.ledgerGroupEditName==''){
                          Alert.alert(dal.APP_NAME || 'App','Please enter Group Name')
                          return;
                        }
                        const data=[]
                        data.push({ Name: this.state.ledgerGroupEditName, LedgerShareGroupID: this.state.ledgerGroupEditId })
                        dal.saveGroup(this.state.apiEndpoint || '',data,'Edit',(err,resp)=>{
                          if(err){
                            Alert.alert(dal.APP_NAME || 'App','Save failed!')
                            return;
                          }
                          if(resp=='OK' || resp?.Status=='OK'){
                            Alert.alert(dal.APP_NAME || 'App','Save OK!')
                            this.setState({showLedgerGroupEditModal:false}, () => {
                              if (this.state.apiEndpoint) {
                                this.setState({ ledgerShareLoading: true });
                                dal.getGroup(this.state.apiEndpoint, (err2, resp2) => {
                                  if (!err2 && resp2) {
                                    const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                    this.setState({ ledgerShareGroups: list, ledgerShareLoading: false });
                                  } else {
                                    this.setState({ ledgerShareLoading: false });
                                  }
                                })
                              }
                            })
                          }else{
                            Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp))
                          }
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showLedgerShareEditModal}
              onRequestClose={() => this.setState({ showLedgerShareEditModal: false, showLedgerShareNewUsers: true })}
            >
              <View style={{flex:1,backgroundColor:'#00000066'}}>
                <View style={{flex:1,width:'100%',height:'100%',backgroundColor:'#fff',padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Break and %</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>User No</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerShareEditUserNo}
                        editable={false}
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Break</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerShareEditBreak}
                        onChangeText={(t)=>this.setState({ledgerShareEditBreak:t})}
                        placeholder="Break"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>%</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerShareEditPercent}
                        onChangeText={(t)=>this.setState({ledgerShareEditPercent:t})}
                        placeholder="%"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <Text style={{fontSize:16,fontWeight:'bold',marginTop:24,marginBottom:6}}>New Users</Text>
                  <View style={{borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:6,maxHeight:200}}>
                    <View style={{flexDirection:'row',paddingVertical:6,backgroundColor:'#f5f5f5',borderBottomWidth:1,borderColor:'#eee'}}>
                      <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>User No</Text>
                      <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>Phone No</Text>
                    </View>
                    {this.state.ledgerShareNewUsersLoading ? (
                      <View style={{padding:10}}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <ScrollView nestedScrollEnabled={true}>
                        {this.state.ledgerShareNewUsers.map((item, idx) => (
                          <View key={idx} style={{flexDirection:'row',paddingVertical:8,paddingHorizontal:10,borderBottomWidth:1,borderColor:'#eee'}}>
                            <Text style={{flex:2,fontSize:13}}>{item.UserNo || item.UserID || ''}</Text>
                            <Text style={{flex:2,textAlign:'center',fontSize:13}}>{item.PhoneNo || ''}</Text>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={()=>this.setState({showLedgerShareEditModal:false, showLedgerShareNewUsers:true})}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={()=>{
                        if(this.state.ledgerShareEditBreak=='' || this.state.ledgerShareEditPercent==''){
                          Alert.alert(dal.APP_NAME || 'App','Please enter Break and %')
                          return;
                        }
                        const item = this.state.ledgerShareEditItem || {};
                        const data=[]
                        const status = this.state.ledgerShareEditStatus || 'Edit';
                        data.push({
                          LedgerShareUserID: item.LedgerShareUserID || item.LedgerShareID,
                          LedgerShareGroupID: item.LedgerShareGroupID || this.state.ledgerShareGroupId,
                          UserID: item.UserID,
                          TelegramID: item.TelegramID,
                          UserNo: item.UserNo,
                          PhoneNo: item.PhoneNo,
                          LdgBreak: Number(this.state.ledgerShareEditBreak || 0),
                          LdgP: Number(this.state.ledgerShareEditPercent || 0)
                        })
                        dal.saveBreakAndPercentage(this.state.apiEndpoint || '',data,status,(err,resp)=>{
                          if(err){
                            Alert.alert(dal.APP_NAME || 'App','Save failed!')
                            return;
                          }
                          if(resp=='OK' || resp?.Status=='OK'){
                            Alert.alert(dal.APP_NAME || 'App','Save OK!')
                            this.setState({showLedgerShareEditModal:false, showLedgerShareNewUsers:true}, () => {
                              const gid = this.state.ledgerShareGroupId;
                              if (gid && this.state.apiEndpoint) {
                                this.setState({ ledgerShareUsersLoading: true });
                                dal.getUserByLedgerShareGroupID(this.state.apiEndpoint, gid, (err2, resp2) => {
                                  if (!err2 && resp2) {
                                    const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                    this.setState({ ledgerShareUsers: list, ledgerShareUsersLoading:false });
                                  } else {
                                    this.setState({ ledgerShareUsersLoading:false });
                                  }
                                })
                              }
                            })
                          }else{
                            Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp))
                          }
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showLedgerShareUserModal}
              onRequestClose={() => this.setState({ showLedgerShareUserModal: false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.9,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Break and %</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>User No</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerShareUserNo}
                        editable={false}
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Break</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerShareUserBreak}
                        onChangeText={(t)=>this.setState({ledgerShareUserBreak:t})}
                        placeholder="Break"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>%</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerShareUserPercent}
                        onChangeText={(t)=>this.setState({ledgerShareUserPercent:t})}
                        placeholder="%"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={()=>this.setState({showLedgerShareUserModal:false})}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={()=>{
                        if(this.state.ledgerShareUserBreak=='' || this.state.ledgerShareUserPercent==''){
                          Alert.alert(dal.APP_NAME || 'App','Please enter Break and %')
                          return;
                        }
                        const item = this.state.ledgerShareUserItem || {};
                        const data=[]
                        data.push({
                          LedgerShareUserID: item.LedgerShareUserID || item.LedgerShareID,
                          LedgerShareGroupID: item.LedgerShareGroupID || this.state.ledgerShareGroupId,
                          UserID: item.UserID,
                          TelegramID: item.TelegramID,
                          UserNo: item.UserNo,
                          PhoneNo: item.PhoneNo,
                          LdgBreak: Number(this.state.ledgerShareUserBreak || 0),
                          LdgP: Number(this.state.ledgerShareUserPercent || 0)
                        })
                        dal.saveBreakAndPercentage(this.state.apiEndpoint || '',data,'Edit',(err,resp)=>{
                          if(err){
                            Alert.alert(dal.APP_NAME || 'App','Save failed!')
                            return;
                          }
                          if(resp=='OK' || resp?.Status=='OK'){
                            Alert.alert(dal.APP_NAME || 'App','Save OK!')
                            this.setState({showLedgerShareUserModal:false}, () => {
                              const gid = this.state.ledgerShareGroupId;
                              if (gid && this.state.apiEndpoint) {
                                this.setState({ ledgerShareUsersLoading: true });
                                dal.getUserByLedgerShareGroupID(this.state.apiEndpoint, gid, (err2, resp2) => {
                                  if (!err2 && resp2) {
                                    const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                    this.setState({ ledgerShareUsers: list, ledgerShareUsersLoading:false });
                                  } else {
                                    this.setState({ ledgerShareUsersLoading:false });
                                  }
                                })
                              }
                            })
                          }else{
                            Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp))
                          }
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showLedgerShareAddModal}
              onRequestClose={() => this.setState({ showLedgerShareAddModal: false, showLedgerShareNewUsers: true })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.9,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Add User</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>User No</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={(this.state.ledgerShareAddItem && this.state.ledgerShareAddItem.UserNo) ? this.state.ledgerShareAddItem.UserNo : ''}
                        editable={false}
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Break</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerShareAddBreak}
                        onChangeText={(t)=>this.setState({ledgerShareAddBreak:t})}
                        placeholder="Break"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>%</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.ledgerShareAddPercent}
                        onChangeText={(t)=>this.setState({ledgerShareAddPercent:t})}
                        placeholder="%"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={()=>this.setState({showLedgerShareAddModal:false, showLedgerShareNewUsers:true})}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={()=>{
                        if(this.state.ledgerShareAddBreak=='' || this.state.ledgerShareAddPercent==''){
                          Alert.alert(dal.APP_NAME || 'App','Please enter Break and %')
                          return;
                        }
                        const item = this.state.ledgerShareAddItem || {};
                        const data=[]
                        data.push({
                          LedgerShareUserID: item.LedgerShareUserID || item.LedgerShareID,
                          LedgerShareGroupID: item.LedgerShareGroupID || this.state.ledgerShareGroupId,
                          UserID: item.UserID,
                          TelegramID: item.TelegramID,
                          UserNo: item.UserNo,
                          PhoneNo: item.PhoneNo,
                          LdgBreak: Number(this.state.ledgerShareAddBreak || 0),
                          LdgP: Number(this.state.ledgerShareAddPercent || 0)
                        })
                        dal.saveBreakAndPercentage(this.state.apiEndpoint || '',data,'New',(err,resp)=>{
                          if(err){
                            Alert.alert(dal.APP_NAME || 'App','Save failed!')
                            return;
                          }
                          if(resp=='OK' || resp?.Status=='OK'){
                            Alert.alert(dal.APP_NAME || 'App','Save OK!')
                            this.setState({showLedgerShareAddModal:false, showLedgerShareNewUsers:true}, () => {
                              const gid = this.state.ledgerShareGroupId;
                              if (gid && this.state.apiEndpoint) {
                                this.setState({ ledgerShareUsersLoading: true, ledgerShareNewUsersLoading: true });
                                dal.getUserByLedgerShareGroupID(this.state.apiEndpoint, gid, (err2, resp2) => {
                                  if (!err2 && resp2) {
                                    const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                    this.setState({ ledgerShareUsers: list, ledgerShareUsersLoading:false });
                                  } else {
                                    this.setState({ ledgerShareUsersLoading:false });
                                  }
                                })
                                dal.getNewUser(this.state.apiEndpoint, gid, (errN, respN) => {
                                  if (!errN && respN) {
                                    const listN = Array.isArray(respN.Data) ? respN.Data : (Array.isArray(respN) ? respN : []);
                                    this.setState({ ledgerShareNewUsers: listN, ledgerShareNewUsersLoading:false });
                                  } else {
                                    this.setState({ ledgerShareNewUsersLoading:false });
                                  }
                                })
                              }
                            })
                          }else{
                            Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp))
                          }
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showTutorialModal}
              onRequestClose={() => this.setState({ showTutorialModal: false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066'}}>
                <View style={{flex:1,width:'100%',height:'100%',backgroundColor:'#fff',padding:16}}>
                  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <Text style={{fontSize:18,fontWeight:'bold'}}>Tutorial List</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const next = !this.state.tutorialListIsAdmin;
                        this.setState({ tutorialListIsAdmin: next, tutorialLoading:true }, () => {
                          dal.getTutorialList(this.state.apiEndpoint, next, (err2, resp2) => {
                            if (!err2 && resp2) {
                              const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                              this.setState({ tutorialList: list, tutorialLoading:false });
                            } else {
                              this.setState({ tutorialLoading:false });
                            }
                          })
                        })
                      }}
                      style={{flexDirection:'row',alignItems:'center'}}
                    >
                      <Image source={this.state.tutorialListIsAdmin ? tickIcon : untickIcon} style={{width:18,height:18,tintColor:Color.PRIMARYCOLOR,marginRight:6}} />
                      <Text style={{fontSize:14,color:'#262626'}}>Admin</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{maxHeight:260,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:6,marginBottom:10}}>
                    <View style={{flexDirection:'row',paddingVertical:6,backgroundColor:'#f5f5f5',borderBottomWidth:1,borderColor:'#eee'}}>
                      <Text style={{flex:1,textAlign:'center',fontSize:12,fontWeight:'bold'}}>SrNo</Text>
                      <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>Title</Text>
                      <Text style={{width:70,textAlign:'center',fontSize:12,fontWeight:'bold'}}>Is Admin</Text>
                      <Text style={{width:36,textAlign:'center',fontSize:12,fontWeight:'bold'}}></Text>
                    </View>
                    {this.state.tutorialLoading ? (
                      <View style={{padding:10}}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <ScrollView>
                        {this.state.tutorialList.map((item, idx) => (
                          <View key={idx} style={{flexDirection:'row',paddingVertical:8,paddingHorizontal:10,borderBottomWidth:1,borderColor:'#eee'}}>
                            <TouchableOpacity
                              style={{flex:1,flexDirection:'row'}}
                              onPress={() => {
                                this.setState({
                                  showTutorialModal:false,
                                  showTutorialAddModal:true,
                                  tutorialStatus:'Edit',
                                  tutorialId:item.TutorialID || '',
                                  tutorialSrNo:(item.SrNo ?? '').toString(),
                                  tutorialTitle:item.Title || '',
                                  tutorialDescription:item.Description || '',
                                  tutorialYoutubeLink:item.YoutubeLink || '',
                                  tutorialIsAdmin:item.IsAdmin == 1 || item.IsAdmin === true
                                })
                              }}
                            >
                              <Text style={{flex:1,fontSize:13,textAlign:'center'}}>{item.SrNo}</Text>
                              <Text style={{flex:2,fontSize:13,textAlign:'center'}}>{item.Title}</Text>
                              <View style={{width:70,alignItems:'center',justifyContent:'center'}}>
                                <Image source={item.IsAdmin ? tickIcon : untickIcon} style={{width:18,height:18,tintColor:Color.PRIMARYCOLOR}} />
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{width:36,alignItems:'center',justifyContent:'center'}}
                              onPress={() => {
                                Alert.alert('','Delete this tutorial?',
                                [
                                  { text:'Cancel' },
                                  { text:'Delete', onPress:()=>{
                                    const data = [{
                                      TutorialID: item.TutorialID || '',
                                      Title: item.Title || '',
                                      Description: item.Description || '',
                                      YoutubeLink: item.YoutubeLink || '',
                                      SrNo: Number(item.SrNo || 0),
                                      IsAdmin: item.IsAdmin == 1 || item.IsAdmin === true
                                    }];
                                    dal.saveTutorial(this.state.apiEndpoint, data, 'Delete', (err, resp) => {
                                      if (err) {
                                        Alert.alert(dal.APP_NAME || 'App','Delete failed!');
                                        return;
                                      }
                                      if (resp === 'OK' || resp?.Status === 'OK' || resp?.Msg === 'OK') {
                                        Alert.alert(dal.APP_NAME || 'App','Delete OK!');
                                        this.setState({ tutorialLoading:true }, () => {
                                          dal.getTutorialList(this.state.apiEndpoint, true, (err2, resp2) => {
                                            if (!err2 && resp2) {
                                              const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                              this.setState({ tutorialList: list, tutorialLoading:false });
                                            } else {
                                              this.setState({ tutorialLoading:false });
                                            }
                                          })
                                        })
                                      } else {
                                        Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp));
                                      }
                                    })
                                  }}
                                ])
                              }}
                            >
                              <Image source={deleteIcon} style={{width:16,height:16,tintColor:'#cc0000'}} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  <View style={{flexDirection:'row',marginTop:'auto'}}>
                    <TouchableOpacity
                      onPress={() => this.setState({ showTutorialModal: false })}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const nextSr = (this.state.tutorialList ? this.state.tutorialList.length : 0) + 1;
                        this.setState({
                          showTutorialAddModal:true,
                          showTutorialModal:false,
                          tutorialStatus:'New',
                          tutorialId:'',
                          tutorialSrNo: nextSr.toString(),
                          tutorialTitle:'',
                          tutorialDescription:'',
                          tutorialYoutubeLink:'',
                          tutorialIsAdmin:false
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.Green,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>NEW</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showTutorialAddModal}
              onRequestClose={() => this.setState({ showTutorialAddModal: false, showTutorialModal: true })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.9,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>
                    {this.state.tutorialStatus === 'Edit' ? 'Edit Tutorial' : 'New Tutorial'}
                  </Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Sr No</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.tutorialSrNo}
                        onChangeText={(t)=>this.setState({tutorialSrNo:t})}
                        placeholder="Sr No"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Title</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={[styles.modalInput,{height:44}]}
                        value={this.state.tutorialTitle}
                        onChangeText={(t)=>this.setState({tutorialTitle:t})}
                        placeholder="Title"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Description</Text>
                    <View style={[styles.modalInputWrap,{height:200}]}>
                      <TextInput
                        style={[styles.modalInput,{height:200}]}
                        value={this.state.tutorialDescription}
                        onChangeText={(t)=>this.setState({tutorialDescription:t})}
                        placeholder="Description"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Youtube</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={[styles.modalInput,{height:44}]}
                        value={this.state.tutorialYoutubeLink}
                        onChangeText={(t)=>this.setState({tutorialYoutubeLink:t})}
                        placeholder="Youtube Link"
                      />
                    </View>
                  </View>
                  <View style={[styles.modalRow,{justifyContent:'flex-start'}]}>
                    <Text style={styles.modalLabel}>Is Admin</Text>
                    <TouchableOpacity
                      onPress={()=>this.setState({tutorialIsAdmin:!this.state.tutorialIsAdmin})}
                      style={{flexDirection:'row',alignItems:'center'}}
                    >
                      <Image source={this.state.tutorialIsAdmin ? tickIcon : untickIcon} style={{width:18,height:18,tintColor:Color.PRIMARYCOLOR,marginRight:6}} />
                      <Text style={{fontSize:14,color:'#262626'}}>Yes</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={() => this.setState({ showTutorialAddModal: false, showTutorialModal: true, tutorialLoading:true }, () => {
                        dal.getTutorialList(this.state.apiEndpoint, this.state.tutorialListIsAdmin, (err2, resp2) => {
                          if (!err2 && resp2) {
                            const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                            this.setState({ tutorialList: list, tutorialLoading:false });
                          } else {
                            this.setState({ tutorialLoading:false });
                          }
                        })
                      })}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (!this.state.apiEndpoint) {
                          Alert.alert(dal.APP_NAME || 'App','API endpoint not set!');
                          return;
                        }
                        if (!this.state.tutorialTitle || !this.state.tutorialTitle.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter Title');
                          return;
                        }
                        if (this.state.tutorialSrNo === '' || this.state.tutorialSrNo === null || this.state.tutorialSrNo === undefined) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter Sr No');
                          return;
                        }
                        const data = [{
                          TutorialID: this.state.tutorialId || '',
                          Title: this.state.tutorialTitle,
                          Description: this.state.tutorialDescription || '',
                          YoutubeLink: this.state.tutorialYoutubeLink || '',
                          SrNo: Number(this.state.tutorialSrNo || 0),
                          IsAdmin: this.state.tutorialIsAdmin ? true : false
                        }];
                        dal.saveTutorial(this.state.apiEndpoint, data, this.state.tutorialStatus || 'New', (err, resp) => {
                          if (err) {
                            Alert.alert(dal.APP_NAME || 'App','Save failed!');
                            return;
                          }
                          if (resp === 'OK' || resp?.Status === 'OK' || resp?.Msg === 'OK') {
                            this.setState({
                              showTutorialAddModal:false,
                              showTutorialModal:true,
                              tutorialSrNo:'',
                              tutorialTitle:'',
                              tutorialDescription:'',
                              tutorialYoutubeLink:'',
                              tutorialIsAdmin:false,
                              tutorialLoading:true
                            }, () => {
                              dal.getTutorialList(this.state.apiEndpoint, this.state.tutorialListIsAdmin, (err2, resp2) => {
                                if (!err2 && resp2) {
                                  const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                  this.setState({ tutorialList: list, tutorialLoading:false }, () => {
                                    Alert.alert(dal.APP_NAME || 'App','Save OK!');
                                  });
                                } else {
                                  this.setState({ tutorialLoading:false }, () => {
                                    Alert.alert(dal.APP_NAME || 'App','Save OK!');
                                  });
                                }
                              })
                            })
                          } else {
                            Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp));
                          }
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showTelegramBotModal}
              onRequestClose={() => this.setState({ showTelegramBotModal: false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066'}}>
                <View style={{flex:1,width:'100%',height:'100%',backgroundColor:'#fff',padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Telegram Bot List</Text>
                  <View style={{maxHeight:260,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:6,marginBottom:10}}>
                    <View style={{flexDirection:'row',paddingVertical:6,backgroundColor:'#f5f5f5',borderBottomWidth:1,borderColor:'#eee'}}>
                      <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>User Name</Text>
                      <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>Bot Name</Text>
                      <Text style={{flex:2,textAlign:'center',fontSize:12,fontWeight:'bold'}}>API</Text>
                      <Text style={{width:36,textAlign:'center',fontSize:12,fontWeight:'bold'}}></Text>
                    </View>
                    {this.state.telegramBotLoading ? (
                      <View style={{padding:10}}>
                        <ActivityIndicator />
                      </View>
                    ) : (
                      <ScrollView>
                        {this.state.telegramBotList.map((item, idx) => (
                          <View key={idx} style={{flexDirection:'row',paddingVertical:8,paddingHorizontal:10,borderBottomWidth:1,borderColor:'#eee'}}>
                            <TouchableOpacity
                              style={{flex:1,flexDirection:'row'}}
                              onPress={() => {
                                this.setState({
                                  showTelegramBotModal:false,
                                  showTelegramBotAddModal:true,
                                  telegramBotStatus:'Edit',
                                  telegramBotId:item.TelegramBotID || '',
                                  telegramBotUserName:item.UserName || item.UserNo || '',
                                  telegramBotBotName:item.BotName || '',
                                  telegramBotApi:item.API || '',
                                  telegramBotToken:item.Token || '',
                                  telegramBotOwnerId:(item.OwnerID || item.OwnerId || '').toString()
                                })
                              }}
                            >
                              <Text style={{flex:2,fontSize:13,textAlign:'center'}}>{item.UserName || item.UserNo || ''}</Text>
                              <Text style={{flex:2,fontSize:13,textAlign:'center'}}>{item.BotName || ''}</Text>
                              <Text style={{flex:2,fontSize:13,textAlign:'center'}}>{item.API || ''}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{width:36,alignItems:'center',justifyContent:'center'}}
                              onPress={() => {
                                Alert.alert('','Delete this Telegram Bot?',
                                [
                                  { text:'Cancel' },
                                  { text:'Delete', onPress:()=>{
                                    const data = [{
                                      TelegramBotID: item.TelegramBotID || '',
                                      UserName: item.UserName || item.UserNo || '',
                                      BotName: item.BotName || '',
                                      API: item.API || '',
                                      Token: item.Token || '',
                                      OwnerID: (item.OwnerID || item.OwnerId || '').toString()
                                    }];
                                    dal.saveTelegramBot(data,'Delete', (err, resp) => {
                                      if (err) {
                                        Alert.alert(dal.APP_NAME || 'App','Delete failed!');
                                        return;
                                      }
                                      if (resp === 'OK' || resp?.Status === 'OK' || resp?.Msg === 'OK') {
                                        Alert.alert(dal.APP_NAME || 'App','Delete OK!');
                                        this.setState({ telegramBotLoading:true }, () => {
                                          dal.getTelegramBotList((err2, resp2) => {
                                            if (!err2 && resp2) {
                                              const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                              this.setState({ telegramBotList:list, telegramBotLoading:false });
                                            } else {
                                              this.setState({ telegramBotLoading:false });
                                            }
                                          })
                                        })
                                      } else {
                                        Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp));
                                      }
                                    })
                                  }}
                                ])
                              }}
                            >
                              <Image source={deleteIcon} style={{width:16,height:16,tintColor:'#cc0000'}} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  <View style={{flexDirection:'row',marginTop:'auto'}}>
                    <TouchableOpacity
                      onPress={() => this.setState({ showTelegramBotModal: false })}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          showTelegramBotAddModal:true,
                          showTelegramBotModal:false,
                          telegramBotStatus:'New',
                          telegramBotId:'',
                          telegramBotUserName:'',
                          telegramBotBotName:'',
                          telegramBotApi:'',
                          telegramBotToken:'',
                          telegramBotOwnerId:''
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.Green,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>NEW</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showTelegramBotAddModal}
              onRequestClose={() => this.setState({ showTelegramBotAddModal: false, showTelegramBotModal: true })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.9,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>
                    {this.state.telegramBotStatus === 'Edit' ? 'Edit Telegram Bot' : 'New Telegram Bot'}
                  </Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>User Name</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.telegramBotUserName}
                        onChangeText={(t)=>this.setState({telegramBotUserName:t})}
                        placeholder="User Name"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Bot Name</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.telegramBotBotName}
                        onChangeText={(t)=>this.setState({telegramBotBotName:t})}
                        placeholder="Bot Name"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>API</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.telegramBotApi}
                        onChangeText={(t)=>this.setState({telegramBotApi:t})}
                        placeholder="API"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Token</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.telegramBotToken}
                        onChangeText={(t)=>this.setState({telegramBotToken:t})}
                        placeholder="Token"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Owner ID</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.telegramBotOwnerId}
                        onChangeText={(t)=>this.setState({telegramBotOwnerId:t})}
                        placeholder="Owner ID"
                      />
                    </View>
                  </View>
                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={() => this.setState({ showTelegramBotAddModal: false, showTelegramBotModal: true })}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (!this.state.telegramBotUserName || !this.state.telegramBotUserName.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter User Name');
                          return;
                        }
                        if (!this.state.telegramBotBotName || !this.state.telegramBotBotName.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter Bot Name');
                          return;
                        }
                        if (!this.state.telegramBotApi || !this.state.telegramBotApi.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter API');
                          return;
                        }
                        if (!this.state.telegramBotToken || !this.state.telegramBotToken.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter Token');
                          return;
                        }
                        if (!this.state.telegramBotOwnerId || !this.state.telegramBotOwnerId.toString().trim()) {
                          Alert.alert(dal.APP_NAME || 'App','Please enter Owner ID');
                          return;
                        }
                        const data = [{
                          TelegramBotID: this.state.telegramBotId || '',
                          UserName: this.state.telegramBotUserName,
                          BotName: this.state.telegramBotBotName,
                          API: this.state.telegramBotApi,
                          Token: this.state.telegramBotToken,
                          OwnerID: this.state.telegramBotOwnerId
                        }];
                        dal.saveTelegramBot(data,this.state.telegramBotStatus || 'New',(err,resp)=>{
                          if (err) {
                            Alert.alert(dal.APP_NAME || 'App','Save failed!');
                            return;
                          }
                          if (resp === 'OK' || resp?.Status === 'OK' || resp?.Msg === 'OK') {
                            this.setState({ showTelegramBotAddModal:false, showTelegramBotModal:false }, () => {
                              Alert.alert(dal.APP_NAME || 'App','Save OK!',[
                                { text:'OK', onPress:()=>{
                                  this.setState({ showTelegramBotModal:true, telegramBotLoading:true }, () => {
                                    dal.getTelegramBotList((err2, resp2) => {
                                      if (!err2 && resp2) {
                                        const list = Array.isArray(resp2.Data) ? resp2.Data : (Array.isArray(resp2) ? resp2 : []);
                                        this.setState({ telegramBotList:list, telegramBotLoading:false });
                                      } else {
                                        this.setState({ telegramBotLoading:false });
                                      }
                                    })
                                  })
                                }}
                              ]);
                            })
                          } else {
                            Alert.alert(dal.APP_NAME || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp));
                          }
                        })
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.showAdminLogin}
              onRequestClose={() => this.setState({ showAdminLogin:false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.85,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Admin Login</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>User No</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.adminLoginUser}
                        onChangeText={(t)=>this.setState({adminLoginUser:t})}
                        placeholder="User No"
                      />
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Password</Text>
                    <View style={styles.modalInputWrap}>
                      <TextInput
                        style={styles.modalInput}
                        value={this.state.adminLoginPass}
                        onChangeText={(t)=>this.setState({adminLoginPass:t})}
                        placeholder="Password"
                        secureTextEntry={true}
                      />
                    </View>
                  </View>
                  <View style={{flexDirection:'row',marginTop:12}}>
                    <TouchableOpacity
                      onPress={() => this.setState({ showAdminLogin:false })}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if(this.state.adminLoginUser==='admin' && this.state.adminLoginPass==='ztztadminitworld@'){
                          const target = this.state.adminLoginTarget;
                          adminAuthedSession = true;
                          this.setState({ adminAuthed:true, showAdminLogin:false, adminLoginUser:'', adminLoginPass:'' }, () => {
                            if(target==='telegram'){
                              this.setState({ showTelegramBotModal:true, telegramBotLoading:true }, () => {
                                dal.getTelegramBotList((err, resp) => {
                                  if (!err && resp) {
                                    const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                                    this.setState({ telegramBotList:list, telegramBotLoading:false });
                                  } else {
                                    this.setState({ telegramBotLoading:false });
                                  }
                                })
                              })
                            }
                            if(target==='tutorial'){
                              this.setState({ showTutorialModal: true, tutorialLoading: true, tutorialListIsAdmin: true }, () => {
                                if (this.state.apiEndpoint) {
                                  dal.getTutorialList(this.state.apiEndpoint, true, (err, resp) => {
                                    if (!err && resp) {
                                      const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                                      this.setState({ tutorialList: list, tutorialLoading: false });
                                    } else {
                                      this.setState({ tutorialLoading: false });
                                    }
                                  })
                                } else {
                                  this.setState({ tutorialLoading: false });
                                }
                              })
                            }
                          })
                        }else{
                          Alert.alert(dal.APP_NAME || 'App','Wrong User No or Password');
                        }
                      }}
                      style={{flex:1,height:40,backgroundColor:Color.PRIMARYCOLOR,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>LOGIN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
        </View>
      );
  }
}

const styles = StyleSheet.create({
container: {
  flex           : 1,
},
header:{
  height:56,
  width:null,
  alignItems: 'center',
  flexDirection: 'row',
},
contactText:{
  marginVertical: 5,
  color         : "#000",
  fontSize      : 12,
  fontWeight    : "bold"
},
nameText:{
  marginHorizontal: 20,
  marginVertical  : 30,
  color           : Color.yellow,
  fontSize        : 22,
  fontWeight      : "bold"
},
rowView:{
  marginHorizontal: 20,
  flexDirection   : "row",
  justifyContent  : "center",
  alignItems      : "center"
},
labelText:{
  color   : '#000',
  fontSize: 20,
  marginRight: 10,
  fontWeight:'bold'
},
rearView:{
  flex          : 1,
  flexDirection : "row",
  alignItems    : "flex-end",
  justifyContent: "flex-end"
},
line:{
  width           : width-40,
  backgroundColor : "#ffffff80",
  height          : 1,
  marginHorizontal: 20,
  marginVertical  : 10
},
next:{
  width : 30,
  height: 25
},
loading: {
  position       : 'absolute',
  left           : 0,
  right          : 0,
  top            : 0,
  bottom         : 0,
  alignItems     : 'center',
  justifyContent : 'center',
  backgroundColor: "#464646"
},
contactView:{
  flex          : 1,
  alignItems    : "center",
  justifyContent: "flex-end",
  marginBottom  : 10
},
inputWrap:{
  flexDirection  : "row",
  marginVertical : 5,
  height         : 50,
  backgroundColor: "transparent",
  borderRadius:5,
  borderWidth: 1,
  borderColor: 'gray',
},
input:{
  flex             : 1,
  paddingHorizontal: 10,
  backgroundColor  : "transparent",
  color            : "#000",
  fontSize         : 14
},
regbutton:{
  backgroundColor: "#64DD17",
  paddingVertical: 8,
  marginVertical : 20,
  borderRadius   : 7,
  alignItems     : "center",
  justifyContent : "center",
},
buttonText:{
  color   : "#FFF",
  fontSize: 16,
},
modalRow:{
  flexDirection:'row',
  alignItems:'center',
  marginBottom:8
},
modalLabel:{
  width:110,
  fontSize:14,
  fontWeight:'bold',
  color:'#262626'
},
modalInputWrap:{
  flex:1,
  borderWidth:1,
  borderColor:'gray',
  borderRadius:5,
  height:38,
  justifyContent:'center'
},
modalInput:{
  paddingHorizontal:10,
  color:'#000'
}
});
export default UserProfile;
