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
  PermissionsAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tickImg from '../assets/images/tick.png'
import untickImg from '../assets/images/untick.png'
import Share from 'react-native-share';
import dal from '../dal.js'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Pdf from 'react-native-pdf';
import config from '../config/config.js'
import Color from '../utils/Color.js';
import word from './data.json'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that;
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
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
            total1:0,
            termName:'All',
            agentDiscount:false,
            agents:[],
            agentId:'All',
            showReal:true,
            rowShareLang:'MM',
            showRowShareModal:false,
            rowShareData:null,
            rowShareTitle:'',
            showBreakPModal:false,
            breakPData:[],
            breakPTotalUnit:0,
            breakPTotalWinUnit:0,
            breakPTitle:''
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
    fmt(v){
        const n = parseFloat(v) || 0
        return dal.numberWithCommas(Math.round(n))
    }
    toNumber(v) {
        if (v === null || v === undefined || v === '') return 0
        const n = parseFloat(String(v).replace(/,/g, ''))
        return isNaN(n) ? 0 : n
    }
    getTermHeaderText(){
        const t = (this.state.terms || []).find(x => x.TermID == this.state.termId)
        if (!t) return 'All'
        if (this.state.termDetailsId == 'All') return t.Name || 'All'
        const td = (this.state.termDetails || []).find(x => x.TermDetailID == this.state.termDetailsId)
        if (!td) return t.Name || 'All'
        return this.getAmPmTermLabel(td.Name || '')
    }
    getAmPmTermLabel(str){
        if (!str) return ''
        const txt = String(str).replace(/\s+/g, ' ').trim()
        const ap = txt.match(/\b(AM|PM)\b/i)
        const apTxt = ap && ap[1] ? ap[1].toUpperCase() : ''
        const wn = this.getWinNum(txt)
        if (apTxt) {
            return `${apTxt}${wn ? '(' + wn + ')' : ''}`
        }
        return this.getShortTermDetailLabel(txt)
    }
    getWinNum(str){
        if (!str) return null
        const txt = String(str).replace(/\s+/g, ' ').trim()
        const m = txt.match(/\((\d{1,3})\)\s*$/)
        return m && m[1] ? m[1] : null
    }
    getShortTermDetailLabel(str){
        if (!str) return ''
        const txt = String(str).replace(/\s+/g, ' ').trim()
        const dm = txt.match(/2D\s*\((\d{1,2})[\/,](\d{1,2})[\/,](\d{4})\)/i)
        const ap = txt.match(/\b(AM|PM)\b/i)
        const apTxt = ap && ap[1] ? ap[1].toUpperCase() : ''
        const wn = this.getWinNum(txt)
        if (!dm) return txt
        const d = parseInt(dm[1], 10)
        const m = parseInt(dm[2], 10) - 1
        const y = parseInt(dm[3], 10)
        const dt = new Date(y, m, d)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const day = days[dt.getDay()]
        return `${day}${apTxt ? ' ' + apTxt : ''}${wn ? '(' + wn + ')' : ''}`.trim()
    }
    buildRowShareMessage(data, useEnglish){
        if(!data) return ''
        const lg = this.props.navigation.state.params.lg
        const termHeader = this.getTermHeaderText()
        const sale = (Math.round(data.ThreeD)+Math.round(data.TwoD))*data.UnitPrice
        const cut = Math.round(data.ThreeDAmount)+Math.round(data.TwoDAmount)
        const prize = Math.round(data.Prize)
        const net = (cut-prize) * -1
        const prizeDetail = data.LottType=='3D'
            ? `(${this.fmt(data.D3)}>${this.fmt(data.T3)})`
            : `(${this.fmt(data.D2)})`
        const nameLabel = useEnglish ? 'Name' : (lg=='uni' ? 'အမည်' : 'အမည္')
        const saleLabel = useEnglish ? 'Sale Amount' : (lg=='uni' ? 'ရောင်းကြေး' : '​ေရာင္းေၾကး')
        const cutLabel = useEnglish ? 'After Cut' : (lg=='uni' ? 'ကော်နှုတ်ပြီး' : 'ေကာ္ႏႈတ္ၿပီး')
        const prizeLabel = useEnglish ? 'Prize' : (lg=='uni' ? 'လျော်ကြေး' : 'ေလ်ာ္ေၾကး')
        const netLabel = useEnglish ? '+/-' : (lg=='uni' ? 'ရ/ပေး' : 'ရ/ေပး')
        const sign = net>=0?'(+)':'(-)'
        return `${termHeader}\n`+
            `${nameLabel}= ${data.CustomerName}\n`+
            `${saleLabel}= ${this.fmt(sale)}\n`+
            `${cutLabel}= ${this.fmt(cut)}\n`+
            `${prizeLabel}= ${this.fmt(prize)}${prizeDetail}\n`+
            `${netLabel}= ${this.fmt(Math.abs(net))}${sign}`
    }
    buildDetailShareText(rows, customerName, useEnglish){
        if(!rows || !rows.length) return ''
        const lg = this.props.navigation.state.params.lg
        const termHeader = this.getTermHeaderText()
        const nameLabel = useEnglish ? 'Name' : (lg=='uni' ? 'အမည်' : 'အမည္')
        const saleLabel = useEnglish ? 'Sale Amount' : (lg=='uni' ? 'ရောင်းကြေး' : '​ေရာင္းေၾကး')
        const cutLabel = useEnglish ? 'After Cut' : (lg=='uni' ? 'ကော်နှုတ်ပြီး' : 'ေကာ္ႏႈတ္ၿပီး')
        const prizeLabel = useEnglish ? 'Prize' : (lg=='uni' ? 'လျော်ကြေး' : 'ေလ်ာ္ေၾကး')
        const netLabel = useEnglish ? '+/-' : (lg=='uni' ? 'ရ/ပေး' : 'ရ/ေပး')

        const byTerm = {}
        rows.forEach((data) => {
            const termName = data.TermDetailName || data.Name || ''
            const key = `${data.CustomerName || ''}__${termName}`
            if (!byTerm[key]) {
                byTerm[key] = { customer:data.CustomerName||customerName||'', termDetailName:termName, sale:0, cut:0, prize:0, net:0, d2:0, d3:0, t3:0, lottType:data.LottType||'2D' }
            }
            const sale = (Math.round(data.ThreeD||0)+Math.round(data.TwoD||0))*(parseFloat(data.UnitPrice)||0)
            const cut = Math.round(data.ThreeDAmount||0)+Math.round(data.TwoDAmount||0)
            const prize = Math.round(data.Prize||0)
            byTerm[key].sale += sale
            byTerm[key].cut += cut
            byTerm[key].prize += prize
            byTerm[key].net += (cut-prize)
            byTerm[key].d2 += this.toNumber(data.D2)
            byTerm[key].d3 += this.toNumber(data.D3)
            byTerm[key].t3 += this.toNumber(data.T3)
        })

        const rows2 = Object.values(byTerm)
        const byDay = {}
        let totalNet = 0
        rows2.forEach((r) => {
            const day = this.getShortTermDetailLabel(r.termDetailName).split(' ')[0] || 'Day'
            if(!byDay[day]) byDay[day]=[]
            byDay[day].push(r)
            totalNet += r.net
        })
        const order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        const days = Object.keys(byDay).sort((a,b)=>order.indexOf(a)-order.indexOf(b))
        const sections = days.map((day) => {
            const dayNet = byDay[day].reduce((s,r)=>s+r.net,0) * -1
            const daySign = dayNet>=0?'(+)':'(-)'
            const body = byDay[day].sort((a,b)=>{
                const la = this.getShortTermDetailLabel(a.termDetailName)
                const lb = this.getShortTermDetailLabel(b.termDetailName)
                return la.localeCompare(lb)
            }).map((r)=>{
                const head = this.getShortTermDetailLabel(r.termDetailName)
                const prizeDetail = r.lottType=='3D' ? `(${this.fmt(r.d3)}>${this.fmt(r.t3)})` : `(${this.fmt(r.d2)})`
                const userNet = r.net * -1
                const sign = userNet>=0?'(+)':'(-)'
                return `${head}\n${saleLabel}= ${this.fmt(r.sale)}\n${cutLabel}= ${this.fmt(r.cut)}\n${prizeLabel}= ${this.fmt(r.prize)}${prizeDetail}\n${netLabel}= ${this.fmt(Math.abs(userNet))}${sign}`
            }).join('\n\n')
            return `${day}=>${netLabel}= ${this.fmt(Math.abs(dayNet))}${daySign}\n\n${body}`
        }).join('\n\n--------------------\n')
        const totalUser = totalNet * -1
        const totalSign = totalUser>=0?'(+)':'(-)'
        return `${termHeader}\n${nameLabel}= ${customerName}\n\n${sections}\n\n--------------------\nTotal= ${this.fmt(Math.abs(totalUser))}${totalSign}`
    }
    shareRowDetailFromApi(useEnglish){
        const row = this.state.rowShareData
        if(!row) return
        let search=''
        search+=this.state.termId?'TD.TermID=\''+this.state.termId+'\'':''
        search+=this.state.termDetailsId&&this.state.termDetailsId!='All'?' AND S.TermDetailID=\''+this.state.termDetailsId+'\'':''
        search+=this.state.agentId=='All'?'':' AND T.AgentID=\''+this.state.agentId+'\''
        search+=row.UserID?' AND S.UserID=\''+row.UserID+'\'':''
        const otherDiscount = 0
        this.setState({loading:true})
        dal.getPaymentDetailAndroid(this.props.navigation.state.params.endpoint,search,this.state.termId||'all',this.state.termDetailsId||'All',this.state.agentDiscount,otherDiscount,false,(err,resp)=>{
            this.setState({loading:false})
            if(err || !resp || resp.Status!='OK' || !resp.Data || !resp.Data.length){
                Alert.alert(config.AppName,'No Data!')
                return
            }
            const rows = resp.Data.filter(x => (x.CustomerName||'') == (row.CustomerName||''))
            if(!rows.length){
                Alert.alert(config.AppName,'No Data!')
                return
            }
            const msg = this.buildDetailShareText(rows,row.CustomerName||'',useEnglish)
            Share.open({message:msg})
        })
    }
    normalizeBreakPRow(r){
        return {
            termDetailName: r.TermDetailName || r.Name || '',
            totalUnit: this.toNumber(r.TotalUnit || r.Unit || r.SaleAmt),
            percentage: this.toNumber(r.Percentage || r.P),
            break: this.toNumber(r.Break || r.UnitBreak),
            totalWinUnit: this.toNumber(r.TotalWinUnit || r.WinUnit || r.Prize || r.Win),
        }
    }
    buildBreakPShareText(){
        const rows = this.state.breakPData || []
        if(!rows.length) return ''
        const lines = rows.map((r)=>`${r.termDetailName}\nရောင်းကြေး(%)=${this.fmt(r.totalUnit)}(+${this.fmt(r.percentage)}+)\nဘရိတ်=${this.fmt(r.break)} ပေါက်သီး=${this.fmt(r.totalWinUnit)}`)
        lines.push('')
        lines.push(`Total=${this.fmt(this.state.breakPTotalUnit)},${this.fmt(this.state.breakPTotalWinUnit)}`)
        return lines.join('\n\n')
    }
    fetchBreakP(){
        const row = this.state.rowShareData
        if(!row) return
        const customerName = row.CustomerName || row.UserNo || ''
        if(!customerName){
            Alert.alert(config.AppName,'No CustomerName')
            return
        }
        const termObj = (this.state.terms || []).find(x => x.TermID == this.state.termId)
        const termName = this.state.termId=='all'?'All':(termObj && termObj.Name ? termObj.Name : this.getTermHeaderText())
        const userNo = row.UserNo || customerName
        this.setState({loading:true})
        dal.getBreakP(this.props.navigation.state.params.endpoint,this.state.termId||'all',customerName,(err,resp)=>{
            this.setState({loading:false})
            if(err || !resp || resp.Status!='OK' || !resp.Data || !resp.Data.length){
                Alert.alert(config.AppName,'No Data!')
                return
            }
            const rows = resp.Data.map(v => this.normalizeBreakPRow(v))
            let totalUnit=0,totalWinUnit=0
            rows.forEach((r)=>{ totalUnit+=r.totalUnit; totalWinUnit+=r.totalWinUnit; })
            this.setState({
                breakPData:rows,
                breakPTotalUnit:totalUnit,
                breakPTotalWinUnit:totalWinUnit,
                breakPTitle:`${userNo} | ${termName}`,
                showBreakPModal:true
            })
        })
    }
    _rowRenderer(type, data) {
        return (
            <TouchableOpacity style={{
                width:width,
                height:40,
                borderBottomWidth:1,
                borderColor:Color.DIVIDERCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }}
            onLongPress={()=>{
                this.setState({
                    rowShareData:data,
                    rowShareTitle:data.UserNo || data.CustomerName || '',
                    showRowShareModal:true
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
                            {(Math.round(data.ThreeD)+Math.round(data.TwoD))*data.UnitPrice}
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
                            {Math.round(data.ThreeDAmount)+Math.round(data.TwoDAmount)}
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
                        {data.Prize}
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
                        {Math.round(data.ThreeDAmount)+Math.round(data.TwoDAmount)-Math.round(data.Prize)}
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
            <Picker.Item label={value.Name} value={value.TermDetailID} key={index} />
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
            console.log(resp)
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                this.setState({
                    termDetails:resp.Data,
                    loading:false
                })
            }else{
                this.setState({
                    termDetails:[],
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
                    loading:false
                })
            }else{
                this.setState({
                    terms:[],
                    loading:false
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
    
    getPaymentSummary(){
        let search=''
        search+=this.state.termId?'TD.TermID=\''+this.state.termId+'\'':''
        search+=this.state.termDetailsId?this.state.termDetailsId=='All'?'':' AND S.TermDetailID=\''+this.state.termDetailsId+'\'':'',
        search+=this.state.agentId=='All'?'':' AND T.AgentID=\''+this.state.agentId+'\''
        search+=this.state.userId=='All'?'':' AND S.UserID=\''+this.state.userId+'\''
        console.log(search)
        dal.getPaymentSummary(this.props.navigation.state.params.endpoint,search,this.state.agentDiscount,false,(err,resp)=>{
            if(err){
                console.log(err)
                this.setState({loading:false})
                Alert.alert(config.AppName,'Something went wrong!')
            }else{
                console.log(resp)
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    let total=0
                    resp.Data.map((value,index)=>{
                        total+=(Math.round(value.ThreeDAmount)+Math.round(value.TwoDAmount)-Math.round(value.Prize))
                    })
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows(resp.Data),
                        loading:false,
                        total:total
                    })
                }else{
                    Alert.alert(config.AppName,'No Data!')
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows([]),
                        loading:false,
                        total:0
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
                        <Picker.Item label={'All'} value={'All'}/>
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
                        <Picker.Item label={'All'} value={'All'}/>
                        {this.renderTermDetails()}
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
                <div id="numcol"> ?????????</div>
                <div id="numcol">????</div>
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
                        Total
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
                            {this.state.sent==0?this.state.total:this.state.total1}
                    </Text>
                </View>
                
                
            </View>
            {this.state.showBreakPModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.showBreakPModal}
                    onRequestClose={() => this.setState({ showBreakPModal: false })}
                >
                    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width * 0.92, maxHeight: height * 0.85, backgroundColor: '#fff', borderRadius: 8, padding: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Break</Text>
                            <Text style={{ fontSize: 13, color: '#333', marginBottom: 8 }}>{this.state.breakPTitle || ''}</Text>
                            <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#ddd' }}>
                                <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 12 }}>နေ့</Text>
                                <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>ရောင်းကြေး(%)</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12, textAlign: 'right' }}>ဘရိတ်</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12, textAlign: 'right' }}>ပေါက်သီး</Text>
                            </View>
                            <FlatList
                                style={{ maxHeight: height * 0.56 }}
                                data={this.state.breakPData}
                                keyExtractor={(item, index) => `bp_${index}`}
                                renderItem={({item}) => (
                                    <View style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
                                        <Text style={{ flex: 2, fontSize: 12 }}>{item.termDetailName}</Text>
                                        <Text style={{ flex: 2, fontSize: 12, textAlign: 'center' }}>{`${this.fmt(item.totalUnit)}(+${this.fmt(item.percentage)}+)`}</Text>
                                        <Text style={{ flex: 1, fontSize: 12, textAlign: 'right' }}>{this.fmt(item.break)}</Text>
                                        <Text style={{ flex: 1, fontSize: 12, textAlign: 'right' }}>{this.fmt(item.totalWinUnit)}</Text>
                                    </View>
                                )}
                            />
                            <Text style={{ marginTop: 8, fontSize: 13, fontWeight: 'bold', textAlign: 'right' }}>
                                {`Total=${this.fmt(this.state.breakPTotalUnit)},${this.fmt(this.state.breakPTotalWinUnit)}`}
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ showBreakPModal: false })}
                                    style={{ flex: 1, height: 40, backgroundColor: '#999', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}
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
                                    style={{ flex: 1, height: 40, backgroundColor: Color.PRIMARYCOLOR, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
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
                        <View style={{ width: width * 0.92, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
                                {this.state.rowShareTitle || ''}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                <TouchableOpacity onPress={() => this.setState({ rowShareLang: 'MM' })} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 28 }}>
                                    <Text style={{ fontSize: 34, color: this.state.rowShareLang == 'MM' ? Color.PRIMARYCOLOR : '#999', marginRight: 8 }}>
                                        {this.state.rowShareLang == 'MM' ? '◉' : '○'}
                                    </Text>
                                    <Text style={{ color: '#262626', fontWeight: 'bold', fontSize: 16 }}>MM</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.setState({ rowShareLang: 'Eng' })} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 34, color: this.state.rowShareLang == 'Eng' ? Color.PRIMARYCOLOR : '#999', marginRight: 8 }}>
                                        {this.state.rowShareLang == 'Eng' ? '◉' : '○'}
                                    </Text>
                                    <Text style={{ color: '#262626', fontWeight: 'bold', fontSize: 16 }}>Eng</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => this.setState({ showRowShareModal: false })} style={{ flex: 1, height: 40, backgroundColor: '#999', borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.setState({ showRowShareModal: false }, () => this.fetchBreakP())} style={{ flex: 1, height: 40, backgroundColor: '#FF8F00', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Break</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const useEnglish = (this.state.rowShareLang || 'MM') == 'Eng'
                                        this.setState({ showRowShareModal: false }, () => this.shareRowDetailFromApi(useEnglish))
                                    }}
                                    style={{ flex: 1, height: 40, backgroundColor: Color.Green, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Share Detail</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        const useEnglish = (this.state.rowShareLang || 'MM') == 'Eng'
                                        const msg = this.buildRowShareMessage(this.state.rowShareData, useEnglish)
                                        this.setState({ showRowShareModal: false }, () => {
                                            if (msg) Share.open({ message: msg })
                                        })
                                    }}
                                    style={{ flex: 1, height: 40, backgroundColor: Color.PRIMARYCOLOR, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
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

