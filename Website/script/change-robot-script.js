/***********************************************************************************************************************
 * SCRIPT FOR SENSOR PAGE
 * THIS IS A PROGRAM FOR UPDATING THE WEBPAGE FOR SENSOR INFO
 * WRITTEN AS A PART OF THE SUBJECT IELEA2001
 ***********************************************************************************************************************/

/*********************************************************************
 * GLOBAL VARIABLES
 *********************************************************************/

let robotSettings = {};
let dataLogSettings = {
    after: 0,
    before: 0
};
let robotID;
let valueSuffix;
let logTypeIsOther;
let sensorSelectors = [];
let lastSelector;

// Used for sensor Id if there is NO sensor connected
let none = 'Ingen';
// Need to have the possibility to set a sensor to not connected
let sensorIDs = [none];

/*********************************************************************
 * DOCUMENT ELEMENTS
 *********************************************************************/
// let sensorOptions = document.getElementById("sensor-picker");
let sensorPicker = document.getElementById("sensor-picker");
// let sensorType = document.getElementById("sensor-type");
let robotOptions = document.getElementById("robot-picker");
let updateSetting = document.getElementById('update-robot-settings');
let robotName = document.getElementById('robot-id');
let addRobot = document.getElementById('add-robot');
let errorMessage = document.getElementById('error');
// TODO: if the unit is changed, ask if the unit config should be updated as well...
// TODO: when sensors are added to a unit, automatically add sensor as a measurement...
// TODO: If a sensor is deleted add to a deleted DB and then remove after a confirmation
// TODO: Wait for confirmation from the server after processing a request
// TODO: Sanitize data both on the server side and the client side, to ensure the change dont corrupt something

/*********************************************************************
 * MAIN PROGRAM
 *********************************************************************/

// Start a connection to the robot server, in the namespace webpage
const socket = io('http://localhost:3000/webserver', {
    // Retry the connection every 10 seconds if it fails
    reconnectionDelayMax: 10000,
});

// Monitor the dropdown menu and change the selected sensor when it is changed
robotOptions.addEventListener('change', changeRobot);
// updateTimeRange.addEventListener('click', userSpecifiedTime);
updateSetting.addEventListener('click', sendNewRobotSettings);
addRobot.addEventListener('click', setNewRobotParameters)
// sensorType.addEventListener('change', setTypeOptions)
// sensorName.addEventListener('change', setSensorTypeOptions)
// sensorFunction.addEventListener('change', checkForSetpoint)
/*********************************************************************
 * EVENT LISTENERS
 *********************************************************************/
// On the first connection to the server
socket.on('connect', () => {
    console.log(socket.id);
    console.log(socket.nsp);
    console.log('Get all sensor info');
    getAllSensors();

})

/**
 * When receiving the sensor names from the server,
 * add them to the dropdown menu
 */
socket.on('allSensors', (sensors) => {
    console.log('Received sensor names from server');
    let allSensorIds = JSON.parse(sensors);
    allSensorIds.forEach(sensor => {
        sensorIDs.push(sensor);
    });
    // Get all the robot ids
    getAllRobots();
});

socket.on('allRobots', (robots) => {
    console.log('Received sensor names from server');
    let parsedRobots = JSON.parse(robots);
    // Add all the sensor names to the dropdown menu
    addOptionsToDropdown(robotOptions, parsedRobots, parsedRobots);
});

socket.on('robotInfo', (robotInfo, callback) => {
    let parsedRobotInfo = JSON.parse(robotInfo);
    robotID = Object.keys(parsedRobotInfo)[0]
    console.log("Received sensor settings for robot " + robotID);
    robotSettings = parsedRobotInfo;
    if (callback) callback();
});


/**
 * Function to get all the sensor names from the server
 */
function getAllSensors() {
    socket.emit('allSensors', true);
}

/**
 * Function to get all the robot names from the server
 */
function getAllRobots() {
    socket.emit('allRobots', true);
}

/**
 * Function to add multiple options to a dropdown selector.
 * All the opt
 * @param dropdown      The dropdown element
 * @param optionsToAdd  Array containing all the options to add
 * @param optionNames   The display text for the option
 * @param removePrevious
 * @param callback      Runs after all options has been added
 */
