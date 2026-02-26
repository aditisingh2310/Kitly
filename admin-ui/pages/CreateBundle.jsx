import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Toast,
  Frame,
  Banner
} from '@shopify/polaris';
import ProductSelector from '../components/ProductSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function CreateBundle() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  const [errors, setErrors] = useState({});

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!handle || handle === generateHandle(title)) {
      setHandle(generateHandle(value));
    }
  };

  const generateHandle = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!handle.trim()) {
      newErrors.handle = 'Handle is required';
    }

    if (selectedProducts.length === 0) {
      newErrors.products = 'At least one product must be selected';
    }

    if (!discountValue || parseFloat(discountValue) < 0) {
      newErrors.discountValue = 'Discount value must be a positive number';
    }

    if (discountType === 'percentage' && parseFloat(discountValue) > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showToast('Please fix the errors before saving', true);
      return;
    }

    try {
      setSaving(true);

      const bundleData = {
        title,
        handle,
        products: selectedProducts,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        shop_domain: 'example.myshopify.com'
      };

      const response = await fetch(`${API_URL}/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bundleData),
      });

      if (response.ok) {
        showToast('Bundle created successfully');
        setTimeout(() => {
          navigate('/bundles');
        }, 1000);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to create bundle', true);
      }
    } catch (error) {
      console.error('Error creating bundle:', error);
      showToast('Failed to create bundle', true);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  };

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      error={toastError}
      onDismiss={() => setToastActive(false)}
    />
  ) : null;

  return (
    <Frame>
      <Page
        title="Create Bundle"
        breadcrumbs={[{ content: 'Bundles', onAction: () => navigate('/bundles') }]}
        primaryAction={{
          content: 'Save',
          onAction: handleSave,
          loading: saving
        }}
      >
        <Layout>
          <Layout.Section>
            {errors.products && (
              <Banner status="critical" onDismiss={() => setErrors({ ...errors, products: null })}>
                {errors.products}
              </Banner>
            )}
            <Card sectioned>
              <FormLayout>
                <TextField
                  label="Title"
                  value={title}
                  onChange={handleTitleChange}
                  error={errors.title}
                  autoComplete="off"
                />
                <TextField
                  label="Handle"
                  value={handle}
                  onChange={setHandle}
                  error={errors.handle}
                  helpText="Used in the bundle URL"
                  autoComplete="off"
                />
              </FormLayout>
            </Card>

            <Card sectioned title="Products">
              <ProductSelector
                selectedProducts={selectedProducts}
                onChange={setSelectedProducts}
              />
            </Card>

            <Card sectioned title="Discount">
              <FormLayout>
                <Select
                  label="Discount Type"
                  options={[
                    { label: 'Percentage', value: 'percentage' },
                    { label: 'Fixed Amount', value: 'fixed' }
                  ]}
                  value={discountType}
                  onChange={setDiscountType}
                />
                <TextField
                  label="Discount Value"
                  type="number"
                  value={discountValue}
                  onChange={setDiscountValue}
                  error={errors.discountValue}
                  prefix={discountType === 'fixed' ? '$' : ''}
                  suffix={discountType === 'percentage' ? '%' : ''}
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  autoComplete="off"
                />
              </FormLayout>
            </Card>
          </Layout.Section>
        </Layout>
        {toastMarkup}
      </Page>
    </Frame>
  );
}

export default CreateBundle;
