"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * 모노스페이스 값 + 복사 버튼. 특허번호처럼 눈으로 옮겨 적기 쉬운 값에 쓴다.
 *
 * clipboard API는 비보안 컨텍스트(http)와 권한 거부에서 거절되므로 반드시 잡는다.
 * 실패해도 값 자체는 화면에 그대로 있으니, 사용자에게 경고를 띄우는 대신
 * 버튼 상태만 원래대로 두고 조용히 넘어간다.
 */
export function CopyableCode({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);

    // 복사 표시는 잠깐만 남긴다
    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 1600);
        return () => clearTimeout(timer);
    }, [copied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
        } catch (error) {
            console.error("클립보드 복사 실패:", error);
        }
    };

    return (
        <span className="inline-flex items-center gap-2">
            <code className="font-mono text-[13px] tracking-[-0.01em] text-muted">
                {value}
            </code>
            <button
                type="button"
                onClick={handleCopy}
                aria-label={`${label} 번호 복사`}
                className="grid size-7 shrink-0 place-items-center rounded-md border border-border text-faint transition-colors hover:border-border-strong hover:text-bright"
            >
                {copied ? (
                    <Check size={13} className="text-signal" />
                ) : (
                    <Copy size={13} />
                )}
            </button>
            {/* 복사 결과는 시각 표시만으로는 전달되지 않는다 */}
            <span role="status" aria-live="polite" className="sr-only">
                {copied ? `${value} 복사됨` : ""}
            </span>
        </span>
    );
}
