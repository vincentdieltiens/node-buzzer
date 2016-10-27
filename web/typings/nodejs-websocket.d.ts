// Type definitions for nodejs-websocket
// Project: https://github.com/sitegui/nodejs-websocket
// Definitions by: oboenikui <https://github.com/oboenikui>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
 

declare module "nodejs-websocket" {
    import tls = require('tls');
    import net = require('net');
    /**
     * Create a WebSocket server
     * @param {Object} [options] will be passed to net.createServer() or tls.createServer(), with the additional property 'secure' (a boolean)
     * @param {Function} callback will be added as 'connection' listener
     * @returns {Server}
     */
    export function createServer(callback?: (conn: Connection) => void): Server;
    export function createServer(options?: Object, callback?: (conn: Connection) => void): Server;
 
    /**
     * Create a WebSocket client
     * @param {string} URL with the format 'ws://localhost:8000/chat' (the port can be ommited)
     * @param {Object} [options] will be passed to net.connect() or tls.connect()
     * @param {Function} callback will be added as 'connect' listener
     * @returns {Connection}
     */
    export function connect(URL: string, callback?: () => void): Connection;
    export function connect(URL: string, options?: Object, callback?: () => void): Connection;
 
    /**
     * Set the minimum size of a pack of binary data to send in a single frame
     * @param {number} bytes
     */
    export function setBinaryFragmentation(bytes: number): void;
 
    /**
     * Set the maximum size the internal Buffer can grow, to avoid memory attacks
     * @param {number} bytes
     */
    export function setMaxBufferLength(bytes: number): void;
     
    /**
     * The class that represents a websocket server, much like a HTTP server
     */
    interface Server {
        /**
         * Creates a new ws server and starts listening for new connections
         * @class
         * @param {boolean} secure indicates if it should use tls
         * @param {Object} [options] will be passed to net.createServer() or tls.createServer()
         * @param {Function} [callback] will be added as "connection" listener
         * @inherits EventEmitter
         * @event listening
         * @event close
         * @event error an error object is passed
         * @event connection a Connection object is passed
         */
        constructor(secure: boolean, callback?: (conn: Connection) => void);
        constructor(secure: boolean, options?: Object, callback?: (conn: Connection) => void);
         
        /**
         * Start listening for connections
         * @param {number} port
         * @param {string} [host]
         * @param {Function} [callback] will be added as "connection" listener
         */
        listen(port: number, callback?: () => void): Server;
        listen(port: number, host?: string, callback?: () => void): Server;
         
        /**
         * Stops the server from accepting new connections and keeps existing connections.
         * This function is asynchronous, the server is finally closed when all connections are ended and the server emits a 'close' event.
         * The optional callback will be called once the 'close' event occurs.
         * @param {function()} [callback]
         */
        close(callback?: () => void): void;
         
        on(event: string, callback: Function);
        socket: tls.Server;
        connections: Connection[];
    }
 
    /**
     * The class that represents a connection, either a client-created (accepted by a nodejs ws server) or client connection. The websocket protocol has two types of data frames: text and binary. Text frames are implemented as simple send function and receive event. Binary frames are implemented as streams: when you receive binary data, you get a ReadableStream; to send binary data, you must ask for a WritableStream and write into it. The binary data will be divided into frames and be sent over the socket.
     * You cannot send text data while sending binary data. If you try to do so, the connection will emit an "error" event
     */
    interface Connection {
        /**
         * @param {(net.Socket|tls.CleartextStream)} socket a net or tls socket
         * @param {(Server|{path:string,host:string})} parentOrUrl parent in case of server-side connection, url object in case of client-side
         * @param {Function} [callback] will be added as a listener to 'connect'
         * @inherits EventEmitter
         * @event close the numeric code and string reason will be passed
         * @event error an error object is passed
         * @event text a string is passed
         * @event binary a inStream object is passed
         * @event pong a string is passed
         * @event connect
         */
        constructor(socket: net.Socket | tls.ClearTextStream, parentOrUrl: Server | { path: string, host: string }, callback?: () => void)
 
        /**
         * Send a given string to the other side
         * @param {string} str
         * @param {Function} [callback] will be executed when the data is finally written out
         */
        sendText(str: string, callback?: Function): boolean;
 
        /**
         * Request for a OutStream to send binary data
         * @returns {OutStream}
         */
        beginBinary(): boolean;
 
        /**
         * Sends a binary buffer at once
         * @param {Buffer} data
         * @param {Function} [callback] will be executed when the data is finally written out
         */
        sendBinary(data: Buffer, callback?: Function): boolean;
 
        /**
         * Sends a text or binary frame
         * @param {string|Buffer} data
         * @param {Function} [callback] will be executed when the data is finally written out
         */
        send(data: string | Buffer, callback?: Function): void;
 
        /**
         * Sends a ping to the remote
         * @param {string} [data=''] - optional ping data
         * @fires pong when pong reply is received
         */
        sendPing(data?: string | Buffer): boolean;
 
        /**
         * Close the connection, sending a close frame and waiting for response
         * If the connection isn't OPEN, closes it without sending a close frame
         * @param {number} [code]
         * @param {string} [reason]
         * @fires close
         */
        close(code: number, reason: string): void;
 
        on(event: string, callback: Function);
         
        socket: net.Socket | tls.ClearTextStream;
        server?: Server;
        readyState: number;
        outStream?: OutStream;
        path?: string;
        headers: Object;
         
        CONNECTING: number;
        OPEN: number;
        CLOSING: number;
        CLOSED: number;
    }
 
    interface OutStream {
        /**
         * @class Represents the writable stream for binary frames
         * @param {Connection} connection
         * @param {number} minSize
         */
        constructor(connection: Connection, minSize: number);
    }
}