// 실행: node src/components/references/guardionSim.check.ts
import assert from "node:assert/strict";
import { BASE, CYCLE, DRONES, droneAt, trailAt } from "./guardionSim.ts";

const spec = { ...DRONES[0], offset: 0 };
const at = (u: number) => droneAt(spec, u * CYCLE);

assert.equal(at(0).phase, "takeoff");
assert.deepEqual(at(0).pos, BASE);
assert.equal(at(0.3).phase, "flight");
assert.equal(at(0.74).phase, "rtb");
assert.equal(at(0.9).phase, "charge");
assert.deepEqual(at(0.9).pos, BASE);
assert.equal(at(0.9).speed, 0);

// 비행 중 잔량은 줄고, 충전 중에는 다시 찬다
assert.ok(at(0.2).soc > at(0.6).soc);
assert.ok(at(0.85).soc < at(0.95).soc);
assert.ok(at(0.65).isLow);
assert.ok(!at(0.9).isLow, "충전 중인 기체는 저전압 경보를 띄우지 않는다");

// 사이클 경계에서 위치가 튀지 않는다
const end = droneAt(spec, CYCLE - 1e-6).pos;
assert.ok(Math.hypot(end.x - BASE.x, end.y - BASE.y) < 1e-3);
// 음수 t도 정상 범위로 감긴다
assert.equal(droneAt(spec, -1).phase, droneAt(spec, CYCLE - 1).phase);
assert.equal(trailAt(spec, 5, 8, 0.1).length, 8);

console.log("guardionSim ok");
