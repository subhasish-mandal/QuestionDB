var express = require('express');
var router = express.Router();
var multer = require('multer');
const { check, validationResult } = require('express-validator');
var csv = require('csvtojson');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

var VerifyToken = require('./VerifyToken');
var Question = require('../Model/Question');



var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./uploads");
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    // reject a file
    if (file.mimetype === 'application/csv' || file.mimetype === 'text/csv') {
      callback(null, true);
    } else {
      callback(null, false);
    }
};

const upload = multer({
    storage: Storage,
    fileFilter: fileFilter
}).single('csvFile');


// Set default API response
router.get('/', (req, res) => {
    res.json({
        status: 1,
        message: 'QuestionController Its Working',
    });
});


// CREATES A NEW QUESTION
router.post('/', 
[
    check('x-access-token').isLength({
        min: 10
    }).withMessage('Invalid Token'),
    check('question').isLength({
        min: 1
    }).withMessage('Invalid Question'),
    check('answer').isLength({
        min: 1
    }).withMessage('Invalid Answer'),
    check('categoryList').isLength({
        min: 1
    }).withMessage('Invalid CategoryList'),
], (req, res, next) => {
    const input_errors = validationResult(req);
    if (!input_errors.isEmpty()) {
        return res.status(422).json({
            status: 0,
            message: 'required field missing',
            errors: input_errors.array()
        });
    } else {
        next();
    }
}, VerifyToken, (req, res, next) => {
    Question.create({
        question : req.body.question,
        answer: req.body.answer,
        categoryList: req.body.categoryList,
        createdBy : req.userId
      }, (err, question) => {
        if (err){
            // console.log(err)
            res.status(500).send({
                message: 'There was a problem to add new Question.',
                status: 0,
            });
        } else {
            res.status(200).send({ 
                auth: true,
                new_question: question,
            });
        }
    });
});

// RETURNS ALL QUESTION DATA
router.get('/all', VerifyToken, (req, res) => {
    Question.find({}, {}, (err, question) => {
        if (err){
          res.status(500).send({
              message: 'There was a problem finding the question.',
              status: 0,
          });
        } else if (question == null) {
            res.status(404).send({
                message:'No Question in DB',
                status: 1,
            });
        } else {
            res.status(200).send(question);
        }
    });
});

// DELETES A QUESTION DATA FROM THE DATABASE
router.delete('/:id', VerifyToken, (req, res) => {
    Question.findByIdAndRemove(req.params.id, function (err, question) {
        if (err) {
            res.status(500).send({
                message: 'There was a problem deleting the question.',
                status: 0,
            });
        } else if (question == null) {
            res.status(404).send({
                message:'Invalid QuestionId',
                status: 1,
            });
        } else {
            res.status(200).send({
                message:'Question: '+ question.question +' was deleted.',
                status: 1,
            });
        }
    });
});

// UPDATES A SINGLE QUESTION IN THE DATABASE
router.put('/:id', VerifyToken, (req, res) => {
    Question.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, question) {
        if (err) {
            res.status(500).send({
                message: 'There was a problem updating the question.',
                status: 0,
            });
        } else if (question == null) {
            res.status(404).send({
                message:'Invalid QuestionId',
                status: 1,
            });
        } else {
            res.status(200).send({
                data: question,
                message: 'Data Upate Done.',
                status: 1,
            });
        }
    });
});


// UPLOAD BULK QUESTION
router.post('/bulk_upload', (req,res)=>{
    upload(req, res, (err) => {
        if (err) {
            res.status(500).send({
                message: 'Something went wrong!',
                status: 0,
            });
        } else {
            csv()
            .fromFile(req.file.path)
            .then((jsonObj)=>{
                let jsonObjFinal = [];
                jsonObj.forEach(element => {
                    let obj = {
                        question: element.question,
                        status: element.status,
                        answer: element.answer,
                        categoryList: element.categoryList,
                    };
                    jsonObjFinal.push(obj);
                });

                Question.insertMany(jsonObjFinal,(err,data)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send({
                            message: 'Something went wrong!',
                            status: 0,
                        });
                    }else{
                        res.status(200).send({
                            message: 'File Upload Done.',
                            status: 1,
                        });
                    }
                });
            });
        }
    });
});


//{categoryList: {$elemMatch: {$in: [4]}}}


module.exports = router;