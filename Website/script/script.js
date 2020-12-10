/***********************************************************************************************************************
 * SCRIPT FOR SENSOR PAGE
 * THIS IS A PROGRAM FOR UPDATING THE WEBPAGE FOR SENSOR INFO
 * WRITTEN AS A PART OF THE SUBJECT IELEA2001
 ***********************************************************************************************************************/

/*********************************************************************
 * GLOBAL VARIABLES
 *********************************************************************/

let sensorSettings = {};
let dataLogSettings = {
    after: 0,
    before: 0
};
let sensorID;
let newestSensorValue = {
    SensorID: {},
    ControlledItemID: {}
};
let valueSuffix;
let logTypeIsOther;
// TODO change class symbol to the unit of measurement for the sensor
// TODO: Make function to get sensor data form robotserver
// TODO set the real value, last value for sensor
// TODO set the last state of the output

/*********************************************************************
 * DOCUMENT ELEMENTS
 *********************************************************************/

let sensorOptions = document.getElementById("sensor-picker");
let sensorName = document.getElementById("sensor-name");
let sensorType = document.getElementById("sensor-type");
let lastSensorValue = document.getElementById("last-sensor-value");
let sensorSetpoint = document.getElementById("sensor-setpoint");
let sensorFunction = document.getElementById("sensor-function");
let outputValue = document.getElementById("output-value");
let robotID = document.getElementById("robot-id");
// let ctx = document.getElementById('myChart').getContext('2d'); //Defines the basic graphic element of the graph
let sensorTimestamp = document.getElementById("sensor-value-time");
let outputTimestamp = document.getElementById("output-value-time");
let updateTimeRange = document.getElementById('update-time-range');

let form = document.getElementById("log-length");

/*********************************************************************
 * MAIN PROGRAM
 *********************************************************************/

// Start a connection to the robot server, in the namespace webpage
const socket = io('http://localhost:3000/webserver', {
    // Retry the connection every 10 seconds if it fails
    reconnectionDelayMax: 10000,
});

// Monitor the dropdown menu and change the selected sensor when it is changed
sensorOptions.addEventListener('change', changeSensor);
updateTimeRange.addEventListener('click', userSpecifiedTime);

form.addEventListener('change', updateGraphData);

/*********************************************************************
 * EVENT LISTENERS
 *********************************************************************/
// On the first connection to the server
socket.on('connect', () => {
    console.log(socket.id);
    console.log(socket.nsp);
    console.log('Get all sensor info');
    getAllSensors();
    // console.log('Get sensor info for sensor #####1')
    // getSensorInfo('#####1');
})

/**
 * When receiving the sensor names from the server,
 * add them to the dropdown menu
 */
socket.on('allSensors', (sensors) => {
    console.log('Received sensor names from server');
    let parsedSensors = JSON.parse(sensors);
    // Add all the sensor names to the dropdown menu
    addSensorsToDropdown(sensorOptions, parsedSensors);
});

socket.on('sensorInfo', (sensorInfo, callback) => {
    let parsedSensorInfo = JSON.parse(sensorInfo);
    sensorID = Object.keys(parsedSensorInfo)[0]
    console.log("Received sensor settings for sensor " + sensorID);
    sensorSettings = parsedSensorInfo;
    if (callback) callback();
});


socket.on('dataResponse', (data) => {
    //console.log(JSON.parse(data))
    let dataResponse = JSON.parse(data);
    console.log(dataResponse);
    // The first key in the response is the datatype
    let dataType = Object.keys(dataResponse)[0]
    // console.log()
    let sensorData = dataResponse[dataType][sensorID];
    if (!logTypeIsOther) {
        newestSensorValue[dataType] = sensorData[sensorData.length - 1]
        showNewValue();
    }
    // Show the new sensor data in the graph
    if (dataType === 'ControlledItemID') {
        updateGraph(myLineChart.data.datasets[1], sensorData, true);
        console.log('Adding data for controlled item');
        // Set last value to newest sensor value
    } else {
        updateGraph(myLineChart.data.datasets[0], sensorData, true);
        // Set last value to newest sensor value

    }
    myLineChart.update();
})

socket.on('newSensorValue', (sensorData) => {
    console.log(sensorData);
    let parsedData = JSON.parse(sensorData);
    let dataType = Object.keys(parsedData)[0];
    if (parsedData[dataType][sensorID] !== undefined) {
        // console.log("dsjhkbfskd")
        newestSensorValue[dataType] = parsedData[dataType][sensorID];
        showNewValue();
    }
})

