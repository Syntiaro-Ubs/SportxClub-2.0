async function testCMS() {
  console.log("Testing CMS Onboarding Endpoint with CMS Admin Header...");

  // Test 1: With cms_admin_super_token
  const res1 = await fetch("http://localhost:5000/api/admin/onboarding", {
    headers: {
      Authorization: "Bearer cms_admin_super_token",
    },
  });
  console.log("Status with cms_admin_super_token:", res1.status);
  const data1 = await res1.json();
  console.log("Success:", data1.success, "Requests count:", Array.isArray(data1.data) ? data1.data.length : data1);

  // Test 2: With admin token
  const res2 = await fetch("http://localhost:5000/api/admin/turfs", {
    headers: {
      Authorization: "Bearer cms_admin_master_session",
    },
  });
  console.log("Turfs status with CMS token:", res2.status);
  const data2 = await res2.json();
  console.log("Success:", data2.success, "Turfs count:", Array.isArray(data2.data) ? data2.data.length : data2);
}

testCMS().catch(console.error);
