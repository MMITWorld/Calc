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
  AsyncStorage
} from 'react-native';
import dal from '../dal.js'
import asending from '../assets/images/asending.png'
import descending from '../assets/images/descending.png'
import refreshIcon from '../assets/images/refresh.png'
import tickIcon from '../assets/images/tick.png'
import untickIcon from '../assets/images/untick.png'
import backIcon from '../assets/images/backward.png'
import plusIcon from '../assets/images/plus.png'
import deleteIcon from '../assets/images/delete.png'
import Color from '../utils/Color.js';
import config from '../config/config.js'
import word from './data.json'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that;
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            isCut:true,
            isLcut:false,
            break:'',
            cutL1:'0',
            cutL2:'0',
            cutL3:'0',
            cutL4:'0',
            cutL5:'0',
            cutR1:'0',
            cutR2:'0',
            cutR3:'0',
            cutR4:'0',
            isDivide:false,
            round:'0',
            D1:'0',
            D2:'0',
            D3:'0',
            D4:'0',
            D5:'0',
            D6:'0',
            D7:'0',
            D8:'0',
            D9:'0',
            D10:'0',
            showDivide:false,
            CommonD:'0'
        };
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    async componentDidMount() {
        that=this
        const round=await AsyncStorage.getItem('round')||'0'
        console.log(round)
        // this.setState({
        //     round:round
        // })
        this.APITermDetailByDate()
        this.getCutList()
        this.getDivideList()
        setTimeout(() => {
            that.manageDivide()
        }, 2000);
    }
    getDivideList(){
        dal.getDivideList(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.termId,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
            console.log(resp)
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                for(let i=0;i<resp.Data.length;i++){
                    if(i!=0){
                        this.setState({
                            isDivide:resp.Data[i].DivideLedger,
                            ['D'+(i+1)]:resp.Data[i].UnitBreak.toString(),
                        })
                    }
                }
            }
        }
        })
    }
    getCutList(){
        dal.getCutList(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.termId,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
            console.log(resp)
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                for(let i=1;i<=resp.Data.length;i++){
                    if(i==1){
                        this.setState({
                            ['cutL'+i]:resp.Data[i-1].CutAmt.toString(),
                            isCut:resp.Data[i-1].Cut
                        },()=>{
                            that.setState({
                                CommonD:!resp.Data[i-1].Cut?that.state.break:that.state.break&&that.state.cutL1!=''?
                                (parseInt(that.state.break)-parseInt(that.state.cutL1)).toString()
                                :parseInt(that.state.break)&&that.state.cutL1==''?
                                parseInt(that.state.break).toString():
                                '',
                            })
                        })
                    }
                    this.setState({
                        ['cutL'+i]:resp.Data[i-1].CutAmt.toString(),
                        ['cutR'+(i-1)]:resp.Data[i-1].UnitBreak.toString(),
                    })
                }
            }
        }
        })
    }
    APITermDetailByDate(){
        dal.APITermDetailByDate(this.props.navigation.state.params.endpoint,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
            if(resp&&resp.Status=='OK'&&resp.Data.length){
                let i=resp.Data.findIndex(x => x.TermDetailID==this.props.navigation.state.params.termId);
                if(i!==-1){
                    this.setState({
                        break: resp.Data[i].UnitBreak?resp.Data[i].UnitBreak.toString():'',
                        CommonD:resp.Data[i].UnitBreak&&this.state.cutL1!=''?
                        (resp.Data[i].UnitBreak-parseInt(this.state.cutL1)).toString()
                        :resp.Data[i].UnitBreak&&this.state.cutL1==''?
                        resp.Data[i].UnitBreak.toString():
                        '',
                        loading:false,
                    })
                }else{
                    this.setState({
                        break:'',
                        loading:false
                    })
                }
                
            }else{
                Alert.alert(config.AppName,resp.Status)
                this.setState({
                    break:'',
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
    getRemainD(){
        const d2=this.state.D2==''?0:parseInt(this.state.D2)
        const d3=this.state.D3==''?0:parseInt(this.state.D3)
        const d4=this.state.D4==''?0:parseInt(this.state.D4)
        const d5=this.state.D5==''?0:parseInt(this.state.D5)
        const d6=this.state.D6==''?0:parseInt(this.state.D6)
        const d7=this.state.D7==''?0:parseInt(this.state.D7)
        const d8=this.state.D8==''?0:parseInt(this.state.D8)
        const d9=this.state.D9==''?0:parseInt(this.state.D9)
        const d10=this.state.D10==''?0:parseInt(this.state.D10)
        return (this.state.CommonD-(d2+d3+d4+d5+d6+d7+d8+d9+d10))
    }
    manageDivide(){
        const d2=this.state.D2==''?0:parseInt(this.state.D2)
        const d3=this.state.D3==''?0:parseInt(this.state.D3)
        const d4=this.state.D4==''?0:parseInt(this.state.D4)
        const d5=this.state.D5==''?0:parseInt(this.state.D5)
        const d6=this.state.D6==''?0:parseInt(this.state.D6)
        const d7=this.state.D7==''?0:parseInt(this.state.D7)
        const d8=this.state.D8==''?0:parseInt(this.state.D8)
        const d9=this.state.D9==''?0:parseInt(this.state.D9)
        const d10=this.state.D10==''?0:parseInt(this.state.D10)
        this.setState({
            D1:(this.state.CommonD-(d2+d3+d4+d5+d6+d7+d8+d9+d10)).toString()
        })
    }
    saveDivide(){
        let temp=[]
        for(let i=0;i<10;i++){
            temp.push(
                {
                    TermDetailID:this.props.navigation.state.params.termId,
                    DivideLedger:this.state.isDivide,
                    UnitBreak:this.state['D'+(i+1)],
                }
            )
        }
        dal.saveDivide(this.props.navigation.state.params.endpoint,temp,(err,resp)=>{
            if(err){
                this.setState({loading:false})
                Alert.alert(config.AppName,'Something went wrong!')
            }else{
                if(resp=='OK'){
                    this.props.navigation.goBack()
                }else{
                    this.setState({loading:false})
                    Alert.alert(config.AppName,'Error in Saving!')
                }
            }
        })
    }
    renderButtons(){
        return(
            <View style={{
                flexDirection:'row',
                marginVertical:5,
                alignItems:'center',
                justifyContent:'space-evenly',
                marginHorizontal:10,
                marginTop:10
            }}>
                <TouchableOpacity 
                    style={{
                        paddingVertical:10,
                        paddingHorizontal:15,
                        backgroundColor:Color.PRIMARYCOLOR,
                        borderRadius:5,
                        height:height*0.06,
                        flex:1,
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent:'center',
                        marginRight:5
                    }} 
                    onPress={()=>{
                        AsyncStorage.setItem('round',this.state.round)
                        this.setState({loading:true})
                        let temp=[]
                        for(let i=0;i<5;i++){
                            temp.push(
                                {
                                    CutTermDetailID:this.props.navigation.state.params.termId,
                                    Cut:this.state.isCut,
                                    LinearCut:this.state.isLcut,
                                    Round:this.state.round,
                                    LeaveDigit:false,
                                    CutAmt:this.state['cutL'+(i+1)],
                                    Description:'',
                                    UnitBreak:i==0?this.state.break:this.state['cutR'+i],
                                }
                            )
                        }
                        dal.saveCut(this.props.navigation.state.params.endpoint,temp,(err,resp)=>{
                            if(err){
                                this.setState({loading:false})
                                Alert.alert(config.AppName,'Something went wrong!')
                            }else{
                                if(resp=='OK'){
                                    this.saveDivide()
                                }else{
                                    this.setState({loading:false})
                                    Alert.alert(config.AppName,'Error in Saving!')
                                }
                            }
                        })
                    }}>
                    <Text style={{color:'#fff',fontSize:18,marginLeft:5,fontFamily:'Roboto-Bold'}}>
                        OK
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{
                        paddingVertical:10,
                        paddingHorizontal:15,
                        backgroundColor:Color.PRIMARYCOLOR,
                        borderRadius:5,
                        flex:1,
                        height:height*0.06,
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent:'center'
                    }} 
                    onPress={()=>{
                        this.props.navigation.goBack()
                    }}>
                    <Text style={{color:'#fff',fontSize:18,marginLeft:5,fontFamily:'Roboto-Bold'}}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    renderDivide(){
        return(
            <View style={{flexDirection:'row'}}>
                <View style={{
                    flex:1
                }}>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        backgroundColor:'#DCDCDC80',
                        height:height*0.06,
                        marginHorizontal:5,
                        borderRadius:5,
                        justifyContent:'center',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D1}
                            editable={false}
                        />
                    </View>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        marginHorizontal:5,
                        borderRadius:5,
                        justifyContent:'center',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D2}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D2:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D2:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                            }}
                        />
                    </View>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        marginHorizontal:5,
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        borderRadius:5,
                        justifyContent:'center',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D3}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D3:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D3:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                                
                            }}
                        />
                    </View>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        marginHorizontal:5,
                        borderRadius:5,
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        justifyContent:'center',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D4}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D4:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D4:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                            }}
                        />
                    </View>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        marginHorizontal:5,
                        borderRadius:5,
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        justifyContent:'center',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D5}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D5:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D5:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                            }}
                        />
                    </View>
                </View>
                <TouchableOpacity style={{
                    borderRadius:5,
                    backgroundColor:Color.PRIMARYCOLOR,
                    height:height*0.05,
                    width:height*0.05,
                    alignItems:'center',
                    justifyContent:'center',
                    marginTop:height*0.005,
                }} onPress={()=>{
                    this.setState({
                        showDivide:!this.state.showDivide
                    })
                }}>
                    <Image source={plusIcon} style={{width:20,height:20,tintColor:'white'}}/>
                </TouchableOpacity>
                {this.state.showDivide?
                <View style={{
                    flex:1,
                    alignItems:'flex-end'
                }}>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        marginHorizontal:5,
                        borderRadius:5,
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        justifyContent:'center',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D6}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D6:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D6:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                            }}
                        />
                    </View>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        marginHorizontal:5,
                        borderRadius:5,
                        justifyContent:'center',
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D7}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D7:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D7:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                            }}
                        />
                    </View>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        marginHorizontal:5,
                        borderRadius:5,
                        justifyContent:'center',
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D8}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D8:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D8:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                            }}
                        />
                    </View>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        marginHorizontal:5,
                        borderRadius:5,
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        justifyContent:'center',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D9}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D9:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D9:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                            }}
                        />
                    </View>
                    <View style={{
                        width:width*0.4,
                        flexDirection:'row',
                        borderWidth:1,
                        borderColor:Color.DARKPRIMARYTEXTCOLOR,
                        height:height*0.06,
                        marginHorizontal:5,
                        borderRadius:5,
                        justifyContent:'center',
                        backgroundColor:!this.state.isDivide?'#DCDCDC80':'transparent',
                        marginTop:3
                    }}>
                        <TextInput
                            style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                            keyboardType='decimal-pad'
                            underlineColorAndroid='transparent'
                            value={this.state.D10}
                            editable={this.state.isDivide?true:false}
                            onChangeText={(text)=>{
                                this.setState({
                                    D10:text
                                },()=>{
                                    if(this.getRemainD()>0){
                                        this.manageDivide()
                                    }else{
                                        this.setState({
                                            D10:''
                                        },()=>{
                                            this.manageDivide()
                                        })
                                    }
                                    
                                })
                            }}
                        />
                    </View>
                    
                </View>:
                <View style={{flex:1}}/>
                }
            </View> 
        )
    }
    render() {
        return (
        <View style={styles.container}>

            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:5,
            }}>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginHorizontal:5,
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({
                        isCut:!this.state.isCut,
                        CommonD:this.state.isCut?parseInt(this.state.break):(parseInt(this.state.break)-parseInt(this.state.cutL1))
                    },()=>{
                        this.manageDivide()
                    })
                }}>
                    <Image source={this.state.isCut?tickIcon:untickIcon} style={{width:25,height:25}}/>
                    <Text style={{fontSize:16,marginLeft:5,fontFamily:'Roboto-Bold'}}>
                        Cut
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginHorizontal:5,
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({
                        isLcut:!this.state.isLcut
                    })
                }}>
                    <Image source={this.state.isLcut?tickIcon:untickIcon} style={{width:25,height:25}}/>
                    <Text style={{fontSize:16,marginLeft:5,fontFamily:'Roboto-Bold'}}>
                        Linear Cut
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{width:(width*0.4)-50,backgroundColor:Color.PRIMARYCOLOR,
                    alignItems:'center',justifyContent:'center',borderRadius:5,height:30,marginLeft:10}}
                    onPress={async()=>{
                        const round=await AsyncStorage.getItem('round')||'0'
                        this.setState({
                            loading:true,
                            isCut:false,
                            isLcut:false,
                            break:'',
                            cutL1:'0',
                            cutL2:'0',
                            cutL3:'0',
                            cutL4:'0',
                            cutL5:'0',
                            cutR1:'0',
                            cutR2:'0',
                            cutR3:'0',
                            cutR4:'0',
                            isDivide:false,
                            round:round,
                            D1:'0',
                            D2:'0',
                            D3:'0',
                            D4:'0',
                            D5:'0',
                            D6:'0',
                            D7:'0',
                            D8:'0',
                            D9:'0',
                            D10:'0',
                            showDivide:false,
                            CommonD:'0'
                        },()=>{
                            this.APITermDetailByDate()
                            // this.getCutList()
                            // this.getDivideList()
                            setTimeout(() => {
                                that.manageDivide()
                            }, 2000);
                        })
                    }}>
                    <Text>
                        Refresh
                    </Text>
                </TouchableOpacity>
            </View>


            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:5
            }}>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginHorizontal:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutL1}
                        onChangeText={(text)=>{
                            if(text<=parseInt(this.state.break)){
                                this.setState({
                                    cutL1:(text),
                                    CommonD:text!=''?(parseInt(this.state.break)-parseInt(text)).toString():this.state.break
                                },()=>{
                                    this.manageDivide()
                                })
                            }
                        }}
                    />
                </View>
                <Text style={{marginHorizontal:5}}>
                    if unit=
                </Text>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    backgroundColor:'#DCDCDC80',
                    height:height*0.06,
                    marginRight:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.break}
                        editable={false}
                    />
                </View>
            </View>
            

            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:5
            }}>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginHorizontal:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutL2}
                        onChangeText={(text)=>{
                            if(text<=parseInt(this.state.cutL1)){
                                this.setState({
                                    cutL2:text
                                })
                            }
                        }}
                    />
                </View>
                <Text style={{marginHorizontal:5}}>
                    if unit>=
                </Text>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginRight:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutR1}
                        onChangeText={(text)=>{
                            if(text<parseInt(this.state.break)){
                                this.setState({
                                    cutR1:text
                                })
                            }
                            
                        }}
                    />
                </View>
            </View>
            
            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:5
            }}>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginHorizontal:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutL3}
                        onChangeText={(text)=>{
                            if(text<=parseInt(this.state.cutL1)){
                                this.setState({
                                    cutL3:text
                                })
                            }
                            
                        }}
                    />
                </View>
                <Text style={{marginHorizontal:5}}>
                    if unit>=
                </Text>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginRight:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutR2}
                        onChangeText={(text)=>{
                            if(text<parseInt(this.state.break)){
                                this.setState({
                                    cutR2:text
                                })
                            }
                            
                        }}
                    />
                </View>
            </View>

            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:5
            }}>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginHorizontal:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutL4}
                        onChangeText={(text)=>{
                            if(text<=parseInt(this.state.cutL1)){
                                this.setState({
                                    cutL4:text
                                })
                            }
                            
                        }}
                    />
                </View>
                <Text style={{marginHorizontal:5}}>
                    if unit>=
                </Text>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginRight:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutR3}
                        onChangeText={(text)=>{
                            if(text<parseInt(this.state.break)){
                                this.setState({
                                    cutR3:text
                                })
                            }
                           
                        }}
                    />
                </View>
            </View>

            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:5
            }}>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginHorizontal:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutL5}
                        onChangeText={(text)=>{
                            if(text<=parseInt(this.state.cutL1)){
                                this.setState({
                                    cutL5:text
                                })
                            }
                            
                        }}
                    />
                </View>
                <Text style={{marginHorizontal:5}}>
                    if unit>=
                </Text>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginRight:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.cutR4}
                        onChangeText={(text)=>{
                            if(text<parseInt(this.state.break)){
                                this.setState({
                                    cutR4:text
                                })
                            }
                        }}
                    />
                </View>
            </View>



            <View style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:5
            }}>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginHorizontal:5,
                    justifyContent:'center'
                }} onPress={()=>{
                    this.setState({
                        isDivide:!this.state.isDivide
                    })
                }}>
                    <Image source={this.state.isDivide?tickIcon:untickIcon} style={{width:25,height:25}}/>
                    <Text style={{fontSize:16,marginLeft:5,fontFamily:'Roboto-Bold'}}>
                        Divide
                    </Text>
                </TouchableOpacity>
                <Text style={{marginLeft:15,fontSize:16,fontFamily:'Roboto-Bold',marginRight:10}}>
                    Round
                </Text>
                <View style={{
                    flex:1,
                    flexDirection:'row',
                    borderWidth:1,
                    borderColor:Color.DARKPRIMARYTEXTCOLOR,
                    height:height*0.06,
                    marginRight:5,
                    borderRadius:5,
                    justifyContent:'center'
                }}>
                    <TextInput
                        style={[styles.input,{marginHorizontal:0,height:height*0.06,fontSize:15}]}
                        keyboardType='decimal-pad'
                        underlineColorAndroid='transparent'
                        value={this.state.round}
                        onChangeText={(text)=>{
                            this.setState({
                                round:text
                            })
                        }}
                    />
                </View>
            </View>
            {this.renderDivide()}
            {this.renderButtons()}
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