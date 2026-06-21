const express = require('express')
const router = express.Router()
const Lead = require('../models/Lead')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const https = require('https')


const sendAlert = async (lead) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return

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
    subject:`New Lead: ${lead.name} (${lead.source})`,
    text: `
      Name: ${lead.name}
      Email: ${lead.email}
      Phone: ${lead.phone}
      Source: ${lead.source}
      Service: ${lead.service}
      Source Detail: ${lead.sourceDetail || ''}
      City: ${lead.city || ''}
      Message: ${lead.message || ''}
    `
  })
}

const graphVersion = process.env.META_GRAPH_VERSION || 'v21.0'

const normalizeStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase()

  if (!normalized) return 'intake'
  if (normalized === 'new') return 'intake'
  if (normalized === 'contacted') return 'qualified'
  if (normalized === 'not-qualified' || normalized === 'not_qualified') return 'not qualified'

  return normalized
}

const verifySignature = (req) => {
  const appSecret = process.env.META_APP_SECRET
  const signatureHeader = req.get('x-hub-signature-256')

  if (!appSecret || !signatureHeader) return true

  const expected = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(req.rawBody || '')
    .digest('hex')}`

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
  } catch {
    return false
  }
}

const pickFieldValue = (fieldData = [], names = []) => {
  const field = fieldData.find((item) => names.includes(item.name))
  return Array.isArray(field?.values) ? String(field.values[0] || '').trim() : ''
}

const pickCustomFieldValue = (fieldData = [], names = []) => {
  return pickFieldValue(fieldData, names) || pickFieldValue(fieldData, names.map((name) => name.toLowerCase()))
}

const readSampleFieldValue = (value = {}, names = []) => {
  for (const name of names) {
    const directValue = value?.[name]
    if (directValue === null || directValue === undefined) continue

    if (typeof directValue === 'string' && directValue.trim()) return directValue.trim()
    if (typeof directValue === 'number') return String(directValue)
  }

  const fieldData = Array.isArray(value?.field_data) ? value.field_data : []
  return pickCustomFieldValue(fieldData, names)
}

const mapMetaLead = (metaLead, fallbackMetaLeadId, value) => {
  const fieldData = Array.isArray(metaLead.field_data) ? metaLead.field_data : []
  const firstName = pickFieldValue(fieldData, ['first_name'])
  const lastName = pickFieldValue(fieldData, ['last_name'])
  const fullName = pickFieldValue(fieldData, ['full_name'])

  return {
    firstName,
    lastName,
    name: fullName || `${firstName} ${lastName}`.trim() || `Meta Lead ${fallbackMetaLeadId}`,
    email: pickFieldValue(fieldData, ['email']),
    phone: pickFieldValue(fieldData, ['phone_number', 'phone']),
    service: pickFieldValue(fieldData, ['service']) || 'Not specified',
    sourceDetail: pickCustomFieldValue(fieldData, ['source', 'source_detail', 'lead_source']),
    city: pickCustomFieldValue(fieldData, ['city', 'location', 'pickup_city']),
    message: pickCustomFieldValue(fieldData, ['message', 'requirements', 'notes']),
    campaign: value?.ad_name || value?.campaign_name || '',
    source: 'meta',
    metaLeadId: String(metaLead.id || fallbackMetaLeadId),
    adgroupId: String(value?.adgroup_id || ''),
    metaCreatedTime: value?.created_time || null,
    pageId: String(value?.page_id || ''),
    formId: String(value?.form_id || ''),
    adId: String(value?.ad_id || '')
  }
}

const mapSampleLead = (value = {}) => {
  const leadId = String(value.leadgen_id || `sample-${Date.now()}`)
  const firstName = readSampleFieldValue(value, ['first_name', 'firstName', 'firstname']) || ''
  const lastName = readSampleFieldValue(value, ['last_name', 'lastName', 'lastname']) || ''
  const fullName = readSampleFieldValue(value, ['full_name', 'fullName'])
  const composedName = `${firstName} ${lastName}`.trim()
  const sampleStatus = normalizeStatus(readSampleFieldValue(value, ['status']))

  return {
    firstName,
    lastName,
    name: fullName || composedName || `Lead ${leadId}`,
    email: readSampleFieldValue(value, ['email']),
    phone: readSampleFieldValue(value, ['phone_number', 'phone']) || '',
    service: readSampleFieldValue(value, ['service']) || '',
    sourceDetail: readSampleFieldValue(value, ['source', 'source_detail', 'lead_source']) || '',
    city: readSampleFieldValue(value, ['city', 'location', 'pickup_city']) || '',
    message: readSampleFieldValue(value, ['message', 'requirements', 'notes']) || '',
    campaign: String(value.ad_name || value.campaign_name || value.ad_id || ''),
    source: 'meta',
    metaLeadId: leadId,
    adgroupId: String(value.adgroup_id || ''),
    metaCreatedTime: Number(value.created_time) || null,
    pageId: String(value.page_id || ''),
    formId: String(value.form_id || ''),
    adId: String(value.ad_id || ''),
    status: sampleStatus
  }
}

const mapFallbackLead = (value = {}, reason = 'Meta test event') => {
  const leadId = String(value.leadgen_id || `fallback-${Date.now()}`)

  return {
    firstName: 'Meta',
    lastName: `Lead ${leadId}`,
    name: `Meta Lead ${leadId}`,
    email: '',
    phone: '',
    service: reason,
    sourceDetail: 'Meta webhook fallback',
    city: '',
    message: '',
    campaign: String(value.ad_id || value.campaign_name || ''),
    source: 'meta',
    metaLeadId: leadId,
    adgroupId: String(value.adgroup_id || ''),
    metaCreatedTime: Number(value.created_time) || null,
    pageId: String(value.page_id || ''),
    formId: String(value.form_id || ''),
    adId: String(value.ad_id || ''),
    status: 'intake'
  }
}

const upsertLead = async (leadData) => {
  const lead = await Lead.findOneAndUpdate(
    { metaLeadId: leadData.metaLeadId },
    { $set: leadData, $setOnInsert: { createdAt: new Date() } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  )

  console.log(`Saved lead ${lead.metaLeadId}: ${lead.name} | ${lead.email || 'no-email'} | ${lead.phone || 'no-phone'}`)

  return lead
}

const fetchMetaLead = async (leadgenId) => {
  const token = process.env.META_PAGE_ACCESS_TOKEN
  if (!token) throw new Error('META_PAGE_ACCESS_TOKEN is not configured')

  const url = `https://graph.facebook.com/${graphVersion}/${leadgenId}?fields=id,created_time,field_data&access_token=${token}`
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let body = ''
        response.on('data', (chunk) => {
          body += chunk
        })
        response.on('end', () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            return reject(new Error(`Meta Graph API error (${response.statusCode}): ${body}`))
          }

          try {
            return resolve(JSON.parse(body))
          } catch {
            return reject(new Error('Invalid JSON received from Meta Graph API'))
          }
        })
      })
      .on('error', (error) => reject(error))
  })
}

