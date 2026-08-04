export interface Segment {
    text: string;
    /** `*...*` 로 감싸여 있던 구간 — 세리프 이탤릭으로 렌더한다. */
    em: boolean;
}

const MARKER = /(\*[^*]+\*)/g;

/** `모델 위에 필요한 *네 겹*의 기술` → [{네 겹, em:true}, ...] */
export function parseEmphasis(input: string): Segment[] {
    return input
        .split(MARKER)
        .filter((part) => part.length > 0)
        .map((part) =>
            part.length > 2 && part.startsWith("*") && part.endsWith("*")
                ? { text: part.slice(1, -1), em: true }
                : { text: part, em: false }
        );
}

/** 마스크 리빌용 — 공백으로 먼저 쪼갠 뒤 각 어절 안에서 강조를 파싱한다. */
export function parseEmphasisWords(input: string): Segment[][] {
    return input.split(" ").map(parseEmphasis);
}

/** 강조 마커를 제거한 순수 텍스트 (aria-label 등에 사용). */
export function stripEmphasis(input: string): string {
    return input.replace(MARKER, (match) => match.slice(1, -1));
}

/**
 * 강조는 서체를 바꾸지 않고 발광 그라디언트로 처리한다.
 * 세리프 혼용은 스크립트마다 다른 서체를 물고 와야 해서 한글에서 자간이 무너졌고,
 * 레퍼런스의 그래픽 언어와도 맞지 않았다.
 */
export const EMPHASIS_CLASS = "em-glow";
