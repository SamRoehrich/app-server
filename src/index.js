const fs = require('fs')
const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { prisma } = require('./generated/prisma-client')
const { APP_SECRET } = require('./utils.js')

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Team = require('./resolvers/Team')
const Coach = require('./resolvers/Coach')
const HeadCoach = require('./resolvers/HeadCoach')
const Athlete = require('./resolvers/Athlete')
const Post = require('./resolvers/Post')
const AthleteStats = require('./resolvers/AthleteStats')
const SubTeam = require('./resolvers/SubTeam')
const User = require('./resolvers/User')
const Workout = require('./resolvers/Workout')
const LogItem = require('./resolvers/LogItem')
const Goal = require('./resolvers/Goal')

const typeDefs = gql`${fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')}`;

const resolvers = {
    Query,
    Mutation,
    Team,
    Coach,
    Athlete,
    AthleteStats,
    HeadCoach,
    Post,
    SubTeam,
    User,
    Workout,
    LogItem,
    Goal
}

const startServer = async () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: req => ({ ...req, prisma }),
        tracing: true,
        // engine: {
        //     apiKey: ""
        // }
    })


    const app = express()

    app.use(cookieParser())

    //decode the jwt on each request
    app.use((req, res, next) => {
        const { token } = req.cookies;
        if(token) {
            const { user }  = jwt.verify(token, APP_SECRET);
            req.user = user;
        }
        next();
    })

    //add user to ctx for every request 
    app.use(async (req, res, next) => {
        if(!req.user) return next()

        const user = await prisma.user({ id: req.user })
        const team = await prisma.user({ id: req.user}).team()
        console.log(team)
        req.user = user
        next()
    })

    server.applyMiddleware({
        app,
        cors: {
            credentials: true,
            origin: 'http://localhost:3000'
        }
    })

    app.listen({ port: 4000}, () => 
        console.log(`'server ready at localhost:4000${server.graphqlPath}'`)
    )
}

startServer()