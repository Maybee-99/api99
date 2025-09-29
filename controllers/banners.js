const db = require('../config/connectDB');
const fs = require('fs');
const path = require('path');
const baseUrl = `http://10.53.242.99:3000`;

exports.uploadBanner = (req, res) => {
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  db.query('INSERT INTO banners (image_url) VALUES (?)', [imageUrl], (err) => {
    if (err) {
      console.error('DB insert failed: ', err);
      return res.status(500).send('DB insert failed');
    }
    res.json({ success: true, imageUrl });
  });
};

exports.getAllBanners = (req, res) => {
  db.query('SELECT * FROM banners', (err, results) => {
    if (err) {
      console.error('Failed to fetch banners: ', err);
      return res.status(500).send('Failed to fetch banners');
    }
    res.json(results);
  });
};

exports.deleteBanner = (req, res) => {
  const imageUrl = req.body.image_url;
  if (!imageUrl) return res.status(400).send('Missing image_url');

  const filename = path.basename(imageUrl);
  const filePath = path.join(__dirname, '../uploads', filename);

  db.query('DELETE FROM banners WHERE image_url = ?', [imageUrl], (err) => {
    if (err) {
      console.error('Database delete error: ', err);
      return res.status(500).send('Database delete error');
    }

    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('File deletion error: ', err);
      }
    });

    res.json({ success: true });
  });
};

exports.updateBanner = (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).send('Missing image file');

  db.query('SELECT image_url FROM banners WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Banner not found');
    }
    const oldImageUrl = results[0].image_url;
    const oldFilename = path.basename(oldImageUrl);
    const oldFilePath = path.join(__dirname, '../uploads', oldFilename);

    const newImageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    db.query('UPDATE banners SET image_url = ? WHERE id = ?', [newImageUrl, id], (err2) => {
      if (err2) {
        console.error('Failed to update banner:', err2);
        return res.status(500).send('Failed to update banner');
      }

      fs.unlink(oldFilePath, (err3) => {
        if (err3 && err3.code !== 'ENOENT') {
          console.error('Failed to delete old banner image:', err3);
        }
      });

      res.json({ success: true, imageUrl: newImageUrl });
    });
  });
};