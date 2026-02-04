const mongoose=require("mongoose");

module.exports=mongoose.model("Message",new mongoose.Schema({

 chat:String,
 from:String,
 to:String,
 text:String,
 image:String,

 time:{type:Date,default:Date.now}

}));
