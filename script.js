// Void Crew power-budget math. Isomorphic: runs in the browser (attached to window.VCCALC) and
// under Node for the headless tests (module.exports).
//
// Premise correction (see README.md "What this tool actually models"): Void Crew's documented
// power system is a static loadout budget — each installed piece of equipment has a "Power
// Required" cost, and the ship's Power Core has a max capacity (raised by installing Power
// Generators). Exceed capacity and the core overloads (heat/breaker-trip over time), not an
// instant per-second drain from firing weapons or boosting. "Engine Power" / "Booster Power" are
// a separate, unrelated thrust stat — kept here only as a cited reference, never summed into the
// power budget.
//
// No ship's base Power Core capacity is documented anywhere the wiki or search could reach
// (voidcrew.wiki.gg/wiki/Ship_Management is a stub with no figure). No per-module Power Required
// figure found a second independent source distinct from the wiki's own "Dragon" Discord credit —
// so none of this is shipped as a calculator default. computeBudget() takes capacity and module
// costs as plain arguments; the page only ever passes player-entered numbers to it.
(function (root) {
  "use strict";

  // Cited reference only (voidcrew.wiki.gg/wiki/Arc_Shield, 2026-10-16) — not used as a default
  // anywhere in computeBudget. Single-sourced; no second independent corroboration found.
  var ARC_SHIELD_POWER_REQUIRED = { T1: 2, T2: 3, T3: 4 };

  // Cited reference only (voidcrew.wiki.gg/wiki/Confessor_Carronade, 2026-10-16). The wiki itself
  // flags this stats table as possibly outdated since the 1.0 patch (2024-11-25). Single-sourced.
  var CONFESSOR_CARRONADE_POWER_REQUIRED = { T1: 4, T2: 5, T3: 6 };

  // Cited reference only (voidcrew.wiki.gg/wiki/Power_Generator, 2026-10-16). "Base Production"
  // before enhancement slots. Single-sourced, no units given on the page.
  var POWER_GENERATOR_BASE_PRODUCTION = { T1: 1, T2: 2, T3: 4 };

  // Cited reference only. These are thrust figures (Engine Power used while the Booster is
  // inactive, Booster Power while active) — a different stat from "Power Required" above, never
  // added into a power budget. voidcrew.wiki.gg/wiki/Frigate and /wiki/Destroyer, 2026-10-16.
  var FRIGATE = {
    enginePowerForward: 2000,
    boosterPowerForward: 4000,
    hardpoints: { medium: 3, small: 2 },
    crew: "1-3"
  };
  var DESTROYER = {
    enginePowerForward: 1000,
    boosterPowerForward: 2000,
    hardpoints: { large: 1, medium: 6 },
    crew: "3-4"
  };

  // modules: array of { powerRequired: number, installed: boolean }. Only installed modules draw.
  function totalDraw(modules) {
    var list = Array.isArray(modules) ? modules : [];
    return list.reduce(function (sum, m) {
      if (!m || m.installed === false) return sum;
      var p = Number(m.powerRequired);
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
  }

  // Plain arithmetic, no verdict: balance = capacity - draw. status is a label for the sign only.
  function computeBudget(coreCapacity, modules) {
    var capacity = Number(coreCapacity);
    if (isNaN(capacity)) capacity = 0;
    var draw = totalDraw(modules);
    var balance = capacity - draw;
    var status = balance > 0 ? "surplus" : (balance < 0 ? "deficit" : "balanced");
    return { capacity: capacity, totalDraw: draw, balance: balance, status: status };
  }

  var api = {
    ARC_SHIELD_POWER_REQUIRED: ARC_SHIELD_POWER_REQUIRED,
    CONFESSOR_CARRONADE_POWER_REQUIRED: CONFESSOR_CARRONADE_POWER_REQUIRED,
    POWER_GENERATOR_BASE_PRODUCTION: POWER_GENERATOR_BASE_PRODUCTION,
    FRIGATE: FRIGATE,
    DESTROYER: DESTROYER,
    totalDraw: totalDraw,
    computeBudget: computeBudget
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.VCCALC = api;
  }
})(typeof window !== "undefined" ? window : this);
