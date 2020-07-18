export  default (req, res, next) => {
    if(!req.session.isLoggedIn) {
        req.flash('error',  'You need to login to proceed')
        return res.redirect('/login')
    }
    next()
}