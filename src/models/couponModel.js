// Simple in-memory store. Replace with DB adapter later if needed.
const coupons = []; // array of coupon objects

// usageMap tracks how many times a user used a coupon:
// keys: `${couponCode}#${userId}` => integer count
const usageMap = new Map();

module.exports = {
  coupons,
  usageMap,
};
