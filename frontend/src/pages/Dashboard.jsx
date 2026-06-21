import { useEffect, useState } from 'react'
import axios from 'axios'
import StatCards    from '../components/StatCards'
import Charts       from '../components/Charts'
import LeadTable    from '../components/LeadTable'
import './Dashboard.css'
import BASE_URL from '../api'

function Dashboard() {

  const [leads, setLeads]     = useState([])
  const [loading,setLoading] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [creatingSample, setCreatingSample] = useState(false)

  const fetchLeads = async () => {
    setLoading(true)
    const res = await axios.get(`${BASE_URL}/api/leads`)
    setLeads(res.data.leads)
    setLoading(false)
  }

  const loadSampleLead = async () => {
    setCreatingSample(true)

    try {
      const seed = Date.now()
      await axios.post(`${BASE_URL}/webhook/meta`, {
        sample: {
          field: 'leadgen',
          value: {
            ad_id: '444444444',
            form_id: '444444444444',
            leadgen_id: `poc-${seed}`,
            created_time: Math.floor(seed / 1000),
            page_id: '444444444444',
            adgroup_id: '44444444444',
            firstname: 'noob',
            lastname: 'pro',
            email: 'noobpro@gmail.com',
            phone: '8675645345',
            message: 'dummy enquiry'
          }
        },
        sub_field_options: null,
        sample_context_metadata: null
      })

      await fetchLeads()
    } finally {
      setCreatingSample(false)
    }
  }

  useEffect(() => {
    const initialFetchId = setTimeout(() => {
      fetchLeads()
    }, 0)

    return () => {
      clearTimeout(initialFetchId)
    }
  }, [])

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="spinner"></div>
        <p className="loader-text">Data Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">

      <div className="dash-topbar">
        <div className="dash-heading">
          <div className="dash-title">Leads Centre</div>
        </div>
        <div className="dash-actions">
          <button className="dash-link-btn" type="button" onClick={() => setGuideOpen(true)}>
            How to Test?
          </button>
          <button className="dash-primary-btn" type="button" onClick={loadSampleLead} disabled={creatingSample}>
            {creatingSample ? 'Loading...' : 'Load Sample Lead'}
          </button>
        </div>
      </div>

      <StatCards leads={leads} />
      <Charts    leads={leads} />
      <LeadTable leads={leads} onRefresh={fetchLeads} />

      {guideOpen && (
        <div className="guide-drawer-overlay">
          <aside className="guide-drawer" aria-label="How to test drawer">
            <div className="guide-drawer-header">
              <div>
                <div className="guide-title">How to Test?</div>
                <div className="guide-subtitle">Use curl or the sample button to create a demo lead.</div>
              </div>
              <button className="guide-close-btn" type="button" onClick={() => setGuideOpen(false)}>
                ×
              </button>
            </div>
            <p className="guide-copy">
              Required fields are <code>ad_id</code>, <code>leadgen_id</code>, and <code>created_time</code>. Optional fields like <code>firstname</code>, <code>lastname</code>, <code>email</code>, <code>phone</code>, and <code>message</code> will appear when provided.
            </p>
            <pre className="guide-code">{`curl -X POST "${BASE_URL}/webhook/meta" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sample": {
      "field": "leadgen",
      "value": {
        "ad_id": "444444444",
        "form_id": "444444444444",
        "leadgen_id": "444444444444",
        "created_time": 1782041890,
        "page_id": "444444444444",
        "adgroup_id": "44444444444",
        "firstname": "noob",
        "lastname": "pro",
        "email": "noobpro@gmail.com",
        "phone": "8675645345",
        "message": "dummy enquiry"
      }
    }
  }'`}</pre>
          </aside>
        </div>
      )}


    </div>
  )
}

export default Dashboard