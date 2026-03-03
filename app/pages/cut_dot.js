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
  ScrollView,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dal from '../dal.js'
import numeral from 'numeral';
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import previous from '../assets/images/previous.png'
import next from '../assets/images/next.png'
import refreshIcon from '../assets/images/refresh.png'
import tickIcon from '../assets/images/tick.png'
import untickIcon from '../assets/images/untick.png'
import config from '../config/config.js'
import Color from '../utils/Color.js';
import word from './data.json'
import moment from 'moment'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that;
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            page:1,
            totalPage:1,
            shareType:2,
            isPrize:false,
            prize:550,
            round:'0',
            dots:[],
            break:0,
            data:[],
            total:0,
            buyType:'m',
            userNo:'NoUser',
            userId:null,
            users:[],
            discount2D:0,
            discount3D:0,
            isBuy:false,
            unitPrice:1
        };
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    async componentDidMount() {
        that=this
        const round=await AsyncStorage.getItem('round')||'0'
        this.setState({
            round:round,
            isPrize:false
        },()=>{
            this.getDotList()
        })
    }
    getDotList(){
        dal.getDotList(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.termId,this.props.navigation.state.params.type,
            this.state.round,(err,resp)=>{
            if(err){
                this.setState({
                    loading:false
                })
            }else{
                if(resp&&resp.Data.length){
                    this.setState({
                        loading:false,
                        dots:resp.Data,
                        data:resp.Data.filter(data => data.PageNo == 1),
                        totalPage:resp.Data[0].TPage,
                        break:resp.Data.filter(data => data.PageNo == 1)[0].Break,
                        total:this.getTotal(resp.Data.filter(data => data.PageNo == 1))
                    })
                }else{
                    this.setState({
                        loading:false,
                        dots:[]
                    })
                }
            }
        })
    }
    getDotListByPrize(){
        
        dal.getDotListByPrize(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.termId,this.props.navigation.state.params.type,
            this.state.round,this.state.prize,(err,resp)=>{
            if(err){
                this.setState({
                    loading:false
                })
            }else{
                if(resp&&resp.Data.length){
                    this.setState({
                        loading:false,
                        dots:resp.Data,
                        data:resp.Data.filter(data => data.PageNo == 1),
                        totalPage:resp.Data[0].TPage,
                        break:resp.Data.filter(data => data.PageNo == 1)[0].Break,
                        total:this.getTotal(resp.Data.filter(data => data.PageNo == 1))
                    })
                }else{
                    this.setState({
                        loading:false,
                        dots:[]
                    })
                }
            }
        })
    }
    getTotal(data){
        let total=0
        data.map((value,index)=>{
            total+=value.Units
        })
        return total;
    }
    onShare = async () => {
        try {
            
            if(this.state.shareType==2){
                let msg=`${this.props.navigation.state.params.name}\n${moment(new Date()).format('DD/MM/YYYY h:mm:ss A')}\n---------------------------\n`,b=0,total=0
                for(let i=0;i<this.state.data.length;i+=2){
                    if((i+1)<this.state.data.length){
                        total+=this.state.data[i].Units+this.state.data[i+1].Units
                        b=this.state.data[i].Break
                        msg+=`${this.state.data[i].Number} - ${this.state.data[i].Units} | ${this.state.data[i+1].Number} - ${this.state.data[i+1].Units} \n`
                    }else{
                        total+=this.state.data[i].Units
                        b=this.state.data[i].Break
                        msg+=`${this.state.data[i].Number} - ${this.state.data[i].Units} \n`
                    }
                    
                }
                const result = await Share.share({
                    message:`${msg} \n---------------------------\nTotal Units = ${numeral(total).format('0,0')}\nUnit Break = ${numeral(b).format('0,0')}\nAverage = ${Number(total/b).toFixed(2)}%`,
                });
                if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                    // shared with activity type of result.activityType
                    } else {
                    // shared
                    }
                } else if (result.action === Share.dismissedAction) {
                    // dismissed
                }
            }else{
                let msg=`${this.props.navigation.state.params.name}\n${moment(new Date()).format('DD/MM/YYYY h:mm:ss A')}\n---------------------------\n`,b=0,total=0
                for(let i=0;i<this.state.data.length;i++){
                    total+=this.state.data[i].Units
                    b=this.state.data[i].Break
                    msg+=`${this.state.data[i].Number} - ${this.state.data[i].Units} \n`
                }
                const result = await Share.share({
                    message:`${msg} \n---------------------------\nTotal Units = ${numeral(total).format('0,0')}\nUnit Break = ${numeral(b).format('0,0')}\nAverage = ${Number(total/b).toFixed(2)}%`,
                });
                if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                    // shared with activity type of result.activityType
                    } else {
                    // shared
                    }
                } else if (result.action === Share.dismissedAction) {
                    // dismissed
                }
            }
            
        } catch (error) {
          console.log(error.message);
        }
    };
    renderItems(){
        let items=[]
        
        if(this.state.shareType==2){
            for(let i=0;i<this.state.data.length;i+=2){
                if((i+1)<this.state.data.length){
                    items.push(
                        <Text>
                            {this.state.data[i].Number} - {this.state.data[i].Units} | {this.state.data[i+1].Number} - {this.state.data[i+1].Units}
                        </Text>
                    )
                }else{
                    items.push(
                        <Text>
                            {this.state.data[i].Number} - {this.state.data[i].Units}
                        </Text>
                    )
                }
                
            }
        }else{
            for(let i=0;i<this.state.data.length;i++){
                items.push(
                    <Text>
                        {this.state.data[i].Number} - {this.state.data[i].Units}
                    </Text>
                ) 
            }
        }
        return items;
    }
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
        )
    }
    renderUsers(){
        return this.state.users.map((value,index)=>{
          return(
            <Picker.Item label={value.UserNo} value={value.UserID} key={index} />
          )
        })
    }
    renderBuyModal(){
        return(
            <Modal
            transparent={true}
            visible={this.state.isBuy}
            onRequestClose={()=>{
                this.setState({
                    isBuy:false,
                    users:[],
                    buyType:'m',
                    userNo:'NoUser'
                })
            }}
            >
                <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',alignItems:'center',width:width*0.8,borderRadius:5,padding:10}}>
                        <View style={{width:width*0.8,alignItems:'center',padding:15}}>
                            <View style={{
                                flexDirection:'row',
                                marginHorizontal:5,
                                marginTop:10,
                                marginBottom:25,
                                justifyContent:'center'
                            }}>
                                <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                                    onPress={()=>{
                                        this.setState({
                                            buyType:'m'
                                        })
                                    }}>
                                    <Image source={this.state.buyType=='m'?radio_btn_selected:radio_btn_unselected} 
                                    style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                                    <Text style={{color:'#262626',fontSize:16,}}>
                                        {word[this.props.navigation.state.params.lg].money}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                                    onPress={()=>{
                                        this.setState({
                                            buyType:'25'
                                        })
                                    }}>
                                    <Image source={this.state.buyType=='25'?radio_btn_selected:radio_btn_unselected} 
                                    style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                                    <Text style={{color:'#262626',fontSize:16,}}>
                                        25
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                                    onPress={()=>{
                                        this.setState({
                                            buyType:'100'
                                        })
                                    }}>
                                    <Image source={this.state.buyType=='100'?radio_btn_selected:radio_btn_unselected} 
                                    style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                                    <Text style={{color:'#262626',fontSize:16,}}>
                                        100
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{width:((width*0.8)-30),height:40,justifyContent:'center',
                                borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,}}>
                                <Picker
                                    mode='dropdown'
                                    selectedValue={this.state.userNo}
                                    style={{ height:40, width:((width*0.8)-30)}}
                                    onValueChange={(itemValue, itemIndex) =>{
                                        let i=this.state.users.findIndex(x => x.UserID==itemValue);
                                        if(i!==-1){
                                            this.setState({
                                                userNo:itemValue,
                                                userId:this.state.users[i].UserNo,
                                                discount2D:this.state.users[i].Discount2D,
                                                discount3D:this.state.users[i].Discount3D
                                            })
                                        }else{
                                            this.setState({
                                                userId:null,
                                                userNo:itemValue,
                                                discount2D:0,
                                                discount3D:0
                                            })
                                        }
                                        
                                    }}>
                                    <Picker.Item label={'Select User'} value={'NoUser'}/>
                                    {this.renderUsers()}
                                </Picker>
                            </View>
                                
                            <View style={{
                                flexDirection:'row',
                                alignItems:'center',
                                marginTop:10
                            }}>
                                <Text style={{color:'#262626',fontSize:16,marginRight:10}}>
                                    {word[this.props.navigation.state.params.lg].discount}
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
                                        value={this.state.type=='2D'?this.state.discount2D.toString():this.state.discount3D.toString()}
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
                                if(this.state.userNo=='NoUser'){
                                    Alert.alert(config.AppName,'Please select the user!')
                                    return;
                                }
                                this.setState({
                                    isBuy:false,
                                    loading:true
                                })
                                let temp=this.state.dots.filter(data => (data.PageNo == (this.state.page)&&data.Units != 0))
                                let d=[]
                                temp.map((value,index)=>{
                                    let u=this.state.buyType=='m'?
                                    (value.Units*1)/this.state.unitPrice:
                                    this.state.buyType=='25'?
                                    (value.Units*25)/this.state.unitPrice:
                                    (value.Units*100)/this.state.unitPrice
                                    d.push(
                                        {
                                            SaleDetailID:null,
                                            SaleID:null,
                                            Num:value.Number,
                                            Unit:u,
                                            UnitUser:0,
                                            Summary:value.Number,
                                            Discount:this.state.type=='2D'?this.state.discount2D:this.state.discount3D,
                                            GroupID:''
                                        }
                                    )
                                })
                                //console.log('sale details ',d)
                                //console.log('url ',this.props.navigation.state.params.endpoint,this.state.userNo,this.props.navigation.state.params.termId,this.state.userId)
                                dal.buyNums(this.props.navigation.state.params.endpoint,this.state.userNo,this.props.navigation.state.params.termId,this.state.userId,d,(err,resp)=>{
                                    if(err){
                                        Alert.alert(config.AppName,'Something went wrong!')
                                        this.setState({
                                            loading:false,
                                            isBuy:false,
                                            users:[],
                                            buyType:'m',
                                            userNo:'NoUser'
                                        })
                                    }else{
                                        if(JSON.parse(resp).Msg=='OK'){
                                            Alert.alert(config.AppName,'Buy successfully!')
                                            this.setState({
                                                loading:false,
                                                isBuy:false,
                                                users:[],
                                                buyType:'m',
                                                userNo:'NoUser'
                                            })
                                        }else{
                                            Alert.alert(config.AppName,JSON.parse(resp).Msg)
                                            this.setState({
                                                loading:false,
                                                isBuy:false,
                                                users:[],
                                                buyType:'m',
                                                userNo:'NoUser'
                                            })
                                        }
                                        
                                        console.log('buy resp ',typeof resp ,resp)
                                    }
                                })
                            }}>
                                <Text style={{color:'#262626',fontSize:16}}>
                                    Buy
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
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:5,
            }}>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginHorizontal:10,
                    justifyContent:'center',
                    backgroundColor:this.state.page==1?'#DCDCDC80':Color.DIVIDERCOLOR,
                    padding:10,
                    borderRadius:5
                }} onPress={()=>{
                    this.setState({
                        page:(this.state.page-1),
                        data:this.state.dots.filter(data => data.PageNo == (this.state.page-1)),
                        break:this.state.dots.filter(data => data.PageNo == (this.state.page-1))[0].Break,
                        total:this.getTotal(this.state.dots.filter(data => data.PageNo == (this.state.page-1)))
                    })
                }} disabled={this.state.page==1?true:false}>
                    <Image source={previous} style={{width:15,height:15}}/>
                </TouchableOpacity>
                <Text style={{
                    fontFamily:'Roboto-Bold',
                    fontSize:17,
                    marginHorizontal:15,
                }}>
                   Page {this.state.page} of {this.state.totalPage}
                </Text>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginHorizontal:10,
                    justifyContent:'center',
                    backgroundColor:this.state.page==this.state.totalPage?'#DCDCDC80':Color.DIVIDERCOLOR,
                    padding:10,
                    borderRadius:5
                }} onPress={()=>{
                    if(this.state.page<this.state.totalPage){
                        this.setState({
                            page:(this.state.page+1),
                            data:this.state.dots.filter(data => data.PageNo == (this.state.page+1)),
                            break:this.state.dots.filter(data => data.PageNo == (this.state.page+1))[0].Break,
                            total:this.getTotal(this.state.dots.filter(data => data.PageNo == (this.state.page+1)))
                        })
                    }
                }} disabled={this.state.page==this.state.totalPage?true:false}>
                    <Image source={next} style={{width:15,height:15}}/>
                </TouchableOpacity>
            </View>
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:15,
                marginHorizontal:5
            }}>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginHorizontal:5,
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({
                        shareType:'1',
                    })
                }}>
                    <Image source={this.state.shareType=='1'?tickIcon:untickIcon} style={{width:25,height:25}}/>
                    <Text style={{fontSize:16,marginLeft:5,fontFamily:'Roboto-Bold'}}>
                        One
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginHorizontal:5,
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({
                        shareType:'2',
                    })
                }}>
                    <Image source={this.state.shareType=='2'?tickIcon:untickIcon} style={{width:25,height:25}}/>
                    <Text style={{fontSize:16,marginLeft:5,fontFamily:'Roboto-Bold'}}>
                        Two
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={{
                        paddingVertical:10,
                        paddingHorizontal:15,
                        backgroundColor:Color.PRIMARYCOLOR,
                        borderRadius:5,
                        height:40,
                        flex:1,
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent:'center',
                        marginRight:5
                    }} 
                    onPress={()=>{
                        let temp=this.state.dots.filter(data => (data.PageNo == (this.state.page)&&data.Units != 0))
                        if(temp.length==0){
                            Alert.alert(config.AppName,'No numbers to buy!')
                            return;
                        }
                        this.setState({loading:true})
                        dal.getUsers(this.props.navigation.state.params.endpoint,(err,resp)=>{
                            if(err){
                                this.setState({
                                    loading:false
                                })
                            }else{
                                console.log(resp)
                                if(resp&&resp.Status=='OK'&&resp.Data.length){
                                    this.setState({
                                        users:resp.Data,
                                        loading:false,
                                        isBuy:true
                                    })
                                }else{
                                    this.setState({
                                        users:[],
                                        loading:false
                                    })
                                }
                            }
                        })
                    }}>
                    <Text style={{color:'#fff',fontSize:16,marginLeft:5,fontFamily:'Roboto'}}>
                        BUY
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{
                        paddingVertical:10,
                        paddingHorizontal:15,
                        backgroundColor:Color.PRIMARYCOLOR,
                        borderRadius:5,
                        height:40,
                        flex:1,
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent:'center',
                        marginRight:5
                    }} 
                    onPress={()=>{
                        this.onShare()
                    }}>
                    <Text style={{color:'#fff',fontSize:16,marginLeft:5,fontFamily:'Roboto'}}>
                        SHARE
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{
                 flexDirection:'row',
                alignItems:'center',
                marginTop:15,
                marginHorizontal:5
            }}>
                 <View style={{
                                        flex: 0.2,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.2,
                                        borderColor: Color.DIVIDERCOLOR,
                                        height: 40,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={'ဆ'}
                                            keyboardType='decimal-pad'
                                            placeholderTextColor={'#262626'}
                                            value={this.state.prize}
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ prize: text })}
                                        />
                                
                    </View>

                    <View style={{
                                        flex: 0.2,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        height: 40,
                                    }}>
                                        <TouchableOpacity style={{
                                                    flexDirection:'row',
                                                    paddingHorizontal:25,
                                                    justifyContent:'center'
                                                }} onPress={()=>{
                                                    this.setState({
                                                        isPrize:!this.state.isPrize,
                                                    })
                                                console.log("Check======>"+this.state.isPrize)
                                                    this.state.isPrize==false?this.getDotListByPrize():this.getDotList();

                                                }}>
                                                    <Image source={this.state.isPrize==true?tickIcon:untickIcon} style={{width:25,height:25}}/>
                                                    <Text style={{fontSize:16,marginLeft:5,fontFamily:'Roboto-Bold'}}>
                                                      ဆ
                                                    </Text>
                                                </TouchableOpacity>

                                
                    </View>

                    
                    
            </View>



            <View style={{
                width:width,
                height:height*0.07,
                marginHorizontal:10,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <Text style={{
                    fontFamily:'Roboto-Bold',
                    fontSize:14,
                    marginRight:10
                }}>
                    Units = {numeral(this.state.total).format('0,0')}({Number(this.state.total/this.state.break).toFixed(0)}%)
                </Text>
                <Text style={{
                    fontFamily:'Roboto-Bold',
                    fontSize:14,
                    marginRight:10
                }}>
                    Break = {numeral(this.state.break).format('0,0')}
                </Text>
            </View>
            <ScrollView style={{flex:1}}>
                <View style={{
                    marginHorizontal:10
                }}>
                    
                    <Text style={{
                        fontFamily:'Roboto-Bold'
                    }}>
                        {this.props.navigation.state.params.name}
                    </Text>
                    <Text style={{
                        fontFamily:'Roboto-Bold'
                    }}>
                        {moment(new Date()).format('DD/MM/YYYY h:mm:ss A')}
                    </Text>
                    <Text style={{marginVertical:10}}>
                        ----------------------
                    </Text>
                    {
                        this.renderItems()
                    }
                    <Text style={{marginVertical:10}}>
                        ----------------------
                    </Text>
                    <Text style={{
                        fontFamily:'Roboto-Bold'
                    }}>
                        Total Units = {numeral(this.state.total).format('0,0')}
                    </Text>
                    <Text style={{
                        fontFamily:'Roboto-Bold'
                    }}>
                        Unit Break = {numeral(this.state.break).format('0,0')}
                    </Text>
                    <Text style={{
                        fontFamily:'Roboto-Bold',
                        marginBottom:10
                    }}>
                        Average = {Number(this.state.total/this.state.break).toFixed(2)}%
                    </Text>
                </View>
                
            </ScrollView>
            {this.renderBuyModal()}
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