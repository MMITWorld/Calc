import React,{Component} from "react";
import { 
    View,
    ActivityIndicator
} from "react-native";
import Color from '../utils/Color.js'
class Loading extends Component {
  render() {
    if(!this.props.show){
        return null
    }
    return (
      <View style={{
        position:'absolute',
        top:0,
        bottom:0,
        left:0,
        right:0,
        alignItems:'center',
        justifyContent:'center',
        elevation: 90,
      }}>
        <View style={{backgroundColor:Color.ORANGE,padding:15,borderRadius:10}}>
          <ActivityIndicator
            size={'large'} color={'#fff'} 
          />
        </View>
      </View>
    );
  }
}
export default Loading