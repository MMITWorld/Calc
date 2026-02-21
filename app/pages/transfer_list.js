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
  Picker,
  AsyncStorage,
  DatePickerAndroid,
} from 'react-native';
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
import CardView from 'react-native-cardview'
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
            },
            isTransfer:true,
            rejectId:null,
            remark:''
        };
        this._layoutProvider = new LayoutProvider(
            index => {
                return 0;
            },
            (type, dim) => {
                dim.width = width;
                dim.height = 190;
            }
        );

        this._rowRenderer = this._rowRenderer.bind(this);
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    componentDidMount() {
        that=this
        this.getTransferList()
    }
    setConfirmReject(status,id){
        dal.setConfirmReject(
            this.props.navigation.state.params.endpoint,status,id,this.state.remark,(err,resp)=>{
            if(err){
                console.log(err)
                this.setState({
                   loading:false,
                })
            }else{
               
               console.log(resp)
               if(resp=='OK'){
                    this.setState({
                        rejectId:null,
                    })
                   this.getTransferList()
               }else{
                    this.setState({
                        loading:false,
                    })
               }
            }
        })
    }
    getTransferList(){
        this.setState({loading:true},()=>{
            dal.getTransferList(
                this.props.navigation.state.params.endpoint,
                this.state.isTransfer,this.state.PaymentType,(err,resp)=>{
                if(err){
                    console.log(err)
                    this.setState({
                       loading:false,
                       dataProvider:dataProvider.cloneWithRows([])
                    })
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
    }
    _rowRenderer(type, data) {
        const {lg}=this.props.navigation.state.params
        return (
            <View style={{
                width:width,
                height:190,
                paddingHorizontal:5,
                paddingVertical:3
            }} >
                <CardView
                    cardElevation={10}
                    cardMaxElevation={10}
                    cornerRadius={5}
                    style={{
                        width:width-10,
                        height:184,
                        justifyContent:'center',
                        paddingHorizontal:5
                    }}
                >
                    <View style={{
                        flexDirection:'row',
                        marginTop:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1
                        }}>
                            {lg=='uni'?'အချိန်':"အခ်ိန္"}
                        </Text>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1,
                            textAlign:'right'
                        }}>
                            {moment(data.CreatedDate).format('DD/MM/YYYY hh:mm A')}
                        </Text>
                    </View>
                    <View style={{
                        flexDirection:'row',
                        marginTop:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1,
                            
                        }}>
                            {lg=='uni'?'အမည်':"အမည္"}
                        </Text>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1,
                            textAlign:'right'
                        }}>
                            {data.UserName}
                        </Text>
                    </View>
                    <View style={{
                        flexDirection:'row',
                        marginTop:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1
                        }}>
                            {lg=='uni'?'အမျိုးအစား':"အမ်ိဳးအစား"}
                        </Text>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1,
                            textAlign:'right'
                        }}>
                            {data.PaymentType}
                        </Text>
                    </View>
                    {this.state.isTransfer?null:
                    <View style={{
                        flexDirection:'row',
                        marginTop:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1,
                            
                        }}>
                            {lg=='uni'?'ဖုန်းနံပါတ်':"ဖုန္းနံပါတ္"}
                        </Text>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1,
                            textAlign:'right'
                        }}>
                            {data.PhoneNo}
                        </Text>
                    </View>}
                    <View style={{
                        flexDirection:'row',
                        marginTop:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1
                        }}>
                            {this.state.isTransfer?lg=='uni'?'လုပ်ငန်းစဉ်နံပါတ်':"လုပ္ငန္းစဥ္နံပါတ္":lg=='uni'?'လျှိုဝှက်နံပါတ်':"လွ်ိဳဝွက္နံပါတ္"}
                        </Text>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1,
                            textAlign:'right'
                        }}>
                            {data.SrNo}
                        </Text>
                    </View>
                    <View style={{
                        flexDirection:'row',
                        marginTop:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1
                        }}>
                            {lg=='uni'?'ပမာဏ':"ပမာဏ"}
                        </Text>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:14,
                            fontFamily:'Roboto-Bold',
                            flexGrow:1,
                            textAlign:'right'
                        }}>
                            {data.MoneyIn}
                        </Text>
                    </View>
                    <View style={{
                        flexDirection:'row',
                        marginTop:3,
                        alignItems:'center',
                        justifyContent:'space-evenly'
                    }}>
                        <TouchableOpacity style={{
                            width:((width*0.4)),
                            // width:((width*0.25)-5),
                            height:40,
                            justifyContent:'center',
                            alignItems:'center',
                            backgroundColor:'#00e676',
                            borderRadius:5,
                        }} onPress={()=>{
                            Alert.alert(config.AppName,'Are you sure you want to confirm?',
                            [
                                {
                                    text:'Cancel'
                                },
                                {
                                    text:'OK',
                                    onPress:()=>{
                                        this.setConfirmReject('Confirm',data.MInOutID)
                                    }
                                }
                            ],
                            {
                                cancelable:true
                            }
                            )
                        }}>
                            <Text style={{
                                color:'#fff',
                                fontFamily:'Roboto',
                                fontSize:14
                            }}>
                                CONFIRM
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            width:((width*0.4)),
                            // width:((width*0.25)-5),
                            height:40,
                            justifyContent:'center',
                            alignItems:'center',
                            backgroundColor:'#ff1744',
                            borderRadius:5,
                        }} onPress={()=>{
                            this.setState({
                                rejectId:data.MInOutID,
                                remark:''
                            })
                        }}>
                            <Text style={{
                                color:'#fff',
                                fontFamily:'Roboto',
                                fontSize:14
                            }}>
                                REJECT
                            </Text>
                        </TouchableOpacity>
                    </View>
                </CardView>
                
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
                marginTop:15,
                marginBottom:5
            }}>
                <TouchableOpacity style={{
                        alignItems:'center',
                        flexDirection:'row'
                    }} onPress={()=>{
                        this.setState({
                            isTransfer:!this.state.isTransfer
                        },()=>{
                            this.getTransferList()
                        })
                    }}>
                        <Image source={this.state.isTransfer?tickImg:untickImg} style={{
                            width:25,
                            height:25,
                            tintColor:Color.PRIMARYCOLOR
                        }}/>
                        <Text style={{fontSize:16,marginLeft:5}}>
                            {lg=='uni'?'ငွေလွှဲ စာရင်း':"ေငြလႊဲ စာရင္း"}
                        </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                        alignItems:'center',
                        flexDirection:'row'
                    }} onPress={()=>{
                        this.setState({
                            isTransfer:!this.state.isTransfer
                        },()=>{
                            this.getTransferList()
                        })
                    }}>
                        <Image source={!this.state.isTransfer?tickImg:untickImg} style={{
                            width:25,
                            height:25,
                            tintColor:Color.PRIMARYCOLOR
                        }}/>
                        <Text style={{fontSize:16,marginLeft:5}}>
                            {lg=='uni'?'ငွေထုတ် စာရင်း':"ေငြထုတ္ စာရင္း"}
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
                <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.PaymentType}
                        style={{ height:40, width:((width*0.5)-10)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            this.setState({
                                PaymentType:itemValue,
                            },()=>{
                                this.getTransferList()
                            })
                        }}>
                        <Picker.Item label={'Payment-All'} value={'All'}/>
                        <Picker.Item label={'Bank'} value={'Bank'}/>
                        <Picker.Item label={'K Pay'} value={'K Pay'}/>
                        <Picker.Item label={'AYA Pay'} value={'AYA Pay'}/>
                        <Picker.Item label={'Wave'} value={'Wave'}/>
                        <Picker.Item label={'KBZ'} value={'KBZ'}/>
                        <Picker.Item label={'AYA'} value={'AYA'}/>
                        <Picker.Item label={'CB'} value={'CB'}/>
                    </Picker>
                </View>
                <TouchableOpacity style={{
                   width:((width*0.5)-10),
                    // width:((width*0.25)-5),
                    height:40,
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:Color.PRIMARYCOLOR,
                    borderRadius:5,
                }} onPress={this.getTransferList.bind(this)}>
                    <Text style={{
                        color:'#fff',
                        fontFamily:'Roboto',
                        fontSize:14
                    }}>
                        REFRESH
                    </Text>
                </TouchableOpacity>
                
            </View>
        )
    }
    renderPage1(){
        const {lg}=this.props.navigation.state.params
        return(
            <View style={{flex:1}}>
                
                <View style={{flex:1}}>
                    <RecyclerListView 
                        layoutProvider={this._layoutProvider} 
                        dataProvider={this.state.dataProvider} 
                        rowRenderer={this._rowRenderer} 
                        extendedState={this.state}
                    />
                </View>
            </View>
        )
    }
    renderModal(){
        return(
            <Modal
            transparent={true}
            visible={this.state.rejectId?true:false}
            onRequestClose={()=>{
                this.setState({
                    rejectId:null,
                })
            }}
            >
                <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',alignItems:'center',width:width*0.8,borderRadius:5,padding:10}}>
                            
                                
                            
                            <View style={{
                                flexDirection:'row',
                                flex:1,
                                marginTop:20
                            }}>
                                <TextInput
                                    style={{
                                        flex:1,
                                        paddingVertical:7,
                                        height:50,
                                        borderWidth:1,
                                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                                        borderRadius:5,
                                        color:'#262626'
                                    }}
                                    placeholder={'Remark'}
                                    underlineColorAndroid='transparent'
                                    value={this.state.remark}
                                    onChangeText={(text)=>{
                                        this.setState({
                                            remark:text
                                        })
                                    }}
                                />
                            </View>
                            <View style={{
                                flexDirection:'row',
                                alignItems:'center',
                                marginTop:50
                            }}>
                                <TouchableOpacity style={{
                                    paddingHorizontal:30,
                                    paddingVertical:10,
                                    marginTop:20,
                                    backgroundColor:Color.PRIMARYCOLOR,
                                    borderRadius:10,
                                    flex:1,
                                    marginRight:5
                                }} onPress={()=>{
                                    this.setState({
                                        rejectId:null
                                    })
                                    
                                }}>
                                    <Text style={{color:'#262626',fontSize:16,}}>
                                        CANCEL
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    paddingHorizontal:30,
                                    paddingVertical:10,
                                    marginTop:20,
                                    backgroundColor:'#ff1744',
                                    borderRadius:10,
                                    flex:1
                                }} onPress={()=>{
                                    if(this.state.remark==''){
                                        Alert.alert(config.AppName,'Please enter the remark')
                                        return;
                                    }
                                    this.setConfirmReject('Reject',this.state.rejectId)
                                }}>
                                    <Text style={{color:'#fff',fontSize:16,}}>
                                        REJECT
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
            {this.renderRow1()}
            {/* <View style={{
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
            </View> */}
            
            {this.renderRow3()}
            {this.renderPage1()}
            {this.renderModal()}
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