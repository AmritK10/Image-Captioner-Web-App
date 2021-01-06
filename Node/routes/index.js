var express     = require("express");
var passport    = require("passport");
var User        = require("../models/user");

// Acquire router
var router = express.Router();

// Root Route
router.get("/",function(req,res){
	res.render("home");
});

//Auth Routes
//Sign Up Routes
router.get("/register",function(req,res){
	res.render("register");
});
router.post("/register",function(req,res){
	var newUser = new User({username:req.body.username});
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
router.get("/login",function(req,res){
	res.render("login");
});
router.post("/login",passport.authenticate("local",{
	successRedirect:"/images",
	failureRedirect:"/login"
}),function(req,res){
});

//Logout
router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/images");
});

module.exports = router;