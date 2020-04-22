async function workout(parent, args, { prisma }) {
    return await prisma.logItem({ id: parent.id }).workout()
}

async function athlete(parent, args, { prisma }) {
    return await prisma.logItem({ id: parent.id }).athlete()
}

module.exports = {
    workout,
    athlete
}