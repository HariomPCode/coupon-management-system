// Validate minimal coupon payload
function validateCouponPayload(payload) {
  if (!payload) return { valid: false, message: "Empty payload" };
  const required = [
    "code",
    "discountType",
    "discountValue",
    "startDate",
    "endDate",
  ];
  for (let f of required) {
    if (payload[f] === undefined || payload[f] === null) {
      return { valid: false, message: `Missing required field: ${f}` };
    }
  }
  if (!["FLAT", "PERCENT"].includes(payload.discountType)) {
    return {
      valid: false,
      message: "discountType must be 'FLAT' or 'PERCENT'",
    };
  }
  const sd = new Date(payload.startDate);
  const ed = new Date(payload.endDate);
  if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
    return {
      valid: false,
      message: "Invalid startDate or endDate (ISO format expected)",
    };
  }
  if (sd.getTime() > ed.getTime()) {
    return { valid: false, message: "startDate must be <= endDate" };
  }
  // discountValue must be number >= 0
  if (typeof payload.discountValue !== "number" || payload.discountValue < 0) {
    return {
      valid: false,
      message: "discountValue must be a non-negative number",
    };
  }
  return { valid: true };
}

// Helper to compute cart totals
function computeCartTotals(cart) {
  const items = Array.isArray(cart.items) ? cart.items : [];
  let cartValue = 0;
  let itemsCount = 0;
  const categories = new Set();
  for (const it of items) {
    const price = Number(it.unitPrice || 0);
    const qty = Number(it.quantity || 0);
    cartValue += price * qty;
    itemsCount += qty;
    if (it.category) categories.add(it.category);
  }
  return { cartValue, itemsCount, categories: Array.from(categories) };
}

function isWithinValidity(coupon, now = new Date()) {
  const sd = new Date(coupon.startDate);
  const ed = new Date(coupon.endDate);
  return sd.getTime() <= now.getTime() && now.getTime() <= ed.getTime();
}

function checkUsageLimit(coupon, user, usageMap) {
  if (!coupon.usageLimitPerUser) return true;
  const key = `${coupon.code}#${user.userId}`;
  const used = usageMap.get(key) || 0;
  return used < coupon.usageLimitPerUser;
}

function userEligibility(coupon, user) {
  if (!coupon.eligibility) return true;
  const e = coupon.eligibility;

  if (Array.isArray(e.allowedUserTiers) && e.allowedUserTiers.length > 0) {
    if (!e.allowedUserTiers.includes(user.userTier)) return false;
  }
  if (typeof e.minLifetimeSpend === "number") {
    if ((user.lifetimeSpend || 0) < e.minLifetimeSpend) return false;
  }
  if (typeof e.minOrdersPlaced === "number") {
    if ((user.ordersPlaced || 0) < e.minOrdersPlaced) return false;
  }
  if (e.firstOrderOnly === true) {
    // Interpret firstOrderOnly as "user has never completed orders" => ordersPlaced === 0
    if ((user.ordersPlaced || 0) !== 0) return false;
  }
  if (Array.isArray(e.allowedCountries) && e.allowedCountries.length > 0) {
    if (!e.allowedCountries.includes(user.country)) return false;
  }
  return true;
}

function cartEligibility(coupon, cartTotals, cart) {
  if (!coupon.eligibility) return true;
  const e = coupon.eligibility;

  if (typeof e.minCartValue === "number") {
    if (cartTotals.cartValue < e.minCartValue) return false;
  }
  if (typeof e.minItemsCount === "number") {
    if (cartTotals.itemsCount < e.minItemsCount) return false;
  }
  if (Array.isArray(e.excludedCategories) && e.excludedCategories.length > 0) {
    // If any item category is in excludedCategories -> invalid
    for (const it of cart.items || []) {
      if (it.category && e.excludedCategories.includes(it.category))
        return false;
    }
  }
  if (
    Array.isArray(e.applicableCategories) &&
    e.applicableCategories.length > 0
  ) {
    // Valid only if at least one cart item category in applicableCategories
    let ok = false;
    for (const it of cart.items || []) {
      if (it.category && e.applicableCategories.includes(it.category)) {
        ok = true;
        break;
      }
    }
    if (!ok) return false;
  }
  return true;
}

function computeDiscountForCoupon(coupon, cartValue) {
  let discount = 0;
  if (coupon.discountType === "FLAT") {
    discount = Number(coupon.discountValue || 0);
  } else if (coupon.discountType === "PERCENT") {
    discount = (Number(coupon.discountValue || 0) / 100) * cartValue;
    if (typeof coupon.maxDiscountAmount === "number") {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  }
  // discount cannot exceed cartValue
  discount = Math.min(discount, cartValue);
  // round to 2 decimals for currency
  discount = Math.round(discount * 100) / 100;
  return discount;
}

// Main evaluator
/**
 * evaluateBestCoupon(user, cart, couponsArray, usageMap)
 * Returns { coupon: couponObject|null, discount: number|null, reason?: string }
 */
function evaluateBestCoupon(
  user,
  cart,
  couponsArray,
  usageMap,
  now = new Date()
) {
  const cartTotals = computeCartTotals(cart);
  const candidates = [];

  for (const c of couponsArray) {
    try {
      // validity check
      if (!isWithinValidity(c, now)) continue;
      // usage limit check
      if (!checkUsageLimit(c, user, usageMap)) continue;
      // eligibility user
      if (!userEligibility(c, user)) continue;
      // eligibility cart
      if (!cartEligibility(c, cartTotals, cart)) continue;

      // compute discount
      const discount = computeDiscountForCoupon(c, cartTotals.cartValue);
      if (discount <= 0) continue; // no benefit
      candidates.push({
        coupon: c,
        discount,
        endDate: new Date(c.endDate).getTime(),
      });
    } catch (err) {
      console.warn("Error evaluating coupon", c.code, err);
      continue;
    }
  }

  if (candidates.length === 0) {
    return { coupon: null, discount: null };
  }

  // choose best: highest discount -> earliest endDate -> lexicographically smallest code
  candidates.sort((a, b) => {
    if (b.discount !== a.discount) return b.discount - a.discount; // higher first
    if (a.endDate !== b.endDate) return a.endDate - b.endDate; // earlier first
    // lexicographic
    return a.coupon.code.localeCompare(b.coupon.code);
  });

  const best = candidates[0];
  return { coupon: best.coupon, discount: best.discount };
}

module.exports = {
  validateCouponPayload,
  evaluateBestCoupon,
  // exported helpers for unit testing if needed
  computeCartTotals,
  userEligibility,
  cartEligibility,
  computeDiscountForCoupon,
  isWithinValidity,
  checkUsageLimit,
};
