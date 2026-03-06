export function Footer() {
    return (
        <footer className="bg-black text-white border-t border-white/10 py-8 px-6 md:px-10">
            <div className="max-w-[120rem] mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-black tracking-tight">AOP</h3>
                    <p className="text-sm text-neutral-500 font-medium">
                        App / Web / AI Platform Development & Branding
                    </p>
                </div>

                <div className="flex flex-col md:items-end gap-4">
                    <div className="text-left md:text-right">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 mb-2">Contact</h4>
                        <p className="text-sm font-medium">contact@aop.art</p>
                        <p className="text-sm font-medium">010-XXXX-XXXX</p>
                    </div>
                </div>
            </div>

            <div className="max-w-[120rem] mx-auto mt-8 pt-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
                <p>© {new Date().getFullYear()} AOP. ALL RIGHTS RESERVED.</p>
                <p>Designed for excellence.</p>
            </div>
        </footer>
    );
}
