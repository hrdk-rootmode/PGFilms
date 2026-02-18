// Test script to verify package update functionality
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testPackageUpdate() {
  try {
    console.log('🧪 Testing package update functionality...\n');

    // First, let's get existing packages
    console.log('1. Fetching existing packages...');
    const getPackagesResponse = await axios.get(`${API_URL}/admin/packages`);
    console.log('Response:', getPackagesResponse.data);
    
    if (!getPackagesResponse.data.success) {
      throw new Error('Failed to fetch packages');
    }

    const packages = getPackagesResponse.data.data;
    console.log(`Found ${packages.length} packages\n`);

    // If no packages exist, create one first
    let testPackage;
    if (packages.length === 0) {
      console.log('2. Creating a test package...');
      const createResponse = await axios.post(`${API_URL}/admin/packages`, {
        name: 'Test Package',
        price: 9999,
        description: 'This is a test package',
        features: ['Feature 1', 'Feature 2'],
        active: true,
        popular: false
      });
      
      if (!createResponse.data.success) {
        throw new Error('Failed to create package');
      }
      
      testPackage = createResponse.data.package;
      console.log('Created package:', testPackage);
    } else {
      testPackage = packages[0];
      console.log('Using existing package:', testPackage);
    }

    // Now test the update
    console.log('\n3. Testing package update...');
    const updateData = {
      name: 'Updated Test Package',
      price: 19999,
      description: 'This package has been updated',
      features: ['Updated Feature 1', 'Updated Feature 2', 'New Feature 3'],
      active: true,
      popular: true
    };

    const updateResponse = await axios.put(`${API_URL}/admin/packages/${testPackage.id}`, updateData);
    console.log('Update response:', updateResponse.data);

    if (!updateResponse.data.success) {
      throw new Error('Update failed');
    }

    console.log('✅ Package updated successfully!');

    // Verify the update
    console.log('\n4. Verifying update...');
    const verifyResponse = await axios.get(`${API_URL}/admin/packages`);
    const updatedPackages = verifyResponse.data.data;
    const updatedPackage = updatedPackages.find(p => p.id === testPackage.id);
    
    console.log('Updated package:', updatedPackage);

    // Check if fields were updated
    const isUpdated = 
      updatedPackage.name === updateData.name &&
      updatedPackage.price === updateData.price &&
      updatedPackage.description === updateData.description &&
      JSON.stringify(updatedPackage.features) === JSON.stringify(updateData.features) &&
      updatedPackage.popular === updateData.popular;

    if (isUpdated) {
      console.log('✅ All fields updated correctly!');
    } else {
      console.log('❌ Some fields were not updated correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testPackageUpdate();
