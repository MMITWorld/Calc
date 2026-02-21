/**
 * Sample React Native App
 * https:   //github.com/facebook/react-native
 * @flow
 */

 import React, { Component } from 'react';
 import {
   Text,
   StyleSheet,
   View,
   Image,
   TextInput,
   Dimensions,
   ScrollView,
   TouchableOpacity,
   Button,
   Alert,
   AsyncStorage,
   ActivityIndicator,
   Picker,
 } from 'react-native';
 import dal from '../dal.js';
 import config from '../config/config'
 import back from "../assets/images/backward.png";
 import Color from '../utils/Color'
 import { NavigationActions } from 'react-navigation';
 var   dWidth   = Dimensions.get("window").width;
 var   dHeight  = Dimensions.get("window").height;
 var numeral = require('numeral');
 class MoneyInOut extends Component {
 constructor(props) {
         super(props);
         this.state = {
           loading:true,
           lg:'uni',
           amount:'',
           note:'',
           phno:'',
           users:[],
           user:{
                UserID:'All',
                UserNo:'All',
                discount2D:0,
                discount3D:0
            },
            remainAmt:0,
            aremainAmt:0,
            agents:[],
            agent:{
                AgentID:'All',
                AgentName:'All',
            }
         }
     }
  
     async componentDidMount() {
       const lg=await AsyncStorage.getItem('lg')||'uni'
       this.setState({
         lg:lg,
       })
       this.getAgents()
     }
     getAgentRemainAmt(){
      dal.getRemainAmt(this.props.navigation.state.params.endpoint,this.state.agent?.AgentID,(err,resp)=>{
          if(err){
            Alert.alert(config.AppName,'Error in getting remaining amount!')
            this.setState({
              aremainAmt:0,
              loading:false
              })
          }else{
              console.log(resp)
            if(resp||resp==0){
              this.setState({
                  aremainAmt:resp,
                  loading:false
              })
            }else{
              Alert.alert(config.AppName,'Error in getting remaining amount!')
              this.setState({
                  aremainAmt:0,
                  loading:false
              })
            }
          }
      })
   }
     getRemainAmt(){
        dal.getRemainAmt(this.props.navigation.state.params.endpoint,this.state.user?.UserID,(err,resp)=>{
            if(err){
              Alert.alert(config.AppName,'Error in getting remaining amount!')
              this.setState({
                remainAmt:0,
                loading:false
                })
            }else{
              if(resp||resp==0){
                this.setState({
                    remainAmt:resp,
                    loading:false
                })
              }else{
                Alert.alert(config.AppName,'Error in getting remaining amount!')
                this.setState({
                    remainAmt:0,
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
     getUsers(){
        dal.getAllUsersByAgent(this.props.navigation.state.params.endpoint,this.state.agent.AgentID,(err,resp)=>{
        if(err){
            this.setState({
                loading:false
            })
        }else{
          console.log(resp)
            if(resp&&resp.Status=='OK'&&resp.Data.length>0){
                let temp=resp.Data
                this.setState({
                    users:temp,
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
    renderUsers(){
        return this.state.users.map((value,index)=>{
          return(
            <Picker.Item label={value.UserNo} value={value.UserID} key={index} />
          )
        })
    }
     componentWillUnmount() {
     }
     renderHeader(){
       return(
         <View style={[styles.header,{backgroundColor:Color.Green}]}>
               <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} 
                 onPress={()=>{this.props.navigation.goBack()}}>
                 <Image source={back} style={{width:30,height:30,resizeMode:"contain",marginHorizontal:10,tintColor:'#fff'}}/>
               </TouchableOpacity>
               <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                   <Text style={{color:'#fff',fontSize:16,fontWeight:'bold'}}>
                       {this.props.navigation.state.params.in?`${this.state.lg=='uni'?'ငွေသွင်းမည်':'ေငြသြင္းမည္'}`:`${this.state.lg=='uni'?'ငွေထုတ်မည်':'ေငြထုတ္မည္'}`}
                   </Text>
               </View>
           </View>
       )
     }
     getDate(date){
        var mm = date.getMonth() + 1; // getMonth() is zero-based
        var dd = date.getDate();

        return [date.getFullYear(),
                (mm>9 ? '' : '0') + mm,
                (dd>9 ? '' : '0') + dd
                ].join('');
     }
   render() {
     if(this.state.loading){
       return(
         <View 
         style={{
           position:'absolute',
           left:0,
           right:0,
           top:0,
           bottom:0,
           alignItems:'center',
           justifyContent:'center',
           backgroundColor:'transparent'
         }}>
           <ActivityIndicator size={70} color={Color.Green}/>
         </View>
       )
     }else{
       return (
         <ScrollView style={styles.container}
         keyboardShouldPersistTaps='always'
         >
           <View >
             {this.renderHeader()}
             <View style={{height:50,flex:1,marginHorizontal:16,borderWidth:1,borderColor:'black',marginTop:10,borderRadius:5}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.agent?.AgentID}
                        style={{flex:1,height:50}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.agents.findIndex(x => x.AgentID==itemValue);
                            if(i!==-1){
                                this.setState({
                                    agent:this.state.agents[i],
                                    loading:true
                                },()=>{
                                    //this.getAgentRemainAmt()
                                    this.getUsers()
                                })
                            }else{
                                this.setState({
                                    agent:{
                                        AgentID:'All',
                                        AgentName:'All',
                                    },
                                    //aremainAmt:0
                                })
                            }
                            
                        }}>
                        <Picker.Item label={'All'} value={'All'}/>
                        {this.renderAgents()}
                    </Picker>
            </View>
             {/* <View style={[styles.inputWrap,{marginHorizontal:16,marginBottom:30,marginTop:10}]}>
                        <TextInput
                            style                 = {styles.input}
                            placeholderTextColor  = "#000"
                            value={`${this.state.lg=='uni'?'ကိုယ်စားလှယ်လက်ကျန်ငွေ':'ကိုယ္စားလွယ္လက္က်န္ေငြ'} = ${numeral(this.state.aremainAmt).format('0,0')} ${this.state.lg=='uni'?'ကျပ်':'က်ပ္'}`}
                            underlineColorAndroid = "transparent"
                            editable={false}

                        />
                    </View> */}
             <View style={{height:50,flex:1,marginHorizontal:16,borderWidth:1,borderColor:'black',marginTop:10,borderRadius:5}}>
                    <Picker
                        mode='dropdown'
                        selectedValue={this.state.user?.UserID}
                        style={{flex:1,height:50}}
                        onValueChange={(itemValue, itemIndex) =>{
                            let i=this.state.users.findIndex(x => x.UserID==itemValue);
                            if(i!==-1){
                                this.setState({
                                    user:this.state.users[i],
                                    loading:true
                                },()=>{
                                    this.getRemainAmt()
                                })
                            }else{
                                this.setState({
                                    user:{
                                        UserID:'All',
                                        UserNo:'All',
                                        discount2D:0,
                                        discount3D:0
                                    },
                                    remainAmt:0
                                })
                            }
                            
                        }}>
                        <Picker.Item label={'All'} value={'All'}/>
                        {this.renderUsers()}
                    </Picker>
                </View>
                
                <View style={[styles.inputWrap,{marginHorizontal:16}]}>
                        <TextInput
                            style                 = {styles.input}
                            placeholderTextColor  = "#000"
                            value={`${this.state.lg=='uni'?'လက်ကျန်ငွေ':'လက္က်န္ေငြ'} = ${numeral(this.state.remainAmt).format('0,0')} ${this.state.lg=='uni'?'ကျပ်':'က်ပ္'}`}
                            underlineColorAndroid = "transparent"
                            editable={false}

                        />
                    </View>
                  <View style={{paddingHorizontal: 16,marginBottom:40}}>
                    <View style={styles.inputWrap}>
                    <TextInput
                            placeholder = {this.state.lg=='uni'?"ငွေ":"ေငြ"}
                            style                 = {styles.input}
                            placeholderTextColor  = "#000"
                            value={this.state.amount}
                            keyboardType='decimal-pad'
                            underlineColorAndroid = "transparent"
                            onChangeText          = {(text)=>this.setState({amount:text})}
                    />
                    </View>
                    <View style={styles.inputWrap}>
                    <TextInput
                        placeholder = {this.state.lg=='uni'?"မှတ်ချက်":"မွတ္ခ်က္"}
                        style                 = {styles.input}
                        placeholderTextColor  = "#000"
                        value={this.state.note}
                        underlineColorAndroid = "transparent"
                        onChangeText          = {(text)=>this.setState({note:text})}
                    />
                    </View>
                </View>
             
             <View style={{flex:1,justifyContent:'flex-end'}}>
                   <TouchableOpacity onPress={()=>{
                       if(this.state.user.UserID=='All'||this.state.agent.AgentID=='All'||this.state.amount<=0){
                        Alert.alert(config.AppName,'Please fill all information!')
                        return;
                      }
                    //   if((this.props.navigation.state.params.in&&this.state.amount>this.state.aremainAmt)
                    //     ){
                    //     Alert.alert(config.AppName,'Invalid Amount!')
                    //     return;
                    //   }
                      if((!this.props.navigation.state.params.in&&this.state.amount>this.state.remainAmt)
                      ){
                      Alert.alert(config.AppName,'Invalid Amount!')
                      return;
                    }
                         this.setState({loading:true})
                         let date=new Date()
                         let i =this.state.users.findIndex(x=>x.UserNo==this.state.agent.AgentName)
                         
                         let data={
                            MInOutID:'InOut',
                            AgentID:this.state.agent.AgentID,
                            AgentUserID:this.state.users[i].UserID,
                            AgentUserName:this.state.users[i].UserNo,
                            UserID:this.state.user.UserID,
                            UserName:this.state.user.UserNo,
                            MachineName:this.props.navigation.state.params.user[0].UserNo,
                            CreatedUserID:this.props.navigation.state.params.user[0].UserID,
                            CreatedUserName:this.props.navigation.state.params.user[0].UserNo,
                            CreatedDate:new Date(),
                            MoneyIn:this.props.navigation.state.params.in?Number(this.state.amount):0,
                            MoneyOut:!this.props.navigation.state.params.in?Number(this.state.amount):0,
                            Type:this.props.navigation.state.params.in?'Deposit':"Withdraw",
                            PaymentType:this.state.user.UserNo==this.state.agent.AgentName?'Agent':'Cash',
                            SrNo:this.state.accountNo,
                            Status:'Confirm',
                            Remark:this.state.note,
                            TermDetailID:'InOut',
                            TermDetailName:this.getDate(date),
                            SaleID:'InOut',
                            PhoneNo:this.state.phno
                         }
                         console.log(data)
                         dal.saveMoneyInOut(this.props.navigation.state.params.endpoint,
                            this.state.user.UserNo==this.state.agent.AgentName?false:true
                            ,data,(err,resp)=>{
                             if(err){
                                this.setState({loading:false})
                                Alert.alert(config.AppName,'Error in saving!')
                             }else{
                                this.setState({loading:false})
                                console.log(resp)
                                if(resp=='OK'){
                                    this.setState({
                                        loading:false,
                                        accountNo:'',
                                        amount:'',
                                        note:'',
                                        phno:'',
                                    })
                                    this.getRemainAmt()
                                    Alert.alert(config.AppName,this.state.lg=='uni'?'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။\nစစ်ဆေးရန် မိနစ်အနည်းငယ်စောင့်ဆိုင်းပေးပါ'
                                    :"လုပ္ေဆာင္မႈ ေအာင္ျမင္ပါသည္။\nစစ္ေဆးရန္ မိနစ္အနည္းငယ္ေစာင့္ဆိုင္းေပးပါ")
                                }else{
                                    Alert.alert(config.AppName,resp)
                                }
                             }
                         })
                       
                     }} style={{flex:1,backgroundColor: Color.darkGreen,marginHorizontal:20,
                     alignItems     : "center",
                     justifyContent : "center",padding:10,borderRadius:5,marginTop:10}}>
                       <Text style={styles.buttonText}>
                            SAVE
                       </Text>
                   </TouchableOpacity>
                 </View>
             </View>
         </ScrollView>
       );
     }
     
   }
 }
 
 const styles = StyleSheet.create({
 container: {
   flex           : 1,
   backgroundColor: Color.defaultBackground,
 },
 header:{
   height:56,
   width:null,
   alignItems: 'center',
   flexDirection: 'row',
 },
 contactText:{
   marginVertical: 5,
   color         : "#000",
   fontSize      : 12,
   fontWeight    : "bold"
 },
 nameText:{
   marginHorizontal: 20,
   marginVertical  : 30,
   color           : Color.yellow,
   fontSize        : 22,
   fontWeight      : "bold"
 },
 rowView:{
   marginHorizontal: 20,
   flexDirection   : "row",
   justifyContent  : "center",
   alignItems      : "center"
 },
 labelText:{
   color   : '#000',
   fontSize: 20,
   marginRight: 10,
   fontWeight:'bold'
 },
 rearView:{
   flex          : 1,
   flexDirection : "row",
   alignItems    : "flex-end",
   justifyContent: "flex-end"
 },
 line:{
   width           : dWidth-40,
   backgroundColor : "#ffffff80",
   height          : 1,
   marginHorizontal: 20,
   marginVertical  : 10
 },
 next:{
   width : 30,
   height: 25
 },
 loading: {
   position       : 'absolute',
   left           : 0,
   right          : 0,
   top            : 0,
   bottom         : 0,
   alignItems     : 'center',
   justifyContent : 'center',
   backgroundColor: "#464646"
 },
 contactView:{
   flex          : 1,
   alignItems    : "center",
   justifyContent: "flex-end",
   marginBottom  : 10
 },
 inputWrap:{
   flexDirection  : "row",
   marginTop : 10,
   height         : 50,
   backgroundColor: "transparent",
   borderRadius:5,
   borderWidth: 1,
   borderColor: 'gray',
 },
 input:{
   flex             : 1,
   paddingHorizontal: 10,
   backgroundColor  : "transparent",
   color            : "#000",
   fontSize         : 14
 },
 regbutton:{
   backgroundColor: "#64DD17",
   paddingVertical: 8,
   marginVertical : 20,
   borderRadius   : 7,
   alignItems     : "center",
   justifyContent : "center",
 },
 buttonText:{
   color   : "#FFF",
   fontSize: 16,
 },
 });
 export default MoneyInOut;
 