router.get('/meta', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }

  return res.sendStatus(403)
})

router.post('/meta', async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(403).json({ success: false, message: 'Invalid Meta signature' })
  }

  try {
    const payload = req.body
    const upserts = []

    if (payload?.sample?.field === 'leadgen') {
      const sampleLead = await upsertLead(mapSampleLead(payload.sample.value))
      upserts.push(sampleLead)
    } else {
      if (payload?.object !== 'page' || !Array.isArray(payload?.entry)) {
        return res.status(400).json({ success: false, message: 'Invalid payload' })
      }

      for (const entry of payload.entry) {
        for (const change of entry?.changes || []) {
          if (change?.field !== 'leadgen') continue

          const value = change.value || {}
          const leadgenId = value.leadgen_id
          if (!leadgenId) continue

          let mappedLead

          try {
            const metaLead = await fetchMetaLead(leadgenId)
            mappedLead = mapMetaLead(metaLead, leadgenId, value)
          } catch (error) {
            console.warn(`Meta lead fetch failed for ${leadgenId}: ${error?.message || 'Unknown Meta Graph API error'}`)
            mappedLead = mapFallbackLead(value, 'Meta webhook test or unavailable Graph lead data')
          }

          const lead = await upsertLead(mappedLead)

          upserts.push(lead)
        }
      }
    }

    if (upserts.length) {
      await Promise.allSettled(upserts.map((lead) => sendAlert(lead)))
    }

    return res.status(200).json({ success: true, processed: upserts.length })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router;