const express = require('express')
const router = express.Router()
const Lead = require('../models/Lead')
const nodemailer = require('nodemailer')

const sendAlert = async (lead) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Lead: ${lead.name} (${lead.source})`,
      text: `
        Name: ${lead.name}
        Email: ${lead.email}
        Phone: ${lead.phone}
        Source: ${lead.source}
        Service: ${lead.service}
      `
    })
  } catch (err) {
    console.log('Email error:', err.message)
  }
}

// ✅ Meta Webhook Verify — Meta isko check karta hai
router.get('/meta', (req, res) => {
  const mode      = req.query['hub.mode']
  const token     = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === 'lms_secret_123') {
    console.log('Meta Webhook Verified!')
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Forbidden')
  }
})

// Website leads
router.post('/website', async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, source: 'website' })
    sendAlert(lead)
    res.json({ success: true, lead })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Meta leads
router.post('/meta', async (req, res) => {
  try {
    // Meta real data parse karo
    const entry    = req.body.entry?.[0]
    const change   = entry?.changes?.[0]?.value
    const leadData = change?.leadgen_id ? {
      name:     change.field_data?.find(f => f.name === 'full_name')?.values?.[0]  || 'Meta Lead',
      email:    change.field_data?.find(f => f.name === 'email')?.values?.[0]      || '',
      phone:    change.field_data?.find(f => f.name === 'phone_number')?.values?.[0] || '',
      campaign: change.ad_name || '',
      source:   'meta'
    } : {
      ...req.body,
      source: 'meta'
    }

    const lead = await Lead.create(leadData)
    sendAlert(lead)
    res.json({ success: true, lead })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Google leads
router.post('/google', async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, source: 'google' })
    sendAlert(lead)
    res.json({ success: true, lead })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router








// const express = require('express')
// const router = express.Router()
// const Lead = require('../models/Lead')
// const nodemailer = require('nodemailer')


// const sendAlert = async (lead) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   })

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_USER,
//     subject:`New Lead: ${lead.name} (${lead.source})`,
//     text: `
//       Name: ${lead.name}
//       Email: ${lead.email}
//       Phone: ${lead.phone}
//       Source: ${lead.source}
//       Service: ${lead.service}
//     `
//   })
// }

// // Website lead
// router.post('/website', async (req, res) => {
//   try {
//     const lead = await Lead.create({
//       ...req.body,
//       source: 'website'
//     })
//     sendAlert(lead)
//     res.json({ success: true, lead })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// })

// // Meta leads
// router.post('/meta', async (req, res) => {
//   try {
//     const lead = await Lead.create({
//       ...req.body,
//       source: 'meta'
//     })
//     sendAlert(lead)
//     res.json({ success: true, lead })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// })

// // Google leads 
// router.post('/google', async (req, res) => {
//   try {
//     const lead = await Lead.create({
//       ...req.body,
//       source: 'google'
//     })
//     sendAlert(lead)
//     res.json({ success: true, lead })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// })

// module.exports = router;