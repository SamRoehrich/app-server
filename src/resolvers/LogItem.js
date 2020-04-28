async function workout(parent, args, { prisma }) {
    return await prisma.logItem({ id: parent.id }).workout()
}

async function athlete(parent, args, { prisma }) {
    return await prisma.logItem({ id: parent.id }).athlete()
}

async function createdAt(parent, args, { prisma }) {
    return await prisma.logItem({ id: parent.id }).createdAt()
}

module.exports = {
    workout,
    athlete,
    createdAt
}
