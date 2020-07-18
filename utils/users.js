const users = [];

export function userJoin(socketid, userId, username, room, userPicture) {
    const user = {
        socketid,
        room,
        userId,
        username,
        userPicture,
    }
    users.push(user)
    return user
}

export function getCurrentUser(socketid) {
    return users.find(user => user.socketid === socketid)
}
export function getUserById(userId) {
    return users.find(user => user.userId == userId)
}

export function getRoomUsers(room) {
    return users.filter(user => user.room == room)
}

export function userLeave(socketid) {
    const index = users.findIndex(user => user.socketid === socketid)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
