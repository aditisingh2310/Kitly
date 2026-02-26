require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- Shopify Setup ---------------- */

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(","),
  hostName: process.env.HOST.replace(/^https:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

/* ---------------- OAuth Routes ---------------- */

app.get("/auth", async (req, res) => {
  const shop = req.query.shop;

  if (!shop) return res.status(400).send("Missing shop parameter");

  const authRoute = await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  });

  res.redirect(authRoute);
});

app.get("/auth/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    // Save shop in DB
    await prisma.shop.upsert({
      where: { shopDomain: session.shop },
      update: { accessToken: session.accessToken },
      create: {
        shopDomain: session.shop,
        accessToken: session.accessToken,
      },
    });

    res.send("App successfully installed!");
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth error");
  }
});

/* ---------------- Middleware ---------------- */

async function verifyShop(req, res, next) {
  const shop = req.headers["x-shop-domain"];
  if (!shop) return res.status(401).json({ error: "No shop provided" });

  const foundShop = await prisma.shop.findUnique({
    where: { shopDomain: shop },
  });

  if (!foundShop) return res.status(401).json({ error: "Shop not found" });

  req.shop = foundShop;
  next();
}

/* ---------------- Bundle CRUD ---------------- */

app.post("/api/bundles", verifyShop, async (req, res) => {
  const { name, products, discountType, discountValue } = req.body;

  const bundle = await prisma.bundle.create({
    data: {
      shopDomain: req.shop.shopDomain,
      name,
      products,
      discountType,
      discountValue,
    },
  });

  res.json(bundle);
});

app.get("/api/bundles", verifyShop, async (req, res) => {
  const bundles = await prisma.bundle.findMany({
    where: { shopDomain: req.shop.shopDomain },
  });

  res.json(bundles);
});

app.put("/api/bundles/:id", verifyShop, async (req, res) => {
  const { id } = req.params;

  const updated = await prisma.bundle.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});

app.delete("/api/bundles/:id", verifyShop, async (req, res) => {
  const { id } = req.params;

  await prisma.bundle.delete({
    where: { id },
  });

  res.json({ success: true });
});

/* ---------------- Public Endpoint ---------------- */

app.get("/public/bundles", async (req, res) => {
  const { shop } = req.query;

  if (!shop) return res.status(400).json({ error: "Missing shop param" });

  const bundles = await prisma.bundle.findMany({
    where: {
      shopDomain: shop,
      status: "active",
    },
  });

  res.json(bundles);
});

/* ---------------- Start Server ---------------- */

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
