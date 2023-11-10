
var path = require('path');
var express = require ('express');
var dotenv = require ('dotenv');
dotenv.config();
const port = 8000;
const key = "/?"+process.env.KEY_QUERY+"="
const app = express();
const url = process.env.KEY_URL;
const {log} = require("./utils");
const {getEcoFlowMqttData, setupMQTTConnection, setAC, setPrio} = require(path.resolve( __dirname, "./ecoflow.js" ) );

var clientMqtt = {};
var isMqttConnected = false;
let mqttDaten = {};
let mqttClient = {};

log("Starting app listening at port " + port);

function initMqtt() {
 
    if (isMqttConnected) {
        log("Ecoflow MQTT broker is alreasdy connected");
        return true;
    }

    log("Try to login Ecoflow MQTT broker with credential " + process.env.ACCOUNT_MAIL + ', ' + process.env.ACCOUNT_PASSWORD)

    mqttDaten = getEcoFlowMqttData(process.env.ACCOUNT_MAIL, process.env.ACCOUNT_PASSWORD)
    .then(mqttDaten => {
    
        if (mqttDaten) {
            log('recevied datas from Ecoflow MQTT broker', mqttDaten)
            setupMQTTConnection(mqttDaten)
              .then (mqttClient => {
                mqttClient.on('connect', function () {
                  log('connected to Ecoflow MQTT broker')
                  //console.log('Connecté au courtier Ecoflow MQTT');
                  clientMqtt = mqttClient
                  mqttClient.subscribe(['#'], () => {
                      log('Subscribe to Ecoflow MQTT topic #')
                  })
                  isMqttConnected = true;
              })
              mqttClient.on('error', function (err) {
                  log('Error Ecoflow MQTT broker: ' + err)
                  if (err.code == 'ENOTFOUND') {
                      log('Network error, Ecoflow MQTT broker')
                  }
              })
              mqttClient.on('close', function () {
                log('Connection closed by Ecoflow MQTT broker')
                isMqttConnected = false;
              })
              mqttClient.on('disconnect ', function () {
                log('Connection disconnect  by Ecoflow MQTT broker')
                isMqttConnected = false;
              })
              mqttClient.on('reconnect', function () {
                log('Client trying a reconnection Ecoflow MQTT broker')
              })
     
            })
            .catch();
    
        }
    
    })
    .catch();
};

app.get('/setAC', (req, res) => {

    initMqtt();

    let deviceSn = req.query['device'];
    let acPower = req.query['power'];

    if (deviceSn && acPower) {

        powerMax = parseInt(process.env.POWER_MAX)
        acPower = parseInt(acPower);

        if ((acPower<0) || (acPower>powerMax)) {
            log('power must between 0 and ' + powerMax)
            res.send('power must between 0 and ' + powerMax)
        } else {
            log('set power to ' + acPower + " Watt")
            setAC(clientMqtt, deviceSn , acPower * 10);
            res.send('success')
        }

    } else {

        log('device or power are mandatory')
        res.send('device or power are mandatory')

    }

});

app.get('/setPriority', (req, res) => {

    initMqtt();

    let deviceSn = req.query['device'];
    let priority = req.query['priority'];

    if (deviceSn && priority) {

        if ((priority*1===0 || priority*1===1)) {

            log('set priority to ' + priority)
            setPrio(clientMqtt, deviceSn, priority);
            res.send('success')

        } else {

            log('priority must be 0 or 1')
            res.send('priority must be 0 or 1')
        }

    } else {

        log('device or power are mandatory')
        res.send('device or power are mandatory')

    }

});

app.use((req, res) => {res.status(404).send('Not found!')});

if (process.env.ACCOUNT_MAIL && process.env.ACCOUNT_PASSWORD) {
 
    initMqtt();

    var server = app.listen(port, () => {
        var host = server.address().address;
        var port = server.address().port;
    });

} else {

    log('ACCOUNT_MAIL and ACCOUNT_PASSWORD are mandatory');

}