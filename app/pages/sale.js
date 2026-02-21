import React from "react";
import { 
  StatusBar ,
  ViewPagerAndroid,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import Color from '../utils/Color.js'
import dal from '../dal.js'
import config from '../config/config.js'
import ic_2d from "../assets/images/ic_two_d.png";
import ic_3d from "../assets/images/ic_three_d.png";
import logo from "../assets/images/backward.png";
const {width,height}  = Dimensions.get("window");
import EStyleSheet from 'react-native-extended-stylesheet';
EStyleSheet.build({$rem: width / 380});
export default class Setup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      loading:true,
      terms:[]
    };
  }
  componentDidMount(){
    dal.getTodayTerm(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.user[0].UserID,(err,result)=>{
      this.setState({loading:false})
      if(err){
        console.warn(err)
        return;
      }
      if(result.Status=='OK'){
        this.setState({terms:result.Data})
      }else{
        Alert.alert(config.AppName,result.Status)
      }
    })
    // console.log(this.props.navigation.state.params.use)
    // dal.sendRequest((result) => {
    //   if(result){
    //     //access internet
    //     dal.getTodayTerm(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.user[0].UserID,(err,result)=>{
    //       this.setState({loading:false})
    //       if(err){
    //         console.warn(err)
    //         return;
    //       }
    //       if(result.Status=='OK'){
    //         this.setState({terms:result.Data})
    //       }else{
    //         Alert.alert(config.AppName,result.Status)
    //       }
    //     })
    //   }else{
    //     //no access internet
    //     this.setState({loading:false})
    //     Alert.alert(config.AppName,'အင်တာနက်မရှိပါ')
    //   }
    // })
  }
  renderTerms(){
    return this.state.terms.map((value,index)=>{
      return(
        <TouchableOpacity style={{width:width-20,height:height*0.1,marginHorizontal:10
          ,borderRadius:5,backgroundColor:Color.defaultGray,marginVertical:5,flexDirection:'row',justifyContent:'center',alignItems:'center'}}
          onPress={()=>{
            if(value.LottType=='3D'){
              this.props.navigation.navigate('Sale3D',
              {
                title:value.Name,
                user:this.props.navigation.state.params.user,
                termdetailsid:value.TermDetailID,
                unitPrice:value.UnitPrice,
                endpoint:this.props.navigation.state.params.endpoint,
                lg:this.props.navigation.state.params.lg,
                LottType:value.LottType,
                termId:value.TermID,
              })
            }else  if(value.LottType=='4D'){
              this.props.navigation.navigate('Sale4D',
              {
                title:value.Name,
                user:this.props.navigation.state.params.user,
                termdetailsid:value.TermDetailID,
                unitPrice:value.UnitPrice,
                endpoint:this.props.navigation.state.params.endpoint,
                lg:this.props.navigation.state.params.lg,
                LottType:value.LottType,
                termId:value.TermID,
              })
            }
            else{
              this.props.navigation.navigate('Sale2D',
              {
                title:value.Name,
                user:this.props.navigation.state.params.user,
                termdetailsid:value.TermDetailID,
                unitPrice:value.UnitPrice,
                endpoint:this.props.navigation.state.params.endpoint,
                lg:this.props.navigation.state.params.lg,
                LottType:value.LottType,
                termId:value.TermID,
              })
            }
          }}>
          <Image source={value.LottType=='3D'?ic_3d:ic_2d} style={{width:height*0.05,height:height*0.05,resizeMode:'contain',backgroundColor:'#fff',marginLeft:10}}/>
          <View style={{flex:1,justifyContent:'center',alignItems: 'center',}}>
              <Text style={estyles.title}>{value.Name}</Text>
          </View>
        </TouchableOpacity>
      )
    })
  }
  renderHeader(){
    return(
      <View style={[styles.header,{backgroundColor:Color.PRIMARYCOLOR}]}>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} 
              onPress={()=>{this.props.navigation.goBack()}}>
              <Image source={logo} style={{width:30,height:30,resizeMode:"contain",marginHorizontal:10,tintColor:'#fff'}}/>
            </TouchableOpacity>
            <View style={{flex:1}}>
                <Text style={{ color:'#fff', fontSize:12, marginLeft:5 }}>
                  {config.AppName || 'App'}
                </Text>
                <Text style={estyles.headerText}>Today File</Text>
            </View>
        </View>
    )
  }
  getLoading(){
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
      return(null)
    }
  }
  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <ScrollView contentContainerStyle={{marginVertical:15}}>
          {this.renderTerms()}
        </ScrollView>
        {this.getLoading()}
      </View>
    );
  }
}
const estyles = EStyleSheet.create({
  headerText:{
    fontSize:'18rem',color:'#fff'
  },
  title:{
    color:'#000',fontSize:'16rem'
},
});
const styles = StyleSheet.create({
  container: {
    flex           : 1,
    backgroundColor:Color.defaultBackground,
  },
  header:{
    height:height*0.08,
    width:null,
    alignItems: 'center',
    flexDirection: 'row',
  },
});
