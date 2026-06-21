import { useState } from 'react'
import axios from 'axios'
import './LeadTable.css'
import BASE_URL from '../api'

function LeadTable({ leads, onRefresh }) {

  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)

  const isPresent = (value) => value !== null && value !== undefined && String(value).trim() !== ''
  const displayValue = (value) => isPresent(value) ? String(value) : 'missing'
  const normalize = (value) => String(value || '').trim().toLowerCase()
  const normalizeStatus = (value) => {
    const normalized = normalize(value)

    if (normalized === 'new') return 'intake'
    if (normalized === 'contacted') return 'qualified'
    if (normalized === 'not-qualified' || normalized === 'not_qualified') return 'not qualified'

    return normalized
  }

  //delete lead
   const deleteLead=async(id)=>{
      await axios.delete(`${BASE_URL}/api/leads/${id}`)
      onRefresh()
   }

  // filter
  const filtered = leads.filter(l => {
    if (source && normalize(l.source) !== normalize(source)) return false
    if (status && normalizeStatus(l.status) !== normalizeStatus(status)) return false
    return true
  })

  const formatMetaTime = (lead) => {
    if (lead.metaCreatedTime) {
      return new Date(lead.metaCreatedTime * 1000).toLocaleString()
    }

    return lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'missing'
  }

  const detailFields = (lead) => ([
    ['leadgen_id', lead.metaLeadId],
    ['Name', lead.name],
    ['First name', lead.firstName],
    ['Last name', lead.lastName],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Source', lead.source],
    ['Status', normalizeStatus(lead.status)],
    ['Service', lead.service],
    ['Source detail', lead.sourceDetail],
    ['City', lead.city],
    ['Message', lead.message],
    ['Campaign', lead.campaign],
    ['ad_id', lead.adId],
    ['form_id', lead.formId],
    ['leadgen_id', lead.metaLeadId],
    ['page_id', lead.pageId],
    ['adgroup_id', lead.adgroupId],
    ['Meta created time', formatMetaTime(lead)],
    ['Record created', lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'missing']
  ])

  // Status update
  const updateStatus = async (id, val) => {
    await axios.patch(`${BASE_URL}/api/leads/${id}/status`, { status: val })
    onRefresh()
  }

  return (
    <div className="tbl-wrap">

      <div className="tbl-filters">
        <select value={source} onChange={e => setSource(e.target.value)}>
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="meta">Meta</option>
          <option value="google">Google</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="intake">Intake</option>
          <option value="qualified">Qualified</option>
          <option value="not qualified">Not Qualified</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <table className="leads-table">
        <thead>
          <tr>
            <th>Lead ID</th>
            <th>Status</th>
            <th>Ad ID</th>
            <th>Date</th>
            <th>Source</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(lead => (
            <tr key={lead._id}>
              <td className="col-lead-id-cell">
                <button
                  type="button"
                  className="lead-id-btn"
                  onClick={() => setSelectedLead(lead)}
                >
                  {displayValue(lead.metaLeadId)}
                </button>
              </td>
              <td className="col-status-cell">
                <select
                  className="status-select"
                  value={normalizeStatus(lead.status)}
                  onChange={e => updateStatus(lead._id, e.target.value)}
                >
                  <option value="intake">intake</option>
                  <option value="qualified">qualified</option>
                  <option value="not qualified">not qualified</option>
                  <option value="converted">converted</option>
                </select>
              </td>
              <td className="col-ad-id-cell">{displayValue(lead.adId)}</td>
              <td className="col-date-cell" style={{ color: '#94a3b8' }}>{formatMetaTime(lead)}</td>
              <td className="col-source-cell">
                <span className={`badge badge-${lead.source}`}>
                  {lead.source}
                </span>
              </td>
              <td className="col-delete-cell">
                <button className ="delete_btn" onClick={()=>deleteLead(lead._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="tbl-foot">{filtered.length} leads </div>

      {selectedLead && (
        <div className="lead-modal-overlay">
          <div className="lead-modal-box" onClick={e => e.stopPropagation()}>
            <div className="lead-modal-header">
              <div>
                <div className="lead-modal-title">Lead details</div>
              </div>
              <button type="button" className="lead-modal-close" onClick={() => setSelectedLead(null)}>
                ×
              </button>
            </div>

            <div className="lead-modal-grid">
              {detailFields(selectedLead).map(([label, value]) => (
                <div className="lead-modal-item" key={label}>
                  <span>{label}</span>
                  <strong>{displayValue(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default LeadTable