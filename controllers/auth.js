import expressValidator from "express-validator"
import bcrypt from 'bcryptjs'
import User from "../models/User.js"
const validationResult = expressValidator.validationResult


const getSigninPage = (req, res, next) => {
    if (req.session.isLoggedIn) {
        req.flash('error',`A user is signed in already`)
        res.redirect('/')
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login to continue..',
        oldInput: {
            email: '',
            password: '',
        },
        validationErrors: []
    })
}

const getSignupPage = (req, res, next) => {
    if (req.session.isLoggedIn) {
        req.flash('error', `A user is signed in already`)
        res.redirect('/')
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Create your chat account..',
        oldInput: {
            firstname: '',
            lastname: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: [],
    })
}

const postSignup = async (req, res, next) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Create your chat account..',
            oldInput: {
                firstname,
                lastname,
                email,
                password,
                confirmPassword
            },
            validationErrors: errors.array(),
        })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = new User({
            firstname: firstname,
            lastname: lastname,
            fullname: `${lastname} ${firstname}`,
            email: email,
            password: hashedPassword
        })
        await newUser.save()
        req.flash("success", `${newUser.fullname}, your signup was succesful, now Login!`)
        res.redirect('/login')
    } catch (err) {
        const error = new Error(err)
        err.statusCode = 500
        return next(error)
    }
}

const postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login to continue..',
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: [errors.array()[0].msg]
        })
    }
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login to continue..',
                oldInput: {
                    email: email,
                    password: password,
                },
                validationErrors: ['email or password not correct']
            })
        }
        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login to continue..',
                oldInput: {
                    email: email,
                    password: password,
                },
                validationErrors: ['email or password not correct']
            })
        }
        req.session.user = user;
        req.session.isLoggedIn = !0
        return req.session.save((err) => {
            res.redirect('/')
        })
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
}

const logOut = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect("/")
    })
}

export default {
    getSigninPage,
    getSignupPage,
    postSignup,
    postLogin,
    logOut
}