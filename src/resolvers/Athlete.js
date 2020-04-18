async function team(parent, args, { prisma  }) {
    return await prisma.athlete({ id: parent.id }).team()
}

async function stats(parent, args, { prisma }) {
    return await prisma.athlete({ id: parent.id }).athleteStats()
}

async function user(parent, args, { prisma }) {
    return await prisma.athlete({ id: parent.id }).user()
}

async function workouts(parent, args, { prisma }) {
    return await prisma.athlete({ id: parent.id}).workouts()
}

async function logBook(parent, args, { prisma }) {
    return await prisma.athlete({ id: parent.id }).logBook()
}

async function goals(parent, args, { prisma }) {
    return await prisma.athlete({ id: parent.id }).goals()
}
module.exports = {
    team,
    stats,
    user,
    workouts,
    logBook,
    goals
}


