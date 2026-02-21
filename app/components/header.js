import React,{Component} from "react";
import { 
    View,
    Text ,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform
} from "react-native";
import menu from '../assets/images/menu.png'
import Color from '../utils/Color.js'
const {width,height}=Dimensions.get('window')
class Home extends Component {
  render() {
    const ios_style={
      padding: 5,
      shadowColor: '#000000',
      shadowOpacity: 0.3,
      shadowRadius: 3,
      shadowOffset: 3,
  }
  const android_style={
      padding: 5,
      shadowColor: '#000000',
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
  }
    return (
      <View style={[{ height:58,flexDirection:'row',width:width,alignItems:'center',backgroundColor:Color.PRIMARYTEXTCOLOR},Platform.OS=='android'?android_style:ios_style]}>
        <TouchableOpacity onPress={()=>{
                this.props.navigation.openDrawer();
            }}>
            <Image source={menu} style={{width:25,height:25,marginLeft:10,tintColor:Color.PRIMARYCOLOR}}></Image>
        </TouchableOpacity>
        <Text style={{color:Color.PRIMARYCOLOR,fontWeight:'bold',fontSize:18,marginLeft:5}}>{this.props.title}</Text>
        <View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
          {this.props.headerRight}
        </View>
      </View>
    );
  }
}
export default Home