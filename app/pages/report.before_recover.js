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
  ScrollView,
  PermissionsAndroid,
} from 'react-native';
import tickImg from '../assets/images/tick.png'
import untickImg from '../assets/images/untick.png'
import Share from 'react-native-share';
import dal from '../dal.js'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Pdf from 'react-native-pdf';
import config from '../config/config.js'
import Color from '../utils/Color.js';
import word from './data.json'
import numeral from 'numeral';
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that;
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
import SelectMultiple from 'react-native-select-multiple'
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            terms:[],
            termId:'NoTerm',
            termDetails:[],
            termDetailsId:'All',
            users:[],
            userId:'All',
            type:'2D',
            discount2D:0,
            discount3D:0,
            dataProvider: dataProvider.cloneWithRows([]),
            dataProvider1: dataProvider.cloneWithRows([]),
            showModal:false,
            isEdit:true,
            editSaleId:null,
            sent:0,
            total:0,
            _total:0,
            _total1:0,
            _total2:0,
            _totald:0,
            _totalt:0,
            total1:0,
            termName:'All',
            agentDiscount:false,
            agents:[],
            agentId:'All',
            showReal:true,
            showMultiSelect:false,
            selectedTermDetails:[]
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
        this._rowRenderer1 = this._rowRenderer1.bind(this);
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    componentDidMount() {
        that=this
        this.getAgents()
        this.getUsers()
        this.getTerms()
    }
    _rowRenderer(type, data) {
        const {lg}=this.props.navigation.state.params
        return (
            <TouchableOpacity 
                style={{
                    width:width,
                    height:40,
                    borderBottomWidth:1,
                    borderColor:Color.DIVIDERCOLOR,
                    flexDirection:'row',
                    alignItems:'center'
                }} 
                
                onLongPress={()=>{
                    Alert.alert(data.CustomerName,'',
                    [
                        {
                            text:'Cancel'
                        },
                        {
                            text:'Share',
                            onPress:()=>{
                                let msg=``
                                let d=lg=='uni'?'ဒဲ့-':'ဒဲ့-'
                                let t=lg=='uni'?'တွတ်-':'တြတ္-'
                                let dt=data.LottType=='3D'?'('+d+numeral(data.D3).format('0,0')+' , '+t+numeral(data.T3).format('0,0')+')':'('+numeral(data.D2).format('0,0')+')'
                                let a=Math.round(data.ThreeDAmount)+Math.round(data.TwoDAmount)-Math.round(data.Prize)
                                msg+=`${this.getTitle()}\n`
                                msg+=`${lg=='uni'?'အမည်':'အမည္'} = ${data.CustomerName}\n`
                                msg+=`${lg=='uni'?'ရောင်းကြေး':'​ေရာင္းေၾကး'} = ${numeral((Math.round(data.ThreeD)+Math.round(data.TwoD))*data.UnitPrice).format('0,0')}\n`
                                msg+=`${lg=='uni'?'ကော်နှုတ်ပြီး':'ေကာ္ႏႈတ္ၿပီး'} = ${numeral(Math.round(data.ThreeDAmount)+Math.round(data.TwoDAmount)).format('0,0')}\n`
                                msg+=`${lg=='uni'?'လျော်ကြေး':'ေလ်ာ္ေၾကး'} = ${numeral(data.Prize).format('0,0')}${dt}\n`
                                msg+=`${lg=='uni'?'ရ/ပေး':'ရ/ေပး'} = ${numeral(a*-1).format('0,0')}`
                                Share.open({
                                    message:msg,
                                    //message:this.state.lg=='uni'?'စာပို့ရန်':'စာပို႔ရန္'
                                })
                            }
                        }
                    ])
                    
                  }}
            >
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.CustomerName}
                    </Text>
                </View>
                {
                    this.state.showReal?
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:12,
                            fontFamily:'Roboto-Bold',
                            textAlign:'center'
                        }}>
                            {numeral((Math.round(data.ThreeD)+Math.round(data.TwoD))*data.UnitPrice).format('0,0')}
                        </Text>
                    </View>:
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:12,
                            fontFamily:'Roboto-Bold',
                            textAlign:'center'
                        }}>
                            {numeral(Math.round(data.ThreeDAmount)+Math.round(data.TwoDAmount)).format('0,0')}
                        </Text>
                    </View>
                }
                
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {numeral(data.Prize).format('0,0')}
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
                        {numeral(Math.round(data.ThreeDAmount)+Math.round(data.TwoDAmount)-Math.round(data.Prize)).format('0,0')}
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
                        {parseInt(data.D2)+parseInt(data.D3)}({data.T3})
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
    _rowRenderer1(type, data) {
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
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.CustomerName}
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
                        {data.SlipNo}
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
                        {data.Num}
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
                        {data.Unit}
                    </Text>
                </View>
            </View>
        );
    }
    getUsersByAgent(id){
        dal.getUsersByAgent(this.props.navigation.state.params.endpoint,id,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                this.setState({
                    users:resp.Data,
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
    getUsers(){
        dal.getUsers(this.props.navigation.state.params.endpoint,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                this.setState({
                    users:resp.Data,
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
    renderUsers(){
        return this.state.users.map((value,index)=>{
          return(
            <Picker.Item label={value.UserNo} value={value.UserID} key={index} />
          )
        })
    }
    renderTermDetails(){
        return this.state.termDetails.map((value,index)=>{
          return(
            <Picker.Item label={value.label} value={value.value} key={index} />
          )
        })
    }
    getTermDetailsByID(){
        dal.getTermDetailsByID(this.props.navigation.state.params.endpoint,this.state.termId,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
            
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                console.log('before loop ',resp)
                let t=[]
                for(let i=0;i<=resp.Data.length;i++){
                    console.log(i)
                    if(i==0){
                        t.push({ value: 'all', label: "အားလုံး" })
                    }else{
                        t.push({ value: resp.Data[i-1].TermDetailID, label: resp.Data[i-1].Name })
                    }
                }
                console.log("t ",t)
                this.setState({
                    termDetails:t,
                    selectedTermDetails:[],
                    loading:false
                })
            }else{
                this.setState({
                    termDetails:[{value:'all',label:'အားလုံး'}],selectedTermDetails:[{value:'all',label:'အားလုံး'}],
                    loading:false
                })
            }
        }
        })
    }
    renderTerms(){
        return this.state.terms.map((value,index)=>{
          return(
            <Picker.Item label={value.Name} value={value.TermID} key={index} />
          )
        })
    }
    getTerms(){
        dal.getTerms(this.props.navigation.state.params.endpoint,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                this.setState({
                    terms:resp.Data,
                    loading:false,
                    termDetails:[{ 
                        value: "all",
                        label:  "အားလုံး" ,
                      }],
                    selectedTermDetails:[{value:'all',label:'အားလုံး'}]
                })
            }else{
                this.setState({
                    terms:[],
                    loading:false,
                    termDetails:[{ 
                        value: "all",
                        label:  "အားလုံး" ,
                      }],
                    selectedTermDetails:[{value:'all',label:'အားလုံး'}]
                })
            }
        }
        })
    }
    
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
        )
    }
    
    renderRow1(){
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
                        selectedValue={this.state.termId}
                        style={{ height:40, width:((width*0.5)-10),}}
                        onValueChange={(itemValue, itemIndex) =>{
                            if(itemValue=='NoTerm'){
                                this.setState({
                                    termId:itemValue,
                                    termDetails:[]
                                })
                            }else{
                                this.setState({
                                    termId:itemValue,
                                },()=>{
                                    this.getTermDetailsByID()
                                })
                            }
                            
                        }}>
                        <Picker.Item label={'File'} value={'NoTerm'} style={{}}/>
                        {this.renderTerms()}
                    </Picker>
                </View>
                <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.agentId}
                        style={{ height:40, width:((width*0.5)-10)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            this.setState({
                                agentId:itemValue
                            })
                            if(itemValue=='All'){
                                this.getUsers()
                            }else{
                                this.getUsersByAgent(itemValue)
                            }
                            // let i=this.state.users.findIndex(x => x.UserID==itemValue);
                            // if(i!==-1){
                            //     this.setState({
                            //         userId:itemValue,
                            //         discount2D:this.state.users[i].Discount2D,
                            //         discount3D:this.state.users[i].Discount3D
                            //     })
                            // }else{
                            //     this.setState({
                            //         userId:itemValue,
                            //         discount2D:0,
                            //         discount3D:0
                            //     })
                            // }
                            
                        }}>
                        <Picker.Item label={'All'} value={'All'}/>
                        {this.renderAgents()}
                    </Picker>
                </View>
            </View>
        )
    }
    renderRow11(){
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
                        selectedValue={this.state.termId}
                        style={{ height:40, width:((width*0.5)-10),}}
                        onValueChange={(itemValue, itemIndex) =>{
                            if(itemValue=='NoTerm'){
                                this.setState({
                                    termId:itemValue,
                                    termDetails:[]
                                })
                            }else{
                                this.setState({
                                    termId:itemValue,
                                },()=>{
                                    this.getTermDetailsByID()
                                })
                            }
                            
                        }}>
                        <Picker.Item label={'File'} value={'NoTerm'} style={{}}/>
                        {this.renderTerms()}
                    </Picker>
                </View>
                <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.userId}
                        style={{ height:40, width:((width*0.5)-10)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.users.findIndex(x => x.UserID==itemValue);
                            if(i!==-1){
                                this.setState({
                                    userId:itemValue,
                                    discount2D:this.state.users[i].Discount2D,
                                    discount3D:this.state.users[i].Discount3D
                                })
                            }else{
                                this.setState({
                                    userId:itemValue,
                                    discount2D:0,
                                    discount3D:0
                                })
                            }
                            
                        }}>
                        <Picker.Item label={'All'} value={'All'}/>
                        {this.renderUsers()}
                    </Picker>
                </View>
            </View>
        )
    }
    getWinReport(){
        let search=''
        search+=this.state.termId?'TD.TermID=\''+this.state.termId+'\'':''
        search+=this.state.termDetailsId?this.state.termDetailsId=='All'?'':' AND S.TermDetailID=\''+this.state.termDetailsId+'\'':'',
        search+=this.state.userId=='All'?'':' AND S.UserID=\''+this.state.userId+'\''
        console.log(search)
        dal.getWinReport(this.props.navigation.state.params.endpoint,search,(err,resp)=>{
            if(err){
                this.setState({loading:false})
                Alert.alert(config.AppName,'Something went wrong!')
            }else{
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    let total=0
                    resp.Data.map((value,index)=>{
                        total+=value.Unit
                    })
                    this.setState({
                        dataProvider1: dataProvider.cloneWithRows(resp.Data),
                        loading:false,
                        total1:total
                    })
                }else{
                    Alert.alert(config.AppName,'No Data!')
                    this.setState({
                        dataProvider1: dataProvider.cloneWithRows([]),
                        loading:false,
                        total1:0
                    })
                }
            }
        })
    }
    getWinNum(str){
        let s=''
        let _str=str.replace('D (','D(')
        if(_str.includes("AM")||_str.includes("PM")){
          s+=_str.substring(19,21)
          return s
        }else{
          return null
        }
    }
    getAMPM(str){
        let s=''
        let _str=str.replace('D (','D(')
        if(_str.includes("AM")||_str.includes("PM")){
          s+=_str.substring(3,5)+' '+_str.substring(15,17)
          return s
        }else{
          return str
        }
    }
    getTitle(){
        let title=''
        let d=this.state.terms.filter(x=>x.TermID==this.state.termId)
        console.log(this.state.selectedTermDetails)
        console.log(this.state.terms)
        console.log(this.state.termId)
        console.log(d)
        if(this.checkExists(this.state.selectedTermDetails,'all')){
          title=this.state.termId=='all'?'All':d.length>0?d[0].Name:'All'
          console.log('exist')
        }else{
            console.log('not exist')
          if(this.state.selectedTermDetails.length>0){
            this.state.selectedTermDetails.map((value,index)=>{
              if(index==this.state.selectedTermDetails.length-1){
                title+=`${this.getAMPM(value.label)}${this.getWinNum(value.label)?'('+this.getWinNum(value.label)+')':''}`
                return;
              }
              title+=`${this.getAMPM(value.label)}${this.getWinNum(value.label)?'('+this.getWinNum(value.label)+')':''}`+','
            })
          }else{
            title=this.state.termId=='all'?'All':d.length>0?d[0].Name:'All' 
          }
          
        }
        console.log('Title ==>',title)
        return title;
    }
    getPaymentSummary(){
        let termDetailsid=''
        if(this.checkExists(this.state.selectedTermDetails,'all')){
        termDetailsid='All'
        }else{
        if(this.state.selectedTermDetails.length>0){
            this.state.selectedTermDetails.map((value,index)=>{
            if(index==this.state.selectedTermDetails.length-1){
                termDetailsid+=`'${value.value}'`
                return;
            }
            termDetailsid+=`'${value.value}'`+','
            })
        }else{
            termDetailsid='All'
        }
        }
        let search=''
        search+=this.state.termId?'TD.TermID=\''+this.state.termId+'\'':''
        search+=termDetailsid=='All'?'':' AND S.TermDetailID IN('+termDetailsid+')'
        search+=this.state.agentId=='All'?'':' AND T.AgentID=\''+this.state.agentId+'\''
        search+=this.state.userId=='All'?'':' AND S.UserID=\''+this.state.userId+'\''
        console.log(search)
        dal.getPaymentSummary(this.props.navigation.state.params.endpoint,search,this.state.agentDiscount,(err,resp)=>{
            if(err){
                console.log(err)
                this.setState({loading:false})
                Alert.alert(config.AppName,'Something went wrong!')
            }else{
                console.log(resp)
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    let total=0,_total=0,_total1=0,_total2=0,_totald=0,_totalt=0
                    resp.Data.map((value,index)=>{
                        total+=(Math.round(value.ThreeDAmount)+Math.round(value.TwoDAmount)-Math.round(value.Prize))
                        _total+=((Math.round(value.ThreeD)+Math.round(value.TwoD))*value.UnitPrice)
                        _total1+=(Math.round(value.ThreeDAmount)+Math.round(value.TwoDAmount))
                        _total2+=parseInt(value.Prize)
                        _totald+=parseInt(value.D2)+parseInt(value.D3)
                        _totalt+=parseInt(value.T3)
                    })
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows(resp.Data),
                        loading:false,
                        total:total,
                        _total:_total,
                        _total1:_total1,
                        _total2:_total2,
                        _totald:_totald,
                        _totalt:_totalt,
                    })
                }else{
                    Alert.alert(config.AppName,'No Data!')
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows([]),
                        loading:false,
                        total:0,
                        _total:0,
                        _total1:0,
                        _total2:0,
                        _totald:0,
                        _totalt:0,
                    })
                }
            }
        })
    }
    renderRow22(){
        return(
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                marginVertical:5
            }}>
                <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,marginLeft:5}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.termDetailsId}
                        style={{ height:40, width:((width*0.5)-10)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.termDetails.findIndex(x => x.TermDetailID==itemValue);
                            console.log(this.state.termDetails[i])
                            if(i!=-1){
                                this.setState({
                                    termDetailsId:itemValue,
                                    type:this.state.termDetails[i].LottType,
                                    termName:this.state.termDetails[i].Name
                                })
                            }else{
                                this.setState({
                                    termDetailsId:itemValue,
                                    termName:'All'
                                })
                            }
                            
                            
                        }}>
                        {this.renderTermDetails()}
                    </Picker>
                </View>
                <TouchableOpacity style={{
                    flex:1,
                    // width:((width*0.25)-5),
                    height:40,
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:Color.PRIMARYCOLOR,
                    borderRadius:5,
                    marginLeft:5,
                    marginRight:this.state.sent==1?5:0
                }} onPress={()=>{
                    // if(this.state.userId=='All'){
                    //     Alert.alert(config.AppName,'Please select user first!')
                    //     return;
                    // }
                    if(this.state.termId=='NoTerm'){
                        Alert.alert(config.AppName,'Please select term first!')
                        return;
                    }
                    if(this.state.termDetailsId=='NoTermDetails'){
                        Alert.alert(config.AppName,'Please select term details first!')
                        return;
                    }
                    this.setState({loading:true})
                    if(this.state.sent==0){
                        this.getPaymentSummary()
                    }else{
                        this.getWinReport()
                    }
                }}>
                    <Text style={{
                        color:'#fff',
                        fontFamily:'Roboto',
                        fontSize:14
                    }}>
                        VIEW
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    renderRow3(){
        return(
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                marginVertical:5
            }}>
                <View style={{
                    width:((width*0.5)-10),height:40,alignItems:'center',
                    marginLeft:5,flexDirection:'row'
                }}>
                    <TouchableOpacity style={{
                        width:30,
                        height:30,
                        alignItems:'center',
                        justifyContent:'center'
                    }} onPress={()=>{
                        this.setState({
                            agentDiscount:!this.state.agentDiscount
                        })
                    }}>
                        <Image source={this.state.agentDiscount?tickImg:untickImg} style={{
                            width:25,
                            height:25,
                            tintColor:Color.PRIMARYCOLOR
                        }}/>
                    </TouchableOpacity>
                    <Text style={{
                            color:'#262626',
                            fontSize:14,
                        }}>
                            {word[this.props.navigation.state.params.lg].agentDiscount}
                        </Text>
                </View>
                <TouchableOpacity style={{
                    flex:1,
                    // width:((width*0.25)-5),
                    height:40,
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:Color.PRIMARYCOLOR,
                    borderRadius:5,
                    marginLeft:5,
                    marginRight:this.state.sent==1?5:0
                }} onPress={()=>{
                    // if(this.state.userId=='All'){
                    //     Alert.alert(config.AppName,'Please select user first!')
                    //     return;
                    // }
                    if(this.state.termId=='NoTerm'){
                        Alert.alert(config.AppName,'Please select term first!')
                        return;
                    }
                    if(this.state.termDetailsId=='NoTermDetails'){
                        Alert.alert(config.AppName,'Please select term details first!')
                        return;
                    }
                    this.setState({loading:true})
                    if(this.state.sent==0){
                        this.getPaymentSummary()
                    }else{
                        this.getWinReport()
                    }
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
                    flex:1,
                    //width:((width*0.25)-5),
                    height:40,
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:Color.PRIMARYCOLOR,
                    borderRadius:5,
                    marginHorizontal:5
                }} onPress={()=>{
                    let currentdata=this.state.dataProvider.getAllData()
                    if(currentdata.length>0){
                        this.askPermission()
                    }
                }}>
                    <Text style={{
                        color:'#fff',
                        fontFamily:'Roboto',
                        fontSize:14
                    }}>
                        SHARE
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    renderRow2(){
        return(
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                marginVertical:5
            }}>
                <TouchableOpacity 
            style={{
                width:((width*0.5)-10),justifyContent:"center",backgroundColor:'#fffffff80',
              borderRadius:5,borderWidth:1,borderColor:'grey',marginHorizontal:3,
              height:45,paddingLeft:10
            }}
            onPress={()=>{
              this.setState({
                showMultiSelect:true
              })
            }}
          >
            <Text style={{
              fontSize:16
            }}>
              {this.checkExists(this.state.selectedTermDetails,'all')||this.state.selectedTermDetails.length==0?'အားလုံး':`${this.state.selectedTermDetails.length} Selected`}
            </Text>
          </TouchableOpacity>
                {/* <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,marginLeft:5}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.termDetailsId}
                        style={{ height:40, width:((width*0.5)-10)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.termDetails.findIndex(x => x.TermDetailID==itemValue);
                            console.log(this.state.termDetails[i])
                            if(i!=-1){
                                this.setState({
                                    termDetailsId:itemValue,
                                    type:this.state.termDetails[i].LottType,
                                    termName:this.state.termDetails[i].Name
                                })
                            }else{
                                this.setState({
                                    termDetailsId:itemValue,
                                    termName:'All'
                                })
                            }
                            
                            
                        }}>
                        <Picker.Item label={'All'} value={'All'}/>
                        {this.renderTermDetails()}
                    </Picker>
                </View>
                 */}
                <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.userId}
                        style={{ height:40, width:((width*0.5)-10)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.users.findIndex(x => x.UserID==itemValue);
                            if(i!==-1){
                                this.setState({
                                    userId:itemValue,
                                    discount2D:this.state.users[i].Discount2D,
                                    discount3D:this.state.users[i].Discount3D
                                })
                            }else{
                                this.setState({
                                    userId:itemValue,
                                    discount2D:0,
                                    discount3D:0
                                })
                            }
                            
                        }}>
                        <Picker.Item label={'All'} value={'All'}/>
                        {this.renderUsers()}
                    </Picker>
                </View>
            </View>
        )
    }
    askPermission() {
        var that = this;
        async function requestExternalWritePermission() {
            try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                title: 'CameraExample App External Storage Write Permission',
                message:
                    'CameraExample App needs access to Storage data in your SD Card ',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                //If WRITE_EXTERNAL_STORAGE Permission is granted
                //changing the state to show Create PDF option
                that.createPDF();
            } else {
                alert('WRITE_EXTERNAL_STORAGE permission denied');
            }
            } catch (err) {
            alert('Write permission err', err);
            console.warn(err);
            }
        }
        //Calling the External Write permission function
        if (Platform.OS === 'android') {
            requestExternalWritePermission();
        } else {
            this.createPDF();
        }
    }
    
    async createPDF() {
        let tempdata=''
        let currentdata=this.state.dataProvider.getAllData()
        currentdata.map((value,index)=>{
            tempdata+=`
            <div id="row">
                <div id="numcol">${value.CustomerName}</div>
                <div id="numcol">${(Math.round(value.ThreeD)+Math.round(value.TwoD))*value.UnitPrice}</div>
                <div id="numcol">${value.Prize}</div>
                <div id="numcol">${Math.round(value.ThreeDAmount)+Math.round(value.TwoDAmount)-Math.round(value.Prize)}</div>
                <div id="numcol">${parseInt(value.D2)+parseInt(value.D3)}(${value.T3})</div>
            </div>
            `
        })
        let options = {
            //Content to print
            html:
            `<!DOCTYPE html>
            <html>
            <head>
            <style> 
            #row {
                display: flex;
                flex-direction: row;
                flex:1;
            }
            #numcol {
                flex:1;
                height: 30px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;
            }
            #unitcol {
                width: 100px;
                height: 30px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;
            }
            #footertxt {
                margin-top:10px;
                font-size:9px;
                font-weight:bold;
            }
            </style>
            </head>
            <body>
            <div id="row">
                <div id="numcol">${word[this.props.navigation.state.params.lg].user}</div>
                <div id="numcol">${word[this.props.navigation.state.params.lg].saleAmount}</div>
                <div id="numcol"> လျော်ကြေး</div>
                <div id="numcol">ပမာဏ</div>
                <div id="numcol">D(T)</div>
            </div>
            ${tempdata}
            </body>
            </html>`,
            //File Name
            fileName: this.state.termName.replace(/\//g, '.'),
            //File directory
            directory: 'docs',
        };
        let file = await RNHTMLtoPDF.convert(options);
        Share.open({
            url:`file:///${file.filePath}`,
            message:`Reports`
        })
    }
    renderPage2(){
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
                        flex:2
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            
                            textAlign:'center'
                        }}>
                            {word[this.props.navigation.state.params.lg].user}
                        </Text>
                    </View>
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            
                            textAlign:'center'
                        }}>
                            {word[this.props.navigation.state.params.lg].slip}
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
                            {word[this.props.navigation.state.params.lg].num}
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
                            {word[this.props.navigation.state.params.lg].unit}
                        </Text>
                    </View>
                </View>
                <View style={{flex:1}}>
                    <RecyclerListView layoutProvider={this._layoutProvider} dataProvider={this.state.dataProvider1} rowRenderer={this._rowRenderer1} />
                </View>
            </View>
        )
    }
    renderPage1(){
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
                        flex:2
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            
                            textAlign:'center'
                        }}>
                            {word[this.props.navigation.state.params.lg].user}
                        </Text>
                    </View>
                    {this.state.showReal?
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
                             {word[this.props.navigation.state.params.lg].saleAmount}
                        </Text>
                    </TouchableOpacity>:
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
                             {word[this.props.navigation.state.params.lg].after}
                        </Text>
                    </TouchableOpacity>}
                    
                    <View style={{
                        flex:2
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            textAlign:'center'
                        }}>
                             {word[this.props.navigation.state.params.lg].afterAmount}
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
                            {word[this.props.navigation.state.params.lg].amount}
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
                            D(T)
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
            </View>
        )
    }
    onSelectionsChange = (selectedTermDetails,item) => {
        // selectedFruits is array of { label, value }
        console.log("wtf ",this.checkExists(this.state.selectedTermDetails,'all'))
        if(this.state.termid=='all'){
          return;
        }
        if(!this.checkExists(this.state.selectedTermDetails,'all')&&item.value=='all'){
          this.setState({
            selectedTermDetails:this.state.termDetails
          })
        }else if(this.checkExists(this.state.selectedTermDetails,'all')&&item.value!='all'){
          selectedTermDetails.shift()
          let i=selectedTermDetails.findIndex(x=>x.value==item.value)
          selectedTermDetails.splice(i, 1)
          this.setState({
            selectedTermDetails:selectedTermDetails
          })
        }else if(this.checkExists(this.state.selectedTermDetails,'all')&&item.value=='all'){
          this.setState({
            selectedTermDetails:[]
          })
        }else if(!this.checkExists(this.state.selectedTermDetails,item.value)&&item.value!='all'){
          this.setState({ selectedTermDetails })
        }else if(!this.checkExists(this.state.selectedTermDetails,'all')&&item.value!='all'){
          let i=this.state.selectedTermDetails.findIndex(x=>x.value==item.value)
          this.state.selectedTermDetails.splice(i, 1)
          this.setState({
            selectedTermDetails:this.state.selectedTermDetails
          })
        }
        // this.setState({ selectedTermDetails })
      }
      checkExists(array,value) {
        return array.some(function(el) {
          return el.value === value;
        }); 
      }
    renderModal(){
        return(
          <Modal
            transparent={true}
            visible={this.state.showMultiSelect}
            onRequestClose={()=>{
                this.setState({
                  showMultiSelect:false
                })
            }}
          >
              <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                <View style={{backgroundColor:'#fff',width:(width)-40,borderRadius:5,height:560}}>
                  
                  <ScrollView style={{flex:1,marginTop:5}}>
                    <SelectMultiple
                      items={this.state.termDetails}
                      selectedItems={this.state.selectedTermDetails}
                      onSelectionsChange={this.onSelectionsChange} 
                      rowStyle={{
                        height:37
                      }}
                    />
                  </ScrollView>
                  <View style={{flexDirection:'row',marginVertical:10,marginHorizontal:20}}>
                    <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:Color.PRIMARYCOLOR,paddingVertical:10
                        ,borderRadius:7}} onPress={()=>{
                            this.setState({
                              showMultiSelect:false
                            })
                        }}>
                        <Text style={{fontSize:15,fontFamily:'Roboto',color:'#fff'}}>
                            OK 
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
                width:width,
                height:50,
                borderBottomWidth:1,
                borderColor:Color.DIVIDERCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <TouchableOpacity style={{
                    flex:1,
                    height:50,
                    backgroundColor:this.state.sent==0?Color.PRIMARYCOLOR:'#fff',
                    alignItems:'center',
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({
                        sent:0,
                    })
                }}>
                    <Text style={{
                        color:this.state.sent==0?'#fff':Color.YELLOWCOLOR,
                        fontSize:15,
                        
                        textAlign:'center'
                    }}>
                       {word[this.props.navigation.state.params.lg].sent0} 
                    </Text>
                </TouchableOpacity>
                <View style={{width:1,height:50,backgroundColor:Color.DIVIDERCOLOR}}/>
                <TouchableOpacity style={{
                    flex:1,
                    height:50,
                    backgroundColor:this.state.sent==1?Color.PRIMARYCOLOR:'#fff',
                    alignItems:'center',
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({
                        sent:1,
                        userId:'All'
                    })
                    this.getUsers()
                }}>
                    <Text style={{
                        color:this.state.sent==1?'#fff':Color.YELLOWCOLOR,
                        fontSize:15,
                        
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].sent1} 
                    </Text>
                </TouchableOpacity>
            </View>
            {this.state.sent==0?this.renderRow1():this.renderRow11()}
            {this.state.sent==0?this.renderRow2():this.renderRow22()}
            {this.state.sent==0?this.renderRow3():null}
            {this.state.sent==0?this.renderPage1():this.renderPage2()}
            <TouchableOpacity style={{
                width:width,
                height:height*0.07,
                backgroundColor:Color.PRIMARYCOLOR,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}
            onLongPress={()=>{
                let _data=this.state.dataProvider.getAllData()
                console.log('_data ',_data)
                if(this.state.sent==1||_data.length==0){
                    return;
                }
                Alert.alert('','Are you sure you want to share?',
                [
                    {
                        text:'Cancel'
                    },
                    {
                        text:'Share',
                        onPress:()=>{
                            const {lg}=this.props.navigation.state.params
                            let filter=this.state.agents.filter(x=>x.AgentID==this.state.agentId)
                            let msg=``
                            let d=lg=='uni'?'ဒဲ့-':'ဒဲ့-'
                            let t=lg=='uni'?'တွတ်-':'တြတ္-'
                            let dt=_data[0].LottType=='3D'?'('+d+numeral(this.state._totald).format('0,0')+' , '+t+numeral(this.state._totalt).format('0,0')+')':'('+numeral(this.state._totald).format('0,0')+')'
                            msg+=`${this.getTitle()}\n`
                            msg+=`${lg=='uni'?'အမည်':'အမည္'} = ${filter.length>0?filter[0].AgentName:'All'}\n`
                            msg+=`${lg=='uni'?'ရောင်းကြေး':'​ေရာင္းေၾကး'} = ${numeral(this.state._total).format('0,0')}\n`
                            msg+=`${lg=='uni'?'ကော်နှုတ်ပြီး':'ေကာ္ႏႈတ္ၿပီး'} = ${numeral(this.state._total1).format('0,0')}\n`
                            msg+=`${lg=='uni'?'လျော်ကြေး':'ေလ်ာ္ေၾကး'} = ${numeral(this.state._total2).format('0,0')}${dt}\n`
                            msg+=`${lg=='uni'?'ရ/ပေး':'ရ/ေပး'} = ${numeral(this.state.total*-1).format('0,0')}`
                            Share.open({
                                message:msg,
                                //message:this.state.lg=='uni'?'စာပို့ရန်':'စာပို႔ရန္'
                            })
                        }
                    }
                ])
                
              }}
            >
                <View style={{
                    flex:this.state.sent==0?2:3,
                    alignItems:'center'
                }}>
                    <Text style={{
                        color:'#fff',
                        fontSize:15,
                        fontFamily:'Roboto-Bold',
                        marginRight:15
                    }}>
                        Total
                    </Text>
                </View>
                {
                    this.state.sent==0?
                    <View style={{
                        flex:2
                    }}>
                        <Text style={{
                                color:'#fff',
                                fontSize:15,
                                fontFamily:'Roboto-Bold',
                            }}>
                                {numeral(this.state.showReal==0?this.state._total1:this.state._total).format('0,0')}
                        </Text>
                    </View>:null
                }
                {
                    this.state.sent==0?
                    <View style={{
                        flex:2
                    }}>
                        <Text style={{
                                color:'#fff',
                                fontSize:15,
                                fontFamily:'Roboto-Bold',
                            }}>
                                {numeral(this.state._total2).format('0,0')}
                        </Text>
                    </View>:null
                }
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                            color:'#fff',
                            fontSize:15,
                            fontFamily:'Roboto-Bold',
                        }}>
                            {numeral(this.state.sent==0?this.state.total:this.state.total1).format('0,0')}
                    </Text>
                </View>
                
                
            </TouchableOpacity>
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