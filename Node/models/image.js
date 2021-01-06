var mongoose  = require("mongoose");

var imageSchema  =  new mongoose.Schema({
    img_path:String,
    img_caption:String,
    img_public:Boolean,
    author:{
      id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
      },
      username:String
    }
});

module.exports = mongoose.model("Image",imageSchema);