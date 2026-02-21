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
  PermissionsAndroid,
  AsyncStorage,
} from 'react-native';
import Share from 'react-native-share';
import dal from '../dal.js'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Pdf from 'react-native-pdf';
import radio_btn_selected from '../assets/images/radio_btn_selected.png'
import radio_btn_unselected from '../assets/images/radio_btn_unselect.png'
import previous from '../assets/images/previous.png'
import next from '../assets/images/next.png'
import config from '../config/config.js'
import Color from '../utils/Color.js';
import word from './data.json'
import moment from 'moment'
const {width,height}=Dimensions.get('window')
import Loading from '../components/loading.js'
let that;
export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:true,
            page:1,
            totalPage:1,
            shareType:2,
            round:'0',
            dots:[],
            break:0,
            data:[],
            total:0,
            buyType:'m',
            userNo:'NoUser',
            userId:null,
            users:[],
            discount2D:0,
            discount3D:0,
            isBuy:false,
            unitPrice:1,
            filePath: null
        };
    }
    componentWillUnmount() {
        //this.willFocusListener.remove()
    }
    async componentDidMount() {
        that=this
        const round=await AsyncStorage.getItem('round')||'0'
        this.setState({
            round:round
        },()=>{
            this.getDotList()
        })
    }
    getDotList(){
        dal.getDotList(this.props.navigation.state.params.endpoint,this.props.navigation.state.params.termId,this.props.navigation.state.params.type,
            this.state.round,(err,resp)=>{
            if(err){
                this.setState({
                    loading:false
                })
            }else{
                if(resp&&resp.Data.length){
                    this.setState({
                        loading:false,
                        dots:resp.Data,
                        data:resp.Data.filter(data => data.PageNo == 1),
                        totalPage:resp.Data[0].TPage,
                        break:resp.Data.filter(data => data.PageNo == 1)[0].Break,
                        total:this.getTotal(resp.Data.filter(data => data.PageNo == 1))
                    },()=>{
                        this.askPermission()
                    })
                }else{
                    this.setState({
                        loading:false,
                        dots:[]
                    })
                }
            }
        })
    }
    askPermission() {
        var that = this;
        async function requestExternalWritePermission() {
            try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                title: 'CameraExample App External Storage Write Permission',
                message:
                    'CameraExample App needs access to Storage data in your SD Card ',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                //If WRITE_EXTERNAL_STORAGE Permission is granted
                //changing the state to show Create PDF option
                that.createPDF();
            } else {
                alert('WRITE_EXTERNAL_STORAGE permission denied');
            }
            } catch (err) {
            alert('Write permission err', err);
            console.warn(err);
            }
        }
        //Calling the External Write permission function
        if (Platform.OS === 'android') {
            requestExternalWritePermission();
        } else {
            this.createPDF();
        }
    }
    
    async createPDF() {
        let tempdata=''
        for (let i = 0; i < this.state.data.length; i += 10) {

  tempdata += `<div style="display: flex; flex-direction: row; flex:1;">`;

  for (let k = 0; k < 10 && i + k < this.state.data.length; k++) {
    tempdata += `
      <div style="width: 70px; height: 31px; align-items:center; justify-content:center;
      display: flex; font-size:9px; font-weight:bold;
      border-style: solid; border-width: thin;">
        ${this.state.data[i + k].Number}
      </div>
      <div style="width: 100px; height: 31px; align-items:center; justify-content:center;
      display: flex; font-size:9px; font-weight:bold;
      border-style: solid; border-width: thin;">
        ${this.state.data[i + k].Units}
      </div>
    `;
  }

  tempdata += `</div>`;
}
        const rows = Math.ceil(this.state.data.length / 10);
        const rowHeight = 31;
        const headerHeight = 120;
        const pdfHeight = headerHeight + (rows * rowHeight) + 60;
        let options = {
            //Content to print
            html:
            `<!DOCTYPE html>
            <html>
            <head>
              <style>
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body>
            
            <div id="name">${this.props.navigation.state.params.name}</div>
            
            <div style="display: flex;D:
            flex-direction: row;
            flex:1;">
                <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>

                <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>

                <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>
                
                <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>

                <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>

               <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>


                <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>

             <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>

                <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>

                <div style="width: 70px;height: 31px;align-items:center;justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">N</div>

                <div style="width: 100px;
                height: 31px;
                align-items:center;
                justify-content:center;
                display: flex;
                font-size:9px;
                font-weight:bold;
                border-style: solid;
                border-width: thin;">U</div>
            </div>
            ${tempdata}
            <div style=" margin-top:10px;
            font-size:9px;
            font-weight:bold;">
                Total Units = ${this.state.total}(${Number(this.state.total/this.state.break).toFixed(2)}%) ,Break =${this.state.break}
            </div>
            </body>
            </html>`,
            //File Name
            fileName: this.props.navigation.state.params.name.replace(/\//g, '.'),
            //File directory
            directory: 'Documents',
            height: pdfHeight,
            width: 595,
            padding: 24,
        };
        let file = await RNHTMLtoPDF.convert(options);
        console.log(file.filePath);
        this.setState({filePath:file.filePath});
    }
    getTotal(data){
        let total=0
        data.map((value,index)=>{
            total+=value.Units
        })
        return total;
    }
    onShare = async () => {
        try {
            Share.open({
                url:`file:///${this.state.filePath}`,
                message:`${this.props.navigation.state.params.name}`
            })
            
        } catch (error) {
          console.log(error.message);
        }
    };
    renderItems(){
        let items=[]
        
        if(this.state.shareType==2){
            for(let i=0;i<this.state.data.length;i+=2){
                if((i+1)<this.state.data.length){
                    items.push(
                        <Text>
                            {this.state.data[i].Number} - {this.state.data[i].Units} | {this.state.data[i+1].Number} - {this.state.data[i+1].Units}
                        </Text>
                    )
                }else{
                    items.push(
                        <Text>
                            {this.state.data[i].Number} - {this.state.data[i].Units}
                        </Text>
                    )
                }
                
            }
        }else{
            for(let i=0;i<this.state.data.length;i++){
                items.push(
                    <Text>
                        {this.state.data[i].Number} - {this.state.data[i].Units}
                    </Text>
                ) 
            }
        }
        return items;
    }
    renderLoading(){
        return(
            <Loading show={this.state.loading}></Loading>
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
                    marginHorizontal:10,
                    justifyContent:'center',
                    backgroundColor:this.state.page==1?'#DCDCDC80':Color.DIVIDERCOLOR,
                    padding:10,
                    borderRadius:5
                }} onPress={()=>{
                    this.setState({
                        page:(this.state.page-1),
                        data:this.state.dots.filter(data => data.PageNo == (this.state.page-1)),
                        break:this.state.dots.filter(data => data.PageNo == (this.state.page-1))[0].Break,
                        total:this.getTotal(this.state.dots.filter(data => data.PageNo == (this.state.page-1))),
                        filePath:null
                    },()=>{
                        this.askPermission()
                    })
                }} disabled={this.state.page==1?true:false}>
                    <Image source={previous} style={{width:15,height:15}}/>
                </TouchableOpacity>
                <Text style={{
                    fontFamily:'Roboto-Bold',
                    fontSize:17,
                    marginHorizontal:15,
                }}>
                   Page {this.state.page} of {this.state.totalPage}
                </Text>
                <TouchableOpacity style={{
                    flexDirection:'row',
                    marginHorizontal:10,
                    justifyContent:'center',
                    backgroundColor:this.state.page==this.state.totalPage?'#DCDCDC80':Color.DIVIDERCOLOR,
                    padding:10,
                    borderRadius:5
                }} onPress={()=>{
                    if(this.state.page<this.state.totalPage){
                        this.setState({
                            page:(this.state.page+1),
                            data:this.state.dots.filter(data => data.PageNo == (this.state.page+1)),
                            break:this.state.dots.filter(data => data.PageNo == (this.state.page+1))[0].Break,
                            total:this.getTotal(this.state.dots.filter(data => data.PageNo == (this.state.page+1))),
                            filePath:null
                        },()=>{
                            this.askPermission()
                        })
                    }
                }} disabled={this.state.page==this.state.totalPage?true:false}>
                    <Image source={next} style={{width:15,height:15}}/>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{
                        paddingVertical:10,
                        paddingHorizontal:15,
                        backgroundColor:Color.PRIMARYCOLOR,
                        borderRadius:5,
                        height:40,
                        flex:1,
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent:'center',
                        marginRight:5
                    }} 
                    onPress={()=>{
                        this.onShare()
                    }}>
                    <Text style={{color:'#fff',fontSize:16,marginLeft:5,fontFamily:'Roboto'}}>
                        SHARE
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{
                width:width,
                height:height*0.07,
                marginHorizontal:10,
                flexDirection:'row',
                alignItems:'center'
            }}>
                <Text style={{
                    fontFamily:'Roboto-Bold',
                    fontSize:16,
                    marginRight:10
                }}>
                    Total Units = {this.state.total}({Number(this.state.total/this.state.break).toFixed(2)}%)
                </Text>
                <Text style={{
                    fontFamily:'Roboto-Bold',
                    fontSize:16,
                    marginRight:10
                }}>
                    Break = {this.state.break}
                </Text>
            </View>
            <Pdf
                source={ { uri:this.state.filePath }}
                onLoadComplete={(numberOfPages,filePath)=>{
                    console.log(`number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page,numberOfPages)=>{
                    console.log(`current page: ${page}`);
                }}
                onError={(error)=>{
                    console.log(error);
                }}
                onPressLink={(uri)=>{
                    console.log(`Link presse: ${uri}`)
                }}
                style={{flex:1}}
            />
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
