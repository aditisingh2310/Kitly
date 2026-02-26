# Quick Start Guide

Get your Niche Bundler app running in 5 minutes!

## Prerequisites

- Node.js installed
- Supabase account (database already configured)
- Shopify Partner account

## Step 1: Configure Environment

Create a `.env` file in the root directory:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-app-url.com
SCOPES=read_products,write_products,read_orders,write_orders
PORT=3000

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000/api
```

## Step 2: Start the Server

```bash
npm start
```

The API server will start on http://localhost:3000

## Step 3: Test the API

Open another terminal and test the endpoints:

```bash
curl http://localhost:3000/health
```

You should see: `{"status":"ok","message":"Niche-Bundler API is running"}`

## Step 4: Access Admin UI

For development, serve the admin UI separately:

```bash
cd admin-ui
python3 -m http.server 8000
```

Then open: http://localhost:8000

Or build it for production:

```bash
npm run build
```

## Create Your First Bundle

1. Navigate to the admin UI
2. Click "Create Bundle"
3. Fill in the form:
   - Title: "Summer Bundle"
   - Handle: "summer-bundle" (auto-generated)
   - Add products with their Shopify IDs
   - Set discount type and value
4. Click "Save"

## Add Bundle to Storefront

1. In Shopify Admin, go to Online Store > Themes
2. Click "Customize"
3. Add the "Bundle Widget" block
4. Configure:
   - Bundle Handle: Enter your bundle handle (e.g., "summer-bundle")
   - API URL: Your app's API URL
5. Save and preview

## Test Bundle Pricing

```bash
curl -X POST http://localhost:3000/api/bundle-price \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"product_id": "123", "price": 29.99, "quantity": 1},
      {"product_id": "456", "price": 39.99, "quantity": 1}
    ],
    "discount_type": "percentage",
    "discount_value": 20
  }'
```

## Troubleshooting

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check that the bundles table exists

### API Not Responding
- Ensure port 3000 is not in use
- Check server logs for errors

### Admin UI Not Loading
- Run `npm run build` to rebuild
- Check browser console for errors

## Next Steps

1. Configure Shopify app settings in Partner Dashboard
2. Set up webhooks for automatic updates
3. Customize the theme extension styling
4. Deploy to production

For detailed documentation, see README.md
