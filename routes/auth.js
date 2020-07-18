import express from 'express';
import expressValidator from 'express-validator'
const check = expressValidator.check
const router = express.Router();
import authController from '../controllers/auth.js'
import User from '../models/User.js';
router.get('/login', authController.getSigninPage)

router.get('/signup', authController.getSignupPage)

router.post('/signup', [
    check('firstname')
        .isLength({ min: 2 })
        .withMessage("Firstname too short"),
    check("lastname")
        .isLength({ min: 2 })
        .withMessage("Lastname too short"),
    check("email")
        .isEmail()
        .withMessage('Enter a valid email address')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject("Email exist already, please pick a different one")
                }
            } catch (err) {
                throw err
            }
        }),
    check('password')
        .isLength({
            min: 6,
        })
        .withMessage('password must be at least 6 characters long'),
    check("confirmPassword")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("passwords have to match")
            }
            return !0
        })
], authController.postSignup)

router.post('/login', [
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
], authController.postLogin)

router.post('/logout', authController.logOut)

export default router