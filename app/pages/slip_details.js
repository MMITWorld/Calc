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
  ScrollView,
  Share,
  PermissionsAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import dal from '../dal.js'
import config from '../config/config.js'
import backIcon from '../assets/images/backward.png'
import Color from '../utils/Color.js';
import word from './data.json'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that,originalUnit='',originalNum='';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
import ViewShot from "react-native-view-shot";
import RNFS from "react-native-fs";
import { BluetoothManager, BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import { value } from 'numeral';
const imageType = "png";
const imagePath = `${RNFS.ExternalDirectoryPath}/image.${imageType}`;

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            dataProvider: dataProvider.cloneWithRows([]),
            showModal:false,
            num:'',
            discount:'',
            saleDetailsId:'',
            unit:'',
            groupId:'',
            showPrintModal:false,
            data:[],
            layoutWidth:58,
            columnCount:2,
            copy:1,
            pSize:"22",
            showPrinterModal:false,
            btDevices:[],
            btPrinterName:''
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
        this._printImageWithRetry = this._printImageWithRetry.bind(this);
        this._getPairedDevices = this._getPairedDevices.bind(this);
        this._ensurePrinterConnected = this._ensurePrinterConnected.bind(this);
        this._connectAndPrint = this._connectAndPrint.bind(this);
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    async componentDidMount() {
        console.log(this.props.navigation.state.params.TermDetailName)
        const pSize=await AsyncStorage.getItem('pSize')||"22"
        const layoutWidth=await AsyncStorage.getItem('layoutWidth')||58
        this.setState({
            pSize:pSize,
            layoutWidth:layoutWidth,
        })
        that=this
        this.getSlipDetails()
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
            }} onPress={()=>{
                this.setState({
                    showModal:true,
                    num:data.Num.toString(),
                    discount:data.Discount.toString(),
                    saleDetailsId:data.SaleDetailID,
                    unit:data.Unit.toString(),
                    groupId:data.GroupID
                })
                originalNum=data.Num.toString()
                originalUnit=data.Unit.toString()
            }}>
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
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.Discount}
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
                        {data.Summary}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
    getSlipDetails(){
        dal.getSlipDetails(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.saleId,(err,resp)=>{
            if(err){
                Alert.alert(config.AppName,'Something went wrong!')
                this.setState({
                    loading:false,
                })
            }else{
                console.log(resp)
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    this.setState({
                        loading:false,
                        dataProvider: dataProvider.cloneWithRows(resp.Data),
                        data:resp.Data
                    })
                }else{
                    Alert.alert(config.AppName,'No Data!')
                    this.setState({
                        loading:false,
                        dataProvider: dataProvider.cloneWithRows([]),
                    })
                }
            }
        })
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
            } catch (e) {}
        }

        const paired = await this._getPairedDevices();
        this.setState({ btDevices: paired, showPrinterModal: true });
        return false;
    }

    async _afterPrintSuccess() {
        this.setState({
            loading: true,
            showPrintModal: false,
            copy: this.state.copy + 1
        });
        dal.updateSlipCopy(
            this.props.navigation.state.params.endpoint,
            this.props.navigation.state.params.saleId,
            (err, resp) => {
                if (err) {
                    Alert.alert(config.AppName, 'Something went wrong!');
                    this.setState({
                        loading: false,
                        copy: this.state.copy - 1
                    });
                } else {
                    if (resp == 'OK') {
                        this.setState({
                            loading: false,
                        });
                    } else {
                        Alert.alert(config.AppName, JSON.parse(resp).Msg);
                        this.setState({
                            loading: false,
                            copy: this.state.copy - 1
                        });
                    }
                }
            }
        );
    }

    async _printImageBase64(imagePath, width) {
        try {
            const base64 = await RNFS.readFile(imagePath, 'base64');
            await BluetoothEscposPrinter.printerInit();
            await BluetoothEscposPrinter.printPic(base64, { width: width, left: 0 });
            await BluetoothEscposPrinter.printAndFeed(2);
            await this._afterPrintSuccess();
        } catch (e) {
            Alert.alert(config.AppName, 'Print failed!');
        }
    }

    async _printImageWithRetry(imagePath, width) {
        this._pendingPrintImage = { imagePath, width };
        const ready = await this._ensurePrinterConnected();
        if (!ready) return;
        await this._printImageBase64(imagePath, width);
    }

    async _connectAndPrint(item) {
        try {
            await BluetoothManager.connect(item.address);
            await AsyncStorage.setItem('bt_printer_address', item.address);
            this.setState({ showPrinterModal: false, btPrinterName: item.name || '' }, async () => {
                if (this._pendingPrintImage) {
                    await this._printImageBase64(this._pendingPrintImage.imagePath, this._pendingPrintImage.width);
                }
            });
        } catch (e) {
            Alert.alert(config.AppName, 'Connect printer failed!');
        }
    }
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
        )
    }
    
    renderBuyModal(){
        return(
            <Modal
            transparent={true}
            visible={this.state.showModal}
            onRequestClose={()=>{
                this.setState({
                    showModal:false,
                    num:'',
                    discount:'',
                    saleDetailsId:'',
                    unit:'',
                    groupId:''
                })
            }}
            >
                <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',alignItems:'center',width:width*0.9,borderRadius:5,padding:10}}>
                        <View style={{width:width*0.9,alignItems:'center',padding:15}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text style={{
                                    color:Color.DARKPRIMARYTEXTCOLOR,
                                    fontSize:16,
                                    
                                    width:80
                                }}>
                                {word[this.props.navigation.state.params.lg].num}
                            </Text>
                            <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor={'#262626'}
                                    value={this.state.num}
                                    keyboardType='decimal-pad'
                                    underlineColorAndroid="transparent"
                                    editable={this.state.groupId==''||this.state.groupId==null?true:false}
                                    onChangeText={(text)=>this.setState({num:text})}
                                />
                            </View>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text style={{
                                    color:Color.DARKPRIMARYTEXTCOLOR,
                                    fontSize:16,
                                    
                                    width:80
                                }}>
                                {word[this.props.navigation.state.params.lg].unit}
                            </Text>
                            <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor={'#262626'}
                                    value={this.state.unit}
                                    keyboardType='decimal-pad'
                                    underlineColorAndroid="transparent"
                                    onChangeText={(text)=>this.setState({unit:text})}
                                />
                            </View>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text style={{
                                    color:Color.DARKPRIMARYTEXTCOLOR,
                                    fontSize:16,
                                    
                                    width:80
                                }}>
                                {word[this.props.navigation.state.params.lg].discount}
                            </Text>
                            <View style={[styles.inputContainer,{flex:1,marginHorizontal:0}]}>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor={'#262626'}
                                    value={this.state.discount}
                                    keyboardType='decimal-pad'
                                    underlineColorAndroid="transparent"
                                    onChangeText={(text)=>this.setState({discount:text})}
                                />
                            </View>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <TouchableOpacity style={{
                                paddingHorizontal:20,
                                paddingVertical:10,
                                marginTop:20,
                                backgroundColor:Color.PRIMARYCOLOR,
                                borderRadius:10,
                                marginHorizontal:3
                            }} onPress={()=>{
                                dal.ungroupSlip(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.saleId,this.state.groupId,(err,resp)=>{
                                    if(err){
                                        Alert.alert(config.AppName,'Something went wrong!')
                                        this.setState({
                                            loading:false,
                                        })
                                    }else{
                                        console.log(resp)
                                        if(resp&&JSON.parse(resp).Msg=='OK'){
                                            Alert.alert(config.AppName,'Ungroup Successfully!')
                                            this.setState({
                                                loading:false,
                                                showModal:false,
                                                num:'',
                                                discount:'',
                                                saleDetailsId:'',
                                                unit:'',
                                                groupId:''
                                            },()=>{
                                                this.getSlipDetails()
                                            })
                                        }else{
                                            Alert.alert(config.AppName,JSON.parse(resp).Msg)
                                            this.setState({
                                                loading:false,
                                            })
                                        }
                                    }
                                })
                            }}>
                                <Text style={{color:'#262626',fontSize:16,}}>
                                    Ungroup
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                paddingHorizontal:20,
                                paddingVertical:10,
                                marginTop:20,
                                backgroundColor:Color.PRIMARYCOLOR,
                                borderRadius:10,
                                marginHorizontal:3
                            }} onPress={()=>{
                                //SlipRemark
                                //Num=123=>456,Unit=100=>200
                                dal.updateSlipDetails(this.props.navigation.state.params.endpoint,this.state.saleDetailsId,this.state.num,this.state.unit,Number(this.state.discount).toFixed(2),
                                this.state.groupId?this.state.groupId:'',
                                `Num=${originalNum}=>${this.state.num},Unit=${originalUnit}=>${this.state.unit}`,this.props.navigation.state.params.saleId,(err,resp)=>{
                                    if(err){
                                        console.log(err)
                                        Alert.alert(config.AppName,'Something went wrong!')
                                        this.setState({
                                            loading:false,
                                        })
                                    }else{
                                        console.log(resp)
                                        if(resp&&JSON.parse(resp).Msg=='OK'){
                                            Alert.alert(config.AppName,'Update Successfully!')
                                            this.setState({
                                                loading:false,
                                                showModal:false,
                                                num:'',
                                                discount:'',
                                                saleDetailsId:'',
                                                unit:'',
                                                groupId:''
                                            },()=>{
                                                this.getSlipDetails()
                                            })
                                        }else{
                                            Alert.alert(config.AppName,JSON.parse(resp).Msg)
                                            this.setState({
                                                loading:false,
                                            })
                                        }
                                    }
                                })
                            }}>
                                <Text style={{color:'#262626',fontSize:16,}}>
                                    Update
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                paddingHorizontal:20,
                                paddingVertical:10,
                                marginTop:20,
                                backgroundColor:Color.PRIMARYCOLOR,
                                borderRadius:10,
                                marginHorizontal:3
                            }} onPress={()=>{
                                //SlipRemark
                                //Delete Num=123,Unit=200
                                dal.deleteSlipDetails(this.props.navigation.state.params.endpoint,this.state.saleDetailsId,this.state.groupId?this.state.groupId:'',
                                `Delete Num=${originalNum},Unit=${originalUnit}`,this.props.navigation.state.params.saleId,(err,resp)=>{
                                    if(err){
                                        Alert.alert(config.AppName,'Something went wrong!')
                                        this.setState({
                                            loading:false,
                                        })
                                    }else{
                                        console.log(resp)
                                        if(resp&&JSON.parse(resp).Msg=='OK'){
                                            Alert.alert(config.AppName,'Delete Successfully!')
                                            this.setState({
                                                loading:false,
                                                showModal:false,
                                                num:'',
                                                discount:'',
                                                saleDetailsId:'',
                                                unit:'',
                                                groupId:''
                                            },()=>{
                                                this.getSlipDetails()
                                            })
                                        }else{
                                            Alert.alert(config.AppName,JSON.parse(resp).Msg)
                                            this.setState({
                                                loading:false,
                                            })
                                        }
                                    }
                                })
                            }}>
                                <Text style={{color:'#262626',fontSize:16,}}>
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                            

                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
    renderNum(){
        let items=[]
        
        if(this.state.columnCount==2){
            for(let i=0;i<this.state.data.length;i+=2){
                if((i+1)<this.state.data.length){
                    items.push(
                        <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>
                            {this.state.data[i].Num} = {(this.state.data[i].Unit*this.state.data[i].UnitPrice)}  |  {this.state.data[i+1].Num} = {(this.state.data[i+1].Unit*this.state.data[i+1].UnitPrice)}
                        </Text>
                    )
                }else{
                    items.push(
                        <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>
                            {this.state.data[i].Num} = {(this.state.data[i].Unit*this.state.data[i].UnitPrice)}
                        </Text>
                    )
                }
                
            }
        }else{
            for(let i=0;i<this.state.data.length;i++){
                items.push(
                    <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>
                        {this.state.data[i].Num} = {(this.state.data[i].Unit*this.state.data[i].UnitPrice)}
                    </Text>
                ) 
            }
        }
        return items;
        
    }
    renderPrint(){
        let Unit=0
        this.state.data.map((value,index)=>{
            Unit+=(value.Unit*value.UnitPrice)
        })
        return(
            <Modal
			transparent={true}
			visible={this.state.showPrintModal}
			onRequestClose={()=>{
                this.setState({
                    showPrintModal:false
                })
            }}
		    >
                <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:Color.PRIMARYTEXTCOLOR,width:(width)-10,borderRadius:10,height:height}}>
                        <View style={{
                            flexDirection:'row',
                            marginHorizontal:5,
                            marginTop:10,
                            marginBottom:5,
                            justifyContent:'center'
                        }}>
                            <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                                onPress={()=>{
                                    this.setState({
                                        columnCount:1
                                    })
                                }}>
                                <Image source={this.state.columnCount==1?radio_btn_selected:radio_btn_unselected} 
                                style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                                <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>One Column</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{flexDirection:'row',marginRight:10,alignItems:'center'}}
                                onPress={()=>{
                                    this.setState({
                                        columnCount:2
                                    })
                                }}>
                                <Image source={this.state.columnCount==2?radio_btn_selected:radio_btn_unselected} 
                                style={{width:23,height:23,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                                <Text style={{color:'#262626',fontSize:16,fontWeight:'bold'}}>Two Column</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{
                            alignItems:'center',
                            justifyContent:'center',
                            paddingHorizontal:5
                        }}>
                            <ViewShot ref="viewShot" options={{ format: "png", quality: 0.9 }} style={{backgroundColor:"white"}}
                             >
                                 <View style={{width:(width-20),justifyContent:'center',marginVertical:5}}>
                                    <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>{this.props.navigation.state.params.SaleDate}</Text>
                                    <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>{this.props.navigation.state.params.TermDetailName}</Text>
                                    <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>{word[this.props.navigation.state.params.lg].slipNo} = {this.props.navigation.state.params.SlipNo} , Copy[{(this.props.navigation.state.params.Copy+this.state.copy)}]</Text>
                                    <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>-------------------------------</Text>
                                    <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>{word[this.props.navigation.state.params.lg].num} =  {word[this.props.navigation.state.params.lg].money}</Text>
                                    {this.renderNum()}
                                    <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>-------------------------------</Text>
                                    <Text style={[styles.printTxt,{fontSize:Number(this.state.pSize)}]}>{word[this.props.navigation.state.params.lg].totalMoney} = {Unit}</Text>
                                </View>
                              
                            </ViewShot>
                        </ScrollView>

                        <View style={{flexDirection:'row',marginVertical:10}}>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:Color.DIVIDERCOLOR,paddingVertical:10
                                ,borderRadius:7}} onPress={()=>{
                                    this.setState({
                                        showPrintModal:false
                                    })
                                }}>
                                <Text style={{fontSize:15,fontFamily:'Roboto',color:Color.PRIMARYCOLOR}}>
                                    CANCEL 
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{flex:1,alignItems:"center",justifyContent:'center',backgroundColor:Color.PRIMARYCOLOR,paddingVertical:10
                                ,borderRadius:7,marginLeft:5}} onPress={async ()=>{
                                    try{
                                        const uri = await this.refs.viewShot.capture();
                                        const exists = await RNFS.exists(imagePath);
                                        if(exists){
                                            try{ await RNFS.unlink(imagePath); }catch(e){}
                                        }
                                        try{
                                            await RNFS.moveFile(uri, imagePath);
                                        }catch(e){
                                            await RNFS.copyFile(uri, imagePath);
                                        }
                                        const saved = await RNFS.exists(imagePath);
                                        if (!saved) {
                                            Alert.alert(config.AppName, 'Print image not found.');
                                            return;
                                        }
                                        try{
                                            const stat = await RNFS.stat(imagePath);
                                            if (!stat || !stat.size || Number(stat.size) <= 0) {
                                                Alert.alert(config.AppName, 'Print image is empty.');
                                                return;
                                            }
                                        }catch(e){}
                                        this._printImageWithRetry(
                                            imagePath,
                                            this.state.layoutWidth == 58 ? 384 : 576
                                        );
                                    }catch(err){
                                        console.warn(err.message);
                                    }
                                }}>
                                <Text style={{fontSize:15,fontFamily:'Roboto',color:Color.PRIMARYTEXTCOLOR}}>
                                    PRINT 
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
               </View>
            </Modal>
        )
    }
    //TZTShare
    onShare = async (column) => {
        try {
            let msg=`${this.props.navigation.state.params.TermDetailName}\n${this.props.navigation.state.params.SaleDate}\n${this.props.navigation.state.params.user}\n${word[this.props.navigation.state.params.lg].slipNoEng} = ${this.props.navigation.state.params.SlipNo}\n----------\n`,total=0
            if(column==2){
                for(let i=0;i<this.state.data.length;i+=2){
                    if((i+1)<this.state.data.length){
                        total+=(this.state.data[i].Unit+this.state.data[i+1].Unit)*this.state.data[i].UnitPrice
                        msg+=`${this.state.data[i].Num} = ${this.state.data[i].Unit*this.state.data[i].UnitPrice} | ${this.state.data[i+1].Num} = ${this.state.data[i+1].Unit*this.state.data[i].UnitPrice} \n`
                    }else{
                        total+=this.state.data[i].Unit*this.state.data[i].UnitPrice
                        msg+=`${this.state.data[i].Num} = ${this.state.data[i].Unit*this.state.data[i].UnitPrice} \n`
                    }
                    
                }
                const result = await Share.share({
                    message:`${msg}----------\n${word[this.props.navigation.state.params.lg].totalMoneyEng} = ${total}`,
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
                for(let i=0;i<this.state.data.length;i++){
                    total+=this.state.data[i].Unit*this.state.data[i].UnitPrice
                    msg+=`${this.state.data[i].Num} = ${this.state.data[i].Unit*this.state.data[i].UnitPrice} \n`
                }
                const result = await Share.share({
                    message:`${msg}----------\n${word[this.props.navigation.state.params.lg].totalMoneyEng} = ${total}`,
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
    onShareUnit = async (column) => {
        try {
            let msg=`${this.props.navigation.state.params.TermDetailName}\n${this.props.navigation.state.params.SaleDate}\n${this.props.navigation.state.params.user}\n${word[this.props.navigation.state.params.lg].slipNoEng} = ${this.props.navigation.state.params.SlipNo}\n============\n${word[this.props.navigation.state.params.lg].numEng} =  ${word[this.props.navigation.state.params.lg].unitEng}\n`,total=0
            if(column==2){
                for(let i=0;i<this.state.data.length;i+=2){
                    if((i+1)<this.state.data.length){
                        total+=(this.state.data[i].Unit+this.state.data[i+1].Unit)
                        msg+=`${this.state.data[i].Num} = ${this.state.data[i].Unit} | ${this.state.data[i+1].Num} = ${this.state.data[i+1].Unit} \n`
                    }else{
                        total+=this.state.data[i].Unit
                        msg+=`${this.state.data[i].Num} = ${this.state.data[i].Unit} \n`
                    }
                    
                }
                const result = await Share.share({
                    message:`${msg} \n---------------------------\n${word[this.props.navigation.state.params.lg].totalMoney} = ${total}`,
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
                for(let i=0;i<this.state.data.length;i++){
                    total+=this.state.data[i].Unit
                    msg+=`${this.state.data[i].Num} = ${this.state.data[i].Unit} \n`
                }
                const result = await Share.share({
                    message:`${msg} \n---------------------------\n${word[this.props.navigation.state.params.lg].totalMoneyEng} = ${total}`,
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
    render() {
        return (
        <View style={styles.container}>
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
                        {word[this.props.navigation.state.params.lg].slip}
                    </Text>
                    {!!this.props.navigation.state.params.SlipNo && (
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                            Slip No= {this.props.navigation.state.params.SlipNo}
                        </Text>
                    )}
                </View>
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
                    flex:2
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:14,
                        
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
                        fontSize:14,
                        
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].unit}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:14,
                        
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].discount}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:14,
                        
                        textAlign:'center'
                    }}>
                         {word[this.props.navigation.state.params.lg].summary}
                    </Text>
                </View>
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
                        justifyContent:'center',
                        marginRight:5
                    }} 
                    onPress={()=>{
                        Alert.alert(config.AppName,'Choose column',
                        [
                            {text:'One Column',onPress:()=>{
                                this.onShare(1)
                            }},
                            {text:'Two Column',onPress:()=>{
                                this.onShare(2)
                            }},
                            {text:'Cancel',onPress:()=>{
                            }}
                        ],
                        )
                        
                    }}>
                    <Text style={{color:'#fff',fontSize:18,marginLeft:5,}}>
                        Share
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{
                        paddingVertical:10,
                        flex:1,
                        backgroundColor:Color.PRIMARYCOLOR,
                        borderRadius:5,
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent:'center',
                        marginRight:5
                    }} 
                    onPress={()=>{
                        Alert.alert(config.AppName,'Choose column',
                        [
                            {text:'One Column',onPress:()=>{
                                this.onShareUnit(1)
                            }},
                            {text:'Two Column',onPress:()=>{
                                this.onShareUnit(2)
                            }},
                            {text:'Cancel',onPress:()=>{
                            }}
                        ])
                        
                    }}>
                    <Text style={{color:'#fff',fontSize:18,marginLeft:5,}}>
                        Share Unit
                    </Text>
                </TouchableOpacity>
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
                            showPrintModal:true
                        })
                    }}>
                    <Text style={{color:'#fff',fontSize:18,marginLeft:5,}}>
                        Print
                    </Text>
                </TouchableOpacity>
            </View>
            {this.renderBuyModal()}
            {this.renderPrint()}
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
                                    borderRadius: 6,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>CANCEL</Text>
                            </TouchableOpacity>
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
    printTxt:{
        color:Color.DARKPRIMARYTEXTCOLOR,
        marginVertical:2
    }
});
