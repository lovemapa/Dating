const express = require('express')
const serviceController = require('../serviceControllers/serviceControllers')
const CONSTANT = require('../../../constant')
const rn = require('random-number')
const multer = require('multer');


const storage = multer.diskStorage({
    destination: process.cwd() + "/public/uploads/",
    filename: function (req, file, cb) {

        cb(
            null,
            "img_" +
            rn({
                min: 1001,
                max: 9999,
                integer: true
            }) +
            "_" +
            Date.now() +
            ".jpeg"
        );
    }
});
const upload = multer({ storage: storage })

let serviceRoute = express.Router()


//User Register

serviceRoute.route('/signup')
    .post(upload.fields([{ name: 'photos', maxCount: 10 }, { name: 'verificationPhotos', maxCount: 10 }]), (req, res) => {

        serviceController.signUp(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.SIGNUPSUCCESS,

            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })
    })


// User Login

serviceRoute.route('/login')
    .post((req, res) => {

        serviceController.login(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result

            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })

//Forgot Password

serviceRoute.route('/forget-password')
    .post((req, res) => {

        serviceController.forgotPassword(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result

            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })

// Set Error Message for forgetPassword

serviceRoute.route('/forgetpassword').
    get((req, res) => {
        if (!(req.query.user || req.query.token)) {
            res.redirect('/server/app/views/404-page')
        }
        let message = req.flash('errm');
        console.log("messagev", message);

        res.render('forgetPassword', { title: 'Forget password', message })
    })


// Verify Passowrd

serviceRoute.route('/forgetpassword').
    post((req, res) => {
        serviceController.forgetPasswordVerify(req.body, req.query).then(
            message => {
                res.render('forgetPassword', { message: message, title: 'Forget password' })
            },
            err => {
                if (err.expired) {
                    return res.send(`<h1 style="text-align:center; font-size:100px" >Forget password link has been expired.</h1>`)
                }
                req.flash('errm', err)

                let url = `/charity/user/forgetpassword?token=${req.query.token}&user=${req.query.user}`
                res.redirect(url)
            }
        )
    })

//Add Photos
serviceRoute.route('/addPhotos').
    patch(upload.fields([{ name: 'photos', maxCount: 10 }]), (req, res) => {
        serviceController.addPhotos(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                message: CONSTANT.ADDSUCCESS
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })

//Add Verification Photo
serviceRoute.route('/addVerificationPhotos').
    patch(upload.fields([{ name: 'verificationPhotos', maxCount: 10 }]), (req, res) => {
        serviceController.addVerificationPhotos(req.body, req.files).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                message: CONSTANT.ADDSUCCESS
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })

// Accept Request

serviceRoute.route('/acceptRequest/:request_id').
    patch((req, res) => {
        serviceController.acceptRequest(req.params.request_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                message: CONSTANT.ACCEPTREQUEST
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })

//Get request List
serviceRoute.route('/getRequestList/:service_id')
    .get((req, res) => {
        serviceController.getRequestList(req.params.service_id).then(result => {
            return res.send({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(err => {
            console.log(err);
            return res.json({ message: err, success: CONSTANT.FALSE })
        })
    })
module.exports = serviceRoute;