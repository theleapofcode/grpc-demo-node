const fs = require('fs');
const grpc = require('grpc');

const PROTO_PATH = __dirname + '/../protobuf/messages.proto';

const userServiceDef = grpc.load(PROTO_PATH);

const PORT = process.env.PORT || 3000;

const cacert = fs.readFileSync(__dirname + '/../cert/ca.crt'),
    cert = fs.readFileSync(__dirname + '/../cert/client.crt'),
    key = fs.readFileSync(__dirname + '/../cert/client.key'),
    kvpair = {
        'private_key': key,
        'cert_chain': cert
    };
const creds = grpc.credentials.createSsl(cacert, key, cert);

const client = new userServiceDef.UserService(`localhost:${PORT}`, creds);

const option = parseInt(process.argv[2], 10);

switch (option) {
    case 1:
        sendMetadata(client);
        break;
    case 2:
        getUserByEmail(client);
        break;
    case 3:
        getAllUsers(client);
        break;
    case 4:
        saveUser(client);
        break;
    case 5:
        saveAllUsers(client);
        break;
    case 6:
        addPhoto(client);
        break;
}

function sendMetadata(client) {
    const md = new grpc.Metadata();
    md.add('username', 'theleapofcode');
    md.add('password', 'avengersassemble');

    client.getUserByEmail({}, md, function () { });
}

function getUserByEmail(client) {
    client.getUserByEmail({ email: 'ironman@avengers.com' }, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(response.user);
        }
    });
}

function getAllUsers(client) {
    const call = client.getAllUsers({});

    call.on('data', function (data) {
        console.log(data.user);
    });
}

function saveUser(client) {
    client.saveUser({
        user: {
            id: 4,
            firstName: 'Thor',
            lastName: 'Odinson',
            email: 'thor@avengers.com'
        }
    }, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log(response.user);
        }
    });
}

function saveAllUsers(client) {
    const users = [
        {
            id: 5,
            firstName: 'Clint',
            lastName: 'Barton',
            email: 'hawkeye@avengers.com'
        },
        {
            id: 6,
            firstName: 'Natasha',
            lastName: 'Romonov',
            email: 'blackwidow@avengers.com'
        }
    ];

    const call = client.saveAllUsers();
    call.on('data', function (user) {
        console.log(user.user);
    });
    users.forEach(function (user) {
        call.write({ user: user });
    });
    call.end();
}

function addPhoto(client) {
    const md = new grpc.Metadata();
    md.add('email', 'ironman@avengers.com');

    const call = client.addPhoto(md, function (err, result) {
        console.log(result);
    });

    const stream = fs.createReadStream(__dirname + '/ironman.png');
    stream.on('data', function (chunk) {
        call.write({ data: chunk });
    });
    stream.on('end', function () {
        call.end();
    });
}