// 실행: node src/components/references/caseSims.check.ts
import assert from "node:assert/strict";
import { CAMPAIGN_DAYS, PROMO_DAY_SEC, SNAP_MIN_PORTFOLIO, SNAP_STEPS, campaignAt, payoutQueue, signupWindow, snapAt, wilson } from "./caseSims.ts";

// PROMO — 오늘 값은 하루 동안 0에서 차오르고, 정산액은 총액 − 수수료
assert.equal(signupWindow(3 * PROMO_DAY_SEC, 14).at(-1), 0);
assert.equal(signupWindow(5, 14).length, 14);
for (const row of payoutQueue(4)) assert.equal(row.payout, row.gross - row.fee);
assert.equal(new Set(payoutQueue(4).map((r) => r.status)).size > 1, true, "큐에 여러 상태가 섞여 보인다");

// snapsnap — 단계는 범위 안, 첫 단계에서 포트폴리오가 차고 이후엔 최소 장수 유지
assert.equal(snapAt(0).step, 0);
assert.equal(snapAt(0).portfolio, 0);
assert.equal(snapAt(2.99).portfolio, SNAP_MIN_PORTFOLIO);
assert.equal(snapAt(-0.5).step, SNAP_STEPS.length - 1, "음수 t도 사이클로 감긴다");
assert.equal(snapAt(10).portfolio, SNAP_MIN_PORTFOLIO);

// POTENTIAL — Wilson 구간: 42/1000 ≈ [3.12%, 5.64%]
const ci = wilson(42, 1000);
assert.ok(Math.abs(ci.lo - 0.0312) < 0.001 && Math.abs(ci.hi - 0.0564) < 0.001, JSON.stringify(ci));
assert.deepEqual(wilson(0, 0), { lo: 0, hi: 1 });

const early = campaignAt(1);
const end = campaignAt(CAMPAIGN_DAYS + 1);
assert.ok(early.isThin, "캠페인 초반은 표본 부족");
assert.ok(!end.isThin && end.isFrozen);
assert.ok(end.stages.every((s, i) => i === 0 || s.count <= end.stages[i - 1].count), "퍼널은 단조 감소");
assert.ok(end.rate.hi - end.rate.lo < early.rate.hi - early.rate.lo, "표본이 쌓이면 구간이 좁아진다");

console.log("caseSims ok");
