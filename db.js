var mongoose = require('mongoose');

// Connect to Mongoose and set connection variable
const options = {
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	poolSize: 10,
	connectTimeoutMS: 120000,	// 120sec
	socketTimeoutMS: 180000		// 180sec
};

mongoose.connect('mongodb://localhost:27017/test_db', options);
var db = mongoose.connection;

// Added check for DB connection
if (!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")