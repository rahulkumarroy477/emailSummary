const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_URI;

mongoose.connect(mongo_url).then(()=>{
    console.log("Database connected");
}).catch((err)=>{
    console.log(err);
});