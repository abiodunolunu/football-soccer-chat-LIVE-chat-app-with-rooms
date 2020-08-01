let io;
import socketio from 'socket.io'

export default {
    init: (httpServer) => {
        io = socketio(httpServer)
        return io
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io is not initialized')
        }
        return io
    }
}