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
adminRoute.route('/editUser')
    .patch(upload, (req, res) => {
        adminController.editUser(req.body, req.file, req.params._id).then(result => {
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

adminRoute.route('/generateCSV')
    .post((req, res) => {
        adminController.generateCSV(req, res)
        // .then(result => {
        //     res.download(result)
        //     return res.json({
        //         success: CONSTANT.TRUE,
        //         data: result,

        //     })
        // }).catch(error => {
        //     console.log(error);

        //     return res.json({ message: error, status: CONSTANT.FALSESTATUS, success: CONSTANT.FALSE })
        // })

    })
module.exports = adminRoute