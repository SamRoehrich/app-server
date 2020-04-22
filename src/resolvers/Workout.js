async function createdBy(parent, args, {prisma}, info) {
    return await prisma.workout({ id: parent.id }).createdBy()
}

async function team(parent, args, { prisma }, info) {
    return await prisma.workout({ id: parent.id }).team()
}

async function loggedSessions(parent, args, { prisma }) {
    return await prisma.workout({ id: parent.id }).loggedSessions()
}

module.exports = {
    createdBy,
    team,
    loggedSessions
}