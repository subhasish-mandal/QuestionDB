var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    useUnifiedTopology: true,
    useCreateIndex: true,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  profilePicture: {
    type: String,
    require: true
  },
  status: {
    type: Number,
    default: 1,
    require: true
  },
  createdOn: {
    type: Date, 
    default: Date.now
  }
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');