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
  AsyncStorage,
  DatePickerAndroid,
} from 'react-native';
import tickImg from '../assets/images/tick.png'
import untickImg from '../assets/images/untick.png'
import dal from '../dal.js'
import config from '../config/config.js'
import Color from '../utils/Color.js'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
import moment from 'moment'
let that;
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
export default class Users extends Component {
    constructor(props) {
        super(props);
        let date=new Date()
        this.state = {
            loading:false,
            dataProvider: dataProvider.cloneWithRows(this.props.navigation.state.params.data),
            PaymentType:'All',
            startDate:moment(date).format('YYYY/MM/DD'),
            endDate:moment(date).format('YYYY/MM/DD'),
            filterDate:false,
            users:[],
            user:{
                UserID:'All',
                UserNo:'User-All',
                discount2D:0,
                discount3D:0
            },
            agents:[],
            agent:{
                AgentID:'Agent-All',
                AgentName:'All',
            }
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
        console.log('data ',)
    }
    _rowRenderer(type, data,index) {
        return (
            <View style={{
                width:width,
                height:40,
                borderBottomWidth:1,
                borderColor:Color.DIVIDERCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }} >
                <View style={{
                    flex:3
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {index+1}
                    </Text>
                </View>
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:12,
                            fontFamily:'Roboto-Bold',
                            textAlign:'center'
                        }}>
                            {data.UserName}
                        </Text>
                    </View>
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.DARKPRIMARYTEXTCOLOR,
                            fontSize:12,
                            fontFamily:'Roboto-Bold',
                            textAlign:'center'
                        }}>
                            {data.MoneyIn}
                        </Text>
                    </View>
            </View>
        );
    }
    
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
        )
    }
    renderPage1(){
        let amt=0,amt1=0
        const temp=this.state.dataProvider.getAllData()
        temp.map((data,i)=>{
            amt+=Number(data.MoneyIn)
        })
        const {lg}=this.props.navigation.state.params
        return(
            <View style={{flex:1}}>
                <View style={{
                    width:width,
                    height:50,
                    borderBottomWidth:1,
                    borderColor:Color.DIVIDERCOLOR,
                    flexDirection:'row',
                    alignItems:'center'
                }}>
                    <View style={{
                        flex:3
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            
                            textAlign:'center'
                        }}>
                            {lg=='uni'?'စဉ်':'စဥ္'}
                        </Text>
                    </View>
                    <TouchableOpacity style={{
                        flex:3
                    }} onPress={()=>{
                        this.setState({
                            showReal:!this.state.showReal
                        })
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            textAlign:'center'
                        }}>
                             {lg=='uni'?'အမည်':'အမည္'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        flex:3
                    }}onPress={()=>{
                        this.setState({
                            showReal:!this.state.showReal
                        })
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:12,
                            textAlign:'center'
                        }}>
                            {lg=='uni'?'လက်ကျန်':'လက္က်န္'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{flex:1}}>
                    <RecyclerListView 
                        layoutProvider={this._layoutProvider} 
                        dataProvider={this.state.dataProvider} 
                        rowRenderer={this._rowRenderer} 
                        extendedState={this.state}
                    />
                </View>
                <View style={{
                    width:width,
                    paddingVertical:10,
                    borderTopWidth:1,
                    borderColor:Color.DIVIDERCOLOR,
                    flexDirection:'row',
                    alignItems:'center'
                }}>
                    <View style={{
                        flex:6
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:14,
                            fontWeight:'bold',
                            textAlign:'center'
                        }}>
                            Total
                        </Text>
                    </View>
                    <TouchableOpacity style={{
                        flex:3
                    }}onPress={()=>{
                        this.setState({
                            showReal:!this.state.showReal
                        })
                    }}>
                        <Text style={{
                            color:Color.YELLOWCOLOR,
                            fontSize:14,
                            fontWeight:'bold',
                            textAlign:'center'
                        }}>
                             {amt}
                        </Text>
                    </TouchableOpacity>
                    
                </View>
            </View>
        )
    }
    render() {
        return (
        <View style={styles.container}>
            {this.renderPage1()}
            
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