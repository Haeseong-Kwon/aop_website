import { readFileSync } from "node:fs";
const src = readFileSync("/Users/haeseong/Desktop/Developing/aop_website/src/components/motion/RotaryStage.tsx","utf8");
const body = src.slice(src.indexOf("/**\n * 사인 ease-in-out"), src.indexOf("/*\n * 회전을 쓸 수 없는"));
const js = body.replace(/: number\[\]/g,"").replace(/: number/g,"");
const m = await import("data:text/javascript," + encodeURIComponent(js + "\nexport { buildSteps, DEFAULT_HOLD };"));
const { buildSteps, DEFAULT_HOLD } = m;

const OLD_HOLD = 0.62;   // 이징 도입 전 값 — 속도 비교의 기준
let fail = 0;
console.log(`DEFAULT_HOLD = ${DEFAULT_HOLD.toFixed(4)}\n`);

for (const [count, vh] of [[3,460],[4,420]]) {
  const { input, output } = buildSteps(count, DEFAULT_HOLD);

  for (let i=1;i<input.length;i++)
    if (!(input[i] > input[i-1])) { console.log(`FAIL monotonic count=${count} @${i}`); fail++; break; }

  const step = 360/count;
  if (Math.abs(output.at(-1) + (count-1)*step) > 1e-9) { console.log(`FAIL total angle count=${count}`); fail++; }

  let maxV = 0;
  for (let i=1;i<input.length;i++)
    maxV = Math.max(maxV, Math.abs(output[i]-output[i-1])/(input[i]-input[i-1]));

  // 이징 전: 좁은 구간을 등속으로 통과했다
  const oldV = step / ((1/count)*(1-OLD_HOLD));
  // 스크롤 길이까지 반영한 '화면에서 체감하는' 각속도 (deg per vh)
  const oldPerVh = oldV / (count===3 ? 300 : 420);
  const newPerVh = maxV / vh;

  console.log(`count=${count}  peak/oldLinear=${(maxV/oldV).toFixed(2)}  deg-per-vh ${oldPerVh.toFixed(2)} -> ${newPerVh.toFixed(2)}  (${(newPerVh/oldPerVh).toFixed(2)}x)`);
  if (maxV/oldV > 1.02) { console.log("  FAIL: 이징 후 최고 각속도가 이전 등속보다 빠르다"); fail++; }
  if (newPerVh > oldPerVh + 1e-9) { console.log("  FAIL: 체감 회전이 더 빨라졌다"); fail++; }
}
console.log(fail ? `\n${fail} FAILURES` : "\nall checks passed");
process.exit(fail?1:0);
