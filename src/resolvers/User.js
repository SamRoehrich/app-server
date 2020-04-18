async function team(parent, args, { prisma }) {
    return await prisma.user({ id: parent.id }).team()
}

module.exports = {
    team
}