/**
 * Function to get the sensor info for a single sensor, given the sensorID for the sensor
 * @param sensor    The ID of the sensor
 */
function getSensorInfo(sensor) {
    socket.emit('sensorInfo', sensor);
}

/**
 * Function to get all the sensor names from the server
 */
function getAllSensors() {
    socket.emit('allSensors', true);
}

/**
 * Function to add multiple options to a dropdown selector.
 * All the opt
 * @param dropdown      The dropdown element
 * @param optionsToAdd  Array containing all the options to add
 * @param callback      Runs after all options has been added
 */
function addSensorsToDropdown(dropdown, optionsToAdd, callback) {
    optionsToAdd.forEach((option, index, array) => {
        // Make a new option
        let newOption = document.createElement('option');
        // Add a display text for the option
        newOption.appendChild(document.createTextNode(option));
        // Assign the value for the option to the same as the display text
        newOption.value = option;
        // Add the option to the dropdown menu
        dropdown.appendChild(newOption);
        // Do the callback on the last cycle
        if (index === array.length) {
            if (callback) callback();
        }
    });
}

/**
 * Function for changing the sensor
 * This is used as the listening function for the dropdown menu
 */
function changeSensor() {
    // Get the new sensor ID from the dropdown menu
    let newSensor = sensorOptions.value;
    console.log("Changed sensor to: " + newSensor);
    // getSensorInfo(newSensor);
    // Get the new sensor information. The callback is run when the sensor data is received
    socket.emit('sensorInfo', newSensor, setSensorValues);
    // Empty last values in newest sensor values
    newestSensorValue = {
        SensorID: {},
        ControlledItemID: {}
    };
    // document.getElementById('sensor-page').style.display = 'inline-flex';
    document.forms["log-length"]["log-period"].value = 12;
    updateGraph(myLineChart.data.datasets[0], {}, true);
    updateGraph(myLineChart.data.datasets[1], {}, true);
    myLineChart.update();
    showNewValue()
}

/**
 * Function to set new sensor info, on the summary part of the page
 */
function setSensorValues() {
    // Set the new sensor ID to the header
    sensorName.innerText = "SensorID: " + sensorID;

    // If the sensor is measuring co2 change the function text and real value name
    if (sensorSettings[sensorID]['type'] === 'co2') {
        sensorType.innerText = 'CO2:'
        sensorFunction.innerText = 'Luftkvalitet';
        valueSuffix = ' ppm'

    } else {
        // Else set the real value to temperature and the function is ether heating or cooling
        sensorType.innerText = 'Temperatur:';
        if (sensorSettings[sensorID]['controlType'] === "reversed") {
            // The function is heating if the controller is reversed
            sensorFunction.innerText = 'Varme';
        } else {
            sensorFunction.innerText = 'Kjøling';
        }
        valueSuffix = ' °C'
    }
    if (sensorSettings[sensorID]['controlledItem'] === false){
        document.getElementById('hide-setpoint').style.display = "none"
        document.getElementById('hide-output').style.display = "none"
    } else {
        document.getElementById('hide-setpoint').style.display = "inline-flex"
        document.getElementById('hide-output').style.display = "inline-flex"
    }
    //     hideSetpoint(true)
    // } else {
    //     hideSetpoint(false)
    // }
    // Display the setpoint for the new sensor
    sensorSetpoint.innerText = sensorSettings[sensorID]['setpoint'] + valueSuffix;
    // Display the robotID for the new sensor
    robotID.innerText = sensorSettings[sensorID]['unit'];
    updateGraphData();
}


function updateGraph(graphDataset, newData, removeLast) {
    // Empty the array of data shown in the graph
    if (removeLast) graphDataset.data = [];
    try {
        newData.forEach((object) => {
            // Renames all the data points and add to new array

            graphDataset.data.push({
                y: object.value,
                t: object.time
            });

        });
    } catch (error) {
        console.log("error");
    }


    // console.log(chartData);
}

