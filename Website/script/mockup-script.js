const serverIP = 'http://localhost:3000';
const websiteNamespace = '/webserver';


const socket = io('http://localhost:3000/webserver', {
    reconnectionDelayMax: 10000,
    //namespace: '/admin',
});

socket.on('connect', ()=> {
    console.log(socket.id);
    console.log(socket.nsp);
})

// TODO:Get all sensors that is on the robot server

// TODO: Make function to get sensor data form robotserver

// TODO: Make function to retrieve sensor-config from robotserver

// TODO: Retrieve the chosen sensor on the webpage
