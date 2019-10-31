var express     = require("express");
var router      = express.Router();
var Image  = require("../models/image");
var middleware  = require("../middleware");

//USER Routes
//SHOW Route
router.get("/user/:id",function(req,res){
    Image.find({},function(err,allImages){
      if(err){
        console.log(err);
      }
      else{
        res.render("user/show",{images:allImages});
      }
    });
  });

module.exports=router;