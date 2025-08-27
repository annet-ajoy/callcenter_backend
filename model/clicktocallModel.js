const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clicktocallSchema = new Schema({
    id_user: {
        type: Number,
        required: false
    },
    uid: {
        type: String,
        default: "",
        required: false
    },
    upin: {
        type: String,
        default: "",
        required: true,
    },
    // is_active: {
    //     type: String,
    //     default: "",
    // },
    // whitelist_ip: {             //1= allow all ip, 2= select ip
    //     type: Number,
    //     default: "",
    //     required: false
    // },
    // parameter_array:{
    //     type: Array, 
    //     default: []
    // },
    // response: {
    //     type: Object, 
    //     default: {} 
    // }
});

module.exports = mongoose.model('click_to_call', new Schema(clicktocallSchema, { strict: false} ));