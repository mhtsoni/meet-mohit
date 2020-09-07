const express= require('express')// Express Package
const app = express()// Calling the express module
const server = require('http').Server(app)//Creating an http server
const io = require('socket.io')(server)//Socket.io Instance
const {v4 : uuidv4} = require('uuid')//Lib. to create random urls with uuidv4 function

app.set('view engine', 'ejs')//Setting the view Engine
app.use(express.static('public'))//creating a relative path to look for static files
app.get('/', (req,res)=>{
    res.render('index')//Load the Index page as Home Page
})
app.get('/start', (req,res)=>{
    res.redirect(`/${uuidv4()}`)//Redirect to a new random room
})
app.get('/:room',(req,res)=>{
    res.render('room', {roomId : req.params.room})//passing the romId fetched from url and rendering room Page
})
io.on('connection', (socket) =>{//When connection event occurs
    socket.on('join-room',(roomId,userId)=>{//Custom event that gets roomId and userId from client side
        socket.join(roomId)//Join using provided Id
        socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.on('disconnect',()=>{
            socket.to(roomId).broadcast.emit('user-disconnected',userId)
        })
    })
})
server.listen(process.env.PORT || 3000,()=>console.log("Server Started"))