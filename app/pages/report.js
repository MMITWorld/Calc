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
  AsyncStorage
} from 'react-native';
import tickImg from '../assets/images/tick.png'
import untickImg from '../assets/images/untick.png'
import backIcon from '../assets/images/backward.png'
import Share from 'react-native-share';
import { BluetoothManager, BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
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
            otherCommission:false,
            noT:false,
            otherCommissionText:'',
            agents:[],
            agentId:'All',
            showReal:true,
            layoutWidth:58,
            showMultiSelect:false,
            selectedTermDetails:[],
            showDotActionModal:false,
            showPrinterModal:false,
            showShareActionModal:false,
            btDevices:[],
            btPrinterName:'',
            rowShareLang:'MM',
            showRowShareModal:false,
            rowShareData:null,
            rowShareTitle:'',
            showBreakPModal:false,
            breakPData:[],
            breakPTotalUnit:0,
            breakPTotalWinUnit:0,
            breakPTitle:'',
            breakPUserSearch:'',
            assistantBreakHandledKey:'',
            showLedgerByUserModal:false,
            ledgerLoading:false,
            ledgerRows:[],
            ledgerTotalUnit:0,
            ledgerUserNo:'',
            ledgerTermDetailName:'',
            ledgerSortKey:'unit',
            ledgerSortOrder:'desc'
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
        AsyncStorage.getItem('layoutWidth').then((v) => {
            const lw = parseInt(v, 10);
            if (!isNaN(lw)) this.setState({ layoutWidth: lw });
        });
        this.handleAssistantBreakAll();
    }
    componentDidUpdate(prevProps) {
        const prevParams = (prevProps.navigation && prevProps.navigation.state && prevProps.navigation.state.params) || {}
        const curParams = (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) || {}
        if (prevParams.assistantBreakKey !== curParams.assistantBreakKey) {
            this.handleAssistantBreakAll();
        }
    }
    handleAssistantBreakAll() {
        const params = (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) || {}
        if (!params.assistantBreakAll) return
        const key = String(params.assistantBreakKey || '')
        if (key && key === this.state.assistantBreakHandledKey) return

        const endpoint = params.endpoint
        if (!endpoint) return
        const termId = params.assistantTermID || 'All'
        const termDetailID = params.assistantTermDetailID || 'All'
        const customerName = params.assistantCustomerName || 'All'

        this.setState({ loading: true, assistantBreakHandledKey: key })
        dal.getBreakP(endpoint, termId, termDetailID, customerName, (err, resp) => {
            this.setState({ loading: false })
            if (err || !resp || resp.Status !== 'OK' || !Array.isArray(resp.Data)) {
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            const rows = resp.Data.map(v => this.normalizeBreakPRow(v))
            if (!rows.length) {
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            let totalUnit = 0
            let totalWinUnit = 0
            rows.forEach((r) => {
                totalUnit += r.totalUnit
                totalWinUnit += r.totalWinUnit
            })
            this.setState({
                breakPData: rows,
                breakPTotalUnit: totalUnit,
                breakPTotalWinUnit: totalWinUnit,
                breakPTitle: `All => ${termId} => ${termDetailID}`,
                breakPUserSearch: '',
                showBreakPModal: true
            })
        })
    }
    buildRowShareMessage(data, useEnglish, isDetail) {
        if (!data) return ''
        const { lg } = this.props.navigation.state.params
        const termObj = (this.state.terms || []).find(x => x.TermID == this.state.termId)
        const useOriginalTerm = this.checkExists(this.state.selectedTermDetails, 'all') || this.state.selectedTermDetails.length == 0
        const termHeader = useOriginalTerm
            ? (this.state.termId == 'all' ? 'All' : (termObj && termObj.Name ? termObj.Name : this.getTitle()))
            : this.getTitle()
        let msg = ``
        const d = useEnglish ? 'D-' : (lg == 'uni' ? 'ဒဲ့-' : 'ဒဲ့-')
        const t = useEnglish ? 'T-' : (lg == 'uni' ? 'တွတ်-' : 'တြတ္-')
        const dt = data.LottType == '3D'
            ? '(' + d + numeral(data.D3).format('0,0') + ' , ' + t + numeral(data.T3).format('0,0') + ')'
            : '(' + numeral(data.D2).format('0,0') + ')'
        const a = Math.round(data.ThreeDAmount) + Math.round(data.TwoDAmount) - Math.round(data.Prize)

        msg += `${termHeader}\n`
        msg += `${useEnglish ? 'Name' : (lg == 'uni' ? 'အမည်' : 'အမည္')} = ${data.CustomerName}\n`
        msg += `${useEnglish ? 'Sale Amount' : (lg == 'uni' ? 'ရောင်းကြေး' : '​ေရာင္းေၾကး')} = ${numeral((Math.round(data.ThreeD) + Math.round(data.TwoD)) * data.UnitPrice).format('0,0')}\n`
        msg += `${useEnglish ? 'After Cut' : (lg == 'uni' ? 'ကော်နှုတ်ပြီး' : 'ေကာ္ႏႈတ္ၿပသညၾက')} = ${numeral(Math.round(data.ThreeDAmount) + Math.round(data.TwoDAmount)).format('0,0')}\n`
        msg += `${useEnglish ? 'Prize' : (lg == 'uni' ? 'လျော်ကြေး' : '​လၿမငၾကၿပသညၾက')} = ${numeral(data.Prize).format('0,0')}${dt}\n`
        msg += `${useEnglish ? '+/-' : (lg == 'uni' ? 'ရ/ပေး' : 'ရ/သညၾက')} = ${numeral(a * -1).format('0,0')}`

        if (isDetail) {
            const d2 = parseInt(data.D2 || 0, 10)
            const d3 = parseInt(data.D3 || 0, 10)
            const numText = `${d2 + d3}(${data.T3})`
            msg += `\n${useEnglish ? 'Num Detail' : 'နံပါတ်အသေးစိတ်'} = ${numText}`
            msg += `\n${useEnglish ? 'Type' : 'အမျိုးအစား'} = ${data.LottType || ''}`
        }
        return msg
    }
    _rowRenderer(type, data) {
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
                    this.setState({
                        rowShareData: data,
                        rowShareTitle: data.UserNo || data.CustomerName || '',
                        showRowShareModal: true
                    })
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
                        t.push({ value: 'all', label:"အားလုံး", lottType: '' })
                    }else{
                        t.push({
                            value: resp.Data[i-1].TermDetailID,
                            label: resp.Data[i-1].Name,
                            lottType: resp.Data[i-1].LottType || ''
                        })
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
                marginVertical:5
            }}>
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                marginBottom:5
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
        if (!str) return null
        const txt = String(str).replace(/\s+/g, ' ').trim()
        const m = txt.match(/\((\d{1,3})\)\s*$/)
        return m && m[1] ? m[1] : null
    }
    getAMPM(str){
        if (!str) return ''
        const txt = String(str).replace(/\s+/g, ' ').trim()
        const dateMatch = txt.match(/2D\s*\((\d{1,2})\/\d{1,2}\/\d{4}\)/i)
        const day = dateMatch && dateMatch[1] ? dateMatch[1] : ''
        const ampmMatch = txt.match(/\b(AM|PM)\b/i)
        const ampm = ampmMatch && ampmMatch[1] ? ampmMatch[1].toUpperCase() : ''
        if (day || ampm) {
            return `${day}${day && ampm ? ' ' : ''}${ampm}`.trim()
        }
        return txt
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
    buildTermDetailsSearchIds() {
        let termDetailsid = ''
        if (this.checkExists(this.state.selectedTermDetails, 'all')) {
            termDetailsid = 'All'
        } else if (this.state.selectedTermDetails.length > 0) {
            this.state.selectedTermDetails.map((value, index) => {
                if (index == this.state.selectedTermDetails.length - 1) {
                    termDetailsid += `'${value.value}'`
                    return;
                }
                termDetailsid += `'${value.value}'` + ','
            })
        } else {
            termDetailsid = 'All'
        }
        return termDetailsid
    }
    buildPaymentSearchExpression(forUserId) {
        const termDetailsid = this.buildTermDetailsSearchIds()
        let search = ''
        search += this.state.termId ? 'TD.TermID=\'' + this.state.termId + '\'' : ''
        search += termDetailsid == 'All' ? '' : ' AND S.TermDetailID IN(' + termDetailsid + ')'
        search += this.state.agentId == 'All' ? '' : ' AND T.AgentID=\'' + this.state.agentId + '\''
        if (forUserId) {
            search += ' AND S.UserID=\'' + forUserId + '\''
        } else {
            search += this.state.userId == 'All' ? '' : ' AND S.UserID=\'' + this.state.userId + '\''
        }
        return search
    }
    getTermDayLabel(termDetailName) {
        const txt = String(termDetailName || '').trim()
        const prefix = txt.match(/^([A-Za-z]{2,})\s+2D/i)
        if (prefix && prefix[1]) {
            return prefix[1]
        }
        const dm = txt.match(/2D\s*\((\d{1,2})\/(\d{1,2})\/(\d{4})\)/i)
        if (dm) {
            const d = parseInt(dm[1], 10)
            const m = parseInt(dm[2], 10) - 1
            const y = parseInt(dm[3], 10)
            const dt = new Date(y, m, d)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            return days[dt.getDay()]
        }
        return 'Day'
    }
    getTermAmPmLabel(termDetailName) {
        const txt = String(termDetailName || '').replace(/\s+/g, ' ').trim()
        const ampmMatch = txt.match(/\b(AM|PM)\b/i)
        const ampm = ampmMatch && ampmMatch[1] ? ampmMatch[1].toUpperCase() : ''
        const win = this.getWinNum(txt)
        return `${ampm}${win ? '(' + win + ')' : ''}`.trim()
    }
    buildDetailShareText(rows, customerName, useEnglish) {
        if (!rows || !rows.length) return ''

        const nameLabel = useEnglish ? 'Name' : 'အမည်'
        const saleLabel = useEnglish ? 'Sale' : 'ရောင်းကြေး'
        const cutLabel = useEnglish ? 'Sale(-)' : 'ကော်နှုတ်ပြီး'
        const prizeLabel = useEnglish ? 'Prize' : 'လျော်ကြေး'
        const netLabel = useEnglish ? '+/-' : 'ရ/ပေး'
        const totalLabel = 'Total'

        const byTerm = {}
        rows.forEach((data) => {
            const termName = data.TermDetailName || data.Name || data.TermName || ''
            const key = `${data.CustomerName || ''}__${termName}`
            if (!byTerm[key]) {
                byTerm[key] = {
                    customer: data.CustomerName || customerName || '',
                    termDetailName: termName,
                    sale: 0,
                    cut: 0,
                    prize: 0,
                    net: 0,
                    d2: 0,
                    d3: 0,
                    t3: 0,
                    lottType: data.LottType || '2D'
                }
            }
            const sale = (Math.round(data.ThreeD || 0) + Math.round(data.TwoD || 0)) * (parseFloat(data.UnitPrice) || 0)
            const cut = Math.round(data.ThreeDAmount || 0) + Math.round(data.TwoDAmount || 0)
            const prize = Math.round(data.Prize || 0)
            byTerm[key].sale += sale
            byTerm[key].cut += cut
            byTerm[key].prize += prize
            byTerm[key].net += (cut - prize)
            byTerm[key].d2 += parseFloat(data.D2 || 0)
            byTerm[key].d3 += parseFloat(data.D3 || 0)
            byTerm[key].t3 += parseFloat(data.T3 || 0)
        })

        const termRows = Object.values(byTerm)
        if (!termRows.length) return ''

        const byDayNet = {}
        const byDayRows = {}
        let totalNet = 0
        termRows.forEach((r) => {
            const day = this.getTermDayLabel(r.termDetailName)
            byDayNet[day] = (byDayNet[day] || 0) + r.net
            if (!byDayRows[day]) byDayRows[day] = []
            byDayRows[day].push(r)
            totalNet += r.net
        })

        const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const orderIndex = (d) => {
            const i = dayOrder.indexOf(d)
            return i < 0 ? 99 : i
        }
        const sortedDays = Object.keys(byDayRows).sort((a, b) => orderIndex(a) - orderIndex(b))

        const daySections = sortedDays.map((day) => {
            const dayNet = byDayNet[day] || 0
            const dayNetUser = dayNet * -1
            const daySign = dayNetUser >= 0 ? '(+)' : '(-)'
            const rowsInDay = byDayRows[day] || []
            rowsInDay.sort((a, b) => {
                const la = this.getTermAmPmLabel(a.termDetailName)
                const lb = this.getTermAmPmLabel(b.termDetailName)
                const sa = la.startsWith('AM') ? 0 : (la.startsWith('PM') ? 1 : 9)
                const sb = lb.startsWith('AM') ? 0 : (lb.startsWith('PM') ? 1 : 9)
                return sa - sb
            })

            const termBlocks = rowsInDay.map((r) => {
                const prizeDetail = r.lottType == '3D'
                    ? `(${numeral(r.d3).format('0,0')}>${numeral(r.t3).format('0,0')})`
                    : `(${numeral(r.d2).format('0,0')})`
                const head = this.getTermAmPmLabel(r.termDetailName) || r.termDetailName
                const userNet = (r.net || 0) * -1
                const userNetSign = userNet >= 0 ? '(+)' : '(-)'
                return `${head}\n` +
                    `${saleLabel}= ${numeral(r.sale).format('0,0')}\n` +
                    `${cutLabel}= ${numeral(r.cut).format('0,0')}\n` +
                    `${prizeLabel}= ${numeral(r.prize).format('0,0')}${prizeDetail}\n` +
                    `${netLabel}= ${numeral(Math.abs(userNet)).format('0,0')}${userNetSign}`
            })

            return `${day}=>${netLabel}= ${numeral(Math.abs(dayNetUser)).format('0,0')}${daySign}\n\n${termBlocks.join('\n\n')}`
        })

        const who = customerName || termRows[0].customer || ''
        const termObj = (this.state.terms || []).find(x => x.TermID == this.state.termId)
        const useOriginalTerm = this.checkExists(this.state.selectedTermDetails, 'all') || this.state.selectedTermDetails.length == 0
        const termHeader = useOriginalTerm
            ? (this.state.termId == 'all' ? 'All' : (termObj && termObj.Name ? termObj.Name : (this.getTitle ? this.getTitle() : '')))
            : (this.getTitle ? this.getTitle() : '')
        const totalUser = totalNet * -1
        const totalUserSign = totalUser >= 0 ? '(+)' : '(-)'
        return `${termHeader}\n` +
            `${nameLabel}= ${who}\n\n` +
            `${daySections.join('\n\n--------------------\n')}\n\n` +
            `--------------------\n` +
            `${totalLabel}= ${numeral(Math.abs(totalUser)).format('0,0')}${totalUserSign}`
    }
    async shareRowDetailFromApi(useEnglish) {
        const row = this.state.rowShareData
        if (!row) return
        const forUserId = row.UserID ? String(row.UserID) : null
        const termDetailsid = this.buildTermDetailsSearchIds()
        const termId = this.state.termId || 'all'
        const search = this.buildPaymentSearchExpression(forUserId)
        const otherDiscount = this.state.otherCommission ? (parseFloat(this.state.otherCommissionText) || 0) : 0
        this.setState({ loading: true })
        dal.getPaymentDetailAndroid(
            this.props.navigation.state.params.endpoint,
            search,
            termId,
            termDetailsid,
            this.state.agentDiscount,
            otherDiscount,
            this.state.noT,
            (err, resp) => {
                this.setState({ loading: false })
                if (err || !resp || resp.Status !== 'OK' || !Array.isArray(resp.Data)) {
                    Alert.alert(config.AppName, 'No Data!')
                    return
                }
                const customerName = row.CustomerName || ''
                let rows = resp.Data
                if (customerName) {
                    rows = rows.filter(x => (x.CustomerName || '') == customerName)
                }
                if (!rows.length) {
                    Alert.alert(config.AppName, 'No Data!')
                    return
                }
                const msg = this.buildDetailShareText(rows, customerName, useEnglish)
                if (!msg) {
                    Alert.alert(config.AppName, 'No Data!')
                    return
                }
                Share.open({ message: msg })
            }
        )
    }
    toNumber(v) {
        if (v === null || v === undefined || v === '') return 0
        const n = parseFloat(String(v).replace(/,/g, ''))
        return isNaN(n) ? 0 : n
    }
    formatBreakDayLabel(label) {
        const txt = String(label || '').replace(/\s+/g, ' ').trim()
        const dm = txt.match(/2D\s*\((\d{1,2})[\/,](\d{1,2})[\/,](\d{4})\)/i)
        const ap = txt.match(/\b(AM|PM)\b/i)
        const win = this.getWinNum(txt)
        if (!dm) return txt
        const d = parseInt(dm[1], 10)
        const m = parseInt(dm[2], 10) - 1
        const y = parseInt(dm[3], 10)
        const dt = new Date(y, m, d)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const day = days[dt.getDay()]
        const ampm = ap && ap[1] ? ap[1].toUpperCase() : ''
        return `${day}${ampm ? ' ' + ampm : ''}${win ? '(' + win + ')' : ''}`.trim()
    }
    inferLottTypeFromText(txt) {
        const s = String(txt || '').toUpperCase()
        if (s.indexOf('3D') !== -1) return '3D'
        if (s.indexOf('2D') !== -1) return '2D'
        return ''
    }
    getLottTypeFromSelectedFileText() {
        const byTerm = (this.state.terms || []).find(
            (x) => String(x && x.TermID || '') === String(this.state.termId || '')
        )
        if (byTerm) {
            const byTermType = String(byTerm.LottType || '').toUpperCase()
            if (byTermType === '2D' || byTermType === '3D') return byTermType
            const byTermName = this.inferLottTypeFromText(byTerm.Name || '')
            if (byTermName) return byTermName
        }
        const byTermDetail = (this.state.termDetails || []).find(
            (x) => String(x && x.value || '') === String(this.state.termDetailsId || '')
        )
        if (byTermDetail) {
            const byType = String(byTermDetail.lottType || '').toUpperCase()
            if (byType === '2D' || byType === '3D') return byType
            const byLabel = this.inferLottTypeFromText(byTermDetail.label || '')
            if (byLabel) return byLabel
        }
        const selectedText = String(this.state.termName || '').trim()
        const fromTermName = this.inferLottTypeFromText(selectedText)
        if (fromTermName) return fromTermName
        if (Array.isArray(this.state.selectedTermDetails) && this.state.selectedTermDetails.length === 1) {
            const one = this.state.selectedTermDetails[0] || {}
            const oneText = String(one.label || one.value || '').trim()
            const oneType = this.inferLottTypeFromText(oneText)
            if (oneType) return oneType
        }
        return ''
    }
    normalizeBreakPRow(r) {
        const rawName = r.TermDetailName || r.Name || ''
        const termDetailName = this.formatBreakDayLabel(rawName)
        const totalUnit = this.toNumber(r.TotalUnit || r.Unit || r.SaleAmt)
        const percentage = this.toNumber(r.Percentage || r.P)
        const breakVal = this.toNumber(r.Break || r.UnitBreak)
        const totalWinUnit = this.toNumber(r.TotalWinUnit || r.WinUnit || r.Prize || r.Win)
        const userNo = String(r.UserNo || r.CustomerName || 'All').trim() || 'All'
        const userID = String(r.UserID || r.UserId || r.UID || '').trim()
        const termDetailID = String(r.TermDetailID || r.TermID || '').trim()
        const inferredLottType = String(this.inferLottTypeFromText(rawName) || '').trim()
        const lottType = String(inferredLottType || r.LottType || '').trim()
        return {
            userID,
            userNo,
            termDetailID,
            lottType,
            originalTermDetailName: String(rawName || '').trim(),
            termDetailName,
            totalUnit,
            percentage,
            break: breakVal,
            totalWinUnit
        }
    }
    getBreakPGroups(rows) {
        const list = Array.isArray(rows) ? rows : []
        const map = {}
        list.forEach((r) => {
            const key = String(r.userNo || 'All').trim() || 'All'
            if (!map[key]) map[key] = []
            map[key].push(r)
        })
        return Object.keys(map).map((k) => ({ userNo: k, rows: map[k] }))
    }
    getFilteredBreakPGroups() {
        const groups = this.getBreakPGroups(this.state.breakPData || [])
        const key = String(this.state.breakPUserSearch || '').trim().toLowerCase()
        if (!key) return groups
        return groups.filter(g => String(g.userNo || '').toLowerCase().indexOf(key) !== -1)
    }
    buildBreakPShareText() {
        const rows = this.state.breakPData || []
        if (!rows.length) return ''
        const groups = this.getBreakPGroups(rows)
        const lines = []
        groups.forEach((g) => {
            lines.push(`User: ${g.userNo}`)
            g.rows.forEach((r) => {
                const pTxt = `${numeral(r.totalUnit).format('0,0')}(${numeral(r.percentage).format('0,0')}%)`
                lines.push(`${r.termDetailName}\nရောင်းကြေး(%)=${pTxt}\nဘရိတ်=${numeral(r.break).format('0,0')} ပေါက်သီး=${numeral(r.totalWinUnit).format('0,0')}`)
            })
            const gTotalUnit = g.rows.reduce((s, r) => s + this.toNumber(r.totalUnit), 0)
            const gTotalWinUnit = g.rows.reduce((s, r) => s + this.toNumber(r.totalWinUnit), 0)
            lines.push(`Sub Total  ${numeral(gTotalUnit).format('0,0')}  ${numeral(gTotalWinUnit).format('0,0')}`)
            lines.push('')
        })
        lines.push('')
        lines.push(`Total  ${numeral(this.state.breakPTotalUnit).format('0,0')}  ${numeral(this.state.breakPTotalWinUnit).format('0,0')}`)
        return lines.join('\n\n')
    }
    renderLedgerListByUserNo(row) {
        const r = row || {}
        const userID = String(r.userID || '').trim()
        if (!userID) {
            Alert.alert(config.AppName, 'UserID not found')
            return
        }
        let selectedTermDetailID = ''
        if (this.state.termDetailsId && this.state.termDetailsId != 'NoTermDetails' && this.state.termDetailsId != 'All' && this.state.termDetailsId != 'all') {
            selectedTermDetailID = String(this.state.termDetailsId)
        } else if (Array.isArray(this.state.selectedTermDetails) && this.state.selectedTermDetails.length === 1) {
            const one = this.state.selectedTermDetails[0] || {}
            const v = String(one.value || '')
            if (v && v != 'all' && v != 'All') {
                selectedTermDetailID = v
            }
        }
        let termDetailID = String(selectedTermDetailID || r.termDetailID || '')
        if (!termDetailID || termDetailID == 'All' || termDetailID == 'all') {
            Alert.alert(config.AppName, 'Please select Term Detail first!')
            return
        }
        let lottType = String(r.lottType || '').trim()
        const rawName = String(r.originalTermDetailName || '').trim()
        const termDetails = Array.isArray(this.state.termDetails) ? this.state.termDetails : []
        const selectedFileType = String(this.getLottTypeFromSelectedFileText() || '').trim()
        if (selectedFileType) {
            lottType = selectedFileType
        }
        const inferredLottType = String(this.inferLottTypeFromText(rawName) || '').trim()
        if (!lottType && inferredLottType) {
            // Row text has explicit 2D/3D, use it as highest priority.
            lottType = inferredLottType
        }
        if (!lottType) {
            lottType = this.inferLottTypeFromText(rawName)
        }
        if (rawName) {
            const byName = termDetails.find((t) => String(t && t.Name || '').trim() === rawName)
            if (byName) {
                if (!termDetailID || termDetailID === 'All') {
                    termDetailID = String(byName.TermDetailID || termDetailID || 'All')
                }
                if (!lottType) {
                    lottType = String(byName.LottType || '')
                }
            }
        }
        if (!lottType && termDetailID && termDetailID !== 'All') {
            const byId = termDetails.find((t) => String(t && t.TermDetailID || '') === String(termDetailID))
            if (byId) {
                lottType = String(byId.LottType || '')
            }
        }
        if (!lottType) {
            lottType = String(this.state.type || '2D')
        }
        this.setState({
            ledgerLoading: true,
            showLedgerByUserModal: true,
            ledgerRows: [],
            ledgerTotalUnit: 0,
            ledgerUserNo: String(r.userNo || 'All'),
            ledgerTermDetailName: String(r.originalTermDetailName || ''),
            ledgerSortKey: 'unit',
            ledgerSortOrder: 'desc'
        })
        dal.getLedgerList(this.props.navigation.state.params.endpoint, termDetailID, lottType, userID, 'All', (err, resp) => {
            if (err || !resp || !Array.isArray(resp.Data)) {
                this.setState({ ledgerLoading: false, showLedgerByUserModal: false })
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            const rows = resp.Data
                .map((x) => ({
                    num: x && x.Num != null ? String(x.Num) : '',
                    unit: this.toNumber(x && x.Unit != null ? x.Unit : 0),
                }))
                .filter((x) => this.toNumber(x.unit) !== 0)
            if (!rows.length) {
                this.setState({ ledgerLoading: false, showLedgerByUserModal: false })
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            const total = rows.reduce((s, x) => s + this.toNumber(x.unit), 0)
            this.setState({
                ledgerLoading: false,
                showLedgerByUserModal: true,
                ledgerRows: rows,
                ledgerTotalUnit: total,
            })
        })
    }
    toggleLedgerSort(key) {
        this.setState((prev) => {
            if (prev.ledgerSortKey === key) {
                return { ledgerSortOrder: prev.ledgerSortOrder === 'asc' ? 'desc' : 'asc' }
            }
            return { ledgerSortKey: key, ledgerSortOrder: 'asc' }
        })
    }
    getSortedLedgerRows() {
        const rows = Array.isArray(this.state.ledgerRows) ? this.state.ledgerRows.slice() : []
        const key = this.state.ledgerSortKey === 'num' ? 'num' : 'unit'
        const order = this.state.ledgerSortOrder === 'desc' ? -1 : 1
        rows.sort((a, b) => {
            const av = key === 'num' ? this.toNumber(a && a.num) : this.toNumber(a && a.unit)
            const bv = key === 'num' ? this.toNumber(b && b.num) : this.toNumber(b && b.unit)
            if (av < bv) return -1 * order
            if (av > bv) return 1 * order
            return 0
        })
        return rows
    }
    buildLedgerShareText() {
        const rows = this.getSortedLedgerRows()
        if (!rows.length) return ''
        const lines = []
        lines.push(`Ledger=${this.state.ledgerUserNo || 'All'}`)
        if (this.state.ledgerTermDetailName) {
            lines.push(String(this.state.ledgerTermDetailName))
        }
        rows.forEach((r) => {
            lines.push(`${r.num}=${numeral(this.toNumber(r.unit)).format('0,0')}`)
        })
        lines.push(`Total=${numeral(this.toNumber(this.state.ledgerTotalUnit)).format('0,0')}`)
        return lines.join('\n')
    }
    fetchBreakP() {
        const row = this.state.rowShareData
        if (!row) return
        const termId = (!this.state.termId || this.state.termId == 'NoTerm') ? 'all' : this.state.termId
        let termDetailID = 'All'
        if (this.state.termDetailsId && this.state.termDetailsId != 'NoTermDetails') {
            termDetailID = this.state.termDetailsId
        }
        if (this.checkExists(this.state.selectedTermDetails, 'all') || this.state.selectedTermDetails.length == 0) {
            termDetailID = 'All'
        } else if (this.state.selectedTermDetails.length == 1) {
            termDetailID = this.state.selectedTermDetails[0].value
        }
        const customerName = row.CustomerName || row.UserNo || ''
        if (!customerName) {
            Alert.alert(config.AppName, 'No CustomerName')
            return
        }
        const termObj = (this.state.terms || []).find(x => x.TermID == this.state.termId)
        const termName = this.state.termId == 'all' ? 'All' : (termObj && termObj.Name ? termObj.Name : this.getTitle())
        const userNo = row.UserNo || customerName || ''
        this.setState({ loading: true })
        dal.getBreakP(this.props.navigation.state.params.endpoint, termId, termDetailID, customerName, (err, resp) => {
            this.setState({ loading: false })
            if (err || !resp || resp.Status !== 'OK' || !Array.isArray(resp.Data)) {
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            const candidateRows = resp.Data
            if (!candidateRows.length) {
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            const rows = candidateRows.map(v => this.normalizeBreakPRow(v))
            if (!rows.length) {
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            let totalUnit = 0
            let totalWinUnit = 0
            rows.forEach((r) => {
                totalUnit += r.totalUnit
                totalWinUnit += r.totalWinUnit
            })
            this.setState({
                breakPData: rows,
                breakPTotalUnit: totalUnit,
                breakPTotalWinUnit: totalWinUnit,
                breakPTitle: `${userNo}${termName ? ' => ' + termName : ''}`,
                breakPUserSearch: '',
                showBreakPModal: true
            })
        })
    }
    fetchBreakPAllBySelectedUser() {
        const selectedUser = (this.state.users || []).find(x => x.UserID == this.state.userId)
        const customerName = this.state.userId == 'All'
            ? 'All'
            : (selectedUser ? (selectedUser.UserNo || selectedUser.CustomerName || 'All') : 'All')

        const termId = (!this.state.termId || this.state.termId == 'NoTerm') ? 'all' : this.state.termId
        const termName = this.state.termId == 'all'
            ? 'All'
            : ((this.state.terms || []).find(x => x.TermID == this.state.termId)?.Name || this.getTitle())

        this.setState({ loading: true })
        dal.getBreakP(this.props.navigation.state.params.endpoint, termId, 'All', customerName, (err, resp) => {
            this.setState({ loading: false })
            if (err || !resp || resp.Status !== 'OK' || !Array.isArray(resp.Data)) {
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            const rows = resp.Data.map(v => this.normalizeBreakPRow(v))
            if (!rows.length) {
                Alert.alert(config.AppName, 'No Data!')
                return
            }
            let totalUnit = 0
            let totalWinUnit = 0
            rows.forEach((r) => {
                totalUnit += r.totalUnit
                totalWinUnit += r.totalWinUnit
            })
            this.setState({
                breakPData: rows,
                breakPTotalUnit: totalUnit,
                breakPTotalWinUnit: totalWinUnit,
                breakPTitle: `${customerName}${termName ? ' => ' + termName : ''} => All`,
                breakPUserSearch: '',
                showBreakPModal: true
            })
        })
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
        dal.getPaymentSummary(this.props.navigation.state.params.endpoint,search,this.state.agentDiscount,this.state.noT,(err,resp)=>{
            if(err){
                console.log(err)
                this.setState({loading:false})
                Alert.alert(config.AppName,'Something went wrong!')
            }else{
                console.log(resp)
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    const otherPct = parseFloat(this.state.otherCommissionText);
                    const applyOther = this.state.otherCommission && !isNaN(otherPct) && otherPct > 0;
                    const data = resp.Data.map((value)=>{
                        if(!applyOther){
                            return value;
                        }
                        const unit = parseFloat(value.UnitPrice) || 0;
                        const twoD = parseFloat(value.TwoD) || 0;
                        const threeD = parseFloat(value.ThreeD) || 0;
                        const baseTwo = twoD * unit;
                        const baseThree = threeD * unit;
                        return {
                            ...value,
                            TwoDAmount: baseTwo - (baseTwo * otherPct / 100),
                            ThreeDAmount: baseThree - (baseThree * otherPct / 100)
                        };
                    });
                    let total=0,_total=0,_total1=0,_total2=0,_totald=0,_totalt=0
                    data.map((value,index)=>{
                        total+=(Math.round(value.ThreeDAmount)+Math.round(value.TwoDAmount)-Math.round(value.Prize))
                        _total+=((Math.round(value.ThreeD)+Math.round(value.TwoD))*value.UnitPrice)
                        _total1+=(Math.round(value.ThreeDAmount)+Math.round(value.TwoDAmount))
                        _total2+=parseInt(value.Prize)
                        _totald+=parseInt(value.D2)+parseInt(value.D3)
                        _totalt+=parseInt(value.T3)
                    })
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows(data),
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
    getFooterExtraValues(){
        const rows = this.state.dataProvider.getAllData ? this.state.dataProvider.getAllData() : [];
        let gross = 0;
        let netAmt = 0;
        let sumD = 0;
        let sumT = 0;
        rows.forEach((v) => {
            const unitPrice = parseFloat(v.UnitPrice) || 0;
            const twoD = parseFloat(v.TwoD) || 0;
            const threeD = parseFloat(v.ThreeD) || 0;
            const fourD = parseFloat(v.FourD) || 0;
            const twoDAmount = parseFloat(v.TwoDAmount) || 0;
            const threeDAmount = parseFloat(v.ThreeDAmount) || 0;
            const fourDAmount = parseFloat(v.FourDAmount) || 0;
            const d2 = Math.max(0, parseFloat(v.D2) || 0);
            const d3 = Math.max(0, parseFloat(v.D3) || 0);
            const t3 = Math.max(0, parseFloat(v.T3) || 0);
            const t4 = Math.max(0, parseFloat(v.T4) || 0);

            gross += (twoD + threeD + fourD) * unitPrice;
            netAmt += (twoDAmount + threeDAmount + fourDAmount);
            sumD += (d2 + d3);
            sumT += (t3 + t4);
        });
        return {
            kao: gross - netAmt,
            sumD: sumD,
            sumT: sumT
        };
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
                    <Text style={{ color:'#fff', fontSize:18 }}>
                        Report
                    </Text>
                </View>
                <View style={{ flex: 1 }} />
            </View>
        )
    }
    renderRow3(){
        return(
            <View style={{ marginVertical:5 }}>
                <View style={{
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly',
                    marginBottom:5
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
                                agentDiscount:!this.state.agentDiscount,
                                otherCommission:false
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
                        this.setState({ showShareActionModal: true })
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
                <View style={{
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-between',
                    marginHorizontal:5
                }}>
                    <View style={{
                        flex:1,
                        height:40,alignItems:'center',
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity style={{
                            width:30,
                            height:30,
                            alignItems:'center',
                            justifyContent:'center'
                        }} onPress={()=>{
                            this.setState({
                                otherCommission:!this.state.otherCommission,
                                agentDiscount:false
                            })
                        }}>
                            <Image source={this.state.otherCommission?tickImg:untickImg} style={{
                                width:25,
                                height:25,
                                tintColor:Color.PRIMARYCOLOR
                            }}/>
                        </TouchableOpacity>
                        <Text style={{
                                color:'#262626',
                                fontSize:14,
                            }}>
                                {'အခြား​ကော်'}
                            </Text>
                        <TextInput
                            placeholder={'ကော်'}
                            value={this.state.otherCommissionText}
                            onChangeText={(text)=>this.setState({otherCommissionText:text})}
                            style={{
                                height:40,
                                borderWidth:1,
                                borderColor:Color.DIVIDERCOLOR,
                                borderRadius:5,
                                paddingHorizontal:10,
                                color:'#000',
                                marginLeft:10,
                                flex:0.4
                            }}
                            underlineColorAndroid="transparent"
                        />
                        <TouchableOpacity style={{
                            width:30,
                            height:30,
                            alignItems:'center',
                            justifyContent:'center',
                            marginLeft:10
                        }} onPress={()=>{
                            this.setState({
                                noT:!this.state.noT
                            })
                        }}>
                            <Image source={this.state.noT?tickImg:untickImg} style={{
                                width:25,
                                height:25,
                                tintColor:Color.PRIMARYCOLOR
                            }}/>
                        </TouchableOpacity>
                        <Text style={{
                                color:'#262626',
                                fontSize:14,
                                marginLeft:4
                            }}>
                                တွတ်မပါ
                            </Text>
                        <TouchableOpacity
                            style={{
                                marginLeft:8,
                                height:30,
                                paddingHorizontal:10,
                                borderRadius:5,
                                backgroundColor:Color.PRIMARYCOLOR,
                                alignItems:'center',
                                justifyContent:'center'
                            }}
                            onPress={() => this.fetchBreakPAllBySelectedUser()}>
                            <Text style={{ color:'#fff', fontSize:12, fontWeight:'bold' }}>
                                Break All
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        try {
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
        const safeName = (this.state.termName || 'report').replace(/[\\\/:*?"<>|]/g, '.');
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
                <div id="numcol"> á€œá€»á€±á€¬á€ºá€€á€¼á€±á€¸</div>
                <div id="numcol">á€•á€™á€¬á€</div>
                <div id="numcol">D(T)</div>
            </div>
            ${tempdata}
            </body>
            </html>`,
            //File Name
            fileName: safeName,
            //File directory
            directory: 'Documents',
        };
        let file = await RNHTMLtoPDF.convert(options);
        Share.open({
            url:`file:///${file.filePath}`,
            message:`Reports`
        })
        } catch (e) {
            Alert.alert(config.AppName, 'PDF create error!');
        }
    }

    buildReportText(useEnglish = false) {
        const currentdata = this.state.dataProvider.getAllData();
        if (!currentdata || currentdata.length === 0) {
            Alert.alert(config.AppName, 'No Data!');
            return null;
        }
        const { lg } = this.props.navigation.state.params;
        const title = this.getTitle();
        const nameLabel = useEnglish ? 'Name' : (lg == 'uni' ? 'အမည်':'အမည္');
        const saleLabel = useEnglish ? 'Amount' : (lg == 'uni' ? 'ရောင်းကြေး':'​ေရာင္းေၾကး');
        const cutLabel = useEnglish ? 'Net Amt' : (lg == 'uni' ? 'ကော်နှုတ်ပြီး':'ေကာ္ႏႈတ္ၿပီး');
        const prizeLabel = useEnglish ? 'PRIZE' : (lg == 'uni' ? 'လျော်ကြေး':'ေလ်ာ္ေၾကး');
        const netLabel = useEnglish ? '+/-' : (lg == 'uni' ?'ရ/ပေး':'ရ/ေပး');

        const blocks = currentdata.map(data => {
            const sale = (Math.round(data.ThreeD) + Math.round(data.TwoD)) * data.UnitPrice;
            const cut = Math.round(data.ThreeDAmount) + Math.round(data.TwoDAmount);
            const prize = Math.round(data.Prize);
            const net = (cut - prize);
            const prizeDetail = data.LottType == '3D'
                ? `(${numeral(data.D3).format('0,0')}>${numeral(data.T3).format('0,0')})`
                : `(${numeral(data.D2).format('0,0')})`;
            return `${nameLabel} = ${data.CustomerName}\n` +
                   `${saleLabel} = ${numeral(sale).format('0,0')}\n` +
                   `${cutLabel} = ${numeral(cut).format('0,0')}\n` +
                   `${prizeLabel} = ${numeral(prize).format('0,0')}${prizeDetail}\n` +
                   `${netLabel} = ${numeral(net).format('0,0')}`;
        });

        const msg = `${title}\n\n` + blocks.join('\n\n');
        return msg;
    }

    shareReportText() {
        const msg = this.buildReportText(false);
        if (!msg) return;
        Share.open({ message: msg });
    }

    buildDotReportText() {
        const rows = this.state.dataProvider1.getAllData();
        if (!rows || rows.length === 0) {
            Alert.alert(config.AppName, 'No Data!');
            return null;
        }

        const groups = new Map(); // name -> Map(slipNo -> amount)
        rows.forEach(r => {
            const name = (r.CustomerName || '').toString().trim();
            const slip = (r.SlipNo ?? '').toString().trim();
            const amountVal = (r.Amount != null)
                ? r.Amount
                : (r.UnitPrice != null ? (parseFloat(r.Unit) * parseFloat(r.UnitPrice)) : r.Unit);
            const amt = isNaN(parseFloat(amountVal)) ? 0 : parseFloat(amountVal);

            if (!groups.has(name)) groups.set(name, new Map());
            const slipMap = groups.get(name);
            slipMap.set(slip, (slipMap.get(slip) || 0) + amt);
        });

        const sortName = (a, b) => a.localeCompare(b);
        const sortSlip = (a, b) => {
            const na = parseInt(a, 10);
            const nb = parseInt(b, 10);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.localeCompare(b);
        };

        let grandTotal = 0;
        const lines = [];
        [...groups.keys()].sort(sortName).forEach(name => {
            const slipMap = groups.get(name);
            lines.push(name);
            lines.push('--------------------');
            lines.push('SlipNo= Amount');
            lines.push('--------------------');

            let total = 0;
            [...slipMap.keys()].sort(sortSlip).forEach(slipNo => {
                const amt = slipMap.get(slipNo) || 0;
                total += amt;
                lines.push(`${slipNo}         = ${numeral(amt).format('0,0')}`);
            });
            lines.push('--------------------');
            lines.push(`Total    = ${numeral(total).format('0,0')}`);
            lines.push('====================');
            lines.push('');
            grandTotal += total;
        });
        lines.push(`Grand Total=${numeral(grandTotal).format('0,0')}`);

        return lines.join('\n');
    }

    shareDotReport() {
        const msg = this.buildDotReportText();
        if (!msg) return;
        Share.open({ message: msg });
    }

    async _getPairedDevices() {
        try {
            const r = await BluetoothManager.enableBluetooth();
            const paired = [];
            if (r && r.length > 0) {
                for (let i = 0; i < r.length; i++) {
                    try {
                        paired.push(JSON.parse(r[i]));
                    } catch (e) {}
                }
            }
            return paired;
        } catch (e) {
            Alert.alert(config.AppName, 'Bluetooth error!');
            return [];
        }
    }

    async _ensurePrinterConnected() {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            const PERM_BT_CONNECT = PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT || 'android.permission.BLUETOOTH_CONNECT';
            const PERM_BT_SCAN = PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN || 'android.permission.BLUETOOTH_SCAN';
            const perms = [PERM_BT_CONNECT, PERM_BT_SCAN];
            const granted = await PermissionsAndroid.requestMultiple(perms);
            const ok = perms.every(p => granted[p] === PermissionsAndroid.RESULTS.GRANTED);
            if (!ok) {
                Alert.alert(config.AppName, 'Bluetooth permission denied!');
                return false;
            }
        }
        try {
            const enabled = await BluetoothManager.isBluetoothEnabled();
            if (!enabled) {
                await BluetoothManager.enableBluetooth();
            }
        } catch (e) {
            Alert.alert(config.AppName, 'Bluetooth is not available!');
            return false;
        }

        const savedAddr = await AsyncStorage.getItem('bt_printer_address');
        if (savedAddr) {
            try {
                await BluetoothManager.connect(savedAddr);
                return true;
            } catch (e) {
                // fall through to picker
            }
        }

        const paired = await this._getPairedDevices();
        this.setState({ btDevices: paired, showPrinterModal: true });
        return false;
    }

    async _printTextNow(msg) {
        if (!msg) return;
        this._pendingPrintText = msg;

        const ready = await this._ensurePrinterConnected();
        if (!ready) return;

        try {
            await BluetoothEscposPrinter.printerInit();
            await BluetoothEscposPrinter.printText(
                `${msg}\n\r`,
                { encoding: 'GBK', codepage: 0 }
            );
            await BluetoothEscposPrinter.printAndFeed(2);
        } catch (e) {
            Alert.alert(config.AppName, 'Print failed!');
        }
    }

    async printDotReport() {
        const rows = this.state.dataProvider1.getAllData();
        if (!rows || rows.length === 0) {
            Alert.alert(config.AppName, 'No Data!');
            return;
        }

        const groups = new Map(); // name -> Map(slipNo -> amount)
        rows.forEach(r => {
            const name = (r.CustomerName || '').toString().trim();
            const slip = (r.SlipNo ?? '').toString().trim();
            const amountVal = (r.Amount != null)
                ? r.Amount
                : (r.UnitPrice != null ? (parseFloat(r.Unit) * parseFloat(r.UnitPrice)) : r.Unit);
            const amt = isNaN(parseFloat(amountVal)) ? 0 : parseFloat(amountVal);

            if (!groups.has(name)) groups.set(name, new Map());
            const slipMap = groups.get(name);
            slipMap.set(slip, (slipMap.get(slip) || 0) + amt);
        });

        const sortName = (a, b) => a.localeCompare(b);
        const sortSlip = (a, b) => {
            const na = parseInt(a, 10);
            const nb = parseInt(b, 10);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.localeCompare(b);
        };

        const ready = await this._ensurePrinterConnected();
        if (!ready) return;

        const is58 = this.state.layoutWidth == 58;
        const dashLine = '-'.repeat(is58 ? 32 : 42);
        const eqLine = '='.repeat(is58 ? 21 : 30);
        const colWidths = is58 ? [12, 20] : [16, 26];
        let grandTotal = 0;

        try {
            await BluetoothEscposPrinter.printerInit();
            try { await BluetoothEscposPrinter.setBlob(1); } catch (e) {}
            [...groups.keys()].sort(sortName).forEach(async (name) => {});
            for (const name of [...groups.keys()].sort(sortName)) {
                const slipMap = groups.get(name);
                await BluetoothEscposPrinter.printText(`${name}\n\r`, { encoding: 'GBK', codepage: 0 });
                await BluetoothEscposPrinter.printText(`${dashLine}\n\r`, { encoding: 'GBK', codepage: 0 });
                await BluetoothEscposPrinter.printColumn(colWidths, [0, 2], ['SlipNo', 'Amount'], {});
                await BluetoothEscposPrinter.printText(`${dashLine}\n\r`, { encoding: 'GBK', codepage: 0 });

                let total = 0;
                for (const slipNo of [...slipMap.keys()].sort(sortSlip)) {
                    const amt = slipMap.get(slipNo) || 0;
                    total += amt;
                    await BluetoothEscposPrinter.printColumn(
                        colWidths,
                        [0, 2],
                        [`${slipNo}`, numeral(amt).format('0,0')],
                        {}
                    );
                }
                grandTotal += total;
                await BluetoothEscposPrinter.printText(`${dashLine}\n\r`, { encoding: 'GBK', codepage: 0 });
                await BluetoothEscposPrinter.printColumn(
                    colWidths,
                    [0, 2],
                    ['Total', numeral(total).format('0,0')],
                    {}
                );
                await BluetoothEscposPrinter.printText(`${eqLine}\n\r`, { encoding: 'GBK', codepage: 0 });
                await BluetoothEscposPrinter.printText(`\n\r`, { encoding: 'GBK', codepage: 0 });
            }

            await BluetoothEscposPrinter.printColumn(
                colWidths,
                [0, 2],
                ['Grand Total', numeral(grandTotal).format('0,0')],
                {}
            );
            try { await BluetoothEscposPrinter.setBlob(0); } catch (e) {}
            await BluetoothEscposPrinter.printAndFeed(2);
        } catch (e) {
            Alert.alert(config.AppName, 'Print failed!');
        }
    }

    async printReportText() {
        const msg = this.buildReportText(true);
        await this._printTextNow(msg);
    }

    async _connectAndPrint(item) {
        try {
            await BluetoothManager.connect(item.address);
            await AsyncStorage.setItem('bt_printer_address', item.address);
            this.setState({ showPrinterModal: false, btPrinterName: item.name || '' }, async () => {
                if (this._pendingPrintText) {
                    try {
                        await BluetoothEscposPrinter.printerInit();
                        await BluetoothEscposPrinter.printText(
                            `${this._pendingPrintText}\n\r`,
                            { encoding: 'GBK', codepage: 0 }
                        );
                        await BluetoothEscposPrinter.printAndFeed(2);
                    } catch (e) {
                        Alert.alert(config.AppName, 'Print failed!');
                    }
                }
            });
        } catch (e) {
            Alert.alert(config.AppName, 'Connect printer failed!');
        }
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
        const footerExtra = this.getFooterExtraValues();
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
            <View style={{ width: width, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{
                flex:1,
                height:this.state.sent==0?height*0.10:height*0.07,
                backgroundColor:Color.PRIMARYCOLOR,
                flexDirection:'column',
                alignItems:'stretch',
                justifyContent:'center',
                paddingVertical:4
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
                            msg+=`${lg=='uni'?'လျော်ကြေး':'​လၿမငၾကၿပသညၾက'} = ${numeral(this.state._total2).format('0,0')}${dt}\n`
                            msg+=`${lg=='uni'?'ရ/ပေး':'ရ/သညၾက'} = ${numeral(this.state.total*-1).format('0,0')}`
                            Share.open({
                                message:msg,
                                //message:this.state.lg=='uni'?'á€…á€¬á€•á€­á€¯á€·á€›á€”á€º':'á€…á€¬á€•á€­á€¯á‚”á€›á€”á€¹'
                            })
                        }
                    }
                ])
                
              }}
            >
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',width:'100%'}}>
                <View style={{
                    flex:this.state.sent==0?2:3,
                    alignItems:'center'
                }}>
                    <Text style={{
                        color:'#fff',
                        fontSize:12,
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
                                fontSize:12,
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
                                fontSize:12,
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
                            fontSize:12,
                            fontFamily:'Roboto-Bold',
                        }}>
                            {numeral(this.state.sent==0?this.state.total:this.state.total1).format('0,0')}
                    </Text>
                </View>
                </View>
                {this.state.sent==0 && (
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-start',paddingTop:8,paddingLeft:12}}>
                        <Text style={{color:'#fff',fontSize:12,fontFamily:'Roboto-Bold'}}>
                            {'ကော်=' + numeral(footerExtra.kao).format('0,0')}
                        </Text>
                        <Text style={{color:'#fff',fontSize:12,fontFamily:'Roboto-Bold',marginLeft:20}}>
                            {'ဒဲ့(တွတ်)=' + numeral(footerExtra.sumD).format('0,0') + '(' + numeral(footerExtra.sumT).format('0,0') + ')'}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
            {this.state.sent == 1 && (
                <View style={{
                    height: height*0.07,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                    backgroundColor: Color.PRIMARYCOLOR,
                    borderLeftWidth: 1,
                    borderLeftColor: '#ffffff33'
                }}>
                    <TouchableOpacity
                        style={{
                            paddingHorizontal: 6,
                            height: height*0.07,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => this.setState({ showDotActionModal: true })}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                            DOT
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            </View>
            {this.state.showDotActionModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.showDotActionModal}
                    onRequestClose={() => this.setState({ showDotActionModal: false })}
                >
                    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width * 0.85, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>DOT</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ showDotActionModal: false })}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: '#999',
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>CANCEL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showDotActionModal: false }, () => {
                                            this.printDotReport();
                                        });
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.Green,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 6,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>PRINT</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showDotActionModal: false }, () => {
                                            this.shareDotReport();
                                        });
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.PRIMARYCOLOR,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 6,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SHARE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {this.state.showPrinterModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.showPrinterModal}
                    onRequestClose={() => this.setState({ showPrinterModal: false })}
                >
                    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width * 0.85, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                                Select Printer
                            </Text>
                            <ScrollView style={{ maxHeight: 240 }}>
                                {this.state.btDevices.map((d, i) => (
                                    <TouchableOpacity
                                        key={`${d.address || ''}_${i}`}
                                        style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' }}
                                        onPress={() => this._connectAndPrint(d)}
                                    >
                                        <Text style={{ fontSize: 14 }}>{d.name || d.address}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity
                                onPress={() => this.setState({ showPrinterModal: false })}
                                style={{
                                    marginTop: 12,
                                    height: 40,
                                    backgroundColor: '#999',
                                    borderRadius: 5,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
            {this.state.showShareActionModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.showShareActionModal}
                    onRequestClose={() => this.setState({ showShareActionModal: false })}
                >
                    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width * 0.85, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>REPORT</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ showShareActionModal: false })}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: '#999',
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>CANCEL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showShareActionModal: false }, () => {
                                            this.printReportText();
                                        });
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.Green,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 6,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>PRINT</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showShareActionModal: false }, () => {
                                            this.shareReportText();
                                        });
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.PRIMARYCOLOR,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 6,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SHARE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {this.state.showBreakPModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.showBreakPModal}
                    onRequestClose={() => this.setState({ showBreakPModal: false })}
                >
                    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width * 0.92, maxHeight: height * 0.85, backgroundColor: '#fff', borderRadius: 8, padding: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Break</Text>
                            <Text style={{ fontSize: 13, color: '#333', marginBottom: 8 }}>
                                {this.state.breakPTitle || ''}
                            </Text>
                            <TextInput
                                style={{
                                    height: 36,
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 5,
                                    paddingHorizontal: 10,
                                    color: '#262626',
                                    marginBottom: 8
                                }}
                                placeholder='အမည်ရှာရန်။'
                                placeholderTextColor='#777'
                                value={this.state.breakPUserSearch}
                                onChangeText={(text) => this.setState({ breakPUserSearch: text })}
                                underlineColorAndroid='transparent'
                            />
                            <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#ddd' }}>
                                <Text style={{ width: width * 0.18, fontWeight: 'bold', fontSize: 12 }}>နေ့</Text>
                                <Text style={{ width: width * 0.25, fontWeight: 'bold', fontSize: 12, textAlign: 'right' }}>ရောင်းကြေး(%)</Text>
                                <Text style={{ width: width * 0.18, fontWeight: 'bold', fontSize: 12, textAlign: 'right' }}>ဘရိတ်</Text>
                                <Text style={{ width: width * 0.18, fontWeight: 'bold', fontSize: 12, textAlign: 'right' }}>ပေါက်သီး</Text>
                            </View>
                            <ScrollView style={{ maxHeight: height * 0.56 }}>
                                {this.getFilteredBreakPGroups().map((g, gIdx) => (
                                    <View key={`bpg_${gIdx}`}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            color: Color.PRIMARYCOLOR,
                                            marginTop: gIdx === 0 ? 0 : 8,
                                            marginBottom: 4
                                        }}>
                                            {`အမည်= ${g.userNo}`}
                                        </Text>
                                        {g.rows.map((item, idx) => (
                                            <TouchableOpacity key={`bp_${gIdx}_${idx}`} style={{
                                                flexDirection: 'row',
                                                paddingVertical: 7,
                                                borderBottomWidth: 1,
                                                borderColor: '#f0f0f0',
                                                backgroundColor: (() => {
                                                    const txt = String(item.termDetailName || '')
                                                    const day = txt.split(' ')[0]
                                                    const dayColors = {
                                                        Mon: '#FFF3E0',
                                                        Tue: '#E3F2FD',
                                                        Wed: '#FFF8E1',
                                                        Thu: '#FCE4EC',
                                                        Fri: '#E0F7FA',
                                                        Sat: '#F3E5F5',
                                                        Sun: '#FFF3E0',
                                                    }
                                                    return dayColors[day] || '#FFFFFF'
                                                })(),
                                            }}
                                                disabled={this.state.ledgerLoading}
                                                onPress={() => this.renderLedgerListByUserNo(item)}
                                            >
                                                <Text style={{ width: width * 0.18, fontSize: 12 }}>{item.termDetailName}</Text>
                                                <Text style={{ width: width * 0.25, fontSize: 12, textAlign: 'right' }}>
                                                    {`${numeral(item.totalUnit).format('0,0')}(${numeral(item.percentage).format('0,0')}%)`}
                                                </Text>
                                                <Text style={{ width: width * 0.18, fontSize: 12, textAlign: 'right' }}>{numeral(item.break).format('0,0')}</Text>
                                                <Text style={{ width: width * 0.18, fontSize: 12, textAlign: 'right' }}>{numeral(item.totalWinUnit).format('0,0')}</Text>
                                            </TouchableOpacity>
                                        ))}
                                        <View style={{ flexDirection: 'row', paddingTop: 4, paddingBottom: 6 }}>
                                            <Text style={{ width: width * 0.18, fontSize: 12, fontWeight: 'bold' }}>Sub Total</Text>
                                            <Text style={{ width: width * 0.25, fontSize: 12, fontWeight: 'bold', textAlign: 'right' }}>
                                                {numeral(g.rows.reduce((s, r) => s + this.toNumber(r.totalUnit), 0)).format('0,0')}
                                            </Text>
                                            <Text style={{ width: width * 0.18 }} />
                                            <Text style={{ width: width * 0.18, fontSize: 12, fontWeight: 'bold', textAlign: 'right' }}>
                                                {numeral(g.rows.reduce((s, r) => s + this.toNumber(r.totalWinUnit), 0)).format('0,0')}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                            <View style={{ flexDirection: 'row', marginTop: 8, borderTopWidth: 1, borderColor: '#ddd', paddingTop: 6 }}>
                                <Text style={{ width: width * 0.18, fontSize: 13, fontWeight: 'bold' }}>Total</Text>
                                <Text style={{ width: width * 0.25, fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>
                                    {numeral(this.state.breakPTotalUnit).format('0,0')}
                                </Text>
                                <Text style={{ width: width * 0.18 }} />
                                <Text style={{ width: width * 0.18, fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>
                                    {numeral(this.state.breakPTotalWinUnit).format('0,0')}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ showBreakPModal: false })}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: '#999',
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>CLOSE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const msg = this.buildBreakPShareText()
                                        if (!msg) {
                                            Alert.alert(config.AppName, 'No Data!')
                                            return
                                        }
                                        Share.open({ message: msg })
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.PRIMARYCOLOR,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 8,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SHARE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {this.state.showLedgerByUserModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.showLedgerByUserModal}
                    onRequestClose={() => this.setState({ showLedgerByUserModal: false })}
                >
                    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width * 0.92, maxHeight: height * 0.85, backgroundColor: '#fff', borderRadius: 8, padding: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                                {`Ledger - ${this.state.ledgerUserNo || 'All'}`}
                            </Text>
                            <Text style={{ fontSize: 13, color: '#333', marginBottom: 8 }}>
                                {this.state.ledgerTermDetailName || ''}
                            </Text>
                            {this.state.ledgerLoading && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <ActivityIndicator size='small' color={Color.PRIMARYCOLOR} />
                                    <Text style={{ marginLeft: 6, fontSize: 12, color: '#333', fontWeight: 'bold' }}>Loading...</Text>
                                </View>
                            )}
                            <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#ddd' }}>
                                <TouchableOpacity style={{ width: width * 0.35 }} onPress={() => this.toggleLedgerSort('num')}>
                                    <Text style={{ width: width * 0.35, fontWeight: 'bold', fontSize: 14 }}>
                                        {`Num ${this.state.ledgerSortKey === 'num' ? (this.state.ledgerSortOrder === 'asc' ? '↑' : '↓') : ''}`}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ width: width * 0.35, alignItems: 'flex-end' }} onPress={() => this.toggleLedgerSort('unit')}>
                                    <Text style={{ width: width * 0.35, fontWeight: 'bold', fontSize: 14, textAlign: 'right' }}>
                                        {`Unit ${this.state.ledgerSortKey === 'unit' ? (this.state.ledgerSortOrder === 'asc' ? '↑' : '↓') : ''}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={{ maxHeight: height * 0.5 }}>
                                {this.getSortedLedgerRows().map((r, i) => (
                                    <View key={`r_ledger_${i}`} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
                                        <Text style={{ width: width * 0.35, fontSize: 14 }}>{r.num}</Text>
                                        <Text style={{ width: width * 0.35, fontSize: 14, textAlign: 'right' }}>
                                            {numeral(r.unit).format('0,0')}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                            <View style={{ flexDirection: 'row', marginTop: 8, borderTopWidth: 1, borderColor: '#ddd', paddingTop: 6 }}>
                                <Text style={{ width: width * 0.35, fontSize: 15, fontWeight: 'bold' }}>Total Unit</Text>
                                <Text style={{ width: width * 0.35, fontSize: 15, fontWeight: 'bold', textAlign: 'right' }}>
                                    {numeral(this.state.ledgerTotalUnit).format('0,0')}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ showLedgerByUserModal: false })}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: '#999',
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>CLOSE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const msg = this.buildLedgerShareText()
                                        if (!msg) {
                                            Alert.alert(config.AppName, 'No Data!')
                                            return
                                        }
                                        Share.open({ message: msg })
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.PRIMARYCOLOR,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 8,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SHARE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {this.state.showRowShareModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.showRowShareModal}
                    onRequestClose={() => this.setState({ showRowShareModal: false })}
                >
                    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width * 0.85, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
                                {this.state.rowShareTitle || ''}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ rowShareLang: 'MM' })}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 28 }}
                                >
                                    <Text style={{ fontSize: 34, color: this.state.rowShareLang == 'MM' ? Color.PRIMARYCOLOR : '#999', marginRight: 8 }}>
                                        {this.state.rowShareLang == 'MM' ? '◉' : '○'}
                                    </Text>
                                    <Text style={{ color: '#262626', fontWeight: 'bold', fontSize: 16 }}>MM</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => this.setState({ rowShareLang: 'Eng' })}
                                    style={{ flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Text style={{ fontSize: 34, color: this.state.rowShareLang == 'Eng' ? Color.PRIMARYCOLOR : '#999', marginRight: 8 }}>
                                        {this.state.rowShareLang == 'Eng' ? '◉' : '○'}
                                    </Text>
                                    <Text style={{ color: '#262626', fontWeight: 'bold', fontSize: 16 }}>Eng</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        const useEnglish = (this.state.rowShareLang || 'MM') == 'Eng'
                                        this.setState({ showRowShareModal: false }, () => {
                                            this.shareRowDetailFromApi(useEnglish)
                                        })
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.Green,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Share Detail</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const useEnglish = (this.state.rowShareLang || 'MM') == 'Eng'
                                        const msg = this.buildRowShareMessage(this.state.rowShareData, useEnglish, false)
                                        this.setState({ showRowShareModal: false }, () => {
                                            if (msg) Share.open({ message: msg })
                                        })
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.PRIMARYCOLOR,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 6,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Share</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 6 }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ showRowShareModal: false })}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: '#999',
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showRowShareModal: false }, () => {
                                            this.fetchBreakP()
                                        })
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: '#FF8F00',
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 6,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Break</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
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
