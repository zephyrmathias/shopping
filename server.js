var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var secret = require('./server/config/secret');
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');

var Category = require('./server/models/category');
var cartLength = require('./middlewares/middlewares');
var Notification = require('./server/models/notification');

mongoose.connect(secret.database, function(err){
	if(err) {
		console.log(err);
	}
	else {
		console.log("Connected to MongoDB");
	}
})

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: secret.secretKey,
	store: new MongoStore({url:secret.database, autoReconnect:true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use(cartLength);

app.use(function(req,res,next){
	Category.find({}, function(err, categories){
		if(err) return next(err);
		res.locals.categories = categories;
		next();
	});
});

app.use(function(req,res,next){
	Notification.findById({_id:"571b3ff9fca0fd03db5aae6f"}, function(err,noti){
		if(err) return next(err);
		res.locals.notification = noti.order;
		next();
	});
});

app.engine('ejs', engine);
app.set('view engine', 'ejs');

var mainRoutes = require('./server/routes/main');
var userRoutes = require('./server/routes/user');
var productsRoutes = require('./server/routes/products');
var apiRoutes = require('./api/api');
var adminRoutes = require('./server/routes/admin');

app.use(mainRoutes);
app.use(userRoutes);
app.use(productsRoutes);
app.use('/api', apiRoutes);
app.use(adminRoutes);

app.listen(3000,function(){
	console.log("Running on 3000");
})
