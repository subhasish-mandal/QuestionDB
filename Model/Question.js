var mongoose = require('mongoose');  
var QuestionSchema = new mongoose.Schema({  
  question: {
    type: String,
    // unique: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true,
    require: true
  },
  answer: {
    type: Array,
    require: true
  },
  categoryList: {
    type: Array,
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
mongoose.model('Question', QuestionSchema);

module.exports = mongoose.model('Question');