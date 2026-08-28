const express = require('express');
const router = express.Router();

const {
  createCustomOrder,
  getMyCustomOrders,
  getCustomOrderById,
  acceptQuote,
} = require('../controllers/customOrderController');

const { protect } = require('../middleware/auth');
const { uploadCustomOrderImages } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { customOrderValidation } = require('../validations/customOrderValidation');

router.use(protect);

router.post('/', uploadCustomOrderImages, customOrderValidation, validate, createCustomOrder);
router.get('/', getMyCustomOrders);
router.get('/:id', getCustomOrderById);
router.put('/:id/accept-quote', acceptQuote);

module.exports = router;