function addOptionsToDropdown(dropdown, optionsToAdd, optionNames,removePrevious, callback) {
    if (removePrevious) {
        let optionsNumber = dropdown.options.length - 1
        while (dropdown.options.length > 0){
            dropdown.remove(0)
        }
    }
    optionsToAdd.forEach((option, index, array) => {
        // Make a new option
        let newOption = document.createElement('option');
        // Add a display text for the option
        newOption.appendChild(document.createTextNode(option));
        // Assign the value for the option to the same as the display text
        newOption.value = option;
        newOption.innerText = optionNames[index];
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
function changeRobot() {
    // Get the new sensor ID from the dropdown menu
    let newRobot = robotOptions.value;
    console.log("Changed robot to: " + newRobot);
    // getSensorInfo(newSensor);
    // Get the new sensor information. The callback is run when the sensor data is received
    socket.emit('robotInfo', newRobot, setRobotValues);
    // Empty last values in newest sensor values

    // document.getElementById('sensor-page').style.display = 'inline-flex';
}

/**
 * Function to set new sensor info, on the summary part of the page
 */
function setRobotValues() {
    robotName.value = robotID
    addSensors();
}

function removePreviousLines() {
    sensorSelectors = [];
    // Remove all the previous sensors
    let line = document.getElementsByClassName('info-line');
    while (line.length > 0) {
        line[0].parentNode.removeChild(line[0])
    }
}

function addSensors(){
    let sensorsConnected = robotSettings[robotID];

    sensorsConnected.push(none);
    removePreviousLines();

    sensorsConnected.forEach((sensor) => {
        addSensorToLine(sensor);
    })

    setListenerForSensor();
}

function setListenerForSensor(){
    let lastSensor = sensorSelectors[sensorSelectors.length - 1];
    lastSelector = document.getElementById(lastSensor);
    lastSelector.addEventListener('change', addNewSensor);
}

function addNewSensor(){
    if (lastSelector.value !== none){
        addSensorToLine(none);
        setListenerForSensor();
    }
}

function sendNewRobotSettings(){
    let sensorIDs = []
    sensorSelectors.forEach(sensor => {
        let sensorID = document.getElementById(sensor).value;
        if (!(sensorID === none)) {
            sensorIDs.push(sensorID);
        }
    })
    if (checkIDs(sensorIDs)){
        console.log(sensorIDs)
        let settingToSend = {}
        settingToSend[robotID] = sensorIDs;
        errorMessage.innerText = "";
        if (confirm("Bekreft at du vil sende innstillingene!")) {
            socket.emit('newRobotSettings', JSON.stringify(settingToSend));
            console.log(settingToSend);
        }
    } else {
        errorMessage.innerText = "Kan ikke lagre disse innstillingene!"
    }
}

/**
 * Function to check all the sensor ids given are valid.
 * There should never occur any problems with the validation,
 * since the sensorIds are given from the server.
 * Only here as a backup. Returns true if the names are OK.
 * @param sensors - the array of the sensorIDs
 * @return {boolean}
 */
function checkIDs(sensors){
    let regexForID = new RegExp('^[a-zA-Z0-9#]+$'); // Ids can only contain letters and numbers (and #)
    let sensorsNotOk = false;
    let robotIdOK = false;
    sensors.forEach(name => {
        if (!regexForID.test(name)) {
            sensorsNotOk = true;
        }
    });
    if (regexForID.test(robotID) && robotID !== undefined) {
        robotIdOK = true;
    }
    return (!sensorsNotOk) && robotIdOK;
}

function addSensorToLine(sensor) {
    // The length of the array is the last index +1
    let lastSensor = sensorSelectors.length;
    let newSensorOption = document.createElement('div')
    newSensorOption.setAttribute('class', 'info-line');

    // Create the sensor description
    let description = document.createElement('p');
    description.innerText = 'Sensor ' + (lastSensor + 1) + ':';
    description.setAttribute('class', 'info-text');

    let select = document.createElement('select');
    let selectId = 'sensor' + lastSensor;
    sensorSelectors.push(selectId);
    addOptionsToDropdown(select, sensorIDs, sensorIDs);
    select.value = sensor;
    select.setAttribute('id', selectId);
    select.setAttribute('class', 'info-box');
    newSensorOption.appendChild(description);
    newSensorOption.appendChild(select);
    sensorPicker.appendChild(newSensorOption);
}

function setNewRobotParameters(){
    removePreviousLines();
    robotName.disabled = false;
    robotName.addEventListener("change", function(){robotID = robotName.value});
    addSensorToLine(none);
    setListenerForSensor();
}