const express = require('express');
const app = express();
const cors = require('cors');
const dbConnect = require('./database');
const Task = require('./models/taskModel')
const User = require('./models/userModel')
// app.use(cors());
// const corsOptions = {
//     origin: 'http://127.0.0.1:5500', // Your frontend URL
//     credentials: true // Allow cookies to be sent
// };
// app.use(cors(corsOptions));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

dbConnect();

const session = require('express-session');
app.use(session({
    secret: 'yourSecretKey', // Replace with your secret key
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     secure: false, // Set to true if using HTTPS
    //     httpOnly: true,
    //     sameSite: 'None' // This is important for cross-origin requests
    // }
}));

app.get('/login',(req,res)=>{
    req.session.user = 'abc'
    console.log(req.session.user)
    res.send('login page')
})

app.post('/login',async(req,res)=>{
    const {username,password} = req.body;
    console.log(req.body);
    console.log('user: ',username);
    try{
        const user = await User.findOne({username,password});
        if(!user){
            return res.json({success:false,message:'invalid username or password'})
        }
        req.session.user = username;
        console.log('session created: ',req.session.user)
        res.status(200).json({success:true,user})
        // else{
        // }
    }catch(err){
        res.send('error')
        // res.status(500).json({success:false,message:'error in login'});
    }
})

app.get('/try',(req,res)=>{
    console.log('session is: ',req.session.user)
    if(req.session.user){
        res.json({success:true,message:'logged in'});
    }
    else {
        res.json({success:false,message:'not logged in'});
        // res.send('not logged in')
    }
})

app.get('/signup',(req,res)=>{
    res.send('signup page');
})
app.post('/signup',async(req,res)=>{
    const {username,password} = req.body;
    try{
     const user = await User.findOne({username});
     if(user){
        res.json({success:false,message:'user already exist'});
     }
     else{
        const newUser = new User({username,password});
        const savedUser = await newUser.save();
        res.status(201).json({success:true,message:'user created successfully',user:savedUser});
     }
    }catch(err){
        res.status(500).json({success:false,message:'error in creating'});
    }
})

function authentication(req,res,next){
    console.log('auth : ',req.session.user)
    if(req.session && req.session.user){
        console.log('next')
        next();
    }
    else{
        res.status(401).json({success:false,message:'Unauthorized'});
        }
}

app.get('/show',authentication,async(req,res)=>{
    console.log('show list')
    try{
        const tasks = await Task.find({});
        res.status(200).json({success:true,tasks});
    }catch(err){
        res.status(500).json({success:false})
    }
})

app.post('/add',authentication,async (req,res)=>{
    const {title,description}=req.body;
    console.log(req.body)
    try{
        const newTask = new Task({
            title,
            description
        })
        const saved = await newTask.save();
        console.log('task is',saved)
        res.status(201).json({success:true,task:saved});
    }catch(err){
        res.status(500).json({success:false})
    }
})

app.post('/edit',authentication,async (req,res)=>{
    const {id,title,description}=req.body;
    console.log(req.body)
    try{
        const task = await Task.findOne({_id:id});
        console.log(task)
        if(task){
            task.description = description ? description : task.description;
            task.title = title ? title : task.title;
            await task.save();
            res.status(201).json({success:true,message:'updated'});
        }
        else{
            res.status(200).json({success:true,message:"not found"});
        }
    }catch(err){
        res.status(500).json({success:false})
    }
})

app.get('/delete/:id',authentication,async(req,res)=>{
    const id = req.params.id
    try{
       const deleted =  await Task.deleteOne({_id:id});
       res.status(200).json({success:true,message:'deleted successfully'});
    }catch(err){
        res.status(500).json({success:false,message:"not deleted"})
    }
})

app.get('/logout',(req,res)=>{
    req.session.destroy();
    // res.send('logout')
    res.redirect('/login.html')
})
app.listen(3000,()=>{
    console.log('server started on port http://localhost:3000')
})