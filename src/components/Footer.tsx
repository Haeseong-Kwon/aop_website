export function Footer() {
    return (
        <footer className="bg-black text-white border-t border-white/5 py-12 px-8 md:px-16">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold tracking-tight">AOP</h3>
                    <p className="text-sm text-neutral-500 font-medium">
                        App / Web / AI Platform Development & Branding
                    </p>
                </div>

                <div className="flex flex-col md:items-end gap-6">
                    <div className="text-left md:text-right">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Contact</h4>
                        <p className="text-sm font-medium">contact@aop.art</p>
                        <p className="text-sm font-medium">010-XXXX-XXXX</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-600">
                <p>© {new Date().getFullYear()} AOP. ALL RIGHTS RESERVED.</p>
                <p>Designed for excellence.</p>
            </div>
        </footer>
    );
}
