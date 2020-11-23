/***********************************************************************************************************************
 * SCRIPT FOR SENSOR PAGE
 * THIS IS A PROGRAM FOR UPDATING THE WEBPAGE FOR SENSOR INFO
 * WRITTEN AS A PART OF THE SUBJECT IELEA2001
 ***********************************************************************************************************************/

/*********************************************************************
 * GLOBAL VARIABLES
 *********************************************************************/

let sensorSettings = {};

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
 *
 */
function changeSensor() {
    let newSensor = sensorOptions.value;
    console.log("Changed sensor to: " + newSensor);
    // getSensorInfo(newSensor);
    socket.emit('sensorInfo', newSensor, setSensorValues);

    // wait for new sensor settings
    //while (sensorSettings[newSensor] === undefined) {}
    console.log("new data");
}


function setSensorValues() {
    // console.log("fkdngedgr");
    let sensorName = Object.keys(sensorSettings)[0];
    sensorName.innerText = "SensorID: " + sensorName;
    if (sensorSettings[sensorName]['type'] === 'co2') {
        sensorType.innerText = 'CO2:'
        sensorFunction.innerText = 'Luftkvalitet';

    } else {
        sensorType.innerText = 'Temperatur:';
        if (sensorSettings[sensorName]['controlType'] === "reversed") {
            sensorFunction.innerText = 'Varme';
        } else {
            sensorFunction.innerText = 'Kjøling';
        }
    }
    sensorSetpoint.innerText = sensorSettings[sensorName]['setpoint'];
    robotID.innerText = sensorSettings[sensorName]['unit'];

}