import { Reveal } from "@/components/motion/Reveal";
import { EMPHASIS_CLASS, parseEmphasis } from "@/lib/emphasis";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    description?: string;
    className?: string;
    /** 레퍼런스를 따라 기본은 중앙 정렬. */
    align?: "left" | "center";
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    className,
    align = "center",
}: SectionHeadingProps) {
    const centered = align === "center";

    return (
        <Reveal
            className={cn(
                "max-w-3xl",
                centered && "mx-auto text-center",
                className
            )}
        >
            <p className="type-eyebrow">{eyebrow}</p>
            <h2 className="type-h2 mt-6 text-balance">
                {parseEmphasis(title).map((segment, i) => (
                    <span
                        key={i}
                        className={segment.em ? EMPHASIS_CLASS : undefined}
                    >
                        {segment.text}
                    </span>
                ))}
            </h2>
            {description ? (
                <p
                    className={cn(
                        "type-body mt-7 max-w-2xl text-muted",
                        centered && "mx-auto"
                    )}
                >
                    {description}
                </p>
            ) : null}
        </Reveal>
    );
}
