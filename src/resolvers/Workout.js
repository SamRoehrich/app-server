async function createdBy(parent, args, {prisma}, info) {
    return await prisma.workout({ id: parent.id }).createdBy()
}

async function team(parent, args, { prisma }, info) {
    return await prisma.workout({ id: parent.id }).team()
}

module.exports = {
    createdBy,
    team,
}