function updateGraphData() {
    // Store the number of hours to subtract from current time
    let logPeriod = parseInt(document.forms["log-length"]["log-period"].value);
    // console.log(logPeriod);
    let currentTime = Date.now();
    if (logPeriod === 0) {
        // The time is specified by the other method
        // console.log("true");
        logTypeIsOther = true;
        document.getElementById('time-picker').style.display = 'flex';

        // TODO add settings to display time selector
    } else {
        logTypeIsOther = false;
        document.getElementById('time-picker').style.display = 'none';
        // One hour is 3 600 000 milliseconds
        let oneHour = 3600000;
        // After is set by the current time minus the log period
        dataLogSettings["after"] = currentTime - (logPeriod * oneHour);
        // Get all data form the after to now (0 = now, for the data request)
        dataLogSettings["before"] = 0;
        // console.log(dataLogSettings);
        // TODO add execution of getting new sensorData and displaying in graph


    }

    let dataToSend = {
        startTime: dataLogSettings["after"],
        stopTime: dataLogSettings["before"],
        sensorID: sensorID,
        dataType: 'SensorID'
    }
    // Send data request for sensor data
    socket.emit("getData", JSON.stringify(dataToSend));
    // Send data request for the controlled item if there is one
    if (sensorSettings[Object.keys(sensorSettings)[0]]['controlledItem'] === true) {
        dataToSend.dataType = 'ControlledItemID';
        socket.emit("getData", JSON.stringify(dataToSend));
    }

}

function showNewValue() {
    // console.log(Object.keys(newestSensorValue['SensorID']).length)
    try {
        if (Object.keys(newestSensorValue['SensorID']).length === 2) {
            lastSensorValue.innerText = newestSensorValue['SensorID']['value'] + valueSuffix;
            let time = new Date(newestSensorValue['SensorID']['time']);
            // sensorTimestamp.innerText = newestSensorValue['SensorID']['time'];
            sensorTimestamp.innerText = ( //Format the timestamp to: hh:mm:ss dd/mm/yyyy
                String(time.getHours()) + ':' +
                String(time.getMinutes()).padStart(2, '0') + ':' +
                String(time.getSeconds()).padStart(2, '0') + ' ' +
                String(time.getDate()) + '/' +
                String(time.getMonth() + 1) + '/' +
                String(time.getFullYear())
            );
        }
    } catch (error) {
        console.log('Error when displaying value');
        lastSensorValue.innerText = "###";
        sensorTimestamp.innerText = "###";
    }
    try {
        if (Object.keys(newestSensorValue['ControlledItemID']).length === 2) {
            if (newestSensorValue['ControlledItemID']['value']) {
                outputValue.innerText = 'På';
            } else {
                outputValue.innerText = 'Av';
            }
            // TODO: move outside to a function
            let time = new Date(newestSensorValue['ControlledItemID']['time']);
            outputTimestamp.innerText = ( //Format the timestamp to: hh:mm:ss dd/mm/yyyy
                String(time.getHours()) + ':' +
                String(time.getMinutes()).padStart(2, '0') + ':' +
                String(time.getSeconds()).padStart(2, '0') + ' ' +
                String(time.getDate()) + '/' +
                String(time.getMonth() + 1) + '/' +
                String(time.getFullYear())
            );
        }
    } catch (error) {
        console.log('Error when displaying value');
        outputValue.innerText = '###';
        outputTimestamp.innerText = "###";
    }
}

function userSpecifiedTime(){
    let regexTimeFormat = new RegExp('^([0-1][0-9]|[2][0-3]):([0-5][0-9])$');
    let regexDateFormat = new RegExp('^(19|20)\\d\\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$')

    let fromTime = document.forms["time-picker"]["time-from"].value;
    let fromDate = document.forms["time-picker"]["date-from"].value;
    let toTime = document.forms["time-picker"]["time-to"].value;
    let toDate = document.forms["time-picker"]["date-to"].value;

    if (!regexTimeFormat.test(fromTime) || !regexTimeFormat.test(toTime)){
        alert('Bruk riktig format for tid: HH:MM');
    } else if (!regexDateFormat.test(fromDate) || !regexDateFormat.test(toDate)){
        alert('Bruk riktig format for dato: yyyy-mm-dd');
    } else {
        let startTime = new Date(fromDate +'T' + fromTime)
        let stopTime = new Date(toDate +'T' + toTime)
        if (startTime > stopTime){
            alert("Fra tiden må være før til tiden")
        } else {
            let dataToSend = {
                startTime: startTime.getTime(),
                stopTime: stopTime.getTime(),
                sensorID: sensorID,
                dataType: 'SensorID'
            }
            console.log(dataToSend)
            socket.emit("getData", JSON.stringify(dataToSend));
            if (sensorSettings[Object.keys(sensorSettings)[0]]['controlledItem'] === true) {
                dataToSend.dataType = 'ControlledItemID';
                socket.emit("getData", JSON.stringify(dataToSend));
            }
        }
    }

    console.log(regexDateFormat.test(fromDate))
    console.log(regexTimeFormat.test(toTime))
    console.log(toDate)
    console.log(regexDateFormat.test(toDate))
}

function setStylesForPage() {
// Edit the display option for every child element of the sensor page
}