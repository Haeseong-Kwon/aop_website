/*
 * 제품 리본 셰이더.
 *
 * 카드는 원통이 아니라 화면 가로(월드 x)에 고정된 '리본 곡면' 위를 미끄러진다. 곡면은
 * 깊이 방향의 S자(왼쪽은 다가오고 오른쪽은 물러남) + 문짝처럼 한쪽 경첩으로 기운 경사다.
 * 형태가 위치의 함수라서, 카드는 스스로 휘는 게 아니라 이미 휘어 있는 면을 '통과'하며
 * 모양이 바뀐다 — 정지 화면에서도 리본이 하나로 읽히는 이유다.
 *
 * 음영은 정점에서 보간해 받지 않는다. 휘기 전 평면 좌표(vFlat)만 넘기고, 깊이·법선은
 * 프래그먼트에서 같은 닫힌 식으로 다시 계산한다. 보간된 깊이는 곡선이 아니라 현(chord)이라
 * 광택 아래에서 줄무늬로 드러난다.
 */

export const SHEET_CHUNK = /* glsl */ `
const float SHEET_PI = 3.141592653589793;
// 쉬고 있을 때의 뱅크(깊이 S의 기울기를 따라 리본이 눕는 정도)
const float SHEET_BANK = -0.16;
// 오른쪽이 아주 살짝 올라가는 대각선. 0.03이면 화면 끝에서 20px 남짓
const float SHEET_DIAG = 0.03;
// 속도가 붙으면 왼쪽이 들리고(Y) 다가온다(Z). Z가 Y보다 커야 '들림'이 아니라 '다가옴'으로 읽힌다
const float SHEET_REAR_Y = 0.1;
const float SHEET_REAR_Z = 0.2;
// 속도에 따른 가장자리 비틀림(라디안). 양쪽이 서로 반대로 감겨 리본을 짜는 모양이 된다
const float SHEET_VTWIST = 1.8;
// 화면 밖으로 갈수록 곡면이 평평해지는 가우시안 꼬리
const float SHEET_TAIL = 1.0;
// S의 가까운 봉우리를 중앙보다 왼쪽에 둔다 — 정면이 아니라 '들어오며 부푸는' 모양
const float SHEET_SHIFT = -0.2;

uniform float uSheetW; // z=0에서의 화면 반폭(월드)
uniform float uSheetD; // 깊이 S의 진폭(월드). 속도에 비례해 깊어진다
uniform float uSheetT; // 화면 반폭 하나에 S가 얼마나 들어가는가
uniform float uSheetV; // 속도 0..1
uniform float uLeanA;  // 화면 끝에서의 문짝 깊이(부호 있음)

float sheetQ(float wx) {
  return wx / max(uSheetW, 0.0001) * uSheetT + SHEET_SHIFT;
}

float sheetShape(float q) {
  return sin(SHEET_PI * q) * exp(-SHEET_TAIL * q * q);
}

// dz/dq 정확값. 근사 법선은 광택 지수 아래에서 바로 들킨다
float sheetShapeSlope(float q) {
  float g = exp(-SHEET_TAIL * q * q);
  return (SHEET_PI * cos(SHEET_PI * q) - 2.0 * SHEET_TAIL * q * sin(SHEET_PI * q)) * g;
}

float sheetZ(float wx) {
  return -uSheetD * sheetShape(sheetQ(wx));
}

float sheetRoll(float wx) {
  return SHEET_BANK * sheetShapeSlope(sheetQ(wx)) / SHEET_PI;
}

// 문짝 경사. 하드 클램프는 ±1에서 기울기가 끊겨 광택에 세로 이음매를 만든다 — 부드러운 3차식
float leanRamp(float s) {
  s = clamp(s, -1.0, 1.0);
  return s * (1.5 - 0.5 * s * s);
}

float leanSlope(float s) {
  s = min(abs(s), 1.0);
  return 1.5 * (1.0 - s * s);
}

vec4 sheet(vec4 w, float k) {
  // 리본 중심선(y=z=0)을 축으로 감는다 — 카드마다 따로 돌면 리본이 끊어진다
  float a = sheetRoll(w.x) * k;
  float qe = w.x / max(uSheetW, 0.0001);
  a += SHEET_VTWIST * uSheetV * smoothstep(0.3, 0.9, abs(qe)) * sign(qe) * k;
  float s = sin(a);
  float c = cos(a);
  w = vec4(w.x, w.y * c - w.z * s, w.y * s + w.z * c, w.w);

  w.z += sheetZ(w.x) * k;
  w.y += SHEET_DIAG * w.x * k;

  float m = 1.0 - smoothstep(-1.0, 0.3, qe);
  w.y += SHEET_REAR_Y * uSheetW * uSheetV * m * k;
  w.z += SHEET_REAR_Z * uSheetW * uSheetV * m * k;

  w.z += uLeanA * leanRamp(qe) * k;
  return w;
}

float sheetDome(vec2 uv) {
  vec2 q = uv * 2.0 - 1.0;
  return (1.0 - q.x * q.x) * (1.0 - q.y * q.y);
}
`;

