var express     = require("express"),
  	bodyParser  = require("body-parser"),
  	pyShell 	  = require("python-shell"),
  	multer 		  = require("multer"),
  	path 		    = require("path"),
  	fs 			    = require("fs");

var upload 		= multer({dest: __dirname + "/public/images"});

var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));// to serve up local pictures
app.set("view engine","ejs");

app.get("/",function(req,res){
	res.render("home");
});

const handleError = function(err, res){
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

app.post("/upload",upload.single("photo"),function(req, res){
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "/public/images/"+req.file.originalname);
    // console.log(req.file);
    // console.log(targetPath);
      fs.rename(tempPath, targetPath, function(err){
        if(err) 
        	return handleError(err, res);
        else{
          var options = {
            args:
            [
              targetPath
            ]
          }
          pyShell.PythonShell.run("./generate.py", options, function (err, data) {
            if (err) 
              res.send(err);
            else
              res.render("show",{filename:req.file.originalname,caption:data});
          });
        }
      });
});

app.listen(3000,function(){
	console.log("Server Started");
});