import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Badge,
  EmptyState,
  Spinner,
  Toast,
  Frame
} from '@shopify/polaris';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function BundlesIndex() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/bundles`);
      const data = await response.json();
      setBundles(data.bundles || []);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      showToast('Failed to load bundles', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bundle?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bundles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Bundle deleted successfully');
        fetchBundles();
      } else {
        showToast('Failed to delete bundle', true);
      }
    } catch (error) {
      console.error('Error deleting bundle:', error);
      showToast('Failed to delete bundle', true);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  };

  const rows = bundles.map(bundle => [
    bundle.title,
    bundle.handle,
    bundle.discount_type === 'percentage'
      ? `${bundle.discount_value}%`
      : `$${bundle.discount_value}`,
    bundle.products?.length || 0,
    <Badge status={bundle.active ? 'success' : 'info'}>
      {bundle.active ? 'Active' : 'Inactive'}
    </Badge>,
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button size="slim" onClick={() => navigate(`/bundles/${bundle.id}/edit`)}>
        Edit
      </Button>
      <Button size="slim" destructive onClick={() => handleDelete(bundle.id)}>
        Delete
      </Button>
    </div>
  ]);

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      error={toastError}
      onDismiss={() => setToastActive(false)}
    />
  ) : null;

  if (loading) {
    return (
      <Frame>
        <Page title="Bundles">
          <Layout>
            <Layout.Section>
              <Card>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <Spinner size="large" />
                </div>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    );
  }

  return (
    <Frame>
      <Page
        title="Bundles"
        primaryAction={{
          content: 'Create Bundle',
          onAction: () => navigate('/bundles/new')
        }}
      >
        <Layout>
          <Layout.Section>
            {bundles.length === 0 ? (
              <Card>
                <EmptyState
                  heading="Create your first bundle"
                  action={{
                    content: 'Create Bundle',
                    onAction: () => navigate('/bundles/new')
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Bundle products together with special discounts to increase sales.</p>
                </EmptyState>
              </Card>
            ) : (
              <Card>
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text',
                    'text',
                    'numeric',
                    'text',
                    'text'
                  ]}
                  headings={[
                    'Title',
                    'Handle',
                    'Discount',
                    'Products',
                    'Status',
                    'Actions'
                  ]}
                  rows={rows}
                />
              </Card>
            )}
          </Layout.Section>
        </Layout>
        {toastMarkup}
      </Page>
    </Frame>
  );
}

export default BundlesIndex;
