const mongoose=require("mongoose");

module.exports=mongoose.model("User",new mongoose.Schema({
 username:{type:String,unique:true,index:true},
 password:String,
 created:{type:Date,default:Date.now},
 lastLogin:Date,
}));
