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
    .post(upload.fields([{ name: 'photos', maxCount: 6 }, { name: 'verificationPhotos', maxCount: 6 }]), (req, res) => {

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


//Forgot Password

serviceRoute.route('/forget-password')
    .post((req, res) => {

        serviceController.forgotPassword(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: CONSTANT.CHANGEPASSWORDLINK

            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
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

                let url = `/api/service/forgetpassword?token=${req.query.token}&user=${req.query.user}`
                res.redirect(url)
            }
        )
    })
    

// Set Status Online /Offline

serviceRoute.route('/setStatus')
    .put((req, res) => {

        serviceController.setStatus(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG

            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })
//Add Photos
serviceRoute.route('/addPhotos').
    put(upload.fields([{ name: 'photos', maxCount: 10 }]), (req, res) => {
        console.log(req.files);

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
    put(upload.fields([{ name: 'verificationPhotos', maxCount: 10 }]), (req, res) => {
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

serviceRoute.route('/acceptDenyRequest').
    put((req, res) => {
        serviceController.acceptDenyRequest(req.body).then(result => {
            var message
            if (result.status == 'confirmed')
                message = CONSTANT.ACCEPTREQUEST
            else
                message = CONSTANT.REQUESTDECLINE
            return res.json({

                success: CONSTANT.TRUE,
                message: message,
                data: result
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })

// Change Password

serviceRoute.route('/changePassword').
    put((req, res) => {
        serviceController.changePassword(req.body).then(result => {
            return res.json({

                success: CONSTANT.TRUE,
                message: CONSTANT.UPDATEMSG,
                data: result
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })


//update Service Details
serviceRoute.route('/updateService').
    put((req, res) => {
        serviceController.updateService(req.body).then(result => {
            return res.json({

                success: CONSTANT.TRUE,
                message: CONSTANT.UPDATEMSG,
                data: result
            })
        }).catch(error => {
            console.log("error", error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS })
        })
    })


//Get request List
serviceRoute.route('/getRequestList')
    .post((req, res) => {
        serviceController.getRequestList(req.body).then(result => {
            return res.send({
                success: CONSTANT.TRUE,
                data: result
            })
        }).catch(err => {
            console.log(err);
            return res.json({ message: err, success: CONSTANT.FALSE })
        })
    })

//Provide Ratings to User
serviceRoute.route('/provideUserRatings')
    .put((req, res) => {
        serviceController.provideUserRatings(req.body).then(result => {
            return res.send({
                success: CONSTANT.TRUE,
                message: CONSTANT.UPDATEMSG
            })
        }).catch(err => {
            console.log(err);
            return res.json({ message: err, success: CONSTANT.FALSE })
        })
    })


//Add issue by service
serviceRoute.route('/addIssue')
    .post(upload.fields([{ name: 'issueimage', maxCount: 1 }]), (req, res) => {
        console.log(req.body, req.files);

        serviceController.addIssue(req.body, req.files).then(result => {
            return res.send({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.ISSUESUCCESSFULLY
            })
        }).catch(err => {
            console.log(err);
            return res.json({ message: err, success: CONSTANT.FALSE })
        })
    })
module.exports = serviceRoute;