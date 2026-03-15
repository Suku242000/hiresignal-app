import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { ArrowRight, Rocket, Zap, Brain, Target, FileText, Radio, Sprout, Search, Plus, TrendingUp, Users, UserMinus, Activity, CheckCircle2, DoorOpen, BarChart3 } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ tools: 0 });
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    const geo = new THREE.BufferGeometry();
    const N = 2600;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    
    const pal = [
      new THREE.Color('#5B6CF9'), // indigo
      new THREE.Color('#7B8BFF'), // indigo light
      new THREE.Color('#0FD4B0'), // teal
      new THREE.Color('#9B6DFF'), // purple
      new THREE.Color('#22C55E'), // green
      new THREE.Color('#1A2340'), // dark
    ];
    const weights = [0.28, 0.2, 0.2, 0.15, 0.07, 0.1];

    const pickColor = () => {
      let r = Math.random(), acc = 0;
      for (let i = 0; i < pal.length; i++) {
        acc += weights[i];
        if (r < acc) return pal[i];
      }
      return pal[0];
    };

    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
      const cl = pickColor();
      col[i * 3] = cl.r;
      col[i * 3 + 1] = cl.g;
      col[i * 3 + 2] = cl.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({ size: 0.042, vertexColors: true, transparent: true, opacity: 0.55 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    let mx = 0, my = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.25;
      my = (e.clientY / window.innerHeight - 0.5) * 0.2;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.0003;
      pts.rotation.y = t + mx;
      pts.rotation.x = my * 0.4;
      pts.rotation.z = t * 0.18;
      renderer.render(scene, camera);
    };

    animate();

    // Stats animation
    const duration = 1600;
    const start = performance.now();
    const animateStats = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setStats({ tools: Math.floor(ease * 7) });
      if (progress < 1) requestAnimationFrame(animateStats);
    };
    requestAnimationFrame(animateStats);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#090D1A] text-[#F0F4FF] font-sans">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      <div className="grid-bg" />
      <div className="noise" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      {/* Announcement Bar */}
      <div className="relative z-20 flex items-center justify-center gap-2.5 py-2.5 px-5 bg-linear-to-r from-[#5B6CF9]/8 to-[#0FD4B0]/8 border-b border-[#5B6CF9]/15 text-xs text-[#DCE4FF]/70 text-center flex-wrap">
        <span className="bg-[#5B6CF9]/15 border border-[#5B6CF9]/30 text-[#7B8BFF] rounded-full px-2.5 py-0.5 text-[11px] font-bold">NEW</span>
        <span>HireSignal Expansion Pack now includes 4 more AI modules</span>
        <b className="text-[#3EEECF] font-semibold">→ Career Growth, Pulse Surveys, Performance Coach, JD Builder</b>
      </div>

      <div className="relative z-10 max-w-[1160px] mx-auto px-8 pb-32">
        {/* Nav */}
        <nav className="flex items-center justify-between py-5.5 sticky top-0 z-[200] bg-[#090D1A]/85 backdrop-blur-3xl border-b border-white/6 mb-0">
          <div className="font-display text-[21px] font-extrabold bg-linear-to-br from-[#7B8BFF] to-[#0FD4B0] bg-clip-text text-transparent tracking-tight cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            HireSignal
          </div>
          <div className="hidden md:flex gap-1">
            <button className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-[#B4C4F0]/45 hover:text-[#F0F4FF] hover:bg-white/6 transition-all" onClick={() => scrollToSection('tools-sec')}>Tools</button>
            <button className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-[#B4C4F0]/45 hover:text-[#F0F4FF] hover:bg-white/6 transition-all" onClick={() => scrollToSection('how-sec')}>How it works</button>
            <button className="px-4 py-1.5 rounded-lg text-[13px] font-medium text-[#B4C4F0]/45 hover:text-[#F0F4FF] hover:bg-white/6 transition-all" onClick={() => scrollToSection('setup-sec')}>Setup</button>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="hidden sm:block px-5 py-2 rounded-lg text-[13px] font-semibold bg-white/6 border border-white/10 text-[#DCE4FF]/70 hover:bg-white/9 hover:text-[#F0F4FF] transition-all" onClick={onLaunch}>Dashboard</button>
            <button className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-linear-to-br from-[#5B6CF9] to-[#3D4FDB] text-white shadow-[0_0_40px_rgba(91,108,249,0.25)] hover:shadow-[0_0_50px_rgba(91,108,249,0.4)] hover:-translate-y-px transition-all" onClick={onLaunch}>Launch App →</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-24 pb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-linear-to-br from-[#5B6CF9]/10 to-[#0FD4B0]/8 border border-[#5B6CF9]/25 rounded-full px-4.5 py-1.5 text-xs font-semibold text-[#7B8BFF] mb-8 tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0FD4B0] animate-pulse" />
            7 AI-powered tools · Built for HR teams that move fast
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(44px,7vw,84px)] font-extrabold leading-[1.05] tracking-[-2.5px] mb-6"
          >
            <span className="text-[#F0F4FF]">Your HR team deserves</span><br />
            <span className="bg-linear-to-br from-[#7B8BFF] via-[#9B6DFF] to-[#0FD4B0] bg-clip-text text-transparent">smarter tools,</span><br />
            <span className="bg-linear-to-br from-[#0FD4B0] to-[#22C55E] bg-clip-text text-transparent">not more busywork</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#DCE4FF]/70 max-w-[560px] mx-auto mb-12 leading-[1.8] font-normal"
          >
            From day-one onboarding to exit intelligence, retention risk to career growth — HireSignal handles the heavy lifting so your people team can focus on what matters: the people.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 justify-center flex-wrap"
          >
            <button onClick={onLaunch} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-linear-to-br from-[#5B6CF9] to-[#3D4FDB] text-white font-semibold text-sm shadow-[0_0_40px_rgba(91,108,249,0.25)] hover:shadow-[0_0_60px_rgba(91,108,249,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all">
              🚀 Launch Core App
            </button>
            <button onClick={onLaunch} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-linear-to-br from-[#FF6B6B] to-[#e85555] text-white font-semibold text-sm shadow-[0_0_30px_rgba(255,107,107,0.25)] hover:shadow-[0_0_50px_rgba(255,107,107,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all">
              🧠 Expansion Pack
            </button>
            <button onClick={() => scrollToSection('setup-sec')} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/6 border border-white/10 text-[#F0F4FF] font-semibold text-sm backdrop-blur-xl hover:bg-white/9 hover:border-white/15 transition-all">
              ⚙️ Setup Guide
            </button>
          </motion.div>

          {/* Proof Bar */}
          <div className="mt-20 pt-8 border-t border-white/6 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#B4C4F0]/45 mb-5">Works alongside the tools you already use</div>
            <div className="flex items-center justify-center gap-10 flex-wrap opacity-50">
              {['Google AI Studio', 'Anthropic Claude', 'Cloudflare Workers', 'GitHub Pages', 'Netlify', 'Vercel'].map(logo => (
                <span key={logo} className="text-sm font-bold text-[#B4C4F0]/45 tracking-tight hover:opacity-100 transition-opacity cursor-default">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Ticker */}
        <div className="overflow-hidden py-4.5 border-y border-white/6 mb-16">
          <div className="ticker-track">
            {[1, 2].map(i => (
              <React.Fragment key={i}>
                <span className="flex items-center gap-2 px-9 text-xs font-medium text-[#B4C4F0]/45 whitespace-nowrap"><Rocket size={13} className="text-[#5B6CF9]" /> 30-Day Onboarding Plans</span>
                <span className="flex items-center gap-2 px-9 text-xs font-medium text-[#B4C4F0]/45 whitespace-nowrap"><DoorOpen size={13} className="text-[#0FD4B0]" /> Exit Intelligence Reports</span>
                <span className="flex items-center gap-2 px-9 text-xs font-medium text-[#B4C4F0]/45 whitespace-nowrap"><BarChart3 size={13} className="text-[#FF6B6B]" /> Retention Risk Score 0–100</span>
                <span className="flex items-center gap-2 px-9 text-xs font-medium text-[#B4C4F0]/45 whitespace-nowrap"><Target size={13} className="text-[#FFB347]" /> AI Performance Reviews</span>
                <span className="flex items-center gap-2 px-9 text-xs font-medium text-[#B4C4F0]/45 whitespace-nowrap"><FileText size={13} className="text-[#22C55E]" /> Job Description Builder</span>
                <span className="flex items-center gap-2 px-9 text-xs font-medium text-[#B4C4F0]/45 whitespace-nowrap"><Radio size={13} className="text-[#9B6DFF]" /> Employee Pulse Surveys</span>
                <span className="flex items-center gap-2 px-9 text-xs font-medium text-[#B4C4F0]/45 whitespace-nowrap"><Sprout size={13} className="text-[#5B6CF9]" /> Career Growth Planner</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6 rounded-2xl overflow-hidden mb-16 reveal">
          <div className="bg-[#141C35] p-7 text-center hover:bg-[#1A2340] transition-colors">
            <div className="font-display text-[40px] font-extrabold leading-none mb-1.5 bg-linear-to-br from-[#7B8BFF] to-[#9B6DFF] bg-clip-text text-transparent">{stats.tools}</div>
            <div className="text-xs font-semibold text-[#B4C4F0]/45 uppercase tracking-wide">AI tools</div>
            <div className="text-[11px] text-[#B4C4F0]/45 mt-1 opacity-60">All in one platform</div>
          </div>
          <div className="bg-[#141C35] p-7 text-center hover:bg-[#1A2340] transition-colors">
            <div className="font-display text-[40px] font-extrabold leading-none mb-1.5 bg-linear-to-br from-[#0FD4B0] to-[#22C55E] bg-clip-text text-transparent">100K</div>
            <div className="text-xs font-semibold text-[#B4C4F0]/45 uppercase tracking-wide">Free requests/day</div>
            <div className="text-[11px] text-[#B4C4F0]/45 mt-1 opacity-60">Via Cloudflare proxy</div>
          </div>
          <div className="bg-[#141C35] p-7 text-center hover:bg-[#1A2340] transition-colors">
            <div className="font-display text-[40px] font-extrabold leading-none mb-1.5 bg-linear-to-br from-[#FF6B6B] to-[#FFB347] bg-clip-text text-transparent">5 min</div>
            <div className="text-xs font-semibold text-[#B4C4F0]/45 uppercase tracking-wide">Setup time</div>
            <div className="text-[11px] text-[#B4C4F0]/45 mt-1 opacity-60">Zero coding needed</div>
          </div>
          <div className="bg-[#141C35] p-7 text-center hover:bg-[#1A2340] transition-colors">
            <div className="font-display text-[40px] font-extrabold leading-none mb-1.5 bg-linear-to-br from-[#9B6DFF] to-[#7B8BFF] bg-clip-text text-transparent">$0</div>
            <div className="text-xs font-semibold text-[#B4C4F0]/45 uppercase tracking-wide">Platform cost</div>
            <div className="text-[11px] text-[#B4C4F0]/45 mt-1 opacity-60">Bring your own API key</div>
          </div>
        </div>

        {/* Problem Section */}
        <div className="mb-24 p-15 bg-[#141C35] border border-white/10 rounded-[28px] reveal">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[2px] text-[#B4C4F0]/45 flex items-center justify-center gap-2.5 mb-3.5">
              <span className="w-8 h-px bg-white/10" /> Why HireSignal exists <span className="w-8 h-px bg-white/10" />
            </div>
            <h2 className="font-display text-[clamp(26px,3.5vw,42px)] font-extrabold tracking-tight leading-[1.15] mb-3">
              HR teams are drowning in<br /><span className="bg-linear-to-br from-[#7B8BFF] to-[#9B6DFF] bg-clip-text text-transparent">problems that AI can already solve</span>
            </h2>
            <p className="text-[15px] text-[#DCE4FF]/70 max-w-[520px] mx-auto leading-[1.7] font-normal">We researched the biggest HR pain points of 2026. Every single tool we built solves a real, documented problem.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0D1225] border border-white/6 rounded-2xl p-6 hover:border-white/10 hover:bg-[#111830] hover:-translate-y-1 transition-all">
              <div className="text-2xl mb-3">😤</div>
              <div className="font-display text-[28px] font-extrabold text-[#FF6B6B] mb-1">98%</div>
              <p className="text-[13px] text-[#DCE4FF]/70 leading-[1.6]">of CHROs say their performance management process is broken and needs replacing urgently</p>
              <div className="text-[11px] text-[#B4C4F0]/45 mt-2 italic">Gartner HR Survey, 2026 → We built the Performance Coach</div>
            </div>
            <div className="bg-[#0D1225] border border-white/6 rounded-2xl p-6 hover:border-white/10 hover:bg-[#111830] hover:-translate-y-1 transition-all">
              <div className="text-2xl mb-3">😶</div>
              <div className="font-display text-[28px] font-extrabold text-[#FFB347] mb-1">26%</div>
              <p className="text-[13px] text-[#DCE4FF]/70 leading-[1.6]">of employees globally feel engaged at work — an all-time low. Most HR teams have no idea who's at risk until they resign</p>
              <div className="text-[11px] text-[#B4C4F0]/45 mt-2 italic">Gallup State of Global Workplace → We built Retention Risk Score & Pulse Surveys</div>
            </div>
            <div className="bg-[#0D1225] border border-white/6 rounded-2xl p-6 hover:border-white/10 hover:bg-[#111830] hover:-translate-y-1 transition-all">
              <div className="text-2xl mb-3">🔄</div>
              <div className="font-display text-[28px] font-extrabold text-[#7B8BFF] mb-1">64%</div>
              <p className="text-[13px] text-[#DCE4FF]/70 leading-[1.6]">of HR leaders say developing future leaders is their #1 priority — yet most have no structured growth pathways for employees</p>
              <div className="text-[11px] text-[#B4C4F0]/45 mt-2 italic">McLean & Company HR Trends → We built the Career Growth Planner</div>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="mb-24" id="tools-sec">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[2px] text-[#B4C4F0]/45 flex items-center justify-start gap-2.5 mb-3.5">
                <span className="w-0" /> All Tools
              </div>
              <h2 className="font-display text-[clamp(24px,3vw,36px)] font-extrabold tracking-tight leading-[1.15]">Everything your team needs,<br /><span className="bg-linear-to-br from-[#0FD4B0] to-[#22C55E] bg-clip-text text-transparent">nothing it doesn't</span></h2>
            </div>
            <button className="px-4.5 py-2.5 rounded-lg text-[13px] font-semibold bg-white/6 border border-white/10 text-[#F0F4FF] hover:bg-white/9 transition-all" onClick={onLaunch}>View all tools →</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 reveal">
            {/* Core App Card */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] bg-[#141C35] border border-white/6 rounded-2xl overflow-hidden hover:border-white/16 hover:-translate-y-1.5 transition-all cursor-pointer group" onClick={onLaunch}>
              <div className="p-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5B6CF9]/12 border border-[#5B6CF9]/25 text-[#7B8BFF] text-[10px] font-bold uppercase tracking-wider mb-4">Core App · File 1</div>
                <div className="w-12 h-12 rounded-xl bg-[#5B6CF9]/15 border border-[#5B6CF9]/25 flex items-center justify-center text-xl mb-4">⚡</div>
                <h3 className="font-display text-[17px] font-bold mb-2 leading-[1.25]">HireSignal Core — 3 Essential Tools</h3>
                <p className="text-[13px] text-[#DCE4FF]/70 leading-[1.65] font-normal mb-4">The foundation every HR team needs. Automate onboarding, capture exit intelligence, and flag retention risks before they become resignations.</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B4C4F0]/45 group-hover:text-[#F0F4FF] group-hover:gap-2.5 transition-all">Open Core App <ArrowRight size={14} /></div>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-white/6 p-5 flex flex-col gap-2.5 justify-center bg-[#090D1A]/40">
                <div className="flex items-center gap-2.5 bg-white/4 border border-white/6 rounded-lg p-3 hover:bg-white/7 hover:border-white/10 transition-all">
                  <Rocket size={15} className="text-[#5B6CF9]" />
                  <span className="text-[13px] font-medium text-[#DCE4FF]/70 flex-1">30-Day Onboarding Plan</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0FD4B0]/10 border border-[#0FD4B0]/20 text-[#0FD4B0]">AI</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/4 border border-white/6 rounded-lg p-3 hover:bg-white/7 hover:border-white/10 transition-all">
                  <DoorOpen size={15} className="text-[#0FD4B0]" />
                  <span className="text-[13px] font-medium text-[#DCE4FF]/70 flex-1">Exit Intelligence Report</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0FD4B0]/10 border border-[#0FD4B0]/20 text-[#0FD4B0]">AI</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/4 border border-white/6 rounded-lg p-3 hover:bg-white/7 hover:border-white/10 transition-all">
                  <BarChart3 size={15} className="text-[#FF6B6B]" />
                  <span className="text-[13px] font-medium text-[#DCE4FF]/70 flex-1">Retention Risk Score</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0FD4B0]/10 border border-[#0FD4B0]/20 text-[#0FD4B0]">0–100</span>
                </div>
              </div>
            </div>

            {/* Expansion Pack Card */}
            <div className="bg-[#141C35] border border-white/6 rounded-2xl p-6.5 hover:border-white/16 hover:-translate-y-1.5 transition-all cursor-pointer group" onClick={onLaunch}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0FD4B0]/10 border border-[#0FD4B0]/22 text-[#0FD4B0] text-[10px] font-bold uppercase tracking-wider mb-4">Expansion Pack · File 2</div>
              <div className="w-12 h-12 rounded-xl bg-[#0FD4B0]/12 border border-[#0FD4B0]/22 flex items-center justify-center text-xl mb-4">🧠</div>
              <h3 className="font-display text-[17px] font-bold mb-2 leading-[1.25]">4 Advanced Modules</h3>
              <p className="text-[13px] text-[#DCE4FF]/70 leading-[1.65] font-normal mb-4">Performance coaching, job descriptions, pulse surveys, and career growth — the tools 98% of HR teams say they urgently need.</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B4C4F0]/45 group-hover:text-[#F0F4FF] group-hover:gap-2.5 transition-all">Open Expansion Pack <ArrowRight size={14} /></div>
            </div>

            {/* Tool Cards */}
            <div className="bg-[#141C35] border border-white/6 rounded-2xl p-6.5 hover:border-white/16 hover:-translate-y-1.5 transition-all cursor-pointer group" onClick={onLaunch}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#FF8E8E] text-[10px] font-bold uppercase tracking-wider mb-4">Performance</div>
              <div className="w-12 h-12 rounded-xl bg-[#FF6B6B]/12 border border-[#FF6B6B]/20 flex items-center justify-center text-xl mb-4">🎯</div>
              <h3 className="font-display text-[17px] font-bold mb-2 leading-[1.25]">AI Performance Coach</h3>
              <p className="text-[13px] text-[#DCE4FF]/70 leading-[1.65] font-normal mb-4">Write reviews, generate 1-on-1 agendas, create PIPs, and write recognition messages that genuinely motivate.</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B4C4F0]/45 group-hover:text-[#F0F4FF] group-hover:gap-2.5 transition-all">Open Tool <ArrowRight size={14} /></div>
            </div>

            <div className="bg-[#141C35] border border-white/6 rounded-2xl p-6.5 hover:border-white/16 hover:-translate-y-1.5 transition-all cursor-pointer group" onClick={onLaunch}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFB347]/10 border border-[#FFB347]/20 text-[#FFB347] text-[10px] font-bold uppercase tracking-wider mb-4">Recruiting</div>
              <div className="w-12 h-12 rounded-xl bg-[#FFB347]/12 border border-[#FFB347]/20 flex items-center justify-center text-xl mb-4">📝</div>
              <h3 className="font-display text-[17px] font-bold mb-2 leading-[1.25]">Job Description Builder</h3>
              <p className="text-[13px] text-[#DCE4FF]/70 leading-[1.65] font-normal mb-4">Stop losing candidates to generic JDs. AI writes compelling, inclusive descriptions that attract the right people.</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B4C4F0]/45 group-hover:text-[#F0F4FF] group-hover:gap-2.5 transition-all">Open Tool <ArrowRight size={14} /></div>
            </div>

            <div className="bg-[#141C35] border border-white/6 rounded-2xl p-6.5 hover:border-white/16 hover:-translate-y-1.5 transition-all cursor-pointer group" onClick={onLaunch}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold uppercase tracking-wider mb-4">Engagement</div>
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/12 border border-[#22C55E]/20 flex items-center justify-center text-xl mb-4">📡</div>
              <h3 className="font-display text-[17px] font-bold mb-2 leading-[1.25]">Pulse Survey Creator</h3>
              <p className="text-[13px] text-[#DCE4FF]/70 leading-[1.65] font-normal mb-4">Build smart surveys and get AI to analyze results — with red flags, root causes, and a 30-day action plan.</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B4C4F0]/45 group-hover:text-[#F0F4FF] group-hover:gap-2.5 transition-all">Open Tool <ArrowRight size={14} /></div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-24" id="how-sec">
          <div className="text-center mb-10 reveal">
            <div className="text-[11px] font-bold uppercase tracking-[2px] text-[#B4C4F0]/45 flex items-center justify-center gap-2.5 mb-3.5">
              <span className="w-8 h-px bg-white/10" /> How It Works <span className="w-8 h-px bg-white/10" />
            </div>
            <h2 className="font-display text-[clamp(26px,3.5vw,42px)] font-extrabold tracking-tight leading-[1.15] mb-3">
              Live in under 10 minutes.<br /><span className="bg-linear-to-br from-[#0FD4B0] to-[#22C55E] bg-clip-text text-transparent">No coding. Zero configuration.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 relative reveal">
            <div className="hidden md:block absolute top-[30px] left-[5%] right-[5%] h-px bg-linear-to-r from-transparent via-[#5B6CF9] to-transparent opacity-30" />
            <div className="bg-[#141C35] border border-white/6 rounded-2xl p-7 text-center relative hover:border-white/10 hover:-translate-y-1 transition-all">
              <div className="w-14.5 h-14.5 rounded-full bg-linear-to-br from-[#5B6CF9] to-[#3D4FDB] shadow-[0_0_40px_rgba(91,108,249,0.25)] flex items-center justify-center font-display text-xl font-extrabold mx-auto mb-5 relative z-1">1</div>
              <h4 className="font-display text-[15px] font-bold mb-2">Deploy Proxy</h4>
              <p className="text-xs text-[#B4C4F0]/45 leading-[1.65]">Paste worker.js into Cloudflare Workers (free). Deploy in 2 minutes. This fixes all CORS issues permanently.</p>
            </div>
            <div className="bg-[#141C35] border border-white/6 rounded-2xl p-7 text-center relative hover:border-white/10 hover:-translate-y-1 transition-all">
              <div className="w-14.5 h-14.5 rounded-full bg-linear-to-br from-[#0FD4B0] to-[#0bb890] shadow-[0_0_30px_rgba(15,212,176,0.2)] flex items-center justify-center font-display text-xl font-extrabold mx-auto mb-5 relative z-1">2</div>
              <h4 className="font-display text-[15px] font-bold mb-2">Get API Key</h4>
              <p className="text-xs text-[#B4C4F0]/45 leading-[1.65]">Grab your free Gemini key from aistudio.google.com, or a Claude key from console.anthropic.com. No card needed.</p>
            </div>
            <div className="bg-[#141C35] border border-white/6 rounded-2xl p-7 text-center relative hover:border-white/10 hover:-translate-y-1 transition-all">
              <div className="w-14.5 h-14.5 rounded-full bg-linear-to-br from-[#FFB347] to-[#f59e0b] shadow-[0_0_20px_rgba(255,179,71,0.3)] flex items-center justify-center font-display text-xl font-extrabold mx-auto mb-5 relative z-1">3</div>
              <h4 className="font-display text-[15px] font-bold mb-2">Connect & Test</h4>
              <p className="text-xs text-[#B4C4F0]/45 leading-[1.65]">Paste your key and proxy URL into the setup card. Hit Test Connection — green tick means you're live.</p>
            </div>
            <div className="bg-[#141C35] border border-white/6 rounded-2xl p-7 text-center relative hover:border-white/10 hover:-translate-y-1 transition-all">
              <div className="w-14.5 h-14.5 rounded-full bg-linear-to-br from-[#22C55E] to-[#16a34a] shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center font-display text-xl font-extrabold mx-auto mb-5 relative z-1">4</div>
              <h4 className="font-display text-[15px] font-bold mb-2">Deploy & Share</h4>
              <p className="text-xs text-[#B4C4F0]/45 leading-[1.65]">Push to GitHub Pages, Netlify, or Cloudflare Pages. Get a free public URL. Share it with your team today.</p>
            </div>
          </div>
        </div>

        {/* Setup Walkthrough */}
        <div className="bg-[#141C35] border border-white/10 rounded-[28px] p-13 mb-24 relative overflow-hidden reveal" id="setup-sec">
          <div className="absolute top-[-80px] right-[-80px] w-75 h-75 rounded-full bg-radial-gradient(var(--indigo),transparent) opacity-10 pointer-events-none" />
          <div className="text-left mb-10">
            <div className="text-[11px] font-bold uppercase tracking-[2px] text-[#B4C4F0]/45 flex items-center justify-start gap-2.5 mb-2">
              <span className="w-0" /> Setup Guide
            </div>
            <h2 className="font-display text-[clamp(26px,3.5vw,42px)] font-extrabold tracking-tight leading-[1.15] mb-2">Connect your AI in 3 steps</h2>
            <p className="text-sm text-[#B4C4F0]/45 font-normal">Everything runs on your own API key. Your data never leaves your machine.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-13 items-start">
            <div className="flex flex-col">
              {[
                { n: 1, h: 'Deploy Cloudflare Worker proxy (free)', p: <>Go to <a href="https://workers.cloudflare.com" target="_blank" className="text-[#0FD4B0] hover:underline">workers.cloudflare.com</a> → Create Worker → paste the contents of <b>worker.js</b> → Deploy. Copy the URL. Free plan allows 100,000 requests/day.</> },
                { n: 2, h: 'Get your AI API key (free)', p: <><b>Gemini:</b> Go to <a href="https://aistudio.google.com" target="_blank" className="text-[#0FD4B0] hover:underline">aistudio.google.com</a> → API Keys → Create API Key. Free tier included.<br /><b>Claude:</b> Go to <a href="https://console.anthropic.com" target="_blank" className="text-[#0FD4B0] hover:underline">console.anthropic.com</a> → API Keys → Create Key.</> },
                { n: 3, h: 'Connect inside the app', p: <>Open any HireSignal file → find the <b>AI Connection Setup</b> card → paste your provider, API key, and proxy URL → click <b>Test Connection</b>. Green tick = you're live.</> },
                { n: 4, h: 'Deploy publicly (optional, free)', p: <>Want a public URL? Push all files to your GitHub repo → enable GitHub Pages in Settings → your app is live in 2 minutes. Or drag files to <a href="https://app.netlify.com/drop" target="_blank" className="text-[#0FD4B0] hover:underline">Netlify Drop</a>.</> }
              ].map(step => (
                <div key={step.n} className={`flex gap-4.5 py-5 border-b border-white/6 cursor-pointer group transition-all ${activeStep === step.n ? 'active-step' : ''}`} onClick={() => setActiveStep(step.n)}>
                  <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-display text-sm font-extrabold bg-[#111830] border border-white/10 text-[#B4C4F0]/45 transition-all group-hover:bg-linear-to-br group-hover:from-[#5B6CF9] group-hover:to-[#3D4FDB] group-hover:border-transparent group-hover:text-white group-hover:shadow-[0_0_40px_rgba(91,108,249,0.25)] ${activeStep === step.n ? 'bg-linear-to-br from-[#5B6CF9] to-[#3D4FDB] border-transparent text-white shadow-[0_0_40px_rgba(91,108,249,0.25)]' : ''}`}>{step.n}</div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold mb-1 transition-colors group-hover:text-[#7B8BFF] ${activeStep === step.n ? 'text-[#7B8BFF]' : ''}`}>{step.h}</h4>
                    <p className="text-xs text-[#B4C4F0]/45 leading-[1.6]">{step.p}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0D1225] border border-white/6 rounded-2xl p-6 lg:sticky lg:top-25">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#B4C4F0]/45 mb-3">Quick Connection Test</div>
              <div className="flex flex-col gap-3.5 mb-3.5">
                <div>
                  <div className="text-[11px] font-semibold text-[#B4C4F0]/45 uppercase tracking-wide mb-1.5">AI Provider</div>
                  <select className="w-full bg-[#111830] border border-white/6 rounded-lg px-4 py-2.5 font-sans text-[13px] text-[#F0F4FF] outline-hidden cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_fill=%22none%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22rgba(180,196,240,0.45)%22_stroke-width=%221.5%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_13px_center] pr-9">
                    <option value="gemini">Gemini (Google AI Studio)</option>
                    <option value="anthropic">Claude (Anthropic)</option>
                  </select>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#B4C4F0]/45 uppercase tracking-wide mb-1.5">API Key</div>
                  <input type="password" placeholder="Paste your API key..." className="w-full bg-[#111830] border border-white/6 rounded-lg px-4 py-2.5 font-sans text-[13px] text-[#F0F4FF] outline-hidden focus:border-[#5B6CF9]/50 transition-colors" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#B4C4F0]/45 uppercase tracking-wide mb-1.5">Cloudflare Worker URL</div>
                  <input type="text" placeholder="https://your-worker.workers.dev" className="w-full bg-[#111830] border border-white/6 rounded-lg px-4 py-2.5 font-sans text-[13px] text-[#F0F4FF] outline-hidden focus:border-[#5B6CF9]/50 transition-colors" />
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-linear-to-br from-[#5B6CF9] to-[#3D4FDB] text-white font-semibold text-sm shadow-[0_0_40px_rgba(91,108,249,0.25)] hover:shadow-[0_0_50px_rgba(91,108,249,0.4)] transition-all">🔌 Test Connection</button>
              <div className="hidden items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-lg mt-2 bg-[#22C55E]/8 border border-[#22C55E]/20 text-[#22C55E]">✅ Connection successful — AI is live!</div>
              <div className="mt-4 pt-4 border-t border-white/6">
                <p className="text-xs text-[#B4C4F0]/45 leading-[1.7] mb-3">Once connected, open your apps and use the same key + proxy URL in each one. Your settings are saved in the app session.</p>
                <div className="flex gap-2 flex-wrap">
                  <button className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-white/6 border border-white/10 text-[#F0F4FF] text-xs font-semibold hover:bg-white/9 transition-all" onClick={onLaunch}>Open Core App</button>
                  <button className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg border border-[#0FD4B0]/35 text-[#0FD4B0] bg-[#0FD4B0]/5 text-xs font-semibold hover:bg-[#0FD4B0]/12 hover:border-[#0FD4B0]/60 transition-all" onClick={onLaunch}>Expansion Pack</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-linear-to-br from-[#5B6CF9]/8 via-[#0FD4B0]/6 to-[#9B6DFF]/6 border border-white/10 rounded-[28px] p-18 md:px-12 text-center relative overflow-hidden reveal mb-24">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-radial-gradient(rgba(91,108,249,0.08),transparent) pointer-events-none" />
          <h2 className="font-display text-[clamp(28px,4vw,50px)] font-extrabold tracking-tight mb-4 relative">Ready to fix your HR team's<br /><span className="bg-linear-to-br from-[#7B8BFF] via-[#9B6DFF] to-[#0FD4B0] bg-clip-text text-transparent">biggest headaches?</span></h2>
          <p className="text-base text-[#DCE4FF]/70 max-w-[460px] mx-auto mb-10 leading-[1.75] relative font-normal">Everything is free, open source, and runs on your own AI key. No subscriptions. No data lock-in. Just better HR.</p>
          <div className="flex gap-3 justify-center flex-wrap relative">
            <button onClick={onLaunch} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-linear-to-br from-[#5B6CF9] to-[#3D4FDB] text-white font-semibold text-sm shadow-[0_0_40px_rgba(91,108,249,0.25)] hover:shadow-[0_0_60px_rgba(91,108,249,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all">🚀 Launch Core App</button>
            <button onClick={onLaunch} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-linear-to-br from-[#FF6B6B] to-[#e85555] text-white font-semibold text-sm shadow-[0_0_30px_rgba(255,107,107,0.25)] hover:shadow-[0_0_50px_rgba(255,107,107,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all">🧠 Expansion Pack</button>
          </div>
          <div className="mt-5 flex items-center justify-center gap-4 flex-wrap text-xs text-[#B4C4F0]/45 relative">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#0FD4B0]" /> Completely free</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#0FD4B0]" /> Open source (MIT)</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#0FD4B0]" /> No sign-up required</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/6 pt-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="font-display text-xl font-extrabold bg-linear-to-br from-[#7B8BFF] to-[#0FD4B0] bg-clip-text text-transparent mb-3 tracking-tight">HireSignal</div>
            <p className="text-[13px] text-[#B4C4F0]/45 leading-[1.7] max-w-[260px] font-normal">The AI HR intelligence platform built for teams that move fast. Free, open source, and powered by your own AI key.</p>
            <div className="flex gap-2 flex-wrap mt-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/4 border border-white/6 text-[#B4C4F0]/45">MIT License</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/4 border border-white/6 text-[#B4C4F0]/45">Open Source</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/4 border border-white/6 text-[#B4C4F0]/45">Free Forever</span>
            </div>
          </div>
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#B4C4F0]/45 mb-4">Core Tools</h5>
            <div className="flex flex-col gap-2.5">
              <button className="text-left text-[13px] text-[#DCE4FF]/70 hover:text-[#0FD4B0] transition-colors" onClick={onLaunch}>Onboarding Planner</button>
              <button className="text-left text-[13px] text-[#DCE4FF]/70 hover:text-[#0FD4B0] transition-colors" onClick={onLaunch}>Exit Intelligence</button>
              <button className="text-left text-[13px] text-[#DCE4FF]/70 hover:text-[#0FD4B0] transition-colors" onClick={onLaunch}>Retention Risk Score</button>
            </div>
          </div>
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#B4C4F0]/45 mb-4">Expansion</h5>
            <div className="flex flex-col gap-2.5">
              <button className="text-left text-[13px] text-[#DCE4FF]/70 hover:text-[#0FD4B0] transition-colors" onClick={onLaunch}>Performance Coach</button>
              <button className="text-left text-[13px] text-[#DCE4FF]/70 hover:text-[#0FD4B0] transition-colors" onClick={onLaunch}>JD Builder</button>
              <button className="text-left text-[13px] text-[#DCE4FF]/70 hover:text-[#0FD4B0] transition-colors" onClick={onLaunch}>Pulse Surveys</button>
              <button className="text-left text-[13px] text-[#DCE4FF]/70 hover:text-[#0FD4B0] transition-colors" onClick={onLaunch}>Career Growth</button>
            </div>
          </div>
          <div className="md:col-span-4 border-t border-white/6 py-5 mt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-[#B4C4F0]/45">
            <span>© 2026 HireSignal · Open Source · MIT License</span>
            <span>Built with Gemini AI & Claude AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
