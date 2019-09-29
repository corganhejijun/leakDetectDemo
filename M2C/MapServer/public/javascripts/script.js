"use strict";
var dataServer = 'http://127.0.0.1:8000/';
function DataGenerater(param, interval){
    var gs = new Object();
    gs.param = JSON.stringify(param);
    // interval in second
    gs.interval = interval;

    function timedCount(callback){
        var t;
        $.ajax({
            type: "get",
            dataType: "jsonp",
            jsonp: 'callback',
            jsonpCallback: 'flightHandler',
            crossDomain: true,
            url: dataServer + 'services', 
            data: {
                param: gs.param
            },
            success: function(data){
                callback(data);
            }
        });
        if (interval > 0){
            t=setTimeout(function(){
                    timedCount(callback);
                }, gs.interval*1000);
        }
    }

    gs.getJson = function gs_getJson(callback){
        timedCount(callback);
    }
    return gs;
}

function gs_createDraw(id, data, option){
    var dom = document.getElementById(id);
    var myChart = echarts.init(dom);
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
    return myChart;
}

// 获取url参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if(r != null) {
        return unescape(r[2]); 
    }
    return null;
}

Date.prototype.Format = function (fmt) {
  var o = {
    "y+": this.getFullYear(),
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "h+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S+": this.getMilliseconds()             //毫秒
  };
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)){
      if(k == "y+"){
        fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
      }
      else if(k=="S+"){
        var lens = RegExp.$1.length;
        lens = lens==1?3:lens;
        fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1,lens));
      }
      else{
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
  }
  return fmt;
}
