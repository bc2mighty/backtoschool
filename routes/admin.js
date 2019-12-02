const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const User = require("../models/user")
const Report = require("../models/report")
const Volunteer = require("../models/volunteer")
const Donation = require("../models/donations")
const Agent = require("../models/agents")
const v = require('node-input-validator');

v.messages({
  required: 'The :attribute field must not be empty.',
  email: 'E-mail must be a valid email address.',
  even: 'The value of the field must be even number.',
  status: 'Invalid status'
})

const redirectLogin = (req, res, next) => {
    if(!req.session.email_address){
        res.redirect("/admin/login")
    }else{
        next()
    }
}

const redirectHome = (req, res, next) => {
    if(req.session.email_address){
        res.redirect("/admin")
    }else{
        next()
    }
}

router.get("/login", redirectHome, async(req, res) => {
    res.render("admin/login",{ errors: {},request: {}})
})

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
            renderPage("admin/login", errors, request, res)
        }else{
            console.log(request)
            if(request.email_address == 'admin@backtoschool.com' && request.password == 'mighty'){
                req.session.email_address = request.email_address
                req.flash('success', 'Login successful')
                res.redirect("/admin")
            }else{
                const errors = {email_or_phone: 'Admin Details not found'}
                renderPage("admin/login", errors, request, res)
            }
        }
    })
})

router.get("/", redirectLogin, async(req, res) => {
    try{
        const userLen = await User.find().countDocuments()
        const donationLen = await Donation.find().countDocuments()
        const reportLen = await Report.find().countDocuments()
        const volunteerLen = await Volunteer.find().countDocuments()
        res.render("admin/index", {userLen: userLen, donationLen: donationLen, reportLen: reportLen, volunteerLen: volunteerLen})
    }catch(err){
        res.redirect("/admin/logout")
    }
})

router.get("/agents", redirectLogin, async(req, res) => {
    try{
        const agents = await Agent.find()
        res.render("admin/agents", {agents: agents})
    }catch(err){
        res.end("Error Here")
        console.log(err)
    }
})

router.get("/agent/create", redirectLogin, async(req, res) => {
    // const request = {
    //     email_address: req.body.email_address,
    //     full_name: req.body.full_name,
    //     phone_number: req.body.phone_number,
    //     password: req.body.password
    // }
    res.render("admin/createAgent", {request: {}, errors: {}})
})

router.post("/agent/create", redirectLogin, async(req, res) => {
    // res.send(req.body)
    const request = {
        email_address: req.body.email_address,
        full_name: req.body.full_name,
        phone_number: req.body.phone_number,
        password: req.body.password
    }
    const err = {}
    let validator = new v( req.body, {
          email_address:'required|email',
          password: 'required|string',
          phone_number: 'required|integer|minLength:11',
          full_name: 'required|string',
    })
    validator.check().then((matched) => {
        if (!matched) {
            const errors = validator.errors
            renderPage("admin/createAgent", errors, request, res)
        }else{
            // console.log(request)
            bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    const newAgent = {
                        full_name: req.body.full_name,
                        phone_number: req.body.phone_number,
                        email_address: req.body.email_address,
                        password: hash,
                    }
                    Agent(newAgent)
                    .save()
                    .then(agent => {
                        req.flash('success', 'Agent Creatd Successfully!')
                        res.redirect("/admin/agents")
                    })
                    .catch(err => {
                          if(err.name === 'MongoError' && err.code === 11000) {
                               const errors = {email_or_phone: 'Email Address or Phone Number Already exists'}
                               renderPage("admin/createAgent", errors, request, res)
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
                              renderPage("admin/createAgent", errors, request, res)
                          }
                    })
            })
            .catch(err => {
                renderPage("users/register", err, request, res)
            })
        }
    })
})

router.get("/volunteers", redirectLogin, async(req, res) => {
  try {
      const volunteers = await Volunteer.find()

      // volunteers.forEach(volunteer => {
          // console.log(volunteers)
      // })
      res.render("admin/volunteers", {volunteers: volunteers})
  } catch (e) {
      req.flash('success', 'Volunteers Not found!')
      res.redirect("/admin/volunteers")
  }
})

router.get("/donations", redirectLogin, async(req, res) => {
  try {
      const donations = await Donation.find()

      // volunteers.forEach(volunteer => {
          // console.log(donations)
      // })
      res.render("admin/donations", {donations: donations})
  } catch (e) {
      req.flash('success', 'Volunteers Not found!')
      res.redirect("/admin/donations")
  }
})

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if(err){
            return res.redirect("/admin")
        }
        res.clearCookie('sid')
        res.redirect("/admin/login")
    })
})

function renderPage(link, errors = {}, request, res, ){
    res.render(link, {
        errors: errors,
        request: request
    })
}

module.exports = router
