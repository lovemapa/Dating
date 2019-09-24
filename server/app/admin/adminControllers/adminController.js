'use strict'
const adminModel = require('../../../models/adminModel')
const bookingModel = require('../../../models/bookingModel')
const serviceModel = require('../../../models/serviceModel')
const userModel = require('../../../models/userModel')
const CONSTANT = require('../../../constant')
const commonFunctions = require('../../common/controllers/commonFunctions')
const commonController = require('../../common/controllers/commonController')
const moment = require('moment')
const generate = require('csv-generate')
const assert = require('assert')
const { Parser } = require('json2csv');

const fs = require('fs')


class admin {

    signUp(data) {

        return new Promise((resolve, reject) => {

            if (!data.email || !data.password) {
                reject(CONSTANT.EMAILPASSWORDPARAMS)
            }
            else {
                const adminRegster = this.createAdmin(data)
                adminRegster.save().then((saveresult) => {
                    resolve(saveresult)

                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    // --------Create Admin Registration Model------------
    createAdmin(data) {

        data.password = commonFunctions.hashPassword(data.password)
        let adminRegistrationData = new adminModel({
            email: data.email,
            password: data.password,
            date: moment().valueOf()
        })
        return adminRegistrationData;
    }

    // admin Login

    login(data) {
        return new Promise((resolve, reject) => {
            if (!data.password || !data.email) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else {
                adminModel.findOne({ email: data.email }).then(result => {
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


    editUser(data, file) {
        return new Promise((resolve, reject) => {

            if (!data) {
                reject(CONSTANT.MISSINGPARAMS)
            }
            else {
                var query = {}
                if (data.nickName)
                    query.nickName = data.nickName
                if (file)
                    query.profilePic = '/' + file.filename
                if (data.email)
                    query.email = data.email
                if (data.countryCode)
                    query.countryCode = data.countryCode
                if (data.state)
                    query.state = data.state
                if (data.area)
                    query.area = data.area
                if (data.password)
                    query.password = commonFunctions.hashPassword(data.password)
                console.log(query);
                userModel.findByIdAndUpdate({ _id: data._id }, { $set: query }, { new: true }).then(update => {
                    resolve(update)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            }
        })
    }

    deleteUser(_id) {
        if (!_id) {
            reject(CONSTANT.MISSINGPARAMS)
        }
        else {
            return new Promise((resolve, reject) => {
                userModel.findByIdAndUpdate({ _id: _id }, { $set: { isDeleted: 1 } }, { new: true }).then(del => {
                    resolve(del)
                }).catch(error => {
                    if (error.errors)
                        return reject(commonController.handleValidation(error))
                    return reject(error)
                })
            })
        }
    }

    generateCSV(req, res) {
        let fields = ["_id", "email", "countryCode", "nickName", "area", "state", "callType"]

        const opts = { fields };

        try {
            userModel.find().then(data => {
                const parser = new Parser(opts);
                var array = []
                data.map(value => {
                    var csvData = {}
                    csvData._id = value._id
                    csvData.email = value.email;
                    csvData.countryCode = value.countryCode;
                    csvData.nickName = value.nickName;
                    csvData.area = value.area;
                    csvData.state = value.state;
                    csvData.callType = value.callType;
                    array.push(csvData)
                })
                // array.map(cs => {

                //     console.log(cs);
                // })
                const csv = parser.parse(array);
                fs.writeFile('./public/csv/pawan' + Date.now() + ".csv", csv, err => {
                    if (err)
                        console.log(data);
                    else
                        res.download('/home/pawan/Desktop/response.csv')
                })



            }).catch(err => {
                console.log(err);

            })
        } catch (err) {
            console.error(err);
        }

    }


    getRequestCount() {
        return new Promise((resolve, reject) => {
            bookingModel.aggregate([
                {
                    $group: {
                        "_id": "$status",
                        "count": { $sum: 1 }
                    }
                }

            ]).then(result => {
                resolve(result)
            }).catch(error => {
                if (error.errors)
                    return reject(commonController.handleValidation(error))
                return reject(error)
            })
        })
    }
}
module.exports = new admin()