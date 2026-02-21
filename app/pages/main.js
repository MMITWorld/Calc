import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  AsyncStorage,
  Linking
} from "react-native";
import Color from '../utils/Color.js'
import dal from '../dal.js'
import CardView from 'react-native-cardview'
import config from '../config/config.js'
const { width, height } = Dimensions.get("window");
import { CURRENT_VERSION } from './home.js';
import EStyleSheet from 'react-native-extended-stylesheet';
EStyleSheet.build({ $rem: width / 380 });
import {requestMultiple, PERMISSIONS} from 'react-native-permissions';
let _agents = []
const Rabbit = require("rabbit-node");
import TextMarquee from '../components/textmarquee.js'
export default class Setup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      agents: [],
      showModal: false,
      name: '',//939C53E8-90B4-4790-879B-AFBFBDD9F093 //TZT
      vInfo:null,
      lg:'uni'
    };
  }
  async componentDidMount() {
    const agent_list = await AsyncStorage.getItem('agent_list') || '[]'
    const lg=await AsyncStorage.getItem('lg')||'uni'
    const storedAppName = await AsyncStorage.getItem('AppName')
    if (storedAppName) {
      config.AppName = storedAppName
    }
    _agents = JSON.parse(agent_list)
    this.setState({
      agents: JSON.parse(agent_list),
      lg:lg
    },()=>{
      //this.requestPermission()
    })
    this.getVersionInfo()
  }
  requestPermission(){
    requestMultiple([PERMISSIONS.ANDROID.BLUETOOTH_CONNECT, 
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    ]).then((statuses) => {
      console.log('statuses ',statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT])
      if(statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]=='granted'&&
      statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN]=='granted'&&
      statuses[PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE]=='granted'&&
      statuses[PERMISSIONS.ANDROID.POST_NOTIFICATIONS]=='granted'){
        if(this.state.agents==0){
          this.setState({showModal:true})
        }
      }
      
    });
  }
  
  getAgentByAPPKEY(APPKEY) {
    dal.getAgent(APPKEY, (err, result) => {
      if (err) {
        Alert.alert('Error', 'Invalid AppKey!')
        this.setState({ loading: false, name: '' })
      } else {
        if (result.Status == 200 && result.Data.length > 0) {
            let tempObj=result.Data[0]
            tempObj.AdminKEY=APPKEY
            if (tempObj.AppName) {
              config.AppName = tempObj.AppName
              AsyncStorage.setItem('AppName', tempObj.AppName)
            }
          this.state.agents.push(tempObj)
          _agents = this.state.agents
          this.setState({ agents: this.state.agents, loading: false, name: '' })
          AsyncStorage.setItem('agent_list', JSON.stringify(this.state.agents))
        } else {
          this.setState({ loading: false, name: '' })
          Alert.alert('23 Go', result.Status)
        }
      }

    })
  }
  getVersionInfo() {
    // dal.getVersionInfo((err, result) => {
    //   if (err) {
    //     Alert.alert('Error', 'Something went wrong!')
    //     this.setState({ loading: false, vInfo:null })
    //   } else {
    //     this.setState({ vInfo: result, loading: false,})
    //   }

    // })
  }
  renderTerms() {
    console.log(this.state.agents)
    return this.state.agents.map((value, index) => {
      return (
        <CardView
          key={index}
          cardElevation={10}
          cardMaxElevation={10}
          cornerRadius={5}
          style={{
            backgroundColor:'#fff',
            width: width - 32, height: height * 0.1,
            marginBottom:10,marginLeft:16,
          }}
          >
          <TouchableOpacity style={{
            width: width - 32, height: height * 0.1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
          }}
            onPress={() => {
              if (value.AppName) {
                config.AppName = value.AppName
                AsyncStorage.setItem('AppName', value.AppName)
              }
              this.props.navigation.navigate('Login', {
                agent: value
              })
            }}
            onLongPress={() => {
              Alert.alert(value.AppName, 'Are you sure you want to remove?', [
                {
                  text: 'NO'
                }, {
                  text: 'YES',
                  onPress: () => {
                    _agents.splice(index, 1)
                    console.log(index)
                    AsyncStorage.setItem('agent_list', JSON.stringify(_agents))
                    this.setState({
                      agents: _agents
                    })
                  }
                }
              ])
            }}
          >

            <Image source={{ uri: value.AppLogoURL }} style={{ width: height*0.08, height: height*0.08,marginLeft:10,borderRadius:8 }} />
            <View style={{
              flex: 1,
              paddingLeft: 8
            }}>
              <Text style={{ color: Color.PRIMARYCOLOR, fontSize: 18 }}>
                {value.AppName}
              </Text>
            </View>
          </TouchableOpacity>
        </CardView>

      )
    })
  }
  renderHeader() {
    return (
      <View style={[styles.header, { backgroundColor: Color.PRIMARYCOLOR }]}>

        <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10 }}>
          <Text style={estyles.headerText}>Calculator</Text>
          <Text style={{ color:'#fff', fontSize:11 }}>
            {`V${CURRENT_VERSION}`}
          </Text>
        </View>
        <TouchableOpacity style={{ marginRight: 10, paddingHorizontal: 12, paddingVertical: 0, backgroundColor: 'white', borderRadius: 10, }}
          onPress={() => {
            this.setState({
              showModal: true
            })
          }}>
          <Text style={{ color: Color.PRIMARYCOLOR,fontSize:30}}>+</Text>
        </TouchableOpacity>
      </View>
    )
  }
  renderModal() {
    return (
      <Modal
        transparent={true}
        visible={this.state.showModal}
        animationType='slide'
        onRequestClose={() => {
          this.setState({
            showModal: false,
          })
        }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#11030085' }}>
          <View style={{ backgroundColor: '#fff', padding: 5, width: width - 32, borderRadius: 5 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: '#262626', marginVertical: 16, marginLeft: 10 }}>
              App Key
            </Text>
            <View style={styles.inputWrap}>
              <TextInput
                placeholder="Name"
                style={styles.input}
                placeholderTextColor="grey"
                underlineColorAndroid="transparent"
                tintColor="#262626"
                value={this.state.name}
                onChangeText={(text) => this.setState({ name: text })}
              />
            </View>
            <View style={{ flexDirection: 'row', marginVertical: 10 }}>
              <TouchableOpacity style={{
                flex: 1, alignItems: "center", justifyContent: 'center', backgroundColor: 'red', paddingVertical: 8
                , borderRadius: 7, marginHorizontal: 10
              }} onPress={() => {
                this.setState({
                  showModal: false,
                })
              }}>
                <Text style={{ fontSize: 16, fontFamily: 'Roboto', color: '#fff' }}>
                  CANCEL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                flex: 1, alignItems: "center", justifyContent: 'center', backgroundColor: Color.PRIMARYCOLOR, paddingVertical: 8
                , borderRadius: 7, marginHorizontal: 10
              }} onPress={() => {
                this.setState({
                  showModal: false,
                  loading: true
                }, () => {
                  this.getAgentByAPPKEY(this.state.name)
                })
              }}>
                <Text style={{ fontSize: 16, fontFamily: 'Roboto', color: '#fff' }}>
                  OK
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>
    )
  }
  getLoading() {
    if (this.state.loading) {
      return (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}>
          <ActivityIndicator size={70} color={Color.Green} />
        </View>
      )
    } else {
      return (null)
    }
  }
  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <ScrollView contentContainerStyle={{ paddingVertical: 10}}>
          {this.renderTerms()}
        </ScrollView>
        <View style={{marginBottom:10,paddingVertical:16,alignItems:'center',
        backgroundColor:Color.PRIMARYCOLOR
      
      }}>
            <TextMarquee
              style={{ fontSize: 20,color:'#fff'}}
              duration={20000}
              loop
              repeatSpacer={100}
              marqueeDelay={2000}
            >
              {this.state.lg=='uni'&&this.state.vInfo?Rabbit.zg2uni(this.state.vInfo?.Msg):this.state.vInfo?.Msg}
        </TextMarquee>
        {/* {
          this.state.vInfo&&this.state.vInfo.Version!=DeviceInfo.getVersion()?
          <TouchableOpacity style={{backgroundColor:'red',paddingVertical:8,justifyContent:'center',paddingHorizontal:20,borderTopRightRadius:10,
                  borderBottomLeftRadius:10,marginTop:8}}
                  onPress={()=>{
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.go23uni')
                  }}>
                      <Text style={{color:'#FFFFFF',fontSize:14}}>Update</Text>
                  </TouchableOpacity> :null
        } */}
        
          </View>
        
       
        {this.renderModal()}
        {this.getLoading()}
      </View>
    );
  }
}
const estyles = EStyleSheet.create({
  headerText: {
    fontSize: '18rem', color: '#fff'
  },
  title: {
    color: '#000', fontSize: '16rem'
  },
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.defaultBackground,
  },
  inputWrap: {
    flexDirection: "row",
    marginVertical: 5,
    height: 50,
    backgroundColor: "transparent",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Color.defaultGray
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    color: "#000",
    fontSize: 14,
  },
  header: {
    height: height * 0.08,
    width: null,
    alignItems: 'center',
    flexDirection: 'row',
  },
});
