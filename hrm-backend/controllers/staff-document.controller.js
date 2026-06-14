const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

const ok   = (res, data, pagination = null, message = 'success') =>
  res.status(200).json({ statusCode: 200, data, pagination, message });
const fail = (res, status, message, error = null) =>
  res.status(status).json({ statusCode: status, message, error: error?.message || null });

const mapDoc = (row) => {
  // Parse attachments JSON
  let attachments = [];
  try {
    attachments = row.attachments ? JSON.parse(row.attachments) : [];
  } catch(e) { attachments = []; }

  // Lấy file đầu tiên để flat ra thành props mà FileCard expect
  const firstFile = attachments[0] || {};

  return {
    id:           String(row.id),
    staffId:      String(row.employee_id),
    documentName: row.document_name,
    note:         row.note || null,
    createdAt:    row.created_at || null,
    createdByName:row.created_by_name || null,
    uploadedBy:   row.created_by_name || null,
    // Flat file fields mà FileCard dùng
    fileUrl:      firstFile.url      || null,
    filePath:     firstFile.filePath || null,
    fileName:     firstFile.fileName || firstFile.originalName || null,
    fileType:     firstFile.fileType || null,
    fileSize:     firstFile.fileSize || 0,
    // Giữ attachments array cho trường hợp cần
    attachments,
  };
};

const staffDocumentController = {

  // GET /staff-document/staff/:staffId
  getByStaff: async (req, res) => {
    try {
      const { staffId } = req.params;
      const page   = Math.max(1, parseInt(req.query.page)  || 1);
      const limit  = Math.min(50,  parseInt(req.query.limit) || 10);
      const offset = (page - 1) * limit;

      const [rows] = await db.query(
        `SELECT * FROM hr_staff_documents WHERE employee_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
        [staffId, limit, offset]
      );
      const [[{ total }]] = await db.query(
        'SELECT COUNT(*) AS total FROM hr_staff_documents WHERE employee_id = ?',
        [staffId]
      );

      // FE expect data.data.data (nested) theo cấu trúc BaseApiService
      ok(res, {
        data: rows.map(mapDoc),
        pagination: {
          page, limit, total: Number(total),
          totalPage: Math.ceil(total / limit),
          hasPreviousPage: page > 1,
          hasNextPage: page < Math.ceil(total / limit),
        }
      });
    } catch (e) {
      fail(res, 500, 'Lỗi lấy hồ sơ nhân viên', e);
    }
  },

  // GET /staff-document/:id
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM hr_staff_documents WHERE id = ? LIMIT 1',
        [req.params.id]
      );
      if (!rows.length) return fail(res, 404, 'Không tìm thấy tài liệu');
      ok(res, mapDoc(rows[0]));
    } catch (e) {
      fail(res, 500, 'Lỗi lấy chi tiết tài liệu', e);
    }
  },

  // POST /staff-document/staff/:staffId
  // FE gửi: { staffId, documents: [{documentName, fileUrl, filePath, fileName, fileType, fileSize, note}] }
  create: async (req, res) => {
    try {
      const { staffId } = req.params;
      // FE có thể gửi dạng array documents hoặc single document
      const documents = req.body.documents || [req.body];

      if (!documents.length) return fail(res, 400, 'Không có tài liệu nào');

      const insertedIds = [];
      for (const doc of documents) {
        const { documentName, fileUrl, filePath, fileName, fileType, fileSize, note, createdByName } = doc;
        if (!documentName?.trim()) return fail(res, 400, 'Tên tài liệu không được bỏ trống');

        // Lưu attachments dạng array để có thể có nhiều file
        const attachments = fileUrl ? [{
          url: fileUrl, filePath, fileName, fileType,
          fileSize: fileSize || 0, originalName: fileName
        }] : null;

        const [result] = await db.query(
          `INSERT INTO hr_staff_documents (employee_id, document_name, note, attachments, created_by_name)
           VALUES (?, ?, ?, ?, ?)`,
          [staffId, documentName.trim(), note || null,
           attachments ? JSON.stringify(attachments) : null,
           createdByName || 'Admin']
        );
        insertedIds.push(String(result.insertId));
      }

      res.status(201).json({
        statusCode: 201,
        data: insertedIds.length === 1 ? { id: insertedIds[0] } : { ids: insertedIds },
        message: 'Thêm tài liệu thành công'
      });
    } catch (e) {
      fail(res, 500, 'Lỗi thêm tài liệu', e);
    }
  },

  // PATCH /staff-document/:id
  update: async (req, res) => {
    try {
      const { documentName, note, attachments } = req.body;
      await db.query(
        `UPDATE hr_staff_documents SET document_name=?, note=?, attachments=? WHERE id=?`,
        [documentName, note || null,
         attachments ? JSON.stringify(attachments) : null,
         req.params.id]
      );
      ok(res, null, 'Cập nhật tài liệu thành công');
    } catch (e) {
      fail(res, 500, 'Lỗi cập nhật tài liệu', e);
    }
  },

  // DELETE /staff-document/:id
  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM hr_staff_documents WHERE id = ?', [req.params.id]);
      ok(res, null, 'Xóa tài liệu thành công');
    } catch (e) {
      fail(res, 500, 'Lỗi xóa tài liệu', e);
    }
  },
};

module.exports = staffDocumentController;