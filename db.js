const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const mongoDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("DB connected");

        const adminCollection = mongoose.connection.db.collection("admin_login");
        global.admindata = await adminCollection.find({}).toArray();
        console.log("Fetched Admin Data:", global.admindata);
        
        // const privateCollection = mongoose.connection.db.collection("private_key");
        // global.privatekey = await privateCollection.find({}).toArray();
        // console.log("Fetched secretkey:", global.privatekey);
        

    } catch (err) {
        console.error("Error connecting to the database:", err);
        throw err;
    }
};

module.exports = mongoDB;
