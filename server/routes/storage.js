import { Router } from 'express';
import path from 'path';
import crypto from 'crypto';
import { saveFile, getFile } from '../storage.js';

const router = Router();

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.xml': 'application/xml',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

function sanitizeFileName(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return 'file';
  }
  const parsed = path.parse(originalName);
  const safeBase = parsed.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
  const safeExt = parsed.ext.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase().substring(0, 10);
  return safeBase + safeExt;
}

function generateSafeKey(fileName) {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(16).toString('hex');
  const sanitized = sanitizeFileName(fileName);
  return `${timestamp}-${randomHash}-${sanitized}`;
}

router.post('/upload', async (req, res) => {
  try {
    const { fileData, fileName, fileType } = req.body;

    if (!fileData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: fileData'
      });
    }

    let base64String = fileData;
    let detectedMimeType = fileType || 'application/octet-stream';

    const base64Regex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?(;charset=[a-zA-Z0-9-]+)?;base64,/;
    const match = fileData.match(base64Regex);

    if (match) {
      if (match[1] && !fileType) {
        detectedMimeType = match[1];
      }
      base64String = fileData.replace(base64Regex, '');
    }

    const buffer = Buffer.from(base64String, 'base64');

    if (buffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or empty file data provided'
      });
    }

    const maxSize = 50 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds the maximum allowed limit of 50MB'
      });
    }

    const safeKey = generateSafeKey(fileName || 'upload');

    await saveFile(safeKey, buffer, detectedMimeType);

    const ext = path.extname(safeKey).toLowerCase();
    const resolvedContentType = MIME_TYPES[ext] || detectedMimeType;

    return res.status(201).json({
      success: true,
      metadata: {
        key: safeKey,
        originalName: fileName || null,
        size: buffer.length,
        contentType: resolvedContentType,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[StorageRouter] Upload failed:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during file upload'
    });
  }
});

router.get('/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;

    if (!key || typeof key !== 'string' || key.includes('..') || key.includes('/') || key.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid storage key format'
      });
    }

    const fileResult = await getFile(key);

    if (!fileResult) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const ext = path.extname(key).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (fileResult.stream && typeof fileResult.stream.pipe === 'function') {
      fileResult.stream.on('error', (streamError) => {
        console.error('[StorageRouter] Stream error:', streamError.message);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Error streaming file'
          });
        }
      });
      return fileResult.stream.pipe(res);
    }

    if (Buffer.isBuffer(fileResult)) {
      return res.send(fileResult);
    }

    if (fileResult.buffer && Buffer.isBuffer(fileResult.buffer)) {
      return res.send(fileResult.buffer);
    }

    if (fileResult.data) {
      const bufferData = Buffer.isBuffer(fileResult.data)
        ? fileResult.data
        : Buffer.from(fileResult.data);
      return res.send(bufferData);
    }

    return res.status(500).json({
      success: false,
      error: 'Unsupported file format returned from storage'
    });
  } catch (error) {
    console.error('[StorageRouter] Retrieval failed:', error.message);

    if (error.code === 'ENOENT' || error.message?.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error during file retrieval'
    });
  }
});

export default router;