async function athlete(parent, args, { prisma }) {
    return await prisma.goal({ id: parent.id }).athlete()
}

module.exports = {
    athlete
}