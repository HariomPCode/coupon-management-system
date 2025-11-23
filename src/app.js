const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const couponRoutes = require("./routes/couponRoutes");
app.use("/api/coupons", couponRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// load seed if exists
const seedPath = path.join(__dirname, "..", "seed.json");
if (fs.existsSync(seedPath)) {
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const { coupons } = require("./models/couponModel");
  if (Array.isArray(seed.coupons)) {
    // load only if coupons array empty to avoid duplicate on restart in dev
    if (coupons.length === 0) {
      coupons.push(...seed.coupons);
      console.log(
        "Loaded seed coupons:",
        seed.coupons.map((c) => c.code)
      );
    }
  }
  // demo user is just informational — you can use it in frontend later
  if (seed.demoUser) {
    console.log("Demo user present:", seed.demoUser.email);
  }
}

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(
    `<h1>Welcome to the Coupon System API</h1>` +
      `<p>Use the endpoint <code>/api/coupons</code> to manage coupons.</p>` +
      `<p>Check <a href="/health">/health</a> for service status.</p>`
  );
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Coupon system running on ${PORT}`));
}

module.exports = app;
