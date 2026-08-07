"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

/*
 * opt-in 실시간 CV 데모.
 *
 * 원칙 하나: 사용자가 버튼을 누르기 전에는 MediaPipe도, 모델 파일도, 카메라 권한
 * 요청도 존재하지 않는다. 라이브러리를 미리 받아두는 것만으로도 이 섹션의 약속
 * ("영상은 브라우저에서만 처리됩니다")이 흐려진다.
 *
 * 손이 화면에서 움직이면 그 좌표가 3D 오브젝트의 회전을 제어한다.
 */

/*
 * wasm 번들 버전은 package.json의 @mediapipe/tasks-vision 버전과 반드시 같아야 한다.
 * 어긋나면 FilesetResolver가 로드 단계에서 실패한다.
 * 패키지가 wasm을 함께 배포하지만 34MB라 레포에 넣지 않고 CDN에서 받는다.
 * 업그레이드할 때 이 상수를 함께 올릴 것.
 */
const TASKS_VISION_VERSION = "1.0.1";
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`;
const HAND_MODEL =
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

type Phase = "idle" | "loading" | "running" | "error";

interface WebcamDemoProps {
    /** 손 위치(-0.5~0.5)를 오브젝트 회전 목표로 넘긴다. */
    onControl: (delta: { x: number; y: number }) => void;
}

export function WebcamDemo({ onControl }: WebcamDemoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [phase, setPhase] = useState<Phase>("idle");
    const [message, setMessage] = useState("");

    // 정리에 필요한 핸들은 렌더와 무관하므로 ref로 들고 있는다
    const streamRef = useRef<MediaStream | null>(null);
    const frameRef = useRef(0);
    const landmarkerRef = useRef<{ close: () => void } | null>(null);

    const stop = useCallback(() => {
        cancelAnimationFrame(frameRef.current);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        landmarkerRef.current?.close();
        landmarkerRef.current = null;
        setPhase("idle");
    }, []);

    // 탭 이동이나 언마운트로 카메라가 켜진 채 남는 일이 없도록 한다
    useEffect(() => stop, [stop]);

    const start = async () => {
        setPhase("loading");
        setMessage("");

        try {
            // 여기서 처음으로 MediaPipe 청크를 받는다
            const { FilesetResolver, HandLandmarker } = await import(
                "@mediapipe/tasks-vision"
            );

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 480, height: 360, facingMode: "user" },
                audio: false,
            });
            streamRef.current = stream;

            const video = videoRef.current;
            if (!video) throw new Error("비디오 엘리먼트를 찾을 수 없습니다.");

            video.srcObject = stream;
            await video.play();

            const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
            const landmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: HAND_MODEL, delegate: "GPU" },
                runningMode: "VIDEO",
                numHands: 1,
            });
            landmarkerRef.current = landmarker;

            setPhase("running");

            const detect = () => {
                if (!landmarkerRef.current || video.readyState < 2) {
                    frameRef.current = requestAnimationFrame(detect);
                    return;
                }

                const result = landmarker.detectForVideo(video, performance.now());
                const hand = result.landmarks?.[0];

                if (hand?.[9]) {
                    // 손바닥 중앙(중지 MCP)을 기준점으로 쓴다 — 손가락보다 덜 흔들린다
                    const palm = hand[9];
                    onControl({
                        // 셀피 뷰라 좌우가 반전돼 있다. 뒤집지 않으면 조작이 거울처럼 느껴진다.
                        x: (0.5 - palm.x) * 4,
                        y: (palm.y - 0.5) * 1.6,
                    });
                }

                frameRef.current = requestAnimationFrame(detect);
            };
            frameRef.current = requestAnimationFrame(detect);
        } catch (error) {
            console.error("웹캠 CV 데모 시작 실패:", error);
            // 실패해도 드래그 orbit은 그대로 동작하므로 조용히 원래 상태로 돌아간다
            stop();
            setPhase("error");
            setMessage(
                error instanceof DOMException && error.name === "NotAllowedError"
                    ? "카메라 권한이 거부되었습니다. 드래그로 계속 조작할 수 있습니다."
                    : "카메라를 시작하지 못했습니다. 드래그로 계속 조작할 수 있습니다."
            );
        }
    };

    return (
        /* 바깥 여백은 호출부가 정한다 — 무대 위에 얹힐 때와 아래에 놓일 때가 다르다 */
        <div className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bright">
                        Live demo
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                        손을 움직여 인식 오브젝트를 직접 돌려볼 수 있습니다.
                    </p>
                </div>

                {phase === "running" ? (
                    <button
                        type="button"
                        onClick={stop}
                        className="btn btn-ghost px-4 py-2 text-[13px]"
                    >
                        <X size={14} />
                        중지
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={start}
                        disabled={phase === "loading"}
                        className="btn btn-ghost px-4 py-2 text-[13px] disabled:opacity-50"
                    >
                        <Camera size={14} />
                        {phase === "loading" ? "불러오는 중…" : "카메라로 직접 시연"}
                    </button>
                )}
            </div>

            {/*
             * 비디오는 항상 DOM에 두되 실행 중일 때만 보인다.
             * 조건부로 만들면 play() 시점에 아직 마운트되지 않은 경우가 생긴다.
             */}
            <video
                ref={videoRef}
                muted
                playsInline
                className={
                    phase === "running"
                        ? "mt-4 w-full max-w-[220px] -scale-x-100 rounded-lg border border-border"
                        : "hidden"
                }
            />

            <p className="mt-3 text-[12px] leading-relaxed text-faint">
                영상은 브라우저에서만 처리되며 서버로 전송되지 않습니다.
            </p>

            {message ? (
                <p role="status" className="mt-2 text-[12px] text-destructive">
                    {message}
                </p>
            ) : null}
        </div>
    );
}
