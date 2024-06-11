const mongoose = require("mongoose");

module.exports.connect = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connecting Successfully");
    } catch(error){
        console.log("Connecting Error");
    }
}
