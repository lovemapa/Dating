'use strict'
const serviceModel = require('../../../models/serviceModel')
const CONSTANT = require('../../../constant')
const commonFunctions = require('../../common/controllers/commonFunctions')
const commonController = require('../../common/controllers/commonController')
const bookingModel = require('../../../models/bookingModel')

const moment = require('moment')

class user {


    signUp(data, files) {

        var verificationPhotos = []
        var photos = []
        return new Promise((resolve, reject) => {

            if (!data.email || !data.password) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else if (data.password != data.confirmPassword) {
                reject(CONSTANT.NOTSAMEPASSWORDS)
            }
            else {
                files.photos.map(result => {
                    verificationPhotos.push('/' + result.filename);

                });
                files.verificationPhotos.map(result => {
                    photos.push('/' + result.filename);

                });
                data.verificationPhotos = verificationPhotos
                data.photos = photos
                const user = this.createUser(data)
                user.save().then((result) => {

                    return resolve(result)

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
    // --------Create User Model------------
    createUser(data) {
        if (data.password)
            data.password = commonFunctions.hashPassword(data.password)


        let userData = new serviceModel({
            email: data.email,
            contact: data.contact,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            twitterId: data.twitterId,
            password: data.password,
            gender: data.gender,
            height: data.height,
            bustSize: data.bustSize,
            cupSize: data.cupSize,
            waistSize: data.waistSize,
            hipSize: data.hipSize,
            language: data.language,
            photos: data.photos,
            verificationPhotos: data.verificationPhotos,
            status: data.status,
            ratings: data.ratings,
            date: moment().valueOf()
        })
        return userData;
    }

    //
    login(data) {
        return new Promise((resolve, reject) => {
            if (!data.password && !data.username) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            if (!data.password)
                reject(CONSTANT.NOPASSWORDPROVIDED)
            else {
                serviceModel.findOne({ username: data.username }).then(result => {
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


    forgotPassword(data) {
        return new Promise((resolve, reject) => {
            if (!data.email)
                reject('Kindly Provide Email')
            serviceModel.findOne({ email: data.email }).then(result => {
                if (!result) {
                    reject(CONSTANT.NOTREGISTERED)
                }
                else {
                    const token = Math.floor(Math.random() * 10000)
                    serviceModel.findOneAndUpdate({ email: data.email }, { $set: { token: token } }).then(updateToken => {
                    })
                    commonController.sendMail(data.email, result._id, token, (result) => {
                        if (result.status === 1)
                            resolve(CONSTANT.VERIFYMAIL)

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
            serviceModel.findById(query.user).then(
                result => {

                    if (result && result.token == query.token) {

                        serviceModel
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
                            ).catch(error => {
                                if (error.errors)
                                    return reject(commonController.handleValidation(error))

                                return reject(error)
                            })
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

    addPhotos(data, files) {
        return new Promise((resolve, reject) => {
            var photos = []
            if ((!data._id && !files) || Object.keys(files).length === 0)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                files.photos.map(result => {
                    photos.push('/' + result.filename);

                });

                serviceModel.updateOne({ _id: data._id }, { $addToSet: { photos: photos } }).then(photos => {
                    if (photos.nModified === 1)
                        resolve(CONSTANT.ADDSUCCESS)
                    else
                        reject(CONSTANT.ADDFAIL)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }

    addVerificationPhotos(data, files) {
        return new Promise((resolve, reject) => {

            var verificationPhotos = []
            if ((!data._id && !files) || Object.keys(files).length === 0)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                files.verificationPhotos.map(result => {
                    verificationPhotos.push('/' + result.filename);

                });
                serviceModel.updateOne({ _id: data._id }, { $addToSet: { verificationPhotos: verificationPhotos } }).then(photos => {
                    if (photos.nModified === 1)
                        resolve(CONSTANT.ADDSUCCESS)
                    else
                        reject(CONSTANT.ADDFAIL)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))

                    return reject(error)
                })
            }
        })
    }

    acceptDenyRequest(data) {
        return new Promise((resolve, reject) => {
            if (!data.bookingId || !data.response)
                reject(CONSTANT.MISSINGPARAMS)
            var status
            if (data.response == 'accept')
                status = 'confirmed'
            else
                status = 'closed'
            console.log(data);

            bookingModel.findByIdAndUpdate({ _id: data.bookingId }, { $set: { status: status } }, { new: true }).then(update => {
                if (update)
                    resolve(update)
                else
                    reject(CONSTANT.SOMETHINGWRONG)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))

                return reject(error)
            })
        })
    }

    getRequestList(_id) {
        return new Promise((resolve, reject) => {
            if (!_id)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                var requests = []
                var bookings = []
                bookingModel.find({ serviceId: _id, status: { $ne: "closed" } }).populate({ path: 'avgratings' }).populate({ path: 'userId', select: '_id ratings nickName' }).then(result => {
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


    setStatus(data) {
        return new Promise((resolve, reject) => {
            console.log(data);

            if (!data._id || !data.status)
                reject(CONSTANT.MISSINGPARAMS)
            else {
                serviceModel.findByIdAndUpdate({ _id: data._id }, { $set: { status: parseInt(data.status) } }, { new: true }).then(updateStatus => {

                    console.log(updateStatus);
                    resolve(updateStatus)
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
module.exports = new user();