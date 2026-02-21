import React,{Component} from "react";
import { 
    View,
    ActivityIndicator,
    Dimensions,
    Text,
    Image
} from "react-native";
import Color from '../utils/Color.js'
const {width,height}=Dimensions.get('window')
import SuccessImg from '../assets/images/success.png'
import ErrorImg from '../assets/images/error.png'
import WarningImg from '../assets/images/warning.png'
import { TouchableOpacity } from "react-native-gesture-handler";
const Colors={
    success:{
        bgColor:'#d4f5d7',
        imgColor:'#25cf35',
        imgSrc:SuccessImg
    },
    error:{
        bgColor:'#f6ccd1',
        imgColor:'#d1001b',
        imgSrc:ErrorImg
    },
    warning:{
        bgColor:'#ffecb3',
        imgColor:'#ffab00',
        imgSrc:WarningImg
    },
    info:{
        bgColor:'#b39ddb',
        imgColor:'#4E37B2',
        imgSrc:WarningImg
    }
}
class SDWAlert extends Component {
    renderIcon(){
        return(
            <View style={{
                position:'absolute',
                padding:10,
                top:-30,
                left:(width*0.45)-30,
                alignItems:'center',
                justifyContent:'center',
                backgroundColor:Colors[this.props.type].bgColor,
                borderRadius:30
            }}>
                <Image source={Colors[this.props.type].imgSrc}
                    style={{
                        width:40,
                        height:40,
                        tintColor:Colors[this.props.type].imgColor
                    }}
                />
            </View>
        )
    }
    renderButtons(){
        return(
            <View style={{padding:10,marginTop:20,flexDirection:'row'}}>
                {
                    this.props.showCancel?
                    <TouchableOpacity
                        style={{
                            borderColor:Colors[this.props.type].imgColor,
                            borderWidth:2,
                            borderRadius:3,
                            alignItems:'center',
                            justifyContent:'center',
                            width:100,
                            height:35
                        }} onPress={()=>{
                            this.props.onClickCancel()
                        }}>
                        <Text style={{
                            color:'#262626',
                            fontSize:15,
                            fontFamily:'Roboto-Bold'
                        }}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    :
                    null
                }
                {!this.props.otherButton?
                <TouchableOpacity
                    style={{
                        backgroundColor:Colors[this.props.type].imgColor,
                        alignItems:'center',
                        justifyContent:'center',
                        width:100,
                        height:35,
                        marginLeft:10,
                        borderRadius:3,
                    }} onPress={()=>{
                        this.props.onClickOK()
                    }}>
                    <Text style={{
                        color:'#fff',
                        fontSize:15,
                        fontFamily:'Roboto-Bold'
                    }}>
                        OK
                    </Text>
                </TouchableOpacity>
                :
                <TouchableOpacity
                    style={{
                        backgroundColor:Colors[this.props.type].imgColor,
                        alignItems:'center',
                        justifyContent:'center',
                        width:100,
                        height:35,
                        marginLeft:10,
                        borderRadius:3,
                    }} onPress={()=>{
                        this.props.onClickOther()
                    }}
                >
                    <Text style={{
                        color:'#fff',
                        fontSize:15,
                        fontFamily:'Roboto-Bold'
                    }}>
                        {this.props.otherBtnTxt}
                    </Text>
                </TouchableOpacity>
                }
            </View>
        )
    }
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
            elevation: 5,
            backgroundColor:'#11030080'
        }}>
                <View style={{
                    width:width*0.9,
                    paddingVertical:10,
                    backgroundColor:'#fff',
                    borderRadius:5,
                    alignItems:'center',
                    justifyContent:'center',
                    marginBottom:30
                }}>
                    <View style={{
                        marginTop:30,
                        alignItems:'center',
                        justifyContent:'center',
                    }}>
                        <Text style={{
                            fontFamily:'Roboto-Bold',
                            fontSize:22,
                            color:Colors[this.props.type].imgColor
                        }}>
                            {this.props.title}
                        </Text>
                        <Text style={{
                            fontFamily:'Roboto',
                            fontSize:16,
                            marginTop:20,
                            textAlign:'center'
                        }}>
                            {this.props.msg}
                        </Text>
                        {this.renderButtons()}
                    </View>
                    {this.renderIcon()}
                </View> 
        </View>
        );
    }
}
export default SDWAlert