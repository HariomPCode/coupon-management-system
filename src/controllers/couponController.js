const { coupons, usageMap } = require("../models/couponModel");
const {
  evaluateBestCoupon,
  validateCouponPayload,
} = require("../services/couponService");

// Create coupon
exports.createCoupon = (req, res) => {
  try {
    const payload = req.body;
    const validation = validateCouponPayload(payload);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // unique code check (reject duplicate)
    const exists = coupons.find((c) => c.code === payload.code);
    if (exists) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    coupons.push(payload);
    return res.status(201).json({ message: "Coupon created", coupon: payload });
  } catch (err) {
    console.error("createCoupon error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllCoupons = (req, res) => {
  res.json(coupons);
};

// Best coupon evaluator
exports.getBestCoupon = (req, res) => {
  try {
    const { user, cart } = req.body;
    if (!user || !cart) {
      return res
        .status(400)
        .json({ message: "Missing user or cart in request body" });
    }

    const result = evaluateBestCoupon(user, cart, coupons, usageMap);
    return res.json(result);
  } catch (err) {
    console.error("getBestCoupon error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Mark coupon as used by user (increments usage count)
exports.useCoupon = (req, res) => {
  try {
    const { code } = req.params;
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "userId required in body" });

    const key = `${code}#${userId}`;
    const current = usageMap.get(key) || 0;
    usageMap.set(key, current + 1);
    return res.json({
      message: "Usage recorded",
      code,
      userId,
      usageCount: current + 1,
    });
  } catch (err) {
    console.error("useCoupon error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