export const CARD_VERTEX = /* glsl */ `
uniform vec2 uRes;    // 카드의 월드 크기
uniform float uHover;
uniform float uDent;  // 호버 시 가운데가 물러나는 깊이(카드 높이 대비)
uniform float uSheetP;

varying vec2 vUv;
varying vec3 vFlat;

${SHEET_CHUNK}

void main() {
  vUv = uv;
  vFlat = (modelMatrix * vec4(position, 1.0)).xyz;

  // 호버: 테두리는 그대로 두고 가운데만 뒤로 휜다. 실루엣이 변하지 않아 이웃 카드와 겹치지 않는다
  vec3 p = position;
  p.z -= uHover * uDent * uRes.y * sheetDome(uv);

  vec4 w = modelMatrix * vec4(p, 1.0);
  w = sheet(w, uSheetP);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const CARD_FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uRes;
uniform float uHover;
uniform float uDent;
uniform float uSheetP;
uniform float uCorner;  // 모서리 반지름(월드). 높이가 줄면 자연스럽게 알약이 된다
uniform float uWhite;   // 인트로 동안 이미지를 덮는 밝은 면
uniform vec3 uWash;
uniform vec3 uHaze;

varying vec2 vUv;
varying vec3 vFlat;

${SHEET_CHUNK}

const vec3 LIGHT_DIR = vec3(-0.3487, 0.4359, 0.8295); // normalize(-0.4, 0.5, 1.0)
const float LIGHT_GLOSS = 48.0;
const float LIGHT_SPEC = 0.28;
const float LIGHT_DIFF = 0.12;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec3 color = texture2D(uMap, vUv).rgb;
  float k = uSheetP;

  // 깊이 헤이즈 — 멀어진 부분이 배경으로 가라앉는다. 검은 곱하기가 아니라 거리감이다
  float depth = clamp((uSheetD - sheetZ(vFlat.x)) / (2.0 * max(uSheetD, 0.0001)), 0.0, 1.0) * k;
  depth += uHover * uDent * uRes.y * sheetDome(vUv) / (2.0 * max(uSheetD, 0.0001));
  color = mix(color, uHaze, 0.8 * clamp(depth, 0.0, 1.0));

  // 면 위의 빛. 법선은 메시를 거치지 않고 곡면 식의 정확한 도함수에서 만든다
  float qx = vFlat.x / max(uSheetW, 0.0001);
  float dzdx = -uSheetD * sheetShapeSlope(sheetQ(vFlat.x)) * uSheetT / max(uSheetW, 0.0001) * k;
  dzdx += uLeanA / max(uSheetW, 0.0001) * leanSlope(qx) * k;
  float dzdy = 0.0;
  if (uHover > 0.0001) {
    vec2 q = vUv * 2.0 - 1.0;
    float a = uHover * uDent;
    dzdx += 4.0 * a * uRes.y * q.x * (1.0 - q.y * q.y) / max(uRes.x, 0.0001);
    dzdy += 4.0 * a * q.y * (1.0 - q.x * q.x);
  }
  vec3 n = normalize(vec3(-dzdx, -dzdy, 1.0));
  float roll = sheetRoll(vFlat.x) * k;
  n = vec3(n.x, n.y * cos(roll) - n.z * sin(roll), n.y * sin(roll) + n.z * cos(roll));

  vec3 p = vFlat + vec3(0.0, 0.0, sheetZ(vFlat.x) * k + uLeanA * leanRamp(qx) * k);
  vec3 v = normalize(cameraPosition - p);
  float diffuse = dot(n, LIGHT_DIR) * 0.5 + 0.5;
  color *= 1.0 - LIGHT_DIFF * k * (1.0 - diffuse);
  color += pow(max(dot(n, normalize(LIGHT_DIR + v)), 0.0), LIGHT_GLOSS) * LIGHT_SPEC * k;

  color = mix(color, uWash, uWhite);

  // 둥근 모서리. fwidth로 화면 1px 폭의 안티앨리어싱을 건다
  vec2 half_ = uRes * 0.5;
  float d = roundedBox((vUv - 0.5) * uRes, half_, min(uCorner, min(half_.x, half_.y)));
  float alpha = 1.0 - smoothstep(-fwidth(d), fwidth(d), d);
  if (alpha <= 0.0) discard;

  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`;

