import React, {Component} from 'react';
import {
  Platform,
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
  Picker,
  DatePickerAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tickImg from '../assets/images/tick.png'
import untickImg from '../assets/images/untick.png'
import dal from '../dal.js'
import config from '../config/config.js'
import Color from '../utils/Color.js'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
import moment from 'moment'
let that;
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
export default class Users extends Component {
    constructor(props) {
        super(props);
        let date=new Date()
        this.state = {
            loading:false,
            dataProvider: dataProvider.cloneWithRows([]),
            PaymentType:'All',
            startDate:moment(date).format('YYYY/MM/DD'),
            endDate:moment(date).format('YYYY/MM/DD'),
            filterDate:false,
            users:[],
            user:{
                UserID:'All',
                UserNo:'User-All',
                discount2D:0,
                discount3D:0
            },
            agents:[],
            agent:{
                AgentID:'Agent-All',
                AgentName:'All',
            }
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
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    componentDidMount() {
        that=this
        this.getAgents()
    }
    getAgents(){
        dal.getAgents(this.props.navigation.state.params.endpoint,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                this.setState({
                    agents:resp.Data,
                    loading:false
                })
            }else{
                this.setState({
                    agents:[],
                    loading:false
                })
            }
        }
        })
    }
    renderAgents(){
        return this.state.agents.map((value,index)=>{
          return(
            <Picker.Item label={value.AgentName} value={value.AgentID} key={index} />
          )
        })
    }
     getUsers(){
        dal.getAllUsersByAgent(this.props.navigation.state.params.endpoint,this.state.agent.AgentID,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
          console.log(resp)
            if(resp&&resp.Status=='OK'&&resp.Data.length>0){
                let temp=resp.Data
                this.setState({
                    users:temp,
                    loading:false
                })
            }else{
                this.setState({
                    users:[],
                    loading:false
                })
            }
        }
        })
    }
    renderUsers(){
        return this.state.users.map((value,index)=>{
          return(
            <Picker.Item label={value.UserNo} value={value.UserID} key={index} />
          )
        })
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
            }} >
                <View style={{
                    flex:3
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {moment(data.CreatedDate).format('YYYY/MM/DD')+'\n'+moment(data.CreatedDate).format('hh:mm A')}
                    </Text>
                </View>
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:12,
                            fontFamily:'Roboto-Bold',
                            textAlign:'center'
                        }}>
                            {data.UserName}
                        </Text>
                    </View>
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:12,
                            fontFamily:'Roboto-Bold',
                            textAlign:'center'
                        }}>
                            {data.MoneyIn}
                        </Text>
                    </View>
                
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                       color:'red',
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.MoneyOut}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                       {data.Remark}
                    </Text>
                </View>
            </View>
        );
    }
    
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
        )
    }
    
    renderRow1(){
        const {lg}=this.props.navigation.state.params
        return(
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                marginVertical:5
            }}>
                <TouchableOpacity style={{
                        alignItems:'center'
                    }} onPress={()=>{
                        this.setState({
                            filterDate:!this.state.filterDate
                        })
                    }}>
                        <Image source={this.state.filterDate?tickImg:untickImg} style={{
                            width:25,
                            height:25,
                            tintColor:Color.PRIMARYCOLOR
                        }}/>
                </TouchableOpacity>
                <TouchableOpacity style={{width:((width*0.5)-25),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,alignItems:'center'}}
                    onPress={async()=>{
                        try {
                            const {
                              action,
                              year,
                              month,
                              day
                            } = await DatePickerAndroid.open({
                              // Use `new Date()` for current date.
                              // May 25 2020. Month 0 is January.
                              date: new Date()
                            });
                            if (action !== DatePickerAndroid.dismissedAction) {
                              // Selected year, month (0-11), day
                              this.setState({
                                  startDate:moment(`${month+1}/${day}/${year}`).format('YYYY/MM/DD')
                              })
                            }
                          } catch ({ code, message }) {
                            Alert.alert(config.AppName,'Cannot open date picker')
                          }
                    }}
                >
                    <Text>
                        {lg=='uni'?'နေ့ (မှ)':"ေန႔ (မွ)"} {this.state.startDate}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{width:((width*0.5)-25),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,alignItems:'center'}}
                    onPress={async()=>{
                        try {
                            const {
                              action,
                              year,
                              month,
                              day
                            } = await DatePickerAndroid.open({
                              // Use `new Date()` for current date.
                              // May 25 2020. Month 0 is January.
                              date: new Date()
                            });
                            if (action !== DatePickerAndroid.dismissedAction) {
                              // Selected year, month (0-11), day
                              this.setState({
                                  endDate:moment(`${month+1}/${day}/${year}`).format('YYYY/MM/DD')
                              })
                            }
                          } catch ({ code, message }) {
                            Alert.alert(config.AppName,'Cannot open date picker')
                          }
                    }}
                >
                    <Text>
                    {lg=='uni'?'နေ့ (ထိ)':"ေန႔ (ထိ)"} {this.state.endDate}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    renderRow3(){
        const {lg}=this.props.navigation.state.params
        return(
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                marginVertical:5
            }}>
                <View style={{width:((width*0.33)-5),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.PaymentType}
                        style={{ height:40, width:((width*0.33)-5)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            this.setState({
                                PaymentType:itemValue,
                            })
                        }}>
                        <Picker.Item label={'Payment-All'} value={'All'}/>
                        <Picker.Item label={'Cash'} value={'Cash'}/>
                        <Picker.Item label={'Bet'} value={'Bet'}/>
                        <Picker.Item label={'Bank'} value={'Bank'}/>
                        <Picker.Item label={'K Pay'} value={'K Pay'}/>
                        <Picker.Item label={'AYA Pay'} value={'AYA Pay'}/>
                        <Picker.Item label={'Wave'} value={'Wave'}/>
                        <Picker.Item label={'KBZ'} value={'KBZ'}/>
                        <Picker.Item label={'AYA'} value={'AYA'}/>
                        <Picker.Item label={'CB'} value={'CB'}/>
                        <Picker.Item label={'Agent'} value={'Agent'}/>
                    </Picker>
                </View>
                <TouchableOpacity style={{
                   width:((width*0.33)-5),
                    // width:((width*0.25)-5),
                    height:40,
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:Color.PRIMARYCOLOR,
                    borderRadius:5,
                }} onPress={()=>{
                    // if(this.state.userId=='All'){
                    //     Alert.alert(config.AppName,'Please select user first!')
                    //     return;
                    // }
                    if(this.state.agent.AgentID=='All'){
                        Alert.alert(config.AppName,'Please select the agent!')
                        return;
                    }
                    // if(this.state.user.UserID=='All'){
                    //     Alert.alert(config.AppName,'Please select the user!')
                    //     return;
                    // }
                    this.setState({loading:true},()=>{
                        dal.getAPIMInOutList(
                            this.props.navigation.state.params.endpoint,
                            this.state.agent.AgentID,
                            this.state.user.UserID,
                            'All',
                            this.state.PaymentType,
                            this.state.filterDate,
                            this.state.startDate,
                            this.state.endDate,(err,resp)=>{
                            if(err){

                               this.setState({loading:false})
                               Alert.alert(config.AppName,'Error in saving!')
                            }else{
                               
                               console.log(resp)
                               if(resp.Status=='OK'){
                                   this.setState({
                                       loading:false,
                                       dataProvider:dataProvider.cloneWithRows(resp.Data)
                                   })
                               }else{
                                    this.setState({
                                        loading:false,
                                        dataProvider:dataProvider.cloneWithRows([])
                                    })
                               }
                            }
                        })
                    })
                    
                }}>
                    <Text style={{
                        color:'#fff',
                        fontFamily:'Roboto',
                        fontSize:14
                    }}>
                        VIEW
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                   width:((width*0.33)-5),
                    // width:((width*0.25)-5),
                    height:40,
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:Color.PRIMARYCOLOR,
                    borderRadius:5,
                }} onPress={()=>{
                    // if(this.state.userId=='All'){
                    //     Alert.alert(config.AppName,'Please select user first!')
                    //     return;
                    // }
                    // if(this.state.agent.AgentID=='All'){
                    //     Alert.alert(config.AppName,'Please select the agent!')
                    //     return;
                    // }
                    // if(this.state.user.UserID=='All'){
                    //     Alert.alert(config.AppName,'Please select the user!')
                    //     return;
                    // }
                    this.setState({loading:true},()=>{
                        dal.getRemainList(
                            this.props.navigation.state.params.endpoint,
                            this.state.agent.AgentID,
                            this.state.user.UserID,
                            this.state.PaymentType,
                            this.state.filterDate,
                            this.state.startDate,
                            this.state.endDate,(err,resp)=>{
                            if(err){

                               this.setState({loading:false})
                               Alert.alert(config.AppName,'Error in saving!')
                            }else{
                               
                               console.log(resp)
                               if(resp.Status=='OK'){
                                this.props.navigation.navigate('RemainList',
                                {
                                    user:this.props.navigation.state.params.user,
                                    endpoint:this.props.navigation.state.params.endpoint,
                                    lg:this.props.navigation.state.params.lg,
                                    data:resp.Data
                                })
                                this.setState({
                                    loading:false,
                                })
                               }else{
                                    this.setState({
                                        loading:false,
                                        dataProvider:dataProvider.cloneWithRows([])
                                    })
                               }
                            }
                        })
                    })
                    
                }}>
                    <Text style={{
                        color:'#fff',
                        fontFamily:'Roboto',
                        fontSize:14
                    }}>
                        {lg=='uni'?'ငွေလက်ကျန်':'ေငြလက္က်န္'}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    renderPage1(){
        let amt=0,amt1=0
        const temp=this.state.dataProvider.getAllData()
        temp.map((data,i)=>{
            amt+=Number(data.MoneyIn)
            amt1+=Number(data.MoneyOut)
        })
        const {lg}=this.props.navigation.state.params
        return(
            <View style={{flex:1}}>
                <View style={{
                    width:width,
                    height:50,
                    borderBottomWidth:1,
                    borderColor:Color.DIVIDERCOLOR,
                    flexDirection:'row',
                    alignItems:'center'
                }}>
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            
                            textAlign:'center'
                        }}>
                            {lg=='uni'?'နေ့':'ေန႔'}
                        </Text>
                    </View>
                    <TouchableOpacity style={{
                        flex:3
                    }} onPress={()=>{
                        this.setState({
                            showReal:!this.state.showReal
                        })
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            textAlign:'center'
                        }}>
                             {lg=='uni'?'အမည်':'အမည္'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        flex:3
                    }}onPress={()=>{
                        this.setState({
                            showReal:!this.state.showReal
                        })
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            textAlign:'center'
                        }}>
                            {lg=='uni'?'အပ်ငွေ':'အပ္ေငြ'}
                        </Text>
                    </TouchableOpacity>
                    
                    <View style={{
                        flex:2
                    }}>
                        <Text style={{
                            fontSize:12,
                            textAlign:'center'
                        }}>
                            {lg=='uni'?'ထုတ်ငွေ':'ထုတ္ေငြ'}
                        </Text>
                    </View>
                    <View style={{
                        flex:2
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            
                            textAlign:'center'
                        }}>
                            {lg=='uni'?'မှတ်ချက်':'မွတ္ခ်က္'}
                        </Text>
                    </View>
                </View>
                <View style={{flex:1}}>
                    <RecyclerListView 
                        layoutProvider={this._layoutProvider} 
                        dataProvider={this.state.dataProvider} 
                        rowRenderer={this._rowRenderer} 
                        extendedState={this.state}
                    />
                </View>
                <View style={{
                    width:width,
                    paddingVertical:10,
                    borderTopWidth:1,
                    borderColor:Color.DIVIDERCOLOR,
                    flexDirection:'row',
                    alignItems:'center'
                }}>
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:14,
                            fontWeight:'bold',
                            textAlign:'center'
                        }}>
                            Total
                        </Text>
                    </View>
                    <TouchableOpacity style={{
                        flex:3
                    }} onPress={()=>{
                        this.setState({
                            showReal:!this.state.showReal
                        })
                    }}>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        flex:3
                    }}onPress={()=>{
                        this.setState({
                            showReal:!this.state.showReal
                        })
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:14,
                            fontWeight:'bold',
                            textAlign:'center'
                        }}>
                             {amt}
                        </Text>
                    </TouchableOpacity>
                    
                    <View style={{
                        flex:2
                    }}>
                        <Text style={{
                            color:'red',
                            fontSize:14,
                            fontWeight:'bold',
                            textAlign:'center'
                        }}>
                             {amt1}
                        </Text>
                    </View>
                    <View style={{
                        flex:2
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:14,
                            fontWeight:'bold',
                            textAlign:'center'
                        }}>
                        </Text>
                    </View>
                </View>
                <View style={{
                    width:width,
                    height:height*0.07,
                    backgroundColor:Color.PRIMARYCOLOR,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'center'
                }}>
                    <View style={{
                        flex:3,
                        alignItems:'center'
                    }}>
                        <Text style={{
                            color:'#fff',
                            fontSize:15,
                            fontFamily:'Roboto-Bold',
                            marginRight:15
                        }}>
                            Total +/-
                        </Text>
                    </View>
                    <View style={{
                        flex:2
                    }}>
                        <Text style={{
                                color:'#fff',
                                fontSize:15,
                                fontFamily:'Roboto-Bold',
                            }}>
                                {Number(amt)+Number(amt1)}
                        </Text>
                    </View>
                    
                    
                </View>
            </View>
        )
    }
    render() {
        return (
        <View style={styles.container}>
            {this.renderRow1()}
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                marginVertical:5
            }}>
                    <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,alignItems:'center'}}>
                        <Picker
                        mode='dropdown'
                        selectedValue={this.state.agent?.AgentID}
                        style={{ height:40, width:((width*0.5)-10)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.agents.findIndex(x => x.AgentID==itemValue);
                            if(i!==-1){
                                this.setState({
                                    agent:this.state.agents[i],
                                    loading:true
                                },()=>{
                                    //this.getAgentRemainAmt()
                                    this.getUsers()
                                })
                            }else{
                                this.setState({
                                    agent:{
                                        AgentID:'All',
                                        AgentName:'Agent-All',
                                    },
                                    //aremainAmt:0
                                })
                            }
                            
                        }}>
                        <Picker.Item label={'Agent-All'} value={'All'}/>
                        {this.renderAgents()}
                    </Picker>
                    </View>
                    <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,alignItems:'center'}}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.user?.UserID}
                            style={{ height:40, width:((width*0.5)-10)}}
                            onValueChange={(itemValue, itemIndex) =>{
                                let i=this.state.users.findIndex(x => x.UserID==itemValue);
                                if(i!==-1){
                                    this.setState({
                                        user:this.state.users[i],
                                    })
                                }else{
                                    this.setState({
                                        user:{
                                            UserID:'All',
                                            UserNo:'User-All',
                                            discount2D:0,
                                            discount3D:0
                                        },
                                        remainAmt:0
                                    })
                                }
                                
                            }}>
                            <Picker.Item label={'User-All'} value={'All'}/>
                            {this.renderUsers()}
                        </Picker>
                    </View>
            </View>
            
            {this.renderRow3()}
            {this.renderPage1()}
            
            {this.renderLoading()}
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
    loading: {
        position: 'absolute',
        top: 50,
        left: 150,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems:'center',
    },
    input: {
        height: height*0.06,
        flex:1,
        textAlign: 'center',
        color            : "#000",
        fontSize         : 13,
        
        marginHorizontal:10
    },
});