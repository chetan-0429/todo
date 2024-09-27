const mongoose = require('mongoose');
const uri = 'mongodb+srv://cc11:cartel123@cluster0.n89ptag.mongodb.net/tododb';
async function dbConnect() {
    try{
        await mongoose.connect(uri);
    }
    catch(err){
        console.log(err,'error in connecting');
    }
}
module.exports = dbConnect;