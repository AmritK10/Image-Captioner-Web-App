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

var url =process.env.DATABASEURL || "mongodb://localhost:27017/imgs";
var upload = multer({dest: __dirname + "/public/images"});

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

//Root Route
app.get("/",function(req,res){
	res.render("home");
});

//INDEX Route
app.get("/images",function(req,res){
  Image.find({},function(err,allImages){
    if(err){
      console.log(err);
    }
    else{
      res.render("index",{images:allImages});
    }
  });
});

//NEW Route
app.get("/images/new",isLoggedIn,function(req,res){
  res.render("new");
});

//CREATE Route
app.post("/images",isLoggedIn,upload.single("photo"),function(req, res){
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "/public/images/"+req.user.username+req.file.originalname);
    // console.log(req.file);
    // console.log(targetPath);
      fs.rename(tempPath, targetPath, function(err){
        if(err){
          return res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
        }
        else{
          var options = {
            args:
            [
              targetPath
            ]
          }
          pyShell.PythonShell.run("./generate.py", options, function (err, data) {
            if (err){
              res.send(err);
            }
            else{
              var file_path="/images/" +req.user.username + req.file.originalname;
              var author={
                id:req.user._id,
                username:req.user.username
              };
              var pub=false;
              if(req.body.public){
                pub=true;
              }
              var newImage={
                img_path:file_path,
                img_caption:data[0],
                img_public:pub,
                author:author
              };
              Image.create(newImage,function(err,newlyCreated){
                if(err){
                  console.log(err);
                }
                else{
                  res.redirect("images/"+newlyCreated._id);
                  // res.render("show",{Image:newlyCreated});
                }
              });
            }
          });
        }
      });
});

//SHOW Route
app.get("/images/:id",function(req,res){
  Image.findById(req.params.id,function(err,foundImage){
    if(err){
      console.log(err);
    }
    else{
      res.render("show",{Image:foundImage});
    }
  });

});

//UPDATE Route
app.put("/images/:id",checkImageOwnership,function(req,res){
  var pub=false;
  if(req.body.public){
    pub=true;
  }
	Image.updateOne({_id:req.params.id},{img_public:pub},function(err,affected,resp){
		if(err){
			res.redirect("/images");
		}
		else{
			res.redirect("/images/" + req.params.id);
		}
	});
});

//DELETE Route
app.delete("/images/:id",checkImageOwnership,function(req,res){
  Image.findById(req.params.id,function(err,foundImage){
    if(err){
      console.log(err);
    }
    else{
      fs.unlink("./public"+foundImage.img_path, function(err){
        if (err){
          console.log(err);
        }
        else{
          console.log('deleted');
        }
      });
    }
  });
  Image.findByIdAndDelete(req.params.id,function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/images");
    }
  });
});

//Auth Routes
//Sign Up
app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	var newUser=new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			res.redirect("/register");
		}
		else{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/images");
			});
		}
	});
});

//Login
app.get("/login",function(req,res){
	res.render("login");
});
app.post("/login",passport.authenticate("local",{
	successRedirect:"/images",
	failureRedirect:"/login"
}),function(req,res){
});

//Logout
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/images");
});

//USER Routes
//SHOW Route
app.get("/user/:id",function(req,res){
  Image.find({},function(err,allImages){
    if(err){
      console.log(err);
    }
    else{
      res.render("user/show",{images:allImages});
    }
  });
});

//middleware
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
function checkImageOwnership(req,res,next){
	if(req.isAuthenticated()){
		Image.findById(req.params.id,function(err,foundImage){
			if(err || !foundImage){
				res.redirect("back");
			}
			else{
				if(foundImage.author.id.equals(req.user._id)){
					next();
				}
				else{
					res.redirect("back");
				}
			}
		});
	}
	else{
		res.redirect("back");
	}
}
app.listen(3000,function(){
	console.log("Server Started");
});