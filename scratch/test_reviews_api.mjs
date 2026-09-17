async function testDynamicReviews() {
  const baseUrl = "http://localhost:5000";

  console.log("1. Fetching reviews for venue 'test'...");
  const res1 = await fetch(`${baseUrl}/api/turf/reviews?turf_name=test`);
  const data1 = await res1.json();
  console.log("Current reviews for 'test':", data1);

  console.log("\n2. Posting a new dynamic review for 'test'...");
  const postRes = await fetch(`${baseUrl}/api/turf/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: "Sahil Athlete",
      turf_name: "test",
      rating: 5,
      comment: "Super smooth dynamic review system! Turf grass is pristine.",
      date: "Just now",
    }),
  });
  const postData = await postRes.json();
  console.log("Posted review response:", postData);

  console.log("\n3. Re-fetching reviews for 'test'...");
  const res2 = await fetch(`${baseUrl}/api/turf/reviews?turf_name=test`);
  const data2 = await res2.json();
  console.log("Updated reviews for 'test':", data2);

  process.exit(0);
}

testDynamicReviews().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
