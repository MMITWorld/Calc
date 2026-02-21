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
  AsyncStorage,
  Share,
  PermissionsAndroid
} from 'react-native';
import { BluetoothManager, BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import ViewShot from "react-native-view-shot";
import RNFS from "react-native-fs";
import dal from '../dal.js'
import numeral from 'numeral';
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import asending from '../assets/images/asending.png'
import descending from '../assets/images/descending.png'
import refreshIcon from '../assets/images/refresh.png'
import tickIcon from '../assets/images/tick.png'
import untickIcon from '../assets/images/untick.png'
import backIcon from '../assets/images/backward.png'
import editIcon from '../assets/images/edit.png'
import config from '../config/config.js'
import deleteIcon from '../assets/images/delete.png'
import Color from '../utils/Color.js';
import word from './data.json'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that,original='',history='';
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
            termDetailsId:'NoTermDetails',
            users:[],
            userId:'All',
            type:'2D',
            discount2D:0,
            discount3D:0,
            dataProvider: dataProvider.cloneWithRows([]),
            slipList: [],
            showDotRangeModal: false,
            dotFrom: '',
            dotTo: '',
            showPrinterModal: false,
            btDevices: [],
            showModal:false,
            isEdit:true,
            editSaleId:null,
            userNo:'NoUser',
            cName:'',
            termDetailsName:'',
            slipNoForDelete:'',
            totalUnit: 0,
            layoutWidth: 58,
            namePrintText: '',
            // ✅ user search
            userSearchText: '',
            userDropdownOpen: false,
            filteredUsers: [],
            userInputY: 0,
            userInputH: 0,
            userDropdownX: 0,
            userDropdownY: 0,
            userDropdownW: 0,
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
        this._captureNameBase64 = this._captureNameBase64.bind(this);
        this._buildDotBlocks = this._buildDotBlocks.bind(this);
        this._printDotImageText = this._printDotImageText.bind(this);
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    componentDidMount() {
        that=this

         const p = this.props.navigation?.state?.params || {};
         if (!p.endpoint || !p.lg) {
            Promise.all([
                AsyncStorage.getItem('endpoint'),
                AsyncStorage.getItem('lg')
            ]).then(([endpoint, lg]) => {
                this.props.navigation.setParams({
                    endpoint: p.endpoint || endpoint || '',
                    lg: p.lg || lg || 'uni'
                });
            });
         }
         // ✅ keep auto params
        this.autoUserId = p.userId || (p.user && p.user[0] ? p.user[0].UserID : null);

        // ✅ IMPORTANT: map your real params from sale_3d.js
        this.auto = {
            type: p.type || null,                              // "3D"
            termId: p.termId3D || p.termId || null,            // from sale_3d
            termDetailsId: p.termDetailsId3D || p.termDetailsId || null,
            userId: (p.user && p.user[0] && p.user[0].UserID) ? p.user[0].UserID : null,
            autoView: true,                                    // you want auto click view
        };

        // set type first (radio)
        if (this.auto.type) this.setState({ type: this.auto.type });

        // load lists (auto selection will happen after lists loaded)
        this.getUsers();
        this.getTerms();
        AsyncStorage.getItem('layoutWidth').then((v) => {
            const lw = parseInt(v, 10);
            if (!isNaN(lw)) this.setState({ layoutWidth: lw });
        });
       console.log("PPPP TermDetailID======>"+p.termDetailsId)
    }

getNavParam(name, defVal) {
  const p = this.props.navigation?.state?.params || {};
  return p[name] !== undefined && p[name] !== null ? p[name] : defVal;
}

applyAutoSelection() {
  const a = this.auto || {};

  // 1️⃣ Auto type
  if (a.type) {
    this.setState({ type: a.type });
  }

  // 2️⃣ Auto user
  if (a.userId) {
    this.setState({ userId: a.userId });
  }

  // 3️⃣ Auto file (term)
  if (a.termId) {
    this.setState({ termId: a.termId }, () => {
      this.getTermDetailsByID();

      // wait for termDetails
      this._termDetailsTimer = setInterval(() => {
        if (this.state.termDetails.length > 0) {
          clearInterval(this._termDetailsTimer);

          // 4️⃣ Auto term details
          if (a.termDetailsId) {
            const i = this.state.termDetails.findIndex(
              x => x.TermDetailID == a.termDetailsId
            );

            if (i !== -1) {
              this.setState({
                termDetailsId: a.termDetailsId,
                type: this.state.termDetails[i].LottType,
                termDetailsName: this.state.termDetails[i].Name,
              });
            }
          }

          // 5️⃣ Auto VIEW
          if (a.autoView) {
            this.setState({ loading: true }, () => {
              this.getSlipList();
            });
          }
        }
      }, 100);
    });
  }
}

setUserIdSafe(autoUserId) {
  if (!autoUserId) return;
  const u = (this.state.users || []).find(x => String(x.UserID) === String(autoUserId));
  if (!u) return;

  this.setState({
    userId: u.UserID,        // ✅ keep exact type
    discount2D: u.Discount2D,
    discount3D: u.Discount3D
  });
}

setTermIdSafe(autoTermId) {
  if (!autoTermId) return;
  const t = (this.state.terms || []).find(x => String(x.TermID) === String(autoTermId));
  if (!t) return;

  this.setState({ termId: t.TermID }, () => {
    this.getTermDetailsByID(); // ✅ load termDetails after File selected
  });
}

setTermDetailsIdSafe(autoTermDetailsId) {
  if (!autoTermDetailsId) return;
  const td = (this.state.termDetails || []).find(x => String(x.TermDetailID) === String(autoTermDetailsId));
  if (!td) return;

  this.setState({
    termDetailsId: td.TermDetailID,
    type: td.LottType,
    termDetailsName: td.Name,
  }, () => {
    // ✅ auto click VIEW
    if (this.auto?.autoView) {
      this.setState({ loading: true }, () => this.getSlipList());
    }
  });
}


_normText(str) {
  return (str || '').toString().trim().toLowerCase();
}

getUserLabel(u) {
  if (!u) return 'All';
  const no = (u.UserNo ?? u.UserID ?? '').toString();
  return no + '';
}

_openUserDropdown = () => {
  const list = this.state.users || [];
  if (this.userInputRef && this.userInputRef.measureInWindow) {
    this.userInputRef.measureInWindow((x, y, w, h) => {
      this.setState({
        userDropdownOpen: true,
        filteredUsers: list,
        userDropdownX: x,
        userDropdownY: y + h + 6,
        userDropdownW: w,
      });
    });
  } else {
    this.setState({
      userDropdownOpen: true,
      filteredUsers: list,
    });
  }
};

_closeUserDropdown = () => {
  this.setState({ userDropdownOpen: false });
};

_onSearchUser = (text) => {
  const q = this._normText(text);
  const users = this.state.users || [];

  // filter list
  const filtered = !q ? users : users.filter(u => {
    const key = this._normText(this.getUserLabel(u));
    return key.includes(q);
  });

  this.setState({
    userSearchText: text,
    filteredUsers: filtered,
    userDropdownOpen: true,   // typing => open
  });
};

_selectUser = (u) => {
  this.setState({
    userId: u ? u.UserID : 'All',
    discount2D: u ? (u.Discount2D || 0) : 0,
    discount3D: u ? (u.Discount3D || 0) : 0,
    userSearchText: u ? this.getUserLabel(u) : 'All',
    userDropdownOpen: false,
    filteredUsers: [],
  });
};

renderUserDropdown() {
  if (!this.state.userDropdownOpen) return null;
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      <View
        pointerEvents="auto"
        style={{
          position: 'absolute',
          left: this.state.userDropdownX,
          top: this.state.userDropdownY,
          width: this.state.userDropdownW,
          maxHeight: 240,
          borderWidth: 1,
          borderColor: Color.DARKPRIMARYTEXTCOLOR,
          borderRadius: 5,
          backgroundColor: '#fff',
          elevation: 6,
        }}
      >
        <FlatList
          data={[
            { _all: true, UserID: 'All', label: 'All' },
            ...(this.state.filteredUsers || []),
          ]}
          keyExtractor={(item, idx) => (item._all ? 'all' : `${item.UserID || ''}-${idx}`)}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          removeClippedSubviews={false}
          style={{ maxHeight: 240 }}
          renderItem={({ item }) => {
            if (item._all) {
              return (
                <TouchableOpacity
                  style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                  onPress={() => this._selectUser(null)}
                >
                  <Text style={{ color: '#262626' }}>All</Text>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                onPress={() => this._selectUser(item)}
              >
                <Text style={{ color: '#262626' }}>{this.getUserLabel(item)}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
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
                <TouchableOpacity style={{
                    flex:4
                }}onPress={()=>{
                    this.props.navigation.navigate('SlipDetails',
                    {
                        saleId:data.SaleID,
                        endpoint:this.getNavParam('endpoint',''),
                        SaleDate:data.SaleDate,
                        TermDetailName:this.state.termDetailsName,
                        user:data.TermDetailName,
                        SlipNo:data.SlipNo,
                        Copy:data.Copy,
                        lg:this.getNavParam('lg','uni')
                    })
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.SaleDate}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flex:3
                }}onPress={()=>{
                    this.props.navigation.navigate('SlipDetails',
                    {
                        saleId:data.SaleID,
                        endpoint:this.getNavParam('endpoint',''),
                        SaleDate:data.SaleDate,
                        TermDetailName:this.state.termDetailsName,
                        user:data.TermDetailName,
                        SlipNo:data.SlipNo,
                        Copy:data.Copy,
                        lg:this.getNavParam('lg','uni')
                    })
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.TermDetailName}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flex:2
                }}onPress={()=>{
                    this.props.navigation.navigate('SlipDetails',
                    {
                        saleId:data.SaleID,
                        endpoint:this.getNavParam('endpoint',''),
                        SaleDate:data.SaleDate,
                        TermDetailName:this.state.termDetailsName,
                        user:data.TermDetailName,
                        SlipNo:data.SlipNo,
                        Copy:data.Copy,
                        lg:this.getNavParam('lg','uni')
                    })
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.SlipNo}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flex:2
                }}onPress={()=>{
                    this.props.navigation.navigate('SlipDetails',
                    {
                        saleId:data.SaleID,
                        endpoint:this.getNavParam('endpoint',''),
                        SaleDate:data.SaleDate,
                        TermDetailName:this.state.termDetailsName,
                        user:data.TermDetailName,
                        SlipNo:data.SlipNo,
                        Copy:data.Copy,
                        lg:this.getNavParam('lg','uni')
                    })
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {numeral(data.Unit).format('0,0')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    width:40,
                    height:40,
                    alignItems:'center',
                    justifyContent:'center'
                }} onPress={()=>{
                    let cn='';
                    let i=this.state.users.findIndex(x => x.UserID==data?.UserID);
                    if(i!=-1){
                        original=this.state.users[i].UserNo
                        cn=this.state.users[i].cName
                    }else{
                        original=''
                    }
                    console.log('CN')
                    console.log(cn)
                    console.log(data.cName)
                    this.setState({
                        showModal:true,
                        isEdit:true,
                        editSaleId:data.SaleID,
                        cName:data.cName,
                        slipNoForDelete: data.SlipNo,
                        userNo:data.UserID?data.UserID:'NoUser',
                    })
                
                    
                }}>
                    <Image source={editIcon} style={{
                        width:20,
                        height:20,
                        tintColor:'#64dd17'
                    }}/>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    width:40,
                    height:40,
                    alignItems:'center',
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({
                        showModal:true,
                        isEdit:false,
                        editSaleId:data.SaleID,
                        cName:data.cName?data.cName:'',
                        userNo:data.UserID?data.UserID:'NoUser',
                        slipNoForDelete:data.SlipNo
                    })
                }}>
                    <Image source={deleteIcon} style={{
                        width:20,
                        height:20,
                        tintColor:'#ff1744'
                    }}/>
                </TouchableOpacity>
            </View>
        );
    }
    
   getUsers(){
  dal.getUsers(this.getNavParam('endpoint',''),(err,resp)=>{
    if(err){
      this.setState({ loading:false });
    }else{
      if(resp && resp.Status=='OK' && resp.Data.length){
        const list = resp.Data || [];

        // ✅ auto user from params
        const autoId = this.autoUserId;
        const u = autoId ? list.find(x => String(x.UserID) === String(autoId)) : null;

        this.setState({
          users: list,
          userId: u ? u.UserID : 'All',
          discount2D: u ? (u.Discount2D || 0) : 0,
          discount3D: u ? (u.Discount3D || 0) : 0,
          userSearchText: u ? this.getUserLabel(u) : '',
          filteredUsers: list,
          loading:false
        });
      }else{
        this.setState({ users:[], loading:false });
      }
    }
  });
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
         dal.getTermDetailsByID(this.getNavParam('endpoint',''),this.state.termId,(err,resp)=>{
    if(err){
      this.setState({ loading:false })
    }else{
      if(resp && resp.Status=='OK' && resp.Data.length){
        this.setState({ termDetails: resp.Data, loading:false }, () => {
          // ✅ auto select Term AFTER termDetails loaded
          if (this.auto?.termDetailsId) this.setTermDetailsIdSafe(this.auto.termDetailsId);
        });
      }else{
        this.setState({ termDetails:[], loading:false })
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
        console.log("TermID=======>"+this.auto.termId)
        dal.getTerms(this.getNavParam('endpoint',''),(err,resp)=>{
    if(err){
      this.setState({ loading:false })
    }else{
      if(resp && resp.Status=='OK' && resp.Data.length){
        this.setState({ terms: resp.Data, loading:false }, () => {
          // ✅ auto select File AFTER terms loaded
          if (this.auto?.termId) this.setTermIdSafe(this.auto.termId);
        });
      }else{
        this.setState({ terms:[], loading:false })
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
            <View
                pointerEvents="box-none"
                style={{
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-evenly',
                marginVertical:5,
                overflow:'visible'
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
               <TouchableOpacity style={{
                    width:((width*0.5)-10),
                    height:40,
                    justifyContent:'center',
                    alignItems:'center',
                    backgroundColor:Color.PRIMARYCOLOR,
                    borderRadius:5
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
                    this.getSlipList()
                }}>
                    <Text style={{
                        color:'#fff',
                        fontFamily:'Roboto',
                        fontSize:16
                    }}>
                        VIEW
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    getSlipList(){
        dal.getSlipList(this.getNavParam('endpoint',''),this.state.termId,this.state.userId,this.state.termDetailsId,this.state.type,(err,resp)=>{
            if(err){
                this.setState({loading:false})
                Alert.alert(config.AppName,'Something went wrong!')
            }else{
                console.log(resp)
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    let total = 0;
                    resp.Data.forEach(d => {
                        const v = parseFloat(d.Unit);
                        if (!isNaN(v)) total += v;
                    });
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows(resp.Data),
                        slipList: resp.Data,
                        totalUnit: total,
                        loading:false
                    })
                }else{
                    Alert.alert(config.AppName,'No Data!')
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows([]),
                        slipList: [],
                        totalUnit: 0,
                        loading:false
                    })
                }
            }
        })
    }

    _filterSlipRange(list, fromVal, toVal){
        const fromStr = (fromVal || '').toString().trim();
        const toStr = (toVal || '').toString().trim();
        if (!fromStr || !toStr) return list;
        const fromNum = parseInt(fromStr, 10);
        const toNum = parseInt(toStr, 10);
        const useNum = !isNaN(fromNum) && !isNaN(toNum);
        return list.filter(row => {
            const v = row.SlipNo;
            if (useNum) {
                const n = parseInt(v, 10);
                if (isNaN(n)) return false;
                return n >= fromNum && n <= toNum;
            }
            const s = (v || '').toString();
            return s >= fromStr && s <= toStr;
        });
    }

    async _buildDotBlocks(listOverride){
        const list = listOverride || this.state.slipList || [];
        if (!list.length) {
            Alert.alert(config.AppName, 'No Data!');
            return null;
        }
        const sortedList = [...list].sort((a, b) => {
            const aNum = parseInt(a.SlipNo, 10);
            const bNum = parseInt(b.SlipNo, 10);
            const aIsNum = !isNaN(aNum);
            const bIsNum = !isNaN(bNum);
            if (aIsNum && bIsNum) return aNum - bNum;
            if (aIsNum) return -1;
            if (bIsNum) return 1;
            return (a.SlipNo || '').toString().localeCompare((b.SlipNo || '').toString());
        });
        const blocks = [];
        let grandTotal = 0;
        for (let i = 0; i < sortedList.length; i++) {
            const row = sortedList[i];
            const nameLine = row.TermDetailName ?? '';
            const slipNo = row.SlipNo ?? '';
            let slipTotal = 0;
            const itemLines = [];
            const resp = await new Promise((resolve, reject) => {
                dal.getSlipDetails(this.getNavParam('endpoint',''), row.SaleID, (err, r) => {
                    if (err) return reject(err);
                    resolve(r);
                });
            });
            if (resp && resp.Status === 'OK' && Array.isArray(resp.Data)) {
                resp.Data.forEach(d => {
                    const num = d.Num ?? '';
                    const unitVal = Number(d.Unit ?? 0);
                    slipTotal += isNaN(unitVal) ? 0 : unitVal;
                    itemLines.push(`${num}=${d.Unit ?? ''}`);
                });
            }
            grandTotal += slipTotal;
            blocks.push({ nameLine, slipNo, itemLines, slipTotal });
        }
        return { blocks, grandTotal };
    }

    async _buildDotText(listOverride){
        const result = await this._buildDotBlocks(listOverride);
        if (!result) return null;
        const { blocks, grandTotal } = result;
        const lines = [];
        blocks.forEach(b => {
            if (b.nameLine) lines.push(`Name=${b.nameLine}`);
            lines.push(`SlipNo=${b.slipNo}`);
            lines.push(...b.itemLines);
            lines.push('------------');
            lines.push(`Total=${numeral(b.slipTotal).format('0,0')}`);
            lines.push('');
        });
        lines.push(`Grand Total=${numeral(grandTotal).format('0,0')}`);
        return lines.join('\n');
    }

    async dotAll(listOverride){
        this.setState({ loading: true });
        try {
            const msg = await this._buildDotText(listOverride);
            if (!msg) return;
            await Share.share({ message: msg });
        } catch (e) {
            Alert.alert(config.AppName, 'Something went wrong!');
        } finally {
            this.setState({ loading: false });
        }
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

    async _printTextNow(msg) {
        if (!msg) return;
        this._pendingPrintText = msg;
        const ready = await this._ensurePrinterConnected();
        if (!ready) return;
        try {
            await BluetoothEscposPrinter.printerInit();
            await BluetoothEscposPrinter.printText(`${msg}\n\r`, { encoding: 'GBK', codepage: 0 });
            await BluetoothEscposPrinter.printAndFeed(2);
        } catch (e) {
            Alert.alert(config.AppName, 'Print failed!');
        }
    }

    async _captureNameBase64(nameText) {
        return new Promise((resolve, reject) => {
            this.setState({ namePrintText: nameText }, () => {
                setTimeout(async () => {
                    try {
                        if (!this.nameShotRef || !this.nameShotRef.capture) {
                            return reject(new Error('No viewshot'));
                        }
                        const uri = await this.nameShotRef.capture();
                        const base64 = await RNFS.readFile(uri, 'base64');
                        resolve(base64);
                    } catch (e) {
                        reject(e);
                    }
                }, 80);
            });
        });
    }

    async _printDotImageText(listOverride, skipEnsure = false) {
        const result = await this._buildDotBlocks(listOverride);
        if (!result) return;
        if (!skipEnsure) {
            const ready = await this._ensurePrinterConnected();
            if (!ready) {
                this._pendingPrintDotList = listOverride || this.state.slipList || [];
                return;
            }
        }
        const { blocks, grandTotal } = result;
        try {
            await BluetoothEscposPrinter.printerInit();
            for (let i = 0; i < blocks.length; i++) {
                const b = blocks[i];
                if (b.nameLine) {
                    const base64 = await this._captureNameBase64(`Name=${b.nameLine}`);
                    await BluetoothEscposPrinter.printPic(base64, {
                        width: this.state.layoutWidth == 58 ? 384 : 576,
                        left: 0
                    });
                }
                const textLines = [];
                textLines.push(`SlipNo=${b.slipNo}`);
                textLines.push(...b.itemLines);
                textLines.push('------------');
                textLines.push(`Total=${numeral(b.slipTotal).format('0,0')}`);
                textLines.push('');
                await BluetoothEscposPrinter.printText(`${textLines.join('\n')}\n\r`, { encoding: 'GBK', codepage: 0 });
            }
            await BluetoothEscposPrinter.printText(`Grand Total=${numeral(grandTotal).format('0,0')}\n\r`, { encoding: 'GBK', codepage: 0 });
            await BluetoothEscposPrinter.printAndFeed(2);
        } catch (e) {
            Alert.alert(config.AppName, 'Print failed!');
        }
    }

    async printDotAll(listOverride) {
        this.setState({ loading: true });
        try {
            await this._printDotImageText(listOverride);
        } catch (e) {
            Alert.alert(config.AppName, 'Something went wrong!');
        } finally {
            this.setState({ loading: false });
        }
    }

    async _connectAndPrint(item) {
        try {
            await BluetoothManager.connect(item.address);
            await AsyncStorage.setItem('bt_printer_address', item.address);
            this.setState({ showPrinterModal: false }, async () => {
                if (this._pendingPrintDotList) {
                    const list = this._pendingPrintDotList;
                    this._pendingPrintDotList = null;
                    await this._printDotImageText(list, true);
                } else if (this._pendingPrintText) {
                    try {
                        await BluetoothEscposPrinter.printerInit();
                        await BluetoothEscposPrinter.printText(`${this._pendingPrintText}\n\r`, { encoding: 'GBK', codepage: 0 });
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

    _getDotRangeKey(){
        const userId = this.state.userId ?? 'All';
        const termId = this.state.termId ?? 'NoTerm';
        const termDetailsId = this.state.termDetailsId ?? 'NoTermDetails';
        return `dotRange_${userId}_${termId}_${termDetailsId}`;
    }

    async _loadDotRange(){
        try{
            const key = this._getDotRangeKey();
            const raw = await AsyncStorage.getItem(key);
            if (raw) {
                const obj = JSON.parse(raw);
                this.setState({
                    dotFrom: obj?.from ?? '',
                    dotTo: obj?.to ?? '',
                });
            } else {
                this.setState({ dotFrom: '', dotTo: '' });
            }
        }catch(e){}
    }

    async _saveDotRange(){
        try{
            const key = this._getDotRangeKey();
            const payload = JSON.stringify({
                from: this.state.dotFrom || '',
                to: this.state.dotTo || ''
            });
            await AsyncStorage.setItem(key, payload);
        }catch(e){}
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
                    borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:5}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.termDetailsId}
                        style={{ height:40, width:((width*0.5)-10)}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.termDetails.findIndex(x => x.TermDetailID==itemValue);
                            if(i!=-1){
                                this.setState({
                                    termDetailsId:itemValue,
                                    type:this.state.termDetails[i].LottType,
                                    termDetailsName:this.state.termDetails[i].Name
                                })
                            }else{
                                this.setState({
                                    termDetailsId:itemValue,
                                    termDetailsName:''
                                })
                            }
                            
                            
                        }}>
                        <Picker.Item label={'Term'} value={'NoTermDetails'}/>
                        {this.renderTermDetails()}
                    </Picker>
                </View>
                <View style={{ width: ((width * 0.5) - 10) }}>
                    <View style={{
                        height: 40,
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: Color.DARKPRIMARYTEXTCOLOR,
                        borderRadius: 5,
                        paddingHorizontal: 8
                    }}
                    onLayout={(e) => {
                        const { y, height: h } = e.nativeEvent.layout;
                        if (y !== this.state.userInputY || h !== this.state.userInputH) {
                            this.setState({ userInputY: y, userInputH: h });
                        }
                    }}>
                        <TextInput
                            placeholder="Search user"
                            value={this.state.userSearchText}
                            onFocus={this._openUserDropdown}
                            onChangeText={this._onSearchUser}
                            underlineColorAndroid="transparent"
                            style={{ height: 40 }}
                            ref={(r) => { this.userInputRef = r; }}
                        />
                    </View>
                </View>
            </View>
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
                    isEdit:true,
                    slipNoForDelete:''
                })
            }}
            >
                <View style={{flex:1,alignItems: 'center',justifyContent:'center',backgroundColor:'#11030085'}}>
                    <View style={{backgroundColor:'#fff',alignItems:'center',width:width*0.8,borderRadius:5,padding:10}}>
                        <View style={{width:width*0.8,alignItems:'center',padding:15}}>
                            <Text style={{color:'#262626',fontSize:16,}}>
                                Slip No= {this.state.slipNoForDelete}
                            </Text>
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
                                            })
                                            history=this.state.users[i].UserNo
                                        }else{
                                            this.setState({
                                                userNo:itemValue,
                                            })
                                            history=''
                                        }
                                        
                                    }}>
                                    <Picker.Item label={'Select User'} value={'NoUser'}/>
                                    {this.renderUsers()}
                                </Picker>
                               
                            </View>

                            <View style={{width:((width*0.8)-30),height:50,justifyContent:'center',marginTop:20,
                                borderWidth:1,borderColor:Color.DARKPRIMARYTEXTCOLOR,borderRadius:10,}}>
                                <TextInput
                                    //style={styles.input}
                                    //placeholderTextColor={'#262626'}
                                     value={this.state.cName}
                                    //underlineColorAndroid="transparent"
                                    onChangeText={(text)=>this.setState({cName:text})}
                                />
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
                                    showModal:false,
                                    loading:true
                                })
                                if(this.state.isEdit){
                                    //SlipRemark
                                    //Num=123=>456,Unit=100=>200
                                    console.log("CName"+this.state.cName)
                                    dal.updateSlip(this.getNavParam('endpoint',''),this.state.cName,this.state.editSaleId,this.state.userNo,`${original} => ${history}`,(err,resp)=>{
                                        if(err){
                                            Alert.alert(config.AppName,'Something went wrong!')
                                            this.setState({
                                                loading:false,
                                                editSaleId:null,
                                                cName:'',
                                                slipNoForDelete:''
                                            })
                                        }else{
                                            if(JSON.parse(resp).Msg=='OK'){
                                                Alert.alert(config.AppName,'Update successfully!')
                                                this.setState({
                                                    loading:false,
                                                    editSaleId:null,
                                                    cName:'',
                                                    slipNoForDelete:''
                                                })
                                                this.getSlipList(this.state.type)
                                            }else{
                                                Alert.alert(config.AppName,JSON.parse(resp).Msg)
                                                this.setState({
                                                    loading:false,
                                                    editSaleId:null,
                                                    cName:'',
                                                    slipNoForDelete:''
                                                })
                                            }
                                            
                                            console.log('update resp ',typeof resp ,resp)
                                        }
                                    })
                                }else{
                                    dal.deleteSlip(this.getNavParam('endpoint',''),this.state.editSaleId,this.state.userId,"Delete Slip",(err,resp)=>{
                                        if(err){
                                            Alert.alert(config.AppName,'Something went wrong!')
                                            this.setState({
                                                loading:false,
                                                editSaleId:null,
                                                cName:'',
                                            })
                                        }else{
                                            console.log(JSON.parse(resp))
                                            if(JSON.parse(resp).Msg=='OK'){
                                                Alert.alert(config.AppName,'Delete successfully!')
                                                this.setState({
                                                    loading:false,
                                                    editSaleId:null,
                                                    cName:'',
                                                })
                                                this.getSlipList(this.state.type)
                                            }else{
                                                Alert.alert(config.AppName,JSON.parse(resp).Msg)
                                                this.setState({
                                                    loading:false,
                                                    editSaleId:null,
                                                    cName:'',
                                                })
                                            }
                                            
                                            console.log('update resp ',typeof resp ,resp)
                                        }
                                    })
                                }
                                
                            }}>
                                <Text style={{color:'#262626',fontSize:16,}}>
                                    {this.state.isEdit?"Update":'Delete'}
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
                marginHorizontal:5,
                marginTop:10,
                marginBottom:5,
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
            {this.renderRow1()}
            {this.renderRow2()}
            <View style={{
                width:width,
                height:50,
                borderBottomWidth:1,
                borderColor:Color.DIVIDERCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <View style={{
                    flex:4
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:12,
                        
                        textAlign:'center'
                    }}>
                        {word[this.getNavParam('lg','uni')].day}
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
                        {word[this.getNavParam('lg','uni')].user}
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
                        {word[this.getNavParam('lg','uni')].slip}
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
                         {word[this.getNavParam('lg','uni')].amount}
                    </Text>
                </View>
                <View style={{
                    width:40,
                    height:40
                }}/>
                <View style={{
                    width:40,
                    height:40
                }}/>
            </View>
            <View style={{flex:1}}>
                <RecyclerListView layoutProvider={this._layoutProvider} dataProvider={this.state.dataProvider} rowRenderer={this._rowRenderer} />
            </View>
            <View style={{
                width: width,
                height: 40,
                borderTopWidth: 1,
                borderColor: Color.DIVIDERCOLOR,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
                backgroundColor: Color.PRIMARYCOLOR
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => {
                            this._loadDotRange().then(() => {
                                this.setState({ showDotRangeModal: true });
                            });
                        }}
                        style={{
                            paddingHorizontal: 36,
                            height: 38,
                            borderRadius: 5,
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Text style={{ color: Color.PRIMARYCOLOR, fontSize: 13, fontWeight: 'bold' }}>
                            DOT
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                    Total= {numeral(this.state.totalUnit).format('0,0')}
                </Text>
            </View>
            {this.state.showDotRangeModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={this.state.showDotRangeModal}
                    onRequestClose={() => this.setState({ showDotRangeModal: false })}
                >
                    <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width * 0.9, backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                                Slip No Range
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput
                                    placeholder="စလစ်နံပါတ်(မှ)"
                                    value={this.state.dotFrom}
                                    onChangeText={(t) => this.setState({ dotFrom: t })}
                                    keyboardType="number-pad"
                                    style={{
                                        flex: 1,
                                        borderWidth: 1,
                                        borderColor: Color.DIVIDERCOLOR,
                                        borderRadius: 5,
                                        paddingHorizontal: 10,
                                        height: 40,
                                    }}
                                />
                                <View style={{ width: 10 }} />
                                <TextInput
                                    placeholder="စလစ်နံပါတ်(ထိ)"
                                    value={this.state.dotTo}
                                    onChangeText={(t) => this.setState({ dotTo: t })}
                                    keyboardType="number-pad"
                                    style={{
                                        flex: 1,
                                        borderWidth: 1,
                                        borderColor: Color.DIVIDERCOLOR,
                                        borderRadius: 5,
                                        paddingHorizontal: 10,
                                        height: 40,
                                    }}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 16 }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ showDotRangeModal: false })}
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
                                        this._saveDotRange();
                                        const list = this._filterSlipRange(this.state.slipList || [], this.state.dotFrom, this.state.dotTo);
                                        this.setState({ showDotRangeModal: false }, () => {
                                            if (this.printDotAll) this.printDotAll(list);
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
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this._saveDotRange();
                                        const list = this._filterSlipRange(this.state.slipList || [], this.state.dotFrom, this.state.dotTo);
                                        this.setState({ showDotRangeModal: false }, () => {
                                            if (this.dotAll) this.dotAll(list);
                                        });
                                    }}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        backgroundColor: Color.PRIMARYCOLOR,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SHARE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this._saveDotRange();
                                        this.setState({ showDotRangeModal: false }, () => {
                                            if (this.dotAll) this.dotAll();
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
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>SHARE ALL</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            <View style={{ position: 'absolute', left: -1000, top: -1000, opacity: 0 }}>
                <ViewShot
                    ref={(r) => { this.nameShotRef = r; }}
                    options={{ format: 'png', quality: 0.9 }}
                    style={{ backgroundColor: '#fff' }}
                >
                    <View style={{ backgroundColor: '#fff', padding: 6, width: (this.state.layoutWidth == 58 ? 384 : 576) }}>
                        <Text style={{ fontSize: 20, color: '#000' }}>{this.state.namePrintText}</Text>
                    </View>
                </ViewShot>
            </View>
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
            {this.renderUserDropdown()}
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

