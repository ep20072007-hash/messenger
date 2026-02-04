const mongoose=require("mongoose");

module.exports=mongoose.model("User",new mongoose.Schema({
 username:{type:String,unique:true},
 password:String,
 bio:{type:String,default:""},
 avatar:{type:String,default:""},
 created:{type:Date,default:Date.now}
}));
