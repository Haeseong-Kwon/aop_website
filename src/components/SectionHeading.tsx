import { Reveal } from "@/components/motion/Reveal";
import { emphasisClass, parseEmphasis } from "@/lib/emphasis";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    description?: string;
    className?: string;
    align?: "left" | "center";
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    className,
    align = "left",
}: SectionHeadingProps) {
    return (
        <Reveal
            className={cn(
                "max-w-3xl",
                align === "center" && "mx-auto text-center",
                className
            )}
        >
            <p className={cn("type-eyebrow", align === "left" && "eyebrow-rule")}>
                {eyebrow}
            </p>
            <h2 className="type-h2 mt-5 text-balance">
                {parseEmphasis(title).map((segment, i) => (
                    <span
                        key={i}
                        className={segment.em ? emphasisClass(segment.text) : undefined}
                    >
                        {segment.text}
                    </span>
                ))}
            </h2>
            {description ? (
                <p
                    className={cn(
                        "type-body mt-6 max-w-2xl text-muted",
                        align === "center" && "mx-auto"
                    )}
                >
                    {description}
                </p>
            ) : null}
        </Reveal>
    );
}
