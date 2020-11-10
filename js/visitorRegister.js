$(function(){
	openReader();
	layui.use("layer",function(){
		var layer=layui.layer;
	})
})
setInterval(function(){
	getTime();
},1000)
//点击遮罩关闭弹出层
$(".shadow").click(function(){
	if(video.srcObject!=null){
		video.srcObject.getTracks()[0].stop(); //结束关闭流
	}
	media=0;
	$(".shadow").fadeOut(100);
	$("#faceBox").fadeOut(100);
})
//点击重新比对
$(".reComparison").click(function(){
	$(".shadow").fadeIn(100);
	$("#faceBox").fadeIn(100);
	if(media==0){
		if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
	        //调用用户媒体设备, 访问摄像头
	        getUserMedia({ video: { width: 533, height: 432 } }, success, error);
	        media=1;
	    } else {
	        alert('不支持访问用户媒体');
	    }
	}
})

//点击确认提交
$(".save").click(function(){
	if(video.srcObject==null){
		layer.msg("请连接摄像头！",{time:2000});
		return;
	}
	context.drawImage(video, 27,60,433,370,0,0,533,432);
	// 获取图片base64链接
	var image = canvas.toDataURL('image/png');
	$("#scenePhoto").attr("src",image);
	$(".shadow").fadeOut(100);
	$("#faceBox").fadeOut(100);
	
})
//进出记录
function getTime() {
   var date = new Date();
   var seperator1 = "-";
   var year = date.getFullYear();
   var month = date.getMonth() + 1;
   var strDate = date.getDate();
   var hour = date.getHours(); //得到小时
   var minu = date.getMinutes(); //得到分钟
   var sec = date.getSeconds(); //得到秒
   if (hour < 10) hour = "0" + hour;
   if (minu < 10) minu = "0" + minu;
   if (sec < 10) sec = "0" + sec;
   if (month >= 1 && month <= 9) {
       month = "0" + month;
   }
   if (strDate >= 0 && strDate <= 9) {
       strDate = "0" + strDate;
   }
   var currentdate = year + seperator1 + month + seperator1 + strDate+" "+hour + ":" + minu + ":" + sec;
   $("#nowTime").html(currentdate);
}

var stream;
var media=0;
//访问用户媒体设备的兼容方法
function getUserMedia(constraints, success, error) {
    if (navigator.mediaDevices.getUserMedia) {
        //最新的标准API
        navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    } else if (navigator.webkitGetUserMedia) {
        //webkit核心浏览器
        navigator.webkitGetUserMedia(constraints, success, error)
    } else if (navigator.mozGetUserMedia) {
        //firfox浏览器
        navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
        //旧版API
        navigator.getUserMedia(constraints, success, error);
    }
}

let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');	

function success(stream) {
    //兼容webkit核心浏览器
    let CompatibleURL = window.URL || window.webkitURL;
    //将视频流设置为video元素的源   
    stream = stream;
    //video.src = CompatibleURL.createObjectURL(stream);
    video.srcObject = stream;
    video.play();
}

function error(error) {
    console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
}

//读取身份证
var timer=setInterval(function(){
    	readIDCard();
    }, 1000);
