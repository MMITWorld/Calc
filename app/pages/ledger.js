import React, { Component } from 'react';
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
    KeyboardAvoidingView,
    Picker,
    ScrollView,
    Keyboard,
    AsyncStorage,
    Clipboard,
    Share
} from 'react-native';
import dal from '../dal.js'
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import asending from '../assets/images/asending.png'
import descending from '../assets/images/descending.png'
import refreshIcon from '../assets/images/refresh.png'
import tickIcon from '../assets/images/tick.png'
import untickIcon from '../assets/images/untick.png'
import backIcon from '../assets/images/backward.png'
import editIcon from '../assets/images/edit.png'
import deleteIcon from '../assets/images/delete.png'
import Color from '../utils/Color.js';
import word from './data.json'
import config from '../config/config.js'
const { width, height } = Dimensions.get('window')
import Loading from '../components/loading.js'
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import numeral, { value } from 'numeral';
import DateTimePicker from '@react-native-community/datetimepicker';
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
import moment from 'moment';
//TZT
const _password = 'adminzt'
//TZT 
let showSETNUMbTn = true
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            terms: [],
            loading: true,
            termId: 'NoTerm',
            isHot: false,
            dataProvider: dataProvider.cloneWithRows([]),
            type: '2D',
            data: [],
            sort: 'unit_des',
            hots: [],
            hotnum: '',
            break: '0',
            buyType: 'm',
            userNo: 'NoUser',
            userId: null,
            users: [],
            discount2D: 0,
            discount3D: 0,
            isBuy: false,
            isCombineLdg: false,
            unitPrice: 1,
            bodyldg: '',
            showByNumModal: false,
            showByNumModalTime:false,
            buyNums: [],
            buyNumsTime: [],
            total: 0,
            vBreak: '',
            filterVBreak: false,
            showDirectBuyModal: false,
            supplierInfo: null,
            otherInfo: null,
            showDownload: false,
            termsFromOther: [],
            termIdForOther: null,
            otherHots: [],
            otherLottType: '2D',
            extra: false,
            combineType: 'sale',
            errorMsg: '',
            isGG: false,
            timesData: [],
            _discount: '',
            _percentage: '',
            _numbers4GG: [],
            showHolidayModal: false,
            holidayLoading: false,
            holidays: [],
            showNewHolidayModal: false,
            holidayID: 0,
            holidayDate: new Date(),
            holidayDesp: '',
            holidayStatus: 'New',
            holidaySaving: false,
            showHolidayDatePicker: false,
            liveapi: null,
            times: [],
            showLogin: false,
            isLogin: true,
            password: '',
            oldPassword: "",
            confirmPassword: '',
            agents:[],
            agentId:'All',
            __userId: null,
            maxUnit: 0,
            show3DModal: false,
            date3D: new Date(),
            showDatePicker3D: false,
            showTimePicker3D: false,
            index3D: '',
            winNum3D: '',
            win3DList: [],
            loaded3DMeta: false,
            showHeader: false,
            numSearch: '',
            showPlusPercentage: false,
            plusAmountType: '1',
            plusRichText: '',
            plusOriginalText: '',
            plusBreak: '',
            plusPercent: '',
            plusAsu: '',
            plusRichText2: '',
            plusUserNo: 'NoUser',
            plusCommission: '',
            plusCombineType: 'sale',
            plusCombineLoadingTarget: '',
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
    async componentDidMount() {
        console.log(this.props.navigation.state.params.termdetailsid)
        let liveapi = await AsyncStorage.getItem('LiveAPI') || null
        let liveTimes = await AsyncStorage.getItem('LiveTimes') || ''
        const timePrefRaw = await AsyncStorage.getItem('3D_TIME_PREF')
        if (timePrefRaw) {
            try {
                const t = JSON.parse(timePrefRaw)
                const d = new Date()
                d.setHours(t.h || 0)
                d.setMinutes(t.m || 0)
                d.setSeconds(t.s || 0)
                d.setMilliseconds(0)
                this.setState({ date3D: d })
            } catch (e) {}
        }
        console.log('live times ', liveTimes)
        let arr = liveTimes.split(',')
        let times = []
        arr.map((value, index) => {
            times.push(
                {
                    time: value,
                    srno: index + 1,
                    disable: false,
                    number: ''
                }
            )
        })
        console.log('live api ', liveapi)
        this.setState({
            liveapi: liveapi,
            times: times
        })
        this.APITermDetailByDate()
        this.getAgents()
    }

    save3DTimePref(date) {
        if (!date) return;
        const t = { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds() }
        AsyncStorage.setItem('3D_TIME_PREF', JSON.stringify(t))
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
    _rowRenderer(type, data, index) {
        return (
            <View style={{
                width: width,
                height: 40,
                borderBottomWidth: 1,
                borderColor: Color.DIVIDERCOLOR,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <TouchableOpacity style={{
                    flex: 2
                }} onPress={() => {

                    this.setState({
                        loading: true
                    }, () => {
                        this.APISlipDetail(this.state.termId, data.Num)
                        this.APISlipDetailTime(this.state.termId, data.Num)
                    })
                }}>
                    <Text style={{
                        color: Color.DARKPRIMARYTEXTCOLOR,
                        fontSize: 15,
                        textAlign: 'center'
                    }}>
                        {data.Num}
                    </Text>
                </TouchableOpacity>
                <View style={{
                    flex: 3,
                }}>
                    <Text style={{
                        color: Color.DARKPRIMARYTEXTCOLOR,
                        fontSize: 15,
                        textAlign: 'center'
                    }}>
                        {data.Unit}
                    </Text>
                </View>
                <View style={{ flex: 3 }}>
                    <Text style={{
                        color: Color.DARKPRIMARYTEXTCOLOR,
                        fontSize: 15,
                        textAlign: 'center'
                    }}>
                        {data.Extra}
                    </Text>
                </View>
            </View>
        );
    }
    renderBuyNums() {
        const list = this.state.buyNums || [];
        const totalUnit = list.reduce((sum, item) => {
            const u = parseFloat(item?.Unit);
            return sum + (isNaN(u) ? 0 : u);
        }, 0);
        return (
            <View>
                {list.map((value, index) => {
                    return (
                        <View key={index} style={{
                            width: width - 10,
                            height: 50,
                            borderBottomWidth: 1,
                            borderColor: Color.DIVIDERCOLOR,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <View style={{
                                flex: 1
                            }}>
                                <Text style={{
                                    color: '#262626',
                                    fontSize: 12,
                                    textAlign: 'center'
                                }}>
                                    {value.CustomerName}
                                </Text>
                            </View>
                            <View style={{
                                flex: 1
                            }}>
                                <Text style={{
                                    color: '#262626',
                                    fontSize: 12,

                                    textAlign: 'center'
                                }}>
                                    {value.Num}
                                </Text>
                            </View>
                            <View style={{
                                flex: 1,
                                marginRight: 10
                            }}>
                                <Text style={{
                                    color: '#262626',
                                    fontSize: 12,
                                    textAlign: 'right'
                                }}>
                                    {value.Unit}
                                </Text>
                            </View>
                        </View>
                    )
                })}
                <View style={{
                    width: width - 10,
                    height: 44,
                    borderTopWidth: 1,
                    borderColor: Color.DIVIDERCOLOR,
                    justifyContent: 'center',
                    paddingHorizontal: 12
                }}>
                    <Text style={{
                        color: '#262626',
                        fontSize: 13,
                        textAlign: 'right',
                        fontWeight: 'bold'
                    }}>
                        {`Total=${numeral(totalUnit).format('0,0')}`}
                    </Text>
                </View>
            </View>
        )
    }

    renderBuyNumsTime() {
        return this.state.buyNumsTime.map((value, index) => {
            return (
                <View style={{
                    width: width - 10,
                    height: 50,
                    borderBottomWidth: 1,
                    borderColor: Color.DIVIDERCOLOR,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <View style={{
                        flex: 1,
                        marginRight: 10
                    }}>
                        <Text style={{
                            color: '#262626',
                            fontSize: 9,
                            textAlign: 'right'
                        }}>
                            {moment(value.SaleDate).format('DD/MM/YYYY hh:mm A')}
                        </Text>
                    </View>

                    <View style={{
                        flex: 1
                    }}>
                        <Text style={{
                            color: '#262626',
                            fontSize: 12,
                            textAlign: 'center'
                        }}>
                            {value.CustomerName}
                        </Text>
                    </View>
                    <View style={{
                        flex: 1
                    }}>
                        <Text style={{
                            color: '#262626',
                            fontSize: 12,

                            textAlign: 'center'
                        }}>
                            {value.Num}
                        </Text>
                    </View>
                    <View style={{
                        flex: 1,
                        marginLeft: 1
                    }}>
                        <Text style={{
                            color: '#262626',
                            fontSize: 12,
                            textAlign: 'right'
                        }}>
                            {value.Unit}
                        </Text>
                    </View>

                    <View style={{
                        flex: 1,
                        marginRight: 10
                    }}>
                        <Text style={{
                            color: '#262626',
                            fontSize: 12,
                            textAlign: 'right'
                        }}>
                            {value.SlipNo}
                        </Text>
                    </View>

                    

                </View>
            )
        })
    }

    renderBuyNumModal() {
        return (
            <Modal
                transparent={true}
                visible={this.state.showByNumModal}
                onRequestClose={() => {
                    this.setState({
                        showByNumModal: false
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: Color.PRIMARYTEXTCOLOR, width: (width) - 10, borderRadius: 10, height: height }}>
                        <View style={{
                            width: width - 10,
                            height: 50,
                            borderBottomWidth: 1,
                            borderColor: Color.DIVIDERCOLOR,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <View style={{
                                flex: 1
                            }}>
                                <Text style={{
                                    color: Color.YELLOWCOLOR,
                                    fontSize: 12,
                                    textAlign: 'center'
                                }}>
                                    {word[this.props.navigation.state.params.lg].user}
                                </Text>
                            </View>
                            <View style={{
                                flex: 1
                            }}>
                                <Text style={{
                                    color: Color.YELLOWCOLOR,
                                    fontSize: 12,

                                    textAlign: 'center'
                                }}>
                                    {word[this.props.navigation.state.params.lg].num}
                                </Text>
                            </View>
                            <View style={{
                                flex: 1,
                                marginRight: 10
                            }}>
                                <Text style={{
                                    color: Color.YELLOWCOLOR,
                                    fontSize: 12,
                                    textAlign: 'right'
                                }}>
                                    {word[this.props.navigation.state.params.lg].unit}
                                </Text>
                            </View>
                        </View>
                        <ScrollView>
                            <View>
                                {this.renderBuyNums()}
                            </View>
                        </ScrollView>

                        <View style={{ flexDirection: 'row', marginVertical: 5, marginHorizontal: 20 }}>
                            <TouchableOpacity style={{
                                flex: 1, alignItems: "center", justifyContent: 'center', backgroundColor: Color.DIVIDERCOLOR, paddingVertical: 10
                                , borderRadius: 7
                                , marginRight: 10
                            }} onPress={() => {
                                this.setState({
                                    showByNumModalTime: true,
                                    showByNumModal:false,
                                })
                            }}>
                                <Text style={{ fontSize: 15, fontFamily: 'Roboto', color: Color.PRIMARYCOLOR }}>
                                    အ​သေးစိတ်
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{
                                flex: 1, alignItems: "center", justifyContent: 'center', backgroundColor: Color.DIVIDERCOLOR, paddingVertical: 10
                                , borderRadius: 7
                            }} onPress={() => {
                                this.setState({
                                    showByNumModal: false
                                })
                            }}>
                                <Text style={{ fontSize: 15, fontFamily: 'Roboto', color: Color.PRIMARYCOLOR }}>
                                    CANCEL
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    renderBuyNumModalTime() {
        return (
            <Modal
                transparent={true}
                visible={this.state.showByNumModalTime}
                onRequestClose={() => {
                    this.setState({
                        showByNumModalTime: false
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: Color.PRIMARYTEXTCOLOR, width: (width) - 10, borderRadius: 10, height: height }}>
                        <View style={{
                            width: width - 10,
                            height: 50,
                            borderBottomWidth: 1,
                            borderColor: Color.DIVIDERCOLOR,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <View style={{
                                flex: 1,
                                marginRight: 10
                            }}>
                                <Text style={{
                                    color: Color.YELLOWCOLOR,
                                    fontSize: 12,
                                    textAlign: 'right'
                                }}>
                                    Time
                                </Text>
                            </View>

                            <View style={{
                                flex: 1
                            }}>
                                <Text style={{
                                    color: Color.YELLOWCOLOR,
                                    fontSize: 12,
                                    textAlign: 'center'
                                }}>
                                    {word[this.props.navigation.state.params.lg].user}
                                </Text>
                            </View>
                            <View style={{
                                flex: 1
                            }}>
                                <Text style={{
                                    color: Color.YELLOWCOLOR,
                                    fontSize: 12,

                                    textAlign: 'center'
                                }}>
                                    {word[this.props.navigation.state.params.lg].num}
                                </Text>
                            </View>
                            <View style={{
                                flex: 1,
                                marginRight: 10
                            }}>
                                <Text style={{
                                    color: Color.YELLOWCOLOR,
                                    fontSize: 12,
                                    textAlign: 'right'
                                }}>
                                    {word[this.props.navigation.state.params.lg].unit}
                                </Text>
                            </View>

                            <View style={{
                                flex: 1,
                                marginRight: 3
                            }}>
                                <Text style={{
                                    color: Color.YELLOWCOLOR,
                                    fontSize: 12,
                                    textAlign: 'right'
                                }}>
                                    Slip
                                </Text>
                            </View>

                            



                        </View>
                        <ScrollView>
                            <View>
                                {this.renderBuyNumsTime()}
                            </View>
                        </ScrollView>

                        <View style={{ flexDirection: 'row', marginVertical: 5, marginHorizontal: 20 }}>
                            <TouchableOpacity style={{
                                flex: 1, alignItems: "center", justifyContent: 'center', backgroundColor: Color.DIVIDERCOLOR, paddingVertical: 10
                                , borderRadius: 7
                            }} onPress={() => {
                                this.setState({
                                    showByNumModalTime: false
                                })
                            }}>
                                <Text style={{ fontSize: 15, fontFamily: 'Roboto', color: Color.PRIMARYCOLOR }}>
                                    CANCEL
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    renderTerms() {
        return this.state.terms.map((value, index) => {
            return (
                <Picker.Item label={value.Name} value={value.TermDetailID} key={index} />
            )
        })
    }
    get_predefined_today_terms() {
        dal.get_predefined_today_terms(`${this.state.liveapi}/api/apiwinnumtoday?LottType=2D&IsToday=true`, (err, resp) => {
            console.log("Response=====>" + resp)
            if (err) {
                //Alert.alert(config.AppName,'Something went wrong!')
                this.setState({
                    loading: false
                })
            } else {
                console.log(resp)
                console.log('data length ', resp.Data.length)
                resp.Data.map((value, index) => {
                    var startTime = moment(value.ResultDate, 'YYYY-MM-DDThh:mm:ss');
                    var endTime = moment(resp.CurrentDateTime, 'YYYY-MM-DDThh:mm:ss');
                    console.log(startTime)
                    console.log(endTime)
                    var secondsDiff = endTime.diff(startTime, 'seconds');
                    console.log('time ', secondsDiff)
                    const i = this.state.times.findIndex(x => x.time == moment(value.ResultDate).format('h:mm A'))
                    if (i != -1) {
                        this.state.times[i].number = value.WinNum2
                        this.state.times[i].disable = secondsDiff > 0 ? true : false
                    }
                })
                this.setState({
                    timesData: this.state.times,
                    loading: false,
                    isGG: true,
                })
                // if(resp.Status=='OK'){

                // }else{
                //     // this.setState({
                //     //     timesData:[],
                //     //     loading:false,
                //     //     isGG:true,
                //     // })
                //     Alert.alert(config.AppName,resp.status==401?resp?.msg:'Can\'t retrieve GG data!')
                //     this.setState({
                //         timesData:[],
                //         loading:false,
                //     })
                // }
            }
        })
    }
    APISlipDetail(TermDetailID, Num) {
        dal.APISlipDetail(this.props.navigation.state.params.endpoint, TermDetailID, Num, (err, resp) => {
            if (err) {
                Alert.alert(config.AppName, 'Can\'t retrieve slip data!')
                this.setState({
                    loading: false
                })
            } else {
                console.log(resp)
                if (resp && resp.Status == 'OK' && resp.Data.length) {
                    this.setState({
                        buyNums: resp.Data,
                        loading: false,
                        showByNumModal: true,
                        showByNumModalTime: false
                    })
                } else {
                    Alert.alert(config.AppName, resp.Status)
                    this.setState({
                        buyNums: [],
                        loading: false
                    })
                }
            }
        })
    }

APISlipDetailTime(TermDetailID, Num) {
        dal.APISlipDetailTime(this.props.navigation.state.params.endpoint, TermDetailID, Num, (err, resp) => {
            if (err) {
                Alert.alert(config.AppName, 'Can\'t retrieve slip data!')
                this.setState({
                    loading: false
                })
            } else {
                console.log(resp)
                if (resp && resp.Status == 'OK' && resp.Data.length) {
                    this.setState({
                        buyNumsTime: resp.Data,
                        loading: false,
                    })
                } else {
                    Alert.alert(config.AppName, resp.Status)
                    this.setState({
                        buyNumsTime: [],
                        loading: false
                    })
                }
            }
        })
    }

    APITermDetailByDate() {
        dal.APITermDetailByDate(this.props.navigation.state.params.endpoint, (err, resp) => {
            if (err) {
                Alert.alert(config.AppName, 'Can\'t retrieve agents data!')
                this.setState({
                    loading: false
                })
            } else {
                console.log(resp)
                if (resp && resp.Status == 'OK' && resp.Data.length) {
                    this.setState({
                        terms: resp.Data,
                        termId: this.props.navigation.state.params && this.props.navigation.state.params.termdetailsid ?
                            this.props.navigation.state.params.termdetailsid : 'NoTerm',
                        loading: false
                    }, () => {
                        if (this.state.termId != 'NoTerm') {
                            let i = this.state.terms.findIndex(x => x.TermDetailID == this.state.termId);
                            if (i !== -1) {
                                this.setState({
                                    loading: true,
                                    type: this.state.terms[i].LottType,
                                    unitPrice: this.state.terms[i].UnitPrice,
                                    break: this.state.terms[i].UnitBreak ? this.state.terms[i].UnitBreak.toString() : ''
                                }, () => {
                                    this.getLedgerList(this.state.terms[i].LottType)
                                })
                            }
                        }
                    })

                } else {
                    Alert.alert(config.AppName, resp.Status)
                    this.setState({
                        terms: [],
                        loading: false
                    })
                }
            }
        })
    }
    getTermDetailsAll() {
        dal.getTermDetailsByID(this.props.navigation.state.params.endpoint, 'All', (err, resp) => {
            if (err) {
                Alert.alert(config.AppName, 'Can\'t retrieve term data!')
                this.setState({
                    terms: [],
                    loading: false
                })
            } else {
                console.log(resp)
                if (resp && resp.Status == 'OK' && resp.Data.length) {
                    this.setState({
                        terms: resp.Data,
                        termId: 'NoTerm',
                        loading: false
                    })
                } else {
                    Alert.alert(config.AppName, resp.Status)
                    this.setState({
                        terms: [],
                        loading: false
                    })
                }
            }
        })
    }
    getHotList() {
        dal.getHotList(this.props.navigation.state.params.endpoint, this.state.termId, (err, resp) => {
            if (err) {
                //Alert.alert(config.AppName,'Something went wrong!')
                this.setState({
                    loading: false
                })
            } else {
                //if(resp&&resp.Data.length){
                this.setState({
                    hots: resp.Data,
                    loading: false,
                    isHot: true,
                    hotnum: ''
                })
                // }else{
                //     Alert.alert(config.AppName,'Can\'t retrieve hots data!')
                //     this.setState({
                //         hots:[],
                //         loading:false,
                //         hotnum:''
                //     })
                // }
            }
        })
    }
    getHotListForOther(termId) {
        if (!termId) {
            this.setState({ otherHots: [] })
            return;
        }
        dal.getHotList(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), termId, (err, resp) => {
            if (err) {
                this.setState({ otherHots: [] })
            } else {
                this.setState({
                    otherHots: resp.Data || []
                })
            }
        })
    }

    getCombineLdgList() {
        this.setState({
            loading: false,
            isCombineLdg: true
        })
    }
    getLedgerListByvBreak(LottType) {
        dal.getLedgerListByvBreak(this.props.navigation.state.params.endpoint, this.state.termId, LottType,
            this.state.vBreak == '' ? 0 : this.state.vBreak, (err, resp) => {
                if (err) {
                    //Alert.alert(config.AppName,'Something went wrong!')
                    this.setState({
                        loading: false
                    })
                } else {
                    if (resp && resp.Data.length) {
                        // let temp=resp.Data
                        // let i=this.state.terms.findIndex(x => x.TermDetailID==this.state.termId);
                        // if(i!=-1){
                        //     temp[0].LottType=this.state.terms[i].LottType
                        // }
                    let t = 0
                    let maxUnit = 0
                    resp.Data.map((value, index) => {
                        t += value.Unit
                        if (value.Unit > maxUnit) maxUnit = value.Unit
                    })
                    this.setState({
                        total: t,
                        maxUnit: maxUnit,
                        data: resp.Data,
                            dataProvider: dataProvider.cloneWithRows(
                                this.getFilteredSortedRows(resp.Data, this.state.sort, this.state.numSearch)
                            ),
                            loading: false
                        })
                    } else {
                        Alert.alert(config.AppName, 'Can\'t retrieve ledger data!')
                        this.setState({
                            data: [],
                            dataProvider: dataProvider.cloneWithRows([]),
                            loading: false
                        })
                    }
                }
            })
    }
    getLedgerList(LottType) {
        dal.getLedgerList(this.props.navigation.state.params.endpoint, this.state.termId, LottType,this.state.__userId?this.state.__userId:'All',this.state.agentId, (err, resp) => {
            if (err) {
                //Alert.alert(config.AppName,'Something went wrong!')
                this.setState({
                    loading: false
                })
            } else {
                if (resp && resp.Data.length) {
                    // let temp=resp.Data
                    // let i=this.state.terms.findIndex(x => x.TermDetailID==this.state.termId);
                    // if(i!=-1){
                    //     temp[0].LottType=this.state.terms[i].LottType
                    // }
                    let t = 0
                    let maxUnit = 0
                    resp.Data.map((value, index) => {
                        t += value.Unit
                        if (value.Unit > maxUnit) maxUnit = value.Unit
                    })
                    this.setState({
                        total: t,
                        maxUnit: maxUnit,
                        data: resp.Data,
                        dataProvider: dataProvider.cloneWithRows(
                            this.getFilteredSortedRows(resp.Data, this.state.sort, this.state.numSearch)
                        ),
                        loading: false
                    })
                } else {
                    Alert.alert(config.AppName, 'Can\'t retrieve ledger data!')
                    this.setState({
                        data: [],
                        dataProvider: dataProvider.cloneWithRows([]),
                        loading: false
                    })
                }
            }
        })
    }
    dynamicsort(property, order) {
        var sort_order = 1;
        if (order === "desc") {
            sort_order = -1;
        }
        return (a, b) => {
            // a should come before b in the sorted order
            if (a[property] < b[property]) {
                return -1 * sort_order;
                // a should come after b in the sorted order
            } else if (a[property] > b[property]) {
                return 1 * sort_order;
                // a and b are the same
            } else {
                return 0 * sort_order;
            }
        }
    }
    getFilteredSortedRows(source, sort, numSearch) {
        let rows = Array.isArray(source) ? source.slice() : [];
        const key = (numSearch || '').toString().trim();
        if (key !== '') {
            rows = rows.filter(x => String(x?.Num ?? '').indexOf(key) !== -1);
        }
        if (sort == 'num_asc') return rows.sort(this.dynamicsort("Num", "asc"));
        if (sort == 'num_des') return rows.sort(this.dynamicsort("Num", "desc"));
        if (sort == 'unit_asc') return rows.sort(this.dynamicsort("Unit", "asc"));
        return rows.sort(this.dynamicsort("Unit", "desc"));
    }
    applyNumFilter(numSearch, sort) {
        const nextSort = sort || this.state.sort;
        const rows = this.getFilteredSortedRows(this.state.data, nextSort, numSearch);
        this.setState({
            numSearch: numSearch,
            sort: nextSort,
            dataProvider: dataProvider.cloneWithRows(rows)
        });
    }
    getActiveBreakForPlus() {
        const useMax = (this.state.agentId !== 'All') || (this.state.__userId !== null && this.state.__userId !== undefined);
        return useMax ? (this.state.maxUnit || 0) : (this.state.filterVBreak && this.state.vBreak > 0 ? this.state.vBreak : this.state.break);
    }
    parseMaxUnitFromPlusText(raw) {
        let maxUnit = null;
        const text = String(raw || '');
        text.split(/\r?\n/).forEach((line) => {
            String(line || '').split('|').forEach((cell) => {
                const txt = String(cell || '').trim();
                if (!txt) return;
                // Accept only numeric-number rows:
                // 997 - 6021 or 997=6021
                // Ignore summary lines like "Total Unit=1022927".
                const m = txt.match(/^(\d+)\s*[-=]\s*([0-9][0-9,]*(?:\.\d+)?)$/);
                if (!m) return;
                const u = Number(String(m[2] || '').replace(/,/g, ''));
                if (isNaN(u)) return;
                if (maxUnit === null || u > maxUnit) maxUnit = u;
            });
        });
        return maxUnit;
    }
    getPlusTotalAndMax(raw) {
        let total = 0;
        let max = 0;
        const text = String(raw || '');
        text.split(/\r?\n/).forEach((line) => {
            String(line || '').split('|').forEach((cell) => {
                const txt = String(cell || '').trim();
                if (!txt) return;
                const m = txt.match(/^(\d+)\s*[-=]\s*([0-9][0-9,]*(?:\.\d+)?)$/);
                if (!m) return;
                const u = Number(String(m[2] || '').replace(/,/g, ''));
                if (isNaN(u)) return;
                total += u;
                if (u > max) max = u;
            });
        });
        const pct = max > 0 ? Math.round(total / max) : 0;
        return { total, max, pct };
    }
    setPlusTextAndBreakFromRaw(raw, updateOriginal = true) {
        const txt = String(raw || '');
        const maxUnit = this.parseMaxUnitFromPlusText(txt);
        const next = {
            plusRichText: txt,
            plusBreak: maxUnit === null ? '' : String(maxUnit)
        };
        if (updateOriginal) {
            next.plusOriginalText = txt;
        }
        this.setState(next);
    }
    isTwoColumnPlusText(raw) {
        const text = String(raw || '');
        return text.split(/\r?\n/).some((line) => String(line || '').indexOf('|') !== -1);
    }
    openPlusPercentageModal() {
        const up = Number(this.state.unitPrice || 1);
        const defaultAmountType = up === 25 ? '25' : up === 100 ? '100' : '1';
        this.setState({
            showPlusPercentage: true,
            plusAmountType: defaultAmountType,
            plusBreak: String(this.getActiveBreakForPlus() || ''),
            plusUserNo: 'NoUser',
            plusCommission: '',
            plusCombineType: 'sale',
            plusRichText2: '',
            plusPercent: '',
            plusAsu: '',
            plusCombineLoadingTarget: '',
        });
        Clipboard.getString()
            .then((txt) => {
                this.setPlusTextAndBreakFromRaw(txt || '');
            })
            .catch(() => {});
        this.getUsers();
    }
    runPlusDivisionByAsu(asuValue, silent = true) {
        const raw = String(this.state.plusOriginalText || this.state.plusRichText || '');
        if (!raw.trim()) {
            if (!silent) Alert.alert(config.AppName, 'Please enter list in textbox!');
            return;
        }
        const breakVal = Number(String(this.state.plusBreak || '').replace(/,/g, '').trim());
        if (isNaN(breakVal) || breakVal <= 0) {
            if (!silent) Alert.alert(config.AppName, 'Invalid Break value.');
            return;
        }
        if (isNaN(asuValue) || asuValue <= 0) {
            if (!silent) Alert.alert(config.AppName, 'Please set အစု value.');
            return;
        }

        const lines = raw.split(/\r?\n/);
        const outForRich2 = [];
        const outForRich1 = [];
        let parsedCount = 0;

        lines.forEach((line) => {
            const cells = String(line || '').split('|');
            const plusCells = [];
            const remainCells = [];
            let hasParsedCell = false;

            cells.forEach((cell) => {
                const txt = String(cell || '').trim();
                const m = txt.match(/^(\d+)\s*[-=]\s*([0-9][0-9,]*(?:\.\d+)?)$/);
                if (!m) {
                    remainCells.push(txt);
                    return;
                }
                const num = m[1];
                const unit = Number(String(m[2] || '').replace(/,/g, ''));
                if (isNaN(unit)) {
                    remainCells.push(txt);
                    return;
                }
                const dividedUnit = Math.ceil((unit * asuValue) / breakVal);
                const remainUnit = Math.max(0, unit - dividedUnit);
                plusCells.push(`${num}=${dividedUnit}`);
                remainCells.push(`${num}=${remainUnit}`);
                hasParsedCell = true;
                parsedCount += 1;
            });

            if (hasParsedCell) {
                outForRich2.push(plusCells.join(' | '));
                outForRich1.push(remainCells.join(' | '));
            } else {
                outForRich1.push(line);
            }
        });

        if (!parsedCount) {
            if (!silent) Alert.alert(config.AppName, 'No valid rows. Use format Num=Unit or Num-Unit.');
            return;
        }

        this.setState({
            plusRichText2: outForRich2.join('\n'),
            plusRichText: outForRich1.join('\n')
        });
    }
    dividePlusPercentage() {
        const asuDigits = String(this.state.plusAsu || '').replace(/[^\d]/g, '');
        const asuValue = parseInt(asuDigits || '0', 10);
        this.runPlusDivisionByAsu(asuValue, false);
    }
    combinePlusPercentage(fromRichText1 = false) {
        if (this.state.plusUserNo == 'NoUser') {
            Alert.alert(config.AppName, 'Please select the user!');
            return;
        }
        const sourceText = fromRichText1 ? this.state.plusRichText : this.state.plusRichText2;
        let body = String(sourceText || '').trim();
        if (!body) {
            Alert.alert(config.AppName, fromRichText1 ? 'Please fill RichTextBox1 first!' : 'Please fill RichTextBox2 first!');
            return;
        }
        // Normalize both RichText1 and RichText2 to API-friendly "Num - Unit" format.
        const normalizedLines = [];
        String(sourceText || '').split(/\r?\n/).forEach((line) => {
            const outCells = [];
            String(line || '').split('|').forEach((cell) => {
                const txt = String(cell || '').trim();
                const m = txt.match(/^(\d+)\s*[-=]\s*([0-9][0-9,]*(?:\.\d+)?)$/);
                if (!m) return;
                const num = m[1];
                const unit = String(m[2] || '').replace(/,/g, '');
                outCells.push(`${num} - ${unit}`);
            });
            if (outCells.length) {
                normalizedLines.push(outCells.join(' | '));
            }
        });
        body = normalizedLines.join('\n').trim();
        if (!body) {
            Alert.alert(config.AppName, fromRichText1 ? 'RichTextBox1 format is invalid.' : 'RichTextBox2 format is invalid.');
            return;
        }
        const requiredLen = this.state.type == '3D' ? 3 : 2;
        const invalidNum = [];
        body.split(/\r?\n/).forEach((line) => {
            String(line || '').split('|').forEach((cell) => {
                const m = String(cell || '').trim().match(/^(\d+)\s*-\s*([0-9][0-9,]*(?:\.\d+)?)$/);
                if (!m) return;
                const num = m[1];
                if (num.length !== requiredLen) {
                    invalidNum.push(num);
                }
            });
        });
        if (invalidNum.length) {
            Alert.alert(
                config.AppName,
                this.state.type == '3D'
                    ? 'အပါတ်စဥ်မှား​နေပါသည်။'
                    : 'အပါတ်စဥ်မှား​နေပါသည်။'
            );
            return;
        }
        const isTwoColumn = this.isTwoColumnPlusText(body);
        const disRaw = Number(String(this.state.plusCommission || '').replace(/,/g, '').trim());
        const dis = isNaN(disRaw) ? 0 : disRaw;
        const LdgPrice = this.state.plusAmountType == '25' ? 25 : this.state.plusAmountType == '100' ? 100 : 1;

        const loadingTarget = fromRichText1 ? 'plus2' : 'plus';
        this.setState({ loading: true, plusCombineLoadingTarget: loadingTarget });
        const combineFn = isTwoColumn ? dal.combineLedger : dal.combineSMS;
        combineFn(
          this.props.navigation.state.params.endpoint,
          this.state.plusUserNo,
          this.state.termId,
          dis,
          this.state.plusCombineType == 'sale',
          this.state.unitPrice,
          LdgPrice,
          this.state.type,
          body,
          (err, resp) => {
              if (resp == 'OK') {
                  Alert.alert(config.AppName, 'Combine successfully!');
                  this.setState({
                      loading: false,
                      plusCombineLoadingTarget: ''
                  });
              } else {
                  Alert.alert(config.AppName, resp || 'Something went wrong!');
                  this.setState({ loading: false, plusCombineLoadingTarget: '' });
              }
          }
      );
    }
    replaceChar(replaceChar, index) {
        let firstPart = this.state.typeStr.substr(0, index);
        let lastPart = this.state.typeStr.substr(index + 1);

        let newString = firstPart + replaceChar + lastPart;
        return newString;
    }
    renderLoading() {
        return (
            <Loading show={this.state.loading}></Loading>
        )
    }
    renderPlusPercentageModal() {
        const summary = this.getPlusTotalAndMax(this.state.plusRichText);
        const summary2 = this.getPlusTotalAndMax(this.state.plusRichText2);
        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.showPlusPercentage}
                onRequestClose={() => this.setState({ showPlusPercentage: false })}
            >
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={{
                        height: 56,
                        backgroundColor: Color.PRIMARYCOLOR,
                        paddingHorizontal: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Roboto-Bold' }}>+(%)</Text>
                        <TouchableOpacity onPress={() => {
                            this.setState({ showPlusPercentage: false, loading: true }, () => {
                                this.getLedgerList(this.state.type);
                            });
                        }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Roboto-Bold' }}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 12 }} keyboardShouldPersistTaps="handled">
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                                onPress={() => this.setState({ plusAmountType: '1' })}>
                                <Image source={this.state.plusAmountType === '1' ? radio_btn_selected : radio_btn_unselected}
                                    style={{ width: 22, height: 22, marginRight: 6, tintColor: Color.PRIMARYCOLOR }} />
                                <Text style={{ color: '#262626', fontSize: 16 }}>ငွေ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                                onPress={() => this.setState({ plusAmountType: '25' })}>
                                <Image source={this.state.plusAmountType === '25' ? radio_btn_selected : radio_btn_unselected}
                                    style={{ width: 22, height: 22, marginRight: 6, tintColor: Color.PRIMARYCOLOR }} />
                                <Text style={{ color: '#262626', fontSize: 16 }}>25</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => this.setState({ plusAmountType: '100' })}>
                                <Image source={this.state.plusAmountType === '100' ? radio_btn_selected : radio_btn_unselected}
                                    style={{ width: 22, height: 22, marginRight: 6, tintColor: Color.PRIMARYCOLOR }} />
                                <Text style={{ color: '#262626', fontSize: 16 }}>100</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={this.state.loading}
                                style={{
                                    marginLeft: 10,
                                    height: 34,
                                    paddingHorizontal: 20,
                                    borderRadius: 6,
                                    backgroundColor: this.state.loading ? '#7aa8ff' : Color.PRIMARYCOLOR,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={() => this.combinePlusPercentage(true)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {this.state.loading && this.state.plusCombineLoadingTarget === 'plus2' && (
                                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
                                    )}
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Roboto-Bold' }}>
                                        {this.state.loading && this.state.plusCombineLoadingTarget === 'plus2' ? 'Loading...' : '+'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: '#262626', fontSize: 14, marginBottom: 10, fontFamily: 'Roboto-Bold' }}>
                            {`Total=${numeral(summary.total).format('0,0')}(${summary.pct}%) , Break=${numeral(summary.max).format('0,0')}`}
                        </Text>

                        <View style={{ borderWidth: 1, borderColor: Color.DIVIDERCOLOR, borderRadius: 6, marginBottom: 10 }}>
                            <TextInput
                                style={{
                                    minHeight: 200,
                                    maxHeight: 300,
                                    padding: 10,
                                    color: '#262626',
                                    fontSize: 15,
                                    textAlignVertical: 'top'
                                }}
                                multiline
                                scrollEnabled={true}
                                underlineColorAndroid="transparent"
                                placeholder="Num=Unit"
                                placeholderTextColor="#777"
                                value={this.state.plusRichText}
                                onChangeText={(text) => this.setPlusTextAndBreakFromRaw(text)}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <TextInput
                                editable={false}
                                style={{
                                    width: 80,
                                    height: 40,
                                    borderWidth: 1,
                                    borderColor: Color.DIVIDERCOLOR,
                                    borderRadius: 6,
                                    paddingHorizontal: 10,
                                    color: '#262626',
                                    backgroundColor: '#f2f2f2',
                                    marginRight: 6
                                }}
                                value={this.state.plusBreak}
                            />
                            <TextInput
                                style={{
                                    width: 60,
                                    height: 40,
                                    borderWidth: 1,
                                    borderColor: Color.DIVIDERCOLOR,
                                    borderRadius: 6,
                                    paddingHorizontal: 10,
                                    color: '#262626',
                                    marginRight: 8
                                }}
                                keyboardType='decimal-pad'
                                placeholder='%'
                                placeholderTextColor={'#777'}
                                value={this.state.plusPercent}
                                onChangeText={(text) => {
                                    const raw = String(text || '').replace(/,/g, '.');
                                    let normalized = raw.replace(/[^\d.]/g, '');
                                    const dotIndex = normalized.indexOf('.');
                                    if (dotIndex !== -1) {
                                        normalized = normalized.slice(0, dotIndex + 1) + normalized.slice(dotIndex + 1).replace(/\./g, '');
                                    }
                                    if (normalized === '') {
                                        const originalText = String(this.state.plusOriginalText || '');
                                        const maxUnit = this.parseMaxUnitFromPlusText(originalText);
                                        this.setState({
                                            plusPercent: '',
                                            plusAsu: '',
                                            plusRichText: originalText,
                                            plusRichText2: '',
                                            plusBreak: maxUnit === null ? '' : String(maxUnit),
                                        });
                                        return;
                                    }
                                    if (normalized === '.') {
                                        this.setState({ plusPercent: '0.' });
                                        return;
                                    }
                                    const breakVal = Number(String(this.state.plusBreak || '').replace(/,/g, '').trim());
                                    let pctValue = parseFloat(normalized);
                                    if (isNaN(pctValue)) pctValue = 0;
                                    if (pctValue >= 100) pctValue = 99.99; // % must be less than 100
                                    if (pctValue === 0) {
                                        const originalText = String(this.state.plusOriginalText || '');
                                        const maxUnit = this.parseMaxUnitFromPlusText(originalText);
                                        this.setState({
                                            plusPercent: '0',
                                            plusAsu: '0',
                                            plusRichText: originalText,
                                            plusRichText2: '',
                                            plusBreak: maxUnit === null ? '' : String(maxUnit),
                                        });
                                        return;
                                    }
                                    const pctText = String(pctValue);
                                    if (!isNaN(breakVal) && breakVal > 0) {
                                        let asu = Math.floor((breakVal * pctValue) / 100);
                                        if (asu >= breakVal) asu = Math.max(0, breakVal - 1); // Asu must be less than Break
                                        this.setState({
                                            plusPercent: pctText,
                                            plusAsu: String(asu)
                                        }, () => {
                                            this.runPlusDivisionByAsu(asu, true);
                                        });
                                    } else {
                                        this.setState({ plusPercent: pctText });
                                    }
                                }}
                            />
                            <TextInput
                                style={{
                                    width: 102,
                                    height: 40,
                                    borderWidth: 1,
                                    borderColor: Color.DIVIDERCOLOR,
                                    borderRadius: 6,
                                    paddingHorizontal: 10,
                                    color: '#262626',
                                    marginRight: 6
                                }}
                                keyboardType='decimal-pad'
                                placeholder='အစု'
                                placeholderTextColor={'#777'}
                                value={this.state.plusAsu}
                                onChangeText={(text) => {
                                    const digits = String(text || '').replace(/[^\d]/g, '');
                                    if (digits === '') {
                                        const originalText = String(this.state.plusOriginalText || '');
                                        const maxUnit = this.parseMaxUnitFromPlusText(originalText);
                                        this.setState({
                                            plusAsu: '',
                                            plusPercent: '',
                                            plusRichText: originalText,
                                            plusRichText2: '',
                                            plusBreak: maxUnit === null ? '' : String(maxUnit),
                                        });
                                        return;
                                    }
                                    const breakVal = Number(String(this.state.plusBreak || '').replace(/,/g, '').trim());
                                    let asuInt = parseInt(digits, 10);
                                    if (isNaN(asuInt)) asuInt = 0;
                                    if (asuInt === 0) {
                                        const originalText = String(this.state.plusOriginalText || '');
                                        const maxUnit = this.parseMaxUnitFromPlusText(originalText);
                                        this.setState({
                                            plusAsu: '0',
                                            plusPercent: '0',
                                            plusRichText: originalText,
                                            plusRichText2: '',
                                            plusBreak: maxUnit === null ? '' : String(maxUnit),
                                        });
                                        return;
                                    }
                                    if (!isNaN(breakVal) && breakVal > 0) {
                                        if (asuInt >= breakVal) asuInt = Math.max(0, breakVal - 1); // Asu must be less than Break
                                        let pct = Math.floor((asuInt * 100) / breakVal);
                                        if (pct >= 100) pct = 99; // % must be less than 100
                                        this.setState({
                                            plusAsu: String(asuInt),
                                            plusPercent: String(pct)
                                        }, () => {
                                            this.runPlusDivisionByAsu(asuInt, true);
                                        });
                                    } else {
                                        this.setState({ plusAsu: String(asuInt) });
                                    }
                                }}
                            />
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}
                                onPress={() => this.setState({ plusCombineType: 'sale' })}>
                                <Image source={this.state.plusCombineType == 'sale' ? radio_btn_selected : radio_btn_unselected}
                                    style={{ width: 20, height: 20, marginRight: 4, tintColor: Color.PRIMARYCOLOR }} />
                                <Text style={{ color: '#262626', fontSize: 14 }}>အရောင်း</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <View style={{
                                width: 140,
                                height: 40,
                                borderWidth: 1,
                                borderColor: Color.DIVIDERCOLOR,
                                borderRadius: 6,
                                justifyContent: 'center',
                                marginRight: 6
                            }}>
                                <Picker
                                    mode='dropdown'
                                    selectedValue={this.state.plusUserNo}
                                    style={{ height: 40, width: '100%' }}
                                    onValueChange={(itemValue) => {
                                        let i = this.state.users.findIndex(x => x.UserID == itemValue);
                                        if (i !== -1) {
                                            const dc = this.state.type == '2D' ? this.state.users[i].Discount2D : this.state.users[i].Discount3D;
                                            this.setState({
                                                plusUserNo: itemValue,
                                                plusCommission: String(dc == null ? '' : dc)
                                            });
                                        } else {
                                            this.setState({
                                                plusUserNo: itemValue,
                                                plusCommission: ''
                                            });
                                        }
                                    }}>
                                    <Picker.Item label={'ထိုးသား​ရွေး'} value={'NoUser'} />
                                    {this.renderUsers()}
                                </Picker>
                            </View>
                            <TextInput
                                style={{
                                    width: 50,
                                    height: 40,
                                    borderWidth: 1,
                                    borderColor: Color.DIVIDERCOLOR,
                                    borderRadius: 6,
                                    paddingHorizontal: 10,
                                    color: '#262626',
                                    marginRight: 6
                                }}
                                keyboardType='decimal-pad'
                                placeholder='ကော်'
                                placeholderTextColor={'#777'}
                                value={this.state.plusCommission}
                                onChangeText={(text) => this.setState({ plusCommission: text })}
                            />
                            <TouchableOpacity
                                disabled={this.state.loading}
                                style={{
                                    height: 40,
                                    paddingHorizontal: 22,
                                    borderRadius: 6,
                                    backgroundColor: this.state.loading ? '#7aa8ff' : Color.PRIMARYCOLOR,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={() => this.combinePlusPercentage()}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {this.state.loading && this.state.plusCombineLoadingTarget === 'plus' && (
                                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
                                    )}
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Roboto-Bold' }}>
                                        {this.state.loading && this.state.plusCombineLoadingTarget === 'plus' ? 'Loading...' : '+'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}
                                onPress={() => this.setState({ plusCombineType: 'buy' })}>
                                <Image source={this.state.plusCombineType == 'buy' ? radio_btn_selected : radio_btn_unselected}
                                    style={{ width: 20, height: 20, marginRight: 4, tintColor: Color.PRIMARYCOLOR }} />
                                <Text style={{ color: '#262626', fontSize: 14 }}>အဝယ်</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: '#262626', fontSize: 14, marginBottom: 10, fontFamily: 'Roboto-Bold' }}>
                            {`Total=${numeral(summary2.total).format('0,0')}(${summary2.pct}%) , Break=${numeral(summary2.max).format('0,0')}`}
                        </Text>
                        <View style={{ borderWidth: 1, borderColor: Color.DIVIDERCOLOR, borderRadius: 6 }}>
                            <TextInput
                                style={{
                                    minHeight: 220,
                                    maxHeight: 320,
                                    padding: 10,
                                    color: '#262626',
                                    fontSize: 15,
                                    textAlignVertical: 'top'
                                }}
                                multiline
                                scrollEnabled={true}
                                underlineColorAndroid="transparent"
                                value={this.state.plusRichText2}
                                onChangeText={(text) => this.setState({ plusRichText2: text })}
                            />
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        )
    }
    renderHeader() {
        return (
            <View style={{
                width: width,
                height: 58,
                backgroundColor: Color.PRIMARYCOLOR,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <TouchableOpacity style={{
                    marginHorizontal: 10
                }} onPress={() => {
                    this.props.navigation.goBack()
                }}>
                    <Image source={backIcon} style={{
                        width: 30,
                        height: 30,
                        tintColor: '#fff'
                    }} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 12, marginLeft: 5 }}>
                        {config.AppName || 'App'}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 18, marginLeft: 5, }}>
                        {word[this.props.navigation.state.params.lg].ledger}
                    </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}
                                onPress={() => {
                                    const next = !this.state.showHeader;
                                    this.setState({ showHeader: next, loading: true }, () => {
                                        if (next) {
                                            this.getTermDetailsAll();
                                        } else {
                                            this.APITermDetailByDate();
                                        }
                                    });
                                }}
                            >
                                <Image
                                    source={this.state.showHeader ? tickIcon : untickIcon}
                                    style={{ width: 22, height: 22, marginRight: 6 }}
                                />
                                <Text style={{ color: '#fff', fontSize: 14 }}>Show</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    marginRight: 10,
                                    paddingHorizontal: 14,
                                    paddingVertical: 9,
                                    backgroundColor: '#fff',
                                    borderRadius: 18,
                                }}
                                onPress={() => {
                                    if (this.state.termId == 'NoTerm') {
                                        Alert.alert(config.AppName, 'Please choose term!')
                                        return;
                                    }
                                    this.openPlusPercentageModal();
                                }}
                            >
                                <Text style={{ color: Color.PRIMARYCOLOR, fontSize: 15, fontFamily: 'Roboto-Bold' }}>+(%)</Text>
                            </TouchableOpacity>
                            {this.state.liveapi && (
                                <TouchableOpacity
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 25,
                                        backgroundColor: '#fff',
                                        borderRadius: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        if (this.state.termId == 'NoTerm') {
                                            Alert.alert(config.AppName, 'Please choose term!')
                                        } else {
                                            let i = this.state.terms.findIndex(x => x.TermDetailID == this.state.termId);
                                            console.log(this.state.terms[i])
                                            if (this.state.terms[i].LottType == '2D') {
                                                this.setState({
                                                    showLogin:true,
                                                })
                                                
                                            } else {
                                                Alert.alert(config.AppName, 'Please choose 2D term!')
                                            }

                                        }
                                    }}>
                                    <Text style={{ color: Color.PRIMARYCOLOR, fontSize: 16, marginLeft: 5, fontFamily: 'Roboto-Bold' }}>
                                       NUM
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                </View>
            </View>
        )
    }
    renderButtons() {
        return (
            <View style={{ flexDirection: 'row', marginVertical: 5, alignItems: 'center', justifyContent: 'space-evenly', marginHorizontal: 10 }}>
                <TouchableOpacity
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height: 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={async () => {

                        if (this.state.termId == 'NoTerm') {
                            Alert.alert(config.AppName, 'Please choose the term!')
                            return;
                        }
                        let temp = this.state.data.filter(d => d.Extra != 0)
                        // if(temp.length==0){
                        //     Alert.alert(config.AppName,'No Extra Numbers!')
                        //     return;
                        // }
                        this.setState({
                            loading: true,
                            extra: temp.length > 0 ? true : false
                        })
                        dal.getUsers(this.props.navigation.state.params.endpoint, (err, resp) => {
                            if (err) {
                                this.setState({
                                    loading: false
                                })
                            } else {
                                console.log(resp)
                                if (resp && resp.Status == 'OK' && resp.Data.length) {
                                    this.setState({
                                        users: resp.Data,
                                        loading: false,
                                        isBuy: true
                                    })
                                } else {
                                    this.setState({
                                        users: [],
                                        loading: false
                                    })
                                }
                            }
                        })
                    }}>
                    <Text style={{ color: '#fff', fontSize: 18, marginLeft: 5, fontFamily: 'Roboto-Bold' }}>
                        BUY
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height: 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        if (this.state.termId == 'NoTerm') {
                            Alert.alert(config.AppName, 'Please choose term!')
                        } else {
                            this.setState({
                                loading: true
                            }, () => {
                                this.getHotList()
                            })
                        }
                    }}>
                    <Text style={{ color: '#fff', fontSize: 18, marginLeft: 5, fontFamily: 'Roboto-Bold' }}>
                        HOT
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height: 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {

                        if (this.state.termId == 'NoTerm') {
                            Alert.alert(config.AppName, 'Please choose the term!')
                            return;
                        }
                        //let temp=this.state.data.filter(d=>d.Extra!=0)
                        // if(temp.length==0){
                        //     Alert.alert(config.AppName,'No Extra Numbers!')
                        //     return;
                        // }
                        this.setState({ loading: true })
                        dal.getUsers(this.props.navigation.state.params.endpoint, (err, resp) => {
                            if (err) {
                                this.setState({
                                    loading: false
                                })
                            } else {
                                console.log(resp)
                                if (resp && resp.Status == 'OK' && resp.Data.length) {
                                    Clipboard.getString().then((clipText) => {
                                        this.setState({
                                            users: resp.Data,
                                            loading: false,
                                            isCombineLdg: true,
                                            bodyldg: clipText || ''
                                        })
                                    }).catch(() => {
                                        this.setState({
                                            users: resp.Data,
                                            loading: false,
                                            isCombineLdg: true
                                        })
                                    })
                                } else {
                                    this.setState({
                                        users: [],
                                        loading: false
                                    })
                                }
                            }
                        })
                    }}>
                    <Text style={{ color: '#fff', fontSize: 18, marginLeft: 0, fontFamily: 'Roboto-Bold' }}>
                        +
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height: 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        if (this.state.termId == 'NoTerm') {
                            Alert.alert(config.AppName, 'Please choose the term!')
                            return;
                        }
                        Alert.alert('CUT', 'Please choose th button!',
                            [
                                {
                                    text: 'VIEW',
                                    onPress: () => {
                                        let i = this.state.terms.findIndex(x => x.TermDetailID == this.state.termId);
                                        if (i != -1) {
                                            this.props.navigation.navigate('CutView', {
                                                termId: this.state.termId,
                                                type: this.state.type,
                                                name: this.state.terms[i].Name,
                                                endpoint: this.props.navigation.state.params.endpoint,
                                                lg: this.props.navigation.state.params.lg
                                            })
                                        }
                                    }
                                },
                                {
                                    text: 'DOT',
                                    onPress: () => {
                                        let i = this.state.terms.findIndex(x => x.TermDetailID == this.state.termId);
                                        if (i != -1) {
                                            this.props.navigation.navigate('CutDot', {
                                                termId: this.state.termId,
                                                type: this.state.type,
                                                name: this.state.terms[i].Name,
                                                endpoint: this.props.navigation.state.params.endpoint,
                                                lg: this.props.navigation.state.params.lg
                                            })
                                        }

                                    }
                                },
                                {
                                    text: 'OPTION',
                                    onPress: () => {
                                        this.props.navigation.navigate('CutOption',
                                            {
                                                termId: this.state.termId,
                                                endpoint: this.props.navigation.state.params.endpoint,
                                                lg: this.props.navigation.state.params.lg
                                            })
                                    }
                                },
                            ],
                            {
                                cancelable: true
                            })
                    }}>
                    <Text style={{ color: '#fff', fontSize: 18, marginLeft: 5, fontFamily: 'Roboto-Bold' }}>
                        CUT
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        paddingVertical: 5,
                        paddingHorizontal: 15,
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height: 40,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        this.setState({
                            loading: true,
                        }, () => {
                             if (this.state.filterVBreak) {
                                    this.getLedgerListByvBreak(this.state.type)
                                } else {
                                    this.getLedgerList(this.state.type)
                                }
                            
                        })
                    }}>
                    <Image source={refreshIcon} style={{ width: 30, height: 30, tintColor: '#fff' }} />
                </TouchableOpacity>
            </View>
        )
    }
    renderHotList() {
        return this.state.hots.map((value, index) => {
            return (
                <View style={{
                    width: '100%',
                    height: 40,
                    borderTopWidth: 1,
                    borderBottomWidth: 0.5,
                    borderLeftWidth: 0.5,
                    borderRightWidth: 0.5,
                    borderColor: Color.DIVIDERCOLOR,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row'
                }}>
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>

                    <TouchableOpacity style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onPress={() => {

                    this.setState({
                        loading: true
                    }, () => {
                        this.APISlipDetail(this.state.termId, value.Num)
                        this.APISlipDetailTime(this.state.termId, value.Num)
                    })
                }}>
                   <Text style={{
                            fontFamily: 'Roboto-Bold',
                            fontSize: 16,
                            padding:10,
                            textAlign: 'center'
                        }}>
                            {value.TotalUnit === undefined ? `${value.Num}=0` : `${value.Num}=${value.TotalUnit}`}
                        </Text>
                </TouchableOpacity>

                        
                    </View>
                    <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                        Alert.alert(value.Num, 'Are you sure you want to delete?',
                            [
                                {
                                    text: 'Delet',
                                    onPress: () => {
                                        dal.deleteHotNum(this.props.navigation.state.params.endpoint, this.state.termId, value.Num, (err, resp) => {
                                            if (err) {
                                                Alert.alert(config.AppName, 'Something went wrong!')
                                            } else {
                                                if (resp == 'OK' || resp?.Status == 'OK'||resp?.Status=='\n ေဟာ့ဂဏန္း မရိွေသးပါ။ \n' || resp === true) {
                                                    this.getHotList()
                                                } else {
                                                    Alert.alert(config.AppName, 'Error in deleting!')
                                                }
                                            }
                                        })
                                    }
                                },
                                {
                                    text: 'Cancel',
                                }
                            ],
                            {
                                cancelable: true
                            }
                        )
                    }}>
                        <Image source={deleteIcon} style={{ width: 25, height: 25, tintColor: 'red' }} />
                    </TouchableOpacity>
                </View>
            )
        })
    }
    renderHotModal() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isHot}
                onRequestClose={() => {
                    this.setState({
                        isHot: false,
                        hots: []
                    })
                }}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                >
                <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', backgroundColor: '#11030085', paddingRight: 8 }}>
                    <View style={{ backgroundColor: '#fff', alignItems: 'center', width: width * 0.42, borderRadius: 5, padding: 10, marginVertical: 50, alignSelf: 'flex-end', marginRight: 0 }}>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <View style={{ width: '100%', marginVertical: 10 }}>
                                <View style={{ width: '100%' }}>
                                    <TextInput
                                        style={{
                                            width: '100%',
                                            paddingVertical: 7,
                                            height: 90,
                                            borderWidth: 1,
                                            borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                            borderRadius: 5,
                                            textAlignVertical: 'top'
                                        }}
                                        placeholder={'Hot Num'}
                                        underlineColorAndroid='transparent'
                                        multiline
                                        scrollEnabled={true}
                                        value={this.state.hotnum}
                                        onChangeText={(text) => {
                                            this.setState({
                                                hotnum: text
                                            })
                                        }}
                                    />
                                </View>
                                <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
                                    <TouchableOpacity style={{
                                        width: 120, backgroundColor: Color.PRIMARYCOLOR,
                                        alignItems: 'center', justifyContent: 'center', borderRadius: 5, height: 40
                                    }}
                                        onPress={() => {
                                            const hotNumPayload = String(this.state.hotnum || '')
                                                .split(/\r?\n/)
                                                .map(x => String(x || '').trim())
                                                .filter(x => x.length > 0)
                                                .join(',')
                                                .toUpperCase();
                                            dal.saveHotNum(this.props.navigation.state.params.endpoint, this.state.termId, this.state.type, hotNumPayload, (err, resp) => {
                                                if (err) {
                                                    Alert.alert(config.AppName, 'Something went wrong!')
                                                } else {
                                                    if (resp.Status == 'OK') {
                                                        this.getHotList()

                                                    } else {
                                                        Alert.alert(config.AppName, 'Error in saving!')
                                                    }
                                                }
                                            })
                                        }}>
                                        <Text style={{ color: '#fff' }}>
                                            ADD
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                        <View style={{ width: '100%', maxHeight: height * 0.35, marginTop: 4 }}>
                            <ScrollView
                                style={{ width: '100%' }}
                                contentContainerStyle={{ paddingBottom: 6 }}
                                showsVerticalScrollIndicator={true}
                            >
                                {this.renderHotList()}
                            </ScrollView>
                        </View>

                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginVertical: 10
                            }}>
                                
                                <TouchableOpacity style={{
                                    width: '48%', backgroundColor: Color.PRIMARYCOLOR,
                                    alignItems: 'center', justifyContent: 'center', borderRadius: 5, height: 40
                                }}
                                    onPress={() => {
                                        dal.saveHotNumAll(this.props.navigation.state.params.endpoint, this.state.hots, this.state.termId, (err, resp) => {
                                            console.warn("Resp=======>", resp)
                                            if (err) {
                                                Alert.alert(config.AppName, 'Something went wrong!')
                                            } else {
                                                if (resp == 'OK' || resp.Status == 'OK') {
                                                    console.warn('saved all hot nums=====')
                                                    Alert.alert(config.AppName, 'All Hot Numbers Saved!')

                                                } else {
                                                    Alert.alert(config.AppName, 'Error in saving!')
                                                }
                                            }
                                        })
                                    }}>
                                    <Text style={{ color: '#fff' }}>
                                        Save All
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    width: '48%', backgroundColor: Color.PRIMARYCOLOR,
                                    alignItems: 'center', justifyContent: 'center', borderRadius: 5, height: 40,
                                    marginLeft: 10
                                }}
                                    onPress={() => {
                                        const list = (this.state.hots || []);
                                        if (!list.length) {
                                            Alert.alert(config.AppName, 'No Hot Numbers');
                                            return;
                                        }
                                        const msg = list.map(d => `${d.Num}`).join('\n');
                                        Clipboard.setString(msg);
                                        Share.share({ message: msg });
                                    }}>
                                    <Text style={{ color: '#fff' }}>
                                        Copy
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={{
                                width: '100%',
                                backgroundColor: '#d32f2f',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 5,
                                height: 40,
                                marginBottom: 8
                            }}
                                onPress={() => {
                                    Alert.alert(config.AppName, 'Delete all hot numbers?', [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'OK',
                                            onPress: () => {
                                                dal.deleteAllHotNum(
                                                    this.props.navigation.state.params.endpoint,
                                                    this.state.termId,
                                                    (err, resp) => {
                                                        if (err) {
                                                            Alert.alert(config.AppName, 'Something went wrong!')
                                                        } else if (resp == 'OK' || resp?.Status == 'OK'||resp?.Status=='\n ေဟာ့ဂဏန္း မရိွေသးပါ။ \n' || resp === true) {
                                                            //Alert.alert(config.AppName, 'Deleted all hot numbers!')
                                                            this.getHotList()
                                                        } else {
                                                            Alert.alert(config.AppName, 'Error in deleting!')
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    ])
                                }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                    DELETE ALL
                                </Text>
                            </TouchableOpacity>

                        </View>



                    </View>
                </View>
                </KeyboardAvoidingView>
            </Modal>
        )
    }
    renderLoginModal() {
        return (
            <Modal
                transparent={true}
                visible={this.state.showLogin}
                onRequestClose={() => {
                    this.setState({
                        showLogin: false,
                        isLogin: true,
                        password: '',
                        oldPassword: "",
                        confirmPassword: ''
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: '#fff', alignItems: 'center', width: width * 0.8, borderRadius: 5, padding: 10, marginVertical: 50 }}>
                        <View style={{ width: width * 0.8, alignItems: 'center', padding: 16 }}>
                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 5,
                                marginTop: 10,
                                marginBottom: 25,
                                justifyContent: 'center'
                            }}>
                                <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({
                                            isLogin: true
                                        })
                                    }}>
                                    <Image source={this.state.isLogin ? radio_btn_selected : radio_btn_unselected}
                                        style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                    <Text style={{ color: '#262626', fontSize: 16 }}>
                                        Login
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({
                                            isLogin: false
                                        })
                                    }}>
                                    <Image source={!this.state.isLogin ? radio_btn_selected : radio_btn_unselected}
                                        style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                    <Text style={{ color: '#262626', fontSize: 16, }}>
                                        Change
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {
                                this.state.isLogin ?
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginVertical: 10
                                    }}>
                                        <TextInput
                                            style={{
                                                width: (width * 0.8) - 32,
                                                paddingVertical: 7,
                                                height: 40,
                                                borderWidth: 1,
                                                borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                                borderRadius: 5,
                                                marginRight: 5
                                            }}
                                            placeholder={'Password'}
                                            secureTextEntry
                                            underlineColorAndroid='transparent'
                                            value={this.state.password}
                                            onChangeText={(text) => {
                                                this.setState({
                                                    password: text
                                                })

                                            }}
                                        />
                                    </View>
                                    :
                                    <>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginVertical: 10
                                        }}>
                                            <TextInput
                                                style={{
                                                    width: (width * 0.8) - 32,
                                                    paddingVertical: 7,
                                                    height: 40,
                                                    borderWidth: 1,
                                                    borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                                    borderRadius: 5,
                                                    marginRight: 5
                                                }}
                                                placeholder={'Old Password'}
                                                secureTextEntry
                                                underlineColorAndroid='transparent'
                                                value={this.state.oldPassword}
                                                onChangeText={(text) => {
                                                    this.setState({
                                                        oldPassword: text
                                                    })
    
                                                }}
                                            />
                                        </View>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginVertical: 10
                                        }}>
                                            <TextInput
                                                style={{
                                                    width: (width * 0.8) - 32,
                                                    paddingVertical: 7,
                                                    height: 40,
                                                    borderWidth: 1,
                                                    borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                                    borderRadius: 5,
                                                    marginRight: 5
                                                }}
                                                placeholder={'New Password'}
                                                secureTextEntry
                                                underlineColorAndroid='transparent'
                                                value={this.state.confirmPassword}
                                                onChangeText={(text) => {
                                                    this.setState({
                                                        confirmPassword: text
                                                    })
    
                                                }}
                                            />
                                        </View>
                                    </>
                            }

                            <TouchableOpacity style={{
                                width: (width * 0.4) - 50, backgroundColor: Color.PRIMARYCOLOR,
                                alignItems: 'center', justifyContent: 'center', borderRadius: 5, height: 40
                            }}
                                onPress={async() => {

                                    const password=await AsyncStorage.getItem('__password__')||'100200'
                                    if(this.state.isLogin&&password==this.state.password){
                                        this.setState({
                                            loading: true,
                                            showLogin: false,
                                            password: this.state.confirmPassword,
                                            oldPassword: "",
                                            confirmPassword: ''
                                        }, () => {
                                            this.get_predefined_today_terms()
                                        })
                                    }else if(this.state.isLogin&&password!=this.state.password){
                                        Alert.alert(config.AppName, 'Invalid password!')
                                    }else if(!this.state.isLogin&&this.state.oldPassword==password&&this.state.confirmPassword!=''){
                                        AsyncStorage.setItem('__password__',this.state.confirmPassword)
                                        this.setState({
                                            isLogin: true,
                                            password: this.state.confirmPassword,
                                            oldPassword: "",
                                            confirmPassword: ''
                                        })
                                    }else if(!this.state.isLogin&&this.state.oldPassword!=password&&this.state.confirmPassword!=''){
                                        Alert.alert(config.AppName, 'Invalid password!')
                                    }
                                    else{
                                        Alert.alert(config.AppName, 'Invalid password!')
                                        return;
                                    }
                                }}>
                                <Text>
                                    {this.state.isLogin?'Login':'Change'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    renderUsers() {
        return this.state.users.map((value, index) => {
            return (
                <Picker.Item label={value.UserNo} value={value.UserID} key={index} />
            )
        })
    }
    renderOtherTerms() {
        return this.state.termsFromOther.map((value, index) => {
            return (
                <Picker.Item label={value.Name} value={value.TermDetailID} key={index} />
            )
        })
    }
    renderDirectBuyModal() {
        return (
            <Modal
                transparent={true}
                visible={this.state.showDirectBuyModal}
                onRequestClose={() => {
                    this.setState({
                        showDirectBuyModal: false,
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: '#fff', alignItems: 'center', width: width * 0.8, borderRadius: 5, padding: 10 }}>
                        <View style={{ width: width * 0.8, alignItems: 'center', padding: 15 }}>
                            <View style={{
                                width: ((width * 0.8) - 30), height: 40, justifyContent: 'center',
                                borderWidth: 1, borderColor: Color.DARKPRIMARYTEXTCOLOR, borderRadius: 5,
                            }}>
                                <Picker
                                    mode='dropdown'
                                    selectedValue={this.state.termIdForOther}
                                    style={{ height: 40, width: ((width * 0.8) - 30) }}
                                    onValueChange={(itemValue, itemIndex) => {
                                        let i = this.state.termsFromOther.findIndex(x => x.TermDetailID == itemValue);
                                        if (i !== -1) {
                                            this.setState({
                                                termIdForOther: itemValue,
                                                otherLottType: this.state.termsFromOther[i].LottType
                                            }, () => this.getHotListForOther(itemValue))
                                        } else {
                                            this.setState({
                                                termIdForOther: null,
                                                otherLottType: '2D',
                                                otherHots: []
                                            })
                                        }
                                    }}>
                                    <Picker.Item label={'Select Term'} value={null} />
                                    {this.renderOtherTerms()}
                                </Picker>
                            </View>

                            {this.state.otherHots.length > 0 && (
                                <View style={{ marginTop: 8, width: ((width * 0.8) - 30) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <Text style={{ color: '#262626', fontSize: 12, fontWeight: 'bold', flex: 1 }}>
                                            Hot Numbers
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => this.getHotListForOther(this.state.termIdForOther)}
                                            style={{ padding: 6 }}
                                        >
                                            <Image source={refreshIcon} style={{ width: 26, height: 26, tintColor: Color.Green }} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {this.state.otherHots.map((x, idx) => (
                                            <View
                                                key={`${x.Num || ''}-${idx}`}
                                                style={{
                                                    paddingVertical: 4,
                                                    paddingHorizontal: 8,
                                                    borderWidth: 1,
                                                    borderColor: Color.DIVIDERCOLOR,
                                                    borderRadius: 4,
                                                    marginRight: 6,
                                                    marginBottom: 6,
                                                    backgroundColor: '#f7f7f7',
                                                }}
                                            >
                                                <Text style={{ fontSize: 12, color: '#262626', fontWeight: 'bold' }}>
                                                    {x.Num}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10
                            }}>
                                <Text style={{ color: '#262626', fontSize: 16, marginRight: 10 }}>
                                    {word[this.props.navigation.state.params.lg].user}
                                </Text>
                                <View style={{
                                    flexDirection: 'row',
                                    marginBottom: 10,
                                    flex: 1
                                }}>
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            paddingVertical: 7,
                                            height: 40,
                                            borderWidth: 1,
                                            borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                            borderRadius: 5,
                                            marginRight: 5,
                                            textAlign: 'center',
                                            color: '#262626'
                                        }}
                                        placeholder={'Hot Num'}
                                        keyboardType='decimal-pad'
                                        underlineColorAndroid='transparent'
                                        value={this.state.otherInfo ? this.state.otherInfo.UserNo : ''}
                                        editable={false}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={{
                                paddingHorizontal: 30,
                                paddingVertical: 10,
                                marginTop: 20,
                                backgroundColor: Color.PRIMARYCOLOR,
                                borderRadius: 10
                            }} onPress={() => {
                                if (this.state.otherLottType != this.state.type) {
                                    Alert.alert(config.AppName, 'Invalid term details!')
                                    return;
                                }
                                if (this.state.termIdForOther) {
                                    if (this.state.showDownload || !this.state.extra) {
                                        this.downloadSlipFromOther()
                                    } else {
                                        this.saveSliptoOther()
                                    }
                                } else {
                                    Alert.alert(config.AppName, 'Please select the term!')
                                    return;
                                }

                            }}>
                                <Text style={{ color: '#262626', fontSize: 16, }}>
                                    {this.state.showDownload || !this.state.extra ? 'Download' : 'Save'}
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    get3DWinNumList() {
        if (!this.state.liveapi) {
            this.setState({ win3DList: [] })
            return;
        }
        dal.get3DWinNumList(this.state.liveapi, (err, resp) => {
            if (err) {
                this.setState({ win3DList: [] })
            } else {
                if (resp && resp.Status == 'OK' && resp.Data && resp.Data.length) {
                    this.setState({ win3DList: resp.Data })
                } else {
                    this.setState({ win3DList: [] })
                }
            }
        })
    }

    load3DMeta() {
        if (!this.state.liveapi) {
            return;
        }
        const extractValue = (resp, keys) => {
            let r = resp;
            if (typeof r === 'string') {
                try { r = JSON.parse(r); } catch (e) {}
            }
            if (r && r.Status == 'OK' && r.Data !== undefined) {
                const d = Array.isArray(r.Data) ? r.Data[0] : r.Data;
                if (d && typeof d === 'object') {
                    for (let k of keys) {
                        if (d[k] !== undefined && d[k] !== null) return d[k];
                    }
                }
                return d;
            }
            return r;
        };
        dal.getIndex3D(this.state.liveapi, (err, resp) => {
            if (err) return;
            const v = extractValue(resp, ['Index3D', 'Index', 'Value', 'WinNum']);
            if (v !== undefined && v !== null) {
                this.setState({ index3D: String(v) })
            }
        })
        dal.getWinNum3D(this.state.liveapi, (err, resp) => {
            if (err) return;
            const v = extractValue(resp, ['WinNum', 'Value', 'Index3D', 'Index']);
            if (v !== undefined && v !== null) {
                this.setState({ winNum3D: String(v) })
            }
        })
    }

    render3DModal() {
        if (this.state.show3DModal && !this.state.loaded3DMeta) {
            this.setState({ loaded3DMeta: true }, () => {
                this.load3DMeta()
            })
        }
        return (
            <Modal
                transparent={true}
                visible={this.state.show3DModal}
                onRequestClose={() => {
                    this.setState({ show3DModal: false, loaded3DMeta: false })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: '#fff', alignItems: 'center', width: width * 0.9, borderRadius: 8, padding: 15 }}>
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <Text style={{ width: 80, fontSize: 16, color: '#262626' }}>Date</Text>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        borderWidth: 1,
                                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                        borderRadius: 5,
                                        justifyContent: 'center',
                                        paddingHorizontal: 10
                                    }}
                                    onPress={() => this.setState({ showDatePicker3D: true })}
                                >
                                    <Text style={{ color: '#262626' }}>
                                        {moment(this.state.date3D).format('DD/MM/YYYY hh:mm:ss A')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <Text style={{ width: 80, fontSize: 16, color: '#262626' }}>Index</Text>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        borderWidth: 1,
                                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                        borderRadius: 5,
                                        paddingHorizontal: 10,
                                        color: '#262626'
                                    }}
                                    value={this.state.index3D}
                                    onChangeText={(text) => this.setState({ index3D: text })}
                                />
                                <TouchableOpacity
                                    style={{
                                        marginLeft: 8,
                                        width: 90,
                                        height: 40,
                                        backgroundColor: Color.PRIMARYCOLOR,
                                        borderRadius: 5,
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        if (!this.state.index3D) {
                                            Alert.alert(config.AppName, 'Please enter Index!')
                                            return;
                                        }
                                        if (!this.state.liveapi) {
                                            Alert.alert(config.AppName, 'Live API not set!')
                                            return;
                                        }
                                        dal.getIndex3DSave(this.state.liveapi, this.state.index3D, (err, resp) => {
                                            if (err) {
                                                Alert.alert(config.AppName, 'Something went wrong!')
                                                return;
                                            }
                                            let r = resp;
                                            if (typeof r === 'string') {
                                                try { r = JSON.parse(r); } catch (e) {}
                                            }
                                            if (r === true || r === 'OK' || r?.Status === 'OK' || r?.Msg === 'OK') {
                                                Alert.alert(config.AppName, 'Change OK')
                                            } else {
                                                Alert.alert(config.AppName, 'Error in saving!')
                                            }
                                        })
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Change</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ width: 80, fontSize: 16, color: '#262626' }}>Win Num</Text>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        borderWidth: 1,
                                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                        borderRadius: 5,
                                        paddingHorizontal: 10,
                                        color: '#262626'
                                    }}
                                    value={this.state.winNum3D}
                                    onChangeText={(text) => this.setState({ winNum3D: text })}
                                />
                                <TouchableOpacity
                                    style={{
                                        marginLeft: 8,
                                        width: 90,
                                        height: 40,
                                        backgroundColor: Color.PRIMARYCOLOR,
                                        borderRadius: 5,
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        if (!this.state.winNum3D) {
                                            Alert.alert(config.AppName, 'Please enter Win Num!')
                                            return;
                                        }
                                        if (!this.state.index3D) {
                                            Alert.alert(config.AppName, 'Please enter Index!')
                                            return;
                                        }
                                        if (!this.state.liveapi) {
                                            Alert.alert(config.AppName, 'Live API not set!')
                                            return;
                                        }
                                        const resultDate = moment(this.state.date3D).format('YYYY-MM-DD HH:mm:ss');
                                        dal.getWinNum3DSave(
                                            this.state.liveapi,
                                            this.state.index3D,
                                            this.state.winNum3D,
                                            resultDate,
                                            (err, resp) => {
                                                if (err) {
                                                    Alert.alert(config.AppName, 'Something went wrong!')
                                                    return;
                                                }
                                                let r = resp;
                                                if (typeof r === 'string') {
                                                    try { r = JSON.parse(r); } catch (e) {}
                                                }
                                                if (r === true || r === 'OK' || r?.Status === 'OK' || r?.Msg === 'OK') {
                                                    Alert.alert(config.AppName, `Save OK!\nWin Num= ${this.state.winNum3D}`)
                                                    this.setState({ show3DModal: false, loaded3DMeta: false })
                                                    this.get3DWinNumList()
                                                } else {
                                                    Alert.alert(config.AppName, 'Error in saving!')
                                                }
                                            }
                                        )
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Save</Text>
                                </TouchableOpacity>
                            </View>

                            {this.state.win3DList.length > 0 && (
                                <View style={{ marginTop: 16, maxHeight: height * 0.45 }}>
                                    <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                        <Text style={{ flex: 2, fontWeight: 'bold', color: '#262626' }}>ResultDate</Text>
                                        <Text style={{ flex: 1, fontWeight: 'bold', color: '#262626', textAlign: 'center' }}>SET</Text>
                                        {/* Value column hidden */}
                                        <Text style={{ flex: 2, fontWeight: 'bold', color: '#262626', textAlign: 'center' }}>WinNum</Text>
                                    </View>
                                    <ScrollView>
                                        {this.state.win3DList.map((item, idx) => (
                                            <View key={`${item.ResultDate || ''}-${idx}`} style={{ flexDirection: 'row', marginBottom: 4, alignItems: 'center', borderWidth: 1, borderColor: Color.DIVIDERCOLOR, paddingVertical: 4 }}>
                                                <Text style={{ flex: 2, color: '#262626' }}>
                                                    {item.ResultDate ? moment(item.ResultDate).format('DD/MM/YYYY') : ''}
                                                    {'\n'}
                                                    {item.ResultDate ? moment(item.ResultDate).format('hh:mm:ss A') : ''}
                                                </Text>
                                                <Text style={{ flex: 1, color: '#262626', fontSize: 12, textAlign: 'center' }} numberOfLines={1} ellipsizeMode="tail">
                                                    {item.SetD ?? item.SET ?? item.Set ?? ''}
                                                </Text>
                                                {/* Value column hidden */}
                                                <Text style={{ flex: 2, color: '#262626', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }} numberOfLines={1} ellipsizeMode="tail">
                                                    {item.WinNum ?? ''}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {this.state.showDatePicker3D && (
                    <DateTimePicker
                        value={this.state.date3D || new Date()}
                        mode={Platform.OS === 'android' ? 'date' : 'datetime'}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        is24Hour={false}
                        onChange={(event, selectedDate) => {
                            if (event.type === 'dismissed') {
                                this.setState({ showDatePicker3D: false })
                                return;
                            }
                            if (Platform.OS === 'android') {
                                const d = selectedDate || this.state.date3D;
                                this.setState({
                                    date3D: d,
                                    showDatePicker3D: false,
                                    showTimePicker3D: true
                                });
                            } else {
                                this.setState({
                                    date3D: selectedDate || this.state.date3D,
                                    showDatePicker3D: false
                                })
                            }
                        }}
                    />
                )}
                {this.state.showTimePicker3D && (
                    <DateTimePicker
                        value={this.state.date3D || new Date()}
                        mode="time"
                        display="default"
                        is24Hour={false}
                        onChange={(event, selectedDate) => {
                            if (event.type === 'dismissed') {
                                this.setState({ showTimePicker3D: false })
                                return;
                            }
                            const d = selectedDate || this.state.date3D;
                            d.setSeconds(0);
                            d.setMilliseconds(0);
                            this.setState({
                                date3D: d,
                                showTimePicker3D: false
                            })
                            this.save3DTimePref(d)
                        }}
                    />
                )}
            </Modal>
        )
    }
    renderBuyModal() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isBuy}
                onRequestClose={() => {
                    this.setState({
                        isBuy: false,
                        users: [],
                        buyType: 'm',
                        userNo: 'NoUser'
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: '#fff', alignItems: 'center', width: width * 0.8, borderRadius: 5, padding: 10 }}>
                        <View style={{ width: width * 0.8, alignItems: 'center', padding: 15 }}>
                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 5,
                                marginTop: 10,
                                marginBottom: 25,
                                justifyContent: 'center'
                            }}>
                                <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({
                                            buyType: 'm'
                                        })
                                    }}>
                                    <Image source={this.state.buyType == 'm' ? radio_btn_selected : radio_btn_unselected}
                                        style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                    <Text style={{ color: '#262626', fontSize: 16 }}>
                                        {word[this.props.navigation.state.params.lg].money}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({
                                            buyType: '25'
                                        })
                                    }}>
                                    <Image source={this.state.buyType == '25' ? radio_btn_selected : radio_btn_unselected}
                                        style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                    <Text style={{ color: '#262626', fontSize: 16, }}>
                                        25
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({
                                            buyType: '100'
                                        })
                                    }}>
                                    <Image source={this.state.buyType == '100' ? radio_btn_selected : radio_btn_unselected}
                                        style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                    <Text style={{ color: '#262626', fontSize: 16, }}>
                                        100
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                width: ((width * 0.8) - 30), height: 40, justifyContent: 'center',
                                borderWidth: 1, borderColor: Color.DARKPRIMARYTEXTCOLOR, borderRadius: 5,
                            }}>
                                <Picker
                                    mode='dropdown'
                                    selectedValue={this.state.userNo}
                                    style={{ height: 40, width: ((width * 0.8) - 30) }}
                                    onValueChange={(itemValue, itemIndex) => {
                                        let i = this.state.users.findIndex(x => x.UserID == itemValue);
                                        if (i !== -1) {
                                            this.setState({
                                                userNo: itemValue,
                                                userId: this.state.users[i].UserNo,
                                                discount2D: this.state.users[i].Discount2D,
                                                discount3D: this.state.users[i].Discount3D
                                            })
                                        } else {
                                            this.setState({
                                                userId: itemValue,
                                                userNo: itemValue,
                                                discount2D: 0,
                                                discount3D: 0
                                            })
                                        }

                                    }}>
                                    <Picker.Item label={'Select User'} value={'NoUser'} />
                                    {this.renderUsers()}
                                </Picker>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10
                            }}>
                                <Text style={{ color: '#262626', fontSize: 16, marginRight: 10 }}>
                                    {word[this.props.navigation.state.params.lg].discount}
                                </Text>
                                <View style={{
                                    flexDirection: 'row',
                                    marginBottom: 10,
                                    flex: 1
                                }}>
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            paddingVertical: 7,
                                            height: 40,
                                            borderWidth: 1,
                                            borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                            borderRadius: 5,
                                            marginRight: 5,
                                            textAlign: 'center',
                                            color: '#262626'
                                        }}
                                        placeholder={'Hot Num'}
                                        keyboardType='decimal-pad'
                                        underlineColorAndroid='transparent'
                                        value={this.state.type == '2D' ? this.state.discount2D.toString() : this.state.discount3D.toString()}
                                        editable={false}
                                    />
                                </View>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 20
                            }}>
                                <TouchableOpacity style={{
                                    paddingHorizontal: 30,
                                    paddingVertical: 10,
                                    backgroundColor: Color.PRIMARYCOLOR,
                                    borderRadius: 10
                                }} onPress={() => {
                                    if (this.state.userNo == 'NoUser') {
                                        Alert.alert(config.AppName, 'Please select the user!')
                                        return;
                                    }
                                    this.setState({
                                        isBuy: false,
                                        loading: true
                                    })
                                    let temp = this.state.data.filter(d => d.Extra != 0)
                                    let d = []
                                    temp.map((value, index) => {
                                        let u = this.state.buyType == 'm' ?
                                            (value.Extra * 1) / this.state.unitPrice :
                                            this.state.buyType == '25' ?
                                                (value.Extra * 25) / this.state.unitPrice :
                                                (value.Extra * 100) / this.state.unitPrice
                                        d.push(
                                            {
                                                SaleDetailID: null,
                                                SaleID: null,
                                                Num: value.Num,
                                                Unit: u,
                                                UnitUser: 0,
                                                Summary: value.Num,
                                                Discount: this.state.type == '2D' ? this.state.discount2D : this.state.discount3D,
                                                GroupID: ''
                                            }
                                        )
                                    })
                                    dal.buyNums(this.props.navigation.state.params.endpoint, this.state.userNo, this.state.termId, this.state.userId, d, (err, resp) => {
                                        if (err) {
                                            Alert.alert(config.AppName, 'Something went wrong!')
                                            this.setState({
                                                loading: false,
                                                isBuy: false,
                                                users: [],
                                                buyType: 'm',
                                                userNo: 'NoUser'
                                            })
                                        } else {
                                            if (JSON.parse(resp).Msg == 'OK') {
                                                Alert.alert(config.AppName, 'Buy successfully!')
                                                this.setState({
                                                    loading: false,
                                                    isBuy: false,
                                                    users: [],
                                                    buyType: 'm',
                                                    userNo: 'NoUser'
                                                })
                                                this.getLedgerList(this.state.type)
                                            } else {
                                                Alert.alert(config.AppName, JSON.parse(resp).Msg)
                                                this.setState({
                                                    loading: false,
                                                    isBuy: false,
                                                    users: [],
                                                    buyType: 'm',
                                                    userNo: 'NoUser'
                                                })
                                            }
                                        }
                                    })
                                }}>
                                    <Text style={{ color: '#262626', fontSize: 16, }}>
                                        Buy
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    paddingHorizontal: 30,
                                    paddingVertical: 10,
                                    backgroundColor: Color.PRIMARYCOLOR,
                                    borderRadius: 10,
                                    marginLeft: 10
                                }} onPress={() => {
                                    if (this.state.userNo == 'NoUser') {
                                        Alert.alert(config.AppName, 'Please select the user!')
                                        return;
                                    }
                                    this.setState({
                                        loading: true,
                                        isBuy: false
                                    })
                                    dal.ApiSupplier(this.props.navigation.state.params.endpoint, this.state.userNo, (err, resp) => {
                                        if (err) {
                                            Alert.alert(config.AppName, 'Something went wrong!')
                                            this.setState({
                                                loading: false,
                                            })
                                        } else {
                                            if (resp && resp.UserNo) {
                                                this.setState({
                                                    supplierInfo: resp
                                                }, () => {
                                                    this.getUserFromOther()
                                                })
                                            } else {
                                                Alert.alert(config.AppName, 'Get Supplier Fail!')
                                                this.setState({
                                                    loading: false,
                                                })
                                            }

                                            console.log('ApiSupplier resp ', typeof resp, resp)
                                        }
                                    })
                                }}>
                                    <Text style={{ color: '#262626', fontSize: 16, }}>
                                        {this.state.extra ? "Direct Buy" : 'Download'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    downloadSlipFromOther() {
        this.setState({
            loading: true,
            showDirectBuyModal: false
        })
        dal.downloadSlipFromOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.otherInfo.UserID, this.state.termIdForOther, (err, resp) => {
            if (err) {
                console.log(err)
                Alert.alert(config.AppName, 'Something went wrong!')
                this.setState({
                    loading: false,
                    showDownload: false
                })
            } else {
                console.log('============= downloda downloadSlipFromOther -===========')
                console.log(resp)
                if (resp.Status == 'OK' && resp.Data.length > 0) {
                    this.uploadSlipToServer(resp)
                } else {
                    Alert.alert(config.AppName, resp.Status)
                    this.setState({
                        loading: false,
                        showDownload: false
                    })
                }
            }
        })
    }
    uploadSlipToServer(data) {
        dal.uploadSlipToServer(this.props.navigation.state.params.endpoint, this.state.userNo, this.state.termId, data, (err, resp) => {
            if (err) {
                console.log('uploadSlipToServer err ', err)
                Alert.alert(config.AppName, 'Something went wrong!')
                this.setState({
                    loading: false,
                    showDownload: false
                })
            } else {
                console.log('=============  uploadSlipToServer -===========')
                console.log(resp)
                if (resp == 'OK') {
                    this.downloadSlipDetailsFromOther()
                } else {
                    Alert.alert(config.AppName, resp)
                    this.setState({
                        loading: false,
                        showDownload: false
                    })
                }

                console.log('uploadSlipToServer resp ', typeof resp, resp)
            }
        })
    }
    downloadSlipDetailsFromOther() {
        dal.downloadSlipDetailsFromOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.otherInfo.UserID, this.state.termIdForOther, (err, resp) => {
            if (err) {
                console.log(err)
                Alert.alert(config.AppName, 'Something went wrong!')
                this.setState({
                    loading: false,
                    showDownload: false
                })
            } else {
                console.log('=============  downloadSlipDetailsFromOther -===========')
                console.log(resp)
                if (resp.Status == 'OK' && resp.Data.length > 0) {
                    let data = resp.Data.map((item, index) => {
                        item.Unit = (item.Unit * this.state.supplierInfo.ServerUnit) / this.state.supplierInfo.UserUnit
                        return item;
                    });
                    this.uploadSlipDetailsToServer({ Status: 'OK', Data: data })
                } else {
                    Alert.alert(config.AppName, resp.Status)
                    this.setState({
                        loading: false,
                        showDownload: false
                    })
                }
            }
        })
    }
    uploadSlipDetailsToServer(data) {
        dal.uploadSlipDetailsToServer(this.props.navigation.state.params.endpoint.replace('www.', ''), data, (err, resp) => {
            if (err) {
                console.log('uploadSlipDetailsToServer err ', err)
                Alert.alert(config.AppName, 'Something went wrong!')
                this.setState({
                    loading: false,
                    showDownload: false
                })
            } else {
                console.log('=============  uploadSlipDetailsToServer -===========')
                console.log(resp)
                if (resp == 'OK') {
                    this.setState({
                        loading: false,
                        showDirectBuyModal: false,
                        showDownload: false
                    })
                    Alert.alert(config.AppName, 'Download Successfully!')
                    this.getLedgerList(this.state.type)
                } else {
                    Alert.alert(config.AppName, resp)
                    this.setState({
                        loading: false,
                        showDownload: false
                    })
                }
            }
        })
    }
    saveSliptoOther() {
        let temp = this.state.data.filter(d => d.Extra != 0)
        let d = []
        temp.map((value, index) => {
            let u = Math.ceil((value.Extra * this.state.supplierInfo.UserUnit) / this.state.supplierInfo.ServerUnit)
            d.push(
                {
                    SaleDetailID: null,
                    SaleID: null,
                    Num: value.Num,
                    Unit: u,
                    UnitUser: this.state.supplierInfo.UserUnit,
                    Summary: value.Num,
                    Discount: this.state.otherLottType == '2D' ? this.state.otherInfo.Discount2D : this.state.otherInfo.Discount3D,
                    GroupID: '',
                    Prize:value.Prize
                }
            )
        })
        dal.saveSliptoOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.otherInfo.UserID, this.state.termIdForOther, d, (err, resp) => {
            if (err) {
                console.log(err)
                Alert.alert(config.AppName, 'Something went wrong!')
                this.setState({
                    loading: false,
                })
            } else {
                console.log('=============  saveSliptoOther -===========')
                console.log(resp)
                if (JSON.parse(resp).Msg == 'OK') {
                    Alert.alert(config.AppName, 'Save successfully!')
                    this.setState({
                        loading: false,
                        showDownload: true
                    })
                } else {
                    Alert.alert(config.AppName, JSON.parse(resp).Msg)
                    this.setState({
                        loading: false,
                        showDownload: true
                    })
                }
            }
        })
    }
    getTermsFromOther() {
        dal.getTermsFromOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.otherInfo.UserID, (err, resp) => {
            if (err) {
                console.log(err)
                Alert.alert(config.AppName, 'Something went wrong!')
                this.setState({
                    loading: false,
                })
            } else {
                console.log(resp)
                if (resp.Status == 'OK' && resp.Data.length > 0) {
                    this.setState({
                        termsFromOther: resp.Data,
                        showDirectBuyModal: true
                    })
                } else {
                    Alert.alert(config.AppName, resp.Status)
                    this.setState({
                        loading: false,
                    })
                }
            }
        })
    }
    getUserFromOther() {
        dal.getUserFromOther(this.state.supplierInfo.Website.replace('www.', 'http://luckyapi.'), this.state.supplierInfo.UserNo, this.state.supplierInfo.Password, (err, resp) => {
            if (err) {
                console.log(err)
                Alert.alert(config.AppName, 'Something went wrong!')
                this.setState({
                    loading: false,
                })
            } else {
                console.log(resp)
                if (resp.Status == 'OK' && resp.Data.length > 0) {
                    this.setState({
                        otherInfo: resp.Data[0]
                    }, () => {
                        this.getTermsFromOther()
                    })
                } else {
                    Alert.alert(config.AppName, 'Get User Info Fail!')
                    this.setState({
                        loading: false,
                    })
                }
            }
        })
    }
    renderCombineLdgModal() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isCombineLdg}
                onRequestClose={() => {
                    this.setState({
                        isCombineLdg: false,
                        users: [],
                        buyType: 'm',
                        userNo: 'NoUser'
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: '#fff', width: width, height: height, paddingTop: 10 }}>
                        <View style={{ width: width, paddingHorizontal: 10, paddingBottom: 10 }}>
                            <View style={{
                                flexDirection: 'row',
                                marginHorizontal: 5,
                                marginTop: 10,
                                marginBottom: 25,
                                justifyContent: 'center'
                            }}>
                                <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({
                                            buyType: 'm'
                                        })
                                    }}>
                                    <Image source={this.state.buyType == 'm' ? radio_btn_selected : radio_btn_unselected}
                                        style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                    <Text style={{ color: '#262626', fontSize: 16, }}>
                                        {word[this.props.navigation.state.params.lg].money}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({
                                            buyType: '25'
                                        })
                                    }}>
                                    <Image source={this.state.buyType == '25' ? radio_btn_selected : radio_btn_unselected}
                                        style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                    <Text style={{ color: '#262626', fontSize: 16, }}>
                                        25
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                    onPress={() => {
                                        this.setState({
                                            buyType: '100'
                                        })
                                    }}>
                                    <Image source={this.state.buyType == '100' ? radio_btn_selected : radio_btn_unselected}
                                        style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                    <Text style={{ color: '#262626', fontSize: 16, }}>
                                        100
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                width: ((width * 0.8) - 30), height: 40, justifyContent: 'center',
                                borderWidth: 1, borderColor: Color.DARKPRIMARYTEXTCOLOR, borderRadius: 5,
                            }}>
                                <Picker
                                    mode='dropdown'
                                    selectedValue={this.state.userNo}
                                    style={{ height: 40, width: ((width * 0.8) - 30) }}
                                    onValueChange={(itemValue, itemIndex) => {
                                        let i = this.state.users.findIndex(x => x.UserID == itemValue);
                                        if (i !== -1) {
                                            this.setState({
                                                userNo: itemValue,
                                                userId: this.state.users[i].UserNo,
                                                discount2D: this.state.users[i].Discount2D,
                                                discount3D: this.state.users[i].Discount3D
                                            })
                                        } else {
                                            this.setState({
                                                userId: itemValue,
                                                userNo: itemValue,
                                                discount2D: 0,
                                                discount3D: 0
                                            })
                                        }

                                    }}>
                                    <Picker.Item label={'Select User'} value={'NoUser'} />
                                    {this.renderUsers()}
                                </Picker>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                            }}>
                                <Text style={{ color: '#262626', fontSize: 16, marginRight: 10 }}>
                                    {word[this.props.navigation.state.params.lg].discount}
                                </Text>
                                <View style={{
                                    flexDirection: 'row',
                                    flex: 1,

                                }}>
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            paddingVertical: 7,
                                            height: 40,
                                            borderWidth: 1,
                                            borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                            borderRadius: 5,
                                            marginRight: 5,
                                            textAlign: 'center',
                                            color: '#262626'
                                        }}
                                        placeholder={'Hot Num'}
                                        keyboardType='decimal-pad'
                                        underlineColorAndroid='transparent'
                                        value={this.state.type == '2D' ? this.state.discount2D.toString() : this.state.discount3D.toString()}
                                        editable={true}
                                    />
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    marginHorizontal: 5,
                                    alignItems: 'center'
                                }}>
                                    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                        onPress={() => {
                                            this.setState({
                                                combineType: 'sale'
                                            })
                                        }}>
                                        <Image source={this.state.combineType == 'sale' ? radio_btn_selected : radio_btn_unselected}
                                            style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                        <Text style={{ color: '#262626', fontSize: 16, }}>
                                            {word[this.props.navigation.state.params.lg].sale}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                        onPress={() => {
                                            this.setState({
                                                combineType: 'buy'
                                            })
                                        }}>
                                        <Image source={this.state.combineType == 'buy' ? radio_btn_selected : radio_btn_unselected}
                                            style={{ width: 23, height: 23, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                        <Text style={{ color: '#262626', fontSize: 16, }}>
                                            {word[this.props.navigation.state.params.lg].buy}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    marginBottom: 10,
                                    flex: 1
                                }}>
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            paddingVertical: 7,
                                            height: height * 0.55,
                                            borderWidth: 1,
                                            borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                            borderRadius: 5,
                                            marginRight: 5,
                                            textAlign: 'left',
                                            color: '#262626',
                                            textAlignVertical: 'top'
                                        }}
                                        placeholder={'Paste Ledger'}
                                        underlineColorAndroid='transparent'
                                        multiline
                                        //value={this.state.type=='2D'?this.state.discount2D.toString():this.state.discount3D.toString()}
                                        editable={true}
                                        value={this.state.bodyldg}
                                        onChangeText={(text) => this.setState({ bodyldg: text })}
                                    />
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            paddingVertical: 7,
                                            height: height * 0.55,
                                            borderWidth: 1,
                                            borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                            borderRadius: 5,
                                            marginRight: 5,
                                            textAlign: 'left',
                                            color: 'red',
                                            textAlignVertical: 'top'
                                        }}
                                        placeholder={''}
                                        underlineColorAndroid='transparent'
                                        multiline
                                        editable={false}
                                        value={this.state.errorMsg}
                                        onChangeText={(text) => this.setState({ bodyldg: text })}
                                    />
                                </View>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                marginTop: 20,
                                alignItems: 'center',
                                justifyContent: 'space-evenly',
                                width: width * 0.95
                            }}>
                                <TouchableOpacity style={{
                                    paddingVertical: 10,
                                    width: width * 0.3,
                                    backgroundColor: Color.PRIMARYCOLOR,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} onPress={() => {
                                    if (this.state.userNo == 'NoUser') {
                                        Alert.alert(config.AppName, 'Please select the user!')
                                        return;
                                    }
                                    this.setState({
                                        isCombineLdg: false,
                                        loading: true
                                    })

                                    let LdgPrice = this.state.buyType == 'm' ? 1 : this.state.buyType == '25' ? 25 : 100;
                                    let dis = this.state.type == '2D' ? this.state.discount2D : this.state.discount3D;

                                    dal.combineLedger(this.props.navigation.state.params.endpoint, this.state.userNo, this.state.termId, dis,
                                        this.state.combineType == 'sale' ? true : false, this.state.unitPrice, LdgPrice, this.state.type, this.state.bodyldg, (err, resp) => {
                                            console.log("Resp" + resp)
                                            console.log("Err" + err)
                                            if (resp == 'OK') {
                                                Alert.alert(config.AppName, 'Combine successfully!')
                                                this.setState({
                                                    loading: false,
                                                    isCombineLdg: false,
                                                    users: [],
                                                    bodyldg: '',
                                                    buyType: 'm',
                                                    userNo: 'NoUser'
                                                })
                                                this.getLedgerList(this.state.type)
                                            } else {
                                                Alert.alert(config.AppName, resp)
                                                this.setState({
                                                    loading: false,
                                                    isCombineLdg: false,
                                                    users: [],
                                                    buyType: 'm',
                                                    userNo: 'NoUser'
                                                })
                                            }
                                        })
                                }}>
                                    <Text style={{ color: 'white', fontSize: 14, }}>
                                        Ledger+
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    paddingVertical: 10,
                                    width: width * 0.3,
                                    backgroundColor: Color.PRIMARYCOLOR,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} onPress={() => {
                                    if (this.state.userNo == 'NoUser') {
                                        Alert.alert(config.AppName, 'Please select the user!')
                                        return;
                                    }
                                    this.setState({
                                        //isCombineLdg:false,
                                        loading: true
                                    })

                                    dal.checkSMS(this.props.navigation.state.params.endpoint, this.state.userNo, this.state.termId, this.state.bodyldg, (err, resp) => {
                                        console.log("Resp " + JSON.stringify(resp))
                                        console.log("Err " + err)
                                        if (resp.length > 0) {
                                            //Alert.alert(config.AppName,'Combine successfully!')
                                            this.setState({
                                                loading: false,
                                                errorMsg: resp[0].ErrorMsg
                                            })
                                            this.getLedgerList(this.state.type)
                                        } else {
                                            Alert.alert(config.AppName, resp)
                                            this.setState({
                                                loading: false,
                                                errorMsg: 'Something went wrong'
                                            })
                                        }
                                    })
                                }}>
                                    <Text style={{ color: 'yellow', fontSize: 14, }}>
                                        Check SMS
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    paddingVertical: 10,
                                    width: width * 0.3,
                                    backgroundColor: Color.PRIMARYCOLOR,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} onPress={() => {
                                    if (this.state.userNo == 'NoUser') {
                                        Alert.alert(config.AppName, 'Please select the user!')
                                        return;
                                    }
                                    this.setState({
                                        isCombineLdg: false,
                                        loading: true
                                    })

                                    let LdgPrice = this.state.buyType == 'm' ? 1 : this.state.buyType == '25' ? 25 : 100;
                                    let dis = this.state.type == '2D' ? this.state.discount2D : this.state.discount3D;

                                    dal.combineSMS(this.props.navigation.state.params.endpoint, this.state.userNo, this.state.termId, dis,
                                        this.state.combineType == 'sale' ? true : false, this.state.unitPrice, LdgPrice, this.state.type, this.state.bodyldg, (err, resp) => {
                                            console.log("Resp ==>> " + JSON.stringify(resp))
                                            console.log("Err" + err)
                                            if (resp == 'OK') {
                                                Alert.alert(config.AppName, 'Combine successfully!')
                                                this.setState({
                                                    loading: false,
                                                    isCombineLdg: false,
                                                    users: [],
                                                    bodyldg: '',
                                                    buyType: 'm',
                                                    userNo: 'NoUser',
                                                    errorMsg: ''
                                                })
                                                this.getLedgerList(this.state.type)
                                            } else {
                                                Alert.alert(config.AppName, resp)
                                                this.setState({
                                                    loading: false,
                                                    isCombineLdg: false,
                                                    users: [],
                                                    buyType: 'm',
                                                    userNo: 'NoUser',
                                                    errorMsg: ''
                                                })
                                            }
                                        })
                                }}>
                                    <Text style={{ color: 'white', fontSize: 14, }}>
                                        SMS +
                                    </Text>
                                </TouchableOpacity>
                            </View>


                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    normalizeHolidayRows(rows) {
        return (rows || []).map((item, idx) => {
            const rawDate = item.Holiday || item.HolidayDate || item.Date || item.ResultDate || '';
            const m = moment(rawDate);
            return {
                HolidayID: item.HolidayID || item.ID || item.Id || idx,
                Holiday: m.isValid() ? m.format('DD/MM/YYYY') : (rawDate || ''),
                Description: item.Description || item.Desp || item.Name || ''
            };
        });
    }
    getHolidayList() {
        this.setState({ holidayLoading: true });
        dal.getHoliday(this.state.liveapi, (err, resp) => {
            if (err) {
                this.setState({ holidayLoading: false, holidays: [] });
                Alert.alert(config.AppName, 'Something went wrong!');
                return;
            }
            const rows = Array.isArray(resp) ? resp : (resp && resp.Data ? resp.Data : []);
            this.setState({
                holidays: this.normalizeHolidayRows(rows),
                holidayLoading: false,
                showHolidayModal: true
            });
        });
    }
    openHolidayModal() {
        this.setState({ showHolidayModal: true, holidays: [], isGG: false }, () => {
            this.getHolidayList();
        });
    }
    openNewHolidayModal(item = null) {
        if (item) {
            const d = moment(item.Holiday, 'DD/MM/YYYY');
            this.setState({
                showNewHolidayModal: true,
                holidayID: item.HolidayID || 0,
                holidayDate: d.isValid() ? d.toDate() : new Date(),
                holidayDesp: item.Description || '',
                holidayStatus: 'Edit',
                showHolidayDatePicker: false
            });
            return;
        }
        this.setState({
            showNewHolidayModal: true,
            holidayID: 0,
            holidayDate: new Date(),
            holidayDesp: '',
            holidayStatus: 'New',
            showHolidayDatePicker: false
        });
    }
    saveHoliday(statusOverride = null) {
        const status = statusOverride || this.state.holidayStatus || 'New';
        const holiday = moment(this.state.holidayDate).format('YYYY-MM-DD');
        const desp = this.state.holidayDesp || '';
        if ((status === 'New' || status === 'Edit') && desp.trim() === '') {
            Alert.alert(config.AppName, 'Please fill Desp!');
            return;
        }
        this.setState({ holidaySaving: true });
        const data = [{
            HolidayID: this.state.holidayID || 0,
            Holiday: holiday,
            Desp: desp
        }];
        dal.saveHoliday(
            this.state.liveapi,
            data,
            status,
            (err, resp) => {
                this.setState({ holidaySaving: false });
                if (err) {
                    Alert.alert(config.AppName, 'Something went wrong!');
                    return;
                }
                const ok =
                    resp === true ||
                    resp === 'OK' ||
                    (resp && resp.Status === 'OK') ||
                    (resp && resp.Msg === 'OK') ||
                    (resp && resp.msg === 'OK');
                if (!ok) {
                    Alert.alert(config.AppName, (resp && (resp.Msg || resp.msg || resp.Status)) || 'Error in saving!');
                    return;
                }
                Alert.alert(config.AppName, `${status} successfully!`);
                this.setState({
                    showNewHolidayModal: false,
                    holidayID: 0,
                    holidayDate: new Date(),
                    holidayDesp: '',
                    holidayStatus: 'New'
                }, () => this.getHolidayList());
            }
        );
    }
    deleteHoliday(item) {
        Alert.alert(config.AppName, 'Are you sure to delete?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes',
                onPress: () => {
                    this.setState({
                        holidayID: item.HolidayID || 0,
                        holidayDate: moment(item.Holiday, 'DD/MM/YYYY').isValid() ? moment(item.Holiday, 'DD/MM/YYYY').toDate() : new Date(),
                        holidayDesp: item.Description || '',
                        holidayStatus: 'Delete'
                    }, () => this.saveHoliday('Delete'));
                }
            }
        ]);
    }
    renderNewHolidayModal() {
        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.showNewHolidayModal}
                onRequestClose={() => this.setState({ showNewHolidayModal: false })}
            >
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={{
                        height: 56,
                        backgroundColor: Color.PRIMARYCOLOR,
                        paddingHorizontal: 12,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Roboto-Bold' }}>Holiday</Text>
                    </View>
                    <View style={{ flex: 1, padding: 12 }}>
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ color: '#262626', fontSize: 15, marginBottom: 8 }}>Holiday</Text>
                            <TouchableOpacity
                                onPress={() => this.setState({ showHolidayDatePicker: true })}
                                style={{
                                    height: 44,
                                    borderWidth: 1,
                                    borderColor: Color.DIVIDERCOLOR,
                                    borderRadius: 5,
                                    justifyContent: 'center',
                                    paddingHorizontal: 10
                                }}
                            >
                                <Text style={{ color: '#262626', fontSize: 15 }}>
                                    {moment(this.state.holidayDate).format('DD/MM/YYYY')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#262626', fontSize: 15, marginBottom: 8 }}>Desp</Text>
                            <TextInput
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: Color.DIVIDERCOLOR,
                                    borderRadius: 5,
                                    padding: 10,
                                    textAlignVertical: 'top',
                                    color: '#262626'
                                }}
                                multiline
                                underlineColorAndroid="transparent"
                                value={this.state.holidayDesp}
                                onChangeText={(text) => this.setState({ holidayDesp: text })}
                            />
                        </View>
                    </View>
                    <View style={{
                        padding: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        borderTopWidth: 1,
                        borderColor: Color.DIVIDERCOLOR
                    }}>
                        <TouchableOpacity
                            disabled={this.state.holidaySaving}
                            style={{
                                width: width * 0.45,
                                height: 44,
                                borderRadius: 6,
                                backgroundColor: Color.PRIMARYCOLOR,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => this.saveHoliday()}
                        >
                            {this.state.holidaySaving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Roboto-Bold' }}>SAVE</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                width: width * 0.45,
                                height: 44,
                                borderRadius: 6,
                                backgroundColor: '#666',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => this.setState({ showNewHolidayModal: false })}
                        >
                            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Roboto-Bold' }}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>
                    {this.state.showHolidayDatePicker && (
                        <DateTimePicker
                            value={this.state.holidayDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                if (Platform.OS === 'android') {
                                    this.setState({ showHolidayDatePicker: false });
                                }
                                if (selectedDate) {
                                    this.setState({ holidayDate: selectedDate });
                                }
                            }}
                        />
                    )}
                </View>
            </Modal>
        );
    }
    renderHolidayModal() {
        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.state.showHolidayModal}
                onRequestClose={() => this.setState({ showHolidayModal: false })}
            >
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={{
                        height: 56,
                        backgroundColor: Color.PRIMARYCOLOR,
                        paddingHorizontal: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Roboto-Bold' }}>Holiday</Text>
                    </View>

                    <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: Color.DIVIDERCOLOR }}>
                        <Text style={{ width: 95, fontSize: 14, fontFamily: 'Roboto-Bold' }}>Holiday</Text>
                        <Text style={{ flex: 1, fontSize: 14, fontFamily: 'Roboto-Bold' }}>Description</Text>
                        <Text style={{ width: 36 }} />
                        <Text style={{ width: 36 }} />
                    </View>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
                        {this.state.holidayLoading ? (
                            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color={Color.PRIMARYCOLOR} />
                            </View>
                        ) : (
                            this.state.holidays.map((item, index) => (
                                <View key={`${item.HolidayID}_${index}`} style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                    borderBottomWidth: 1,
                                    borderColor: '#efefef'
                                }}>
                                    <Text style={{ width: 95, fontSize: 13, color: '#262626' }}>{item.Holiday}</Text>
                                    <Text style={{ flex: 1, fontSize: 13, color: '#262626' }}>{item.Description}</Text>
                                    <TouchableOpacity style={{ width: 36, alignItems: 'center' }}
                                        onPress={() => this.openNewHolidayModal(item)}>
                                        <Image source={editIcon} style={{ width: 18, height: 18, tintColor: Color.PRIMARYCOLOR }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: 36, alignItems: 'center' }}
                                        onPress={() => this.deleteHoliday(item)}>
                                        <Image source={deleteIcon} style={{ width: 18, height: 18, tintColor: 'red' }} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <View style={{
                        padding: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        borderTopWidth: 1,
                        borderColor: Color.DIVIDERCOLOR
                    }}>
                        <TouchableOpacity
                            style={{
                                width: width * 0.45,
                                height: 44,
                                borderRadius: 6,
                                backgroundColor: Color.PRIMARYCOLOR,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => this.openNewHolidayModal()}
                        >
                            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Roboto-Bold' }}>New</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                width: width * 0.45,
                                height: 44,
                                borderRadius: 6,
                                backgroundColor: '#666',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => this.setState({ showHolidayModal: false })}
                        >
                            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Roboto-Bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
    renderGGModal() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isGG}
                onRequestClose={() => {
                    this.setState({
                        isGG: false,
                        timesData: []
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    <View style={{ backgroundColor: '#fff', alignItems: 'center', width: width * 0.98, borderRadius: 5, padding: 10, marginVertical: 10 }}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
                            keyboardShouldPersistTaps='always'
                        >
                            <View style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                            }}>
                                {
                                    this.state.timesData.map((value, index) => (
                                        <View style={{
                                            flexDirection: 'row',
                                            width: width * 0.45,
                                            marginBottom: 10,
                                            alignItems: 'flex-end',
                                            marginLeft: 5
                                        }}>
                                            <View>
                                                <Text style={{
                                                    fontSize: 18,
                                                    fontWeight: 'bold',
                                                }}
                                                    allowFontScaling={false}
                                                >
                                                    {value.time}
                                                </Text>
                                                <TextInput
                                                    style={{
                                                        width: 80,
                                                        height: 45,
                                                        borderWidth: 1,
                                                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                                        borderRadius: 5,
                                                        fontSize: 18,
                                                        fontWeight: 'bold'
                                                    }}
                                                    editable={!value.disable}
                                                    keyboardType='decimal-pad'
                                                    underlineColorAndroid='transparent'
                                                    value={value.number}
                                                    maxLength={2}
                                                    onChangeText={(text) => {
                                                        if (isNaN(text)) {
                                                            return;
                                                        }
                                                        this.state.timesData[index].number = text
                                                        this.setState({
                                                            timesData: this.state.timesData
                                                        })
                                                    }}
                                                />
                                            </View>
                                            <TouchableOpacity style={{
                                                width: (width * 0.2), backgroundColor: Color.PRIMARYCOLOR,
                                                alignItems: 'center', justifyContent: 'center', borderRadius: 5, height: 45, marginLeft: 5
                                            }}
                                                disabled={value.disable}
                                                onPress={() => {
                                                    dal.saveGG(`${this.state.liveapi}/api/apiwinnumtoday?Num=${value.number}&SrNo=${value.srno}&Password=${_password}`, (err, resp) => {
                                                        if (err) {
                                                            console.log(err)
                                                            Alert.alert(config.AppName, 'Something went wrong!')
                                                        } else {
                                                            console.log(resp)
                                                            if (resp == true) {
                                                                Alert.alert(config.AppName, 'Saved Successful!')
                                                                this.get_predefined_today_terms()
                                                            } else {
                                                                Alert.alert(config.AppName, 'Error in saving!')
                                                            }
                                                        }
                                                    })
                                                }}>
                                                <Text>
                                                    SAVE
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                    ))
                                }
                            </View>



                            <View style={{
                                flexDirection: 'row',
                                height: 45,
                                width: width * 0.85,
                                marginVertical: 10,
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <TextInput
                                    style={{
                                        width: (width * 0.2),
                                        height: 45,
                                        borderWidth: 1,
                                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                        borderRadius: 5,
                                        fontSize: 16
                                    }}
                                    placeholder={'Discount'}
                                    keyboardType='decimal-pad'
                                    underlineColorAndroid='transparent'
                                    value={this.state._discount}
                                    onChangeText={(text) => {
                                        this.setState({
                                            _discount: text
                                        })
                                    }}
                                />
                                <TextInput
                                    style={{
                                        width: (width * 0.1),
                                        height: 45,
                                        borderWidth: 1,
                                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                                        borderRadius: 5,
                                        fontSize: 16
                                    }}
                                    placeholder={'%'}
                                    keyboardType='decimal-pad'
                                    underlineColorAndroid='transparent'
                                    value={this.state._percentage}
                                    onChangeText={(text) => {
                                        this.setState({
                                            _percentage: text
                                        })
                                    }}
                                />
                                <TouchableOpacity style={{
                                    width: (width * 0.16), backgroundColor: Color.PRIMARYCOLOR,
                                    alignItems: 'center', justifyContent: 'center', borderRadius: 5, height: 45
                                }}

                                    onPress={() => {
                                        if (this.state._discount == '' && this.state._percentage == '') {
                                            Alert.alert(config.AppName, 'Please fill Percentage & Discount!')
                                            return;
                                        }
                                        //TZT
                                        dal.getNubers4GG(this.props.navigation.state.params.endpoint,
                                            this.state._percentage,
                                            this.state._discount,
                                            this.state.termId, 85
                                            , (err, resp) => {
                                                if (err) {
                                                    Alert.alert(config.AppName, 'Something went wrong!')
                                                    this.setState({
                                                        _numbers4GG: []
                                                    })
                                                    Keyboard.dismiss()
                                                } else {
                                                    if (resp.Status == 'OK') {
                                                        this.setState({
                                                            _numbers4GG: resp.Data
                                                        })
                                                        Keyboard.dismiss()
                                                    } else {
                                                        this.setState({
                                                            _numbers4GG: []
                                                        })
                                                        Keyboard.dismiss()
                                                        Alert.alert(config.AppName, 'Error in saving!')
                                                    }
                                                }
                                            })
                                    }}>
                                    <Text>
                                        SHOW
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    width: (width * 0.16), backgroundColor: Color.PRIMARYCOLOR,
                                    alignItems: 'center', justifyContent: 'center', borderRadius: 5, height: 45,
                                    marginLeft: 5
                                }}
                                    onPress={() => {
                                        this.setState({ show3DModal: true }, () => {
                                            this.get3DWinNumList()
                                            this.load3DMeta()
                                        })
                                    }}>
                                    <Text>
                                        3D
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    width: (width * 0.2), backgroundColor: Color.PRIMARYCOLOR,
                                    alignItems: 'center', justifyContent: 'center', borderRadius: 5, height: 45,
                                    marginLeft: 5
                                }}
                                    onPress={() => {
                                        this.openHolidayModal()
                                    }}>
                                    <Text>
                                        Holiday
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: width * 0.8 }}>
                                {this.state._numbers4GG.length == 0 ? null :
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: 20
                                    }}>
                                        <View style={{
                                            flex: 1
                                        }}>
                                            <Text>
                                                Number
                                            </Text>
                                        </View>
                                        <View style={{
                                            flex: 1
                                        }}>
                                            <Text>
                                                Total Unit
                                            </Text>
                                        </View>
                                        <View style={{
                                            flex: 1
                                        }}>
                                            <Text>
                                                Count
                                            </Text>
                                        </View>
                                    </View>
                                }
                                {
                                    this.state._numbers4GG.map((value, index) => (
                                        <TouchableOpacity style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 20
                                        }}
                                            onPress={() => {
                                                this.setState({
                                                    loading: true
                                                }, () => {
                                                    this.APISlipDetail(this.state.termId, value.Num)
                                                })
                                            }}
                                        >
                                            <View style={{
                                                flex: 1
                                            }}>
                                                <Text>
                                                    {value.Num}={value.Desp}
                                                </Text>
                                            </View>
                                            <View style={{
                                                flex: 1
                                            }}>
                                                <Text>
                                                    {value.Unit}
                                                </Text>
                                            </View>
                                            <View style={{
                                                flex: 1
                                            }}>
                                                <Text>
                                                    {value.UCount}
                                                </Text>

                                            </View>
                                        </TouchableOpacity>
                                    ))
                                }
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        )
    }
    render() {
        return (
            <View style={styles.container}>
                {this.renderHeader()}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <View style={{
                        width: ((width * 0.5) - 20), height: 40, justifyContent: 'center',
                        borderWidth: 1, borderColor: Color.DARKPRIMARYTEXTCOLOR, borderRadius: 5, marginVertical: 5, marginHorizontal: 5
                    }}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.termId}
                            style={{ height: 40, width: ((width * 0.5) - 30) }}
                            onValueChange={(itemValue, itemIndex) => {
                                let i = this.state.terms.findIndex(x => x.TermDetailID == itemValue);
                                if (i !== -1) {
                                    this.setState({
                                        termId: itemValue,
                                        loading: true,
                                        type: this.state.terms[i].LottType,
                                        unitPrice: this.state.terms[i].UnitPrice,
                                        break: this.state.terms[i].UnitBreak ? this.state.terms[i].UnitBreak.toString() : ''
                                    }, () => {
                                        this.getLedgerList(this.state.terms[i].LottType)
                                    })
                                } else {
                                    this.setState({
                                        termId: itemValue,
                                        data: [],
                                        dataProvider: dataProvider.cloneWithRows([]),
                                        break: ''
                                    })
                                }

                            }}>
                            <Picker.Item label={'Select Term'} value={'NoTerm'} />
                            {this.renderTerms()}
                        </Picker>
                    </View>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        borderWidth: 1,
                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                        height: 40,
                        marginRight: 5,
                        borderRadius: 5,
                        justifyContent: 'center'
                    }}>
                        <TextInput
                            style={[styles.input, { marginHorizontal: 0, height: 45, fontSize: 15 }]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.break}
                            onChangeText={(text) => {
                                this.setState({
                                    break: text
                                })
                            }}
                        />
                        <TouchableOpacity style={{
                            height: 38,
                            width: 60,
                            borderTopRightRadius: 5,
                            borderBottomRightRadius: 5,
                            backgroundColor: Color.PRIMARYCOLOR,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }} onPress={() => {
                            if (this.state.termId == 'NoTerm') {
                                Alert.alert(config.AppName, 'Please choose term!')
                                return;
                            }
                            dal.changeUnitBreak(this.props.navigation.state.params.endpoint, this.state.termId, this.state.break, (err, resp) => {
                                if (err) {
                                    Alert.alert(config.AppName, 'Something went wrong!')
                                } else {
                                    if (resp == 'Your break have been changed!') {
                                        Keyboard.dismiss()
                                        this.setState({
                                            sort: 'unit_des',
                                            loading: true
                                        }, () => {
                                            this.getLedgerList(this.state.type)
                                        })
                                    } else {
                                        Alert.alert(config.AppName, 'Error in saving!')
                                    }
                                }
                            })
                        }}>
                            <Text style={{
                                fontFamily: 'Roboto-Bold',
                                fontSize: 16,
                                color: '#fff'
                            }}>
                                SAVE
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:5,marginBottom:5}}>
                    <View style={{width:((width*0.5)-20),height:40,justifyContent:'center',
                        borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,}}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.agentId}
                            style={{ height:40, width:((width*0.5)-20)}}
                            onValueChange={(itemValue, itemIndex) =>{
                                this.setState({
                                    agentId:itemValue,
                                    loading:true
                                },()=>{
                                    this.getLedgerList(this.state.type)
                                })
                                if(itemValue=='All'){
                                    this.getUsers()
                                }else{
                                    this.getUsersByAgent(itemValue)
                                }
                                
                            }}>
                            <Picker.Item label={'All'} value={'All'}/>
                            {this.renderAgents()}
                        </Picker>
                    </View>
                    <View style={{width:((width*0.5)+5),height:40,justifyContent:'center',
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5,}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.__userId}
                        style={{ height:40, width:((width*0.5)+5)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.users.findIndex(x => x.UserID==itemValue);
                            if(i!==-1){
                                this.setState({
                                    __userId:itemValue,
                                    loading:true
                                },()=>{
                                    this.getLedgerList(this.state.type)
                                })
                            }else{
                                this.setState({
                                    __userId:itemValue,
                                    loading:true
                                },()=>{
                                    this.getLedgerList(this.state.type)
                                })
                            }
                            
                        }}>
                        <Picker.Item label={'All'} value={null}/>
                        {this.renderUsers()}
                    </Picker>
                </View>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>

                    <View style={{
                        width: ((width * 0.5) - 20),
                        flexDirection: 'row',
                        borderWidth: 1,
                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                        height: 40,
                        marginHorizontal: 5,
                        borderRadius: 5,
                        justifyContent: 'center'
                    }}>
                        <TextInput
                            style={[styles.input, { marginHorizontal: 0, height: 45, fontSize: 15 }]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.vBreak}
                            returnKeyType='search'
                            onSubmitEditing={() => {
                                this.setState({
                                    loading: true
                                }, () => {
                                    if (this.state.filterVBreak) {
                                        this.getLedgerListByvBreak(this.state.type)
                                    }
                                })
                            }}
                            onChangeText={(text) => {
                                this.setState({
                                    vBreak: text
                                })
                            }}
                        />
                    </View>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        height: 40,
                        marginRight: 5,
                        alignItems: 'center'
                    }}>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                filterVBreak: !this.state.filterVBreak,
                                loading: true
                            }, () => {
                                if (this.state.filterVBreak) {
                                    this.getLedgerListByvBreak(this.state.type)
                                } else {
                                    this.getLedgerList(this.state.type)
                                }
                            })
                        }}>
                            <Image
                                source={this.state.filterVBreak ? tickIcon : untickIcon}
                                style={{
                                    width: 30, height: 30
                                }}
                            />
                        </TouchableOpacity>
                    </View>


                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        paddingRight: 5,
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                    }}>
                        <TouchableOpacity style={{
                            height: 38,
                            paddingHorizontal: 20,
                            borderRadius: 5,
                            backgroundColor: Color.PRIMARYCOLOR,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }} onPress={() => {
                            if (this.state.termId == 'NoTerm') {
                                Alert.alert(config.AppName, 'Please choose term!')
                                return;
                            }
                            Alert.alert(config.AppName, 'Are you sure to BORN?',
                                [
                                    {
                                        text: 'YES',
                                        onPress: () => {
                                            this.setState({
                                                loading: true
                                            }, () => {
                                                dal.saveBornNum(this.props.navigation.state.params.endpoint, this.state.termId, (err, resp) => {
                                                    if (err) {
                                                        this.setState({
                                                            loading: false
                                                        })
                                                        Alert.alert(config.AppName, 'Something went wrong!')
                                                    } else {
                                                        if (resp == 'Save Successful!') {
                                                            Keyboard.dismiss()
                                                            this.setState({
                                                                sort: 'unit_des',
                                                            }, () => {
                                                                this.getLedgerList(this.state.type)
                                                            })
                                                        } else {
                                                            this.setState({
                                                                loading: false
                                                            })
                                                            Alert.alert(config.AppName, 'Error in saving!')
                                                        }
                                                    }
                                                })
                                            })
                                        }
                                    },
                                    {
                                        text: 'NO',
                                        onPress: () => {

                                        }
                                    }
                                ])


                        }}>
                            <Text style={{
                                fontFamily: 'Roboto-Bold',
                                fontSize: 16,
                                color: '#fff'
                            }}>
                                BORN
                            </Text>
                        </TouchableOpacity>
                    </View>


                </View>
                <View style={{
                    width: width,
                    paddingVertical: 5,
                    marginHorizontal: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Text style={{
                        fontFamily: 'Roboto-Bold',
                        fontSize: 16,
                        marginRight: 10
                    }}>
                        {(() => {
                            const useMax = (this.state.agentId !== 'All') || (this.state.__userId !== null && this.state.__userId !== undefined);
                            const denom = useMax ? (this.state.maxUnit || 0) : (this.state.filterVBreak && this.state.vBreak > 0 ? this.state.vBreak : this.state.break);
                            const pct = denom > 0 ? Number(this.state.total / denom).toFixed(0) : 0;
                            return `Total=${numeral(this.state.total).format('0,0')}(${pct}%)`;
                        })()}
                    </Text>
                    <Text style={{
                        fontFamily: 'Roboto-Bold',
                        fontSize: 16,
                        marginRight: 10
                    }}>
                        {(() => {
                            const useMax = (this.state.agentId !== 'All') || (this.state.__userId !== null && this.state.__userId !== undefined);
                            const brk = useMax ? (this.state.maxUnit || 0) : (this.state.filterVBreak && this.state.vBreak > 0 ? this.state.vBreak : this.state.break);
                            return `Break = ${numeral(brk).format('0,0')}`;
                        })()}
                    </Text>
                </View>
                <View style={{
                    width: width,
                    borderBottomWidth: 1,
                    borderColor: Color.DIVIDERCOLOR,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                }}>
                    <View style={{
                        flex: 3,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 6,
                        paddingLeft: 8,
                        paddingRight: 8
                    }}>
                        <TouchableOpacity style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 6
                        }} onPress={() => {
                            const nextSort = this.state.sort != 'num_asc' ? 'num_asc' : 'num_des';
                            this.setState({
                                sort: nextSort,
                                dataProvider: dataProvider.cloneWithRows(
                                    this.getFilteredSortedRows(this.state.data, nextSort, this.state.numSearch)
                                ),
                            })
                        }}>
                            <Text style={{
                                color: Color.YELLOWCOLOR,
                                fontSize: 15,
                                textAlign: 'center'
                            }}>
                                Num
                            </Text>
                            {
                                this.state.sort == 'unit_asc' || this.state.sort == 'unit_des' ?
                                    null :
                                    <Image source={this.state.sort == 'num_asc' ? descending : asending} style={{ width: 20, height: 15, marginLeft: 8 }} />
                            }
                        </TouchableOpacity>
                        <TextInput
                            style={{
                                width: 50,
                                height: 36,
                                borderWidth: 1,
                                borderColor: Color.DIVIDERCOLOR,
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 0,
                                color: '#262626',
                                backgroundColor: '#fff',
                                fontSize: 12,
                                textAlign: 'left',
                                textAlignVertical: 'center'
                            }}
                            placeholder='Num'
                            placeholderTextColor={'#666'}
                            value={this.state.numSearch}
                            keyboardType={'number-pad'}
                            onChangeText={(text) => {
                                this.applyNumFilter(text, this.state.sort)
                            }}
                        />
                    </View>
                    <View style={{
                        flex: 3,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10
                    }}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => {
                                const nextSort = this.state.sort != 'unit_asc' ? 'unit_asc' : 'unit_des';
                                this.setState({
                                    sort: nextSort,
                                    dataProvider: dataProvider.cloneWithRows(
                                        this.getFilteredSortedRows(this.state.data, nextSort, this.state.numSearch)
                                    ),
                                })
                            }}
                        >
                            <Text style={{
                                color: Color.YELLOWCOLOR,
                                fontSize: 15,
                                textAlign: 'center'
                            }}>
                                Unit
                            </Text>
                            {
                                this.state.sort == 'num_asc' || this.state.sort == 'num_des' ?
                                    null :
                                    <Image source={this.state.sort == 'unit_asc' ? descending : asending} style={{ width: 20, height: 15, marginLeft: 8 }} />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Color.PRIMARYCOLOR, borderRadius: 4 }}
                            onPress={() => {
                                const list = (this.state.data || []).filter(d => {
                                    const u = parseFloat(d?.Unit);
                                    return !isNaN(u) && u > 0;
                                });
                                if (!list.length) {
                                    Alert.alert(config.AppName, 'No Data');
                                    return;
                                }
                                const totalUnit = list.reduce((s, d) => {
                                    const u = Number(d?.Unit);
                                    return s + (isNaN(u) ? 0 : u);
                                }, 0);
                                const useMax = (this.state.agentId !== 'All') || (this.state.__userId !== null && this.state.__userId !== undefined);
                                const brk = useMax
                                    ? (this.state.maxUnit || 0)
                                    : (this.state.filterVBreak && this.state.vBreak > 0 ? this.state.vBreak : this.state.break);
                                const pct = brk > 0 ? Number(totalUnit / brk).toFixed(0) : 0;
                                const footer = `Total=${numeral(totalUnit).format('0,0')}(${pct}%) Break=${numeral(brk || 0).format('0,0')}`;
                                const msg = `${list.map(d => `${d.Num}=${d.Unit}`).join('\n')}\n${footer}`;
                                Clipboard.setString(msg);
                                Share.share({ message: msg });
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 5,
                            marginVertical: 4,
                            marginHorizontal: 6,
                            backgroundColor: Color.PRIMARYCOLOR,
                            borderRadius: 6
                        }}
                        onPress={() => {
                            const list = (this.state.data || []).filter(d => d.Extra && d.Extra != 0);
                            if (!list.length) {
                                Alert.alert(config.AppName, 'No Extra');
                                return;
                            }
                            const totalExtra = list.reduce((s, d) => {
                                const u = Number(d?.Extra);
                                return s + (isNaN(u) ? 0 : u);
                            }, 0);
                            const msg = `${list.map(d => `${d.Num}=${d.Extra}`).join('\n')}\nTotal=${numeral(totalExtra).format('0,0')}`;
                            Clipboard.setString(msg);
                            Share.share({ message: msg });
                        }}
                    >
                        <Text style={{
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            Extra Copy
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                    <RecyclerListView
                        layoutProvider={this._layoutProvider}
                        dataProvider={this.state.dataProvider}
                        rowRenderer={this._rowRenderer}
                    />
                </View>
                {this.renderButtons()}
                {this.renderHotModal()}
                {this.renderLoginModal()}
                {this.renderBuyModal()}
                {this.renderCombineLdgModal()}
                {this.renderBuyNumModal()}
                {this.renderBuyNumModalTime()}
            {this.renderDirectBuyModal()}
            {this.render3DModal()}
            {this.renderGGModal()}
            {this.renderHolidayModal()}
            {this.renderNewHolidayModal()}
            {this.renderPlusPercentageModal()}
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
        height: 70,
        borderBottomWidth: 0.5,
        borderColor: 'grey',
        paddingVertical: 7,
        paddingHorizontal: 10,
    },
    msgItemTextTitle: { flex: 3, fontSize: 16, color: '#262626', fontWeight: '900', marginBottom: 8 },
    msgItemTextBody: { flex: 1, fontSize: 14.5, fontWeight: '400', },
    msgItemTextDate: { flex: 1, fontSize: 14.5, fontWeight: '400', textAlign: "right", },
    loading: {
        position: 'absolute',
        top: 50,
        left: 150,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        height: 50,
        flex: 1,
        textAlign: 'center',
        color: "#000",
        fontSize: 16,

        marginHorizontal: 10
    },
});
