// Test invoice creation
const API_BASE_URL = 'https://app-github-sbnv-meeeeee.vercel.app/api';

async function testInvoiceAPI() {
  console.log('🧪 Testing Invoice API...');
  
  // Test 1: Check if invoices endpoint exists
  try {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.text();
    console.log('✅ GET /invoices:', response.status, data.substring(0, 100));
  } catch (error) {
    console.error('❌ GET test failed:', error.message);
  }
  
  // Test 2: Check root endpoint for invoice listing
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('✅ Root endpoint includes invoices:', !!data.endpoints?.invoices);
    console.log('📋 Available endpoints:', Object.keys(data.endpoints || {}));
  } catch (error) {
    console.error('❌ Root endpoint test failed:', error.message);
  }
}

testInvoiceAPI();