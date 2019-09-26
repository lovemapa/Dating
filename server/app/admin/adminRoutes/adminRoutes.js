const express = require('express')
const adminController = require('../adminControllers/adminController')
const CONSTANT = require('../../../constant')
const multer = require('multer');
const rn = require('random-number')



const adminRoute = express.Router()
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
const upload = multer({ storage: storage }).single('file')

//Register Admin 
adminRoute.route('/register')
    .post((req, res) => {
        adminController.signUp(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.SIGNUPSUCCESS,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })


//edit User    
adminRoute.route('/editUser')
    .patch(upload, (req, res) => {
        adminController.editUser(req.body, req.file).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Edit service
adminRoute.route('/editService')
    .patch(upload, (req, res) => {
        adminController.editService(req.body, req.file).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })


// Login Admin
adminRoute.route('/login')
    .post(upload, (req, res) => {
        adminController.login(req.body, req.file, req.params._id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Delete User
adminRoute.route('/deleteUser/:user_id')
    .patch((req, res) => {
        adminController.deleteUser(req.params.user_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.DELETEMSG

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Delete Service
adminRoute.route('/deleteService/:service_id')
    .patch((req, res) => {
        adminController.deleteService(req.params.service_id).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.DELETEMSG

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })

//Get all request Count
adminRoute.route('/getRequestCount')
    .get((req, res) => {
        adminController.getRequestCount().then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })


//Generate User's CSV
adminRoute.route('/generateUserCSV')
    .post((req, res) => {
        adminController.generateUserCSV(req, res)
    })



//Generate Service's CSV
adminRoute.route('/generateServiceCSV')
    .post((req, res) => {
        adminController.generateServiceCSV(req, res)
    })


//Show alll requests List (pending , closed, ongoing)
adminRoute.route('/displayBookings')
    .get((req, res) => {
        adminController.displayBookings().then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })

    })


//Update Bookings
adminRoute.route('/updateBooking')
    .patch((req, res) => {
        adminController.updateBooking(req.body).then(result => {
            return res.json({
                success: CONSTANT.TRUE,
                data: result,
                message: CONSTANT.UPDATEMSG

            })
        }).catch(error => {
            console.log(error);

            return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        })



    })
module.exports = adminRoute