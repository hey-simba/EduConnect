import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;
let registeredUserId = null;

export function getSocket(userId) {
    if (userId) registeredUserId = userId;

    if (!socket) {
        socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
        socket.on('connect', () => {
            if (registeredUserId) {
                socket.emit('register', registeredUserId);
            }
        });
    } else if (userId && socket.connected) {
        socket.emit('register', userId);
    }

    return socket;
}

export function personId(person) {
    if (!person) return '';
    if (typeof person === 'string') return person;
    if (person._id) return person._id.toString();
    return String(person);
}
