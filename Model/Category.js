var mongoose = require('mongoose');  
var CategorySchema = new mongoose.Schema({  
  name: {
    type: String,
    unique: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    require: true
  },
  status: {
    type: Number,
    default: 1,
    require: true
  },

  createdBy: {
    type: String,
    require: true
  },
  createdOn: {
    type: Date, 
    default: Date.now
  }
});
mongoose.model('Category', CategorySchema);

module.exports = mongoose.model('Category');