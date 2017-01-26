const fs = require('fs');
const grpc = require('grpc');

const PROTO_PATH = __dirname + '/../protobuf/messages.proto';

const userServiceDef = grpc.load(PROTO_PATH);

const PORT = process.env.PORT || 3000;

const users = require('./users').users;

const cacert = fs.readFileSync(__dirname + '/../cert/ca.crt'),
    cert = fs.readFileSync(__dirname + '/../cert/server.crt'),
    key = fs.readFileSync(__dirname + '/../cert/server.key'),
    kvpair = {
        'private_key': key,
        'cert_chain': cert
    };
const creds = grpc.ServerCredentials.createSsl(cacert, [kvpair]);

const server = new grpc.Server();
server.addProtoService(userServiceDef.UserService.service, {
    getUserByEmail: getUserByEmail,
    getAllUsers: getAllUsers,
    saveUser: saveUser,
    saveAllUsers: saveAllUsers,
    addPhoto: addPhoto
});

server.bind(`0.0.0.0:${PORT}`, creds);
console.log(`Starting server on port ${PORT}`);
server.start();

function getUserByEmail(call, callback) {
    const md = call.metadata.getMap();
    for (let key in md) {
        console.log(key, md[key]);
    }

    const email = call.request.email;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            callback(null, { user: users[i] });
            return;
        }
    }

    callback('error');
}

function getAllUsers(call) {
    users.forEach(function (user) {
        call.write({ user: user });
    });

    call.end();
}

function saveUser(call, callback) {
    const user = call.request.user;
    users.push(user.user);
    callback(null, { user: user });
}

function saveAllUsers(call) {
    call.on('data', function (user) {
        users.push(user.user);
        call.write({ user: user.user });
    });
    call.on('end', function () {
        users.forEach(function (user) {
            console.log(user);
        });
        call.end();
    });
}

function addPhoto(call, callback) {
    const md = call.metadata.getMap();
    for (let key in md) {
        console.log(key, md[key]);
    }
    let result = new Buffer(0);
    call.on('data', function (data) {
        result = Buffer.concat([result, data.data]);
        console.log(`Message received with size ${data.data.length}`);
    });
    call.on('end', function () {
        callback(null, { ok: true });
        console.log(`Total file size: ${result.length} bytes`);
    });
}