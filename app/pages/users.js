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
  Picker,
  Clipboard,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dal from '../dal.js'
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import show from '../assets/images/show.png'
import hide from '../assets/images/hide.png'
import plusIcon from '../assets/images/plus.png'
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
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            agents: [],
            showNewModal: false,
            loading: true,
            agentId: null,
            isUser: true,
            dataProvider: dataProvider.cloneWithRows([]),
            userNo: '',
            password: '',
            phoneNo: '',
            prize2D: '80',
            prize3D: '550',
            discount2D: '',
            discount3D: '',
            otherDiscount: '',
            editUserId: null,
            update2d: '',
            update3d: '',
            r1: true,
            r2: true,
            r3: true,
            isAgent: false,
            isDebit: false,
            showPassword: false,
            showAgent: false,
            agentName:'',
            userSearchText: '',
            userListRaw: [],
            userAppLinks: null,
            appKeyText: ''
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
        this.currentlyOpenSwipeable = null
        this._userAppShareLoaded = false
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    componentDidMount() {
        this.getAllUsers()
        this.getAgents()
        this.loadUserAppShareInfo()
    }
    loadUserAppShareInfo() {
        if (this._userAppShareLoaded) {
            return;
        }
        this._userAppShareLoaded = true;

        dal.getUserAppLink((err, resp) => {
            if (!err && resp && resp.Status == 'OK' && Array.isArray(resp.Data) && resp.Data.length > 0) {
                this.setState({ userAppLinks: resp.Data[0] || null });
            }
        });
        AsyncStorage.getItem('key')
            .then((key) => {
                if (!key) return;
                dal.getMessageforAdmin(key, (err, resp) => {
                    if (!err && resp && resp.Status == '200' && Array.isArray(resp.Data) && resp.Data.length > 0) {
                        this.setState({ appKeyText: resp.Data[0].AppKEY ? String(resp.Data[0].AppKEY) : '' });
                    }
                });
            })
            .catch(() => {});
    }
    async getApkShareText() {
        const info = this.state.userAppLinks || {};
        const keyTxt = this.state.appKeyText || '';
        const telegram = info.TelegramLink || '';
        const drive = info.GoogleDriveLink || '';
        if (!telegram && !drive) {
            return '';
        }

        return [
            '​ဆော့ဖ်ဝဲ ​ဒေါင်းရန်',
            '',
            'Telegram Link',
            telegram,
            '',
            'Drive Link',
            drive,
            '',
            'ထိုးသား Key=' + keyTxt,
        ].join('\n');
    }
    async shareApkInfo() {
        const msg = await this.getApkShareText();
        if (!msg) {
            Alert.alert(config.AppName, 'Link not found');
            return;
        }
        Clipboard.setString(msg);
        Share.share({ message: msg });
    }
    async shareUserInfo() {
        const originalText = [
            'အမည်=' + (this.state.userNo || ''),
            'စကားဝှက်=' + (this.state.password || ''),
            '2D ဆ(ကော်)=' + (this.state.prize2D || 0) + '(' + (this.state.discount2D === '' ? 0 : this.state.discount2D) + ')',
            '3D ဆ(ကော်)=' + (this.state.prize3D || 0) + '(' + (this.state.discount3D === '' ? 0 : this.state.discount3D) + ')',
        ].join('\n');

        const apkText = await this.getApkShareText();
        const msg = apkText ? (originalText + '\n\n' + apkText) : originalText;

        Clipboard.setString(msg);
        Share.share({ message: msg });
    }
    _rowRenderer(type, data) {
        return (
            <View style={{
                width: width,
                height: 40,
                borderBottomWidth: 1,
                borderColor: Color.DIVIDERCOLOR,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <View style={{
                    flex: 4
                }}>
                    <Text style={{
                        color: Color.DARKPRIMARYTEXTCOLOR,
                        fontSize: 12,

                        textAlign: 'center'
                    }}>
                        {this.state.showAgent ? data.AgentName : data.UserNo}
                    </Text>
                </View>
                <View style={{
                    flex: 2
                }}>
                    <Text style={{
                        color: Color.DARKPRIMARYTEXTCOLOR,
                        fontSize: 12,

                        textAlign: 'center'
                    }}>
                        {data.Discount2D}
                    </Text>
                </View>
                <View style={{
                    flex: 2
                }}>
                    <Text style={{
                        color: Color.DARKPRIMARYTEXTCOLOR,
                        fontSize: 12,

                        textAlign: 'center'
                    }}>
                        {data.Discount3D}
                    </Text>
                </View>
                <TouchableOpacity style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onPress={() => {
                    if(this.state.showAgent){
                        this.setState({
                            editUserId: data.AgentID,
                            userNo:data.AgentName,
                            prize2D: data.Prize2D.toString(),
                            prize3D: data.Prize3D.toString(),
                            discount2D: data.Discount2D.toString(),
                            discount3D: data.Discount3D.toString(),
                            otherDiscount: data.OtherDiscount.toString(),
                            showNewModal: true,
                        })
                    }else{
                        this.setState({ loading: true }, () => {
                            dal.getUserById(this.props.navigation.state.params.endpoint, data.UserID, (err, resp) => {
                                if (err) {
                                    console.log(err)
                                    this.setState({
                                        loading: false
                                    })
                                    Alert.alert(config.AppName, 'Something went wrong!')
                                } else {
                                    console.log(resp)
                                    if (resp.Status == 'OK' && resp.Data && resp.Data.length > 0) {
                                        this.setState({
                                            agentId: resp.Data[0].AgentID,
                                            editUserId: data.UserID,
                                            userNo: resp.Data[0].UserNo,
                                            password: resp.Data[0].Password,
                                            phoneNo: resp.Data[0].PhoneNo,
                                            prize2D: resp.Data[0].Prize2D.toString(),
                                            prize3D: resp.Data[0].Prize3D.toString(),
                                            discount2D: resp.Data[0].Discount2D.toString(),
                                            discount3D: resp.Data[0].Discount3D.toString(),
                                            isUser: resp.Data[0].IsCustomer,
                                            otherDiscount: resp.Data[0].OtherDiscount.toString(),
                                            showNewModal: true,
                                            r1: resp.Data[0].Permission ? resp.Data[0].Permission.includes('2') ? true : false : false,
                                            r2: resp.Data[0].Permission ? resp.Data[0].Permission.includes('3') ? true : false : false,
                                            r3: resp.Data[0].Permission ? resp.Data[0].Permission.includes('W') ? true : false : false,
                                            isDebit: resp.Data[0].NRC == 'false' || resp.Data[0].NRC == 'False' ? false : true,
                                            showPassword: false,
                                            loading: false,
                                            UseMoneyInOut: resp.Data[0].NRC == 'false' || resp.Data[0].NRC == 'False' ? false : true
                                        })
                                    } else {
                                        this.setState({
                                            loading: false
                                        })
                                        Alert.alert(config.AppName, 'Cannot retrieve user information!')
                                    }
                                }
                            })
                        })
                    }
                    

                }}>
                    <Image source={editIcon} style={{
                        width: 20,
                        height: 20,
                        tintColor: '#64dd17'
                    }} />
                </TouchableOpacity>
                <TouchableOpacity style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onPress={() => {
                    Alert.alert(`${this.state.showAgent?data.AgentName:data.UserNo}`, 'Are you sure you want to delete!',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    if(this.state.showAgent){
                                        dal.setAgent(this.props.navigation.state.params.endpoint,data.AgentID, data.AgentName,
                                            data.Prize2D, data.Prize3D, data.Discount2D,
                                            data.Discount3D, data.OtherDiscount,'Delete',
                                             (err, resp) => {
                                                if (err) {
                                                    Alert.alert(config.AppName, 'Something went wrong!')
                                                    this.setState({
                                                        loading: false
                                                    })
                                                } else {
                                                    console.log(resp)
                                                    if (resp == 'OK') {
                                                        Alert.alert(config.AppName, 'Delete Successfully!',
                                                            [
                                                                {
                                                                    text: 'OK',
                                                                    onPress: () => {
                                                                        this.setState({
                                                                            agentId: 'NoAgent',
                                                                            editUserId: null,
                                                                            userNo: '',
                                                                            password: '',
                                                                            phoneNo: '',
                                                                            prize2D: '80',
                                                                            prize3D: '550',
                                                                            discount2D: '',
                                                                            discount3D: '',
                                                                            isUser: true,
                                                                            r1: true,
                                                                            r2: true,
                                                                            r3: true,
                                                                            otherDiscount: '',
                                                                            showNewModal: false,
                                                                            loading: false
                                                                        }, () => {
                                                                            if(this.state.showAgent){
                                                                                this.getAgents(true)
                                                                            }else{
                                                                                this.getAllUsers()
                                                                            }
                                                                            
                                                                        })
                                                                    }
                                                                }
                                                            ])

                                                    } else {
                                                        this.setState({
                                                            loading: false
                                                        })
                                                        Alert.alert(config.AppName, resp)
                                                    }
                                                }
                                        })
                                    }else{
                                        dal.deleteUser(this.props.navigation.state.params.endpoint, data.UserID, (err, resp) => {
                                            if (err) {
                                                Alert.alert(config.AppName, 'Something went wrong!')
                                            } else {
                                                if (resp == 'OK') {
                                                    this.getAllUsers()
                                                } else {
                                                    Alert.alert(config.AppName, resp)
                                                }
                                            }
                                        })
                                    }
                                    
                                }
                            },
                            {
                                text: 'Cancel',
                                onPress: () => {

                                }
                            },
                        ],
                        {
                            cancelable: true
                        }
                    )
                }}>
                    <Image source={deleteIcon} style={{
                        width: 20,
                        height: 20,
                        tintColor: '#ff1744'
                    }} />
                </TouchableOpacity>
            </View>
        );
    }
    renderUsers() {
        return this.state.agents.map((value, index) => {
            return (
                <Picker.Item label={value.AgentName} value={value.AgentID} key={index} />
            )
        })
    }
    getAgents(forAll) {
        dal.getAgents(this.props.navigation.state.params.endpoint, (err, resp) => {
            if (err) {
                Alert.alert(config.AppName, 'Can\'t retrieve agents data!')
                console.log('getAgents ', err)
            } else {
                console.log(resp)
                if (forAll) {
                    if (resp && resp.Status == 'OK' && resp.Data.length) {
                        this.setState({
                            dataProvider: dataProvider.cloneWithRows(resp.Data),
                            loading: false
                        })
                    } else {
                        Alert.alert(config.AppName, 'Can\'t retrieve users data!')
                        this.setState({
                            loading: false
                        })
                    }
                } else {
                    if (resp && resp.Status == 'OK' && resp.Data.length) {
                        this.setState({
                            agents: resp.Data,
                        })
                    } else {
                        Alert.alert(config.AppName, 'Can\'t retrieve agents data!')
                        this.setState({
                            agents: []
                        })
                    }
                }

            }
        })
    }
    getAllUsers() {
        dal.getAllUsers(this.props.navigation.state.params.endpoint, (err, resp) => {
            if (err) {
                Alert.alert(config.AppName, 'Something went wrong!')
                this.setState({
                    loading: false
                })
            } else {
                if (resp && resp.Status == 'OK' && resp.Data.length) {
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows(resp.Data),
                        userListRaw: resp.Data,
                        loading: false
                    })
                } else {
                    Alert.alert(config.AppName, 'Can\'t retrieve users data!')
                    this.setState({
                        loading: false
                    })
                }
            }
        })
    }

    filterUserList(text) {
        const q = (text || '').toString().trim().toLowerCase();
        const list = this.state.userListRaw || [];
        if (!q) {
            this.setState({
                userSearchText: '',
                dataProvider: dataProvider.cloneWithRows(list)
            });
            return;
        }
        const filtered = list.filter(u => {
            const key = `${u.UserNo || ''} ${u.AgentName || ''}`.toLowerCase();
            return key.includes(q);
        });
        this.setState({
            userSearchText: text,
            dataProvider: dataProvider.cloneWithRows(filtered)
        });
    }
    renderNewModal() {
        return (
            <Modal
                transparent={true}
                visible={this.state.showNewModal}
                onRequestClose={() => {
                    this.setState({
                        agentId: 'NoAgent',
                        editUserId: null,
                        userNo: '',
                        password: '',
                        phoneNo: '',
                        prize2D: '80',
                        prize3D: '550',
                        discount2D: '',
                        discount3D: '',
                        isUser: true,
                        r1: true,
                        r2: true,
                        r3: true,
                        otherDiscount: '',
                        showNewModal: false,
                        loading: false
                    })
                }}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
                    {
                        this.state.showAgent ?
                            <View style={{ backgroundColor: '#fff', padding: 5, width: width - 10, borderRadius: 5 }}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={word[this.props.navigation.state.params.lg].name}
                                        placeholderTextColor={'#262626'}
                                        value={this.state.userNo}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => this.setState({ userNo: text })}
                                    />
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    marginHorizontal: 10,
                                    marginVertical: 7,
                                    height: 48,
                                    width: (width - 40),
                                }}>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        marginRight: 10,
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.8,
                                        height: 48,
                                        borderColor: Color.DIVIDERCOLOR,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={word[this.props.navigation.state.params.lg].prize2d}
                                            keyboardType='decimal-pad'
                                            placeholderTextColor={'#262626'}
                                            value={this.state.prize2D}
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ prize2D: text })}
                                        />
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.8,
                                        borderColor: Color.DIVIDERCOLOR,
                                        height: 48,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={word[this.props.navigation.state.params.lg].discount2d}
                                            keyboardType='decimal-pad'
                                            placeholderTextColor={'#262626'}
                                            value={this.state.discount2D}
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ discount2D: text })}
                                        />
                                    </View>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    marginHorizontal: 10,
                                    marginVertical: 7,
                                    height: 48,
                                    width: (width - 40),
                                }}>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        marginRight: 10,
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.8,
                                        borderColor: Color.DIVIDERCOLOR,
                                        height: 48,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={word[this.props.navigation.state.params.lg].prize3d}
                                            placeholderTextColor={'#262626'}
                                            value={this.state.prize3D}
                                            keyboardType='decimal-pad'
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ prize3D: text })}
                                        />
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.8,
                                        borderColor: Color.DIVIDERCOLOR,
                                        height: 48,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={word[this.props.navigation.state.params.lg].discount3d}
                                            keyboardType='decimal-pad'
                                            placeholderTextColor={'#262626'}
                                            value={this.state.discount3D}
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ discount3D: text })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={word[this.props.navigation.state.params.lg].otherdiscount}
                                        keyboardType='decimal-pad'
                                        placeholderTextColor={'#262626'}
                                        value={this.state.otherDiscount}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => this.setState({ otherDiscount: text })}
                                    />
                                </View>
                               
                                <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                                    <TouchableOpacity style={{
                                        flex: 1, alignItems: "center", justifyContent: 'center', backgroundColor: '#EF7B49', paddingVertical: 8
                                        , borderRadius: 7, marginHorizontal: 10
                                    }} onPress={() => { 
                                        this.setState({
                                            showNewModal: false,
                                            loading: true,
                                        })
                                        dal.setAgent(this.props.navigation.state.params.endpoint,this.state.editUserId, this.state.userNo,
                                            this.state.prize2D, this.state.prize3D, this.state.discount2D == '' ? 0 : this.state.discount2D,
                                            this.state.discount3D == '' ? 0 : this.state.discount3D, this.state.otherDiscount == '' ? 0 : this.state.otherDiscount,'Edit',
                                             (err, resp) => {
                                                if (err) {
                                                    Alert.alert(config.AppName, 'Something went wrong!')
                                                    this.setState({
                                                        loading: false
                                                    })
                                                } else {
                                                    console.log(resp)
                                                    if (resp == 'OK') {
                                                        Alert.alert(config.AppName, 'Update Successfully!',
                                                            [
                                                                {
                                                                    text: 'OK',
                                                                    onPress: () => {
                                                                        this.setState({
                                                                            agentId: 'NoAgent',
                                                                            editUserId: null,
                                                                            userNo: '',
                                                                            password: '',
                                                                            phoneNo: '',
                                                                            prize2D: '80',
                                                                            prize3D: '550',
                                                                            discount2D: '',
                                                                            discount3D: '',
                                                                            isUser: true,
                                                                            r1: true,
                                                                            r2: true,
                                                                            r3: true,
                                                                            otherDiscount: '',
                                                                            showNewModal: false,
                                                                            loading: false
                                                                        }, () => {
                                                                            if(this.state.showAgent){
                                                                                this.getAgents(true)
                                                                            }else{
                                                                                this.getAllUsers()
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            ])

                                                    } else {
                                                        this.setState({
                                                            loading: false
                                                        })
                                                        Alert.alert(config.AppName, resp)
                                                    }
                                                }
                                        })
                                        

                                    }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Roboto', color: '#fff' }}>
                                            SAVE
                                        </Text>
                                    </TouchableOpacity>

                                </View>

                            </View>
                            :
                            <View style={{ backgroundColor: '#fff', padding: 5, width: width - 10, borderRadius: 5 }}>
                                {this.state.isAgent ? null :
                                    <View style={{
                                        width: (width - 40), height: 50, alignItems: 'center',
                                        borderWidth: 1, borderColor: 'grey', borderRadius: 5, marginVertical: 5, marginHorizontal: 10, flexDirection: 'row'
                                    }}>
                                        <Picker
                                            mode='dropdown'
                                            selectedValue={this.state.agentId}
                                            style={{ height: height * 0.08, width: (width - 90) }}
                                            onValueChange={(itemValue, itemIndex) => {
                                                this.setState({
                                                    agentId: itemValue,
                                                })
                                                // let i=this.state.agents.findIndex(x => x.AgentID==itemValue);
                                                //     if(i!==-1){
                                                //         this.setState({
                                                //             agentId:itemValue,
                                                //         })
                                                //     }else{
                                                //         this.setState({
                                                //             agentId:itemValue,
                                                //             discount:0
                                                //         })
                                                //     }
                                            }}>
                                            <Picker.Item label={'Choose Agent'} value={'NoAgent'} />
                                            {this.renderUsers()}
                                        </Picker>
                                        <TouchableOpacity
                                            style={{ width: 50, height: 50, backgroundColor: Color.ORANGE, alignItems: 'center', justifyContent: 'center' }}
                                            onPress={() => {
                                                this.setState({ isAgent: true })
                                            }}
                                        >
                                            <Image source={plusIcon} style={{ width: 30, height: 30, tintColor: '#fff' }} />
                                        </TouchableOpacity>
                                    </View>
                                }
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={this.state.isAgent ?
                                            word[this.props.navigation.state.params.lg].name
                                            : word[this.props.navigation.state.params.lg].user}
                                        placeholderTextColor={'#262626'}
                                        value={this.state.userNo}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => this.setState({ userNo: text })}
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input]}
                                        placeholder={word[this.props.navigation.state.params.lg].password}
                                        placeholderTextColor={'#262626'}
                                        secureTextEntry={this.state.showPassword ? false : true}
                                        value={this.state.password}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => this.setState({ password: text })}
                                    />
                                    {/* TZT */}
                                    {/* {    
                            !this.state.UseMoneyInOut?
                            <TouchableOpacity style={{flexDirection:'row',marginHorizontal:10,alignItems:'center'}}
                                onPress={()=>{
                                    this.setState({
                                        showPassword:!this.state.showPassword
                                    })
                                }}>
                                <Image source={this.state.showPassword?show:hide} 
                                    style={{width:25,height:25,marginRight:5,tintColor:Color.PRIMARYCOLOR}}/>
                            </TouchableOpacity>:null
                            } */}
                                    {/* end TZT */}
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={word[this.props.navigation.state.params.lg].phno}
                                        placeholderTextColor={'#262626'}
                                        value={this.state.phoneNo}
                                        keyboardType='decimal-pad'
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => this.setState({ phoneNo: text })}
                                    />
                                </View>
                                {this.state.isAgent ? null :
                                    <View style={{
                                        flexDirection: 'row',
                                        marginHorizontal: 10,
                                        marginVertical: 5
                                    }}>
                                        <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                            onPress={() => {
                                                this.setState({
                                                    isUser: true
                                                })
                                            }}>
                                            <Image source={this.state.isUser ? radio_btn_selected : radio_btn_unselected}
                                                style={{ width: 25, height: 25, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                            <Text style={{ color: '#262626', fontSize: 16, }}>{word[this.props.navigation.state.params.lg].user}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                            onPress={() => {
                                                this.setState({
                                                    isUser: false
                                                })
                                            }}>
                                            <Image source={this.state.isUser ? radio_btn_unselected : radio_btn_selected}
                                                style={{ width: 25, height: 25, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                            <Text style={{ color: '#262626', fontSize: 16, }}>{word[this.props.navigation.state.params.lg].dude}</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                                <View style={{
                                    flexDirection: 'row',
                                    marginHorizontal: 10,
                                    marginVertical: 5
                                }}>
                                    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                        onPress={() => {
                                            this.setState({
                                                r1: !this.state.r1
                                            })
                                        }}>
                                        <Image source={this.state.r1 ? tickIcon : untickIcon} style={{ width: 23, height: 23, marginRight: 5 }} />
                                        <Text style={{ color: '#262626', fontSize: 16, fontWeight: 'bold' }}>2D</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                        onPress={() => {
                                            this.setState({
                                                r2: !this.state.r2
                                            })
                                        }}>
                                        <Image source={this.state.r2 ? tickIcon : untickIcon} style={{ width: 23, height: 23, marginRight: 5 }} />
                                        <Text style={{ color: '#262626', fontSize: 16, fontWeight: 'bold' }}>3D</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                        onPress={() => {
                                            this.setState({
                                                r3: !this.state.r3
                                            })
                                        }}>
                                        <Image source={this.state.r3 ? tickIcon : untickIcon} style={{ width: 23, height: 23, marginRight: 5 }} />
                                        <Text style={{ color: '#262626', fontSize: 16, fontWeight: 'bold' }}>Win Only</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    marginHorizontal: 10,
                                    marginVertical: 7,
                                    height: 48,
                                    width: (width - 40),
                                }}>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        marginRight: 10,
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.8,
                                        height: 48,
                                        borderColor: Color.DIVIDERCOLOR,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={word[this.props.navigation.state.params.lg].prize2d}
                                            keyboardType='decimal-pad'
                                            placeholderTextColor={'#262626'}
                                            value={this.state.prize2D}
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ prize2D: text })}
                                        />
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.8,
                                        borderColor: Color.DIVIDERCOLOR,
                                        height: 48,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={word[this.props.navigation.state.params.lg].discount2d}
                                            keyboardType='decimal-pad'
                                            placeholderTextColor={'#262626'}
                                            value={this.state.discount2D}
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ discount2D: text })}
                                        />
                                    </View>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    marginHorizontal: 10,
                                    marginVertical: 7,
                                    height: 48,
                                    width: (width - 40),
                                }}>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        marginRight: 10,
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.8,
                                        borderColor: Color.DIVIDERCOLOR,
                                        height: 48,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={word[this.props.navigation.state.params.lg].prize3d}
                                            placeholderTextColor={'#262626'}
                                            value={this.state.prize3D}
                                            keyboardType='decimal-pad'
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ prize3D: text })}
                                        />
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#DCDCDC59',
                                        borderRadius: 5,
                                        borderWidth: 0.8,
                                        borderColor: Color.DIVIDERCOLOR,
                                        height: 48,
                                    }}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder={word[this.props.navigation.state.params.lg].discount3d}
                                            keyboardType='decimal-pad'
                                            placeholderTextColor={'#262626'}
                                            value={this.state.discount3D}
                                            underlineColorAndroid="transparent"
                                            onChangeText={(text) => this.setState({ discount3D: text })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={word[this.props.navigation.state.params.lg].otherdiscount}
                                        keyboardType='decimal-pad'
                                        placeholderTextColor={'#262626'}
                                        value={this.state.otherDiscount}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => this.setState({ otherDiscount: text })}
                                    />
                                </View>
                                {
                                    this.props.navigation.state.params.user[0].UseMoneyInOut ? <View style={{
                                        flexDirection: 'row',
                                        marginHorizontal: 10,
                                        marginVertical: 5
                                    }}>
                                        <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                            onPress={() => {
                                                this.setState({
                                                    isDebit: false
                                                })
                                            }}>
                                            <Image source={!this.state.isDebit ? radio_btn_selected : radio_btn_unselected}
                                                style={{ width: 25, height: 25, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                            <Text style={{ color: '#262626', fontSize: 16, }}>{word[this.props.navigation.state.params.lg].credit}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}
                                            onPress={() => {
                                                this.setState({
                                                    isDebit: true
                                                })
                                            }}>
                                            <Image source={this.state.isDebit ? radio_btn_selected : radio_btn_unselected}
                                                style={{ width: 25, height: 25, marginRight: 5, tintColor: Color.PRIMARYCOLOR }} />
                                            <Text style={{ color: '#262626', fontSize: 16, }}>{word[this.props.navigation.state.params.lg].debit}</Text>
                                        </TouchableOpacity>
                                    </View> : null
                                }
                                <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                                    <TouchableOpacity style={{
                                        flex: 1, alignItems: "center", justifyContent: 'center', backgroundColor: '#EF7B49', paddingVertical: 8
                                        , borderRadius: 7, marginHorizontal: 10
                                    }} onPress={() => {
                                        if (this.state.agentId == 'NoAgent' && !this.state.isAgent) {
                                            Alert.alert(config.AppName, 'Please Choose Agent!')
                                            return;
                                        }
                                        if (this.state.userNo == '') {
                                            Alert.alert(config.AppName, 'Please enter username!')
                                            return;
                                        }
                                        if (this.state.password == '') {
                                            Alert.alert(config.AppName, 'Please enter password!')
                                            return;
                                        }
                                        // if(this.state.discount2D==''){
                                        //     Alert.alert(config.AppName,'Please enter discount 2D!')
                                        //     return;
                                        // } 
                                        // if(this.state.discount3D==''){
                                        //     Alert.alert(config.AppName,'Please enter discount 3D!')
                                        //     return;
                                        // } 
                                        this.setState({
                                            showNewModal: false,
                                            loading: true,
                                        })
                                        if (this.state.isAgent) {
                                            let permission = ''
                                            permission += this.state.r1 ? '2' : ''
                                            permission += this.state.r2 ? '3' : ''
                                            permission += this.state.r3 ? 'W' : ''
                                            dal.saveAgent(this.props.navigation.state.params.endpoint, 'Agent', this.state.userNo, this.state.password, this.state.phoneNo,
                                                this.state.prize2D, this.state.prize3D, this.state.discount2D == '' ? 0 : this.state.discount2D,
                                                this.state.discount3D == '' ? 0 : this.state.discount3D, this.state.otherDiscount == '' ? 0 : this.state.otherDiscount, false
                                                , permission, this.state.isDebit, (err, resp) => {
                                                    if (err) {
                                                        Alert.alert(config.AppName, 'Something went wrong!')
                                                        this.setState({
                                                            loading: false,
                                                            isAgent: false
                                                        })
                                                    } else {
                                                    console.log(resp)
                                                    if (resp == 'OK') {
                                                        Alert.alert(config.AppName, 'Save Successfully!',
                                                            [
                                                                {
                                                                        text: 'OK',
                                                                        onPress: () => {
                                                                            this.setState({
                                                                                agentId: 'NoAgent',
                                                                                editUserId: null,
                                                                                userNo: '',
                                                                                password: '',
                                                                                phoneNo: '',
                                                                                prize2D: '80',
                                                                                prize3D: '550',
                                                                                discount2D: '',
                                                                                discount3D: '',
                                                                                isUser: true,
                                                                                r1: true,
                                                                                r2: true,
                                                                                r3: true,
                                                                                otherDiscount: '',
                                                                                showNewModal: false,
                                                                                loading: false,
                                                                                isAgent: false
                                                                            }, () => {
                                                                                this.getAgents()
                                                                                this.getAllUsers()
                                                                            })
                                                                        }
                                                                    }
                                                                ])

                                                        } else {
                                                            this.setState({
                                                                loading: false,
                                                                isAgent: false
                                                            })
                                                            Alert.alert(config.AppName, resp)
                                                        }
                                                    }
                                                })
                                            return;
                                        }
                                        if (this.state.editUserId == null) {
                                            let permission = ''
                                            permission += this.state.r1 ? '2' : ''
                                            permission += this.state.r2 ? '3' : ''
                                            permission += this.state.r3 ? 'W' : ''
                                            dal.saveUser(this.props.navigation.state.params.endpoint, this.state.agentId, this.state.userNo, this.state.password, this.state.phoneNo,
                                                this.state.prize2D, this.state.prize3D, this.state.discount2D == '' ? 0 : this.state.discount2D,
                                                this.state.discount3D == '' ? 0 : this.state.discount3D, this.state.otherDiscount == '' ? 0 : this.state.otherDiscount,
                                                this.state.isUser, permission, this.state.isDebit, (err, resp) => {
                                                    if (err) {
                                                        Alert.alert(config.AppName, 'Something went wrong!')
                                                        this.setState({
                                                            loading: false
                                                        })
                                                    } else {
                                                    console.log(resp)
                                                    if (resp == 'OK') {
                                                        Alert.alert(config.AppName, 'Save Successfully!',
                                                            [
                                                                {
                                                                        text: 'OK',
                                                                        onPress: () => {
                                                                            this.shareUserInfo()
                                                                            this.setState({
                                                                                agentId: 'NoAgent',
                                                                                editUserId: null,
                                                                                userNo: '',
                                                                                password: '',
                                                                                phoneNo: '',
                                                                                prize2D: '80',
                                                                                prize3D: '550',
                                                                                discount2D: '',
                                                                                discount3D: '',
                                                                                isUser: true,
                                                                                r1: true,
                                                                                r2: true,
                                                                                r3: true,
                                                                                otherDiscount: '',
                                                                                showNewModal: false,
                                                                                loading: false
                                                                            }, () => {
                                                                                this.getAllUsers()
                                                                            })
                                                                        }
                                                                    }
                                                                ])

                                                        } else {
                                                            this.setState({
                                                                loading: false
                                                            })
                                                            Alert.alert(config.AppName, resp)
                                                        }
                                                    }
                                                })
                                        } else {
                                            let permission = ''
                                            permission += this.state.r1 ? '2' : ''
                                            permission += this.state.r2 ? '3' : ''
                                            permission += this.state.r3 ? 'W' : ''
                                            dal.updateUser(this.props.navigation.state.params.endpoint, this.state.agentId, this.state.editUserId, this.state.userNo, this.state.password, this.state.phoneNo,
                                                this.state.prize2D, this.state.prize3D, this.state.discount2D == '' ? 0 : this.state.discount2D,
                                                this.state.discount3D == '' ? 0 : this.state.discount3D, this.state.otherDiscount == '' ? 0 : this.state.otherDiscount,
                                                this.state.isUser, permission, this.state.isDebit, (err, resp) => {
                                                    if (err) {
                                                        Alert.alert(config.AppName, 'Something went wrong!')
                                                        this.setState({
                                                            loading: false
                                                        })
                                                    } else {
                                                    console.log(resp)
                                                    if (resp == 'OK') {
                                                        Alert.alert(config.AppName, 'Update Successfully!',
                                                            [
                                                                {
                                                                        text: 'OK',
                                                                        onPress: () => {
                                                                            this.setState({
                                                                                agentId: 'NoAgent',
                                                                                editUserId: null,
                                                                                userNo: '',
                                                                                password: '',
                                                                                phoneNo: '',
                                                                                prize2D: '80',
                                                                                prize3D: '550',
                                                                                discount2D: '',
                                                                                discount3D: '',
                                                                                isUser: true,
                                                                                r1: true,
                                                                                r2: true,
                                                                                r3: true,
                                                                                otherDiscount: '',
                                                                                showNewModal: false,
                                                                                loading: false
                                                                            }, () => {
                                                                                this.getAllUsers()
                                                                            })
                                                                        }
                                                                    }
                                                                ])

                                                        } else {
                                                            this.setState({
                                                                loading: false
                                                            })
                                                            Alert.alert(config.AppName, resp)
                                                        }
                                                    }
                                                })
                                        }

                                    }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Roboto', color: '#fff' }}>
                                            SAVE
                                        </Text>
                                    </TouchableOpacity>

                                </View>

                            </View>
                    }

                </View>
            </Modal>
        )
    }
    renderLoading() {
        return (
            <Loading show={this.state.loading}></Loading>
        )
    }
    renderHeader() {
        return (
            <View style={{
                width: width,
                height: 58,
                backgroundColor: Color.PRIMARYCOLOR,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 10
            }}>
                <TouchableOpacity style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }} onPress={() => {
                    this.props.navigation.goBack()
                }}>
                    <Image source={backIcon} style={{
                        width: 30,
                        height: 30,
                        tintColor: '#fff'
                    }} />
                    <View style={{ marginLeft: 5 }}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>
                            {config.AppName || 'App'}
                        </Text>
                        <Text style={{ color: '#fff', fontSize: 18 }}>
                            {word[this.props.navigation.state.params.lg].user}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }} onPress={() => {
                        this.setState({
                            showAgent: !this.state.showAgent,
                            loading: true
                        }, () => {
                            if (this.state.showAgent) {
                                this.getAgents(true)
                            } else {
                                this.getAllUsers()
                            }
                        })
                    }}>
                        <Image source={this.state.showAgent ? tickIcon : untickIcon} style={{ height: 25, width: 25, tintColor: '#fff' }} />
                        <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold', marginLeft: 8 }}>
                            Agent
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            marginLeft: 10,
                            paddingHorizontal: 10,
                            height: 30,
                            borderRadius: 5,
                            borderWidth: 1,
                            borderColor: '#fff',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => {
                            this.shareApkInfo();
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                            Share Apk
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    renderAllUpdate() {
        return (
            <View style={{
                backgroundColor: '#DCDCDC80',
                marginBottom: 5
            }}>
                <View style={{
                    flexDirection: 'row',
                    marginHorizontal: 10,
                    marginVertical: 7,
                    height: 40,
                    width: (width - 40),
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontFamily: 'Roboto-Bold',
                        fontSize: 16,
                        marginRight: 5
                    }}>
                        {word[this.props.navigation.state.params.lg].prize2d}
                    </Text>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        marginRight: 10,
                        alignItems: 'center',
                        borderRadius: 5,
                        borderWidth: 0.8,
                        borderColor: Color.DIVIDERCOLOR,
                        height: 40,
                    }}>
                        <TextInput
                            style={styles.input}
                            placeholder={''}
                            placeholderTextColor={'#262626'}
                            value={this.state.update2d}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => this.setState({ update2d: text })}
                        />
                    </View>
                    <TouchableOpacity style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height: 40,
                        justifyContent: 'center'
                    }} onPress={() => {
                        if (this.state.update2d == '') {
                            Alert.alert(config.AppName, 'Please enter prize 2D!')
                            return;
                        }
                        this.setState({
                            loading: true
                        })
                        dal.updateAllUserPrize(this.props.navigation.state.params.endpoint, this.state.update2d, '2D', (err, resp) => {
                            if (err) {
                                this.setState({
                                    loading: false
                                })
                                Alert.alert(config.AppName, 'Something went wrong!')
                            } else {
                                if (resp == 'OK') {
                                    this.setState({
                                        loading: false,
                                        update2d: ''
                                    })
                                    Alert.alert(config.AppName, 'Updated successfully!')
                                } else {
                                    this.setState({
                                        loading: false
                                    })
                                    Alert.alert(config.AppName, 'Error in updating!')
                                }
                            }
                        })
                    }}>
                        <Text style={{
                            fontFamily: 'Roboto-Bold',
                            fontSize: 16,
                            color: '#fff'
                        }}>
                            2D Update All
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    flexDirection: 'row',
                    marginHorizontal: 10,
                    marginVertical: 7,
                    height: 40,
                    width: (width - 40),
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontFamily: 'Roboto-Bold',
                        fontSize: 16,
                        marginRight: 5
                    }}>
                        {word[this.props.navigation.state.params.lg].prize3d}
                    </Text>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        marginRight: 10,
                        alignItems: 'center',
                        borderRadius: 5,
                        borderWidth: 0.8,
                        borderColor: Color.DIVIDERCOLOR,
                        height: 40,
                    }}>
                        <TextInput
                            style={styles.input}
                            placeholder={''}
                            placeholderTextColor={'#262626'}
                            value={this.state.update3d}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => this.setState({ update3d: text })}
                        />
                    </View>
                    <TouchableOpacity style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        height: 40,
                        justifyContent: 'center'
                    }} onPress={() => {
                        if (this.state.update3d == '') {
                            Alert.alert(config.AppName, 'Please enter prize 3D!')
                            return;
                        }
        this.setState({
            loading: true
        })
        dal.updateAllUserPrize(this.props.navigation.state.params.endpoint, this.state.update3d, '3D', (err, resp) => {
                            if (err) {
                                this.setState({
                                    loading: false
                                })
                                Alert.alert(config.AppName, 'Something went wrong!')
                            } else {
                                if (resp == 'OK') {
                                    this.setState({
                                        loading: false,
                                        update3d: ''
                                    })
                                    Alert.alert(config.AppName, 'Updated successfully!')
                                } else {
                                    this.setState({
                                        loading: false
                                    })
                                    Alert.alert(config.AppName, 'Error in updating!')
                                }
                            }
                        })
                    }}>
                    <Text style={{
                        fontFamily: 'Roboto-Bold',
                        fontSize: 16,
                        color: '#fff'
                    }}>
                        3D Update All
                    </Text>
                </TouchableOpacity>
            </View>
            {!this.state.showAgent && (
            <View style={{
                flexDirection: 'row',
                marginHorizontal: 10,
                marginVertical: 7,
                height: 40,
                width: (width - 40),
                alignItems: 'center'
            }}>
                <View style={{ flex: 0.55, marginRight: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{
                        fontFamily: 'Roboto-Bold',
                        fontSize: 16,
                        marginRight: 5
                    }}>
                        Agent
                    </Text>
                    <View style={{
                        flex: 1,
                        borderRadius: 5,
                        borderWidth: 0.8,
                        borderColor: Color.DIVIDERCOLOR,
                        height: 40,
                        justifyContent: 'center'
                    }}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.agentId || 'All'}
                            style={{ height: 40, width: '100%' }}
                            onValueChange={(itemValue, itemIndex) => {
                                this.setState({ agentId: itemValue, loading: true }, () => {
                                    if (itemValue === 'All') {
                                        this.getAllUsers();
                                        return;
                                    }
                                    dal.getUsersByAgent(this.props.navigation.state.params.endpoint, itemValue, (err, resp) => {
                                        if (err) {
                                            this.setState({ loading: false });
                                            Alert.alert(config.AppName, 'Can\'t retrieve users data!');
                                        } else {
                                        if (resp && resp.Status == 'OK' && resp.Data.length) {
                                            this.setState({
                                                dataProvider: dataProvider.cloneWithRows(resp.Data),
                                                userListRaw: resp.Data,
                                                loading: false
                                            });
                                        } else {
                                            this.setState({
                                                dataProvider: dataProvider.cloneWithRows([]),
                                                userListRaw: [],
                                                loading: false
                                            });
                                            }
                                        }
                                    });
                                });
                            }}>
                            <Picker.Item label={'All'} value={'All'} />
                            {this.renderUsers()}
                        </Picker>
                    </View>
                </View>
                <View style={{ flex: 0.45, flexDirection: 'row', alignItems: 'center' }}>
                    
                    <View style={{
                        flex: 1,
                        borderRadius: 5,
                        borderWidth: 0.8,
                        borderColor: Color.DIVIDERCOLOR,
                        height: 40,
                        justifyContent: 'center'
                    }}>
                        <TextInput
                            style={styles.input}
                            placeholder={'ထိုးသားရှာရန်။'}
                            placeholderTextColor={'#262626'}
                            value={this.state.userSearchText}
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => this.filterUserList(text)}
                        />
                    </View>
                </View>
            </View>
            )}
        </View>
        )
    }
    render() {
        return (
            <View style={styles.container}>
                {this.renderHeader()}
                {this.renderAllUpdate()}
                <View style={{
                    width: width,
                    height: 50,
                    borderBottomWidth: 1,
                    borderColor: Color.DIVIDERCOLOR,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <View style={{
                        flex: 4
                    }}>
                        <Text style={{
                            color: Color.YELLOWCOLOR,
                            fontSize: 13,

                            textAlign: 'center'
                        }}>
                            {word[this.props.navigation.state.params.lg].user}
                        </Text>
                    </View>
                    <View style={{
                        flex: 2
                    }}>
                        <Text style={{
                            color: Color.YELLOWCOLOR,
                            fontSize: 13,

                            textAlign: 'center'
                        }}>
                            {word[this.props.navigation.state.params.lg].discount2d}
                        </Text>
                    </View>
                    <View style={{
                        flex: 2
                    }}>
                        <Text style={{
                            color: Color.YELLOWCOLOR,
                            fontSize: 13,

                            textAlign: 'center'
                        }}>
                            {word[this.props.navigation.state.params.lg].discount3d}
                        </Text>
                    </View>
                    <View style={{
                        width: 40,
                        height: 40
                    }} />
                    <View style={{
                        width: 40,
                        height: 40
                    }} />
                </View>
                <View style={{ flex: 1 }}>
                    <RecyclerListView layoutProvider={this._layoutProvider} dataProvider={this.state.dataProvider} rowRenderer={this._rowRenderer} />
                </View>
                <View style={{ flexDirection: 'row', marginVertical: 10, alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 10 }}>
                    <TouchableOpacity
                        style={{
                            paddingVertical: 10,
                            flex: 1,
                            backgroundColor: Color.PRIMARYCOLOR,
                            borderRadius: 5,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => {
                            this.setState({
                                showNewModal: true
                            })
                            // AsyncStorage.removeItem('token')
                            // this.props.navigation.navigate('Login')
                        }}>
                        <Image source={plusIcon} style={{ width: 17, height: 17, tintColor: '#fff' }} />
                        <Text style={{ color: '#fff', fontSize: 18, marginLeft: 5, }}>
                            {word[this.props.navigation.state.params.lg].create}
                        </Text>
                    </TouchableOpacity>
                </View>
                {this.renderNewModal()}
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
        marginHorizontal: 10,
        marginVertical: 5,
        alignItems: 'center',
        backgroundColor: '#DCDCDC59',
        borderRadius: 5,
        borderWidth: 0.8,
        borderColor: Color.DIVIDERCOLOR,
    },
    input: {
        height: 40,
        flex: 1,
        padding: 4,
        color: "#000",
        fontSize: 15,

    },
});



