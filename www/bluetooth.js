// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, resultDiv, messageInput, sendButton, disconnectButton, graphButton, graphRefreshButton */
/* global graphPage */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';

// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is Nordic's UART service
var bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

var app = {
  
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = false;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        sendButton.addEventListener('click', this.sendData, false);
        graphButton.addEventListener('click', this.showGraphPage, false);
        graphRefreshButton.addEventListener('click', this.refreshGraph, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empties the list
        ble.scan([bluefruit.serviceUUID], 5, app.onDiscoverDevice, app.onError);
        
        // if Android can't find your device try scanning for all devices
        // ble.scan([], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id;

        listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId,
            onConnect = function(peripheral) {
                app.determineWriteType(peripheral);

                // subscribe for incoming data
                ble.startNotification(deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic, app.onData, app.onError);
                sendButton.dataset.deviceId = deviceId;
                disconnectButton.dataset.deviceId = deviceId;
                resultDiv.innerHTML = "";
                app.showDetailPage();
            };

        ble.connect(deviceId, onConnect, app.onError);
    },
    determineWriteType: function(peripheral) {
        // Adafruit nRF8001 breakout uses WriteWithoutResponse for the TX characteristic
        // Newer Bluefruit devices use Write Request for the TX characteristic

        var characteristic = peripheral.characteristics.filter(function(element) {
            if (element.characteristic.toLowerCase() === bluefruit.txCharacteristic) {
                return element;
            }
        })[0];

        if (characteristic.properties.indexOf('WriteWithoutResponse') > -1) {
            app.writeWithoutResponse = true;
        } else {
            app.writeWithoutResponse = false;
        }

    },
    onData: function(data) { // data received from Arduino
        var data_array = bytesToString(data).split(',');
        var date = new Date();
        var json = JSON.stringify(
          {
            data_value: data_array[0],
            data_type: data_array[1],
            baby_name: data_array[2],
            data_date: String(date.getFullYear())+"-"+("0"+String(date.getMonth()+1)).slice(-2)+"-"+String(date.getDate())
          });
        
        //resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + json_data + "<br/>";
        resultDiv.innerHTML = resultDiv.innerHTML + "JSON: " + json + "<br/>";
        
        // construct an HTTP request
        var request = new XMLHttpRequest();
        request.open("POST", "http://192.168.43.234:8080/ariadata");
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      
        //resultDiv.innerHTML = resultDiv.innerHTML + "Request Error: " + e.message + "<br/>";
      
        request.onloadend = function () {
          resultDiv.innerHTML = resultDiv.innerHTML + "Data sent to server: " + json + "<br/>";
        };
      
        // send the collected data as JSON
        request.send(json);
      
        resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    refreshGraph: function() {
      console.log("TEST");
      updateGraph();
    },
    sendData: function(event) { // send data to Arduino

        var success = function() {
            resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + messageInput.value + "<br/>";
            resultDiv.scrollTop = resultDiv.scrollHeight;
        };

        var failure = function() {
            alert("Failed writing data to the bluefruit le");
        };

        var data = stringToBytes(messageInput.value);
        var deviceId = event.target.dataset.deviceId;

        if (app.writeWithoutResponse) {
            ble.writeWithoutResponse(
                deviceId,
                bluefruit.serviceUUID,
                bluefruit.txCharacteristic,
                data, success, failure
            );
        } else {
            ble.write(
                deviceId,
                bluefruit.serviceUUID,
                bluefruit.txCharacteristic,
                data, success, failure
            );
        }

    },
    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, app.showMainPage, app.onError);
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
        graphPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
        graphPage.hidden = false;
    },
    showGraphPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
        graphPage.hidden = false;
        updateGraph();
    },
    onError: function(reason) {
        alert("ERROR: " + JSON.stringify(reason)); // real apps should use notification.alert
    }
};
