let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let user = new Schema ({
    username:String,
    password:String,
    xu:Number,
})
module.exports = mongoose.model('user',user);