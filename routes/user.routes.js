const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// /user/test 

router.get('/register', (req, res) => {
    res.render('register');
})
router.post('/register',
    body('username').trim().isLength({ min: 3 }), 
    body('email').trim().isEmail().isLength({min: 13}),
    body('password').trim().isLength({ min: 8 }),
    async (req, res) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'invalid data'
            })
        }
        const {email, username, password} = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            username,
            email,
            password: hashPassword
        });
        res.json(newUser)
    }
)

// /user/login
router.get('/login', (req, res) => {
    res.render('login');
})
router.post('/login', [
        body('email').trim().isEmail().isLength({ min: 13 }),
        body('password').trim().isLength({ min: 8 }),
    ], async (req, res) => {
        // Run validation and check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data provided',
            });
        }

        const { email, password } = req.body;
        try {
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    message: 'Username or password is incorrect',
                });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(400).json({
                    message: 'Username or password is incorrect',
                });
            }

            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    username: user.username,
                },
                process.env.JWT_SECRET
            );

            // Set cookie and send success response
            res.cookie('token', token, { httpOnly: true });
            res.status(200).json({ message: 'Logged in successfully' });
        } catch (error) {
            // Handle unexpected server errors
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error, please try again' });
        }
    }
);


module.exports = router