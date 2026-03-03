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
import Loading from '../components/loading.js'
import Color from '../utils/Color.js';
import dal from '../dal.js'
import config from '../config/config.js'
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import word from '../pages/data.json'
const enablePlus=false
const { width, height } = Dimensions.get("window");
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password:'ztztadminitworld@',//ztztadminitworld@
            isTure:false,
            endpoint:'',//A88ED1E0-D02E-4F7B-9B5C-120B7AB02D20
            fStyle:'uni',
            loading:false
        }
    }
    async componentDidMount() {
        const lg=await AsyncStorage.getItem('lg')||'uni'
        this.setState({
            fStyle:lg
        })
    }
    
    render() {
        return (
            <View style={styles.container}>
                {/* {!this.state.isTure?
                <View style={{flex:1,justifyContent:'center'}}>
                    
                    <View style={styles.inputContainer}>
                        <TextInput
                        secureTextEntry
                        style={styles.input}
                        placeholder={'Age'}
                        placeholderTextColor={Color.DARKPRIMARYTEXTCOLOR}
                        value={this.state.password}
                        underlineColorAndroid="transparent"
                        onChangeText={(text)=>this.setState({password:text})}
                        />
                    </View>
                    <TouchableOpacity onPress={()=>{
                        if(this.state.password=='ztztadminitworld@'){
                            this.setState({
                                password:'',
                                isTure:true
                            })
                        }else{
                            Alert.alert(config.AppName,'OK!')
                        }
                    }}
                        style={{height:50,borderRadius:50,marginHorizontal:30,backgroundColor:Color.PRIMARYCOLOR,
                        flexDirection:'row',alignItems:'center',marginTop:30,justifyContent:'center'}}>
                        <Text style={{color:'#fff',fontSize:17}}>
                            ENTER
                        </Text>
                    </TouchableOpacity>
                
                </View> */}
                <View style={{flex:1,justifyContent:'center'}}>
                    <View style={{
                        flexDirection:'row',
                        marginHorizontal:5,
                        marginVertical:20,
                        justifyContent:'center'
                    }}>
                        <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                            onPress={()=>{
                                this.setState({
                                    fStyle:'uni'
                                })
                            }}>
                            <Image source={this.state.fStyle=='uni'?radio_btn_selected:radio_btn_unselected} 
                            style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                            <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>Unicode</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                            onPress={()=>{
                                this.setState({
                                    fStyle:'zg'
                                })
                            }}>
                            <Image source={this.state.fStyle=='zg'?radio_btn_selected:radio_btn_unselected} 
                            style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                            <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>Zawgyi</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{
                        fontSize:16,
                        fontFamily:'Roboto-Bold',
                        color:'#262626',
                        marginHorizontal:30
                    }}>
                        KEY
                    </Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                        style={styles.input}
                        placeholder={'KEY'}
                        placeholderTextColor={Color.DARKPRIMARYTEXTCOLOR}
                        value={this.state.endpoint}
                        underlineColorAndroid="transparent"
                        onChangeText={(text)=>this.setState({endpoint:text})}
                        />
                    </View>
                    <TouchableOpacity onPress={()=>{
                        // AsyncStorage.setItem('endpoint',this.state.endpoint)
                        // AsyncStorage.setItem('lg',this.state.fStyle)
                        // this.props.navigation.goBack()
                        this.setState({
                            loading:true
                        })
                        dal.getEndpointByKey(this.state.endpoint,'ztztadminitworld@',(err,resp)=>{
                            if(err){
                                console.log(err)
                                Alert.alert(config.AppName,'Something went wrong!')
                                this.setState({
                                    loading:false
                                })
                            }else{
                                console.log('activate ',resp)
                                if(resp&&resp.Status&&resp.Data&&resp.Data.length>0){
                                    this.setState({
                                        loading:false
                                    })
                                    Alert.alert(config.AppName,'Activation Successful!',[
                                        {text:'OK',onPress:()=>{
                                            AsyncStorage.setItem('endpoint',resp.Data[0].WebSite)
                                            if(resp.Data[0].LiveAPI){
                                                AsyncStorage.setItem('LiveAPI',resp.Data[0].LiveAPI)
                                                AsyncStorage.setItem('LiveTimes',resp.Data[0].LiveTime)
                                            }else{
                                                AsyncStorage.removeItem('LiveAPI',resp.Data[0].LiveAPI)
                                                AsyncStorage.removeItem('LiveTimes',resp.Data[0].LiveTime)
                                            }
                                            
                                            AsyncStorage.setItem('key',this.state.endpoint)
                                            AsyncStorage.setItem('lg',this.state.fStyle)
                                            if(enablePlus){
                                                AsyncStorage.setItem('enablePlus','true')
                                                this.props.navigation.navigate('AppNavigator')
                                            }else{
                                                this.props.navigation.goBack() 
                                            }
                                            
                                        }}
                                    ],
                                    {cancelable:false}
                                    )
                                   
                                }else{
                                    this.setState({
                                        loading:false
                                    })
                                    Alert.alert(config.AppName,'Activation Failed!')
                                }
                            }
                        })
                    }}
                        style={{height:50,borderRadius:50,marginHorizontal:30,backgroundColor:Color.PRIMARYCOLOR,
                        flexDirection:'row',alignItems:'center',marginTop:30,justifyContent:'center'}}>
                        <Text style={{color:'#fff',fontSize:17}}>
                            ACTIVATE
                        </Text>
                    </TouchableOpacity>
                
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