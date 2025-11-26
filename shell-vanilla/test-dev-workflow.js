/**
 * Development Workflow Test
 * Tests that both servers are running and the integration works
 */

async function testDevWorkflow() {
  console.log('🧪 Testing Development Workflow\n');
  
  const tests = [];
  let passed = 0;
  let failed = 0;

  // Test 1: Shell server is running
  try {
    const shellResponse = await fetch('http://localhost:4200/');
    if (shellResponse.ok) {
      console.log('✅ Test 1: Shell server is running on port 4200');
      passed++;
    } else {
      throw new Error(`Status: ${shellResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 1: Shell server is NOT running:', error.message);
    failed++;
  }

  // Test 2: MFE1 server is running
  try {
    const mfeResponse = await fetch('http://localhost:4201/');
    if (mfeResponse.ok) {
      console.log('✅ Test 2: MFE1 server is running on port 4201');
      passed++;
    } else {
      throw new Error(`Status: ${mfeResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 2: MFE1 server is NOT running:', error.message);
    failed++;
  }

  // Test 3: MFE1 remoteEntry.json is accessible
  try {
    const remoteEntryResponse = await fetch('http://localhost:4201/remoteEntry.json');
    if (remoteEntryResponse.ok) {
      const remoteEntry = await remoteEntryResponse.json();
      if (remoteEntry.name === 'mfe1') {
        console.log('✅ Test 3: MFE1 remoteEntry.json is accessible and valid');
        passed++;
      } else {
        throw new Error('Invalid remoteEntry.json structure');
      }
    } else {
      throw new Error(`Status: ${remoteEntryResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 3: MFE1 remoteEntry.json is NOT accessible:', error.message);
    failed++;
  }

  // Test 4: Shell serves main.js
  try {
    const mainJsResponse = await fetch('http://localhost:4200/src/main.js');
    if (mainJsResponse.ok) {
      const content = await mainJsResponse.text();
      if (content.includes('router') && content.includes('mfeLoader')) {
        console.log('✅ Test 4: Shell main.js is accessible and contains expected code');
        passed++;
      } else {
        throw new Error('main.js missing expected content');
      }
    } else {
      throw new Error(`Status: ${mainJsResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 4: Shell main.js is NOT accessible:', error.message);
    failed++;
  }

  // Test 5: Shell serves router.js
  try {
    const routerResponse = await fetch('http://localhost:4200/src/router.js');
    if (routerResponse.ok) {
      const content = await routerResponse.text();
      if (content.includes('class Router') && content.includes('navigate')) {
        console.log('✅ Test 5: Shell router.js is accessible and contains Router class');
        passed++;
      } else {
        throw new Error('router.js missing expected content');
      }
    } else {
      throw new Error(`Status: ${routerResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 5: Shell router.js is NOT accessible:', error.message);
    failed++;
  }

  // Test 6: Shell serves mfe-loader.js
  try {
    const loaderResponse = await fetch('http://localhost:4200/src/mfe-loader.js');
    if (loaderResponse.ok) {
      const content = await loaderResponse.text();
      if (content.includes('class MFELoader') && content.includes('loadMFE')) {
        console.log('✅ Test 6: Shell mfe-loader.js is accessible and contains MFELoader class');
        passed++;
      } else {
        throw new Error('mfe-loader.js missing expected content');
      }
    } else {
      throw new Error(`Status: ${loaderResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 6: Shell mfe-loader.js is NOT accessible:', error.message);
    failed++;
  }

  // Test 7: Shell serves navigation.js
  try {
    const navResponse = await fetch('http://localhost:4200/src/navigation.js');
    if (navResponse.ok) {
      const content = await navResponse.text();
      if (content.includes('createNavigation')) {
        console.log('✅ Test 7: Shell navigation.js is accessible and contains navigation code');
        passed++;
      } else {
        throw new Error('navigation.js missing expected content');
      }
    } else {
      throw new Error(`Status: ${navResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 7: Shell navigation.js is NOT accessible:', error.message);
    failed++;
  }

  // Test 8: Shell serves styles.css
  try {
    const stylesResponse = await fetch('http://localhost:4200/src/styles.css');
    if (stylesResponse.ok) {
      console.log('✅ Test 8: Shell styles.css is accessible');
      passed++;
    } else {
      throw new Error(`Status: ${stylesResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 8: Shell styles.css is NOT accessible:', error.message);
    failed++;
  }

  // Test 9: MFE1 exposes bootstrap module
  try {
    const bootstrapResponse = await fetch('http://localhost:4201/chunk-YTLB4KX5.js');
    if (bootstrapResponse.ok) {
      console.log('✅ Test 9: MFE1 bootstrap chunk is accessible');
      passed++;
    } else {
      throw new Error(`Status: ${bootstrapResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Test 9: MFE1 bootstrap chunk is NOT accessible:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n✨ All tests passed! Development workflow is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Open http://localhost:4200/ in your browser');
    console.log('   2. Click on "MFE1 Dashboard" to test MFE loading');
    console.log('   3. Test navigation between Home and MFE1');
    console.log('   4. Test browser back/forward buttons');
    console.log('   5. Make changes to files and verify hot reload works');
    return 0;
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    return 1;
  }
}

// Run the tests
testDevWorkflow()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
