"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** 화면 갱신 간격(ms). 재현 그래픽은 30fps면 충분하고, 그 이상은 배터리만 쓴다 */
const FRAME_MS = 33;

/**
 * 재현 그래픽 공용 시계. 화면에 보이고 모션 축소가 꺼져 있을 때만 흐른다.
 * SSR·모션 축소 환경에서는 still 시각에 멈춰 있어 대표 장면 한 컷을 보여준다.
 */
export function useSceneClock<T extends Element>(still: number): [RefObject<T | null>, number] {
    const ref = useRef<T>(null);
    const isInView = useInView(ref, { margin: "0px 0px -10% 0px" });
    const prefersReduced = useReducedMotion();
    const isActive = isInView && !prefersReduced;
    const [time, setTime] = useState(still);

    useEffect(() => {
        if (!isActive) return;
        let frame = 0;
        let last = performance.now();
        let acc = 0;

        const tick = (now: number) => {
            acc += now - last;
            last = now;
            if (acc >= FRAME_MS) {
                // 탭 전환 뒤 돌아왔을 때 수십 초를 한 번에 건너뛰지 않게 상한을 둔다
                const step = Math.min(acc, 100) / 1000;
                acc = 0;
                setTime((prev) => prev + step);
            }
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [isActive]);

    return [ref, time];
}
