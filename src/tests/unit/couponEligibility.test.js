const {
  userEligibility,
  cartEligibility,
  computeDiscountForCoupon,
  isWithinValidity,
} = require("../../services/couponService");

describe("User Eligibility Tests", () => {
  test("allows user tier NEW when allowedUserTiers contains NEW", () => {
    const coupon = {
      eligibility: { allowedUserTiers: ["NEW"] },
    };
    const user = { userTier: "NEW" };
    expect(userEligibility(coupon, user)).toBe(true);
  });

  test("rejects user tier REGULAR when allowedUserTiers is NEW only", () => {
    const coupon = {
      eligibility: { allowedUserTiers: ["NEW"] },
    };
    const user = { userTier: "REGULAR" };
    expect(userEligibility(coupon, user)).toBe(false);
  });

  test("firstOrderOnly should require ordersPlaced === 0", () => {
    const coupon = { eligibility: { firstOrderOnly: true } };
    expect(userEligibility(coupon, { ordersPlaced: 0 })).toBe(true);
    expect(userEligibility(coupon, { ordersPlaced: 2 })).toBe(false);
  });
});

describe("Cart Eligibility Tests", () => {
  test("minCartValue requirement", () => {
    const coupon = { eligibility: { minCartValue: 1000 } };
    const totals = { cartValue: 1200, itemsCount: 1 };
    const cart = {};
    expect(cartEligibility(coupon, totals, cart)).toBe(true);
  });

  test("rejects excludedCategories", () => {
    const coupon = { eligibility: { excludedCategories: ["gift"] } };
    const totals = { cartValue: 500, itemsCount: 1 };
    const cart = { items: [{ category: "gift", quantity: 1 }] };
    expect(cartEligibility(coupon, totals, cart)).toBe(false);
  });
});

describe("Discount Calculation Tests", () => {
  test("flat discount", () => {
    const coupon = { discountType: "FLAT", discountValue: 100 };
    expect(computeDiscountForCoupon(coupon, 1000)).toBe(100);
  });

  test("percent discount with max cap", () => {
    const coupon = {
      discountType: "PERCENT",
      discountValue: 10,
      maxDiscountAmount: 50,
    };
    expect(computeDiscountForCoupon(coupon, 2000)).toBe(50);
  });
});

describe("Validity Tests", () => {
  test("should be valid within date range", () => {
    const coupon = {
      startDate: "2020-01-01",
      endDate: "2030-01-01",
    };
    expect(isWithinValidity(coupon, new Date("2025-01-01"))).toBe(true);
  });

  test("should be invalid before start", () => {
    const coupon = {
      startDate: "2025-01-01",
      endDate: "2030-01-01",
    };
    expect(isWithinValidity(coupon, new Date("2024-01-01"))).toBe(false);
  });
});
