const router = require("express").Router()
const mongoose = require("mongoose")
const Report = require("../models/report")
const Donation = require("../models/donations")
const bodyParser = require('body-parser')
const CircularJSON = require("circular-json")
const fs = require("fs")
const cors = require("cors")


router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())
router.use(cors())
router.post("/", async(req, res) => {
    return res.status(200).json({'message':'Hey, gotten here'})
})

router.post("/saveDonation", async(req, res) => {
    let donation = new Donation({
        name: req.body.name,
        amount: req.body.amount,
        cause: req.body.cause,
        state: req.body.state,
        local_government: req.body.local_government,
        txRef: req.body.txref
    })
    try{
        const newDonation = await donation.save({})
        return res.status(200).json({success: true, message: "Donation Saved Successfully!"})
    }catch(err){
        return res.status(500).json({success: false, message: "Donation could not be Saved Successfully!",error: err})
    }

})

router.get("/reports", async(req, res) => {
    Report.find()
    .then(reports => {
        res.status(200).json({success: true,reports: reports})
    })
    .catch(err => {
        res.status(200).json({success: false,errors: err})
    })
})

router.post("/getStateLocals", async(req, res) => {
    let reports, states = {}, locals = {}
    const stateId = req.body.stateId

    try{
        reports = await Report.find({state: stateId})
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
                local.state.locals.forEach(localGovt => {
                    // console.log(localGovt)
                    stateJsonLabel.push({label: localGovt.name, x: 0, y: 0})
                })
            }
        })
        // console.log(states)
        res.status(200).json({success: true, reports: reports, stateId: stateId, state: states, localGovernments: locals, stateJsonLabel: stateJsonLabel})
    }catch(err){
        console.log(err)
        res.status(500).json({success: false,error: err})
    }
})

router.post("/check_child_details", async(req, res) => {
    // let name = /`${req.body.name}`/i
    let name = req.body.name
    let city = req.body.city
    let gender = req.body.gender
    let state = req.body.state
    let local_government = req.body.local_government
    let reports

    if(name != '' && name != null){
        var regexName = new RegExp(name, "i")
        reports = await Report.find({ 'name': { "$regex": regexName } })
            .exec()
    }

    if(city != '' && city != null){
        var regexCity = new RegExp(city, "i")
        reports = await Report.find({ 'city': { "$regex": regexCity } })
            .exec()
    }

    if(gender != '' && gender != null){
        var regexGender = new RegExp(gender, "i")
        reports = await Report.find({ 'name': { "$regex": regexGender } })
            .exec()
    }

    if(state != '' && state != null){
        var regexState = new RegExp(state, "i")
        reports = await Report.find({ 'city': { "$regex": regexState } })
            .exec()
    }

    if(local_government != '' && local_government != null){
        var regexLocal = new RegExp(local_government, "i")
        reports = await Report.find({ 'city': { "$regex": regexLocal } })
            .exec()
    }

    // res.send(CircularJSON.stringify(reports))
    return res.status(200).json({request: req.body,reports: reports})
})

module.exports = router;
