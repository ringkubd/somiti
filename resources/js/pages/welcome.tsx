import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Building, ShieldCheck, PieChart, Users, ArrowRight, CheckCircle2, Globe, Laptop, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome({
    canRegister = true,
    seo,
    cms = {}
}: {
    canRegister?: boolean;
    seo?: any;
    cms?: any;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen selection:bg-blue-100 selection:text-blue-900 font-sans">
            <Head title={seo?.title || "Somiti Manager - The Ultimate SaaS for Cooperative Societies"}>
                <meta name="description" content={seo?.meta_description || "Manage your cooperative society with ease. Track deposits, loans, investments, and more with our all-in-one SaaS platform."} />
                {seo?.meta_keywords && <meta name="keywords" content={seo.meta_keywords} />}
            </Head>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Somiti Manager</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
                            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
                        </div>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={dashboard()}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600">
                                        Sign In
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()}>
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                                                Get Started
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 blur-3xl rounded-full" />
                </div>
                
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-800">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        Next-Gen Society Management
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                        {cms.hero_title || 'Empower Your Cooperative Society'}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {cms.hero_subtitle || 'The ultimate SaaS platform to manage members, deposits, loans, and investments with real-time analytics and transparent accounting.'}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href={register()}>
                            <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-bold shadow-lg shadow-blue-600/20 w-full sm:w-auto">
                                {cms.cta_primary || 'Start Your Society Free'} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg font-semibold w-full sm:w-auto">
                            Watch Video Demo
                        </Button>
                    </div>
                    <div className="flex items-center justify-center gap-8 pt-8 grayscale opacity-50 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Partner" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" alt="Partner" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Partner" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/Microsoft_logo_%282012%29.svg" alt="Partner" className="h-6" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Built for modern financial transparency</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to run a professional cooperative society without the paperwork.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Users, title: 'Member Management', desc: 'Easily onboard members and assign roles with transparent profile tracking.' },
                            { icon: ShieldCheck, title: 'Secure Transactions', desc: 'Every deposit and loan requires dual-approval for maximum financial security.' },
                            { icon: PieChart, title: 'Live Analytics', desc: 'Visual dashboards for society performance, savings growth, and loan exposure.' },
                            { icon: Building, title: 'Multi-Society Support', desc: 'One account, multiple societies. Seamlessly switch between different organizations.' }
                        ].map((feat, i) => (
                            <div key={i} className="p-8 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feat.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/30 blur-3xl -ml-32 -mb-32 rounded-full" />
                    
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.2]">
                            Ready to digitize your <br className="hidden md:block" /> cooperative society?
                        </h2>
                        <p className="text-blue-100 text-lg max-w-xl mx-auto">
                            Join over 500+ societies already using Somiti Manager to build financial futures for their members.
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href={register()}>
                                <Button size="lg" className="h-14 px-10 bg-white text-blue-600 hover:bg-blue-50 rounded-full text-lg font-bold shadow-xl">
                                    Get Started for Free
                                </Button>
                            </Link>
                            <span className="text-blue-100 text-sm font-medium">No credit card required.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">S</div>
                        <span className="font-bold text-slate-900 dark:text-white">Somiti Manager</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm text-slate-500">
                        <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600">Terms of Service</a>
                        <a href="#" className="hover:text-blue-600">Contact Support</a>
                    </div>
                    <p className="text-sm text-slate-400">© 2026 Somiti Manager SaaS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
