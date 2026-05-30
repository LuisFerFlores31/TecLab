const service = require('./exports.service')

async function createExportJob(req, res) {
  try {
    const { labId, format = 'csv' } = req.body
    if (!labId) return res.status(400).json({ error: 'labId requerido' })

    const job = await service.enqueueJob({ labId, userId: req.user.id, format })
    return res.status(202).json({ ok: true, jobId: job.id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}

async function getJobStatus(req, res) {
  try {
    const id = Number(req.params.id)
    const job = await service.getJob(id)
    if (!job) return res.status(404).json({ error: 'Job no encontrado' })
    // Only allow owner or coordinador
    if (req.user.role !== 'coordinador' && job.userId !== req.user.id) return res.status(403).json({ error: 'No autorizado' })
    return res.json({ ok: true, job })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}

async function downloadFile(req, res) {
  try {
    const id = Number(req.params.id)
    const job = await service.getJob(id)
    if (!job) return res.status(404).json({ error: 'Job no encontrado' })
    if (req.user.role !== 'coordinador' && job.userId !== req.user.id) return res.status(403).json({ error: 'No autorizado' })
    if (job.status !== 'done' || !job.filePath) return res.status(400).json({ error: 'Archivo no listo' })

    return res.download(job.filePath)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}

module.exports = { createExportJob, getJobStatus, downloadFile }
