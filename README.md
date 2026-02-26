# KITLY- Niche Bundler

A comprehensive Shopify app for creating and managing product bundles with customizable discounts.

## Features

- **Bundle Management**: Create, edit, and delete product bundles
- **Flexible Discounts**: Support for both percentage and fixed-amount discounts
- **Admin UI**: Clean, intuitive interface built with Shopify Polaris
- **Storefront Widget**: Theme app extension for displaying bundles on your store
- **Real-time Pricing**: Dynamic bundle price calculation
- **Webhook Integration**: Automatic updates when products or inventory changes
- **Database**: Powered by Supabase for reliable data storage

## Project Structure

```
niche-bundler/
├── server/                      # Backend API
│   ├── index.js                # Express server entry point
│   ├── config/
│   │   └── database.js         # Supabase client configuration
│   ├── controllers/
│   │   ├── bundleController.js # CRUD operations for bundles
│   │   ├── bundlePriceController.js # Price calculation logic
│   │   └── webhookController.js # Webhook handlers
│   ├── routes/
│   │   ├── bundles.js          # Bundle API routes
│   │   └── webhooks.js         # Webhook routes
│   └── middleware/
│       └── auth.js             # Authentication middleware
├── admin-ui/                    # React Admin Interface
│   ├── index.html
│   ├── main.jsx
│   ├── App.jsx
│   ├── pages/
│   │   ├── BundlesIndex.jsx    # List all bundles
│   │   ├── CreateBundle.jsx    # Create new bundle
│   │   └── EditBundle.jsx      # Edit existing bundle
│   └── components/
│       └── ProductSelector.jsx # Product selection component
├── extensions/
│   └── theme-app-extension/    # Shopify Theme Extension
│       ├── blocks/
│       │   └── bundle-widget.liquid # Liquid template
│       ├── assets/
│       │   └── bundle-widget.js # Frontend widget logic
│       └── shopify.extension.toml
├── package.json
├── vite.config.js
└── shopify.app.toml            # Shopify app configuration
```

## Database Schema

### Bundles Table

- `id` (uuid) - Primary key
- `title` (text) - Bundle display name
- `handle` (text) - URL-friendly unique identifier
- `products` (jsonb) - Array of product configurations
- `discount_type` (text) - 'percentage' or 'fixed'
- `discount_value` (numeric) - Discount amount
- `shop_domain` (text) - Shop this bundle belongs to
- `active` (boolean) - Bundle status
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

## API Endpoints

### Bundles

- `GET /api/bundles` - Get all bundles
- `GET /api/bundles/:id` - Get bundle by ID
- `GET /api/bundles/handle/:handle` - Get bundle by handle
- `POST /api/bundles` - Create new bundle
- `PUT /api/bundles/:id` - Update bundle
- `DELETE /api/bundles/:id` - Delete bundle

### Bundle Pricing

- `POST /api/bundle-price` - Calculate bundle price

Request body:
```json
{
  "products": [
    {
      "product_id": "123",
      "title": "Product Name",
      "price": 29.99,
      "quantity": 1
    }
  ],
  "discount_type": "percentage",
  "discount_value": 20
}
```

### Webhooks

- `POST /webhooks/products/update` - Handle product updates
- `POST /webhooks/inventory_levels/update` - Handle inventory changes

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file:

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

### 3. Database Setup

The database migration has already been applied. The bundles table is ready to use.

### 4. Start Development Server

```bash
npm run dev
```

This starts the Express server on port 3000.

### 5. Build Admin UI

```bash
npm run build
```

This builds the React admin interface.

## Using the App

### Admin Interface

1. Navigate to `/bundles` to view all bundles
2. Click "Create Bundle" to add a new bundle
3. Fill in:
   - Title: Display name for the bundle
   - Handle: URL-friendly identifier (auto-generated from title)
   - Products: Add products with their IDs, titles, and prices
   - Discount Type: Choose percentage or fixed amount
   - Discount Value: Enter the discount amount
4. Click "Save" to create the bundle

### Theme Extension

1. In your Shopify theme editor, add the "Bundle Widget" block
2. Configure:
   - Bundle Handle: Enter the handle of the bundle to display
   - API URL: Your app's API endpoint
3. The widget will:
   - Fetch bundle data
   - Display products and pricing
   - Calculate discounts in real-time
   - Allow customers to add the bundle to cart

### Webhooks

The app automatically subscribes to:

- **products/update**: Updates bundle data when products change
- **inventory_levels/update**: Syncs inventory availability

## Development

### Adding New Features

1. **New API Endpoint**: Add to `server/routes/`
2. **New Controller**: Create in `server/controllers/`
3. **New Admin Page**: Add to `admin-ui/pages/`
4. **New Component**: Add to `admin-ui/components/`

### Testing

Test the API endpoints:

```bash
# Get all bundles
curl http://localhost:3000/api/bundles

# Calculate bundle price
curl -X POST http://localhost:3000/api/bundle-price \
  -H "Content-Type: application/json" \
  -d '{
    "products": [{"product_id": "123", "price": 29.99, "quantity": 1}],
    "discount_type": "percentage",
    "discount_value": 20
  }'
```

## Deployment

1. Deploy the Express server to your hosting platform
2. Update environment variables with production values
3. Build the admin UI: `npm run build`
4. Configure Shopify app settings with your production URLs
5. Submit for app review (if distributing publicly)

## Support

For issues or questions, please refer to the Shopify App documentation or contact support.
