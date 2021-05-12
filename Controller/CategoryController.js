var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

var VerifyToken = require('./VerifyToken');
var Category = require('../Model/Category');

// Set default API response
router.get('/', (req, res) => {
    res.json({
        status: 1,
        message: 'CategoryController Its Working',
    });
});


// CREATES A NEW CATEGORY
router.post('/', 
[
    check('x-access-token').isLength({
        min: 10
    }).withMessage('Invalid Token'),
    check('name').isLength({
        min: 1
    }).withMessage('Invalid Category Name'),
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
    Category.create({
        name : req.body.name,
        createdBy : req.userId
      }, (err, category) => {
        if (err){
            // console.log(err)
            res.status(500).send({
                message: 'There was a problem to add new category.',
                status: 0,
            });
        } else {
            res.status(200).send({ 
                auth: true,
                new_category: category,
            });
        }
    });
});

// RETURNS ALL CATEGORY DATA
router.get('/all', VerifyToken, (req, res) => {
    Category.find({}, {name: 1, status: 1}, (err, category) => {
        if (err){
          res.status(500).send({
              message: 'There was a problem finding the category.',
              status: 0,
          });
        } else if (category == null) {
            res.status(404).send({
                message:'No Category in DB',
                status: 1,
            });
        } else {
            res.status(200).send(category);
        }
    });
});


// DELETES A CATEGORY DATA FROM THE DATABASE
router.delete('/:id', VerifyToken, (req, res) => {
    Category.findByIdAndRemove(req.params.id, function (err, category) {
        if (err) {
            res.status(500).send({
                message: 'There was a problem deleting the category.',
                status: 0,
            });
        } else if (category == null) {
            res.status(404).send({
                message:'Invalid CategoryId',
                status: 1,
            });
        } else {
            res.status(200).send({
                message:'Category: '+ category.name +' was deleted.',
                status: 1,
            });
        }
    });
});


// UPDATES A SINGLE CATEGORY IN THE DATABASE
router.put('/:id', VerifyToken, (req, res) => {
    Category.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, category) {
        if (err) {
            res.status(500).send({
                message: 'There was a problem updating the category.',
                status: 0,
            });
        } else if (category == null) {
            res.status(404).send({
                message:'Invalid CategoryId',
                status: 1,
            });
        } else {
            res.status(200).send({
                data: category,
                message: 'Data Upate Done.',
                status: 1,
            });
        }
    });
});





module.exports = router;