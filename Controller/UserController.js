var express = require('express');
var router = express.Router();
var multer  = require('multer');
const { check, validationResult } = require('express-validator');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

var VerifyToken = require('./VerifyToken');
var User = require('../Model/User');

var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./Images");
    },
    filename: function(req, file, callback) {
        callback(null, req.params.userId + "_" + Date.now() + "." + file.originalname.split('.').pop());
    }
});

const fileFilter = (req, file, callback) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const upload = multer({
    storage: Storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
}).single('userImage');


// Set default API response
router.get('/', (req, res) => {
    res.json({
        status: 1,
        message: 'UserController Its Working',
    });
});



// RETURNS ALL THE USERS IN THE DATABASE
router.get('/all', VerifyToken, (req, res) => {
    User.find({}, (err, users) => {
        if (err){
          res.status(500).send({
              message: 'There was a problem finding the user.',
              status: 0,
          });
        } else {
            res.status(200).send(users);
        }
    });
});


router.post('/update_profile_info', 
[
    check('x-access-token').isLength({
        min: 10
    }).withMessage('Invalid Token'),
    check('name').isLength({
        min: 4
    }).withMessage('Invalid Name'),
    check('email').isEmail()
    .withMessage('Invalid Email'),
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
            // req.userData = user;
            // console.log(user._id);

            User.updateOne({_id: user._id}, {
                $set: {
                    name : req.body.name,
                    email : req.body.email,
                }
            }, (update_err, update_log) => {
                if (update_err) {
                    res.status(500).send({
                        message: 'There was a problem finding the user.',
                        status: 0,
                    });
                } else {
                    if (update_log.nModified == 1) {
                        res.status(200).send({
                            message: 'User upadte done.',
                            status: 1,
                        });
                    } else if (update_log.n == 1){
                        res.status(202).send({
                            message: 'No user data upadte found.',
                            status: 1,
                        });
                    } else {
                        res.status(404).send({
                            message: 'There was a problem finding the user.',
                            status: 0,
                        });
                    }
                }
            });
        }
      }
    );
});



router.patch("/update_profile/:userId", VerifyToken, (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(500).send({
                message: 'Something went wrong!',
                status: 0,
            });
        } else {
            User.findById(req.params.userId, (err, user) => {
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
                    next();
                }
            });
        }
    });
}, (req, res) => {
    User.updateOne({_id: req.params.userId}, { 
        $set: {
            name: req.body.name,
            email: req.body.email,
            profilePicture: 'http://localhost:3000/Images/' + req.file.filename,
        } 
    }, (update_err, update_log) => {
        if (update_err) {
            res.status(500).send({
                message: 'There was a problem finding the user.',
                status: 0,
            });
        } else {
            if (update_log.nModified == 1) {
                res.status(200).send({
                    message: 'User upadte done.',
                    url: 'http://localhost:3000/Images/' + req.file.filename,
                    status: 1,
                });
            } else if (update_log.n == 1){
                res.status(202).send({
                    message: 'No user data upadte found.',
                    status: 1,
                });
            } else {
                res.status(404).send({
                    message: 'There was a problem finding the user.',
                    status: 0,
                });
            }
        }
    });
    
    /*
    , (err, update) => {
        res.status(200).send({
            reqData: req.file.filename,
            msg: "File uploaded sucessfully!."
        });
    });
    */
});




// Export API routes
module.exports = router;