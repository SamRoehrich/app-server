async function workout(parent, args, { prisma }) {
    return await prisma.logItem({ id: parent.id }).workout()
}

module.exports = {
    workout
}