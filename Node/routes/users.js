var express     = require("express");
var Image       = require("../models/image");
var middleware  = require("../middleware");

// Acquire router
var router = express.Router();

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

module.exports = router;