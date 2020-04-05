var methodOverride			    =	require("method-override"),
    express                 = require("express"),
    mongoose                =	require("mongoose"),
    bodyParser              = require("body-parser"),
    pyShell 	              = require("python-shell"),
    passport 				        = require("passport"),
    LocalStrategy			      = require("passport-local"),
    passportLocalMongoose	  = require("passport-local-mongoose"),
    User 					          = require("./models/user"),
    Image 					        = require("./models/image"),
  	multer 		              = require("multer"),
  	path 		                = require("path"),
  	fs 			                = require("fs");

var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));// to serve up local pictures
app.use(methodOverride("_method"));
app.set("view engine","ejs");

var url =process.env.DATABASEURL || "mongodb://mongo:27017/imgs";


mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology: true,});

//PASSPORT COONFIGURATION
app.use(require("express-session")({
	secret:"Once again rusty wins cutest dog!",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Passing Current User to all
app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  next();
});

var indexRoutes	=	require("./routes/index"),
    imageRoutes = require("./routes/images")
    userRoutes  = require("./routes/users");
app.use(indexRoutes);
app.use(imageRoutes);
app.use(userRoutes);

app.listen(3000,function(){
	console.log("Server Started");
});