let mongoose = require('mongoose');
const Schema = mongoose.Schema ;
let bongda = new Schema ({
    idsend:String,
    userNameSend:String,
    sut:Boolean,
    xu:Number,
    idReceive:String,
    bat:Boolean,
    status: {
        type:Boolean,
        default:false
    },
    CreatedAt:{
        type:Number,
        default:Date.now()
    }
})
module.exports = mongoose.model('bongda',bongda);