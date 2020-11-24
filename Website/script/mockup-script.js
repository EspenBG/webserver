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
sensorOptions.addEventListener("change", changeSensor);

form.addEventListener('change', function () {
    // Store the number of hours to subtract from current time
    let logPeriod = parseInt(document.forms["log-length"]["log-period"].value);
    console.log(logPeriod);
    let currentTime = Date.now();
    if (logPeriod === 0){
        // The time is specified by the other method
        console.log("true");
        // TODO add settings to display time selector
    } else {
        // One hour is 3 600 000 milliseconds
        let oneHour = 3600000;
        // After is set by the current time minus the log period
        dataLogSettings["after"] = currentTime - (logPeriod * oneHour);
        // Get all data form the after to now (0 = now, for the data request)
        dataLogSettings["before"] = 0;
        console.log(dataLogSettings);
        // TODO add execution of getting new sensorData and displaying in graph
    }
});

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
    console.log("Received sensor settings for sensor " + Object.keys(parsedSensorInfo)[0]);
    sensorSettings = parsedSensorInfo;
    if (callback) callback();
});




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
}

/**
 * Function to set new sensor info, on the summary part of the page
 */
function setSensorValues() {
    // The sensorname is stored as the first key in the object
    let sensorName = Object.keys(sensorSettings)[0];
    // Set the new sensor ID to the header
    sensorName.innerText = "SensorID: " + sensorName;

    // If the sensor is measuring co2 change the function text and real value name
    if (sensorSettings[sensorName]['type'] === 'co2') {
        sensorType.innerText = 'CO2:'
        sensorFunction.innerText = 'Luftkvalitet';

    } else {
        // Else set the real value to temperature and the function is ether heating or cooling
        sensorType.innerText = 'Temperatur:';
        if (sensorSettings[sensorName]['controlType'] === "reversed") {
            // The function is heating if the controller is reversed
            sensorFunction.innerText = 'Varme';
        } else {
            sensorFunction.innerText = 'Kjøling';
        }
    }
    // Display the setpoint for the new sensor
    sensorSetpoint.innerText = sensorSettings[sensorName]['setpoint'];
    // Display the robotID for the new sensor
    robotID.innerText = sensorSettings[sensorName]['unit'];
}