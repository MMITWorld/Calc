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
  Clipboard,
  Share,
} from 'react-native';
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import dal from '../dal.js'
import config from '../config/config.js'
import Color from '../utils/Color.js';
import word from './data.json'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that;
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
});
import ViewShot from "react-native-view-shot";
import RNFS from "react-native-fs";
import { value } from 'numeral';
const imageType = "png";
const imagePath = `${RNFS.ExternalDirectoryPath}/image.${imageType}`;
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            dataProvider: dataProvider.cloneWithRows([]),
            dataProvider1: dataProvider.cloneWithRows([]),
            showModal:false,
            num:'',
            discount:'',
            saleDetailsId:'',
            unit:'',
            groupId:'',
            showPrintModal:false,
            layoutWidth:58,
            columnCount:2,
            copy:1
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
        this.getLogDetailsOriginal()
        this.getLogDetailsHistory()
    }
    _rowRenderer(type, data) {
        return (
            <TouchableOpacity style={{
                width:width,
                height:40,
                borderBottomWidth:1,
                borderColor:Color.DIVIDERCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.Num}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.Unit}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.Discount}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.DARKPRIMARYTEXTCOLOR,
                        fontSize:12,
                        fontFamily:'Roboto-Bold',
                        textAlign:'center'
                    }}>
                        {data.Summary}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
    getLogDetailsOriginal(){
        dal.getLogDetailsOriginal(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.saleId,(err,resp)=>{
            if(err){
                Alert.alert(config.AppName,'Something went wrong!')
                this.setState({
                    loading:false,
                })
            }else{
                console.log('original ',resp)
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    this.setState({
                        loading:false,
                        dataProvider: dataProvider.cloneWithRows(resp.Data),
                    })
                }else{
                    Alert.alert(config.AppName,'No Data!')
                    this.setState({
                        loading:false,
                        dataProvider: dataProvider.cloneWithRows([]),
                    })
                }
            }
        })
    }
    getLogDetailsHistory(){
        dal.getLogDetailsHistory(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.saleId,(err,resp)=>{
            if(err){
                //Alert.alert(config.AppName,'Something went wrong!')
                this.setState({
                    loading:false,
                })
            }else{
                console.log('history ',resp)
                if(resp&&resp.Status=='OK'&&resp.Data.length){
                    this.setState({
                        loading:false,
                        dataProvider1: dataProvider.cloneWithRows(resp.Data),
                    })
                }else{
                    //Alert.alert(config.AppName,'No Data!')
                    this.setState({
                        loading:false,
                        dataProvider1: dataProvider.cloneWithRows([]),
                    })
                }
            }
        })
    }
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
        )
    }
    renderTitle(){
        return(
            <View style={{
                width:width,
                height:50,
                borderBottomWidth:1,
                borderColor:Color.DIVIDERCOLOR,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:14,
                        
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].num}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:14,
                        
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].unit}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:14,
                        
                        textAlign:'center'
                    }}>
                        {word[this.props.navigation.state.params.lg].discount}
                    </Text>
                </View>
                <View style={{
                    flex:2
                }}>
                    <Text style={{
                        color:Color.YELLOWCOLOR,
                        fontSize:14,
                        
                        textAlign:'center'
                    }}>
                         {word[this.props.navigation.state.params.lg].summary}
                    </Text>
                </View>
            </View>
        )
    }
    copyFirstListSummaryUnit() {
        const list = this.state.dataProvider && this.state.dataProvider.getAllData
            ? this.state.dataProvider.getAllData()
            : [];
        if (!list || !list.length) {
            Alert.alert(config.AppName, 'No Data');
            return;
        }
        const msg = list
            .filter((d) => String(d && d.Summary != null ? d.Summary : '').trim() !== '')
            .map((d) => `${d.Summary}=${d && d.Unit != null ? d.Unit : ''}`)
            .join('\n');
        if (!msg) {
            Alert.alert(config.AppName, 'No Data');
            return;
        }
        Clipboard.setString(msg);
        Share.share({ message: msg });
    }
    render() {
        return (
        <View style={styles.container}>
            <Text style={{
                color:Color.DARKPRIMARYTEXTCOLOR,
                fontSize:14,
                textAlign:'center',
                marginTop:10
            }}>
                    {this.props.navigation.state.params.lg=='uni'?'မူရင်း':'မူရင္း'}
            </Text>
            <View style={{flexDirection:'row', justifyContent:'flex-end', paddingHorizontal:10, marginBottom:4}}>
                <TouchableOpacity
                    onPress={() => this.copyFirstListSummaryUnit()}
                    style={{
                        backgroundColor: Color.PRIMARYCOLOR,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                        paddingVertical: 5
                    }}>
                    <Text style={{color:'#fff', fontSize:12, fontWeight:'bold'}}>Copy</Text>
                </TouchableOpacity>
            </View>
            {this.renderTitle()}
            <View style={{flex:1}}>
                <RecyclerListView layoutProvider={this._layoutProvider} dataProvider={this.state.dataProvider} rowRenderer={this._rowRenderer} />
            </View>
            <Text style={{
                color:Color.DARKPRIMARYTEXTCOLOR,
                fontSize:14,
                textAlign:'center',
                marginTop:10
            }}>
                    {this.props.navigation.state.params.lg=='uni'?'ပြင်':'ျပင္'}
            </Text>
            {this.renderTitle()}
            <View style={{flex:1}}>
                <RecyclerListView 
                    layoutProvider={this._layoutProvider} 
                    dataProvider={this.state.dataProvider1} 
                    rowRenderer={this._rowRenderer} 
                />
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
        marginHorizontal:10 ,
        marginVertical: 5,
        alignItems:'center',
        backgroundColor: '#DCDCDC59',
        borderRadius: 5,
        borderWidth: 0.8,
        borderColor: Color.DIVIDERCOLOR,
    },
    input: {
        height: 40,
        flex:1,
        padding: 4,
        color            : "#000",
        fontSize         : 15,
        
    },
    printTxt:{
        color:Color.DARKPRIMARYTEXTCOLOR,
        fontSize:22,
        marginVertical:2
    }
});