export const FLOOR_VERTEX = /* glsl */ `
uniform float uLeanA;
uniform float uSheetW;
uniform float uRun;

varying vec2 vUv;
varying vec3 vWorld;
varying float vFar;

float leanRamp(float s) {
  s = clamp(s, -1.0, 1.0);
  return s * (1.5 - 0.5 * s * s);
}

void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  // 0은 카드가 선 줄, 1은 먼 끝, 음수는 카메라 쪽
  vFar = -w.z / max(uRun, 0.0001);
  w.z += uLeanA * leanRamp(w.x / max(uSheetW, 0.0001));
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

/*
 * 바닥 격자. 선 두께를 fwidth로 화면 픽셀에 맞춰 멀어져도 지글거리지 않는다.
 * 선 위에만 카드의 반사를 얹는다 — 거울 바닥이 아니라 격자선이 빛을 받아 내는 모양이다.
 */
export const FLOOR_FRAGMENT = /* glsl */ `
uniform float uGrid;
uniform float uAlpha;
uniform vec2 uGridF;
uniform sampler2D uRefl;
uniform float uReflA;
uniform mat4 uReflVP;

varying vec2 vUv;
varying vec3 vWorld;
varying float vFar;

void main() {
  float fade = 1.0 - smoothstep(0.2, 0.95, vFar);

  vec2 g = vec2(vUv.x * uGridF.x, vFar * uGridF.y);
  vec2 gf = abs(fract(g) - 0.5);
  vec2 lines = vec2(1.0) - smoothstep(vec2(0.0), fwidth(g) * 1.5, gf);
  float line = max(lines.x, lines.y);

  vec3 color = vec3(line * uGrid * fade);

  if (uReflA > 0.001) {
    // 멀수록 반사를 바깥으로 벌려 바닥이 매끈한 거울이 아니라 거친 면으로 읽히게 한다
    vec3 wp = vWorld;
    wp.x -= wp.x * 0.35 * abs(vFar);
    vec4 rp = uReflVP * vec4(wp, 1.0);
    vec2 ruv = rp.xy / max(rp.w, 0.0001) * 0.5 + 0.5;
    vec2 soft = smoothstep(vec2(0.0), vec2(0.1), ruv) * (1.0 - smoothstep(vec2(0.9), vec2(1.0), ruv));
    float fall = exp(-(vFar > 0.0 ? vFar * 6.0 : -vFar * 2.2));
    color += texture2D(uRefl, ruv).rgb * line * uReflA * fall * soft.x * soft.y * fade;
  }

  gl_FragColor = vec4(color, uAlpha * fade);
  #include <colorspace_fragment>
}
`;
