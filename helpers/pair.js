const Stranger = require("../models/stranger.model");
module.exports = async (idA) =>{
    try{
        const strangers = await Stranger.find({});
        const indexA = strangers.findIndex(stranger => stranger.user_id == idA);
        if(indexA%2 == 0){
            return null;
        }
        return strangers[indexA-1].user_id;
    }
    catch(error){
        return null;
    }
}