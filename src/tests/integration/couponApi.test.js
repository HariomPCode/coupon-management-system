const request = require("supertest");
const express = require("express");
const app = require("../../app");

describe("Coupon API Integration", () => {
  test("should create a new coupon", async () => {
    const res = await request(app).post("/api/coupons").send({
      code: "TEST100",
      discountType: "FLAT",
      discountValue: 100,
      startDate: "2025-01-01",
      endDate: "2030-01-01",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.coupon.code).toBe("TEST100");
  });

  test("should reject duplicate coupon code", async () => {
    await request(app).post("/api/coupons").send({
      code: "DUPLICATE",
      discountType: "FLAT",
      discountValue: 50,
      startDate: "2025-01-01",
      endDate: "2030-01-01",
    });

    const res = await request(app).post("/api/coupons").send({
      code: "DUPLICATE",
      discountType: "FLAT",
      discountValue: 50,
      startDate: "2025-01-01",
      endDate: "2030-01-01",
    });

    expect(res.statusCode).toBe(400);
  });

  test("login should work for demo user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "hire-me@anshumat.org",
      password: "HireMe@2025!",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
  });
});
