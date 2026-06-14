'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Search, Brain, FileText, Mic, Camera } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/20 bg-brand-500/10 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Zap size={12} className="text-brand-400 animate-pulse" />
              <span className="text-xs text-brand-400 font-medium tracking-wide">Powered by MOSS × GPT-4o</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={item} className="text-6xl sm:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6 drop-shadow-2xl">
              <span className="text-text-primary">Fix anything.</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-brand-500 to-purple-500 animate-gradient-x">Know everything.</span>
            </motion.h1>

            <motion.p variants={item} className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12">
              Mantis gives every product its own AI diagnostic expert — a technician that reads the
              manual, asks the right questions, and guides you to the root cause in minutes.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              <Link href="/products" className="group relative px-8 py-4 bg-brand-500 text-white font-semibold rounded-2xl shadow-[0_0_40px_rgba(14,165,233,0.4)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(14,165,233,0.6)] hover:-translate-y-1 overflow-hidden w-full sm:w-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-2">
                  Browse Products
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="/signup" className="group px-8 py-4 bg-black/40 backdrop-blur-lg text-text-primary font-semibold rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto">
                List Your Product
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto p-6 rounded-3xl bg-black/20 backdrop-blur-md border border-white/5">
              {[
                { value: '<10ms', label: 'MOSS retrieval' },
                { value: 'GPT-4o', label: 'AI model' },
                { value: '6-step', label: 'diagnosis' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-brand-400 drop-shadow-md">{stat.value}</div>
                  <div className="text-xs text-text-muted mt-2 font-medium tracking-wide uppercase">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="py-32 relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-6">
              Not a chatbot. A diagnostic expert.
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Mantis follows a structured 6-step workflow — like a field technician — to systematically
              isolate root causes and provide actionable fixes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, step: '01', title: 'Symptom Intake', desc: "Understands what you're experiencing and when it started." },
              { icon: Search, step: '02', title: 'MOSS Retrieval', desc: "Searches your product's manual semantically in under 10ms." },
              { icon: Zap, step: '03', title: 'Targeted Questions', desc: "Asks 1-2 focused yes/no questions to eliminate unlikely causes." },
              { icon: FileText, step: '04', title: 'Cited Instructions', desc: 'References exact page numbers and sections from the manual.' },
              { icon: Mic, step: '05', title: 'Voice Hands-Free', desc: 'Speak your problem. Mantis listens and guides you step by step.' },
              { icon: Camera, step: '06', title: 'Image Diagnosis', desc: 'Upload a photo of the broken part. GPT-4o analyzes it instantly.' },
            ].map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative bg-bg-secondary/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 transition-all duration-300 hover:border-brand-500/30 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon size={120} />
                </div>
                <div className="relative z-10 flex flex-col items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.2)] group-hover:bg-brand-500/20 transition-colors">
                    <Icon size={24} className="text-brand-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-brand-500/80 uppercase tracking-[0.2em] mb-2">
                      Step {step}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Companies ─────────────────────────────────────────────────────── */}
      <section className="py-32 relative z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/20 bg-brand-500/10 mb-8 backdrop-blur-md">
                <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">For Companies</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-6 leading-tight">
                Upload your manuals.
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-brand-600">We handle the rest.</span>
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-8">
                Register your company, list your products, and upload your service documentation.
                Mantis automatically chunks, indexes, and makes your knowledge available to every user
                through a precision AI assistant — no coding required.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Register your company
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Mock dashboard card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-text-primary uppercase tracking-wider">Company Dashboard</span>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20 animate-pulse">Live</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Ola S1 Pro', docs: 3, category: '🛵', indexed: true },
                  { name: 'Dyson V15', docs: 5, category: '⚡', indexed: true },
                  { name: 'Daikin 1.5T AC', docs: 2, category: '❄️', indexed: false },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
                    <span className="text-3xl">{p.category}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{p.docs} documents</p>
                    </div>
                    <span className={`text-xs px-3 py-1 font-bold rounded-full border ${p.indexed ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20'}`}>
                      {p.indexed ? 'Indexed' : 'Indexing…'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
