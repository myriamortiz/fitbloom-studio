// Mocks
const document = {
    getElementById: (id) => ({
        value: '',
        classList: {
            contains: () => false,
            add: () => { },
            remove: () => { },
            toggle: () => { console.log('Mock Toggle Called'); }
        } // Mock classList
    }),
    querySelectorAll: () => [],
    querySelector: () => ({ innerHTML: '' }), // Mock
    addEventListener: () => { } // Mock
};
const window = { location: { href: '' } };
const localStorage = { setItem: () => { } };
function alert(msg) { console.log("ALERT:", msg); }

// Load the file content (in a real env I'd require it, but here I'll simulate by pasting relevant parts or assuming it's loaded if I were running in a browser context. 
// Since I'm running via node, I need to load the JS file. 
// But simple read/eval is risky. 
// Instead, I will copy the logic I just wrote to ensure it works in isolation, OR better, I will read the file and eval it.)

const fs = require('fs');
const content = fs.readFileSync('intro.js', 'utf8');

// Mock DOM before eval
global.document = document;
global.window = window;
global.localStorage = localStorage;
global.alert = alert;

eval(content);

// Test Suite
console.log("--- START TESTS ---");

// Test 1: Single Goal DEFAULT
// userProfile.goals should be ['forme'] by default
console.log("Test 1: Default Goal");
if (userProfile.goals.includes('forme') && userProfile.goals.length === 1) {
    console.log("PASS: Default is forme");
} else {
    console.log("FAIL: Default is " + JSON.stringify(userProfile.goals));
}

// Test 2: Toggle Add
console.log("Test 2: Add 'perte_poids'");
toggleGoal({ classList: { toggle: () => { }, contains: () => true } }, 'perte_poids');
if (userProfile.goals.includes('perte_poids') && userProfile.goals.includes('forme')) {
    console.log("PASS: Added perte_poids, now have 2 goals");
} else {
    console.log("FAIL: " + JSON.stringify(userProfile.goals));
}

// Test 3: Toggle Remove
console.log("Test 3: Remove 'forme'");
toggleGoal({ classList: { toggle: () => { }, contains: () => false } }, 'forme');
if (!userProfile.goals.includes('forme') && userProfile.goals.includes('perte_poids')) {
    console.log("PASS: Removed forme");
} else {
    console.log("FAIL: " + JSON.stringify(userProfile.goals));
}

// Test 4: Calculation Logic (Standard Male)
userProfile.gender = 'H';
userProfile.weight = 80;
userProfile.height = 180;
userProfile.age = 30;
userProfile.activity = 1.2;
// BMR = 10*80 + 6.25*180 - 5*30 + 5 
// = 800 + 1125 - 150 + 5 = 1780
// TDEE Base = 1780 * 1.2 = 2136

// Goal is currently just ['perte_poids'] from Test 3. 
// Default intensity is undefined, let's set it to 'soft' (default implicit in logic if not hard)
userProfile.intensity = 'soft';

calculateCalories();
// Expected: 2136 * 0.85 = 1815.6 -> 1816
console.log("Test 4: Calc Weight Loss (Soft)");
console.log("Target: " + userProfile.targetCalories);
if (userProfile.targetCalories >= 1815 && userProfile.targetCalories <= 1817) {
    console.log("PASS: Calc correct");
} else {
    console.log("FAIL: Expected ~1816, got " + userProfile.targetCalories);
}

// Test 5: Combined Goals (Weight Loss + Muscle Gain)
console.log("Test 5: Combined Goals");
userProfile.goals = ['perte_poids', 'prise_masse'];
userProfile.intensity = 'soft'; // -15%
// Logic: TDEE * 0.85 * 1.10
// 2136 * 0.85 = 1815.6
// 1815.6 * 1.10 = 1997.16 -> 1997
calculateCalories();
console.log("Target: " + userProfile.targetCalories);
if (userProfile.targetCalories >= 1996 && userProfile.targetCalories <= 1998) {
    console.log("PASS: Combined Calc correct");
} else {
    console.log("FAIL: Expected ~1997, got " + userProfile.targetCalories);
}

// Test 6: Combined Hard
console.log("Test 6: Combined Goals (Hard)");
userProfile.intensity = 'hard'; // -30%
// 2136 * 0.70 = 1495.2
// 1495.2 * 1.10 = 1644.72 -> 1645
calculateCalories();
console.log("Target: " + userProfile.targetCalories);
if (userProfile.targetCalories >= 1644 && userProfile.targetCalories <= 1646) {
    console.log("PASS: Combined Hard correct");
} else {
    console.log("FAIL: Expected ~1645, got " + userProfile.targetCalories);
}

