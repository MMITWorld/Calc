import React,{Component} from "react";
import { 
    View,
    Text,
    Alert,
    Image,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    AsyncStorage,
    Modal,
    Linking,
    ScrollView,
    ActivityIndicator,
    Clipboard,
    Share
} from "react-native";
const Rabbit = require("rabbit-node");



import TextMarquee from '../components/textmarquee.js'
import Color from '../utils/Color.js';
import settingIcon from '../assets/images/setting.png'
import CardView from 'react-native-cardview'
import dal from '../dal.js'
import moment from 'moment'
import word from './data.json'
import logoutIcon from '../assets/images/logout.png'
import youtubeIcon from '../assets/images/youtube.png'
import playstoreIcon from '../assets/images/playstore.png'
import telegramIcon from '../assets/images/telegram.png'
import googledriveIcon from '../assets/images/googledrive.png'
const { width, height } = Dimensions.get("window");
//TZT 
let showLive=true
//TZT
let liveBtnTxt='Telegram Channel'
//TZT 
let liveBtnUrl='https://t.me/itwsoftware'//'https://play.google.com/store/apps/details?id=com.gstd'
//TZT Update Version
export const CURRENT_VERSION = '2.0.5'
import messaging from '@react-native-firebase/messaging';
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info:[],
            endpoint:'',
            lg:'uni',
            showModal:false,
            msg:'',
            enablePlus:'false',
            showVideosModal:false,
            tutorialList:[],
            tutorialLoading:false,
            showUpdateModal:false,
            updateInfo:null
        }
    }
    async componentDidMount() {
        let liveTimes=await AsyncStorage.getItem('LiveTimes')||''
        console.log('live times ',liveTimes)
        this.asyncData()
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.asyncData()
        });
        this.setupFirebase()
    }
    setupFirebase(){
        // const token= await messaging().getToken()
        // console.log("token ",token)
        messaging().onMessage(async remoteMessage => {
            console.log(typeof remoteMessage.notification.body)
            Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
        });
        // messaging().getInitialNotification(res => {
        // Alert.alert(res.notification.title, res.notification.body);
        // })
        messaging().onNotificationOpenedApp(async res =>{
          Alert.alert(res.notification.title, res.notification.body);
        })
        
    }
    async asyncData(){
        const info=await AsyncStorage.getItem('user')
        const endpoint=await AsyncStorage.getItem('endpoint')
        const key=await AsyncStorage.getItem('key')
        const lg=await AsyncStorage.getItem('lg')||'uni'
        const enablePlus=await AsyncStorage.getItem('enablePlus')||'false'
        console.log("key ",key)
        this.setState({
            info:JSON.parse(info),
            endpoint:endpoint,
            lg:lg,
            enablePlus:enablePlus
        })
        dal.getUpdateLink((err, resp) => {
            if(!err && resp && resp.Status=='OK' && Array.isArray(resp.Data) && resp.Data.length>0){
                const info = resp.Data[0]
                const remoteVer = (info.Version || '').toString()
                if(this.compareVersion(remoteVer, CURRENT_VERSION) > 0){
                    this.setState({
                        updateInfo: info,
                        showUpdateModal: true
                    })
                }
            }
        })
        if(key){
            dal.getMessageforAdmin(key,(err,resp)=>{
                if(err){
                    this.setState({
                        loading:false
                    })
                    console.log('err ',err)
                }else{
                    console.log("resp ",resp)
                    if(resp&&resp.Status=='200'&&resp.Data.length>0){
                        let exp=`Expire Date = ${moment(resp.Data[0].ExpireDate).format('DD/MM/YYYY')}  `
                        let remain=`Remain Days = ${resp.Data[0].RemainDay}  `
                        let title=resp.Data[0].GMessage?this.state.lg=='uni'?Rabbit.zg2uni(resp.Data[0].GMessage):resp.Data[0].GMessage:''
                        let AppKey=resp.Data[0].AppKEY?`ထိုးသား Key= ${resp.Data[0].AppKEY}`:''
                        console.warn("App key",resp.Data[0].AppKEY)
                        this.setState({
                            msg:exp+remain+title+AppKey,
                            loading:false
                        })
                    }else{
                        this.setState({
                            msg:'',
                            loading:false
                        })
                    }
                }
                })
        }
    }
    componentWillUnmount(){
        this.focusListener.remove();
    }
    compareVersion(a,b){
        const pa = (a || '').toString().split('.').map(n=>parseInt(n,10)||0);
        const pb = (b || '').toString().split('.').map(n=>parseInt(n,10)||0);
        const len = Math.max(pa.length,pb.length);
        for(let i=0;i<len;i++){
            const va = pa[i] || 0;
            const vb = pb[i] || 0;
            if(va>vb) return 1;
            if(va<vb) return -1;
        }
        return 0;
    }
    renderUpdateModal(){
        if(!this.state.showUpdateModal) return null;
        const info = this.state.updateInfo || {};
        return(
            <Modal
              transparent={true}
              visible={this.state.showUpdateModal}
              onRequestClose={() => this.setState({ showUpdateModal:false })}
            >
              <View style={{flex:1,backgroundColor:'#00000066',justifyContent:'center',alignItems:'center'}}>
                <View style={{width:width*0.9,backgroundColor:'#fff',borderRadius:8,padding:16}}>
                  <Text style={{fontSize:18,fontWeight:'bold',marginBottom:12,textAlign:'center'}}>Update Available</Text>
                  <View style={{flexDirection:'row',marginTop:8}}>
                    <TouchableOpacity
                      onPress={() => this.setState({ showUpdateModal:false })}
                      style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                    >
                      <Text style={{color:'#fff',fontWeight:'bold'}}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { if(info.PlayStoreLink) Linking.openURL(info.PlayStoreLink); }}
                      style={{flex:1,height:40,backgroundColor:Color.Green,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8,flexDirection:'row'}}
                    >
                      <Image source={playstoreIcon} style={{width:18,height:18,marginRight:6}} />
                      <Text style={{color:'#fff',fontWeight:'bold'}}>PlayStore</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row',marginTop:8}}>
                    <TouchableOpacity
                      onPress={() => { if(info.TelegramLink) Linking.openURL(info.TelegramLink); }}
                      style={{flex:1,height:40,backgroundColor:Color.Green,borderRadius:5,alignItems:'center',justifyContent:'center',flexDirection:'row'}}
                    >
                      <Image source={telegramIcon} style={{width:18,height:18,marginRight:6}} />
                      <Text style={{color:'#fff',fontWeight:'bold'}}>Telegram</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { if(info.GoogleDriveLink) Linking.openURL(info.GoogleDriveLink); }}
                      style={{flex:1,height:40,backgroundColor:Color.Green,borderRadius:5,alignItems:'center',justifyContent:'center',marginLeft:8,flexDirection:'row'}}
                    >
                      <Image source={googledriveIcon} style={{width:18,height:18,marginRight:6}} />
                      <Text style={{color:'#fff',fontWeight:'bold'}}>GoogleDrive</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
        )
    }
    renderItem(title,visible,route){
        if(!visible){
            return(
                <View style={{
                    width:(width*0.5)-20,
                    height:height*0.15
                }}>
                </View>
            )
        }
        return(
            <View style={{
                width:(width*0.45),
                height:height*0.15
            }}>
                <CardView
                    cardElevation={10}
                    cardMaxElevation={10}
                    cornerRadius={10}>
                    <TouchableOpacity style={{ 
                        width:(width*0.45),
                        height:height*0.15,
                        alignItems:'center',
                        backgroundColor:Color.PRIMARYCOLOR,
                        justifyContent:'center'
                    }} onPress={()=>{
                        if(route=='MoneyInOut'){
                            this.setState({
                                showModal:true
                            })
                            return;
                        }
                        this.props.navigation.navigate(route,
                            {
                                user:this.state.info,
                                endpoint:this.state.endpoint,
                                lg:this.state.lg
                            })
                    }}>
                        <Text style={{
                            color:Color.PRIMARYTEXTCOLOR,
                            fontSize:19,
                        }}>
                            {title}
                        </Text>
                    </TouchableOpacity>
                </CardView>
            </View>
            
        )
    }
    renderModal(){
        return(
            <Modal
            transparent={true}
            visible={this.state.showModal}
            animationType='slide'
            onRequestClose={()=>{
                this.setState({
                    showModal:false,
                })
            }}
            >
                <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',padding:5,width:width-32,borderRadius:5}}>
                        <Text style={{fontSize:18,fontFamily:'Roboto-Bold',color:'#262626',marginTop:16,marginBottom:32,marginLeft:10}}>
                        {this.state.lg=='uni'?'ငွေသွင်း/ငွေထုတ်လုပ်ရန်':' ေငြသြင္း/ေငြထုတ္လုပ္ရန္'} 
                        </Text>
                        <View style={{flexDirection:'row',marginVertical:10}}>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:'#EF7B49',paddingVertical:8
                                ,borderRadius:7,marginHorizontal:10}} onPress={()=>{
                                    this.setState({
                                        showModal:false,
                                    })
                                    this.props.navigation.navigate('MoneyInOut',
                                    {
                                      in:true,
                                      user:this.state.info,
                                      endpoint:this.state.endpoint,
                                      lg:this.state.lg
                                    })
                                }}>
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>
                                    {this.state.lg=='uni'?'ငွေသွင်းမည်':'ေငြသြင္းမည္'} 
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:'#EF7B49',paddingVertical:8
                                ,borderRadius:7,marginHorizontal:10}} onPress={()=>{
                                    this.setState({
                                        showModal:false,
                                    })
                                    this.props.navigation.navigate('MoneyInOut',
                                    {
                                        user:this.state.info,
                                        endpoint:this.state.endpoint,
                                        lg:this.state.lg,
                                        in:false,
                                    })
                                }}>
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>
                                {this.state.lg=='uni'?'ငွေထုတ်မည်':'ေငြထုတ္မည္'} 
                                </Text>
                            </TouchableOpacity>
                            
                        </View>
                        <View style={{flexDirection:'row',marginVertical:10}}>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:'#EF7B49',paddingVertical:8
                                ,borderRadius:7,marginHorizontal:10}} onPress={()=>{
                                    this.setState({
                                        showModal:false,
                                    })
                                    this.props.navigation.navigate('TransferList',
                                    {
                                        user:this.state.info,
                                        endpoint:this.state.endpoint,
                                        lg:this.state.lg
                                    })
                                }}>
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>
                                    {this.state.lg=='uni'?'လွှဲ/ထုတ် စာရင်း':'လႊဲ/ထုတ္ စာရင္း'}  
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:'#EF7B49',paddingVertical:8
                                ,borderRadius:7,marginHorizontal:10}} onPress={()=>{
                                    this.setState({
                                        showModal:false,
                                    })
                                    this.props.navigation.navigate('MoneyInOutList',
                                    {
                                        user:this.state.info,
                                        endpoint:this.state.endpoint,
                                        lg:this.state.lg
                                    })
                                }}>
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>
                                {this.state.lg=='uni'?'စာရင်း':'စာရင္း'} 
                                </Text>
                            </TouchableOpacity>
                            
                            
                        </View>
                        
                    </View>
                </View>
            </Modal>
        )
    }
    render() {
        const {msg}=this.state
        return (
            <View style={styles.container}>
                
                <View style={{
                    flexDirection:'row',
                    justifyContent:'space-evenly',
                    marginVertical:5
                }}>
                    {this.renderItem(word[this.state.lg].user,true,'Users')}
                    {this.renderItem(word[this.state.lg].term,true,'Terms')}
                </View>
                <View style={{
                    flexDirection:'row',
                    justifyContent:'space-evenly',
                    marginVertical:5
                }}>
                    {this.renderItem(word[this.state.lg].break,true,'Break')}
                    {this.renderItem(word[this.state.lg].ledger,true,'Ledger')}
                </View>
                <View style={{
                    flexDirection:'row',
                    justifyContent:'space-evenly',
                    marginVertical:5
                }}>
                    {this.renderItem(word[this.state.lg].list,true,'Report')}
                    {this.renderItem(word[this.state.lg].cleanfile,true,'CleanFile')}
                </View>
                <View style={{
                    flexDirection:'row',
                    justifyContent:'space-evenly',
                    marginVertical:5
                }}>
                    {this.renderItem(word[this.state.lg].slip,true,'Slip')}
                    {this.renderItem(word[this.state.lg].sale,true,'Sale')}
                </View>
                <View style={{
                    flexDirection:'row',
                    justifyContent:'space-evenly',
                    marginVertical:5
                }}>
                    {this.renderItem(word[this.state.lg].editReport,true,'SlipLog')}
                    {this.renderItem(word[this.state.lg].moneyInOut,this.state.info&&this.state.info.length==1&&this.state.info[0]?.UseMoneyInOut,'MoneyInOut')}
                </View>
                <TextMarquee
                    style={{ fontSize: 18,color:'red'}}
                    duration={msg.length>50?msg.length*200:msg.length*250}
                    loop
                    repeatSpacer={100}
                    marqueeDelay={1000}
                >
                    {msg}
                </TextMarquee>
                <View style={{
                    flexDirection:'row',
                    justifyContent:'flex-end',
                    marginVertical:5,
                    position:'absolute',
                    bottom:5,
                    right:10,
                    elevation:100,
                    borderRadius:20
                }}>
                    <CardView
                        cardElevation={10}
                        cardMaxElevation={10}
                        cornerRadius={10}>
                            <TouchableOpacity style={{padding:10,backgroundColor:Color.PRIMARYCOLOR}} onPress={()=>{
                                //AsyncStorage.removeItem('user')
                                //this.props.navigation.navigate('Login')    
                                this.props.navigation.navigate('UserSetting')    
                            }}>
                                <Image source={settingIcon} style={{width:30,height:30}}/>
                            </TouchableOpacity>
                    </CardView>
                </View>
                {
                showLive&&
            <View style={
              {
                  backgroundColor:'#fff',
                  // shadowColor: '#ccc',
                  // shadowOpacity: 0.5,
                  // shadowRadius: 5,
                  // elevation: 5,
                  overflow: 'hidden',
                  marginTop:10,
                  // position:'absolute',
                  // bottom:10,
                  // right:10,
                  
              alignItems:'center',
              justifyContent:'flex-start',
                  paddingBottom:16,
                  flexDirection:'row'
              }
            }>
                  <View style={{width:10}} />
                  <TouchableOpacity style={{backgroundColor:'red',paddingVertical:8,justifyContent:'center',paddingHorizontal:20,borderTopRightRadius:10,
                  borderBottomLeftRadius:10,marginRight:8}}
                  onPress={()=>{
                    Linking.openURL(liveBtnUrl)
                  }}>
                      <Text style={{color:'#fff',fontSize:14}}>{liveBtnTxt}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{backgroundColor:Color.PRIMARYCOLOR,paddingVertical:8,justifyContent:'center',paddingHorizontal:20,borderTopRightRadius:10,
                  borderBottomLeftRadius:10,}}
                  onPress={()=>{
                    this.setState({ showVideosModal: true, tutorialLoading: true }, () => {
                      if (this.state.endpoint) {
                        dal.getTutorialList(this.state.endpoint, true, (err, resp) => {
                          if (!err && resp) {
                            const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                            this.setState({ tutorialList: list, tutorialLoading:false });
                          } else {
                            this.setState({ tutorialLoading:false });
                          }
                        })
                      } else {
                        this.setState({ tutorialLoading:false });
                      }
                    })
                  }}>
                      <Text style={{color:'#fff',fontSize:14}}>အသုံးပြုပုံ</Text>
                  </TouchableOpacity>
                  
              </View>
          }
                {this.renderModal()}
                {this.renderUpdateModal()}
                <Modal
                  transparent={true}
                  visible={this.state.showVideosModal}
                  onRequestClose={() => this.setState({ showVideosModal: false })}
                >
                  <View style={{flex:1,backgroundColor:'#00000066'}}>
                    <View style={{flex:1,width:'100%',height:'100%',backgroundColor:'#fff',padding:16}}>
                      <Text style={{fontSize:18,fontWeight:'bold',marginBottom:10}}>Tutorial Videos</Text>
                      <View style={{maxHeight:300,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:6,marginBottom:10}}>
                        <View style={{flexDirection:'row',paddingVertical:6,backgroundColor:'#f5f5f5',borderBottomWidth:1,borderColor:'#eee'}}>
                          <Text style={{flex:1,textAlign:'left',fontSize:12,fontWeight:'bold',paddingLeft:10}}>Title</Text>
                        </View>
                        {this.state.tutorialLoading ? (
                          <View style={{padding:10}}>
                            <ActivityIndicator />
                          </View>
                        ) : (
                          <ScrollView>
                            {this.state.tutorialList.map((item, idx) => (
                              <View key={idx} style={{flexDirection:'row',paddingVertical:8,paddingHorizontal:10,borderBottomWidth:1,borderColor:'#eee'}}>
                                <View style={{flex:1,paddingRight:8}}>
                                  <Text style={{fontSize:14,fontWeight:'bold',color:'#222'}}>{item.Title}</Text>
                                  <Text style={{fontSize:12,color:'#555'}}>{item.Description}</Text>
                                </View>
                                <TouchableOpacity
                                  style={{width:60,alignItems:'center',justifyContent:'center'}}
                                  onPress={() => {
                                    const link = item && item.YoutubeLink ? String(item.YoutubeLink).trim() : '';
                                    if (!link) {
                                      return;
                                    }
                                    const isYoutube = /(?:youtube\.com|youtu\.be)/i.test(link);
                                    if (isYoutube) {
                                      Linking.openURL(link);
                                    } else {
                                      Clipboard.setString(link);
                                      Share.share({ message: link });
                                    }
                                  }}
                                >
                                  <Image source={youtubeIcon} style={{width:24,height:24}} />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                      <View style={{flexDirection:'row',marginTop:'auto'}}>
                        <TouchableOpacity
                          onPress={() => this.setState({ showVideosModal: false })}
                          style={{flex:1,height:40,backgroundColor:'#999',borderRadius:5,alignItems:'center',justifyContent:'center'}}
                        >
                          <Text style={{color:'#fff',fontWeight:'bold'}}>CLOSE</Text>
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
      backgroundColor: '#fff',
      paddingTop:16
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
    }
});
export default Home;
