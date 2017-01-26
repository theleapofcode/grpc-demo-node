# grpc-demo-node
gRPC demo on Node.js which includes

1. SSL/TLS based secure communication using HTTP/2
2. Unary call
3. Server streaming
4. Client streaming
5. Bi-directional streaming
6. Binary data communication

## Steps to run

1. Generate server and client certificates
    `cd cert`
    `./generatecerts.sh` 
2. Run the server - `node server/server.js`
3. Run the client with different options - `node client/client.js <option>`,
    1 - sendMetadata
    2 - getUserByEmail
    3 - getAllUsers
    4 - saveUser
    5 - saveAllUsers
    6 - addPhoto


