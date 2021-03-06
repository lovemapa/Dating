'use strict'
const userModel = require('../../../models/userModel')
const bookingModel = require('../../../models/bookingModel')
const serviceModel = require('../../../models/serviceModel')
const CONSTANT = require('../../../constant')
const commonFunctions = require('../../common/controllers/commonFunctions')
const commonController = require('../../common/controllers/commonController')
const charityDocsModel = require('../../../models/charityDocumentModel')
const favouritesModel = require('../../../models/favouritesModel')
const moment = require('moment')
const rn = require('random-number')
const userIssue = require('../../../models/usersIssueModel')
var CronJob = require('cron').CronJob;



class charity {
    signUp(data) {

        return new Promise((resolve, reject) => {

            if (data.password != data.confirmPassword) {
                reject(CONSTANT.NOTSAMEPASSWORDS)
            }
            if (!data.email && !data.password) {
                reject(CONSTANT.EMAILPASSWORDPARAMS)
            }
            else {
                const token = rn({
                    min: 1001,
                    max: 9999,
                    integer: true
                })
                data.token = token
                const userRegister = this.createUserRegistration(data)
                userRegister.save().then((saveresult) => {
                    resolve({ message: CONSTANT.VERIFYMAIL, result: saveresult })
                    commonController.sendMailandVerify(saveresult.email, saveresult._id, token, 'user', result => {
                        if (result.status === 1)
                            console.log(result.message.response);
                        else
                            reject(result.message)
                    })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error.code === 11000)
                        return reject(CONSTANT.UNIQUEEMAILANDUSERNAME)
                    return reject(error)
                })
            }
        })
    }
    // --------Create User Registration Model------------
    createUserRegistration(data) {

        data.password = commonFunctions.hashPassword(data.password)
        let userRegistrationData = new userModel({
            email: data.email,
            countryCode: data.countryCode,
            nickName: data.nickName,
            password: data.password,
            token: data.token,
            //   callType: data.callType,
            // area: data.area,
            //state: data.state,
            //genderPreference: data.genderPreference,
            gender: data.gender,
            date: moment().valueOf()
        })
        return userRegistrationData;
    }

    // login for User

    login(data) {
        return new Promise((resolve, reject) => {
            if (!data.password && !data.username) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            if (!data.password)
                reject(CONSTANT.NOPASSWORDPROVIDED)
            else {
                userModel.findOne({ nickName: data.username }).then(result => {
                    if (!result) {
                        reject(CONSTANT.NOTREGISTERED)
                    }
                    else {
                        if (commonFunctions.compareHash(data.password, result.password)) {
                            resolve(result)
                        }
                        else
                            reject(CONSTANT.WRONGCREDENTIALS)
                    }
                })
            }

        })
    }

    verify(query) {
        return new Promise((resolve, reject) => {
            if (!query.user)
                reject(CONSTANT.MISSINGPARAMS)

            else {
                userModel.findById(query.user).then(result => {
                    if (result.token == query.token) {
                        userModel.findByIdAndUpdate(query.user, { $set: { isVerified: true } }, { new: true }).then(result => {
                            if (result) {

                                resolve(result)

                            }
                            else
                                reject(CONSTANT.NOTREGISTERED)
                        })
                            .catch(error => {
                                if (error.errors)
                                    return reject(commonController.handleValidation(error))
                                if (error)
                                    return reject(error)
                            })
                    }
                    else {
                        reject("UNAUTHORIZED")
                    }
                })

            }

        })
    }

    //verification of email

    verifyEmail(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)

            else {


                userModel.findOne({ _id: data.userId }).then(result => {
                    if (result.isVerified) {
                        resolve(result)
                    }
                    else
                        reject(CONSTANT.NOTVERIFIED)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }

        })
    }

    resendVerification(data) {
        return new Promise((resolve, reject) => {
            if (!data.email)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const token = rn({
                    min: 1001,
                    max: 9999,
                    integer: true
                })
                userModel.findOneAndUpdate({ email: data.email }, { $set: { token: token } }, { new: true }).then(updateResult => {
                    if (updateResult == null)
                        reject(CONSTANT.NOTREGISTERED)
                    resolve(updateResult)
                    commonController.sendMail(data.email, null, token, null, result => {
                        if (result.status === 1)
                            console.log(result.message.response);

                        else
                            reject(CONSTANT.SOMETHINGWRONG)
                    })
                })
            }
        })


    }

    completeRegistration(data) {
        return new Promise((resolve, reject) => {
            if (!data.genderPreference || !data.state || !data.area || !data.callType)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                var query = {}

                if (data.genderPreference)
                    query.genderPreference = data.genderPreference
                if (data.state)
                    query.state = data.state
                if (data.area)
                    query.area = data.area
                if (data.callType)
                    query.callType = data.callType

                userModel.findByIdAndUpdate({ _id: data._id }, { $set: query }, { new: true }).then(updateResult => {
                    resolve(updateResult)
                    commonController.sendMail(data.email, token, result => {
                        if (result.status === 1)
                            console.log(result.message.response);

                        else
                            reject(CONSTANT.SOMETHINGWRONG)
                    })
                })
            }
        })


    }

    forgotPassword(data) {
        return new Promise((resolve, reject) => {
            console.log(data);

            if (!data.email)
                reject('Kindly Provide Email')
            userModel.findOne({ email: data.email }).then(result => {
                if (!result) {
                    reject(CONSTANT.NOTREGISTERED)
                }
                else {
                    const token = rn({
                        min: 1001,
                        max: 9999,
                        integer: true
                    })
                    userModel.findOneAndUpdate({ email: data.email }, { $set: { token: token } }).then(updateToken => {
                        resolve(CONSTANT.VERIFYMAIL)
                    })
                    commonController.sendMail(data.email, result._id, token, 'user', (result) => {

                        if (result.status === 1)
                            console.log(result.message.response);

                        else
                            reject(result.message)
                    })

                }
            })

        })
    }

    forgetPasswordVerify(body, query) {
        return new Promise((resolve, reject) => {

            if (body.confirmpassword != body.password)
                return reject("Password and confirm password not matched.")
            userModel.findById(query.user).then(
                result => {

                    if (result && result.token == query.token) {

                        userModel
                            .findByIdAndUpdate(query.user, {
                                password: commonFunctions.hashPassword(body.password),
                                token: ""
                            })
                            .then(
                                result1 => {
                                    return resolve('Password changed successfully.')
                                },
                                err => {
                                    return reject(err)
                                }
                            )
                    }
                    else {
                        return reject({ expired: 1 })
                    }
                },
                err => {
                    return reject(err)
                }
            )
        })
    }
    servicesList(data) {
        return new Promise((resolve, reject) => {
            console.log(data);

            var LIMIT = {}
            if (data.isVerified == 'false')
                LIMIT = { skip: 10, limit: 5 }
            console.log(LIMIT);

            serviceModel.find({ status: { $ne: 0 }, isDeleted: 0 }, {}, LIMIT).select('_id  firstName lastName profilePic').populate({ path: 'avgratings' }).
                then(result => {

                    resolve(result)
                })
                .catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error)
                        return reject(error)
                })


        })
    }
    displayProfile(_id) {
        return new Promise((resolve, reject) => {
            if (!_id)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                serviceModel.find({ _id: _id }).select('_id  firstName lastName profilePic twitterId eyesColor language bodyType measurments').populate({ path: 'avgratings' }).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    createBooking(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId || !data.serviceId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const bookingRegister = this.createBookingRegistration(data)
                bookingRegister.save().then((saveresult) => {
                    resolve(saveresult)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }

    // --------Create Booking Registration Model------------
    createBookingRegistration(data) {


        let BookingRegistrationData = new bookingModel({

            // moment().add(1, "hour").add(10, "minute").valueOf()
            schedule: data.schedule,
            location: data.location,
            houseName: data.houseName,
            houseNumber: data.houseNumber,
            contact: data.contact,
            userId: data.userId,
            serviceId: data.serviceId,
            date: moment().valueOf()
        })
        return BookingRegistrationData;
    }
    getRequestList(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                var query = {}
                if (data.bookingId) {
                    query.userId = data.userId;
                    query._id = data.bookingId;
                    query.status = { $ne: "closed" }
                }
                else {
                    query.userId = data.userId;
                    query.status = { $ne: "closed" }
                }


                var requests = []
                var bookings = []
                bookingModel.find(query).populate({ path: 'serviceId', select: '_id ratings firstName lastName', populate: { path: "avgratings" } }).then(result => {

                    result.map(category => {
                        if (category.status == 'pending')
                            requests.push(category)
                        else
                            bookings.push(category)
                    })

                    resolve({ requests: requests, bookings: bookings })
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }
    //add Favorites
    addFavourites(data) {
        return new Promise((resolve, reject) => {
            if (!data.userId || !data.serviceId)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                const fav = new favouritesModel({
                    userId: data.userId,
                    serviceId: data.serviceId
                })
                fav.save().then(save => {
                    resolve(save)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error)
                        return reject(error)
                })

            }
        })
    }

    //Show Favourites List
    showFavourites(_id) {
        return new Promise((resolve, reject) => {
            if (!_id)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                favouritesModel.find({ userId: _id }).select('userId').populate({
                    path: 'serviceId', select: 'firstName lastName profilePic', populate: { path: 'avgratings' }
                }).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    removeFavourites(_id) {
        return new Promise((resolve, reject) => {
            if (!_id)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                favouritesModel.deleteOne({ serviceId: _id }).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    provideServiceRatings(data) {
        return new Promise((resolve, reject) => {
            if (!data.bookingId)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                bookingModel.findByIdAndUpdate({ _id: data.bookingId }, { $set: { serviceRatings: data.ratings } }).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }


    changePassword(data) {
        return new Promise((resolve, reject) => {

            if (!data.oldPassword || !data.newPassword || !data.confirmPassword || !data._id)
                reject(CONSTANT.MISSINGPARAMS)
            if (data.confirmPassword != data.confirmPassword)
                reject(CONSTANT.NOTSAMEPASSWORDS)
            else {
                userModel.findOne({ _id: data._id }).then(oldPass => {

                    if (commonFunctions.compareHash(data.oldPassword, oldPass.password)) {
                        userModel.findByIdAndUpdate({ _id: data._id }, { $set: { password: commonFunctions.hashPassword(data.newPassword) } }, { new: true }).then(update => {
                            resolve(update)
                        })
                    }
                    else {
                        reject(CONSTANT.WRONGOLDPASS)
                    }
                    resolve(oldPass)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }


    addIssue(data, file) {
        console.log(file);

        return new Promise((resolve, reject) => {
            if (!data.userId || !data.issue || !file || Object.keys(file).length === 0)
                reject(CONSTANT.MISSINGPARAMS)
            else {

                file.issueimage.map(result => {
                    data.screenshot = '/' + result.filename

                });
                const issue = this.createUserService(data)
                issue.save({}).then(result => {
                    resolve(result)
                })
                    .catch(error => {
                        if (error.errors)
                            return reject(commonController.handleValidation(error))
                        if (error)
                            return reject(error)
                    })
            }
        })
    }

    createUserService(data) {
        let issueData = new userIssue({
            userId: data.userId,
            screenshot: data.screenshot,
            issue: data.issue
        })
        return issueData
    }
    cronJob() {
        new CronJob('* * * * *', function () {
            bookingModel.find({ status: "pending" }).then(result => {
                result.forEach(value => {

                    if (((Date.now() - value.date) / 60000) > 5) {
                        bookingModel.updateMany({ _id: value._id }, { $set: { status: "closed", ratings: -1 } }, { multi: true }).
                            then(updateResult => {
                                console.log(updateResult);
                            })
                    }
                })
            })

        }, null, true, 'America/Los_Angeles');
    }

}

module.exports = new charity();