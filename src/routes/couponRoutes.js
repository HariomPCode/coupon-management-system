const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getBestCoupon,
  useCoupon,
} = require("../controllers/couponController");

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.post("/best", getBestCoupon);
router.post("/:code/use", useCoupon);

module.exports = router;
