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
  ScrollView,
  TextInput,
  ActivityIndicator,
  Picker
} from 'react-native';
import dal from '../dal.js'
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import plusIcon from '../assets/images/plus.png'
import calendarIcon from '../assets/images/calendar.png'
import downIcon from '../assets/images/down_arrow.png'
import tickIcon from '../assets/images/tick.png'
import untickIcon from '../assets/images/untick.png'
import backIcon from '../assets/images/backward.png'
import editIcon from '../assets/images/edit.png'
import deleteIcon from '../assets/images/delete.png'
import Color from '../utils/Color.js';
import config from '../config/config.js'
import moment from 'moment'
const {width,height}=Dimensions.get('window')
import word from './data.json'
import Loading from '../components/loading.js'
import DateTimePicker from '@react-native-community/datetimepicker';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
const TWO_DIGIT_GROUPS = [
    { name:'ပါဝါ', nums:['05','16','27','38','49','50','61','72','83','94'] },
    { name:'နက္ခတ်', nums:['07','18','24','35','69','70','81','42','53','96'] },
    { name:'အပူး', nums:['00','11','22','33','44','55','66','77','88','99'] },
    { name:'ညီကို', nums:['01','09','10','12','21','23','32','34','43','45','54','56','65','67','76','78','87','89','98','90'] },
    { name:'စုံပူး', nums:['00','22','44','66','88'] },
    { name:'မပူး', nums:['11','33','55','77','99'] },
    { name:'စုံစုံ', nums:['00','02','04','06','08','20','22','24','26','28','40','42','44','46','48','60','62','64','66','68','80','82','84','86','88'] },
    { name:'မမ', nums:['11','13','15','17','19','31','33','35','37','39','51','53','55','57','59','71','73','75','77','79','91','93','95','97','99'] },
    { name:'စုံမ', nums:['01','03','05','07','09','21','23','25','27','29','41','43','45','47','49','61','63','65','67','69','81','83','85','87','89'] },
    { name:'မစုံ', nums:['10','12','14','16','18','30','32','34','36','38','50','52','54','56','58','70','72','74','76','78','90','92','94','96','98'] },
    { name:'0B', nums:['00','19','28','37','46','55','64','73','82','91'] },
    { name:'1B', nums:['01','10','29','38','47','56','65','74','83','92'] },
    { name:'2B', nums:['02','11','20','39','48','57','66','75','84','93'] },
    { name:'3B', nums:['03','12','21','30','49','58','67','76','85','94'] },
    { name:'4B', nums:['04','13','22','31','40','59','68','77','86','95'] },
    { name:'5B', nums:['05','14','23','32','41','50','69','78','87','96'] },
    { name:'6B', nums:['06','15','24','33','42','51','60','79','88','97'] },
    { name:'7B', nums:['07','16','25','34','43','52','61','70','89','98'] },
    { name:'8B', nums:['08','17','26','35','44','53','62','71','80','99'] },
    { name:'9B', nums:['09','18','27','36','45','54','63','72','81','90'] },
];
export default class Users extends Component {
    constructor(props) {
        super(props);
        let now = new Date();
        this.state = {
            users:[],
            agents:[],
            terms:[],
            selectedTermId:'All',
            allTermsData:[],
            showMissing2D:false,
            missing2D:'',
            missing2DGroups:'',
            showEditModal:false,
            editFileName:'',
            showNewModal:false,
            loading:true,
            dataProvider: dataProvider.cloneWithRows([]),
            type:'2D',
            showPicker:false,
            mode:'date',
            pickType:'StartDate2D',
            pickerValue:moment().format('DD/MM/YYYY'),
            StartDate2D:moment().format('DD/MM/YYYY'),
            StartAMTime2D:moment('9:00:00',"HH:mm"),
            StartPMTime2D:moment('13:00:00',"HH:mm"),
            EndDate2D:moment(new Date(now.getFullYear(), now.getMonth(), now.getDate()+4, 0,0,0,0)).format('DD/MM/YYYY'),
            EndAMTime2D:moment('11:58:00',"HH:mm"),
            EndPMTime2D:moment('16:03:00',"HH:mm"),
            StartDate3D:moment().format('DD/MM/YYYY'),
            StartTime3D:moment('9:00:00',"HH:mm"),
            EndDate3D:moment(new Date(now.getFullYear(), now.getDate()>16?now.getMonth()+1:now.getMonth(),now.getDate()>16?1:16, 0,0,0,0)).format('DD/MM/YYYY'),
            EndTime3D:moment('14:00:00',"HH:mm"),
            break2D:'',
            break3D:'',
            unitPrice2D:'1',
            unitPrice3D:'1',
            winNum2D:'',
            winNum3D:'',
            winNumOnly:false,
            prize3D:'',
            reverse:false,
            reverseNum:'',
            termName:'',
            editTermId:null,
            editTermDetailsId:null,
            editname:'',
            showSaveModal:false,
            selectedValue:null,
            terms_conditions:'',
            showCustomModal:false,
            customCount:'3',
            new2DCount:'2',
            customTimeGroups:[
                { startTime: moment('09:00:00',"HH:mm"), endTime: moment('10:00:00',"HH:mm") },
                { startTime: moment('09:00:00',"HH:mm"), endTime: moment('10:00:00',"HH:mm") },
                { startTime: moment('09:00:00',"HH:mm"), endTime: moment('10:00:00',"HH:mm") }
            ]
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
        this.currentlyOpenSwipeable=null
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    componentDidMount() {
        this.getAllTerms()
        this.getTerms()
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
                    loading:true
                },()=>{
                    dal.getRules(this.props.navigation.state.params.endpoint,data.TermDetailID,(err,result)=>{
                        if(err){
                            this.setState({
                                loading:false
                            })
                          console.warn(err)
                          return;
                        }else{
                            console.log(result)
                            this.setState({
                                terms_conditions:result,
                                selectedValue:data,
                                showSaveModal:true,
                                loading:false
                            })
                        }
                        
                    })
                })
                
            }}
            >
                <View style={{
                    flex:3
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:10,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.Name}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:10,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {moment(data.StartTime).format('DD/MM/YYYY hh:mm A')}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:10,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {moment(data.EndTime).format('DD/MM/YYYY hh:mm A')}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:10,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.WinNum?data.WinNum:''}
                    </Text>
                </View>
                <TouchableOpacity style={{
                    width:30,
                    height:30,
                    alignItems:'center',
                    justifyContent:'center'
                }} onPress={()=>{
                    console.log(data)
                    if(data.LottType=='3D'||data.LottType=='4D'){
                        this.setState({
                            editTermId:data.TermID,
                            editTermDetailsId:data.TermDetailID,
                            showNewModal:true,
                            type:data.LottType,
                            StartDate3D:moment(data.StartTime).format('DD/MM/YYYY'),
                            EndDate3D:moment(data.EndTime).format('DD/MM/YYYY'),
                            StartTime3D:moment(data.StartTime),
                            EndTime3D:moment(data.EndTime),
                            break3D:data.UnitBreak?data.UnitBreak.toString():'',
                            unitPrice3D:data.UnitPrice?data.UnitPrice.toString():'',
                            winNum3D:data.WinNum?data.WinNum.toString():'',
                            winNumOnly:data.WinNumOnly,
                            termName:data.TermName?data.TermName.toString():''
                        })
                    }else{
                        this.setState({
                            editTermId:data.TermID,
                            editTermDetailsId:data.TermDetailID,
                            showNewModal:true,
                            type:data.LottType,
                            StartDate2D:moment(data.StartTime).format('DD/MM/YYYY'),
                            EndDate2D:moment(data.EndTime).format('DD/MM/YYYY'),
                            StartAMTime2D:moment(data.StartTime),
                            EndAMTime2D:moment(data.EndTime),
                            break2D:data.UnitBreak?data.UnitBreak.toString():'',
                            unitPrice2D:data.UnitPrice?data.UnitPrice.toString():'',
                            winNum2D:data.WinNum?data.WinNum.toString():'',
                            winNumOnly:data.WinNumOnly,
                            termName:data.TermName?data.TermName.toString():'',
                            editname:data.Name
                        })
                    }
                    
                }}>
                    <Image source={editIcon} style={{
                        width:20,
                        height:20,
                        tintColor:'#64dd17'
                    }}/>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    width:30,
                    height:30,
                    alignItems:'center',
                    justifyContent:'center'
                }} onPress={()=>{
                    Alert.alert(data.Name,'Are you sure you want to delete!',
                        [
                            {
                                text:'OK',
                                onPress:()=>{
                                    dal.deleteTerm(this.props.navigation.state.params.endpoint,data.TermDetailID,(err,resp)=>{
                                        if(err){
                                            Alert.alert(config.AppName,'Something went wrong!')
                                        }else{
                                            if(resp=='OK'){
                                                this.getAllTerms()
                                            }else{
                                                Alert.alert(config.AppName,resp)
                                            }
                                        }
                                    })
                                }
                            },
                            {
                                text:'Cancel',
                                onPress:()=>{
                                    
                                }
                            },
                        ],
                        {
                            cancelable:true
                        }
                    )
                }}>
                    <Image source={deleteIcon} style={{
                        width:20,
                        height:20,
                        tintColor:'#ff1744'
                    }}/>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }
    renderUsers(){
        return this.state.agents.map((value,index)=>{
          return(
            <Picker.Item label={value.AgentName} value={value.AgentID} key={index} />
          )
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
            return;
        }else{
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                this.setState({
                    terms:resp.Data
                })
            }else{
                this.setState({
                    terms:[]
                })
            }
        }
        })
    }
    getAllTerms(){
        dal.getAllTerms(this.props.navigation.state.params.endpoint,(err,resp)=>{
        if(err){
            Alert.alert(config.AppName,'Something went wrong!')
            this.setState({
                loading:false
            })
        }else{
            console.log(resp)
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                const source = resp.Data;
                const list = this.getFilteredTerms(source, this.state.selectedTermId);
                const info = this.state.selectedTermId=='All'
                    ? { show:false, value:'', groupValue:'' }
                    : this.getMissing2DInfo(list);
                this.setState({
                    allTermsData: source,
                    dataProvider: dataProvider.cloneWithRows(list),
                    showMissing2D: info.show,
                    missing2D: info.value,
                    missing2DGroups: info.groupValue,
                    loading:false
                })
            }else{
                Alert.alert(config.AppName,'Can\'t retrieve users data!')
                this.setState({
                    allTermsData:[],
                    dataProvider: dataProvider.cloneWithRows([]),
                    showMissing2D:false,
                    missing2D:'',
                    missing2DGroups:'',
                    loading:false
                })
            }
        }
        })
    }
    getFilteredTerms(source, termId){
        const rows = source || [];
        return termId=='All' ? rows : rows.filter(x=>x.TermID==termId);
    }
    getMissing2DInfo(list){
        const rows = list || [];
        const twoDList = rows.filter(x => (x.LottType || '') == '2D');
        if(!twoDList.length){
            return { show:false, value:'', groupValue:'' };
        }
        const used = {};
        const usedTwoDigits = {};
        twoDList.forEach(item => {
            const v = (item.WinNum == null ? '' : String(item.WinNum));
            for(let i=0;i<v.length;i++){
                const ch = v.charAt(i);
                if(ch>='0' && ch<='9'){
                    used[ch] = true;
                }
            }
            const mm = v.match(/\d{1,2}/g) || [];
            mm.forEach(n => {
                usedTwoDigits[String(n).padStart(2,'0')] = true;
            });
        });
        const miss = [];
        for(let d=0; d<=9; d++){
            const s = String(d);
            if(!used[s]) miss.push(s);
        }
        const missGroups = [];
        TWO_DIGIT_GROUPS.forEach(g => {
            const hit = g.nums.some(n => !!usedTwoDigits[n]);
            if(!hit) missGroups.push(g.name);
        });
        return { show:true, value:miss.join(','), groupValue:missGroups.join(',') };
    }
    replaceChar(replaceChar, index) {
        let firstPart = this.state.typeStr.substr(0, index);
        let lastPart = this.state.typeStr.substr(index + 1);
          
        let newString = firstPart + replaceChar + lastPart;
        return newString;
    }
    render2D(){
        return(
            <View>
                <View style={{
                    flexDirection:'row',
                    marginTop:15,
                    marginBottom:2
                }}>
                    <View style={{
                        flex:4,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].starttime}
                        </Text>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].morning}
                        </Text>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].evening}
                        </Text>
                    </View>
                </View>
                <View style={{
                    flexDirection:'row',
                    marginBottom:5
                }}>
                    <View style={{
                        flex:4,
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'date',
                                showPicker:true,
                                pickType:'StartDate2D',
                                pickerValue:this.state.StartDate2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.StartDate2D}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={calendarIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'time',
                                showPicker:true,
                                pickType:'StartAMTime2D',
                                pickerValue:this.state.StartAMTime2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.StartAMTime2D.format('h:mm A')}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={downIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                        }} onPress={()=>{
                            this.setState({
                                mode:'time',
                                showPicker:true,
                                pickType:'StartPMTime2D',
                                pickerValue:this.state.StartPMTime2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.StartPMTime2D.format('h:mm A')}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={downIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{
                    flexDirection:'row',
                    marginBottom:2
                }}>
                    <View style={{
                        flex:4,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].endtime}
                        </Text>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].morning}
                        </Text>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].evening}
                        </Text>
                    </View>
                </View>
                <View style={{
                    flexDirection:'row',
                    marginBottom:5
                }}>
                    <View style={{
                        flex:4,
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'date',
                                showPicker:true,
                                pickType:'EndDate2D',
                                pickerValue:this.state.EndDate2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.EndDate2D}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={calendarIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'time',
                                showPicker:true,
                                pickType:'EndAMTime2D',
                                pickerValue:this.state.EndAMTime2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.EndAMTime2D.format('h:mm A')}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={downIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                        }} onPress={()=>{
                            this.setState({
                                mode:'time',
                                showPicker:true,
                                pickType:'EndPMTime2D',
                                pickerValue:this.state.EndPMTime2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.EndPMTime2D.format('h:mm A')}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={downIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                        {word[this.props.navigation.state.params.lg].break}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.break2D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({break2D:text})}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                        {word[this.props.navigation.state.params.lg].unitprice}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.unitPrice2D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({unitPrice2D:text})}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                         {word[this.props.navigation.state.params.lg].winnum}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.winNum2D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>{
                                if(text.length>2){
                                    return;
                                }
                                this.setState({winNum2D:text})
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    }
    renderEdit2D(){
        return(
            <View>
                <View style={{
                    height:50,
                    marginHorizontal:5,
                    marginVertical:10,
                    flexDirection:'row',
                    borderColor:Color.DIVIDERCOLOR,
                    borderWidth:1,
                    borderRadius:5,
                    padding:3
                }}>
                    <TextInput
                        style={styles.input}
                        placeholder={word[this.props.navigation.state.params.lg].term}
                        placeholderTextColor={'#262626'}
                        value={this.state.editname}
                        underlineColorAndroid="transparent"
                        onChangeText={(text)=>this.setState({editname:text})}
                    />
                </View>
                <View style={{
                    flexDirection:'row',
                    marginBottom:5
                }}>
                    <View style={{
                        width:80,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].starttime}
                        </Text>
                    </View>
                    <View style={{
                        flex:4,
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'date',
                                showPicker:true,
                                pickType:'StartDate2D',
                                pickerValue:this.state.StartDate2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.StartDate2D}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={calendarIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'time',
                                showPicker:true,
                                pickType:'StartAMTime2D',
                                pickerValue:this.state.StartAMTime2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.StartAMTime2D.format('h:mm A')}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={downIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{
                    flexDirection:'row',
                    marginBottom:5
                }}>
                    <View style={{
                        width:80,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].endtime}
                        </Text>
                    </View>
                    <View style={{
                        flex:4,
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'date',
                                showPicker:true,
                                pickType:'EndDate2D',
                                pickerValue:this.state.EndDate2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.EndDate2D}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={calendarIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'time',
                                showPicker:true,
                                pickType:'EndAMTime2D',
                                pickerValue:this.state.EndAMTime2D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.EndAMTime2D.format('h:mm A')}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={downIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                        {word[this.props.navigation.state.params.lg].break}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.break2D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({break2D:text})}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                        {word[this.props.navigation.state.params.lg].unitprice}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.unitPrice2D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({unitPrice2D:text})}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                         {word[this.props.navigation.state.params.lg].winnum}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.winNum2D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>{
                                if(text.length>2){
                                    return;
                                }
                                this.setState({winNum2D:text})
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    }
    generateWinNum(var_num){
        let bot=(parseInt(var_num)-1)
        let top=(parseInt(var_num)+1)
        var arr=Array.from(var_num)
        let t=bot>-1?[
            {
                num:bot<10?'00'+bot:bot<100?'0'+bot:bot.toString(),
                same:false
            },
            {
                num:top<10?'00'+top:top<100?'0'+top:top.toString(),
                same:false
            }
        ]:
        [
            {
                num:top<10?'00'+top:top<100?'0'+top:top.toString(),
                same:false
            }
        ]
        if(arr[0]==arr[1]&&arr[1]==arr[2]&&arr[0]==arr[2]){
            // t.push({
            //     num:var_num,
            //     same:true
            // })  
        }else if(arr[0]==arr[1]||arr[0]==arr[2]||arr[1]==arr[2]){
            for(let i=0;i<3;i++){
                if(i==0){
                    // t.push({
                    //     num:arr[0]+arr[1]+arr[2],
                    //     same:true
                    // }) 
                }else if(i==1){
                    if(arr[0]==arr[1]){
                        t.push({
                            num:arr[0]+arr[2]+arr[1],
                            same:false
                        }) 
                    }else if(arr[1]==arr[2]){
                        t.push({
                            num:arr[1]+arr[0]+arr[2],
                            same:false
                        })
                    }else{
                        t.push({
                            num:arr[0]+arr[2]+arr[1],
                            same:false
                        })
                    }
                    
                }else{
                    if(arr[0]==arr[1]){
                        t.push({num:arr[2]+arr[0]+arr[1],same:false})
                    }else if(arr[1]==arr[2]){
                        t.push({num:arr[1]+arr[2]+arr[0],same:false})
                    }else{
                        t.push({num:arr[1]+arr[2]+arr[0],same:false})
                    }
                }
            }
        }else{
            for(let i=0;i<6;i++){
                if(i==0){
                    // t.push({num:arr[0]+arr[1]+arr[2],same:true}) 
                }else if(i==1){
                    t.push({num:arr[0]+arr[2]+arr[1],same:false})
                }else if(i==2){
                    t.push({num:arr[1]+arr[0]+arr[2],same:false})
                }else if(i==3){
                    t.push({num:arr[1]+arr[2]+arr[0],same:false})
                }else if(i==4){
                    t.push({num:arr[2]+arr[0]+arr[1],same:false})
                }else {
                    t.push({num:arr[2]+arr[1]+arr[0],same:false})
                }
            } 
        
        }
        return t;
    }
    render3D(){
        return(
            <View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0,marginVertical:10}]}>
                        <TextInput
                            style={styles.input}
                            placeholder={word[this.props.navigation.state.params.lg].term}
                            placeholderTextColor={'#262626'}
                            value={this.state.termName}
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({termName:text})}
                        />
                    </View>
                </View>
                <View style={{
                    flexDirection:'row',
                    marginBottom:5
                }}>
                    <View style={{
                        width:80,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].starttime}
                        </Text>
                    </View>
                    <View style={{
                        flex:4,
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'date',
                                showPicker:true,
                                pickType:'StartDate3D',
                                pickerValue:this.state.StartDate3D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.StartDate3D}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={calendarIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'time',
                                showPicker:true,
                                pickType:'StartTime3D',
                                pickerValue:this.state.StartTime3D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.StartTime3D.format('h:mm A')}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={downIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{
                    flexDirection:'row',
                    marginBottom:5
                }}>
                    <View style={{
                        width:80,
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                        }}>
                            {word[this.props.navigation.state.params.lg].endtime}
                        </Text>
                    </View>
                    <View style={{
                        flex:4,
                        flexDirection:'row'
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'date',
                                showPicker:true,
                                pickType:'EndDate3D',
                                pickerValue:this.state.EndDate3D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.EndDate3D}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={calendarIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flex:3,
                    }}>
                        <TouchableOpacity style={{
                            flex:1,
                            flexDirection:'row',
                            padding:5,
                            borderWidth:1,
                            borderColor:Color.DIVIDERCOLOR,
                            borderRadius:5,
                            marginRight:3
                        }} onPress={()=>{
                            this.setState({
                                mode:'time',
                                showPicker:true,
                                pickType:'EndTime3D',
                                pickerValue:this.state.EndTime3D
                            })
                        }}>
                            <Text style={{fontFamily:'Roboto-Bold',fontSize:14}}>
                                {this.state.EndTime3D.format('h:mm A')}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Image source={downIcon} style={{height:20,width:20}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                        {word[this.props.navigation.state.params.lg].break}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.break3D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({break3D:text})}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                        {word[this.props.navigation.state.params.lg].unitprice}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.unitPrice3D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({unitPrice3D:text})}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            width:80
                        }}>
                         {word[this.props.navigation.state.params.lg].winnum}
                    </Text>
                    <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#262626'}
                            value={this.state.winNum3D}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>{
                                
                                if((this.state.type=='3D'&&text.length>3)||this.state.type=='4D'&&text.length>4){
                                    return;
                                    console.log(text.length)
                                }
                                this.setState({winNum3D:text})
                            }}
                        />
                    </View>
                    {
                        this.state.type=='3D'&&
                        <TouchableOpacity style={{
                        width:60,
                        height:40,
                        alignItems:'center',
                        justifyContent:'center',
                        borderWidth:1,
                        borderColor:Color.DIVIDERCOLOR,
                        borderRadius:5,
                        marginLeft:5,
                        backgroundColor:this.state.reverse?Color.DIVIDERCOLOR:Color.GREYCOLOR
                    }} onPress={()=>{
                        if(this.state.winNum3D.length!=3){
                            Alert.alert(config.AppName,'WinNum must have 3 characters!')
                            return;
                        }
                        let str=''
                        let arr=this.generateWinNum(this.state.winNum3D)
                        arr.map((value,index)=>{
                            str+=value.num+','
                        })
                        this.setState({
                            reverse:!this.state.reverse,
                            reverseNum:str
                        })
                    }}>
                        <Text style={{
                                color:Color.DARKPRIMARYTEXTCOLOR,
                                fontSize:16,
                                
                            }}>
                            {word[this.props.navigation.state.params.lg].c}
                        </Text>
                    </TouchableOpacity>
                    }
                    
                </View>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                            {
                                this.state.type=='3D'&&
                                <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                        onPress={()=>{
                            this.setState({
                                winNumOnly:!this.state.winNumOnly
                            })
                        }}>
                        <Image source={this.state.winNumOnly?tickIcon:untickIcon} 
                        style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                        <Text style={{color:'#262626',fontSize:16,}}>
                            {word[this.props.navigation.state.params.lg].cnot}
                        </Text>
                    </TouchableOpacity>
                            }
                            {
                                this.state.type=='3D'&&
                                <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:16,
                            
                            marginHorizontal:10
                        }}>
                         {word[this.props.navigation.state.params.lg].prize}
                    </Text>
                            }
                   
                    {
                        !this.state.winNumOnly?null:
                        <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={'#262626'}
                                value={this.state.prize3D}
                                keyboardType='decimal-pad'
                                underlineColorAndroid="transparent"
                                onChangeText={(text)=>this.setState({prize3D:text})}
                            />
                        </View>
                    }
                </View>
                {this.state.reverse&&this.state.type=='3D'?
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Text style={{
                                color:Color.DARKPRIMARYTEXTCOLOR,
                                fontSize:16,
                                
                                width:80
                            }}>
                            တွတ်
                        </Text>
                        <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={'#262626'}
                                value={this.state.reverseNum}
                                underlineColorAndroid="transparent"
                            />
                        </View>
                    </View>:null
                }
                
            </View>
        )
    }
    clearState(){
        let now = new Date();
        this.setState({
            showNewModal:false,
            type:'2D',
            showPicker:false,
            mode:'date',
            pickType:'StartDate2D',
            pickerValue:moment().format('DD/MM/YYYY'),
            StartDate2D:moment().format('DD/MM/YYYY'),
            StartAMTime2D:moment('9:00:00',"HH:mm"),
            StartPMTime2D:moment('13:00:00',"HH:mm"),
            EndDate2D:moment(new Date(now.getFullYear(), now.getMonth(), now.getDate()+4, 0,0,0,0)).format('DD/MM/YYYY'),
            EndAMTime2D:moment('11:58:00',"HH:mm"),
            EndPMTime2D:moment('16:03:00',"HH:mm"),
            StartDate3D:moment().format('DD/MM/YYYY'),
            StartTime3D:moment('9:00:00',"HH:mm"),
            EndDate3D:moment(new Date(now.getFullYear(), now.getDate()>16?now.getMonth()+1:now.getMonth(),now.getDate()>16?1:16, 0,0,0,0)).format('DD/MM/YYYY'),
            EndTime3D:moment('11:58:00',"HH:mm"),
            break2D:'',
            break3D:'',
            unitPrice2D:'1',
            unitPrice3D:'1',
            winNum2D:'',
            winNum3D:'',
            winNumOnly:false,
            prize3D:'',
            reverse:false,
            reverseNum:'',
            termName:'',
            editTermId:null,
            editTermDetailsId:null,
            editname:''
        })
    }
    renderNewModal(){
        return(
            <Modal
            transparent={true}
            visible={this.state.showNewModal}
            onRequestClose={()=>{
                this.clearState()
            }}
            >
                <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',paddingVertical:15,width:width-10,borderRadius:5,paddingHorizontal:10}}>
                        {
                            !this.state.editTermId?
                            <View style={{
                                flexDirection:'row',
                                marginHorizontal:5,
                                marginVertical:5,
                                justifyContent:'center'
                            }}>
                                <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                                    onPress={()=>{
                                        this.setState({
                                            type:'2D'
                                        })
                                    }}>
                                    <Image source={this.state.type=='2D'?radio_btn_selected:radio_btn_unselected} 
                                    style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                                    <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>2D</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                                    onPress={()=>{
                                        this.setState({
                                            type:'3D'
                                        })
                                    }}>
                                    <Image source={this.state.type=='3D'?radio_btn_selected:radio_btn_unselected} 
                                    style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                                    <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>3D</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                                    onPress={()=>{
                                        this.setState({
                                            type:'4D'
                                        })
                                    }}>
                                    <Image source={this.state.type=='4D'?radio_btn_selected:radio_btn_unselected} 
                                    style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                                    <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>4D</Text>
                                </TouchableOpacity>
                            </View>
                            :null
                        }
                        {this.state.type=='2D' && (
                            <View style={{marginHorizontal:5,marginVertical:5}}>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Text style={{width:80,color:'#262626',fontSize:16,fontWeight:'bold'}}>အကြိမ်</Text>
                                    <View style={{flex:1,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:5}}>
                                        <Picker
                                            mode='dropdown'
                                            selectedValue={this.state.new2DCount}
                                            style={{height:40}}
                                            onValueChange={(v)=>this.onChangeNew2DCount(v)}
                                        >
                                            <Picker.Item label='2' value='2' />
                                            <Picker.Item label='3' value='3' />
                                            <Picker.Item label='4' value='4' />
                                            <Picker.Item label='5' value='5' />
                                            <Picker.Item label='6' value='6' />
                                            <Picker.Item label='7' value='7' />
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                        )}
                        
                        {
                            this.state.type=='2D'&&this.state.editTermId?
                            this.renderEdit2D():
                            this.state.type=='2D'&&!this.state.editTermId?
                            this.render2D():this.render3D()
                        }
                        <View style={{flexDirection:'row',marginVertical:10}}>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:'#EF7B49',paddingVertical:8
                                ,borderRadius:7,marginHorizontal:10}} onPress={()=>{
                                    if(this.state.editTermId){
                                        if(this.state.type=='2D'){

                                            //  =======> update Term for 2D <=======

                                            let Enddatetime=(this.state.EndDate2D+' ' +this.state.EndAMTime2D.format('h:mm A'));
                                            let startdatetime=(this.state.StartDate2D + ' ' + this.state.StartAMTime2D.format('h:mm A'));
                                            //Start Date
                                            let day1=this.state.StartDate2D.split('/')[0]
                                            let month1=this.state.StartDate2D.split('/')[1]
                                            let year1=this.state.StartDate2D.split('/')[2]
                                            let hr1=parseInt(this.state.StartAMTime2D.format('H:mm').split(':')[0])
                                            let mm1=parseInt(this.state.StartAMTime2D.format('h:mm A').split(' ')[0].split(':')[1])
                                            //End Date
                                            let day=this.state.EndDate2D.split('/')[0]
                                            let month=this.state.EndDate2D.split('/')[1]
                                            let year=this.state.EndDate2D.split('/')[2]
                                            let hr=parseInt(this.state.EndAMTime2D.format('H:mm').split(':')[0])
                                            let mm=parseInt(this.state.EndAMTime2D.format('h:mm A').split(' ')[0].split(':')[1])
                                            //  StartTime:moment(new Date(year,month-1,day,hr,mm)).format('YYYY-MM-DDTHH:mm:ss'),
                                            //  EndTime:moment(new Date(year1,month1-1,day1,hr1,mm1)).format('YYYY-MM-DDTHH:mm:ss'),
                                            // StartTime:new Date(year,month-1,day,hr,mm),
                                            // EndTime:new Date(year1,month1-1,day1,hr1,mm1),
                                            let temp=
                                                //[
                                                {
                                                    TermID:this.state.editTermId,
                                                    TermDetailID:this.state.editTermDetailsId,
                                                    LottType:'2D',
                                                    Name:this.state.editname,
                                                    TermName:this.state.termName,
                                                    UnitPrice:this.state.unitPrice2D,
                                                    UnitBreak:this.state.break2D,
                                                    StartTime:moment(new Date(year1,month1-1,day1,hr1,mm1)).format('YYYY-MM-DDTHH:mm:ss'),
                                                    EndTime:moment(new Date(year,month-1,day,hr,mm)).format('YYYY-MM-DDTHH:mm:ss'),
                                                    StartTimeSave:startdatetime,
                                                    EndTimeSave:Enddatetime,
                                                    WinNum:this.state.winNum2D,
                                                    WinNumOnly:false,
                                                    Prize:0
                                                }
                                            //]
                                            console.warn('2d',temp)
                                            //console.log(temp[0])
                                            let extra=this.props.navigation.state.params.user[0].UseMoneyInOut?
                                            `&CreatedUserID=${this.props.navigation.state.params.user[0].UserID}&CreatedUserName=${this.props.navigation.state.params.user[0].UserNo}`:''
                                            dal.updateTerm(this.props.navigation.state.params.endpoint,false,temp,extra,(err,resp)=>{
                                                if(err){
                                                    console.log(err)
                                                }else{
                                                    console.log(resp)
                                                    if(resp=='OK'){
                                                        this.setState({
                                                            type:'2D',
                                                            showNewModal:false,
                                                        },()=>{
                                                            this.clearState()
                                                            this.getAllTerms()
                                                            this.getTerms()
                                                        })
                                                    }
                                                }
                                            })
                                        }else{
                                            //  =======> update Term for 3D <=======

                                            let Enddatetime=(this.state.EndDate3D+' ' +this.state.EndTime3D.format('h:mm A'));
                                            let startdatetime=(this.state.StartDate3D + ' ' + this.state.StartTime3D.format('h:mm A'));
                                            //Start Date
                                            let day1=this.state.StartDate3D.split('/')[0]
                                            let month1=this.state.StartDate3D.split('/')[1]
                                            let year1=this.state.StartDate3D.split('/')[2]
                                            let hr1=parseInt(this.state.StartTime3D.format('H:mm').split(':')[0])
                                            let mm1=parseInt(this.state.StartTime3D.format('h:mm A').split(' ')[0].split(':')[1])
                                            //End Date
                                            let day=this.state.EndDate3D.split('/')[0]
                                            let month=this.state.EndDate3D.split('/')[1]
                                            let year=this.state.EndDate3D.split('/')[2]
                                            let hr=parseInt(this.state.EndTime3D.format('H:mm').split(':')[0])
                                            let mm=parseInt(this.state.EndTime3D.format('h:mm A').split(' ')[0].split(':')[1])
                                            let temp=
                                                //[
                                                {
                                                    TermID:this.state.editTermId,
                                                    TermDetailID:this.state.editTermDetailsId,
                                                    LottType:this.state.type,
                                                    Name:this.state.termName,
                                                    TermName:this.state.termName,
                                                    UnitPrice:this.state.unitPrice3D,
                                                    UnitBreak:this.state.break3D,
                                                    StartTime:moment(new Date(year1,month1-1,day1,hr1,mm1)).format('YYYY-MM-DDTHH:mm:ss'),
                                                    EndTime:moment(new Date(year,month-1,day,hr,mm)).format('YYYY-MM-DDTHH:mm:ss'),
                                                    StartTimeSave:startdatetime,
                                                    EndTimeSave:Enddatetime,
                                                    WinNum:this.state.winNum3D,
                                                    WinNumOnly:this.state.winNumOnly,
                                                    Prize:this.state.prize3D==''?0:parseInt(this.state.prize3D)
                                                }
                                            //]
                                            console.warn('3d',temp)
                                            //this.state.reverseNum==''?false:true
                                            let extra=this.props.navigation.state.params.user[0].UseMoneyInOut?
                                            `&CreatedUserID=${this.props.navigation.state.params.user[0].UserID}&CreatedUserName=${this.props.navigation.state.params.user[0].UserNo}`:''
                                            dal.updateTerm(this.props.navigation.state.params.endpoint,this.state.type=='4D'?true:this.state.reverseNum==''?false:true,temp,extra,(err,resp)=>{
                                                if(err){
                                                    console.log(err)
                                                }else{
                                                    console.log(resp)
                                                    if(resp=='OK'){
                                                        this.setState({
                                                            type:'2D',
                                                            showNewModal:false,
                                                        },()=>{
                                                            this.clearState()
                                                            this.getAllTerms()
                                                            this.getTerms()
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    }else{


                                        //===========> new Term <==========

                                        if(this.state.type=='2D'){
                                            let start=moment(this.state.StartDate2D, "DD-MM-YYYY")
                                            let end=moment(this.state.EndDate2D, "DD-MM-YYYY")
                                            var duration = moment.duration(start.diff(end)).asDays();
                                            const loopCount=(Math.abs(duration)+1)*2
                                            console.log("loopCount ",loopCount)
                                            let temp=[]
                                            console.log(this.state.EndDate2D)
                                            let fname=`${this.state.StartDate2D.split('/')[0]} TO ${this.state.EndDate2D.replace(/\//g, '.')} 2D`
                                            console.log(fname)
                                            //moment(new Date(now.getFullYear(), now.getMonth(), now.getDate()+4, 0,0,0,0)).format('DD/MM/YYYY')
                                            let startDate=this.state.StartDate2D
                                            console.log('initial ',startDate)
                                            for(let i=0;i<loopCount;i++){
                                                if(i%2==0){
                                                    //new Term for 2D AM
                                                    let Enddatetime=(startDate+' ' +this.state.EndAMTime2D.format('h:mm A'));
                                                    let startdatetime=(startDate + ' ' + this.state.StartAMTime2D.format('h:mm A'));
                                                    //Start Date
                                                    let day1=startDate.split('/')[0]
                                                    let month1=startDate.split('/')[1]
                                                    let year1=startDate.split('/')[2]
                                                    let hr1=this.state.StartAMTime2D.format('h:mm A').split(' ')[1]=='PM'?parseInt(this.state.StartAMTime2D.format('h:mm A').split(' ')[0].split(':')[0])+12
                                                    :parseInt(this.state.StartAMTime2D.format('h:mm A').split(' ')[0].split(':')[0])
                                                    let mm1=parseInt(this.state.StartAMTime2D.format('h:mm A').split(' ')[0].split(':')[1])
                                                    //End Date
                                                    let day=startDate.split('/')[0]
                                                    let month=startDate.split('/')[1]
                                                    let year=startDate.split('/')[2]
                                                    let hr=this.state.EndAMTime2D.format('h:mm A').split(' ')[1]=='PM'?parseInt(this.state.EndAMTime2D.format('h:mm A').split(' ')[0].split(':')[0])+12
                                                    :parseInt(this.state.EndAMTime2D.format('h:mm A').split(' ')[0].split(':')[0])
                                                    let mm=parseInt(this.state.EndAMTime2D.format('h:mm A').split(' ')[0].split(':')[1])
                                                    
                                                    temp.push(
                                                        {
                                                            TermID:null,
                                                            TermDetailID:null,
                                                            LottType:'2D',
                                                            Name:`2D (${startDate}) AM`,
                                                            TermName:null,
                                                            UnitPrice:this.state.unitPrice2D,
                                                            UnitBreak:this.state.break2D,
                                                            StartTime:moment(new Date(year1,month1-1,day1,hr1,mm1)).format('YYYY-MM-DDTHH:mm:ss'),
                                                            EndTime:moment(new Date(year,month-1,day,hr,mm)).format('YYYY-MM-DDTHH:mm:ss'),
                                                            StartTimeSave:startdatetime,
                                                            EndTimeSave:Enddatetime,
                                                            WinNum:this.state.winNum2D,
                                                            WinNumOnly:false,
                                                            Prize:0
                                                        }
                                                    )
                                                }else{
                                                    //new Term for 2D PM
                                                    let Enddatetime=(startDate+' ' +this.state.EndPMTime2D.format('h:mm A'));
                                                    let startdatetime=(startDate + ' ' + this.state.StartPMTime2D.format('h:mm A'));
                                                    //Start Date
                                                    let day1=startDate.split('/')[0]
                                                    let month1=startDate.split('/')[1]
                                                    let year1=startDate.split('/')[2]
                                                    let hr1=this.state.StartPMTime2D.format('h:mm A').split(' ')[1]=='PM'?parseInt(this.state.StartPMTime2D.format('h:mm A').split(' ')[0].split(':')[0])+12
                                                    :parseInt(this.state.StartPMTime2D.format('h:mm A').split(' ')[0].split(':')[0])
                                                    let mm1=parseInt(this.state.StartPMTime2D.format('h:mm A').split(' ')[0].split(':')[1])
                                                    //End Date
                                                    let day=startDate.split('/')[0]
                                                    let month=startDate.split('/')[1]
                                                    let year=startDate.split('/')[2]
                                                    let hr=this.state.EndPMTime2D.format('h:mm A').split(' ')[1]=='PM'?parseInt(this.state.EndPMTime2D.format('h:mm A').split(' ')[0].split(':')[0])+12
                                                    :parseInt(this.state.EndPMTime2D.format('h:mm A').split(' ')[0].split(':')[0])
                                                    let mm=parseInt(this.state.EndPMTime2D.format('h:mm A').split(' ')[0].split(':')[1])
                                                    
                                                    temp.push(
                                                        {
                                                            TermID:null,
                                                            TermDetailID:null,
                                                            LottType:'2D',
                                                            Name:`2D (${startDate}) PM`,
                                                            TermName:null,
                                                            UnitPrice:this.state.unitPrice2D,
                                                            UnitBreak:this.state.break2D,
                                                            StartTime:moment(new Date(year1,month1-1,day1,hr1,mm1)).format('YYYY-MM-DDTHH:mm:ss'),
                                                            EndTime:moment(new Date(year,month-1,day,hr,mm)).format('YYYY-MM-DDTHH:mm:ss'),
                                                            StartTimeSave:startdatetime,
                                                            EndTimeSave:Enddatetime,
                                                            WinNum:this.state.winNum2D,
                                                            WinNumOnly:false,
                                                            Prize:0
                                                        }
                                                    )
                                                    let t=moment(startDate, "DD-MM-YYYY").add(1,'days')
                                                    console.log(t.format('DD/MM/YYYY'))
                                                    startDate=t.format('DD/MM/YYYY');
                                                    //start=moment(new Date(start.getFullYear(), start.getMonth(), start.getDate()+1, 0,0,0,0)).format('DD-MM-YYYY')
                                                }
                                            }
                                            console.log(temp)
                                            dal.saveTerm(this.props.navigation.state.params.endpoint,fname,temp,this.state.new2DCount,'2D',(err,resp)=>{
                                                if(err){
                                                    console.log(err)
                                                }else{
                                                    console.log(resp)
                                                    if(resp=='OK'){
                                                        this.setState({
                                                            type:'2D',
                                                            showNewModal:false,
                                                        },()=>{
                                                            this.clearState()
                                                            this.getAllTerms()
                                                            this.getTerms()
                                                        })
                                                    }
                                                    console.log(resp)
                                                }
                                            })
                                        }else{
                                            //new Term for 3D
                                            let Enddatetime=(this.state.EndDate3D+' ' +this.state.EndTime3D.format('h:mm A'));
                                            let startdatetime=(this.state.StartDate3D + ' ' + this.state.StartTime3D.format('h:mm A'));
                                            //Start Date
                                            let day1=this.state.StartDate3D.split('/')[0]
                                            let month1=this.state.StartDate3D.split('/')[1]
                                            let year1=this.state.StartDate3D.split('/')[2]
                                            let hr1=this.state.StartTime3D.format('h:mm A').split(' ')[1]=='PM'?parseInt(this.state.StartTime3D.format('h:mm A').split(' ')[0].split(':')[0])+12
                                            :parseInt(this.state.StartTime3D.format('h:mm A').split(' ')[0].split(':')[0])
                                            let mm1=parseInt(this.state.StartTime3D.format('h:mm A').split(' ')[0].split(':')[1])
                                            //End Date
                                            let day=this.state.EndDate3D.split('/')[0]
                                            let month=this.state.EndDate3D.split('/')[1]
                                            let year=this.state.EndDate3D.split('/')[2]
                                            let hr=this.state.EndTime3D.format('h:mm A').split(' ')[1]=='PM'?parseInt(this.state.EndTime3D.format('h:mm A').split(' ')[0].split(':')[0])+12
                                            :parseInt(this.state.EndTime3D.format('h:mm A').split(' ')[0].split(':')[0])
                                            let mm=parseInt(this.state.EndTime3D.format('h:mm A').split(' ')[0].split(':')[1])
                                            console.log(new Date(year1,month1-1,day1,hr1,mm1))
                                           console.log(new Date(year,month-1,day,hr,mm))
                                            //  StartTime:moment(new Date(year,month-1,day,hr,mm)).format('YYYY-MM-DDTHH:mm:ss'),
                                            //  EndTime:moment(new Date(year1,month1-1,day1,hr1,mm1)).format('YYYY-MM-DDTHH:mm:ss'),
                                            // StartTime:new Date(year,month-1,day,hr,mm),
                                            // EndTime:new Date(year1,month1-1,day1,hr1,mm1),
                                            let temp=[
                                                {
                                                    TermID:null,
                                                    TermDetailID:null,
                                                    LottType:this.state.type,
                                                    Name:this.state.termName,
                                                    TermName:this.state.termName,
                                                    UnitPrice:this.state.unitPrice3D,
                                                    UnitBreak:this.state.break3D,
                                                    StartTime:moment(new Date(year1,month1-1,day1,hr1,mm1)).format('YYYY-MM-DDTHH:mm:ss'),
                                                    EndTime:moment(new Date(year,month-1,day,hr,mm)).format('YYYY-MM-DDTHH:mm:ss'),
                                                    StartTimeSave:this.state.StartDate3D + ' ' + this.state.StartTime3D.format('h:mm A'),
                                                    EndTimeSave:Enddatetime,
                                                    WinNum:this.state.winNum3D,
                                                    WinNumOnly:this.state.winNumOnly,
                                                    Prize:0
                                                }
                                            ]
                                            dal.saveTerm(this.props.navigation.state.params.endpoint,this.state.termName,temp,(err,resp)=>{
                                                if(err){
                                                    console.log(err)
                                                }else{
                                                    console.log(resp)
                                                    if(resp=='OK'){
                                                        this.setState({
                                                            type:'2D',
                                                            showNewModal:false,
                                                        },()=>{
                                                            this.clearState()
                                                            this.getAllTerms()
                                                            this.getTerms()
                                                        })
                                                    }
                                                    console.log(resp)
                                                }
                                            })
                                        }
                                    }
                                    
                                // if(this.state.agentId=='NoAgent'){
                                //     Alert.alert(config.AppName,'Please Choose Agent!')
                                //     return;
                                // }
                                // if(this.state.userNo==''){
                                //     Alert.alert(config.AppName,'Please enter username!')
                                //     return;
                                // }
                                // if(this.state.password==''){
                                //     Alert.alert(config.AppName,'Please enter password!')
                                //     return;
                                // }
                                
                                }}>
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>
                                    SAVE 
                                </Text>
                            </TouchableOpacity>
                            
                        </View>
                        
                    </View>
                </View>
            </Modal>
        )
    }
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
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
                    <View>
                        <Text style={{ color: '#fff', fontSize: 12 }}>
                            {config.AppName || 'App'}
                        </Text>
                        <Text style={{color:'#fff',fontSize:18}}>
                            {word[this.props.navigation.state.params.lg].term}
                        </Text>
                    </View>
                </View>
                <View style={{flex:1}} />
                <TouchableOpacity
                    style={{
                        marginRight:10,
                        paddingHorizontal:12,
                        paddingVertical:6,
                        borderRadius:5,
                        backgroundColor:Color.Green
                    }}
                    onPress={()=>{
                        this.setState({ showCustomModal:true }, () => {
                            this.setCustomCount(this.state.customCount || '3')
                        })
                    }}
                >
                    <Text style={{color:'#fff',fontSize:14,fontWeight:'bold'}}>Custom</Text>
                </TouchableOpacity>
            </View>
        )
    }
    setCustomCount(v){
        const count = parseInt(v, 10) || 3;
        const buildDefaults = () => {
            const rows = [];
            for (let i = 0; i < count; i++) {
                rows.push({
                    startTime: moment('09:00:00', "HH:mm"),
                    endTime: moment('10:00:00', "HH:mm")
                });
            }
            return rows;
        };
        this.setState({
            customCount: v,
            customTimeGroups: buildDefaults()
        }, () => {
            dal.getCustomTimeList(this.props.navigation.state.params.endpoint, v, (err, resp) => {
                if (err || !resp) return;
                const list = Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
                if (!list.length) return;
                const parsed = buildDefaults();
                list.forEach((item) => {
                    const gi = (parseInt(item.GroupName, 10) || 0) - 1;
                    if (gi < 0 || gi >= parsed.length) return;
                    const st = moment(item.StartTime, ['h:mm A', 'HH:mm', moment.ISO_8601], true);
                    const et = moment(item.EndTime, ['h:mm A', 'HH:mm', moment.ISO_8601], true);
                    parsed[gi] = {
                        startTime: st.isValid() ? st : parsed[gi].startTime,
                        endTime: et.isValid() ? et : parsed[gi].endTime
                    };
                });
                this.setState({ customTimeGroups: parsed });
            });
        });
    }
    onChangeNew2DCount(v){
        if(v == '2'){
            this.setState({ new2DCount:'2' });
            return;
        }
        this.setState({ new2DCount:v, loading:true }, () => {
            dal.getCustomTimeList(this.props.navigation.state.params.endpoint, v, (err, resp) => {
                const list = !err && resp ? (Array.isArray(resp.Data) ? resp.Data : (Array.isArray(resp) ? resp : [])) : [];
                if (!list.length) {
                    this.setState({ loading:false, new2DCount:'2' });
                    Alert.alert(config.AppName || 'App', 'No data');
                    return;
                }
                this.setState({ loading:false });
            });
        });
    }
    renderCustomModal(){
        return(
            <Modal
                transparent={true}
                visible={this.state.showCustomModal}
                onRequestClose={() => this.setState({ showCustomModal:false })}
            >
                <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',width:(width)-40,borderRadius:8,padding:16,maxHeight:height*0.82}}>
                        <View style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
                            <Text style={{width:70,fontSize:16,color:'#000'}}>အကြိမ်</Text>
                            <View style={{flex:1,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:5}}>
                                <Picker
                                    mode='dropdown'
                                    selectedValue={this.state.customCount}
                                    style={{height:40}}
                                    onValueChange={(v)=>this.setCustomCount(v)}
                                >
                                    <Picker.Item label='3' value='3' />
                                    <Picker.Item label='4' value='4' />
                                    <Picker.Item label='5' value='5' />
                                    <Picker.Item label='6' value='6' />
                                    <Picker.Item label='7' value='7' />
                                </Picker>
                            </View>
                        </View>
                        <ScrollView style={{marginBottom:12}}>
                            {(this.state.customTimeGroups || []).map((g, idx) => (
                                <View key={idx} style={{borderWidth:1,borderColor:'#eee',borderRadius:6,padding:10,marginBottom:8}}>
                                    <Text style={{fontSize:16,fontWeight:'bold',marginBottom:8}}>{`${idx + 1}`}</Text>
                                    <View style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                                        <Text style={{width:90,fontSize:14,color:'#000'}}>Start Time</Text>
                                        <TouchableOpacity
                                            style={{flex:1,height:38,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:5,justifyContent:'center',paddingHorizontal:10}}
                                            onPress={() => this.setState({
                                                mode:'time',
                                                showPicker:true,
                                                pickType:`CustomStart_${idx}`,
                                                pickerValue:g.startTime
                                            })}
                                        >
                                            <Text style={{fontSize:14,color:'#000'}}>{moment(g.startTime).format('h:mm A')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flexDirection:'row',alignItems:'center'}}>
                                        <Text style={{width:90,fontSize:14,color:'#000'}}>End Time</Text>
                                        <TouchableOpacity
                                            style={{flex:1,height:38,borderWidth:1,borderColor:Color.DIVIDERCOLOR,borderRadius:5,justifyContent:'center',paddingHorizontal:10}}
                                            onPress={() => this.setState({
                                                mode:'time',
                                                showPicker:true,
                                                pickType:`CustomEnd_${idx}`,
                                                pickerValue:g.endTime
                                            })}
                                        >
                                            <Text style={{fontSize:14,color:'#000'}}>{moment(g.endTime).format('h:mm A')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity
                                style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#999',paddingVertical:8,borderRadius:7,marginRight:8}}
                                onPress={()=>this.setState({showCustomModal:false})}
                            >
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>CLOSE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:Color.Green,paddingVertical:8,borderRadius:7}}
                                onPress={()=>{
                                    const rows = (this.state.customTimeGroups || []).map((g, idx) => ({
                                        CustomTimeID: 0,
                                        TimeName: this.state.customCount,
                                        GroupName: `${idx + 1}`,
                                        StartTime: moment(g.startTime).format('h:mm A'),
                                        EndTime: moment(g.endTime).format('h:mm A')
                                    }));
                                    this.setState({ loading:true });
                                    dal.saveCustomTime(this.props.navigation.state.params.endpoint, rows, 'New', (err, resp) => {
                                        if (err) {
                                            this.setState({ loading:false });
                                            Alert.alert(config.AppName || 'App','Save failed!');
                                            return;
                                        }
                                        if (resp == 'OK' || resp?.Status == 'OK') {
                                            this.setState({ loading:false, showCustomModal:false });
                                            Alert.alert(config.AppName || 'App','Save successfully!');
                                        } else {
                                            this.setState({ loading:false });
                                            Alert.alert(config.AppName || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp));
                                        }
                                    });
                                }}
                            >
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>SAVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    onChange = (event, selectedDate) => {
        console.log(event)
        if(event.type=='set'){
            if (this.state.pickType && this.state.pickType.indexOf('CustomStart_') === 0) {
                const idx = parseInt(this.state.pickType.split('_')[1], 10);
                this.setState((prevState) => {
                    const arr = [...(prevState.customTimeGroups || [])];
                    if (arr[idx]) {
                        arr[idx] = { ...arr[idx], startTime: moment(selectedDate) };
                    }
                    return { customTimeGroups: arr, showPicker:false };
                });
                return;
            }
            if (this.state.pickType && this.state.pickType.indexOf('CustomEnd_') === 0) {
                const idx = parseInt(this.state.pickType.split('_')[1], 10);
                this.setState((prevState) => {
                    const arr = [...(prevState.customTimeGroups || [])];
                    if (arr[idx]) {
                        arr[idx] = { ...arr[idx], endTime: moment(selectedDate) };
                    }
                    return { customTimeGroups: arr, showPicker:false };
                });
                return;
            }
            switch (this.state.pickType) {
                case 'StartDate2D':
                    if(!this.state.editTermId){
                        this.setState({
                            StartDate2D:moment(selectedDate).format('DD/MM/YYYY'),
                            EndDate2D:moment(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()+4, 0,0,0,0)).format('DD/MM/YYYY'),
                            showPicker:false
                        })
                    }else{
                        this.setState({
                            StartDate2D:moment(selectedDate).format('DD/MM/YYYY'),
                            showPicker:false
                        })
                    }
                    
                    break;
    
                case 'EndDate2D':
                    this.setState({
                        EndDate2D:moment(selectedDate).format('DD/MM/YYYY'),
                        showPicker:false
                    })
                    break;
                
                case 'StartAMTime2D':
                    this.setState({
                        StartAMTime2D:moment(selectedDate),
                        showPicker:false
                    })
                    break;
                case 'StartPMTime2D':
                    this.setState({
                        StartPMTime2D:moment(selectedDate),
                        showPicker:false
                    })
                    break;
                case 'EndAMTime2D':
                    this.setState({
                        EndAMTime2D:moment(selectedDate),
                        showPicker:false
                    })
                    break;
                case 'EndPMTime2D':
                    this.setState({
                        EndPMTime2D:moment(selectedDate),
                        showPicker:false
                    })
                    break; 
                case 'StartDate3D':
                        this.setState({
                            StartDate3D:moment(selectedDate).format('DD/MM/YYYY'),
                            EndDate3D:moment(new Date(selectedDate.getFullYear(), selectedDate.getDate()>16?selectedDate.getMonth()+1:selectedDate.getMonth()
                            , selectedDate.getDate()>16?1:16, 0,0,0,0)).format('DD/MM/YYYY'),
                            showPicker:false
                        })
                    break;
                case 'EndDate3D':
                    this.setState({
                        EndDate3D:moment(selectedDate).format('DD/MM/YYYY'),
                        showPicker:false
                    })
                    break;
                case 'StartTime3D':
                    this.setState({
                        StartTime3D:moment(selectedDate),
                        showPicker:false
                    })
                    break;
                case 'EndTime3D':
                    this.setState({
                        EndTime3D:moment(selectedDate),
                        showPicker:false
                    })
                    break;       
                default:
                    break;
            }
        }else{
            this.setState({
                showPicker:false
            })
        }
        
    };
    renderSaveModal(){
        return(
            <Modal
            transparent={true}
            visible={this.state.showSaveModal}
            onRequestClose={()=>{
                this.setState({
                    showSaveModal:false,
                })
            }}
            >
                <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',padding:5,width:width-10,borderRadius:5}}>
                    <View style={[styles.inputContainer,{height: height * 0.5 - 120,}]}>
                        <TextInput
                            style={[styles.input,{fontSize:16,height: height * 0.5 - 120,
                                textAlignVertical: 'top',}]}
                            placeholderTextColor={'#262626'}
                            value={this.state.terms_conditions.toString()}
                            underlineColorAndroid="transparent"
                            multiline
                            onChangeText={(text)=>this.setState({terms_conditions:text})}
                        />
                    </View>
                        <View style={{flexDirection:'row',marginVertical:10}}>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:'red',paddingVertical:8
                                ,borderRadius:7,marginHorizontal:10}} onPress={()=>{
                                  this.setState({
                                    showSaveModal:false,
                                    terms_conditions:''
                                  })
                                }}>
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>
                                    CANCEL 
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:Color.Green,paddingVertical:8
                                ,borderRadius:7,marginHorizontal:10}} onPress={()=>{
                                    dal.saveRules(this.props.navigation.state.params.endpoint,this.state.selectedValue?.TermDetailID,this.state.terms_conditions,(err,result)=>{
                                        if(err){
                                          console.warn(err)
                                          return;
                                        }else{
                                            console.log(result)
                                            this.setState({
                                                terms_conditions:'',
                                                showSaveModal:false,
                                            })
                                        }
                                        
                                    })
                                }}>
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>
                                  SAVE 
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                    </View>
                </View>
            </Modal>
        )
    }
    renderEditModal(){
        return(
            <Modal
                transparent={true}
                visible={this.state.showEditModal}
                onRequestClose={() => this.setState({showEditModal:false})}
            >
                <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',width:(width)-40,borderRadius:8,padding:16}}>
                        <View style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
                            <Text style={{width:70,fontSize:16,color:'#000'}}>File</Text>
                            <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor={'#262626'}
                                    value={this.state.editFileName}
                                    underlineColorAndroid="transparent"
                                    onChangeText={(text)=>this.setState({editFileName:text})}
                                />
                            </View>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity
                                style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#999',paddingVertical:8,borderRadius:7,marginRight:8}}
                                onPress={()=>this.setState({showEditModal:false})}
                            >
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>CLOSE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:Color.Green,paddingVertical:8,borderRadius:7}}
                                onPress={()=>{
                                    if(this.state.selectedTermId=='All'){
                                        Alert.alert(config.AppName || 'App','Please select file');
                                        return;
                                    }
                                    if((this.state.editFileName || '').trim()==''){
                                        Alert.alert(config.AppName || 'App','Please enter file name');
                                        return;
                                    }
                                    this.setState({loading:true});
                                    dal.updateTerms(this.props.navigation.state.params.endpoint,this.state.selectedTermId,this.state.editFileName.trim(),(err,resp)=>{
                                        if(err){
                                            this.setState({loading:false});
                                            Alert.alert(config.AppName || 'App','Update failed!');
                                            return;
                                        }
                                        if(resp=='OK' || resp?.Status=='OK'){
                                            this.setState({showEditModal:false,loading:false},()=>{
                                                this.getTerms();
                                                this.getAllTerms();
                                            });
                                            Alert.alert(config.AppName || 'App','Update successfully!');
                                        }else{
                                            this.setState({loading:false});
                                            Alert.alert(config.AppName || 'App', typeof resp === 'string' ? resp : JSON.stringify(resp));
                                        }
                                    });
                                }}
                            >
                                <Text style={{fontSize:16,fontFamily:'Roboto',color:'#fff'}}>UPDATE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    render() {
        let date=moment(this.state.pickerValue, "DD-MM-YYYY")
        return (
        <View style={styles.container}>
            {this.renderHeader()}
            <View style={{marginHorizontal:10,marginTop:8,marginBottom:6}}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Text style={{width:50,color:Color.DARKPRIMARYTEXTCOLOR,fontSize:14,fontWeight:'bold'}}>File</Text>
                    <View style={{flex:1,height:40,justifyContent:'center',borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5}}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.selectedTermId}
                            style={{height:40}}
                            onValueChange={(itemValue)=>{
                                const source = this.state.allTermsData || [];
                                const list = this.getFilteredTerms(source, itemValue);
                                const info = itemValue=='All'
                                    ? { show:false, value:'', groupValue:'' }
                                    : this.getMissing2DInfo(list);
                                this.setState({
                                    selectedTermId:itemValue,
                                    dataProvider:dataProvider.cloneWithRows(list),
                                    showMissing2D: info.show,
                                    missing2D: info.value,
                                    missing2DGroups: info.groupValue
                                });
                            }}>
                            <Picker.Item label={'All'} value={'All'} />
                            {this.renderTerms()}
                        </Picker>
                    </View>
                    <TouchableOpacity
                        style={{marginLeft:8,height:40,paddingHorizontal:12,borderRadius:5,backgroundColor:Color.PRIMARYCOLOR,alignItems:'center',justifyContent:'center'}}
                        onPress={()=>{
                            if(this.state.selectedTermId=='All'){
                                Alert.alert(config.AppName || 'App','Please select file');
                                return;
                            }
                            const item = (this.state.terms || []).find(x=>x.TermID==this.state.selectedTermId);
                            this.setState({
                                showEditModal:true,
                                editFileName:item?.Name ? item.Name.toString() : ''
                            });
                        }}
                    >
                        <Text style={{color:'#fff',fontSize:14,fontWeight:'bold'}}>Edit</Text>
                    </TouchableOpacity>
                </View>
                {this.state.showMissing2D && (
                    <Text style={{marginTop:6,color:'#262626',fontSize:15,fontWeight:'bold'}}>{`ပျောက်ဂဏန်း=${this.state.missing2D}`}</Text>
                )}
                {this.state.showMissing2D && this.state.missing2DGroups!='' && (
                    <Text style={{marginTop:4,color:'#262626',fontSize:14,fontWeight:'bold'}}>{`အုပ်စုပျောက်=${this.state.missing2DGroups}`}</Text>
                )}
            </View>
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
                        {word[this.props.navigation.state.params.lg].term}
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
                        {word[this.props.navigation.state.params.lg].starttime}
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
                        {word[this.props.navigation.state.params.lg].endtime}
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
                         {word[this.props.navigation.state.params.lg].winnum}
                    </Text>
                </View>
                <View style={{
                    width:30,
                    height:30,
                }}/>
                <View style={{
                    width:30,
                    height:30,
                }}/>
            </View>
            <View style={{flex:1}}>
                <RecyclerListView layoutProvider={this._layoutProvider} dataProvider={this.state.dataProvider} rowRenderer={this._rowRenderer} />
            </View>
            <View style={{flexDirection:'row',marginVertical:10,alignItems:'center',justifyContent:'space-between',marginHorizontal:10}}>
            <TouchableOpacity 
                style={{
                    paddingVertical:10,
                    flex:1,
                    backgroundColor:Color.PRIMARYCOLOR,
                    borderRadius:5,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'center'
                }} 
                onPress={()=>{
                this.setState({
                    showNewModal:true
                })
                // AsyncStorage.removeItem('token')
                // this.props.navigation.navigate('Login')
                }}>
                <Image source={plusIcon} style={{width:17,height:17,tintColor:'#fff'}}/>
                <Text style={{color:'#fff',fontSize:15,marginLeft:5,}}>
                {word[this.props.navigation.state.params.lg].create}
                </Text>
            </TouchableOpacity>
            </View>
            {this.renderNewModal()}
            {this.renderLoading()}
            {this.renderSaveModal()}
            {this.renderEditModal()}
            {this.renderCustomModal()}
            {this.state.showPicker && (
                <DateTimePicker
                testID="dateTimePicker"
                timeZoneOffsetInMinutes={0}
                value={new Date(date)}
                mode={this.state.mode}
                is24Hour={false}
                display="default"
                onChange={this.onChange}
                />
            )}
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
    msgItemTextTitle: {flex: 3, fontSize: 16, color: '#262626', fontWeight: '900', marginBottom: 8},
    msgItemTextBody: {flex: 1, fontSize: 14.5, fontWeight: '400',},
    msgItemTextDate: {flex: 1, fontSize: 14.5, fontWeight: '400', textAlign: "right",},
    loading: {
        position: 'absolute',
        top: 50,
        left: 150,
    },
    inputContainer: {
        flexDirection: 'row',
        marginHorizontal:10 ,
        marginVertical: 5,
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
