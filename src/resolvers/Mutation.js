const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { APP_SECRET, getUserId, calculateAge } = require('../utils')

//creates a log item
//args: workout id, athlete id
async function athleteLogWorkout(parent, args, { req, prisma }, info) {
    // if(!req.user) throw new Error('Not authenticated')

    const athlete = await prisma.athlete({ id: args.athleteId })
    const workout = await prisma.workout({ id: args.workoutId } )
    
    const logItem = await prisma.createLogItem({
        workout: { connect: { id: workout.id } },
        athlete: { connect: { id: athlete.id } },
        comment: args.comment,
        percentCompleted: args.percentCompleted,
        rpe: args.rpe,
        difficulty: args.difficulty
    })

    //add log item to athlete
    const updatedAthlete = await prisma.updateAthlete({
        logBook: {
            connect: { id: logItem.id }
        }
    })

    return updatedAthlete
}

//args: workout id, athlete id
//returns: updated athlete
async function assignWorkoutToAthlete(parent, args, { req, prisma }, info) {
    //check if user on req
    //if(!req.user) throw new Error('Not authenticated')

    //TODO: verify user is coach with permissions

    //update athlete workouts with new workout
    const updatedAthlete = await prisma.updateAthlete({
        where: { id: args.athleteId },
        data: {
            workouts: {
                connect: { id: args.workoutId }
            }
        }
    })

    //return updated athlete
    return updatedAthlete
}

async function createWorkout(parent, args, { req, prisma }, info) {

    //BROKEN: does not return expected values after mutation runs
    //data is still set to the db and is queryable from the getTeamById query

    //validate user
    if(!req.user) throw new Error('Not Authenticated')

    //find the team the user is on
    const team = await prisma.user({id: req.user.id}).team()
    
    //create workout
    const workout = await prisma.createWorkout({
        createdBy: { connect: { id: req.user.id } },
        team: { connect: { id: team.id } },
        ...args
    })
    
    //add workout to the team library
    const updatedTeam = await prisma.updateTeam({
        library: {
            connect: { id: workout.id }
        }
    })

    return workout
}

async function signupUser(parent, args, { prisma }, info) {
    //1: check is passwords are valid
    if(args.password !== args.confirmPassword) throw new Error('Passwords do not match')
    //2: hash password if they match
    const password = await bcrypt.hash(args.password, 10)
    //3: get team
    const team = await prisma.team({ id: args.teamId })
    //4: check team key matches
    if(args.teamKey !== team.teamKey) throw new Error('Invalid team key')
    //calculate age
    const age = calculateAge(args.dob)
    //5: check if coach key matches
    if(args.coachKey == team.coachKey){
        //6: if coach key matches create a user
        const user = await prisma.createUser({
            fullName: args.fullName,
            email: args.email,
            phoneNumber: args.phoneNumber,
            DOB: args.dob,
            age,
            password,
            team:{ connect: { id: team.id } },
            userType: 'COACH',
            permissions: {set: ['POST']},
         })
        // create coach with that user account and assign coach to coach column in db
        const coach = await prisma.createCoach({
            user: { connect: { id: user.id } },
            team: { connect: { id: team.id }}
        })

        const token = jwt.sign({ user: user.id }, APP_SECRET, { expiresIn: '30d'})

        return { user, token }
    } else {
        //7: create athlete account if coach key fails
        const user = await prisma.createUser({
            fullName: args.fullName,
            email: args.email,
            phoneNumber: args.phoneNumber,
            DOB: args.dob,
            age,
            password,
            team:{ connect: { id: team.id } },
            userType: 'ATHLETE',
            permissions: { set: ['POST']}
         })

         const athlete = await prisma.createAthlete({
             user: { connect: { id: user.id }},
             team: { connect: { id: team.id }}
            })
            //TODO: send confirmation email
            
            //9: create token
            const token = jwt.sign({ user: user.id }, APP_SECRET, { expiresIn: '30d'})
            
            //9: return user and token
            return { user, token }
    }
}

async function loginUser(parent, args, ctx, info) {
    const user = await ctx.prisma.user({ email: args.email }, info)
    if(!user) throw new Error('No user found with this email')
    console.log(user)

    const valid = bcrypt.compare(args.password, user.password)
    if(!valid) throw new Error('Incorrect password')

    const token = jwt.sign({ user: user.id }, APP_SECRET, { expiresIn: '30d'})

    ctx.res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365
    })

    return { user, token }
}

async function createCoach(parent, args, { prisma }, info){
    const user = await prisma.user({ id: args.userId })
    const team = await prisma.team({ id: args.teamId})

    if(team.coachKey !== args.coachKey){
        throw new Error('Coach key inalid.')
    }


}

async function createAthlete(parent, args, { prisma }, info){
    const user = await prisma.user({ id: args.id })
}


async function requestReset(parent, args, { prisma }, info) {
    //check if user
    const user = prisma.user({ email: args.email })
    if(!user) throw new Error('No user found with this email')
    //assing reset info to user
    const randomBytesPromiseified = promisify(randomBytes)
    const resetToken = (await randomBytesPromiseified(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
    const res = await prisma.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    //TODO: send email with reset link

    return { message: 'Nice'}
}

async function resetPassword(parent, args, { prisma }, info) {
    if(args.password !== args.confirmPassword) throw new Error('Passwords dont match')

    const [user] = prisma.user({
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
    })

    if(!user) throw new Error('Token has expired')

    const password = await bcrypt.hash(args.password, 10)

    const updatedUser = prisma.updateUser({ 
        where: { email: user.email },
        data: {
            password,
            resetToken: null,
            resetTokenExpiry: null
        }
    })

    const token = jwt.sign({ user: user.id }, APP_SECRET, { expiresIn: '30d'})

    return { updatedUser, token }
}

async function createTeam(parent, args, context, info) {
    const team = await context.prisma.createTeam({...args})

    return {
        team,
    }
}

async function createPost(parent, args, { user, prisma }, info) {

    if(!user) {
        throw new Error('Not authenticated')
    }

    return prisma.createPost({
        title: args.title,
        content: args.content,
        postedBy: { connect: { id: user.coachId } }
    })
}

async function createAthleteStats(parent, args, { user, prisma }, info) {

    const stats = await prisma.createAthleteStats({
        ...args,
        athlete: { connect: { id: args.athlete } }
    })

    return await prisma.athlete({ id: args.athlete })
}


async function createSubTeam(parent, args, { user, prisma }, info) {
    
    return await prisma.createSubTeam({
        ...args,
        parentTeam: { connect: { id: args.parentTeam }},
        headCoach: { connect: { id: user.headCoachId }}
    })
}

module.exports = {
    createTeam,
    signupUser,
    loginUser,
    createPost,
    createAthleteStats,
    createSubTeam,
    createWorkout,
    assignWorkoutToAthlete,
    athleteLogWorkout
}

