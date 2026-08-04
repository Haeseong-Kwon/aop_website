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

const HANGUL = /[가-힣]/;

/**
 * 강조 구간의 스크립트에 맞는 세리프 클래스.
 * Instrument Serif에는 한글 글리프가 없어 그대로 두면 폴백 세리프로 깨진다.
 * 라틴은 이탤릭, 한글은 명조 정체로 나눈다.
 */
export function emphasisClass(text: string): string {
    return HANGUL.test(text) ? "serif-em-ko" : "serif-em";
}

/** Noto Serif KR을 강조어에 쓰인 글자만 서브셋으로 받기 위한 문자 집합. */
export function emphasizedChars(sources: readonly string[]): string {
    const chars = sources
        .flatMap((source) => source.match(MARKER) ?? [])
        .join("")
        .replace(/\*/g, "")
        .split("")
        .filter((char) => HANGUL.test(char));

    return Array.from(new Set(chars)).join("");
}
