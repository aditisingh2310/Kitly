import React, { useState } from 'react';
import {
  Card,
  ResourceList,
  ResourceItem,
  TextField,
  Button,
  Thumbnail,
  TextContainer,
  BlockStack,
  InlineStack
} from '@shopify/polaris';

function ProductSelector({ selectedProducts, onChange }) {
  const [productId, setProductId] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('');

  const handleAddProduct = () => {
    if (!productId || !productTitle || !productPrice) {
      alert('Please fill in all product fields');
      return;
    }

    const newProduct = {
      product_id: productId,
      title: productTitle,
      price: parseFloat(productPrice),
      image: productImage || null,
      quantity: 1
    };

    onChange([...selectedProducts, newProduct]);

    setProductId('');
    setProductTitle('');
    setProductPrice('');
    setProductImage('');
  };

  const handleRemoveProduct = (index) => {
    const updated = selectedProducts.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card sectioned>
        <BlockStack gap="400">
          <TextField
            label="Product ID"
            value={productId}
            onChange={setProductId}
            placeholder="Enter Shopify product ID"
            autoComplete="off"
          />
          <TextField
            label="Product Title"
            value={productTitle}
            onChange={setProductTitle}
            placeholder="Enter product title"
            autoComplete="off"
          />
          <TextField
            label="Product Price"
            type="number"
            value={productPrice}
            onChange={setProductPrice}
            placeholder="Enter product price"
            prefix="$"
            min="0"
            step="0.01"
            autoComplete="off"
          />
          <TextField
            label="Product Image URL (optional)"
            value={productImage}
            onChange={setProductImage}
            placeholder="Enter image URL"
            autoComplete="off"
          />
          <Button onClick={handleAddProduct}>Add Product</Button>
        </BlockStack>
      </Card>

      {selectedProducts.length > 0 && (
        <Card>
          <ResourceList
            items={selectedProducts}
            renderItem={(item, index) => {
              const { product_id, title, price, image } = item;
              const media = image ? (
                <Thumbnail source={image} alt={title} />
              ) : (
                <Thumbnail source="" alt={title} />
              );

              return (
                <ResourceItem
                  id={product_id}
                  media={media}
                  accessibilityLabel={`View details for ${title}`}
                >
                  <InlineStack align="space-between" blockAlign="center">
                    <div style={{ flex: 1 }}>
                      <TextContainer>
                        <h3>{title}</h3>
                        <p>ID: {product_id}</p>
                        <p>Price: ${price}</p>
                      </TextContainer>
                    </div>
                    <Button
                      destructive
                      size="slim"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      Remove
                    </Button>
                  </InlineStack>
                </ResourceItem>
              );
            }}
          />
        </Card>
      )}
    </div>
  );
}

export default ProductSelector;