var socket;
function openReader() {
    var host = "ws://localhost:33666";
    if (socket == null) {
        socket = new WebSocket(host);
    } else {
        console.log("已初始化.");
    }
    try {
        socket.onopen = function() {
            console.log("初始化成功.");
			$(".online").show();
			$(".outline").hide();
            //getVersion(); 
        };
        socket.onclose = function() {
            console.log("读卡服务已经断开.");
			$(".outline").show();
			$(".online").hide();
        };
        socket.onerror = function() {
            console.log("请检查控件是否正常安装.");
			$(".outline").show();
			$(".online").hide();
        };
        socket.onmessage = function(msg) {
            if (typeof msg.data == "string") {
                var msgM = msg.data + "";
                var msgJson = JSON.parse(msgM);
                //resultMsg(msgM);        
                switch (msgJson.fun) {

                    case "EST_GetVersion#":
                        layer.msg("版本号：" + msgJson.errMsg, { time: 2000 })
                        break;

                    case "EST_Reader_ReadIDCard#":
                        if (msgJson.rCode == "0") {
                         	//判断摄像头是否被调用
                         	if(media==0){
                         		if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
                                    //调用用户媒体设备, 访问摄像头
                                    getUserMedia({ video: { width: 533, height: 432 } }, success, error);
                                    media=1;
                                } else {
                                    alert('不支持访问用户媒体');
                                }
                         	}
							var effectData=dateTo(msgJson.effectData);
							var expire=dateTo(msgJson.expire);
							var birth=msgJson.birth;
							var year=birth.substring(0,4);
							var month=birth.substring(4,6);
							var date=birth.substring(6,8);
							$("#year").html(year);
							$("#month").html(month);
							$("#date").html(date)
                           $("#idName").html(msgJson.name);
						   $("#sex").html(msgJson.sex);
						   $("#nation").html(msgJson.nation);
						   $("#address").html(msgJson.address);
						   $("#idNumber").html(msgJson.certNo);
						   $("#idImg").attr("src","data:image/png;base64," + msgJson.base64Data);
						   $("#department").html(msgJson.department);
						   $("#effectData").html(effectData+"-"+expire);
						   
						   $(".shadow").fadeIn(100);
						   $("#faceBox").fadeIn(100);
						   var status=0;
						   if(status==0){
							   $("#status-success").show();
							   $("#status-failed").hide();
						   }else if(status == 1){
							   $("#status-success").hide();
							   $("#status-failed").show();
						   }
                            //console.log(msgJson);
                        } else {
                           // console.log(msgJson.errMsg);
                        }
                        break;

                    case "EST_ReadCertID#":
                        if (msgJson.rCode == "0") {
                            document.getElementById("holdercard").value = msgJson.UID;
                        } else {
                            layer.msg(msgJson.errMsg, { time: 2000 })
                        }
                        break;

                    case "EST_ReadBankCard#":
                        if (msgJson.rCode == "0") {
                            document.getElementById("text_Bank_ID").value = msgJson.bankCard;
                            posBeep();
                        } else {
                            layer.msg(msgJson.errMsg, { time: 2000 });
                        }
                        break;

                    case "EST_ReadM1Card#":
                        break;

                    case "EST_ReadSocialCard#": //社保卡信息，个别地区社保卡不按国家规范来的，会读取信息不全
                        if (msgJson.rCode == "0") {
                        } else {
                            layer.msg(msgJson.errMsg, { time: 2000 });
                        }
                        break;

                    case "EST_IDRequest#":
                        if (msgJson.rCode == "0") {
                            layer.msg("找到身份证", { time: 2000 })
                        } else {
                            layer.msg(msgJson.errMsg, { time: 2000 });
                        }
                        break;

                    default:
                        break;
                }
            } else {
                layer.msg("连接异常,请检查是否成功安装控件.", { time: 2000 });
				$(".outline").show();
				$(".online").hide();
            }
        };
    } catch (ex) {
        layer.msg("连接异常,请检查是否成功安装控件.", { time: 2000 });
		$(".outline").show();
		$(".online").hide();
    }
}

//蜂鸣器控制，可以自己选择是否蜂鸣
function posBeep() {
    if (socket.readyState == 1) {
        socket.send("EST_PosBeep#");
    } else {
        layer.msg("未找到控件，请检查控件是否安装.", { time: 2000 });
    }
}

//读取身份证信息
function readIDCard() {
        if (socket.readyState == 1) {
            socket.send("EST_Reader_ReadIDCard#");
        } else {
            //console.log("未找到控件，请检查控件是否安装.", { time: 2000 });
        }
}

function dateTo(str){
	str=str.toString();
	var str2="";
	for(var i=0;i<str.length;i++){
		if(i==4 ||i==6){
			str2+="."+str[i];
		}else{
			str2+=str[i]
		}
	}
	return str2;
}
