import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import sassMiddleware from 'node-sass-middleware';
import passport from 'passport';
import config from './config';

require('./server/models').connect(config.dbUri);

const app = express();
app.use(bodyParser.json());

app.use(sassMiddleware({
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'public')
  }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
})


// tell the app to look for static files in these directories
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./server/passport/local-signup');
const localLoginStrategy = require('./server/passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authenticaion checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./server/routes/auth');
const apiRoutes = require('./server/routes/api');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
});