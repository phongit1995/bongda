let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let bongda = new Schema ({
    idsend:String,
    userNameSend:String,
    sut:Boolean,
    xu:String,
    idReceive:String,
    bat:Boolean,
    status: {
        type:Boolean,
        default:false
    },
    CreatedAt:Number
})
module.exports = mongoose.model('bongda',bongda);