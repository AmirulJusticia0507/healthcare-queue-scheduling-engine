import axios from 'axios'

const API = '/api'

export async function getQueue(clinicId) {
  const res = await axios.get(`${API}/queue`, { params: { clinic: clinicId } })
  return res.data
}

export async function getHistory(clinicId, params = {}) {
  const res = await axios.get(`${API}/queue/history`, { params: { ...params, clinic: clinicId } })
  return res.data
}

export async function downloadHistoryCsv(clinicId, params = {}) {
  const res = await axios.get(`${API}/queue/history.csv`, {
    params: { ...params, clinic: clinicId },
    responseType: 'blob',
  })
  const blob = new Blob([res.data], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'queue-history.csv'
  a.click()
  URL.revokeObjectURL(url)
  return blob
}

export async function getCurrentPublic(clinicId) {
  const res = await axios.get(`${API}/queue/current`, { params: { clinic: clinicId } })
  return res.data
}

export async function joinQueueReturn(patientName, clinicId) {
  const res = await axios.post(`${API}/queue`, { patientName, clinic_id: clinicId })
  return res.data
}

export async function skipPatient(id) {
  const res = await axios.patch(`${API}/queue/${id}/skip`)
  return res.data
}

export async function recallPatient(id) {
  const res = await axios.patch(`${API}/queue/${id}/recall`)
  return res.data
}

export function printTicket(entry, number) {
  const doctor = entry?.assignedDoctor
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Struk Antrian</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
  *{box-sizing:border-box}
  body{margin:0;padding:24px;font-family:'Inter',sans-serif;background:#fff}
  .ticket{width:100%;max-width:320px;border:2px dashed #2563eb;border-radius:12px;padding:20px;margin:0 auto}
  .clinic{text-align:center;font-size:13px;color:#475569}
  .num{text-align:center;font-size:36px;font-weight:800;color:#1d4ed8;margin:12px 0}
  .row{text-align:center;font-size:14px;color:#1e293b;margin:4px 0}
  .small{font-size:12px;color:#64748b}
</style></head><body>
  <div class="ticket">
    <div class="clinic">Healthcare Queue - Sistem Antrian RS</div>
    <div class="num">No. ${number ?? '?'}</div>
    <div class="row"><strong>${entry?.patient_name || ''}</strong></div>
    <div class="row">Dokter: ${doctor?.name || '-'}</div>
    <div class="row">Estimasi: ${entry?.estimatedTime ?? '-'} mnt</div>
    <div class="small">Terima kasih. Silakan menunggu diposisi anda.</div>
  </div>
<script>window.onload=function(){window.print()}</script>
</body></html>`
  const w = window.open('', 'ticket', 'width=360,height=480')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
}
