import React,{Component} from "react";
import { 
    View,
    Text,
    Animated,
    Image,
    Dimensions,
    StyleSheet,
    AsyncStorage
} from "react-native";
import logo from '../assets/images/logo.png'
let that;
const { width, height } = Dimensions.get("window");
class Splash extends Component {
    static navigationOptions = {
        header:null,
    }
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentDidMount(){
        that=this
        setTimeout(() => {
            that.props.navigation.navigate('AppNavigator');
        }, 1000);
    }
    // async componentDidMount(){
    //     that=this
    //     const info=await AsyncStorage.getItem('user')
    //     if(info){
    //         setTimeout(() => {
    //             that.props.navigation.navigate('Login');
    //         }, 1000);
    //     }else{
    //         setTimeout(() => {
    //             that.props.navigation.navigate('Login');
    //         }, 1000);
    //     }
    // }
    render() {
        return (
            <View style={styles.container}>
                <Image
                    source={logo}
                    style={[
                        {
                        width: width*0.3,
                        height: width*0.3
                        }
                    ]}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
      flex           : 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ring: {
      backgroundColor: "transparent",
      padding: 7
    },
    });
export default Splash;