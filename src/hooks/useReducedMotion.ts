"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export { useReducedMotion };

/**
 * 마우스 같은 정밀 포인터가 있는 환경인지. 터치 전용 기기에서는 false.
 * SSR에서는 false로 시작해 hydration 이후 확정한다(레이아웃 시프트 방지).
 */
export function useFinePointer(): boolean {
    const [isFine, setIsFine] = useState(false);

    useEffect(() => {
        const query = window.matchMedia("(hover: hover) and (pointer: fine)");
        const update = () => setIsFine(query.matches);

        update();
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, []);

    return isFine;
}

/**
 * transform 기반 모션(패럴랙스·커서·마그네틱)을 켜도 되는지에 대한 단일 판단 지점.
 */
export function useRichMotion(): boolean {
    const prefersReduced = useReducedMotion();
    const isFine = useFinePointer();

    return isFine && !prefersReduced;
}
