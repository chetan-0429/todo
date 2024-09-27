const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dbConnect = require('./database');
const Task = require('./models/taskModel');
const User = require('./models/userModel');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Your frontend URL
    credentials: true // Allow cookies to be sent
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Database Connection
dbConnect();

// Session Configuration
app.use(session({
    secret: 'yourSecretKey', // Replace with your secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        sameSite: 'None' // Important for cross-origin requests
    }
}));

// Authentication Middleware
function authentication(req, res, next) {
    console.log('authe: ',req.session.user);
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}

// Routes
app.get('/login', (req, res) => {
    req.session.user = 'abc';
    res.send('login page');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.json({ success: false, message: 'Invalid username or password' });
        }
        req.session.user = username;
        console.log('session: ',req.session.user);
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error in login' });
    }
});

app.get('/try', authentication, (req, res) => {
    res.send(req.session.user ? 'Logged in' : 'Not logged in');
});

app.get('/signup', (req, res) => {
    res.send('signup page');
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            return res.json({ success: false, message: 'User already exists' });
        }
        const newUser = new User({ username, password });
        const savedUser = await newUser.save();
        res.status(201).json({ success: true, message: 'User created successfully', user: savedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error in creating user' });
    }
});



// Server Listening
app.listen(3000, () => {
    console.log('Server started on port http://localhost:3000');
});
