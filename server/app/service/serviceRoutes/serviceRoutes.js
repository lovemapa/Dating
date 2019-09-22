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


// Set Status Online /Offline

serviceRoute.route('/setStatus')
    .patch((req, res) => {

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

serviceRoute.route('/acceptDenyRequest').
    patch((req, res) => {
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
    patch((req, res) => {
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