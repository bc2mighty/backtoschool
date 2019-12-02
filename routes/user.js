const express = require("express")
const router = express.Router()
const v = require('node-input-validator');
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const User = require("../models/user")
const cscities = require("countrycitystatejson")
const Reports = require("../models/report")

v.messages({
  required: 'The :attribute field must not be empty.',
  email: 'E-mail must be a valid email address.',
  even: 'The value of the field must be even number.',
  status: 'Invalid status'
})
var Pusher = require('pusher');

var channels_client = new Pusher({
  appId: '849048',
  key: '6d73f17bc76526db774b',
  secret: '89e6d4e05f6eb4d3d9cc',
  cluster: 'eu',
  encrypted: true
})

const redirectLogin = (req, res, next) => {
    if(!req.session.userId){
        res.redirect("/user/login")
    }else{
        next()
    }
}

const redirectHome = (req, res, next) => {
    if(req.session.userId){
        res.redirect("/user/profile")
    }else{
        next()
    }
}

router.get("/login", redirectHome, async(req, res) => {
    res.render("users/login",{ errors: {},request: {}})
})

router.get("/profile", redirectLogin, async(req, res) => {
    const userId = req.session.userId
    try {
        const user = await User.findOne({_id: userId})

        res.render("users/profile",{
          errors: {},
          request: {},
          user_details: user
        })
    }catch(err){
        res.redirect("/user/login")
    }
})

router.get("/report", redirectLogin, async(req, res) => {
    const userId = req.session.userId
    try {
        // const user = await User.findOne({_id: userId})
        res.render("users/report",{
          errors: {},
          request: {},
          report: {}//This is from db
        })
    }catch(err){
        res.redirect("/user/login")
    }
})

router.post("/report", redirectLogin, async(req, res) => {
    const userId = req.session.userId
    const request = {
         name: req.body.name,
         age_range: req.body.age_range,
         gender: req.body.gender,
         state: req.body.state,
         local_government: req.body.local_government,
         city: req.body.city,
         address: req.body.address,
         parent_no: req.body.parent_no,
         cause: req.body.cause,
         userId: userId,
         createdAt: new Date(),
         agentId: ''
    }
    const user = await User.findOne({_id: userId})
    const err = {}
    let validator = new v( req.body, {
          name:'required|string',
          age_range: 'required|string',
          gender:'required|string',
          state: 'required|string',
          local_government: 'required|string',
          city: 'required|string',
          address: 'required|string',
          parent_no: 'required|integer|minLength:11',
          cause:'required|string'
    })

    validator.check().then((matched) => {
        if (!matched) {
            const errors = validator.errors
            console.log(request)
            renderReport("users/report", errors, request, res, {})
        }else{
            Reports(request).save()
            .then(report => {
                if(report){
                    channels_client.trigger('child-report', 'each-report', {
                        message: "Report Is Coming In",data: report
                    })
                    req.flash('success', 'Report saved successfully')
                    res.redirect("/user/report")
                }
            })
            .catch(err => {
                console.log(err)
            })
            // res.end("Here")
        }
    })
})

router.post("/profile", redirectLogin, async(req, res) => {
    const userId = req.session.userId
    const request = {
         email_address: req.body.email_address,
         phone_number: req.body.phone_number,
         full_name: req.body.full_name,
         state_of_origin: req.body.state_of_origin,
         nationality: req.body.nationality,
         occupation: req.body.occupation
    }
    const user = await User.findOne({_id: userId})
    const err = {}
    let validator = new v( req.body, {
          email_address:'required|email',
          phone_number: 'required|integer|minLength:11',
          full_name: 'required|string',
          state_of_origin: 'required|integer',
          nationality: 'required|integer',
          occupation: 'required|string'
    })

    validator.check().then((matched) => {
        if (!matched) {
            const errors = validator.errors
            // res.send(errors)
            renderPage("users/profile", errors, request, res, user_details = user)
        }else{
            // User.find({$and: [{_id : {$ne: userId}},{email_address: {$exists: true}}], function (err, docs) {
            //     console.log(docs)
            //     res.end("Here")
            //     if (docs != null && docs.length >= 1){
            //         const errors = {email_or_phone: "Email Address Already Exists for another user already"}
            //         return renderPage("users/profile", errors, request, res, user_details = user)
            //     }else{
            //         User.find({_id : {$ne: userId},phone_number: request.phone_number}, function (err, docs) {
            //             if (docs != null && docs.length >= 1){
            //                 const errors = {email_or_phone: "Phone Number Already Exists for another user already"}
            //                 return renderPage("users/profile", errors, request, res, user_details = user)
            //             }else{
            updateUser(userId, request, req, res, user)
            //             }
            //         })
            //     }
            // })
        }
    })
})

