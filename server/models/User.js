const mongoose=require("mongoose");

module.exports=mongoose.model("User",new mongoose.Schema({

 username:{type:String,unique:true},
 password:String,

 friends:[String],
 requests:[String],

 created:{type:Date,default:Date.now}

}));
