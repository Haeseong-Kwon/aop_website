"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { PIPELINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * 파이프라인을 제품 UI처럼 보여주는 일러스트레이션 패널.
 * 실제 실행 로그가 아니라 Technology 섹션의 구조를 미리 보여주는 목업이다.
 */
// TODO: 실제 에셋 교체 — 콘솔 스크린샷 확보 시 next/image로 대체
const DONE = 4;

export function AgentRunPanel() {
    return (
        <div className="surface-card overflow-hidden">
            <div className="browser-chrome">
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="ml-3 truncate font-mono text-[11px] text-faint">
                    agent · run trace
                </span>
            </div>

            <div className="divide-y divide-border">
                {PIPELINE.map((node, index) => {
                    const done = index < DONE;
                    const running = index === DONE;

                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.9 + index * 0.09,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 sm:px-5"
                        >
                            <span
                                className={cn(
                                    "grid size-5 shrink-0 place-items-center rounded-full border",
                                    done && "border-transparent bg-accent-2-soft text-accent-2",
                                    running && "border-transparent bg-accent-soft text-accent",
                                    !done && !running && "border-border text-faint"
                                )}
                            >
                                {done ? (
                                    <Check size={11} strokeWidth={3} />
                                ) : running ? (
                                    <Loader2 size={11} className="animate-spin" />
                                ) : (
                                    <span className="size-1 rounded-full bg-current" />
                                )}
                            </span>

                            <span
                                className={cn(
                                    "font-mono text-[12px] tracking-tight sm:text-[13px]",
                                    done || running ? "text-text" : "text-faint"
                                )}
                            >
                                {node.label}
                            </span>

                            <span className="ml-auto hidden truncate text-[12px] text-muted sm:block">
                                {running ? "실행 중" : done ? "완료" : "대기"}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between border-t border-border bg-surface-2 px-4 py-3 sm:px-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                    checkpointed
                </span>
                <span className="font-mono text-[11px] text-muted">
                    {DONE}/{PIPELINE.length}
                </span>
            </div>
        </div>
    );
}
