import { ImageResponse } from "next/og";
import { SITE, SITE_URL } from "@/lib/constants";

/*
 * 공유 카드 이미지.
 *
 * 이 파일이 없으면 카카오톡·슬랙 같은 크롤러가 og:image를 못 찾고 페이지에서 가장 큰
 * 이미지를 대신 긁어간다 — 그게 제품 썸네일(products/autopilot.jpg)이었고, 회사 링크에
 * 제품 하나가 대표로 뜨던 원인이다. 회사 카드를 직접 그려서 그 자리를 채운다.
 *
 * 글자는 라틴만 쓴다. Satori는 넘겨준 폰트 안에서만 글리프를 찾는데 기본 폰트에는
 * 한글이 없어서, 여기에 한국어를 넣으면 네모 상자로 나온다. 한국어는 이미지가 아니라
 * og:title/og:description으로 전달된다 — 카드 본문은 크롤러가 직접 렌더한다.
 */

export const alt = `${SITE.name} — ${SITE.fullName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
    const host = SITE_URL.replace(/^https?:\/\//, "");

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#000000",
                    padding: "76px 84px",
                }}
            >
                {/*
                 * 히어로의 발광면을 옮겨온 층. 오른쪽 위에서 들어와 왼쪽 아래로 번진다.
                 * inset 축약형과 `900px 620px at ...` 형태의 크기 지정은 Satori가 읽지 못하고
                 * 통째로 버린다 — 좌표를 하나씩 적고 circle 문법만 쓴다.
                 */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 1200,
                        height: 630,
                        display: "flex",
                        backgroundImage:
                            "radial-gradient(circle at 80% 2%, rgba(74,140,255,0.42) 0%, rgba(74,140,255,0.10) 38%, rgba(0,0,0,0) 66%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 1200,
                        height: 630,
                        display: "flex",
                        backgroundImage:
                            "radial-gradient(circle at 2% 108%, rgba(74,140,255,0.38) 0%, rgba(74,140,255,0.08) 34%, rgba(0,0,0,0) 60%)",
                    }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div
                        style={{
                            fontSize: 26,
                            letterSpacing: "0.34em",
                            color: "#bcd8ff",
                        }}
                    >
                        AI AGENT TECHNOLOGY
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            fontSize: 176,
                            fontWeight: 700,
                            letterSpacing: "-0.045em",
                            color: "#ffffff",
                            lineHeight: 1,
                        }}
                    >
                        {SITE.name}
                    </div>
                    <div
                        style={{
                            marginTop: 26,
                            fontSize: 52,
                            letterSpacing: "-0.02em",
                            color: "#e6efff",
                        }}
                    >
                        {SITE.fullName}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid rgba(188,216,255,0.22)",
                        paddingTop: "30px",
                    }}
                >
                    <div style={{ fontSize: 30, color: "#8fb4ee" }}>
                        Agent · Product · Research
                    </div>
                    <div style={{ fontSize: 30, color: "#8fb4ee" }}>{host}</div>
                </div>
            </div>
        ),
        size
    );
}