function updateUser(userId, request, req, res, user = null){
    User.updateOne({_id: userId},
      {$set: request})
    .exec()
    .then(result => {
          console.log(result)
          if(result){
              req.flash('success','User profile updated sucessfully!')
              res.redirect("/user/profile")
          }
    })
    .catch(err => {
        if (err.name === 'MongoError' && err.code === 11000) {
            const errors = {email_or_phone: "Email Or Phone Exists Already"}
            renderPage("users/profile", errors, request, res, user_details = user)
        }else{
            req.flash('success','Couldn\'t save your details, please try again!')
            res.redirect("/user/profile")
        }
    })
}

router.post("/login", redirectHome, async(req, res) => {
    // res.send(req.body)
    const request = {
         email_address: req.body.email_address,
         password: req.body.password
    }
    const err = {}
    let validator = new v( req.body, {
          email_address:'required|email',
          password: 'required|string'
    })
    validator.check().then((matched) => {
        if (!matched) {
             const errors = validator.errors
             const request = {
                 email_address: req.body.email_address,
                 password: req.body.password
             }
            renderPage("users/login", errors, request, res)
        }else{
            User.findOne({email_address: req.body.email_address})
            .then(user => {
              // console.log("here")
              bcrypt.compare(request.password, user.password)
                .then(result => {
                    if(result){
                        // res.send("Result true")
                        req.session.userId = user._id
                        req.session.email_address = user.email_address
                        req.session.phone_number = user.phone_number
                        // console.log(req.session.userId)

                        req.flash('success', 'Login successful')
                        res.redirect("/user/profile")
                    }else{
                        // res.send("Result false")
                         const request = {
                             email_address: req.body.email_address,
                             password: req.body.password
                         }
                         err = {email_or_phone: 'User not found'}
                         renderPage("users/login", err, request, res)
                    }
                })
                .catch(err => {
                    // res.send("Here")
                     const request = {
                         email_address: req.body.email_address,
                         password: req.body.password
                     }
                     err = {email_or_phone: 'User not found'}
                     // res.send(err)
                     renderPage("users/login", err, request, res)
                })
            })
            .catch(err => {
                 const request = {
                     email_address: req.body.email_address,
                     password: req.body.password
                 }
                 err = {email_or_phone: 'User not found'}
                 renderPage("users/login", err, request, res)
            })
        }
    })
})

router.get("/register", redirectHome, async(req, res) => {
    res.render("users/register",{ errors: {},request: {}})
})

router.post("/register", redirectHome, async(req, res) => {
    // res.send(req.body)
    const request = {
         email_address: req.body.email_address,
         password: req.body.password,
         phone_number: req.body.phone_number,
         full_name: req.body.full_name
     }
    let validator = new v( req.body, {
          email_address:'required|email',
          password: 'required|string',
          phone_number: 'required|integer|minLength:11',
          full_name: 'required|string'
    })
    validator.check().then((matched) => {
        if (!matched) {
             const errors = validator.errors
             const request = {
                 email_address: req.body.email_address,
                 password: req.body.password,
                 phone_number: req.body.phone_number,
                 full_name: req.body.full_name
             }
            renderPage("users/register", errors, request, res)
        }else{
            bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    const newUser = {
                        full_name: req.body.full_name,
                        phone_number: req.body.phone_number,
                        email_address: req.body.email_address,
                        password: hash,
                    }
                    User(newUser)
                    .save()
                    .then(user => {
                        req.flash('success', 'Registration successfully')
                        res.redirect("/user/login")
                    })
                    .catch(err => {
                          if(err.name === 'MongoError' && err.code === 11000) {
                               const errors = {email_or_phone: 'Email Address or Phone Number Already exists'}
                               renderPage("users/register", errors, request, res)
                          }else{
                              const errors = {}
                              if(typeof(err.email_address) != undefined){
                                  var email_address = {message: 'Email already exists'}
                                  errors['email_address'] = email_address
                              }else{
                                  errors.email_address = ''
                              }
                              if(typeof(err.phone_number) != undefined){
                                  var phone_number = {message: 'Phone Number already exists'}
                                  errors['phone_number'] = phone_number
                              }else{
                                  errors.phone_number.message = ''
                              }
                              renderPage("users/register", errors, request, res)
                          }
                    })
                })
                .catch(err => {
                    renderPage("users/register", err, request, res)
                })
        }
    })
})

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if(err){
            return res.redirect("/user/profile")
        }
        res.clearCookie('sid')
        res.redirect("/user/login")
    })
})

function renderPage(link, errors = {}, request, res, user_details = null){
    res.render(link, {
        errors: errors,
        request: request,
        user_details: user_details
    })
}

function renderReport(link, errors = {}, request, res, report){
    res.render(link, {
        errors: errors,
        request: request,
        report: report
    })
}

function createRequest(body) {
    const request = {}
    for(key in body){
        request.key = body.key
    }
    return request
}

module.exports = router
