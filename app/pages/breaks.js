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
  Picker
} from 'react-native';
import dal from '../dal.js'
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import plusIcon from '../assets/images/plus.png'
import tickIcon from '../assets/images/tick.png'
import untickIcon from '../assets/images/untick.png'
import backIcon from '../assets/images/backward.png'
import editIcon from '../assets/images/edit.png'
import deleteIcon from '../assets/images/delete.png'
import Color from '../utils/Color.js';
import config from '../config/config.js'
import word from './data.json'
const {width,height}=Dimensions.get('window')
const SAFE_DIVIDER = Color.DIVIDERCOLOR || '#ccc';
import Loading from '../components/loading.js'
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            breaks:[],
            terms:[],
            agents:[],
            update2d:'',
            update3d:'',
            loading:true,
            termId:'NoTerm',
            agentId:0,
            hotPercentage:''
            //dataProvider: dataProvider.cloneWithRows([]),
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
        this.APITermDetailByDate()
        this.APIAgents()
    }
    _rowRenderer(type, data,index) {
        return (
            <View style={styles.row}>
                <View style={styles.cell}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:15,
                        textAlign:'center'
                    }}>
                        {data.UserName}
                    </Text>
                </View>
                <View style={styles.cell}>
                    <TextInput
                        style={styles.inputRow}
                        value={(data.UnitBreak ?? '').toString()}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        onChangeText={(text)=>{
                          this.state.breaks[index].UnitBreak=text
                          this.setState({
                              breaks:this.state.breaks
                          },()=>{
                            //   this.setState({
                            //     dataProvider: dataProvider.cloneWithRows(this.state.breaks),
                            //   })
                          })
                        }}
                    />
                    {/* <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        textAlign:'center'
                    }}>
                        {data.UnitBreak}
                    </Text> */}
                </View>
                <View style={styles.cellLast}>
                    <TextInput
                        style={styles.inputRow}
                        value={(data.HotBreak ?? '').toString()}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        onChangeText={(text)=>{
                            this.state.breaks[index].HotBreak=text
                            this.setState({
                                breaks:this.state.breaks
                            },()=>{
                                // this.setState({
                                //   dataProvider: dataProvider.cloneWithRows(this.state.breaks),
                                // })
                            })
                          }}
                    />
                    {/* <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        textAlign:'center'
                    }}>
                        {data.HotBreak}
                    </Text> */}
                </View>
            </View>
        );
    }
    renderTerms(){
        return this.state.terms.map((value,index)=>{
          return(
            <Picker.Item label={value.Name} value={value.TermDetailID} key={index} />
          )
        })
    }
    renderAgents(){
        return this.state.agents.map((value,index)=>{
          return(
            <Picker.Item label={value.AgentName} value={value.AgentID} key={index} />
          )
        })
    }
    APITermDetailByDate(){
        dal.APITermDetailByDate(this.props.navigation.state.params.endpoint,(err,resp)=>{
        if(err){
            Alert.alert(config.AppName,'Can\'t retrieve agents data!')
            this.setState({
                loading:false
            })
        }else{
            console.log(resp)
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                this.setState({
                    terms: resp.Data,
                    loading:false
                })
            }else{
                Alert.alert(config.AppName,resp.Status)
                this.setState({
                    terms:[],
                    loading:false
                })
            }
        }
        })
    }
    APIAgents(){
        dal.getAgents(this.props.navigation.state.params.endpoint,(err,resp)=>{
        if(err){
            Alert.alert(config.AppName,'Can\'t retrieve agents data!')
        }else{
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                let list = [{AgentID:0,AgentName:'All'}, ...resp.Data]
                this.setState({
                    agents: list
                })
            }else{
                Alert.alert(config.AppName,resp.Status)
                this.setState({
                    agents:[{AgentID:0,AgentName:'All'}]
                })
            }
        }
        })
    }
    APICustomerBreak(){
        let agentId = this.state.agentId || 0;
        dal.APICustomerBreak(this.props.navigation.state.params.endpoint,this.state.termId,agentId,(err,resp)=>{
        if(err){
            Alert.alert(config.AppName,'Something went wrong!')
            this.setState({
                loading:false
            })
        }else{
            if(resp&&resp.Data.length){
                let temp=resp.Data
                let i=this.state.terms.findIndex(x => x.TermDetailID==this.state.termId);
                if(i!=-1){
                    temp[0].LottType=this.state.terms[i].LottType
                }
                this.setState({
                    breaks:temp,
                    loading:false
                },()=>{
                    // this.setState({
                    //     dataProvider: dataProvider.cloneWithRows(this.state.breaks),
                    // })
                })
            }else{
                Alert.alert(config.AppName,'Can\'t retrieve users data!')
                this.setState({
                    breaks:[],
                    loading:false
                })
            }
        }
        })
    }
    replaceChar(replaceChar, index) {
        let firstPart = this.state.typeStr.substr(0, index);
        let lastPart = this.state.typeStr.substr(index + 1);
          
        let newString = firstPart + replaceChar + lastPart;
        return newString;
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
                    <Text style={{ color: '#fff', fontSize: 12 }}>
                        {config.AppName || 'App'}
                    </Text>
                    <Text style={{color:'#fff',fontSize:18}}>
                        {word[this.props.navigation.state.params.lg].break}
                    </Text>
                </View>
                <View style={{flex:1}} />
            </View>
        )
    }

    renderAllUpdate(){
        return(
            <View style={{
                backgroundColor:'#DCDCDC80',
                marginBottom:5
            }}>
                <View style={styles.updateRow}>
                    <Text style={styles.updateLabel}>
                        {word[this.props.navigation.state.params.lg].breakAll}
                    </Text>
                    <View style={styles.updateInputWrap}>
                        <TextInput
                            style={styles.updateInput}
                            value={this.state.update2d}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({update2d:text})}
                        />
                    </View>
                    <TouchableOpacity style={styles.updateBtnPrimary} onPress={()=>{
                        if(this.state.update2d==''){
                            Alert.alert(config.AppName,'Please enter break!')
                            return;
                        }
                        this.setState({
                            loading:true
                        })
                        dal.saveBreakAll(this.props.navigation.state.params.endpoint,this.state.breaks,this.state.update2d,"Break",(err,resp)=>{
                        //dal.updateAllUserPrize(this.props.navigation.state.params.endpoint,this.state.update2d,'2D',(err,resp)=>{
                            if(err){
                                this.setState({
                                    loading:false
                                })
                                Alert.alert(config.AppName,'Something went wrong!')
                            }else{
                                if(resp=='OK'){
                                    this.setState({
                                        breaks:[],
                                        update2d:'',
                                        update3d:'',
                                        loading:false
                                    },()=>{
                                        this.APICustomerBreak()
                                    })
                                    Alert.alert(config.AppName,'Updated successfully!')
                                   
                                }else{
                                    this.setState({
                                        loading:false
                                    })
                                    Alert.alert(config.AppName,'Error in updating!')
                                }
                            }
                        })
                    }}>
                        <Text style={{
                            fontFamily:'Roboto-Bold',
                            fontSize:14,
                            color:'#fff'
                        }}>
                            Break Update
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.updateRow}>
                    <Text style={styles.updateLabel}>
                        {word[this.props.navigation.state.params.lg].breakHotAll}
                    </Text>
                    <View style={styles.updateInputWrap}>
                        <TextInput
                            style={styles.updateInput}
                            value={this.state.update3d}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({update3d:text})}
                        />
                    </View>
                    <TouchableOpacity style={styles.updateBtnPrimary} onPress={()=>{
                        if(this.state.update3d==''){
                            Alert.alert(config.AppName,'Please enter hot break!')
                            return;
                        }
                        this.setState({
                            loading:true
                        })
                        dal.saveBreakAll(this.props.navigation.state.params.endpoint,this.state.breaks,this.state.update3d,"Hot",(err,resp)=>{
                            if(err){
                                this.setState({
                                    loading:false
                                })
                                Alert.alert(config.AppName,'Something went wrong!')
                            }else{
                                if(resp=='OK'){
                                    this.setState({
                                        breaks:[],
                                        update2d:'',
                                        update3d:'',
                                        loading:false
                                    },()=>{
                                        this.APICustomerBreak()
                                    })
                                    Alert.alert(config.AppName,'Updated successfully!')
                                }else{
                                    this.setState({
                                        loading:false
                                    })
                                    Alert.alert(config.AppName,'Error in updating!')
                                }
                            }
                        })
                    }}>
                        <Text style={{
                            fontFamily:'Roboto-Bold',
                            fontSize:14,
                            color:'#fff'
                        }}>
                            Hot Update
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.updateRow}>
                    <Text style={styles.updateLabel}>
                        {word[this.props.navigation.state.params.lg].hotPercentage}
                    </Text>
                    <View style={styles.updateInputWrap}>
                        <TextInput
                            style={styles.updateInput}
                            value={this.state.hotPercentage}
                            keyboardType='decimal-pad'
                            underlineColorAndroid="transparent"
                            onChangeText={(text)=>this.setState({hotPercentage:text})}
                        />
                    </View>
                    <TouchableOpacity style={styles.updateBtnPrimary} onPress={()=>{
                        if(this.state.termId=='NoTerm'){
                            Alert.alert(config.AppName,'Please select the term!')
                            return;
                        }
                        if(this.state.hotPercentage==''){
                            Alert.alert(config.AppName,'Please enter hot percentage!')
                            return;
                        }
                        this.setState({
                            loading:true
                        })
                        dal.updateHotPercantage(this.props.navigation.state.params.endpoint,this.state.termId,this.state.hotPercentage,(err,resp)=>{
                            if(err){
                                this.setState({
                                    loading:false
                                })
                                Alert.alert(config.AppName,'Something went wrong!')
                            }else{
                                console.log(resp)
                                if(resp=='OK'){
                                    this.setState({
                                        breaks:[],
                                        update2d:'',
                                        update3d:'',
                                        loading:false,
                                    },()=>{
                                        this.APICustomerBreak()
                                    })
                                    Alert.alert(config.AppName,'Updated successfully!')
                                }else{
                                    this.setState({
                                        loading:false
                                    })
                                    Alert.alert(config.AppName,'Error in updating!')
                                }
                            }
                        })
                    }}>
                        <Text style={{
                            fontFamily:'Roboto-Bold',
                            fontSize:14,
                            color:'#fff'
                        }}>
                            Hot % Update
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }


    render() {
        return (
        <View style={styles.container}>
            {this.renderHeader()}
            {this.renderAllUpdate()}
            <View style={{width:(width-30),height:50,justifyContent:'center',
                borderWidth:1,borderColor:SAFE_DIVIDER,borderRadius:5,marginVertical:5,marginHorizontal:15}}>
                <Picker
                    mode='dropdown'
                    selectedValue={this.state.termId}
                    style={{ height:height*0.08, width:(width-30)}}
                    onValueChange={(itemValue, itemIndex) =>{
                        this.setState({
                            termId:itemValue,
                            loading:true
                        },()=>{
                            if(this.state.termId=='NoTerm'){
                                this.setState({
                                    loading:false
                                })
                                Alert.alert(config.AppName,'Please choose term!')
                                return;
                            }
                            this.APICustomerBreak()
                            dal.getHotPercantage(this.props.navigation.state.params.endpoint,this.state.termId,(err,resp)=>{
                                if(err){
                                    this.setState({
                                        loading:false
                                    })
                                    Alert.alert(config.AppName,'Something went wrong!')
                                }else{
                                    console.log( resp)
                                    if(resp.Status=='OK'&&resp.Data.length>0){
                                        this.setState({
                                            loading:false,
                                            hotPercentage:resp.Data[0].HotPercentage.toString()
                                        })
                                    }else{
                                        this.setState({
                                            loading:false
                                        })
                                    }
                                }
                            })
                        })
                    }}>
                    
                    <Picker.Item  label={'Select File'} value={'NoTerm'}/>
                    {this.renderTerms()}
                    
                </Picker>
            </View>
            <View style={styles.headerRow}>
                <View style={styles.cell}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:13,
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].name}
                    </Text>
                </View>
                <View style={styles.cell}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:13,
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].break}
                    </Text>
                </View>
                <View style={styles.cellLast}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:13,
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].hotbreak}
                    </Text>
                </View>
            </View>
            <View style={{flex:1}}>
                <RecyclerListView 
                    layoutProvider={this._layoutProvider} 
                    dataProvider={dataProvider.cloneWithRows(this.state.breaks)} 
                    rowRenderer={this._rowRenderer} 
                    extendedState={this.state}
                />
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
                        loading:true
                    },()=>{
                        console.log('breaks list',this.state.breaks)
                        dal.saveBreak(this.props.navigation.state.params.endpoint,this.state.breaks,(err,resp)=>{
                            if(err){
                                Alert.alert(config.AppName,'Something went wrong!')
                                this.setState({
                                    loading:false
                                })
                            }else{
                                console.log(resp)
                                if(resp=='OK'){
                                    Alert.alert(config.AppName,'Saved Successfully!')
                                    this.setState({
                                        breaks:[],
                                        loading:false
                                    },()=>{
                                        this.APICustomerBreak()
                                    })
                                }else{
                                    Alert.alert(config.AppName,'Error in Saving!')
                                    this.setState({
                                        loading:false
                                    })
                                }
                            }
                        })
                    })
                }}>
                <Text style={{color:'#fff',fontSize:18,marginLeft:5,}}>
                    Save
                </Text>
            </TouchableOpacity>
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
        borderColor: SAFE_DIVIDER,
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
        alignItems:'center',
    },
    input: {
        height: height*0.06,
        flex:1,
        textAlign: 'center',
        color            : "#000",
        fontSize         : 14,
        marginHorizontal:10,
        backgroundColor:'#fff',
        borderRadius:4,
        borderWidth:1,
        borderColor: SAFE_DIVIDER
    },
    inputPlain: {
        flex: 1,
        height: 38,
        textAlign: 'center',
        color: '#000',
        fontSize: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: SAFE_DIVIDER,
        paddingVertical: 0,
    },
    updateRow: {
        flexDirection:'row',
        marginHorizontal:10,
        marginVertical:4,
        height:42,
        width:(width-40),
        alignItems:'center'
    },
    updateLabel: {
        width: 95,
        fontFamily:'Roboto-Bold',
        fontSize:14,
        color: '#262626',
        textAlignVertical:'center'
    },
    updateInputWrap: {
        flex:1,
        borderRadius:5,
        borderWidth:0.8,
        borderColor: SAFE_DIVIDER,
        height:40,
        justifyContent:'center',
        marginRight:6
    },
    updateInput: {
        paddingHorizontal:8,
        color:'#000',
        textAlign:'center',
        fontSize:14,
        height:40,
        lineHeight:40,
        textAlignVertical:'center',
        paddingVertical:0
    },
    updateBtnPrimary: {
        width: 90,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor: Color.PRIMARYCOLOR,
        borderRadius: 5,
        height:40,
        justifyContent:'center'
    },
    updateBtnSecondary: {
        width: 80,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor: Color.Green,
        borderRadius: 5,
        height:34,
        justifyContent:'center',
        marginLeft:6
    },
    row: {
        width: width,
        height: 40,
        borderBottomWidth: 1,
        borderColor: SAFE_DIVIDER,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    headerRow: {
        width: width,
        height: 50,
        borderBottomWidth: 1,
        borderColor: SAFE_DIVIDER,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    cell: {
        flex: 2,
        borderRightWidth: 1,
        borderColor: SAFE_DIVIDER,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputRow: {
        flex: 1,
        height: 36,
        textAlign: 'center',
        color: '#000',
        fontSize: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: SAFE_DIVIDER,
        borderRadius: 4,
        paddingVertical: 0,
        marginHorizontal: 6
    },
    cellLast: {
        flex: 2,
        borderRightWidth: 0,
        borderColor: SAFE_DIVIDER,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
});
