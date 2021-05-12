var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

var VerifyToken = require('./VerifyToken');
var User = require('../Model/User');


/* ---------------- Configure JWT ---------------- */
 var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
 var bcrypt = require('bcryptjs');
 var config = require('../config');


// Set default API response
router.get('/', (req, res) => {
    res.json({
        status: 1,
        message: 'AuthController Its Working',
    });
});



// USER REGISTRATION
router.post('/register', 
[
    check('name').isLength({
        min: 4
    }).withMessage('Invalid Name'),
    check('email').isEmail()
    .withMessage('Invalid Email'),
    check('password').isLength({
        min: 4
    }).withMessage('Invalid Password'),
], (req, res) => {
    const input_errors = validationResult(req);
    if (!input_errors.isEmpty()) {
        return res.status(422).json({
            status: 0,
            message: 'required field missing',
            errors: input_errors.array()
        });
    } else {
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);

        User.create({
            name : req.body.name,
            email : req.body.email,
            password : hashedPassword
          }, (err, user) => {
            if (err){
                // console.log(err)
                res.status(500).send({
                    message: 'There was a problem registering the user.',
                    status: 0,
                });
            } else {
                var token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400
                });
              
                res.status(200).send({ 
                    auth: true,
                    new_user_id: user._id,
                    token: token 
                });
            }
        });
    }
});



// USER LOGIN
router.post('/login', 
[
    check('email').isEmail()
    .withMessage('Invalid Email'),
    check('password').isLength({
        min: 4
    }).withMessage('Invalid Password'),
], (req, res) => {
    const input_errors = validationResult(req);
    if (!input_errors.isEmpty()) {
        return res.status(422).json({
            status: 0,
            message: 'required field missing',
            errors: input_errors.array()
        });
    } else {
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);

        User.findOne({ email: req.body.email }, (err, user) => {
            if (err){
                // console.log(err)
                res.status(500).send({
                    message: 'Error on the server.',
                    status: 0,
                });
            } else if (!user) {
                res.status(404).send({
                    message: 'No user found.',
                    status: 0,
                });
            } else {
                // check if the password is valid
                var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
                if (!passwordIsValid) {
                    res.status(401).send({ 
                        auth: false, 
                        token: null,
                        message: 'Incorrect Password.',
                    });
                } else {
                    var token = jwt.sign({ id: user._id }, config.secret, {
                        expiresIn: 86400
                    });

                    res.status(200).send({ 
                        auth: true,
                        user_id: user._id,
                        token: token 
                    });
                }
            }
        });
    }
});




router.get('/me', VerifyToken, (req, res, next) => {

    User.findById(req.userId, { password: 0 }, (err, user) => {
      if (err){
        res.status(500).send({
            message: 'There was a problem finding the user.',
            status: 0,
        });
      } else if (!user) {
        res.status(404).send({
            message: 'No user found.',
            status: 0,
        });
      } else {
        res.status(200).send(user);
      }
    });
});




// Export API routes
module.exports = router;