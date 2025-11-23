const fs = require("fs");
const path = require("path");

// Load seed.json
const seedPath = path.join(__dirname, "..", "..", "seed.json");
const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const demoUser = seedData.demoUser;

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  if (email === demoUser.email && password === demoUser.password) {
    return res.json({
      message: "Login successful",
      user: {
        userId: demoUser.userId,
        email: demoUser.email,
        userTier: demoUser.userTier,
        country: demoUser.country,
        lifetimeSpend: demoUser.lifetimeSpend,
        ordersPlaced: demoUser.ordersPlaced,
      },
    });
  }

  return res.status(401).json({ message: "Invalid credentials" });
};
