
const express = require('express');
const multer = require('multer');
const { uploadBanner, getAllBanners, deleteBanner, updateBanner } = require('../controllers/banners');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('bannerImage'), uploadBanner);

router.get('/', getAllBanners);

router.post('/delete', deleteBanner);

router.put('/:id', updateBanner);

module.exports = router;