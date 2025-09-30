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

// Logout code
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);
// Use routes from external file
app.use('/', indexRoutes);


// Routes for rendering different views
app.get('/signup', (req, res) => res.render('signup', { errorMessage: null }));
app.get('/register', (req, res) => res.render('register', { errorMessage: null }));
app.get('/index', (req, res) => res.render('index'));
app.get('/index0', (req, res) => res.render('index0'));
app.get('/login', (req, res) => res.render('login', { errorMessage: null }));
app.get('/otp', (req, res) => res.render('otp',{ errorMessage: null }));
app.get('/newpassword', (req, res) => res.render('new_password',{ errorMessage: null }));
app.get('/forget', (req, res) => res.render('forgot_password', { errorMessage: null }));


//  signup form submission
app.post('/signup', async (req, res) => {
  // Destructure all required fields
  const { UserName, Password, Confirm_Password, Mobile_No, Gmail } = req.body;

  // Validation regex
  const hasLetter = /[A-Za-z]/;
  const hasNumber = /[0-9]/;
  const isValidFormat = /^[A-Za-z\d]{6,15}$/;

  // Check required fields
  if (!UserName || !Password || !Mobile_No || !Gmail) {
    return res.render('signup', { errorMessage: 'All fields are required' });
  }

  // Username validations
  if (!isValidFormat.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username must be 6-15 characters' });
  }
  if (!hasLetter.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username must contain at least one letter' });
  }
  if (!hasNumber.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username must contain at least one number' });
  }

  // Password validations
  if (Password.length < 8 || Password.length > 20) {
    return res.render('signup', { errorMessage: 'Password must be 8-20 characters' });
  }
  if (Password !== Confirm_Password) {
    return res.render('signup', { errorMessage: 'Passwords do not match' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ UserName });
    if (existingUser) {
      return res.render('signup', { errorMessage: 'User Already Exists!' });
    }

    // Create new user (password will be hashed automatically by schema pre-save hook)
    const newUser = new User({ UserName, Password, Mobile_No, Gmail });
    await newUser.save();

    return res.redirect('/login');
  } catch (error) {
    console.error(error);
    return res.render('signup', { errorMessage: 'Error signing up user!' });
  }
});


// Register page
app.post('/register', async (req, res) => {
  const { 
    Name, 
    Mobile_no, 
    Wedding_Address, 
    Wedding_date_From, 
    Wedding_date_To, 
    Venue, 
    CardDesign, 
    Service, 
    No_of_Guests 
  } = req.body;

  const newRegister = new Register({
    Name,
    Mobile_no,
    Wedding_Address,
    Wedding_date_From,
    Wedding_date_To,
    Venue,
    CardDesign,
    Service,
    No_of_Guests
  });

  try {
    await newRegister.save();
    return res.redirect('/index');  // redirect after success
  } catch (error) {
    console.error("❌ Error:", error.message);
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
   