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