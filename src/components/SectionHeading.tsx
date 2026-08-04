import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    description?: string;
    className?: string;
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    className,
}: SectionHeadingProps) {
    return (
        <Reveal className={cn("max-w-3xl", className)}>
            <p className="type-eyebrow">{eyebrow}</p>
            <h2 className="type-h2 mt-5">{title}</h2>
            {description ? (
                <p className="type-body mt-6 max-w-2xl text-muted">{description}</p>
            ) : null}
        </Reveal>
    );
}
