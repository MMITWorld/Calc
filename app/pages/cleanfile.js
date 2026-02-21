import React, {Component} from 'react';
import {Platform, 
  StyleSheet, 
  Text, 
  View,
  TouchableOpacity,  
  FlatList,
  Alert,
  Image,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Picker
} from 'react-native';
import dal from '../dal.js'
import radio_btn_selected from '../assets/images/tick.png'
import radio_btn_unselected from '../assets/images/untick.png'
import backIcon from '../assets/images/backward.png'
import deleteIcon from '../assets/images/delete.png'
import Color from '../utils/Color.js';
const {width,height}=Dimensions.get('window')
import config from '../config/config.js'
import Loading from '../components/loading.js'
import word from './data.json'
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
const Rabbit = require("rabbit-node");
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
const isZawgyi = (text) => {
    if (!text) return false;
    // Full Zawgyi detection regex (commonly used heuristic).
    const zawgyiRegex = /(?:\u103A\u1033|\u1033\u103A|[\u105A\u1060-\u1097]\u103A|[\u1098\u1099]\u1039|[\u107E-\u1084]\u102F|[\u1033\u1034]\u102F|\u1031\u108F|\u1031\u103E|\u1031\u103B|\u1031\u107E|\u1031\u107F|\u1031\u1080|\u1031\u1081|\u1031\u1082|\u1031\u1083|\u1031\u1084|\u1031\u1085|\u1031\u1086|\u1031\u1087|\u1031\u1088|\u1031\u1089|\u1031\u108A|\u1031\u108B|\u1031\u108C|\u1031\u108D|\u1031\u108E|\u1031[\u102F\u1030]|\u1031\u1030|\u1031\u1039|\u1031\u103A|\u1031\u103B\u103E|\u1031\u103C|\u1031\u103D|\u1031\u103E|\u1031\u105A|\u1031\u1036|\u1031\u1037|\u1031\u1038|\u102B\u103A|\u102C\u103A|\u102D\u103A|\u102E\u103A|\u102F\u103A|\u1030\u103A|\u1032\u103A|\u1036\u103A|\u1037\u103A|\u1038\u103A|[\u102B-\u1030\u1032]\u103B|[\u102B-\u1030\u1032]\u103C|[\u102B-\u1030\u1032]\u103D|[\u102B-\u1030\u1032]\u103E|\u103B\u103B|\u103C\u103C|\u103D\u103D|\u103E\u103E|\u1039\u1039|\u103A\u103A|\u103B\u103C|\u103C\u103D|\u103D\u103E|\u103B\u103D|\u103C\u103E|\u103B\u103E|\u1037\u1037|\u1038\u1038|\u1036\u1036|\u1032\u1032|\u102D\u102D|\u102E\u102E|\u1030\u1030|\u102F\u102F|[\u1050-\u1059]|\u106A|\u106B|\u106C|\u106D|\u106E|\u106F|\u1070|\u1071|\u1072|\u1073|\u1074|\u1075|\u1076|\u1077|\u1078|\u1079|\u107A|\u107B|\u107C|\u107D|\u107E|\u107F|\u1080|\u1081|\u1082|\u1083|\u1084|\u1085|\u1086|\u1087|\u1088|\u1089|\u108A|\u108B|\u108C|\u108D|\u108E|\u108F|\u1090|\u1091|\u1092|\u1093|\u1094|\u1095|\u1096|\u1097|\u1098|\u1099)/;
    return zawgyiRegex.test(text);
};
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users:[],
            agents:[],
            showNewModal:false,
            loading:true,
            agentId:null,
            isUser:true,
            dataProvider: dataProvider.cloneWithRows([]),
            typeStr:'23W',
            userNo:'',
            password:'',
            phoneNo:'',
            prize2D:'80',
            prize3D:'550',
            discount2D:'',
            discount3D:'',
            msg:'',
            noti:'',
            otherDiscount:'',
            editUserId:null,
            showLoginModal: false,
            loginUserNo: '',
            loginPassword: '',
            pendingDelete: null,
            loginOk: false,
            msgIsZg: false
        };
        this._layoutProvider = new LayoutProvider(
            index => {
                return 0;
            },
            (type, dim) => {
                dim.width = width;
                dim.height = 40;
            }
        );

        this._rowRenderer = this._rowRenderer.bind(this);
        this.currentlyOpenSwipeable=null
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    componentDidMount() {
        this.getTermsForClean()
    }
    _rowRenderer(type, data) {
        return (
            <View style={{
                width:width,
                height:40,
                borderBottomWidth:1,
                borderColor:Color.DIVIDERCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <View style={{
                    flex:1
                }}>
                    <TouchableOpacity style={{
                        width:50,
                        height:50,
                        alignItems:'center',
                        justifyContent:'center'
                    }} onPress={()=>{
                        Alert.alert(data.Name,'Are you sure you want to close!',
                            [
                                {
                                    text:'OK',
                                    onPress:()=>{
                                        this.setState({loading:true})
                                        dal.closeFile(this.props.navigation.state.params.endpoint,data.TermID,!data.IsClose,(err,resp)=>{
                                            if(err){
                                                this.setState({loading:false})
                                                Alert.alert(config.AppName,'Something went wrong!')
                                            }else{
                                                if(resp=='OK'){
                                                    this.getTermsForClean()
                                                }else{
                                                    Alert.alert(config.AppName,resp)
                                                    this.setState({loading:false})
                                                }
                                            }
                                        })
                                    }
                                },
                                {
                                    text:'Cancel',
                                    onPress:()=>{
                                        this.setState({loading:false})
                                    }
                                },
                            ],
                            {
                                cancelable:true
                            }
                        )
                    }}>
                        <Image source={data.IsClose?radio_btn_selected:radio_btn_unselected} style={{
                            width:20,
                            height:20,
                            tintColor:Color.PRIMARYCOLOR
                        }}/>
                    </TouchableOpacity>
                </View>
                <View style={{
                    flex:4
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        textAlign:'center'
                    }}>
                        {data.Name}
                    </Text>
                </View>
                
                <TouchableOpacity style={{
                    width:50,
                    height:50,
                    alignItems:'center',
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({loading:false})
                    if (this.state.loginOk) {
                        Alert.alert(data.Name,'Are you sure you want to delete!',
                            [
                                {
                                    text:'OK',
                                    onPress:()=>{
                                        this.setState({loading:true})
                                        dal.cleanFile(this.props.navigation.state.params.endpoint,data.TermID,(err,resp)=>{
                                            if(err){
                                                this.setState({loading:false})
                                                Alert.alert(config.AppName,'Something went wrong!')
                                            }else{
                                                if(resp=='OK'){
                                                    this.getTermsForClean()
                                                }else{
                                                    Alert.alert(config.AppName,resp)
                                                }
                                            }
                                        })
                                    }
                                },
                                {
                                    text:'Cancel',
                                    onPress:()=>{
                                        this.setState({loading:false})
                                    }
                                },
                            ],
                            {
                                cancelable:true
                            }
                        )
                    } else {
                        this.setState({
                            showLoginModal: true,
                            loginUserNo: '',
                            loginPassword: '',
                            pendingDelete: data,
                            loading: false
                        })
                    }
}}>
                    <Image source={deleteIcon} style={{
                        width:20,
                        height:20,
                        tintColor:'#ff1744'
                    }}/>
                </TouchableOpacity>



                
            </View>
        );
    }
    

    renderAllUpdate(){
        return(
            <View style={{
                backgroundColor:'#DCDCDC80',
                marginBottom:5
            }}>
                <View style={{
                    flexDirection:'row',
                    marginHorizontal:10 ,
                    marginVertical: 7,
                    height:120,
                    width:(width-40),
                    alignItems:'center'
                }}>
                    <Text style={{
                        fontFamily:'Roboto-Bold',
                        fontSize:16,
                        marginRight:5
                    }}>
                        Msg
                    </Text>
                    <View style={{
                        flex:1,
                        flexDirection: 'row',
                        marginRight:10,
                        alignItems:'center',
                        borderRadius: 5,
                        borderWidth: 0.8,
                        borderColor: Color.DIVIDERCOLOR,
                        height:110,
                    }}>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder={''}
                            placeholderTextColor={'#262626'}
                            value={this.state.msg}
                            underlineColorAndroid="transparent"
                            multiline
                            onChangeText={(text)=>this.setState({msg:text, msgIsZg: isZawgyi(text)})}
                        />
                    </View>
                    <TouchableOpacity style={{
                        flex:0.3,
                        flexDirection: 'row',
                        alignItems:'center',
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height:40,
                        justifyContent:'center'
                    }} onPress={()=>{
                        if(this.state.msg==''){
                            Alert.alert(config.AppName,'Please enter Message!')
                            return;
                        }
                        this.setState({
                            loading:true
                        })
                        dal.SaveMsg(this.props.navigation.state.params.endpoint,this.state.msg,(err,resp)=>{
                            if(err){
                                this.setState({
                                    loading:false
                                })
                                Alert.alert(config.AppName,'Something went wrong!')
                            }else{
                                if(resp=='OK'){
                                    this.setState({
                                        loading:false,
                                        msg:''
                                    })
                                    Alert.alert(config.AppName,'Save successfully!')
                                }else{
                                    this.setState({
                                        loading:false
                                    })
                                    Alert.alert(config.AppName,'Error in saving!')
                                }
                            }
                        })
                    }}>
                        <Text style={{
                            fontFamily:'Roboto-Bold',
                            fontSize:16,
                            color:'#fff'
                        }}>
                            Save
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        flex:0.3,
                        flexDirection: 'row',
                        alignItems:'center',
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height:40,
                        justifyContent:'center',
                        marginLeft: 8
                    }} onPress={()=>{
                        if(this.state.msg==''){
                            Alert.alert(config.AppName,'Please enter Message!')
                            return;
                        }
                        try{
                            const src = this.state.msg;
                            const isZg = this.state.msgIsZg || isZawgyi(src);
                            const converted = isZg ? Rabbit.zg2uni(src) : Rabbit.uni2zg(src);
                            this.setState({ msg: converted, msgIsZg: !isZg })
                        }catch(e){
                            Alert.alert(config.AppName,'Convert failed!')
                        }
                    }}>
                        <Text style={{
                            fontFamily:'Roboto-Bold',
                            fontSize:16,
                            color:'#fff'
                        }}>
                            Change
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    flexDirection:'row',
                    marginHorizontal:10 ,
                    marginVertical: 7,
                    height:120,
                    width:(width-40),
                    alignItems:'center'
                }}>
                    <Text style={{
                        fontFamily:'Roboto-Bold',
                        fontSize:16,
                        marginRight:5
                    }}>
                        Noti
                    </Text>
                    <View style={{
                        flex:1,
                        flexDirection: 'row',
                        marginRight:10,
                        alignItems:'center',
                        borderRadius: 5,
                        borderWidth: 0.8,
                        borderColor: Color.DIVIDERCOLOR,
                        height:110,
                    }}>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder={''}
                            placeholderTextColor={'#262626'}
                            value={this.state.noti}
                            underlineColorAndroid="transparent"
                            multiline
                            onChangeText={(text)=>this.setState({noti:text, notiIsZg: isZawgyi(text)})}
                        />
                    </View>
                    <TouchableOpacity style={{
                        flex:0.3,
                        flexDirection: 'row',
                        alignItems:'center',
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height:40,
                        justifyContent:'center'
                    }} onPress={()=>{
                        if(this.state.noti==''){
                            Alert.alert(config.AppName,'Please enter Noti!')
                            return;
                        }
                        this.setState({
                            loading:true
                        })
                        dal.Noti(this.props.navigation.state.params.endpoint,this.state.noti,(err,resp)=>{
                            if(err){
                                this.setState({
                                    loading:false
                                })
                                Alert.alert(config.AppName,'Something went wrong!')
                            }else{
                                if(resp=='OK'){
                                    this.setState({
                                        loading:false,
                                        noti:''
                                    })
                                    Alert.alert(config.AppName,'Noti OK!')
                                }else{
                                    this.setState({
                                        loading:false,
                                        noti:''
                                    })
                                    Alert.alert(config.AppName,'Noti OK!')
                                }
                            }
                        })
                    }}>
                        <Text style={{
                            fontFamily:'Roboto-Bold',
                            fontSize:16,
                            color:'#fff'
                        }}>
                            Noti
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        flex:0.3,
                        flexDirection: 'row',
                        alignItems:'center',
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height:40,
                        justifyContent:'center',
                        marginLeft: 8
                    }} onPress={()=>{
                        if(this.state.noti==''){
                            Alert.alert(config.AppName,'Please enter Noti!')
                            return;
                        }
                        try{
                            const src = this.state.noti;
                            const isZg = this.state.notiIsZg || isZawgyi(src);
                            const converted = isZg ? Rabbit.zg2uni(src) : Rabbit.uni2zg(src);
                            this.setState({ noti: converted, notiIsZg: !isZg })
                        }catch(e){
                            Alert.alert(config.AppName,'Convert failed!')
                        }
                    }}>
                        <Text style={{
                            fontFamily:'Roboto-Bold',
                            fontSize:16,
                            color:'#fff'
                        }}>
                            Change
                        </Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        )
    }


    renderUsers(){
        return this.state.agents.map((value,index)=>{
          return(
            <Picker.Item label={value.AgentName} value={value.AgentID} key={index} />
          )
        })
    }
    getTermsForClean(){
        dal.getTermsForClean(this.props.navigation.state.params.endpoint,(err,resp)=>{
        if(err){
            Alert.alert(config.AppName,'Something went wrong!')
            this.setState({
                loading:false
            })
        }else{
            console.log(resp)
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                this.setState({
                    dataProvider: dataProvider.cloneWithRows(resp.Data),
                    loading:false
                })
            }else{
                Alert.alert(config.AppName,'Can\'t retrieve users data!')
                this.setState({
                    loading:false
                })
            }
        }
        })
    }
    replaceChar(replaceChar, index) {
        let firstPart = this.state.typeStr.substr(0, index);
        let lastPart = this.state.typeStr.substr(index + 1);
          
        let newString = firstPart + replaceChar + lastPart;
        return newString;
    }
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
        )
    }
    renderHeader(){
        return(

            

            <View style={{
                width:width,
                height:58,
                backgroundColor:Color.PRIMARYCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <TouchableOpacity style={{
                    marginHorizontal:10
                }} onPress={()=>{
                    this.props.navigation.goBack()
                }}>
                    <Image source={backIcon} style={{
                        width:30,
                        height:30,
                        tintColor:'#fff'
                    }}/>
                </TouchableOpacity>
                <View style={{ marginLeft: 5 }}>
                    <Text style={{ color: '#fff', fontSize: 12 }}>
                        {config.AppName || 'App'}
                    </Text>
                    <Text style={{color:'#fff',fontSize:18}}>
                        {word[this.props.navigation.state.params.lg].cleanfile}
                    </Text>
                </View>
            </View>
        )
    }
    renderLoginModal(){
        return(
            <Modal
                transparent={true}
                visible={this.state.showLoginModal}
                onRequestClose={() => {
                    this.setState({
                        showLoginModal: false,
                        loginUserNo: '',
                        loginPassword: '',
                        pendingDelete: null
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: '#fff', alignItems: 'center', width: width * 0.8, borderRadius: 5, padding: 16 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: Color.DARKPRIMARYTEXTCOLOR, marginBottom: 12 }}>
                            {(this.state.pendingDelete && this.state.pendingDelete.Name) ? this.state.pendingDelete.Name : 'Login'}
                        </Text>
                        <View style={{ width: width * 0.8 - 32, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ width: 80, fontSize: 14, color: '#262626' }}>User No</Text>
                            <TextInput
                                style={[styles.input, { flex: 1, borderWidth: 1, borderColor: Color.DIVIDERCOLOR, borderRadius: 5, paddingHorizontal: 10, backgroundColor: '#fff', height: 40, fontSize: 15 }]}
                                placeholder={'User No'}
                                placeholderTextColor={'#262626'}
                                value={this.state.loginUserNo}
                                underlineColorAndroid="transparent"
                                onChangeText={(text)=>this.setState({loginUserNo:text})}
                            />
                        </View>
                        <View style={{ width: width * 0.8 - 32, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ width: 80, fontSize: 14, color: '#262626' }}>Password</Text>
                            <TextInput
                                style={[styles.input, { flex: 1, borderWidth: 1, borderColor: Color.DIVIDERCOLOR, borderRadius: 5, paddingHorizontal: 10, backgroundColor: '#fff', height: 40, fontSize: 15 }]}
                                placeholder={'Password'}
                                placeholderTextColor={'#262626'}
                                value={this.state.loginPassword}
                                underlineColorAndroid="transparent"
                                secureTextEntry={true}
                                onChangeText={(text)=>this.setState({loginPassword:text})}
                            />
                        </View>
                        <View style={{ width: width * 0.8 - 32, flexDirection: 'row', justifyContent: 'center' }}>
                          <TouchableOpacity style={{
                              width: 120,
                              alignItems:'center',
                              justifyContent:'center',
                              backgroundColor: Color.DIVIDERCOLOR,
                              borderRadius: 5,
                              height: 36,
                              marginRight: 10
                          }} onPress={() => {
                              this.setState({
                                  showLoginModal: false,
                                  loginUserNo: '',
                                  loginPassword: '',
                                  pendingDelete: null
                              })
                          }}>
                              <Text style={{ color:'#262626', fontSize:14 }}>
                                  Cancel
                              </Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={{
                              width: 120,
                              alignItems:'center',
                              justifyContent:'center',
                              backgroundColor: Color.PRIMARYCOLOR,
                              borderRadius: 5,
                              height: 36
                          }} onPress={()=>{
                            if(this.state.loginUserNo=='' || this.state.loginPassword==''){
                                Alert.alert(config.AppName,'Please enter User No and Password!')
                                return;
                            }
                            this.setState({loading:true})
                            dal.getLogin(this.props.navigation.state.params.endpoint,this.state.loginUserNo,this.state.loginPassword,(err,resp)=>{
                                if(err){
                                    this.setState({loading:false})
                                    Alert.alert(config.AppName,'Something went wrong!')
                                }else{
                                    if(resp && resp.Status=='OK'){
                                        const data = this.state.pendingDelete;
                                        this.setState({
                                            showLoginModal:false,
                                            loginUserNo:'',
                                            loginPassword:'',
                                            pendingDelete:null,
                                            loginOk:true,
                                            loading:false
                                        },()=>{
                                            Alert.alert(data.Name,'Are you sure you want to delete!',
                                                [
                                                    {
                                                        text:'OK',
                                                        onPress:()=>{
                                                            this.setState({loading:true})
                                                            dal.cleanFile(this.props.navigation.state.params.endpoint,data.TermID,(err2,resp2)=>{
                                                                if(err2){
                                                                    this.setState({loading:false})
                                                                    Alert.alert(config.AppName,'Something went wrong!')
                                                                }else{
                                                                    if(resp2=='OK'){
                                                                        this.getTermsForClean()
                                                                    }else{
                                                                        Alert.alert(config.AppName,resp2)
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    },
                                                    {
                                                        text:'Cancel',
                                                        onPress:()=>{
                                                            
                                                        }
                                                    },
                                                ],
                                                {
                                                    cancelable:true
                                                }
                                            )
                                        })
                                    }else{
                                        this.setState({loading:false})
                                        Alert.alert(config.AppName,resp ? resp.Status : 'Login failed')
                                    }
                                }
                            })
                          }}>
                              <Text style={{ color:'#fff', fontSize:14 }}>
                                  Login
                              </Text>
                          </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    render() {
        return (
        <View style={styles.container}>
            {this.renderHeader()}
            {this.renderAllUpdate()}
            <View style={{
                width:width,
                height:50,
                borderBottomWidth:1,
                borderColor:Color.DIVIDERCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <View style={{
                    flex:1
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:13,
                        textAlign:'center'
                    }}>
                        Close
                    </Text>
                </View>
                <View style={{
                    flex:4
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:13,
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].file}
                    </Text>
                </View>
                <View style={{
                    width:50,
                    height:50
                }}/>
            </View>
            <View style={{flex:1}}>
                <RecyclerListView layoutProvider={this._layoutProvider} dataProvider={this.state.dataProvider} rowRenderer={this._rowRenderer} />
            </View>
            {this.renderLoading()}
            {this.renderLoginModal()}
        </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    msgList: {
        flex: 1,
        backgroundColor: '#F6E9E3',
    },
    msgContent: {
        paddingVertical: 10,
    },
    msgItem: {
        height:70,
        borderBottomWidth: 0.5,
        borderColor: 'grey',
        paddingVertical: 7,
        paddingHorizontal: 10,
    },
    msgItemTextTitle: {flex: 3, fontSize: 16, color: '#262626', fontWeight: '900', marginBottom: 8},
    msgItemTextBody: {flex: 1, fontSize: 14.5, fontWeight: '400',},
    msgItemTextDate: {flex: 1, fontSize: 14.5, fontWeight: '400', textAlign: "right",},
    loading: {
        position: 'absolute',
        top: 50,
        left: 150,
    },
    inputContainer: {
        flexDirection: 'row',
        marginHorizontal:10 ,
        marginVertical: 5,
        alignItems:'center',
        backgroundColor: '#DCDCDC59',
        borderRadius: 5,
        borderWidth: 0.8,
        borderColor: Color.DIVIDERCOLOR,
    },
    input: {
        height: 40,
        flex:1,
        padding: 4,
        color            : "#000",
        fontSize         : 15,
    },
});
