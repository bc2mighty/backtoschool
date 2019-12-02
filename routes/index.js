const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const Reports = require("../models/report")
const Volunteer = require("../models/volunteer")
const fs = require("fs")
const translate = require('google-translate-api')
const v = require('node-input-validator')

v.messages({
  required: 'The :attribute field must not be empty.',
  email: 'E-mail must be a valid email address.',
  even: 'The value of the field must be even number.',
  status: 'Invalid status'
})

router.get("/", async(req, res) => {
    res.render("index")
})

router.get("/translate", async(req, res) => {
  translate('I spea Dutch!', {from: 'en', to: 'nl'}).then(res => {
    console.log(res.text);
    //=> Ik spreek Nederlands!
    console.log(res.from.text.autoCorrected);
    //=> true
    console.log(res.from.text.value);
    //=> I [speak] Dutch!
    console.log(res.from.text.didYouMean);
    //=> false
  }).catch(err => {
    console.error(err);
  });
})

router.get("/volunteer", async(req, res) => {
    res.render("volunteer",{ errors: {},request: {}, res: {}})
})

router.post("/volunteer", async(req, res) => {
    // res.send(req.body)
    const request = {
        email_address: req.body.email_address,
        name: req.body.name,
        phone_number: req.body.phone_number,
        occupation: req.body.occupation,
        experience: req.body.experience_number,
        about: req.body.about
    }

    let validator = new v( req.body, {
          name:'required|string',
          occupation: 'required|string',
          experience_number:'required|string',
          email_address: 'required|email',
          phone_number: 'required|integer|minLength:11',
          about:'required|string'
    })

    validator.check().then((matched) => {
        if (!matched) {
             const errors = validator.errors
             // res.send(errors)
             // console.log(errors)
             renderPage("volunteer", errors, request, res)
        }else{
            // res.end("Validated")
            const volunteer = new Volunteer(request)
            volunteer.save()
              .then(result => {
                  req.flash('success', 'You have successfully voluntered on Back To School, we will get in touch with you shortly.')
                  res.redirect("/volunteer")
              })
              .catch(err => {
                  res.redirect("/")
              })
        }
    })
})

router.get("/donations", async(req, res) => {
    res.render("donations")
})

router.get("/convertIt/:stateid", async(req, res) => {
    const stateId = req.params.stateid
    let reports, states = {}, locals = []

    let stateRawData = fs.readFileSync(__dirname + "/../public/json/states.json")
    const stateJson = JSON.parse(stateRawData)
    stateJson.map(state => {
        if(state.country_id == 161 && state.id == stateId){
            states = state
        }
    })

    let localRawData = fs.readFileSync(__dirname + "/../public/json/local.json")
    const localJson = JSON.parse(localRawData)
    let stateJsonLabel = []
    localJson.map(local => {
        if(local.state.id == stateId){
            // locals.push(local.state.locals)
            // console.log(local.state.locals)
            var count = 0
            local.state.locals.forEach(localGovt => {
                console.log(++count)
                if(count < 10){
                    stateJsonLabel.push({label: localGovt.name, x: 0, y: 0})
                }
                // console.log(localGovt)
            })
        }
    })
    console.log(stateJsonLabel)
})

router.get("/state/:stateid", async(req, res) => {
    const stateId = req.params.stateid
    let reports, states = {}, locals = []

    try{
        reports = await Reports.find({state: stateId})
        let stateRawData = fs.readFileSync(__dirname + "/../public/json/states.json")
        const stateJson = JSON.parse(stateRawData)
        stateJson.map(state => {
            if(state.country_id == 161 && state.id == stateId){
                states = state
            }
        })

        let localRawData = fs.readFileSync(__dirname + "/../public/json/local.json")
        const localJson = JSON.parse(localRawData)
        localJson.map(local => {
            if(local.state.id == stateId){
                locals.push(local.state.locals)
                // console.log(local.state.locals
            }
        })
        console.log(states)
        res.render("state", {reports: reports, stateId: stateId, state: states, localGovernments: locals})
    }catch(err){
        console.log(err)
        res.send(err)
    }
})

router.get("/state/:stateId/donations", async(req, res) => {
    const stateId = req.params.stateid
    let reports
    try{
        reports = await Reports.find({state: stateId})
        res.send(reports)
    }catch(err){
        console.log(err)
        res.send(err)
    }
})

router.get("/charts", async(req, res) => {
    try {
        const reports = await Reports.find({}).populate('userId')

        res.render("charts",{
          reports: reports,
        })
    }catch(err){
        console.log(err)
        res.redirect("/user/login")
    }
})

function renderPage(link, errors = {}, request, res){
    res.render(link, {
        errors: errors,
        request: request
    })
}

module.exports = router
