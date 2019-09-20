const express = require("express");
const service = require('../app/service/serviceRoutes/serviceRoutes')
const user = require('../app/user/userRoutes/userRoute')




const charityRoutes = express.Router()
charityRoutes.use('/service', service)
charityRoutes.use('/user', user)


module.exports = charityRoutes;