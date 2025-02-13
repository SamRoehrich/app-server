const jwt = require('jsonwebtoken')

const APP_SECRET = 'fuckteamtexas'

function getUserId(context) {
    const Authoriztion = context.req.get('Authorization')
    if(Authoriztion) {
        const token = Authoriztion.replace('Bearer', '')
        const { userId } = jwt.verify(token, APP_SECRET)
        return userId
    }
    throw new Error('user not authenticated')
}

function calculateAge(dob) {
    return new Date.getFullYear() - dob.split('/')[2]
}

module.exports = {
    APP_SECRET,
    getUserId,
    calculateAge
}
