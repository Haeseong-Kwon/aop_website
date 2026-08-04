"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { INQUIRY_TYPES, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
    name: z.string().trim().min(2, "이름을 2자 이상 입력해 주세요."),
    email: z.email("올바른 이메일 주소를 입력해 주세요."),
    type: z.enum(INQUIRY_TYPES),
    message: z.string().trim().min(10, "문의 내용을 10자 이상 입력해 주세요."),
});

type ContactValues = z.infer<typeof contactSchema>;

const fieldClass =
    "w-full rounded-lg border border-border bg-surface px-4 py-3 text-[15px] text-text placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-2 text-[13px] text-destructive">{message}</p>;
}

export function Contact() {
    const [sent, setSent] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ContactValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: "", email: "", type: INQUIRY_TYPES[0], message: "" },
    });

    // TODO: 문의 저장용 API 라우트 연결 시 mailto 대신 fetch로 교체
    const onSubmit = (values: ContactValues) => {
        try {
            const subject = `[${values.type}] ${values.name}님의 문의`;
            const body = `이름: ${values.name}\n이메일: ${values.email}\n문의 유형: ${values.type}\n\n${values.message}`;
            window.location.assign(
                `mailto:${SITE.email}?subject=${encodeURIComponent(
                    subject
                )}&body=${encodeURIComponent(body)}`
            );
            setSubmitError(null);
            setSent(true);
        } catch (error) {
            console.error("Contact form submission failed:", error);
            setSubmitError(
                `메일 앱을 열지 못했습니다. ${SITE.email} 으로 직접 보내주세요.`
            );
        }
    };

    return (
        <section id="contact" className="section-y relative">
            <div className="container-x">
                <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-24">
                    <div>
                        <SectionHeading
                            eyebrow="CONTACT"
                            title="문의하기"
                            description="제품 도입, 기술 협력, 공동 연구 어느 쪽이든 구체적인 상황을 적어주시면 담당자가 직접 회신합니다."
                        />

                        <Reveal delay={0.1} className="mt-12">
                            <p className="type-eyebrow">Email</p>
                            <a
                                href={`mailto:${SITE.email}`}
                                className="underline-sweep mt-3 inline-block text-lg"
                            >
                                {SITE.email}
                            </a>
                        </Reveal>
                    </div>

                    <Reveal delay={0.15}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            className="surface-card space-y-6 p-6 md:p-10"
                        >
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="type-eyebrow">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        autoComplete="name"
                                        placeholder="홍길동"
                                        aria-invalid={Boolean(errors.name)}
                                        className={cn(fieldClass, "mt-3")}
                                        {...register("name")}
                                    />
                                    <FieldError message={errors.name?.message} />
                                </div>

                                <div>
                                    <label htmlFor="email" className="type-eyebrow">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        aria-invalid={Boolean(errors.email)}
                                        className={cn(fieldClass, "mt-3")}
                                        {...register("email")}
                                    />
                                    <FieldError message={errors.email?.message} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="type" className="type-eyebrow">
                                    Inquiry Type
                                </label>
                                <select
                                    id="type"
                                    aria-invalid={Boolean(errors.type)}
                                    className={cn(fieldClass, "mt-3 appearance-none")}
                                    {...register("type")}
                                >
                                    {INQUIRY_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <FieldError message={errors.type?.message} />
                            </div>

                            <div>
                                <label htmlFor="message" className="type-eyebrow">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    placeholder="어떤 문제를 풀고 계신지 알려주세요."
                                    aria-invalid={Boolean(errors.message)}
                                    className={cn(fieldClass, "mt-3 resize-none")}
                                    {...register("message")}
                                />
                                <FieldError message={errors.message?.message} />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-text transition-colors hover:bg-accent/85 disabled:opacity-60"
                                >
                                    문의 보내기
                                    <ArrowUpRight
                                        size={16}
                                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                                    />
                                </button>

                                {sent ? (
                                    <span
                                        role="status"
                                        className="inline-flex items-center gap-2 text-sm text-accent-2"
                                    >
                                        <Check size={16} />
                                        메일 앱이 열렸습니다
                                    </span>
                                ) : null}
                            </div>

                            {submitError ? (
                                <p role="alert" className="text-[13px] text-destructive">
                                    {submitError}
                                </p>
                            ) : null}
                        </form>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
