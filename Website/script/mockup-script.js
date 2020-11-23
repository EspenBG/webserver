//const serverIP = 'http://localhost:3000';
//const websiteNamespace = '/webserver';


const socket = io('http://localhost:3000/webserver', {
    reconnectionDelayMax: 10000,
    //namespace: '/admin',
});

socket.on('connect', ()=> {
    console.log(socket.id);
    console.log(socket.nsp);
    console.log('Get all sensor info');
    getAllSensors();
    console.log('Get sensor info for sensor #####1')
    getSensorInfo('#####1');
})

// TODO:Get all sensors that is on the robot server
function getAllSensors () {
    socket.emit('allSensors', true);
}
socket.on('allSensors', (sensors) => {
    console.log(sensors);
});
function getSensorInfo (sensor) {
    socket.emit('sensorInfo', sensor);
}
socket.on('sensorInfo', (sensorInfo) => {
   console.log(sensorInfo);
});

// TODO: Make function to get sensor data form robotserver

// TODO: Make function to retrieve sensor-config from robotserver

// TODO: Retrieve the chosen sensor on the webpage
