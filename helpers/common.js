var fs              = require("fs");
var isPi            = require('detect-rpi');
var moment          = require('moment');
var os              = require('os');
const prettyBytes   = require('pretty-bytes');
var cpuStat         = require('cpu-stat');
//const disk          = require('diskusage');
const util = require('util');

var logAirQuality = function (maxLogCount, socket, airQuality) {
    var time = moment().format('YYYY-MM-DD hh:mm:ss');
    var logPath = __dirname + "/../cpuAirQualityLog.txt";
    
    var array = [];
    if(fs.existsSync(logPath))
    {
        array = fs.readFileSync(logPath).toString().split('\r\n');
    }

    var dataArr = [time, parseFloat(airQuality)];   
    var data = "['" + time + "', " + airQuality + "], "
    var newLength = array.push(data);
    //remove oldest item if there are more than {maxLogCount} logs
    if(newLength > maxLogCount){
        array = array.shift();
    }
    var fileContent = '';
    for(i = 0; i < array.length; i++){
        fileContent = fileContent + array[i] + "\r\n";
    }
    fs.writeFileSync(logPath, fileContent);  
    socket.emit('refresh-airquality',airQuality, dataArr);

    return array.length;            
}

var logAirHumidity = function (maxLogCount, socket, humidity) {
    var time = moment().format('YYYY-MM-DD hh:mm:ss');
    var logPath = __dirname + "/../cpuHumidityLog.txt";
    
    var array = [];
    if(fs.existsSync(logPath))
    {
        array = fs.readFileSync(logPath).toString().split('\r\n');
    }

    var dataArr = [time, parseFloat(humidity)];   
    var data = "['" + time + "', " + humidity + "], "
    var newLength = array.push(data);
    //remove oldest item if there are more than {maxLogCount} logs
    if(newLength > maxLogCount){
        array = array.shift();
    }
    var fileContent = '';
    for(i = 0; i < array.length; i++){
        fileContent = fileContent + array[i] + "\r\n";
    }
    fs.writeFileSync(logPath, fileContent);  
    socket.emit('refresh-humidity',humidity, dataArr);

    return array.length;            
}

var logCurrentCPUTemperature = function (maxLogCount, socket) {
    var time = moment().format('YYYY-MM-DD hh:mm:ss');
    var logPath = __dirname + "/../cpuTempLog.txt";
    var temperature = readCPUTemperature();
    
    var array = [];
    if(fs.existsSync(logPath))
    {
        array = fs.readFileSync(logPath).toString().split('\r\n');
    }

    var dataArr = [time, parseFloat(temperature)];   
    var data = "['" + time + "', " + temperature + "], "
    var newLength = array.push(data);
    //remove oldest item if there are more than {maxLogCount} logs
    if(newLength > maxLogCount){
        array = array.shift();
    }
    var fileContent = '';
    for(i = 0; i < array.length; i++){
        fileContent = fileContent + array[i] + "\r\n";
    }
    fs.writeFileSync(logPath, fileContent);  
    socket.emit('refresh-temperature',temperature, dataArr);
    var memoryPercentage = ((os.freemem() / os.totalmem())*100).toFixed(0);
    socket.emit("refresh-memory", memoryPercentage);
    
    cpuStat.usagePercent({
        coreIndex: -1,
        sampleMs: 2000,
    },
    function(err, percent, seconds) {
        socket.emit("refresh-cpu", percent.toFixed(0));
    });  
    
    /*var diskInfo = getDiskInfo();
    if(null != diskInfo){
        var used = diskInfo.total - diskInfo.available;
        var percentage = ((used / diskInfo.total)*100).toFixed(0);
        socket.emit('refresh-diskinfo', percentage, prettyBytes(diskInfo.available), prettyBytes(used), prettyBytes(diskInfo.total));
    }*/
    return array.length;            
}

/*var getDiskInfo = function (){
    var path = os.platform() === 'win32' ? 'c:' : '/';
    try{
        var info = disk.checkSync(path);
        return info;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}*/


var readCPUTemperature = function () {
    if(!isPi()){
        temperature = (Math.random() * 100).toFixed(2);
    }
    else{
        temperature = parseFloat(fs.readFileSync("/sys/class/thermal/thermal_zone0/temp")).toFixed(2) / 1000;
    }
    
    return temperature;            
}

module.exports.readCPUTemperature = readCPUTemperature;
module.exports.logCurrentCPUTemperature = logCurrentCPUTemperature;
module.exports.logAirQuality = logAirQuality;
module.exports.logAirHumidity = logAirHumidity;
//module.exports.getDiskInfo = getDiskInfo;
