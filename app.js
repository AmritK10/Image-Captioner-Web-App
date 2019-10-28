var methodOverride			=	require("method-override"),
    express             = require("express"),
    mongoose            =	require("mongoose"),
    bodyParser          = require("body-parser"),
  	pyShell 	          = require("python-shell"),
  	multer 		          = require("multer"),
  	path 		            = require("path"),
  	fs 			            = require("fs");

var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));// to serve up local pictures
app.use(methodOverride("_method"));
app.set("view engine","ejs");

var url =process.env.DATABASEURL || "mongodb://localhost:27017/imgs";
var upload = multer({dest: __dirname + "/public/images"});

mongoose.connect(url,{useNewUrlParser:true});

var imageSchema  =  new mongoose.Schema({
    img_path:String,
    img_caption:String
});

var Image   =   mongoose.model("Image",imageSchema);

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
app.get("/images/new",function(req,res){
  res.render("new");
});

//CREATE Route
app.post("/images",upload.single("photo"),function(req, res){
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "/public/images/"+req.file.originalname);
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
              var file_path="/images/" + req.file.originalname;
              var newImage={img_path:file_path,img_caption:data[0]};
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

//DELETE Route
app.delete("/images/:id",function(req,res){
  Image.findByIdAndDelete(req.params.id,function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/images");
    }
  });
});

app.listen(3000,function(){
	console.log("Server Started");
});