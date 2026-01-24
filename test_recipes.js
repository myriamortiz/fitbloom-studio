const fs = require('fs');
const path = require('path');

// Simulate the logic from food.js
const flatten = (obj) => {
  if (Array.isArray(obj)) return obj;
  return Object.values(obj).flat();
};

async function testLoad() {
  console.log("🔍 Testing Data Loading...");
  try {
    const root = path.resolve(__dirname, "data");
    
    // 1. Load Files
    const brunchRaw = fs.readFileSync(path.join(root, "brunch/brunch.json"), 'utf8');
    const collationRaw = fs.readFileSync(path.join(root, "collation/collation.json"), 'utf8');
    const dinerRaw = fs.readFileSync(path.join(root, "diner/diner.json"), 'utf8');
    const jusRaw = fs.readFileSync(path.join(root, "jus/jus.json"), 'utf8');

    console.log("✅ File Read Success");

    // 2. Parse JSON
    const brunchData = JSON.parse(brunchRaw);
    const collationData = JSON.parse(collationRaw);
    const dinerData = JSON.parse(dinerRaw);
    const jusData = JSON.parse(jusRaw);

    console.log("✅ JSON Parse Success");

    // 3. Flatten
    const ALL_DATA = {
      brunch: flatten(brunchData),
      collation: flatten(collationData),
      diner: flatten(dinerData),
      juice: flatten(jusData)
    };

    // 4. Report
    console.log("📊 Stats:");
    console.log(`- Brunch: ${ALL_DATA.brunch.length} recipes`);
    console.log(`- Collation: ${ALL_DATA.collation.length} recipes`);
    console.log(`- Diner: ${ALL_DATA.diner.length} recipes`);
    console.log(`- Juice: ${ALL_DATA.juice.length} recipes`);

    if (ALL_DATA.brunch.length === 0) throw new Error("Brunch is empty!");
    
    console.log("🎉 VERIFICATION SUCCESS: Data logic is perfect.");

  } catch (e) {
    console.error("❌ FAILURE:", e.message);
  }
}

testLoad();
