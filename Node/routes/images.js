var express     = require("express");
var Image       = require("../models/image");
var middleware  = require("../middleware");

var pyShell 	  = require("python-shell"),
    multer 		  = require("multer"),
  	path 		    = require("path"),
    fs 			    = require("fs"),
    request     = require("request");

// Acquire router
var router = express.Router();

var upload = multer({dest: path.join(__dirname, "../public/images/")});

// INDEX Route
router.get("/images",function(req,res){
    Image.find({},function(err,allImages){
      if(err){
        console.log(err);
      }
      else{
        res.render("images/index",{images:allImages});
      }
    });
});
  
// NEW Route
router.get("/images/new",middleware.isLoggedIn,function(req,res){
    res.render("images/new");
});
  
// CREATE Route
router.post("/images",middleware.isLoggedIn,upload.single("photo"),function(req, res){
      const tempPath = req.file.path;
      const targetPath = path.join(__dirname, "../public/images/"+req.user.username+req.file.originalname);
        fs.rename(tempPath, targetPath, function(err){
          if(err){
            return res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
          }
          else{
            let url = "http://api:5000/api"; 
            var fileName = targetPath;
            const formData = {
              file: {
                value:  fs.createReadStream(targetPath),
                options: {
                  filename: targetPath,
                  contentType: 'image/jpg'
                }
              }
            };
            request.post({url:url, formData: formData}, function optionalCallback(err, httpResponse, body) {
              if (err) {
                return console.error('Upload Failed:', err);
              }
              else{
                console.log("API Request successful!")
                var file_path = "/images/" + req.user.username + req.file.originalname;
                var author = {
                  id:req.user._id,
                  username:req.user.username
                };
                var pub = false;
                if(req.body.public){
                  pub = true;
                }
                var newImage = {
                  img_path:file_path,
                  img_caption:body,
                  img_public:pub,
                  author:author
                };
                Image.create(newImage,function(err,newlyCreated){
                  if(err){
                    console.log(err);
                  }
                  else{
                    res.redirect("images/"+newlyCreated._id);
                  }
                });
              }
            });
          }
        });
});
  
// SHOW Route
router.get("/images/:id",function(req,res){
    Image.findById(req.params.id,function(err,foundImage){
      if(err){
        console.log(err);
      }
      else{
        res.render("images/show",{Image:foundImage});
      }
    });
  
});
  
// UPDATE Route
router.put("/images/:id",middleware.checkImageOwnership,function(req,res){
    var pub = false;
    if(req.body.public){
      pub = true;
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
  
// DELETE Route
router.delete("/images/:id",middleware.checkImageOwnership,function(req,res){
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

module.exports = router;