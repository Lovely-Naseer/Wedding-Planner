require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./models/User');
const Register = require('./models/Register');
const indexRoutes = require('./routes/index');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' folder


// Database connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));


// Set views folder and view engine
app.set('views', path.join(__dirname, 'src', 'views')); // Updated for cross-platform compatibility
app.set('view engine', 'ejs');


// Use routes from external file
app.use('/', indexRoutes);


// Routes for rendering different views
app.get('/signup', (req, res) => res.render('signup', { errorMessage: null }));
app.get('/register', (req, res) => res.render('register', { errorMessage: null }));
app.get('/index', (req, res) => res.render('index'));
app.get('/index0', (req, res) => res.render('index0'));
app.get('/login', (req, res) => res.render('login', { errorMessage: null }));


//  signup form submission
app.post('/signup', async (req, res) => {
  const { UserName, Password, Confirm_Password } = req.body;

  const hasLetter = /[A-Za-z]/;
  const hasNumber = /[0-9]/;
  const isValidFormat = /^[A-Za-z\d]{6,15}$/;

  if (!UserName || !Password) {
    return res.render('signup', { errorMessage: 'Username & password are required' });
  }
  if (!isValidFormat.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username 6-15 characters' });
  }
  if (!hasLetter.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username at least one letter' });
  }
  if (!hasNumber.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username at least one number' });
  }
  if (Password.length < 8 || Password.length > 20) {
    return res.render('signup', { errorMessage: 'Password 8-20 characters' });
  }
  if (Password !== Confirm_Password) {
    return res.render('signup', { errorMessage: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ UserName });
    if (existingUser) {
      return res.render('signup', { errorMessage: 'User Already Exist!' });
    }

    const newUser = new User({ UserName, Password });
    await newUser.save();
    return res.redirect('/login');
  } catch (error) {
    console.error(error);
    return res.render('signup', { errorMessage: 'Error To Signup User!' });
  }
});


// Register page
app.post('/register', async (req, res) => {
  const { Name, Mobile_no, Wedding_Address, Wedding_date } = req.body;

  const newRegister = new Register({ Name, Mobile_no, Wedding_Address, Wedding_date });
  try {
    await newRegister.save();
    return res.redirect('/index'); // Ensure no further code runs
  } catch (error) {
    console.error(error);
    return res.render('register', { errorMessage: 'Not Registered' });
  }
});

// Login Page
app.post('/login', async (req, res) => {
  const { UserName, Password } = req.body;

  try {
    if (!UserName || !Password) {
      return res.render('login', { errorMessage: 'Invalid username or password!' });
    }

    const user = await User.findOne({ UserName });
    if (!user) {
      console.error('User not found');
      return res.render('login', { errorMessage: 'Invalid username' });
    }

    const isPasswordCorrect = await user.comparePassword(Password);
    if (!isPasswordCorrect) {
      console.error('Incorrect password');
      return res.render('login', { errorMessage: 'Incorrect password!' });
    }

    return res.redirect('/index'); // Ensure no further code runs
  } catch (error) {
    console.error('Detailed Server Error:', error);
    return res.render('login', { errorMessage: 'Server Error' });
  }
});

// Logout code
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get('/logout', (req, res) => {
  if (!req.session) {
    return res.status(400).send('No active session to log out.');
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    return res.redirect('/index0');
  });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log('Server running on http://localhost:',process.env.PORT);
});
   