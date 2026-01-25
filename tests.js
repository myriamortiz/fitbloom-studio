console.log('--- START TESTS ---');
console.log('Test 1: Default Goal');
if (userProfile.goals.includes('forme')) console.log('PASS: Default is forme');
else console.log('FAIL: ' + JSON.stringify(userProfile.goals));

console.log('Test 2: Add perte_poids');
toggleGoal({ classList: { toggle: () => { }, contains: () => true } }, 'perte_poids');
if (userProfile.goals.includes('perte_poids')) console.log('PASS: Added');
else console.log('FAIL');

console.log('Test 4: Calc Weight Loss (Soft)');
userProfile.gender = 'H'; userProfile.weight = 80; userProfile.height = 180; userProfile.age = 30; userProfile.activity = 1.2;
userProfile.goals = ['perte_poids']; userProfile.intensity = 'soft';
calculateCalories();
if (userProfile.targetCalories >= 1815 && userProfile.targetCalories <= 1817) console.log('PASS: Calc Correct');
else console.log('FAIL: ' + userProfile.targetCalories);

console.log('Test 5: Combined');
userProfile.goals = ['perte_poids', 'prise_masse'];
calculateCalories();
if (userProfile.targetCalories >= 1996 && userProfile.targetCalories <= 1998) console.log('PASS: Combined Correct');
else console.log('FAIL: ' + userProfile.targetCalories);
