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
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dal from '../dal.js'
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import informationImg from '../assets/images/information.png'
import editIcon from '../assets/images/edit.png'
import config from '../config/config.js'
import deleteIcon from '../assets/images/delete.png'
import Color from '../utils/Color.js';
import word from './data.json'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that;
import PopoverTooltip from 'react-native-popover-tooltip';
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
            showModal:false,
            isEdit:true,
            editSaleId:null,
            userNo:'NoUser'
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
    componentDidMount() {
        that=this
        this.getTerms()
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
                    flex:2
                }}onPress={()=>{
                    this.props.navigation.navigate('SlipLogDetails',
                    {
                        saleId:data.SaleHID,
                        endpoint:this.props.navigation.state.params.endpoint,
                        lg:this.props.navigation.state.params.lg
                    })
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.UpdatedDate}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flex:1
                }}onPress={()=>{
                    this.props.navigation.navigate('SlipLogDetails',
                    {
                        saleId:data.SaleHID,
                        endpoint:this.props.navigation.state.params.endpoint,
                        lg:this.props.navigation.state.params.lg
                    })
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.UserName}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flex:1
                }}onPress={()=>{
                    this.props.navigation.navigate('SlipLogDetails',
                    {
                        saleId:data.SaleHID,
                        endpoint:this.props.navigation.state.params.endpoint,
                        lg:this.props.navigation.state.params.lg
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
                    flex:4
                }}onPress={()=>{
                    this.props.navigation.navigate('SlipLogDetails',
                    {
                        saleId:data.SaleHID,
                        endpoint:this.props.navigation.state.params.endpoint,
                        lg:this.props.navigation.state.params.lg
                    })
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:11,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.Remark}
                    </Text>
                </TouchableOpacity>
                <PopoverTooltip
                    ref='tooltip4'
                    buttonComponent={
                        <View style={{padding:10}}>
                            <Image 
                                source={informationImg}
                                style={{
                                    width:30,
                                    height:30,
                                }}
                            />
                        </View>
                        
                    }
                    items={[
                        {
                            label: `${this.props.navigation.state.params.lg=='uni'?'ပြုပြင်သူ':'ျပဳျပင္သူ'} = ${data.UpdatedUser?data.UpdatedUser:''}`,
                            onPress: () => {}
                        },
                        {
                            label: `${this.props.navigation.state.params.lg=='uni'?'စက်':'စက္'} = ${data?.Machine}`,
                            onPress: () => {}
                        }
                    ]}
                    //animationType='spring'
                    overlayStyle={{backgroundColor: 'transparent'}} // set the overlay invisible
                    tooltipContainerStyle={{borderRadius:0}}
                    labelContainerStyle={{backgroundColor: '#ED5736', alignItems: 'center',paddingHorizontal:10,borderRadius:5}}
                    labelSeparatorColor='#1BD1A5'
                />
            </View>
        );
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
                paddingHorizontal:7,
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
                {/* <View style={{width:((width*0.5)-10),height:40,justifyContent:'center',
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
                </View> */}
            </View>
        )
    }
    getSlipLogs(){
        dal.getSlipLogs(this.props.navigation.state.params.endpoint,this.state.termId,this.state.termDetailsId,(err,resp)=>{
            if(err){
                this.setState({loading:false})
                Alert.alert(config.AppName,'Something went wrong!')
            }else{
                console.log(resp)
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows(resp.Data),
                        loading:false
                    })
                }else{
                    Alert.alert(config.AppName,'No Data!')
                    this.setState({
                        dataProvider: dataProvider.cloneWithRows([]),
                        loading:false
                    })
                }
            }
        })
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
                                    type:this.state.termDetails[i].LottType
                                })
                            }else{
                                this.setState({
                                    termDetailsId:itemValue,
                                })
                            }
                            
                            
                        }}>
                        <Picker.Item label={'Term'} value={'NoTermDetails'}/>
                        {this.renderTermDetails()}
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
                    this.getSlipLogs()
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
    render() {
        return (
        <View style={styles.container}>
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
                    flex:2
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:12,
                        
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].day}
                    </Text>
                </View>
                <View style={{
                    flex:1
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
                    flex:1
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
                    flex:4
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:12,
                        
                        textAlign:'center'
                    }}>
                        Remark
                    </Text>
                </View>
                <View style={{
                    width:50,
                    height:50
                }}/>
            </View>
            <View style={{flex:1}}>
                <RecyclerListView layoutProvider={this._layoutProvider} dataProvider={this.state.dataProvider} rowRenderer={this._rowRenderer} />
            </View>
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