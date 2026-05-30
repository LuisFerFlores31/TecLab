const path = require('path')
const fs = require('fs')
const prisma = require('./prisma')
const { streamAssetsToCsv, markProcessing, markDone, markFailed, updateProgress, UPLOADS_DIR } = require('../modules/exports/exports.service')

const POLL_INTERVAL_MS = 5000

async function processJob(job) {
  try {
    await markProcessing(job.id)
    const filename = `export-${job.id}-${Date.now()}.csv`
    const filePath = path.join(UPLOADS_DIR, filename)
    const ws = fs.createWriteStream(filePath)

    await streamAssetsToCsv(job.labId, ws, async (percent) => {
      await updateProgress(job.id, percent)
    })

    // finish stream
    await new Promise((resolve, reject) => ws.end(resolve))

    await markDone(job.id, filePath)
    console.log(`[exportWorker] Job ${job.id} done -> ${filePath}`)
  } catch (err) {
    console.error('[exportWorker] job failed', err)
    await markFailed(job.id, err.message || String(err))
  }
}

async function poll() {
  try {
    const pending = await prisma.exportJob.findFirst({ where: { status: 'pending' } })
    if (pending) {
      console.log(`[exportWorker] picked job ${pending.id}`)
      // process synchronously to avoid concurrent file writes
      await processJob(pending)
    }
  } catch (err) {
    console.error('[exportWorker] poll error', err)
  } finally {
    setTimeout(poll, POLL_INTERVAL_MS)
  }
}

function startWorker() {
  console.log('[exportWorker] starting')
  poll()
}

module.exports = { startWorker }
