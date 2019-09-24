const express = require("express");
const service = require('../app/service/serviceRoutes/serviceRoutes')
const user = require('../app/user/userRoutes/userRoute')
const admin = require('../app/admin/adminRoutes/adminRoutes')




const charityRoutes = express.Router()
charityRoutes.use('/service', service)
charityRoutes.use('/user', user)
charityRoutes.use('/admin', admin)


module.exports = charityRoutes;