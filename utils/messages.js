import moment from 'moment'

function formatMessage(username, userId, text, userPicture) {
    return {
        username,
        userId,
        text,
        userPicture,
        time: moment().format('h:mm a')
    }
}

export default formatMessage