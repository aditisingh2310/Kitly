import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { shopifyApp } from "@shopify/shopify-app-express";
import { BillingInterval } from "@shopify/shopify-api";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const app = express();

app.use(cors());
app.use(express.json());

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SCOPES,
  HOST,
  PORT,
} = process.env;

const shopifyEnabled = SHOPIFY_API_KEY && SHOPIFY_API_SECRET && HOST;

let shopify;

if (shopifyEnabled) {
  shopify = shopifyApp({
    api: {
      apiKey: SHOPIFY_API_KEY,
      apiSecretKey: SHOPIFY_API_SECRET,
      scopes: SCOPES ? SCOPES.split(",") : [],
      hostName: HOST.replace(/https?:\/\//, ""),
    },
    auth: {
      path: "/api/auth",
      callbackPath: "/api/auth/callback",
    },
    session: {
      storage: new MemorySessionStorage(),
    },
  });

  app.use(shopify.cspHeaders());
  app.use(shopify.auth.begin());
  app.use(shopify.auth.callback());
}

const BILLING_PLAN = {
  name: "Starter Bundle Plan",
  amount: 5.0,
  currencyCode: "USD",
  interval: BillingInterval.Every30Days,
};

async function ensureBilling(session) {
  if (!shopifyEnabled) return true;

  const hasPayment = await shopify.api.billing.check({
    session,
    plans: [BILLING_PLAN.name],
  });

  if (!hasPayment) {
    await shopify.api.billing.request({
      session,
      plan: BILLING_PLAN,
      isTest: true,
    });
    return false;
  }

  return true;
}

app.post("/api/bundles", async (req, res) => {
  try {
    const { title, handle, products, discount_type, discount_value, shop_domain } = req.body;

    if (!title || !handle || !products || !discount_type || discount_value === undefined || !shop_domain) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("bundles")
      .insert({
        title,
        handle,
        products,
        discount_type,
        discount_value,
        shop_domain,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ bundle: data });
  } catch (error) {
    console.error("Error creating bundle:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/bundles", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ bundles: data || [] });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/bundles/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Bundle not found" });
    }

    res.json({ bundle: data });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/bundles/handle/:handle", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .eq("handle", req.params.handle)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Bundle not found" });
    }

    res.json({ bundle: data });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/bundles/:id", async (req, res) => {
  try {
    const { title, handle, products, discount_type, discount_value, active } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (handle !== undefined) updateData.handle = handle;
    if (products !== undefined) updateData.products = products;
    if (discount_type !== undefined) updateData.discount_type = discount_type;
    if (discount_value !== undefined) updateData.discount_value = discount_value;
    if (active !== undefined) updateData.active = active;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("bundles")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ bundle: data });
  } catch (error) {
    console.error("Error updating bundle:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/bundles/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("bundles")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bundle-price", async (req, res) => {
  try {
    const { products, discount_type, discount_value } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Products array is required" });
    }

    const originalPrice = products.reduce((total, product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseInt(product.quantity) || 1;
      return total + (price * quantity);
    }, 0);

    let discountAmount = 0;
    if (discount_type === "percentage") {
      discountAmount = (originalPrice * parseFloat(discount_value)) / 100;
    } else if (discount_type === "fixed") {
      discountAmount = parseFloat(discount_value);
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    res.json({
      original_price: originalPrice.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      final_price: finalPrice.toFixed(2),
      products: products,
    });
  } catch (error) {
    console.error("Error calculating price:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/bundle-data", async (req, res) => {
  try {
    const { shop } = req.query;

    const query = supabase
      .from("bundles")
      .select("*")
      .eq("active", true);

    if (shop) {
      query.eq("shop_domain", shop);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error("Error fetching bundle data:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/webhooks/app/uninstalled", async (req, res) => {
  try {
    const shop = req.headers["x-shopify-shop-domain"];

    const { error } = await supabase
      .from("bundles")
      .delete()
      .eq("shop_domain", shop);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).send("Webhook error");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook error");
  }
});

app.post("/webhooks/products/update", async (req, res) => {
  res.sendStatus(200);
});

app.post("/webhooks/inventory_levels/update", async (req, res) => {
  res.sendStatus(200);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Niche-Bundler API is running" });
});

if (shopifyEnabled) {
  app.get("/*", shopify.ensureInstalledOnShop(), (req, res) => {
    res.sendFile(process.cwd() + "/dist/admin/index.html");
  });
} else {
  app.use(express.static("dist/admin"));
  app.get("/*", (req, res) => {
    res.sendFile(process.cwd() + "/dist/admin/index.html");
  });
}

const serverPort = PORT || 3000;

app.listen(serverPort, () => {
  console.log(`Niche-Bundler API running on port ${serverPort}`);
  if (!shopifyEnabled) {
    console.log("Note: Shopify integration disabled. Set SHOPIFY_API_KEY, SHOPIFY_API_SECRET, and HOST to enable.");
  }
});
