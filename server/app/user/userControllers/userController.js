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
class charity {
    signUp(data) {

        return new Promise((resolve, reject) => {
            console.log(data);

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
                    commonController.sendMail(saveresult.email, token, result => {
                        if (result.status === 1)
                            console.log(result.message.response);
                        else
                            reject(result.message)
                    })
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    if (error.code === 11000)
                        return reject(CONSTANT.EXISTSMSG)
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
            callType: data.callType,
            area: data.area,
            state: data.state,
            date: moment().valueOf()
        })
        return userRegistrationData;
    }

    // login for Charity organization

    login(data) {
        return new Promise((resolve, reject) => {
            if (!data.password && !data.email) {
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

    //verification of email

    verifyEmail(data) {
        return new Promise((resolve, reject) => {
            if (!data._id || !data.token)
                reject(CONSTANT.MISSINGPARAMS)

            else {

                userModel.findOne({ _id: data._id }).then(result => {
                    if (result) {
                        if (result.token == data.token)
                            resolve(result)
                        else
                            reject(CONSTANT.VERFIEDFALSE)
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

        })
    }
    servicesList() {
        return new Promise((resolve, reject) => {

            serviceModel.find({ status: { $ne: 0 } }).select('_id  firstName lastName profilePic').populate({ path: 'avgratings' }).
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
                serviceModel.find({ _id: _id }).then(result => {
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
            serviceId: data.serviceId
        })
        return BookingRegistrationData;
    }
    getRequestList(_id) {
        return new Promise((resolve, reject) => {
            if (!_id)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                var requests = []
                var bookings = []
                bookingModel.find({ userId: _id }).populate({ path: 'serviceId', select: '_id ratings firstName lastName' }).then(result => {

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



}

module.exports = new charity();