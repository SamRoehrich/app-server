const { calculateAge } = require('../utils')

async function getAthleteGeneralInfo(parent, agrs, { prisma }, info) {
    const athlete = await prisma.athlete({ id: args.id })
    const age = calculateAge(athlete.dob)
    const ageCatagory = calculateAgeCatagory(age)
}

async function getAllWorkouts(parent, args, { prisma }, info) {
    //BROKEN: query does not resolve TEAM
    return await prisma.workouts()
}

async function getAllTeams(parent, args, { prisma }, info) {
    const teams = await prisma.teams()
    return teams
}

async function users(parent, args, { prisma }, info) {
    const users = await prisma.users()

    return users
}

async function getUser(parent, args, ctx, info) {
    const user = await ctx.prisma.user({ email: args.email })

    return {
        user
    }
}

async function getAthleteById(parent, args, { prisma }, info) {
    const athlete = await prisma.athlete({ id: args.id })

    return athlete
}

async function currentUser(parent, args, { req, prisma }, info) {
    if(!req.user) throw new Error('Not Authenticated')

    const user = await prisma.user({ id: req.user.id })

    return user
}

async function getTeamById(parent, args, { prisma }, info) {

    const team  = await prisma.team({ id: args.id })

    return team
}

async function getAthletes(parent, args, { req, prisma }, info) {
    //check if user
    if(!req.user) {
        throw new Error('Not Authenticated')
    }
    const user = await prisma.users({ id: req.user.id })

    const athletes = await prisma.athletes({team: user.team}, info)

    return athletes
}

async function coachDetails(parent, args, { user, prisma }, info) {
    if(!user) {
        throw new Error('Not Authenticted')
    }
    console.log(user)
    return prisma.coach({ id: user.coachId })
}

module.exports = {
    users,
    getUser,
    getAllTeams,
    currentUser,
    getTeamById,
    getAthletes,
    coachDetails,
    getAthleteById,
    getAllWorkouts
}

