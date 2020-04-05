var Image      = require("../models/image");

var middlewareObj = {};

//middleware
middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
middlewareObj.checkImageOwnership = function(req,res,next){
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

module.exports=middlewareObj;