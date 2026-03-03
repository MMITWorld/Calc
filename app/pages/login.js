import React,{Component} from "react";
import {
  View,
  Text,
  Alert,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../assets/images/logo.png'
import settingIcon from '../assets/images/setting.png'
import Color from '../utils/Color.js';
import tickIcon from '../assets/images/tick.png'
import untickIcon from '../assets/images/untick.png'
import dal from '../dal.js'
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import config from '../config/config.js'
import word from '../pages/data.json'
const { width, height } = Dimensions.get("window");
import Loading from '../components/loading'
import messaging from '@react-native-firebase/messaging';
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName:'',
            password:'',
            endpoint:this.props.navigation.state.params.agent.WebSite,
            lg:'uni',
            loading:false,
            remember:true,
        }
    }
    async componentDidMount() {
        const r_info=await AsyncStorage.getItem(`${this.props.navigation.state.params.agent.AppName}r_info`)
        this.setState({
            userName:JSON.parse(r_info)?.name,
            password:JSON.parse(r_info)?.password,
            remember:r_info?JSON.parse(r_info)?.remember:true,
        })
        const lg=await AsyncStorage.getItem('lg')||'uni'
        console.warn(this.props.navigation.state.params.agent)
        this.setState({
            lg:lg
        })
        // this.focusListener = this.props.navigation.addListener('didFocus', async() => {
        //     const endpoint=await AsyncStorage.getItem('endpoint')||''
        //     const lg=await AsyncStorage.getItem('lg')||'uni'
        //     console.warn(lg)
        //     this.setState({
        //         endpoint:endpoint,
        //         lg:lg
        //     })
        // });


        AsyncStorage.setItem('endpoint',this.props.navigation.state.params.agent.WebSite)
        if(this.props.navigation.state.params.agent.LiveAPI){
            AsyncStorage.setItem('LiveAPI',this.props.navigation.state.params.agent.LiveAPI)
            AsyncStorage.setItem('LiveTimes',this.props.navigation.state.params.agent.LiveTime)
        }else{
            AsyncStorage.removeItem('LiveAPI',this.props.navigation.state.params.agent.LiveAPI)
            AsyncStorage.removeItem('LiveTimes',this.props.navigation.state.params.agent.LiveTime)
        }
        
        AsyncStorage.setItem('key',this.props.navigation.state.params.agent.AdminKEY)
       


        this.setupFirebase()
    }
    setupFirebase(){
        // const token= await messaging().getToken()
        // console.log("token ",token)
        messaging().onMessage(async remoteMessage => {
          console.log(remoteMessage)
            Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
        });
        // messaging().getInitialNotification(res => {
        // Alert.alert(res.notification.title, res.notification.body);
        // })
        messaging().onNotificationOpenedApp(async res =>{
          Alert.alert(res.notification.title, res.notification.body);
        })
        
    }
    async subscribeTopic(uid){
        if(uid){
          const subscribe=await AsyncStorage.getItem('subscribe_user')
          console.log(subscribe)
          if(!subscribe){
            messaging().subscribeToTopic(uid)
            console.log('subscribe ====>> ',uid)
            AsyncStorage.setItem('subscribe_user',uid)
          }else{
            if(subscribe!=uid){
              messaging().unsubscribeFromTopic(subscribe)
              messaging().subscribeToTopic(uid)
              console.log('subscribe ====>> ',uid)
              AsyncStorage.setItem('subscribe_user',uid)
            }
          }
        }
        
      }
    componentWillUnmount() {
        // Remove the event listener before removing the screen from the stack
    }
    render() {
        return (
            <View style={styles.container}>
             <View style={{
                        flexDirection:'row',
                        marginHorizontal:5,
                        marginVertical:20,
                        justifyContent:'center'
                    }}>
                        <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                            onPress={()=>{
                                this.setState({
                                    lg:'uni'
                                })
                                AsyncStorage.setItem('lg','uni')
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
                                AsyncStorage.setItem('lg','zg')
                            }}>
                            <Image source={this.state.lg=='zg'?radio_btn_selected:radio_btn_unselected} 
                            style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                            <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>Zawgyi</Text>
                        </TouchableOpacity>
                    </View>
                <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                    <Image
                        source={logo}
                        style={[
                            {
                                width: 100,
                                height: 100,
                                resizeMode:'center'
                            }
                        ]}
                    />
                </View>
                <View style={{flex:2}}>
                    <View style={styles.inputContainer}>
                        <TextInput
                        style={styles.input}
                        placeholder={word[this.state.lg].name}
                        placeholderTextColor={Color.DARKPRIMARYTEXTCOLOR}
                        value={this.state.userName}
                        underlineColorAndroid="transparent"
                        onChangeText={(text)=>this.setState({userName:text})}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                        secureTextEntry
                        style={styles.input}
                        placeholder={word[this.state.lg].password}
                        placeholderTextColor={Color.DARKPRIMARYTEXTCOLOR}
                        value={this.state.password}
                        underlineColorAndroid="transparent"
                        onChangeText={(text)=>this.setState({password:text})}
                        />
                    </View>
                    <View style={{
                        alignItems:'center',
                        justifyContent:'center',
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity style={{
                            padding:10,
                        }} onPress={()=>{
                            this.setState({
                                remember:!this.state.remember
                            })
                        }}>
                            <Image source={this.state.remember?tickIcon:untickIcon}style={{height:25,width:25}}/>
                        </TouchableOpacity>
                        <Text style={{color:'#262626',fontSize:17,fontWeight:'bold'}}>
                            Remember Me
                        </Text>
                    </View>
                    <TouchableOpacity onPress={()=>{
                        if(this.state.endpoint==''){
                            Alert.alert(
                                config.AppName,
                                'Please set endpoint first!',
                            )
                            return;
                        }
                        if(this.state.userName==""||this.state.password==""){
                            Alert.alert(
                                config.AppName,
                                'အမည္ စကားဝွက္ျပည့္စုံစြာျဖည့္ေပးပါ',
                                [
                                { text: 'OK', onDismiss: () => { console.warn("alert dismiss") } },
                                ]
                            )
                        }else{
                            if(this.state.endpoint=='http://luckyggapi.masterjoker23.com/'){
                                Alert.alert(
                                    config.AppName,
                                    'Can\'t Login!',
                                    [
                                    { text: 'OK', onDismiss: () => { console.warn("alert dismiss") } },
                                    ]
                                )
                                return;
                            }
                            this.setState({
                                loading:true
                            })
                            dal.getLogin(this.state.endpoint,this.state.userName,this.state.password,(err, result) => {
                                if (err) {
                                    this.setState({
                                        loading:false
                                    })
                                    Alert.alert(
                                    config.AppName,
                                        'Something went wrong',
                                        [
                                            { text: 'OK', onDismiss: () => { console.warn("alert dismiss") } },
                                        ]
                                        )
                                }
                                else {
                                    if(result.Status=='OK'){
                                        if(this.state.remember){
                                            AsyncStorage.setItem(`${this.props.navigation.state.params.agent.AppName}r_info`,JSON.stringify(
                                                {
                                                    name:this.state.userName,
                                                    password:this.state.password,
                                                    remember:true,
                                                }
                                            ))
                                        }else{
                                            AsyncStorage.setItem(`${this.props.navigation.state.params.agent.AppName}r_info`,JSON.stringify(
                                                {
                                                    name:'',
                                                    password:'',
                                                    remember:false
                                                }
                                            ))
                                        }
                                        this.setState({
                                            loading:false
                                        })
                                        this.subscribeTopic(result.Data[0].AgentID)
                                        AsyncStorage.setItem('user',JSON.stringify(result.Data))
                                        this.props.navigation.navigate('Home')
                                    }else{
                                        this.setState({
                                            loading:false
                                        })
                                        Alert.alert(
                                            config.AppName,
                                            result.Status,
                                            [
                                            { text: 'OK', onDismiss: () => { console.warn("alert dismiss") } },
                                            ]
                                        )
                                    } 
                                }
                            })
                        } 
                    }}
                        style={{height:50,borderRadius:50,marginHorizontal:30,backgroundColor:Color.PRIMARYCOLOR,
                        flexDirection:'row',alignItems:'center',marginTop:30,justifyContent:'center'}}>
                        <Text style={{color:'#fff',fontSize:17}}>
                            {word[this.state.lg].login}
                        </Text>
                    </TouchableOpacity>
                    {/* <View style={{
                        alignItems:'center',
                        justifyContent:'center',
                        marginTop:30
                    }}>
                        <TouchableOpacity style={{
                            padding:10,
                            borderRadius:10,
                            backgroundColor:Color.PRIMARYCOLOR,
                        }} onPress={()=>{
                            this.props.navigation.navigate('Setting')
                        }}>
                            <Image source={settingIcon}style={{height:30,width:30,tintColor:'#fff'}}/>
                        </TouchableOpacity>
                    </View> */}
                </View>
                <Loading show={this.state.loading}/>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
      flex           : 1,
      backgroundColor: '#fff',
    },
    alertTxt:{
        color:Color.red,
        fontSize:16,
        marginHorizontal:10,
        marginTop:25,
        textAlign:'center',
    },
    buttonView:{
        width:width*0.8,
        height:height*0.08,
        padding: 5,
        margin:10,
        borderRadius:5,
        shadowColor: '#000000',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        backgroundColor:Color.lightBlue,
        elevation: 5,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row'
    },
    btnTxt:{
        color:'white',
        fontSize:18,
        fontWeight:'bold',
        marginLeft:5
    },
    inputContainer: {
        padding: 2,
        flexDirection: 'row',
        marginHorizontal:30 ,
        marginVertical: 10,
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
export default Home;