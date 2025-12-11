
import { io } from 'socket.io-client';

// This should point to your backend server.
const SOCKET_URL = 'http://localhost:3006';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket']
});
