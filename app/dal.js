
const axios = require('axios');
//TZT
const MoneyInOutPassword='ztztadminitworld@'
module.exports.numberWithCommas=function(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports.sendRequest = function(callback){ 
    let httpAddress = 'https://www.google.com' //the site i'm building the app for
    let xhr = new XMLHttpRequest();
    xhr.open('GET', httpAddress);
    xhr.onreadystatechange = (e) => {
      if (xhr.readyState !== 4) { //code for completed request
        return;
      }
      if (xhr.status === 200) { //successful response
        callback(true);
      } else {                  //unsuccessful response
        /* NOTE: React native often reacts strangely to offline uses and as such,
        it may be necessary to directly set state here rather than to rely on a callback */
        callback(false)  //OR: this.state.splash = false
      }
    };
    xhr.send();
    setTimeout(() => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
          xhr.abort();
      }
    }, 3000);
    
}
module.exports.getAgent= function(APPKey,callback) {
    let url = `http://customerlist.aa23mm.com/API/APIAbout?password=ztztadminitworld@&AdminKEY=${APPKey}&ProjectType=23%20Online`;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.get_predefined_today_terms = function(APIENDPOINT,callback) {
    let url = APIENDPOINT ;
    console.log("======>>"+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getNubers4GG = function(APIENDPOINT,P,Discount,TermDetailID,Prize,callback) {
    let url = APIENDPOINT + "api/apiLedger?"
    +`P=${P}&Discount=${Discount}&TermDetailID=${TermDetailID}&Prize=${Prize}&LottType=2D`;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 20000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveGG = function(APIENDPOINT, callback) {
    let url = APIENDPOINT ;
    console.log(url)
    axios({
        method: 'get',
        url: url,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getAPIMInOutList = function(APIENDPOINT,AgentID,UserID,MachineName,PaymentType,FilterByDate,FromDate,ToDate,callback) {
    let url = APIENDPOINT + "api/APIMInOut?"
    +`AgentID=${AgentID}&UserID=${UserID}&MachineName=${MachineName}&PaymentType=${PaymentType}&FilterByDate=${FilterByDate}&FromDate=${FromDate}&ToDate=${ToDate}`;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 20000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.setConfirmReject = function(APIENDPOINT,Status,MInOutID,Remark,callback) {
    let url = APIENDPOINT + "api/APIMInOut?"
    +`Status=${Status}&MInOutID=${MInOutID}&Remark=${Remark}&Password=${MoneyInOutPassword}`;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 20000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getTransferList = function(APIENDPOINT,IsTransfer,PaymentType,callback) {
    let url = APIENDPOINT + "api/APIMInOut?"
    +`IsTransfer=${IsTransfer}&PaymentType=${PaymentType}&Password=${MoneyInOutPassword}`;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 20000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getRemainList = function(APIENDPOINT,AgentID,UserID,PaymentType,FilterByDate,FromDate,ToDate,callback) {
    let url = APIENDPOINT + "api/APIMInOut?"
    +`AgentID=${AgentID}&UserID=${UserID}&PaymentType=${PaymentType}&FilterByDate=${FilterByDate}&FromDate=${FromDate}&ToDate=${ToDate}`;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 20000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveMoneyInOut = function(APIENDPOINT,IsTransfer,data, callback) {
    let url = APIENDPOINT + "api/APIMInOut?IsTransfer="+IsTransfer+"&IsOwner=true&Password="+MoneyInOutPassword;
    console.log(url)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:{
            Data:[data],
            Status:''
        }
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getRemainAmt = function(APIENDPOINT,UserID,callback) {
    let url = APIENDPOINT + "api/APIMInOut?UserID="+UserID+'&Password='+MoneyInOutPassword;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.sendSms = function(APIENDPOINT,UserID,TermDetailID,CName,bodySMS,callback) {
    var url = APIENDPOINT + "api/APISMSCombine?UserID="+UserID+"&TermDetailID="+TermDetailID+"&CName="+CName;
    var options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },      
        body:JSON.stringify({
            bodySMS:bodySMS
         }),
        
    };;

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}
module.exports.getEndpointByKey = function(Key,Password,callback) {
    let url ="http://luckynum.aa23mm.com/api/APIAbout?Key="+Key+"&Password="+Password;
    console.log(url)
    var options = {
    };

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}

module.exports.getHotNum = function(APIENDPOINT,SaleID,callback) {
    var url = APIENDPOINT + "api/apiHotNum?TermDetailID="+SaleID;

    var options = {
    };

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}

module.exports.getExtraNum = function(APIENDPOINT,SaleID,callback) {
    var url = APIENDPOINT + "api/apiHotNum?IsExtra=true&TermDetailID="+SaleID;
    var options = {
    };

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}


module.exports.getusers = function(APIENDPOINT,UserID,callback) {
    var url = APIENDPOINT + "api/apiuser?UserID="+UserID;

    var options = {
    };

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}
module.exports.getSlipDetail = function(APIENDPOINT,SaleID,callback) {
    var url = APIENDPOINT + "/api/apislipdetail?SaleID="+SaleID;
    console.log(url)
    var options = {
    };

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}
module.exports.getTodayTerm = function(APIENDPOINT,userid,callback) {
    let url = APIENDPOINT + "api/apitodaytermdetail?UserID="+userid+"&Password=ztztadminitworld@";
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 10000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getWinReport= function(APIENDPOINT,searchExpression,callback) {
    let url = APIENDPOINT + "api/APIWinReport?searchExpression="+searchExpression;
    
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getBreakP= function(APIENDPOINT,TermID,CustomerName,callback) {
    let url = APIENDPOINT + "api/APIPaymentSummaryWindow?TermID="+TermID+"&CustomerName="+encodeURIComponent(CustomerName)+"&IsBreakP=true"
    console.log('url=======> ',url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getPaymentSummary= function(APIENDPOINT,searchExpression,agentDiscount,onlyWin,callback) {
    let url = APIENDPOINT + "api/APIPaymentSummaryWindow?searchExpression="+searchExpression
    //+"&IsAndroid=true";
    url+=agentDiscount?'&IsAgent=true':''
    url+=onlyWin?'&OnlyWin=true':''
    console.log('url ',url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getPaymentDetailAndroid= function(APIENDPOINT,searchExpression,TermID,TermDetailID,agentDiscount,OtherDiscount,onlyWin,callback) {
    let url = APIENDPOINT + "api/APIPaymentSummaryWindow?searchExpression="+searchExpression+"&TermID="+TermID+"&TermDetailID="+TermDetailID+"&IsAgent="+agentDiscount+"&OtherDiscount="+OtherDiscount+"&IsWinOnly="+onlyWin;
    console.log('url=============> ',url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.updateSlipCopy= function(APIENDPOINT,SaleID,callback) {
    let url = APIENDPOINT + "api/APISlipCopyUpdate?SaleID="+SaleID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.updateSlipDetails= function(APIENDPOINT,SaleDetailID,Number,Unit,Discount,GroupID,Remark,SaleID,callback) {
    let url = APIENDPOINT + "api/APISlipDetailUpdate?SaleDetailID="+SaleDetailID+"&Number="+Number
    +"&Unit="+Unit+"&Discount="+Discount
    +"&GroupID="+GroupID+"&UserNo=&Password=&IsPassword=false&Remark="+Remark+"&SaleID="+SaleID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.deleteSlipDetails= function(APIENDPOINT,SaleDetailID,GroupID,Remark,SaleID,callback) {
    let url = APIENDPOINT + "api/APISlipDetailDelete?SaleDetailID="+SaleDetailID+"&GroupID="+GroupID+"&UserNo=&Password=&IsPassword=false&Remark="+Remark+"&SaleID="+SaleID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.ungroupSlip = function(APIENDPOINT,SaleID,GroupID,callback) {
    let url = APIENDPOINT + "api/APISlipDetailUnGroup?SaleID="+SaleID+"&GroupID="+GroupID+"&UserNo=null&Password=null&IsPassword=false";

    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.deleteSlip = function(APIENDPOINT,SaleID,UserID,Remark,callback) {
    let url = APIENDPOINT + "api/APISlipEdit?SaleID="+SaleID+"&UserID="+UserID+"&UserNo=null&Password=null&IsDelete=true&IsPassword=false&IsAndroid=true&Remark="+Remark;

    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.updateSlip = function(APIENDPOINT,CName,SaleID,UserID,Remark,callback) {
    let url = APIENDPOINT + "api/APISlipEdit?SaleID="+SaleID+"&UserID="+UserID+"&UserNo=null&Password=null&IsDelete=false&IsPassword=false&IsAndroid=true&Remark="+Remark+"&CName="+CName;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getLogin = function(APIENDPOINT,user,password,callback) {
    let url = APIENDPOINT + "api/apiUser?UserNo="+user+"&IsAdmin=true&Password="+password;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getTermDetailsFromOther = function(APIENDPOINT,UserID,callback) {
    let url = APIENDPOINT + "api/APITodayTermDetail?UserID="+UserID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getTermsFromOther = function(APIENDPOINT,UserID,callback) {
    let url = APIENDPOINT + "/api/APITodayTermDetail?UserID="+UserID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getUserFromOther = function(APIENDPOINT,UserNo,Password,callback) {
    let url = APIENDPOINT + "/api/apiUser?UserNo="+UserNo+"&Password="+Password;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.uploadSlipDetailsToServer = function(APIENDPOINT,data, callback) {
    let url = APIENDPOINT + "api/APISlipDownload?";
    console.log(url)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.uploadSlipToServer = function(APIENDPOINT,UserID,TermDetailID,data, callback) {
    let url = APIENDPOINT + "api/APISlipDownload?UserID="+UserID+"&TermDetailID="+TermDetailID;
    console.log(url)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.downloadSlipDetailsFromOther = function(APIENDPOINT,UserID,TermDetailID,callback) {
    let url = APIENDPOINT + "/api/APISlipDetailAll?UserID="+UserID+"&TermDetailID="+TermDetailID;
    console.log('============ downloadSlipDetailsFromOther URL=========')
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.downloadSlipFromOther = function(APIENDPOINT,UserID,TermDetailID,callback) {
    let url = APIENDPOINT + "/api/APISlipDownload?UserID="+UserID+"&TermDetailID="+TermDetailID;
    console.log('============ downloadSlipFromOther URL=========')
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.ApiSupplier = function(APIENDPOINT,SupplierID,callback) {
    let url = APIENDPOINT + "api/ApiSupplier?SupplierID="+SupplierID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveSliptoOther = function(APIENDPOINT,UserID,TermDetailID,data, callback) {
    let url = APIENDPOINT + "/api/APISaleAgent?UserID="+UserID+"&TermDetailID="+
    TermDetailID+"&CName=Extra&IsSale=True";
    console.log(url)
    let pdata={
        data:data,
    }
    console.log('buy data ===>> ',pdata)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.buyNums = function(APIENDPOINT,UserID,TermDetailID,CName,data, callback) {
    let url = APIENDPOINT + "api/APISaleOwner?UserID="+UserID+"&TermDetailID="+
    TermDetailID+"&CName="+CName+"&IsSale=False";
    let pdata={
        data:data,
    }
    console.log('buy data ===>> ',pdata)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.checkSMS = function(APIENDPOINT,UserID,TermDetailID,bodySMS, callback) {
    var url =APIENDPOINT + "api/APILedger?TermDetailID="+TermDetailID+"&UserID="+UserID;

    console.log("CheckURL"+url)
    console.log("Body Data=========>>>>",JSON.stringify({
        bodySMS:bodySMS
     }))

     console.log("Body =====================>"+bodySMS)

    var options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },      
        body:JSON.stringify({
            bodySMS:bodySMS
         }),
        
    };;

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
                console.log(responseText)
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}
module.exports.combineSMS = function(APIENDPOINT,UserID,TermDetailID,Discount,IsSale,UnitPrice,LdgPrice,LottType,bodySMS, callback) {
    var url =APIENDPOINT + "api/APILedger?TermDetailID="+TermDetailID+"&UserID="+UserID+"&Discount="+
    Discount+"&IsSale="+IsSale+"&UnitPrice="+UnitPrice+"&LdgPrice="+LdgPrice+"&LottType="+LottType+"&IsAndroidSMSAdmin=true";

    console.log(url)
    console.log(JSON.stringify({
        bodySMS:bodySMS
     }))

    var options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },      
        body:JSON.stringify({
            bodySMS:bodySMS
         }),
        
    };;

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
                console.log(responseText)
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}
module.exports.combineLedger = function(APIENDPOINT,UserID,TermDetailID,Discount,IsSale,UnitPrice,LdgPrice,LottType,bodySMS, callback) {
    var url =APIENDPOINT + "api/APILedger?TermDetailID="+TermDetailID+"&UserID="+UserID+"&Discount="+
    Discount+"&IsSale="+IsSale+"&UnitPrice="+UnitPrice+"&LdgPrice="+LdgPrice+"&LottType="+LottType+"&IsAndroid=true";

    console.log(url)
    console.log(JSON.stringify({
        bodySMS:bodySMS
     }))

    var options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },      
        body:JSON.stringify({
            bodySMS:bodySMS
         }),
        
    };;

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
                console.log(responseText)
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}

module.exports.updateAllUserPrize = function(APIENDPOINT,Prize,LottType,callback) {
    let url = APIENDPOINT + "api/APIUserByID?Prize="+Prize+"&LottType="+LottType;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getRemainUnits = function(APIENDPOINT,TermDetailID,Num,callback) {
    let url = APIENDPOINT + "api/apiSlipDetail?TermDetailID="+TermDetailID+"&Num="+Num+'&IsRemain=true';
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getSlipDetails = function(APIENDPOINT,SaleID,callback) {
    let url = APIENDPOINT + "api/ApiSlipDetail?SaleID="+SaleID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getLogDetailsHistory = function(APIENDPOINT,SaleHID,callback) {
    let url = APIENDPOINT + "api/ApiSlipDetail?IsH=true&SaleHID="+SaleHID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getLogDetailsOriginal = function(APIENDPOINT,SaleHID,callback) {
    let url = APIENDPOINT + "api/ApiSlipDetail?IsO=true&SaleHID="+SaleHID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getSlipLogs = function(APIENDPOINT,TermID,TermDetailID,callback) {
    let url = APIENDPOINT + "api/APISlipLog?TermID="+TermID
    +"&TermDetailID="+TermDetailID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getSlipList = function(APIENDPOINT,TermID,UserID,TermDetailID,LottType,callback) {
    let url = APIENDPOINT + "api/ApiSlipWinbyMachine?TermID="+TermID+"&UserID="+UserID
    +"&TermDetailID="+TermDetailID+"&LottType="+LottType+"&MachineName=All";
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getUsersByAgent = function(APIENDPOINT,AgentID,callback) {
    let url = APIENDPOINT + "api/apiUser?AgentID="+AgentID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getVersionInfo= function(callback) {
    let url = `http://customerlist.aa23mm.com/api/apiAbout?Is23Go=true`;
    var options = {
    };

    fetch(url, options)
    .then((response) => response.text())
    .then((responseText) => {
        try {
            callback(null, JSON.parse(responseText));
        }
        catch (jsonError) {
            callback(jsonError, null);
        }

    })
    .catch((error) => {
        callback(error, null);
    });
}
module.exports.getMessageforAdmin = function(key,callback) {
    let url = `http://customerlist.aa23mm.com/api/apiAbout?Key=${key}&Password=ztztadminitworld@`;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getRules = function(APIENDPOINT,RuleTermDetailID,callback) {
    var url = APIENDPOINT + "api/APIAbout?RuleTermDetailID="+RuleTermDetailID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveRules = function(APIENDPOINT,RuleTermDetailID,Rules,callback) {
    var url = APIENDPOINT + "api/APIAbout?RuleTermDetailID="+RuleTermDetailID+"&Rules="+Rules;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 15000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getUsers = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/apiUser?";
    axios({
        method: 'get',
        url: url,
        timeout: 15000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getTermDetailsByID = function(APIENDPOINT,TermID,callback) {
    let url = APIENDPOINT + "api/apiTermDetail?TermID="+TermID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getTerms = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/apiTerm?";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.updateTerms = function(APIENDPOINT,TermID,Name,callback) {
    let url = APIENDPOINT + "api/apiTerm?Name="+Name+"&TermID="+TermID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getDotList = function(APIENDPOINT,TermDetailID,LottType,Round,callback) {
    let url = APIENDPOINT + "api/APILedger?TermDetailID="+TermDetailID+"&LottType="+LottType+"&IsLinear=false&Round="+Round;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getDotListByPrize = function(APIENDPOINT,TermDetailID,LottType,Round,Prize,callback) {
    let url = APIENDPOINT + "api/APILedger?TermDetailID="+TermDetailID+"&LottType="+LottType+"&IsLinear=false&Round="+Round+"&Prize="+Prize;
    console.log("getDotLIstByPrize=========>"+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getGroup = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/APIUser?IsLedgerShareGroup=true";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveGroup = function(APIENDPOINT,data,Status, callback) {
    let url = APIENDPOINT + "api/APIUser?IsGroup=true&Status=" + Status;
    let pdata={
        data:data,
    }
    console.warn("url====>"+url)
    console.warn("data===>"+JSON.stringify({
        pdata
     }))
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getCustomTimeList = function(APIENDPOINT,TimeName,callback) {
    let url = APIENDPOINT + "api/APITermDetail?TimeName="+TimeName;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveCustomTime = function(APIENDPOINT,data,Status, callback) {
    let url = APIENDPOINT + "api/APITermDetail?Status=" + Status;
    let pdata={
        data:data,
    }
    console.warn("url====>"+url)
    console.warn("data===>"+JSON.stringify({
        pdata
     }))
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.saveBreakAndPercentage = function(APIENDPOINT,data,Status, callback) {
    let url = APIENDPOINT + "api/APIUser?IsShare=true&Status=" + Status;
    let pdata={
        data:data,
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.getUserByLedgerShareGroupID = function(APIENDPOINT,LedgerShareGroupID,callback) {
    let url = APIENDPOINT + "api/APIUser?LedgerShareGroupID="+LedgerShareGroupID+"&IsShareUser=true";
    console.warn(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.getNewUser = function(APIENDPOINT,LedgerShareGroupID,callback) {
    let url = APIENDPOINT + "api/APIUser?LedgerShareGroupID="+LedgerShareGroupID;
    console.warn("New User URL: "+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.getHoliday = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/APIWinNumToday?IsHoliday=true";
    console.warn("Holiday URL: "+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.saveHoliday = function(APIENDPOINT,data,Status, callback) {
    let url = APIENDPOINT + "api/APIWinNumToday?Status=" + Status+"&IsHoliday=true";
    let pdata={
        data:data,
    }
    console.warn("url====>"+url)
    console.warn("data===>"+JSON.stringify({
        pdata
     }))
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.getSupplier = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/APIUser?IsSupplier=true";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveSupplier = function(APIENDPOINT,SupplierID,Website,UserNo,Password,ServerUnit,UserUnit,IsOver,OverAmt,LottType,SrNo,Status, callback) {
    console.warn(SupplierID,Website,UserNo,Password,ServerUnit,UserUnit,IsOver,OverAmt,LottType,SrNo,Status)
    let url = APIENDPOINT + "api/APISupplier?Status="+Status;
    let data={
        SupplierID:SupplierID,
        Website:Website,
        UserNo:UserNo,
        Password:Password,
        ServerUnit:ServerUnit,
        UserUnit:UserUnit,
        IsOver:IsOver,
        OverAmt:OverAmt,
        LottType:LottType,
        SrNo:SrNo
    }
    console.warn("post data====>"+data)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.getSupplierList = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/APISupplier?";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.getTutorialList = function(APIENDPOINT,IsAdmin,callback) {
    let url = "http://tutorial.zzz2323.com/" + "api/APIAbout?IsAdmin="+IsAdmin;
    console.warn(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getUpdateLink = function(callback) {
    let url = "http://tutorial.zzz2323.com/" + "api/APIAbout?AppName=Calculator";
    console.warn(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getUserAppLink = function(callback) {
    let url = "http://tutorial.zzz2323.com/" + "api/APIAbout?AppName=23Go";
    console.warn(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveTutorial = function(APIENDPOINT,data,Status, callback) {
    let url = "http://tutorial.zzz2323.com/" + "api/APIAbout?Status="+Status;
    console.warn("saveTutorial URL: "+url)
    console.warn("saveTutorial data: ",data)
    let pdata={
        data:data,
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.getTelegramBotList = function(callback) {
    let url = "http://tutorial.zzz2323.com/" + "api/APITelegramBot?IsTelegramBot=true";
    console.warn(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.saveTelegramBot = function(data,Status, callback) {
    let url = "http://tutorial.zzz2323.com/" + "api/APITelegramBot?Status="+Status;
    console.warn("saveTelegramBot URL: "+url)
    console.warn("saveTelegramBot data: ",data)
    let pdata={
        data:data,
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.saveDivide = function(APIENDPOINT,data, callback) {
    let url = APIENDPOINT + "api/APILedger?IsD=True";
    console.warn("savedata"+data)
    let pdata={
        data:data,
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveCut = function(APIENDPOINT,data, callback) {
    let url = APIENDPOINT + "api/APILedger?IsC=True";
    let pdata={
        data:data,
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.getDivideList = function(APIENDPOINT,DTermDetailID,callback) {
    let url = APIENDPOINT + "api/apiLedger?DTermDetailID="+DTermDetailID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getCutList = function(APIENDPOINT,CTermDetailID,callback) {
    let url = APIENDPOINT + "api/apiLedger?CTermDetailID="+CTermDetailID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.changeUnitBreak = function(APIENDPOINT,TermDetailID,UnitBreak,callback) {
    let url = APIENDPOINT + "api/APIChangeUnitBreak?TermDetailID="+TermDetailID+"&UnitBreak="+UnitBreak+'&AdminKey=adminitworldtzt';
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.saveBornNum = function(APIENDPOINT,TermDetailID,callback) {
    let url = APIENDPOINT + "api/APIBornNumber?TermDetailID="+TermDetailID;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 20000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.deleteHotNum = function(APIENDPOINT,TermDetailID,NumHotNumID,callback) {
    let url = APIENDPOINT + "api/APIHotNum?TermDetailID="+TermDetailID+"&NumHotNumID="+NumHotNumID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveHotNum = function(APIENDPOINT,TermDetailID,LottType,Num,callback) {
    let url = APIENDPOINT + "api/APIHotNum?TermDetailID="+TermDetailID+"&LottType="+LottType+"&Num="+Num;
    console.warn("saveHotNum URL: "+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.deleteAllHotNum = function(APIENDPOINT,TermDetailID,callback) {
    let url = APIENDPOINT + "api/APIHotNum?TermDetailID="+TermDetailID+"&IsDeleteAll=true";
    console.warn("deleteAllHotNum URL: "+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveHotNumAll = function(APIENDPOINT,data,TermDetailID, callback) {
    let url = APIENDPOINT + "api/APIHotNum?TermDetailID="+TermDetailID;
    let pdata={
        data:data,
    }
    console.warn('saveHotNumAll data ===>> ',pdata)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        console.warn('saveHotNumAll response ===>> ',response.data)
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.SaveMsg = function(APIENDPOINT,Msg,callback) {
    let url = APIENDPOINT + "api/APIAbout?Msg="+Msg;
    console.log('hot url '+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getHotList = function(APIENDPOINT,TermDetailID,callback) {
    let url = APIENDPOINT + "api/APIHotNum?TermDetailID="+TermDetailID;
    console.log('hot url '+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.get3DWinNumList = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/APIWinNumToday?IsLive=false";
    console.log('hot url '+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getIndex3D = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/APIWinNumToday?IsIndex3D=true";
    console.log('hot url '+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getWinNum3D = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/APIWinNumToday?IsWinNum3D=true";
    console.log('hot url '+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getIndex3DSave = function(APIENDPOINT,IndexNum3D,callback) {
    let url = APIENDPOINT + "api/APIWinNumToday?IndexNum3D="+IndexNum3D;
    console.log('hot url '+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getWinNum3DSave = function(APIENDPOINT,IndexNum3D,WinNum3D,ResultDate,callback) {
    let url = APIENDPOINT + "api/APIWinNumToday?IndexNum3D="+IndexNum3D+"&WinNum3D="+WinNum3D+"&ResultDate="+ResultDate+"&Password=adminzt";
    console.log('hot url '+url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getLedgerListByvBreak = function(APIENDPOINT,TermDetailID,LottType,VBreak,callback) {
    let url = APIENDPOINT + "api/APILedger?UserID=All&TermDetailID="+TermDetailID+"&LottType="+LottType+"&VBreak="+VBreak;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getLedgerList = function(APIENDPOINT,TermDetailID,LottType,UserID,AgentID,callback) {
    let url = APIENDPOINT + "api/APILedger?UserID="+UserID+"&TermDetailID="+TermDetailID+"&LottType="+LottType+"&AgentID="+AgentID+"&IsAndroid=true";
    console.log('url ==>>>>> ',url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.updateTerm = function(APIENDPOINT,IsC,data,extra, callback) {
    let url = APIENDPOINT + "api/APITermDetail?IsC="+IsC+"&IsAndroid=true&IsPM=false"+extra;
    console.log(url)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveTerm = function(APIENDPOINT,TermName,data, TimeNameOrCallback, LottTypeOrCallback, MaybeCallback) {
    let callback = null;
    let timeName = null;
    let lottType = '';
    if(typeof TimeNameOrCallback === 'function'){
        callback = TimeNameOrCallback;
    }else if(typeof LottTypeOrCallback === 'function'){
        timeName = TimeNameOrCallback;
        callback = LottTypeOrCallback;
    }else{
        timeName = TimeNameOrCallback;
        lottType = LottTypeOrCallback || '';
        callback = MaybeCallback;
    }
    let url = APIENDPOINT + "api/APITermDetail?TermName="+TermName+"&IsAndroid=true";
    if((lottType === '' || lottType === '2D') && timeName && timeName != '2'){
        url += "&TimeName=" + timeName;
    }
    let pdata={
        data:data,
    }

    console.warn("URL========>"+url)
    console.warn("Data=====>"+JSON.stringify({
        pdata
     }))
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.deleteTerm = function(APIENDPOINT,TermDetailID,callback) {
    let url = APIENDPOINT + "api/APITermDetail?TermDetailID="+TermDetailID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveBreak = function(APIENDPOINT,data, callback) {
    let url = APIENDPOINT + "api/APICustomerBreak?";
    let pdata={
        data:data,
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getHotPercantage = function(APIENDPOINT,TermDetailID, callback) {
    let url = APIENDPOINT + "api/APIHotNum?TermDetailID="+TermDetailID;
    axios({
        method: 'get',
        url: url,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.updateHotPercantage = function(APIENDPOINT,TermDetailID,HotPercentage, callback) {
    let url = APIENDPOINT + "api/APIHotNum?TermDetailID="+TermDetailID+"&HotPercentage="+HotPercentage;
    axios({
        method: 'get',
        url: url,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveBreakAll = function(APIENDPOINT,data,allbreak,status, callback) {
    let url = APIENDPOINT + "api/APICustomerBreak?Break="+allbreak+"&Status="+status;
    let pdata={
        data:data,
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:pdata
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}

module.exports.APICustomerBreak = function(APIENDPOINT,TermDetailID,AgentID,callback) {
    let url = APIENDPOINT + "api/APICustomerBreak?TermDetailID="+TermDetailID;
    if(AgentID){
        url += "&AgentID="+encodeURIComponent(AgentID);
    }
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.APITermDetailByDate = function(APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/APITermDetailByDate?";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.APISlipDetail = function(APIENDPOINT,TermDetailID,Num,callback) {
    let url = APIENDPOINT + "api/APISlipDetail?TermDetailID="+TermDetailID+"&Num="+Num+"&IsGroup=true";
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.APISlipDetailTime = function(APIENDPOINT,TermDetailID,Num,callback) {
    let url = APIENDPOINT + "api/APISlipDetail?TermDetailID="+TermDetailID+"&Num="+Num;
    console.log(url)
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.Noti = function(APIENDPOINT,Msg,callback) {
    let url = APIENDPOINT + "api/APINoti?NotiName=Custom&AdminKey=adminitworld&Title=Notification&Msg="+Msg;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.closeFile = function( APIENDPOINT,CloseTermID,IsClose,callback) {
    let url = APIENDPOINT + "api/APITermDetail?CloseTermID="+CloseTermID+"&IsClose="+IsClose;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.cleanFile = function( APIENDPOINT,CleanTermID,callback) {
    let url = APIENDPOINT + "api/APITermDetail?CleanTermID="+CleanTermID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getTermsForClean = function(APIENDPOINT, callback) {
    let url = APIENDPOINT + "api/apiTerm?IsClean=1";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getAllTerms = function(APIENDPOINT, callback) {
    let url = APIENDPOINT + "api/APITermDetail?";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
//Users
module.exports.updateUser = function(APIENDPOINT,AgentID,UserID,UserNo,Password,PhoneNo,Prize2D,Prize3D,Discount2D,Discount3D,
    OtherDiscount,IsCustomer,Permission,NRC, callback) {
    let url = APIENDPOINT + "api/APIUser?IsUpdate=True&IsAndroid=True";
    let data={
        UserID:UserID,
        AgentID:AgentID,
        UserNo:UserNo,
        Password:Password,
        PhoneNo:PhoneNo,
        Prize2D:Prize2D,
        Prize3D:Prize3D,
        Discount2D:Discount2D,
        Discount3D:Discount3D,
        OtherDiscount:OtherDiscount,
        IsCustomer:IsCustomer,
        Permission:Permission,
        NRC:NRC
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveAgent = function(APIENDPOINT,AgentID,UserNo,Password,PhoneNo,Prize2D,Prize3D,Discount2D,Discount3D,
    OtherDiscount,IsCustomer,Permission,NRC, callback) {
    let url = APIENDPOINT + "api/APIUser?IsAndroid=true&IsAgentOwner=true";
    let data={
        AgentID:AgentID,
        AgentName:null,
        UserNo:UserNo,
        Password:Password,
        PhoneNo:PhoneNo,
        Prize2D:Prize2D,
        Prize3D:Prize3D,
        Discount2D:Discount2D,
        Discount3D:Discount3D,
        OtherDiscount:OtherDiscount,
        IsCustomer:IsCustomer,
        Permission:Permission,
        NRC:NRC
    }
    console.log(data)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.saveUser = function(APIENDPOINT,AgentID,UserNo,Password,PhoneNo,Prize2D,Prize3D,Discount2D,Discount3D,
    OtherDiscount,IsCustomer,Permission,NRC, callback) {
    let url = APIENDPOINT + "api/APIUser?IsAndroid=True";
    let data={
        AgentID:AgentID,
        UserNo:UserNo,
        Password:Password,
        PhoneNo:PhoneNo,
        Prize2D:Prize2D,
        Prize3D:Prize3D,
        Discount2D:Discount2D,
        Discount3D:Discount3D,
        OtherDiscount:OtherDiscount,
        IsCustomer:IsCustomer,
        Permission:Permission,
        NRC:NRC
    }
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:data
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getUserById = function(APIENDPOINT,UserID, callback) {
    let url = APIENDPOINT + "api/apiUserByID?UserID="+UserID+"&IsAndroid=true";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.checkSMS = function(APIENDPOINT,UserID,TermDetailID,bodySMS, callback) {
    var url =APIENDPOINT + "api/APILedger?TermDetailID="+TermDetailID+"&UserID="+UserID;


    //console.log("Body "+bodySMS)

    var options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },      
        body:JSON.stringify({
            bodySMS:bodySMS
         }),
        
    };;
    fetch(url, options)
    .then((response) => response.text())
    .then((responseText) => {
        try {
            callback(null, JSON.parse(responseText));
        }
        catch (jsonError) {
            callback(jsonError, null);
        }

    })
    .catch((error) => {
        callback(error, null);
    });
}
module.exports.setAgent = function(APIENDPOINT,AgentID,AgentName,Prize2D,Prize3D,Discount2D,Discount3D,
    OtherDiscount,Status, callback) {
    let url = APIENDPOINT + "api/apiAgent?Status="+Status+"&Password=admintzt";
    console.log(url)
    let data={
        AgentID:AgentID,
        AgentName:AgentName,
        Prize2D:Prize2D,
        Prize3D:Prize3D,
        Discount2D:Discount2D,
        Discount3D:Discount3D,
        OtherDiscount:OtherDiscount,
    }
    console.log(data)
    axios({
        method: 'post',
        url: url,
        //timeout: 8000,
        data:{
            Data:[data],
            Status:Status
        }
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getAgents = function( APIENDPOINT,callback) {
    let url = APIENDPOINT + "api/apiAgent?";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.deleteUser = function(APIENDPOINT,DeleteUserID, callback) {
    let url = APIENDPOINT + "api/apiUser?DeleteUserID="+DeleteUserID;
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getAllUsersByAgent = function(APIENDPOINT,agentid,callback) {
    var url = APIENDPOINT + "api/apiUser?agentid="+agentid;

    var options = {
    };

    fetch(url, options)
        .then((response) => response.text())
        .then((responseText) => {
            try {
                callback(null, JSON.parse(responseText));
            }
            catch (jsonError) {
                callback(jsonError, null);
            }

        })
        .catch((error) => {
            callback(error, null);
        });
}
module.exports.getAllUsers = function(APIENDPOINT, callback) {
    let url = APIENDPOINT + "api/apiUser?";
    axios({
        method: 'get',
        url: url,
        timeout: 8000,
    }).then((response) =>{
        callback(null, response.data)
    }
    ).catch(function (error) {
        callback(error, null);
    });
}
module.exports.getRandomColor = function() {
    let letters = '0123456789ABCDEF';
    let color   = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
module.exports.getGreeting=function(){
    let today = new Date()
    let curHr = today.getHours()

    if (curHr < 12) {
        return 'မင်္ဂလာနံနက်ခင်းပါ'
    } else if (curHr < 15) {
        return'မင်္ဂလာနေ့လည်ခင်းပါ'
    } else if (curHr < 19) {
        return'မင်္ဂလာညနေခင်းပါ'
    }
    else {
        return 'မင်္ဂလာညခင်းပါ'
    }
}
