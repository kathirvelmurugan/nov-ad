import express from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { memoryTenants } from '../store.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('[ALO DOCTOR] Tenants GET fallback to memory:', error.message);
    return res.status(200).json([...memoryTenants].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
  }
});

router.post('/', async (req, res) => {
  const { nameEn, nameAr, id, licenseNumber, addressEn, addressAr, phone, email, status } = req.body;

  if (!nameEn || !nameAr) {
    return res.status(400).json({
      success: false,
      message: 'Both nameEn and nameAr are required fields.'
    });
  }

  const tenantId = id || crypto.randomUUID();
  const license = licenseNumber || `ALO-LIC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  const tenantRecord = {
    id: tenantId,
    name_en: nameEn,
    name_ar: nameAr,
    license_number: license,
    address_en: addressEn || null,
    address_ar: addressAr || null,
    phone: phone || null,
    email: email || null,
    status: status || 'active',
    created_at: now,
    updated_at: now
  };

  try {
    const query = `
      INSERT INTO tenants (id, name_en, name_ar, license_number, address_en, address_ar, phone, email, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_ar = EXCLUDED.name_ar,
        license_number = EXCLUDED.license_number,
        address_en = EXCLUDED.address_en,
        address_ar = EXCLUDED.address_ar,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at
      RETURNING *;
    `;

    const values = [
      tenantRecord.id,
      tenantRecord.name_en,
      tenantRecord.name_ar,
      tenantRecord.license_number,
      tenantRecord.address_en,
      tenantRecord.address_ar,
      tenantRecord.phone,
      tenantRecord.email,
      tenantRecord.status,
      tenantRecord.created_at,
      tenantRecord.updated_at
    ];

    const result = await pool.query(query, values);
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[ALO DOCTOR] Tenants POST fallback to memory:', error.message);

    const existingIndex = memoryTenants.findIndex(t => t.id === tenantId);
    if (existingIndex > -1) {
      memoryTenants[existingIndex] = { ...memoryTenants[existingIndex], ...tenantRecord, updated_at: now };
    } else {
      memoryTenants.push(tenantRecord);
    }

    return res.status(201).json({ success: true, data: tenantRecord });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tenants WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      const memIndex = memoryTenants.findIndex(t => t.id === id);
      if (memIndex > -1) {
        memoryTenants.splice(memIndex, 1);
        return res.status(200).json({ success: true, message: 'Tenant deleted from memory store.' });
      }
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const memIndex = memoryTenants.findIndex(t => t.id === id);
    if (memIndex > -1) {
      memoryTenants.splice(memIndex, 1);
    }

    return res.status(200).json({ success: true, message: 'Tenant deleted successfully.' });
  } catch (error) {
    console.error('[ALO DOCTOR] Tenants DELETE fallback to memory:', error.message);

    const memIndex = memoryTenants.findIndex(t => t.id === id);
    if (memIndex > -1) {
      memoryTenants.splice(memIndex, 1);
      return res.status(200).json({ success: true, message: 'Tenant deleted from memory store.' });
    }

    return res.status(404).json({ success: false, message: 'Tenant not found in memory store.' });
  }
});

export default router;