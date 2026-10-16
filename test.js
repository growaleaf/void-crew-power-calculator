// Headless known-answer tests. Run: node test.js
var calc = require("./script.js");

var failures = 0;

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    failures++;
    console.log("FAIL " + label + " — expected " + expected + ", got " + actual);
  } else {
    console.log("PASS " + label + " (" + actual + ")");
  }
}

// Re-derive the cited reference constants and assert they match what the page cites and sources.

assertEqual(calc.ARC_SHIELD_POWER_REQUIRED.T1, 2, "Arc Shield T1 Power Required");
assertEqual(calc.ARC_SHIELD_POWER_REQUIRED.T2, 3, "Arc Shield T2 Power Required");
assertEqual(calc.ARC_SHIELD_POWER_REQUIRED.T3, 4, "Arc Shield T3 Power Required");

assertEqual(calc.CONFESSOR_CARRONADE_POWER_REQUIRED.T1, 4, "Confessor Carronade T1 Power Required");
assertEqual(calc.CONFESSOR_CARRONADE_POWER_REQUIRED.T3, 6, "Confessor Carronade T3 Power Required");

assertEqual(calc.POWER_GENERATOR_BASE_PRODUCTION.T1, 1, "Power Generator T1 Base Production");
assertEqual(calc.POWER_GENERATOR_BASE_PRODUCTION.T3, 4, "Power Generator T3 Base Production");

assertEqual(calc.FRIGATE.enginePowerForward, 2000, "Frigate Engine Power (forward)");
assertEqual(calc.FRIGATE.boosterPowerForward, 4000, "Frigate Booster Power (forward)");
assertEqual(calc.DESTROYER.enginePowerForward, 1000, "Destroyer Engine Power (forward)");
assertEqual(calc.DESTROYER.boosterPowerForward, 2000, "Destroyer Booster Power (forward)");

// computeBudget: plain arithmetic, no verdict — only surplus/deficit/balanced and the numbers.

(function surplusCase() {
  var r = calc.computeBudget(10, [
    { powerRequired: 4, installed: true },
    { powerRequired: 3, installed: true }
  ]);
  assertEqual(r.totalDraw, 7, "Surplus case: total draw");
  assertEqual(r.balance, 3, "Surplus case: balance");
  assertEqual(r.status, "surplus", "Surplus case: status");
})();

(function deficitCase() {
  var r = calc.computeBudget(5, [
    { powerRequired: 4, installed: true },
    { powerRequired: 3, installed: true }
  ]);
  assertEqual(r.totalDraw, 7, "Deficit case: total draw");
  assertEqual(r.balance, -2, "Deficit case: balance");
  assertEqual(r.status, "deficit", "Deficit case: status");
})();

(function balancedCase() {
  var r = calc.computeBudget(7, [{ powerRequired: 7, installed: true }]);
  assertEqual(r.balance, 0, "Balanced case: balance");
  assertEqual(r.status, "balanced", "Balanced case: status");
})();

(function uninstalledIgnored() {
  var r = calc.computeBudget(10, [
    { powerRequired: 4, installed: true },
    { powerRequired: 100, installed: false }
  ]);
  assertEqual(r.totalDraw, 4, "Uninstalled module excluded from draw");
  assertEqual(r.balance, 6, "Uninstalled module excluded from balance");
})();

(function emptyLoadout() {
  var r = calc.computeBudget(12, []);
  assertEqual(r.totalDraw, 0, "Empty loadout: total draw");
  assertEqual(r.balance, 12, "Empty loadout: balance equals capacity");
  assertEqual(r.status, "surplus", "Empty loadout: status");
})();

(function nonNumericCapacityDefaultsToZero() {
  var r = calc.computeBudget("", [{ powerRequired: 2, installed: true }]);
  assertEqual(r.capacity, 0, "Blank capacity treated as 0, not NaN");
  assertEqual(r.balance, -2, "Blank capacity produces a deficit of the full draw");
})();

if (failures > 0) {
  console.log(failures + " test(s) failed.");
  process.exit(1);
} else {
  console.log("All tests passed.");
}
