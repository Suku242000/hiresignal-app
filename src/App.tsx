import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  DoorOpen, 
  BarChart3, 
  CheckCircle2, 
  Copy, 
  ArrowRight, 
  AlertTriangle,
  Info,
  ChevronRight,
  RefreshCw,
  Target,
  FileText,
  Radio,
  Sprout,
  Search,
  Plus,
  TrendingUp,
  Users,
  UserMinus,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  generateOnboardingPlan, 
  generateExitReport, 
  analyzeRetentionRisk,
  generatePerformanceFeedback,
  generateJobDescription,
  generatePulseSurvey,
  generateCareerPlan
} from './services/geminiService';
import LandingPage from './components/LandingPage';

// --- Background Component ---
const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const geo = new THREE.BufferGeometry();
    const N = 2200;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const pal = [
      new THREE.Color('#5B6CF9'),
      new THREE.Color('#0FD4B0'),
      new THREE.Color('#FF6B6B'),
      new THREE.Color('#9B6DFF'),
      new THREE.Color('#22C55E'),
      new THREE.Color('#FFB347')
    ];

    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      const c = pal[Math.floor(Math.random() * pal.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({ size: 0.042, vertexColors: true, transparent: true, opacity: 0.5 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    let mx = 0, my = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.25;
      my = (e.clientY / window.innerHeight - 0.5) * 0.25;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.0004;
      pts.rotation.y = t + mx;
      pts.rotation.x = my * 0.4;
      pts.rotation.z = t * 0.2;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />
      <div className="grid-bg" />
      <div className="noise" />
      <div className="orb orb-a opacity-40" />
      <div className="orb orb-b opacity-30" />
      <div className="orb orb-c opacity-20" />
    </>
  );
};

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<'onboard' | 'exit' | 'risk' | 'perf' | 'jd' | 'survey' | 'growth'>('perf');
  const [stats, setStats] = useState({ hires: 12, exits: 3, avgRisk: '24%' });
  const [riskScores, setRiskScores] = useState<any[]>([
    { name: 'Jan', score: 20 },
    { name: 'Feb', score: 25 },
    { name: 'Mar', score: 22 },
    { name: 'Apr', score: 28 },
    { name: 'May', score: 24 },
  ]);

  // Form States
  const [onboardForm, setOnboardForm] = useState({ name: '', role: '', dept: '', start: '', level: '', work: 'Remote', goals: '' });
  const [exitForm, setExitForm] = useState({ name: '', role: '', years: '', reason: '', notes: '', projects: '' });
  const [riskForm, setRiskForm] = useState({ name: '', role: '', tenure: '1–2 years', perf: 'Meets expectations', obs: '', changes: '' });
  
  // Expansion Form States
  const [perfSubTab, setPerfSubTab] = useState(1);
  const [perfForm, setPerfForm] = useState({ name: '', role: '', period: '', perf: 'Solid — met most goals', wins: '', grow: '', tone: 'Balanced and constructive', type: 'Annual review' });
  const [ooForm, setOoForm] = useState({ mgr: '', emp: '', freq: 'Bi-weekly', focus: 'General check-in', ctx: '' });
  const [pipForm, setPipForm] = useState({ name: '', role: '', issues: '', support: '', dur: '60 days', out: 'Improvement and retention' });
  const [recForm, setRecForm] = useState({ name: '', what: '', impact: '', type: 'Slack / team message', tone: 'Warm and personal' });

  const [jdForm, setJdForm] = useState({ title: '', dept: '', type: 'Full-time', work: 'Remote', exp: '5–8 years (Senior)', salary: '', resp: '', skills: '', culture: '', tone: 'Startup-energetic and bold', sections: ['About the Role', 'Responsibilities', 'Requirements', 'What We Offer'] });

  const [surveySubTab, setSurveySubTab] = useState(1);
  const [svForm, setSvForm] = useState({ team: '', freq: 'Bi-weekly (5–7 questions)', chips: ['Overall engagement', 'Workload & burnout', 'Recognition & belonging'], ctx: '', style: 'Mix of rating + open text', anon: 'Fully anonymous' });
  const [saForm, setSaForm] = useState({ team: '', period: '', results: '', prev: '' });

  const [growthSubTab, setGrowthSubTab] = useState(1);
  const [gpForm, setGpForm] = useState({ name: '', curr: '', target: '', time: '12 months', str: '', gaps: '', mot: '' });
  const [prForm, setPrForm] = useState({ name: '', curr: '', target: '', tenure: '1–2 years', ev: '', miss: '' });
  const [upForm, setUpForm] = useState({ name: '', role: '', skills: '', biz: '', style: 'Online courses (self-paced)', time: '3–4 hours/week' });

  // Result States
  const [onboardResult, setOnboardResult] = useState('');
  const [exitResult, setExitResult] = useState('');
  const [riskResult, setRiskResult] = useState({ score: 0, level: 'Low', headline: '', summary: '', full: '' });
  const [perfResult, setPerfResult] = useState('');
  const [jdResult, setJdResult] = useState('');
  const [surveyResult, setSurveyResult] = useState('');
  const [growthResult, setGrowthResult] = useState('');

  // Loading States
  const [loading, setLoading] = useState({ onboard: false, exit: false, risk: false, perf: false, jd: false, survey: false, growth: false });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOnboard = async () => {
    if (!onboardForm.name || !onboardForm.role) return alert('Please enter name and role');
    setLoading(prev => ({ ...prev, onboard: true }));
    try {
      const res = await generateOnboardingPlan(onboardForm);
      setOnboardResult(res);
      setStats(prev => ({ ...prev, hires: prev.hires + 1 }));
    } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, onboard: false })); }
  };

  const handleExit = async () => {
    if (!exitForm.name || !exitForm.role) return alert('Please enter name and role');
    setLoading(prev => ({ ...prev, exit: true }));
    try {
      const res = await generateExitReport(exitForm);
      setExitResult(res);
      setStats(prev => ({ ...prev, exits: prev.exits + 1 }));
    } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, exit: false })); }
  };

  const handleRisk = async () => {
    if (!riskForm.name || !riskForm.role) return alert('Please enter name and role');
    setLoading(prev => ({ ...prev, risk: true }));
    try {
      const res = await analyzeRetentionRisk(riskForm);
      const sM = res.match(/RISK_SCORE:\s*(\d+)/);
      const lM = res.match(/RISK_LEVEL:\s*(Low|Medium|High)/i);
      const hM = res.match(/HEADLINE:\s*(.+)/);
      const smM = res.match(/SUMMARY:\s*([\s\S]+?)(?=\nFULL ANALYSIS:|$)/);
      const fM = res.match(/FULL ANALYSIS:\s*([\s\S]+)/);
      const score = sM ? parseInt(sM[1]) : 50;
      const level = lM ? lM[1] : 'Medium';
      const headline = hM ? hM[1].trim() : `${riskForm.name} needs attention`;
      const summary = smM ? smM[1].trim() : '';
      const full = fM ? fM[1].trim() : res;
      setRiskResult({ score, level, headline, summary, full });
      const newScoreObj = { name: new Date().toLocaleDateString('en-US', { month: 'short' }), score };
      const newScores = [...riskScores, newScoreObj];
      setRiskScores(newScores);
      const avg = Math.round(newScores.reduce((a, b) => a + b.score, 0) / newScores.length);
      setStats(prev => ({ ...prev, avgRisk: `${avg}%` }));
    } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, risk: false })); }
  };

  const handlePerf = async () => {
    setLoading(prev => ({ ...prev, perf: true }));
    try {
      let data;
      if (perfSubTab === 1) data = perfForm;
      else if (perfSubTab === 2) data = ooForm;
      else if (perfSubTab === 3) data = pipForm;
      else data = recForm;
      const res = await generatePerformanceFeedback(perfSubTab, data);
      setPerfResult(res);
    } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, perf: false })); }
  };

  const handleJD = async () => {
    if (!jdForm.title) return alert('Please enter a job title');
    setLoading(prev => ({ ...prev, jd: true }));
    try {
      const res = await generateJobDescription(jdForm);
      setJdResult(res);
    } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, jd: false })); }
  };

  const handleSurvey = async () => {
    setLoading(prev => ({ ...prev, survey: true }));
    try {
      const data = surveySubTab === 1 ? svForm : saForm;
      const res = await generatePulseSurvey(surveySubTab, data);
      setSurveyResult(res);
    } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, survey: false })); }
  };

  const handleGrowth = async () => {
    setLoading(prev => ({ ...prev, growth: true }));
    try {
      let data;
      if (growthSubTab === 1) data = gpForm;
      else if (growthSubTab === 2) data = prForm;
      else data = upForm;
      const res = await generateCareerPlan(growthSubTab, data);
      setGrowthResult(res);
    } catch (e) { console.error(e); } finally { setLoading(prev => ({ ...prev, growth: false })); }
  };

  const toggleJdSection = (section: string) => {
    setJdForm(prev => ({
      ...prev,
      sections: prev.sections.includes(section) 
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }));
  };

  const toggleSvChip = (chip: string) => {
    setSvForm(prev => ({
      ...prev,
      chips: prev.chips.includes(chip)
        ? prev.chips.filter(c => c !== chip)
        : [...prev.chips, chip]
    }));
  };

  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('dashboard')} />;
  }

  return (
    <div className="relative min-h-screen bg-[#090D1A] text-[#F0F4FF] overflow-x-hidden">
      <Background />
      
      <div className="relative z-10 max-w-[1100px] mx-auto px-6 pb-24">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-7 mb-24">
          <div className="font-display text-2xl font-extrabold bg-linear-to-br from-[#7B8BFF] via-[#9B6DFF] to-[#0FD4B0] bg-clip-text text-transparent tracking-tight cursor-pointer" onClick={() => setView('landing')}>
            HireSignal
            <span className="block text-[13px] font-medium text-[#B4C4F0]/45 tracking-normal mt-[-2px]">HR Intelligence Platform</span>
          </div>
          <div className="bg-white/4 border border-white/8 rounded-full px-4 py-1.5 text-xs text-[#B4C4F0]/45 backdrop-blur-xl flex items-center gap-2">
            Expansion Pack Active &middot; <span className="text-[#0FD4B0] font-semibold">Gemini 2.0 Flash</span>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/4 border border-white/10 rounded-full px-5 py-2 text-xs text-[#B4C4F0]/45 mb-8 backdrop-blur-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B6CF9] animate-pulse" />
            Research-backed · Built for what HR needs most in 2026
          </div>
          <h1 className="font-display text-4xl md:text-7xl font-extrabold leading-[1.04] tracking-[-2.5px] mb-6">
            Four tools that solve<br />
            <span className="bg-linear-to-br from-[#7B8BFF] via-[#9B6DFF] to-[#5B6CF9] bg-clip-text text-transparent">HR's biggest gaps</span><br />
            <span className="bg-linear-to-br from-[#0FD4B0] to-[#22C55E] bg-clip-text text-transparent">right now</span>
          </h1>
          <p className="text-lg text-[#DCE4FF]/70 max-w-[560px] mx-auto mb-11 leading-relaxed font-light">
            Performance coaching, job descriptions, pulse surveys, and career growth planning — the features 98% of HR teams say they desperately need.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="bg-[#141C35] border border-white/8 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-5 hover:bg-[#1A2340] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-[#5B6CF9]/10 border border-[#5B6CF9]/20 flex items-center justify-center text-[#7B8BFF]">
              <Users size={28} />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#B4C4F0]/45 uppercase tracking-wider mb-1">New Hires (YTD)</div>
              <div className="text-3xl font-display font-extrabold text-[#F0F4FF]">{stats.hires}</div>
            </div>
          </div>
          <div className="bg-[#141C35] border border-white/8 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-5 hover:bg-[#1A2340] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 flex items-center justify-center text-[#FF6B6B]">
              <UserMinus size={28} />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#B4C4F0]/45 uppercase tracking-wider mb-1">Total Exits</div>
              <div className="text-3xl font-display font-extrabold text-[#F0F4FF]">{stats.exits}</div>
            </div>
          </div>
          <div className="bg-[#141C35] border border-white/8 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-5 hover:bg-[#1A2340] transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-[#FFB347]/10 border border-[#FFB347]/20 flex items-center justify-center text-[#FFB347]">
              <Activity size={28} />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#B4C4F0]/45 uppercase tracking-wider mb-1">Avg Retention Risk</div>
              <div className="text-3xl font-display font-extrabold text-[#F0F4FF]">{stats.avgRisk}</div>
            </div>
          </div>
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#B4C4F0]/35 mb-6 flex items-center gap-3">
          Select a module <span className="flex-1 h-px bg-white/8" />
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-12">
          <button onClick={() => setActiveTab('perf')} className={`mcard m1 ${activeTab === 'perf' ? 'active' : ''}`}>
            <span className="text-2xl mb-2.5 block relative z-10">🎯</span>
            <div className="font-display text-[13px] font-extrabold relative z-10 leading-tight">Performance Coach</div>
            <div className="text-[11px] text-[#B4C4F0]/35 mt-1 relative z-10">Feedback & reviews</div>
          </button>
          <button onClick={() => setActiveTab('jd')} className={`mcard m2 ${activeTab === 'jd' ? 'active' : ''}`}>
            <span className="text-2xl mb-2.5 block relative z-10">📝</span>
            <div className="font-display text-[13px] font-extrabold relative z-10 leading-tight">Job Description</div>
            <div className="text-[11px] text-[#B4C4F0]/35 mt-1 relative z-10">Attract top talent</div>
          </button>
          <button onClick={() => setActiveTab('survey')} className={`mcard m3 ${activeTab === 'survey' ? 'active' : ''}`}>
            <span className="text-2xl mb-2.5 block relative z-10">📡</span>
            <div className="font-display text-[13px] font-extrabold relative z-10 leading-tight">Pulse Surveys</div>
            <div className="text-[11px] text-[#B4C4F0]/35 mt-1 relative z-10">Engagement signals</div>
          </button>
          <button onClick={() => setActiveTab('growth')} className={`mcard m4 ${activeTab === 'growth' ? 'active' : ''}`}>
            <span className="text-2xl mb-2.5 block relative z-10">🌱</span>
            <div className="font-display text-[13px] font-extrabold relative z-10 leading-tight">Career Growth</div>
            <div className="text-[11px] text-[#B4C4F0]/35 mt-1 relative z-10">Retention via growth</div>
          </button>
          <button onClick={() => setActiveTab('onboard')} className={`mcard m5 ${activeTab === 'onboard' ? 'active' : ''}`}>
            <span className="text-2xl mb-2.5 block relative z-10">🚀</span>
            <div className="font-display text-[13px] font-extrabold relative z-10 leading-tight">Onboarding</div>
            <div className="text-[11px] text-[#B4C4F0]/35 mt-1 relative z-10">30-day plans</div>
          </button>
          <button onClick={() => setActiveTab('exit')} className={`mcard m6 ${activeTab === 'exit' ? 'active' : ''}`}>
            <span className="text-2xl mb-2.5 block relative z-10">🚪</span>
            <div className="font-display text-[13px] font-extrabold relative z-10 leading-tight">Exit Intelligence</div>
            <div className="text-[11px] text-[#B4C4F0]/35 mt-1 relative z-10">Knowledge transfer</div>
          </button>
          <button onClick={() => setActiveTab('risk')} className={`mcard m7 ${activeTab === 'risk' ? 'active' : ''}`}>
            <span className="text-2xl mb-2.5 block relative z-10">📊</span>
            <div className="font-display text-[13px] font-extrabold relative z-10 leading-tight">Retention Risk</div>
            <div className="text-[11px] text-[#B4C4F0]/35 mt-1 relative z-10">Predictive analysis</div>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* PERFORMANCE COACH */}
          {activeTab === 'perf' && (
            <motion.div key="perf" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="scard">
              <div className="p-8 border-b border-white/8 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-linear-to-br from-[#5B6CF9]/30 to-[#7B8BFF]/20 border border-[#5B6CF9]/30 shrink-0">🎯</div>
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">AI Performance Coach</h3>
                  <p className="text-sm text-[#B4C4F0]/35 leading-relaxed">Replace dreaded annual reviews with continuous feedback. Generate agendas, PIPs, and recognition messages.</p>
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-8">
                  <button onClick={() => setPerfSubTab(1)} className={`chip ${perfSubTab === 1 ? 'active' : ''}`}>📋 Performance Review</button>
                  <button onClick={() => setPerfSubTab(2)} className={`chip ${perfSubTab === 2 ? 'active' : ''}`}>💬 1-on-1 Agenda</button>
                  <button onClick={() => setPerfSubTab(3)} className={`chip ${perfSubTab === 3 ? 'active' : ''}`}>⬆️ Improvement Plan</button>
                  <button onClick={() => setPerfSubTab(4)} className={`chip ${perfSubTab === 4 ? 'active' : ''}`}>🏆 Recognition</button>
                </div>

                {perfSubTab === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={perfForm.name} onChange={e => setPerfForm({...perfForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Aisha Patel"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Role</label><input value={perfForm.role} onChange={e => setPerfForm({...perfForm, role: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Software Engineer"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Review Period</label><input value={perfForm.period} onChange={e => setPerfForm({...perfForm, period: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Q1 2026"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Performance Rating</label>
                      <select value={perfForm.perf} onChange={e => setPerfForm({...perfForm, perf: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 appearance-none">
                        <option className="bg-[#08080f]">Exceeds expectations</option>
                        <option className="bg-[#08080f]">Solid — met most goals</option>
                        <option className="bg-[#08080f]">Needs improvement</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Key Accomplishments</label><textarea value={perfForm.wins} onChange={e => setPerfForm({...perfForm, wins: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 min-h-[100px]" placeholder="e.g. Delivered checkout API early, reduced load by 40%..."/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Areas for Growth</label><textarea value={perfForm.grow} onChange={e => setPerfForm({...perfForm, grow: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 min-h-[100px]" placeholder="e.g. Cross-team communication, documentation habits..."/></div>
                  </div>
                )}

                {perfSubTab === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Manager Name</label><input value={ooForm.mgr} onChange={e => setOoForm({...ooForm, mgr: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. David Kim"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={ooForm.emp} onChange={e => setOoForm({...ooForm, emp: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Fatima Al-Hassan"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Frequency</label>
                      <select value={ooForm.freq} onChange={e => setOoForm({...ooForm, freq: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 appearance-none">
                        <option className="bg-[#08080f]">Weekly</option>
                        <option className="bg-[#08080f]">Bi-weekly</option>
                        <option className="bg-[#08080f]">Monthly</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Meeting Focus</label><input value={ooForm.focus} onChange={e => setOoForm({...ooForm, focus: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Career growth, project blockers"/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Context</label><textarea value={ooForm.ctx} onChange={e => setOoForm({...ooForm, ctx: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 min-h-[100px]" placeholder="e.g. Team just shipped a big release, asking about promotion..."/></div>
                  </div>
                )}

                {perfSubTab === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={pipForm.name} onChange={e => setPipForm({...pipForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Marcus Webb"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Duration</label>
                      <select value={pipForm.dur} onChange={e => setPipForm({...pipForm, dur: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 appearance-none">
                        <option className="bg-[#08080f]">30 days</option>
                        <option className="bg-[#08080f]">60 days</option>
                        <option className="bg-[#08080f]">90 days</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Performance Issues</label><textarea value={pipForm.issues} onChange={e => setPipForm({...pipForm, issues: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 min-h-[100px]" placeholder="e.g. Missed quarterly sales target by 35%..."/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Support Provided</label><textarea value={pipForm.support} onChange={e => setPipForm({...pipForm, support: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 min-h-[80px]" placeholder="e.g. Weekly mentoring sessions, training budget..."/></div>
                  </div>
                )}

                {perfSubTab === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={recForm.name} onChange={e => setRecForm({...recForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Priya Sharma"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Tone</label>
                      <select value={recForm.tone} onChange={e => setRecForm({...recForm, tone: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50 appearance-none">
                        <option className="bg-[#08080f]">Warm and personal</option>
                        <option className="bg-[#08080f]">Professional and direct</option>
                        <option className="bg-[#08080f]">Energetic and public</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">What They Did</label><input value={recForm.what} onChange={e => setRecForm({...recForm, what: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Stayed late to fix production bug before launch"/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Business Impact</label><input value={recForm.impact} onChange={e => setRecForm({...recForm, impact: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#5B6CF9]/50" placeholder="e.g. Prevented 4 hours of downtime for 10k users"/></div>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-8">
                  <button onClick={handlePerf} disabled={loading.perf} className="btn-glow px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 disabled:opacity-40">
                    {loading.perf ? <RefreshCw className="animate-spin" size={16} /> : '✨ Generate Feedback'}
                  </button>
                </div>

                {perfResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#5B6CF9]/5 border border-[#5B6CF9]/15 rounded-2xl p-6 mt-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#7B8BFF] mb-4 flex items-center gap-2">
                      AI Performance Intelligence
                      <button onClick={() => copyToClipboard(perfResult)} className="ml-auto bg-[#5B6CF9]/10 border border-[#5B6CF9]/20 text-[#7B8BFF] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><Copy size={10} /> Copy</button>
                    </div>
                    <div className="text-sm leading-relaxed text-[#B4C4F0]/80 whitespace-pre-wrap font-light">{perfResult}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* JOB DESCRIPTION */}
          {activeTab === 'jd' && (
            <motion.div key="jd" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="scard">
              <div className="p-8 border-b border-white/8 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-linear-to-br from-[#9B6DFF]/30 to-[#B18CFF]/20 border border-[#9B6DFF]/30 shrink-0">📝</div>
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">AI Job Description Builder</h3>
                  <p className="text-sm text-[#B4C4F0]/35 leading-relaxed">Write compelling, inclusive JDs that attract top talent and reflect your actual culture.</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Job Title</label><input value={jdForm.title} onChange={e => setJdForm({...jdForm, title: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#9B6DFF]/50" placeholder="e.g. Senior Product Designer"/></div>
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Department</label><input value={jdForm.dept} onChange={e => setJdForm({...jdForm, dept: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#9B6DFF]/50" placeholder="e.g. Product & Design"/></div>
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Experience Level</label>
                    <select value={jdForm.exp} onChange={e => setJdForm({...jdForm, exp: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#9B6DFF]/50 appearance-none">
                      <option className="bg-[#08080f]">Entry Level (0–2 years)</option>
                      <option className="bg-[#08080f]">Mid-Level (3–5 years)</option>
                      <option className="bg-[#08080f]">Senior (5–8 years)</option>
                      <option className="bg-[#08080f]">Lead / Principal (8+ years)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Tone</label>
                    <select value={jdForm.tone} onChange={e => setJdForm({...jdForm, tone: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#9B6DFF]/50 appearance-none">
                      <option className="bg-[#08080f]">Startup-energetic and bold</option>
                      <option className="bg-[#08080f]">Professional and corporate</option>
                      <option className="bg-[#08080f]">Friendly and approachable</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Responsibilities</label><textarea value={jdForm.resp} onChange={e => setJdForm({...jdForm, resp: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#9B6DFF]/50 min-h-[100px]" placeholder="e.g. Lead end-to-end design, run research sessions..."/></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Required Skills</label><textarea value={jdForm.skills} onChange={e => setJdForm({...jdForm, skills: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#9B6DFF]/50 min-h-[80px]" placeholder="e.g. Figma, React, User Research, Agile..."/></div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Include Sections</label>
                    <div className="flex flex-wrap gap-2">
                      {['About the Role', 'Responsibilities', 'Requirements', 'Nice-to-Haves', 'What We Offer', 'DEI Statement'].map(s => (
                        <button key={s} onClick={() => toggleJdSection(s)} className={`chip ${jdForm.sections.includes(s) ? 'active' : ''}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <button onClick={handleJD} disabled={loading.jd} className="btn-glow px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 disabled:opacity-40">
                    {loading.jd ? <RefreshCw className="animate-spin" size={16} /> : '✍️ Generate JD'}
                  </button>
                </div>
                {jdResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#9B6DFF]/5 border border-[#9B6DFF]/15 rounded-2xl p-6 mt-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#B18CFF] mb-4 flex items-center gap-2">
                      AI-Written Job Description
                      <button onClick={() => copyToClipboard(jdResult)} className="ml-auto bg-[#9B6DFF]/10 border border-[#9B6DFF]/20 text-[#B18CFF] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><Copy size={10} /> Copy</button>
                    </div>
                    <div className="text-sm leading-relaxed text-[#B4C4F0]/80 whitespace-pre-wrap font-light">{jdResult}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* PULSE SURVEY */}
          {activeTab === 'survey' && (
            <motion.div key="survey" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="scard">
              <div className="p-8 border-b border-white/8 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-linear-to-br from-[#0FD4B0]/30 to-[#22C55E]/20 border border-[#0FD4B0]/30 shrink-0">📡</div>
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">Employee Pulse Surveys</h3>
                  <p className="text-sm text-[#B4C4F0]/35 leading-relaxed">Build smart, targeted surveys and get AI to analyze results for actionable insights.</p>
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-8">
                  <button onClick={() => setSurveySubTab(1)} className={`chip ${surveySubTab === 1 ? 'active' : ''}`}>🔧 Build Survey</button>
                  <button onClick={() => setSurveySubTab(2)} className={`chip ${surveySubTab === 2 ? 'active' : ''}`}>📊 Analyze Results</button>
                </div>

                {surveySubTab === 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Team / Department</label><input value={svForm.team} onChange={e => setSvForm({...svForm, team: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50" placeholder="e.g. Engineering Team"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Frequency</label>
                      <select value={svForm.freq} onChange={e => setSvForm({...svForm, freq: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50 appearance-none">
                        <option className="bg-[#08080f]">Weekly (3–5 questions)</option>
                        <option className="bg-[#08080f]">Bi-weekly (5–7 questions)</option>
                        <option className="bg-[#08080f]">Monthly (10–12 questions)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Question Style</label>
                      <select value={svForm.style} onChange={e => setSvForm({...svForm, style: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50 appearance-none">
                        <option className="bg-[#08080f]">Mix of rating + open text</option>
                        <option className="bg-[#08080f]">Purely quantitative (1–5 scale)</option>
                        <option className="bg-[#08080f]">Qualitative / Open-ended</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Anonymity Level</label>
                      <select value={svForm.anon} onChange={e => setSvForm({...svForm, anon: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50 appearance-none">
                        <option className="bg-[#08080f]">Fully anonymous</option>
                        <option className="bg-[#08080f]">Confidential (HR only)</option>
                        <option className="bg-[#08080f]">Non-anonymous</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Focus Areas</label>
                      <div className="flex flex-wrap gap-2">
                        {['Overall engagement', 'Manager relationship', 'Workload & burnout', 'Growth & learning', 'Team collaboration', 'Recognition & belonging'].map(c => (
                          <button key={c} onClick={() => toggleSvChip(c)} className={`chip ${svForm.chips.includes(c) ? 'active' : ''}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Company Context</label><textarea value={svForm.ctx} onChange={e => setSvForm({...svForm, ctx: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50 min-h-[80px]" placeholder="e.g. Just went through a re-org, morale seems low..."/></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Team</label><input value={saForm.team} onChange={e => setSaForm({...saForm, team: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50" placeholder="e.g. Sales Team"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Survey Period</label><input value={saForm.period} onChange={e => setSaForm({...saForm, period: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50" placeholder="e.g. Q4 2025"/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Paste Survey Results</label><textarea value={saForm.results} onChange={e => setSaForm({...saForm, results: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50 min-h-[150px]" placeholder="Paste raw results or average scores here..."/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Previous Results (for Trends)</label><textarea value={saForm.prev} onChange={e => setSaForm({...saForm, prev: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#0FD4B0]/50 min-h-[80px]" placeholder="Paste previous survey summary for comparison..."/></div>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-8">
                  <button onClick={handleSurvey} disabled={loading.survey} className="btn-glow px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 disabled:opacity-40">
                    {loading.survey ? <RefreshCw className="animate-spin" size={16} /> : '📡 Process Survey'}
                  </button>
                </div>
                {surveyResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0FD4B0]/5 border border-[#0FD4B0]/15 rounded-2xl p-6 mt-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#0FD4B0] mb-4 flex items-center gap-2">
                      AI Survey Intelligence
                      <button onClick={() => copyToClipboard(surveyResult)} className="ml-auto bg-[#0FD4B0]/10 border border-[#0FD4B0]/20 text-[#0FD4B0] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><Copy size={10} /> Copy</button>
                    </div>
                    <div className="text-sm leading-relaxed text-[#B4C4F0]/80 whitespace-pre-wrap font-light">{surveyResult}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* CAREER GROWTH */}
          {activeTab === 'growth' && (
            <motion.div key="growth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="scard">
              <div className="p-8 border-b border-white/8 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-linear-to-br from-[#FF6B6B]/30 to-[#FFB347]/20 border border-[#FF6B6B]/30 shrink-0">🌱</div>
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">AI Career Growth Planner</h3>
                  <p className="text-sm text-[#B4C4F0]/35 leading-relaxed">Map clear growth paths, promotion readiness, and upskilling roadmaps to retain your best people.</p>
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-2 mb-8">
                  <button onClick={() => setGrowthSubTab(1)} className={`chip ${growthSubTab === 1 ? 'active' : ''}`}>🗺️ Growth Plan</button>
                  <button onClick={() => setGrowthSubTab(2)} className={`chip ${growthSubTab === 2 ? 'active' : ''}`}>⬆️ Promotion Check</button>
                  <button onClick={() => setGrowthSubTab(3)} className={`chip ${growthSubTab === 3 ? 'active' : ''}`}>🎓 Upskilling</button>
                </div>

                {growthSubTab === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={gpForm.name} onChange={e => setGpForm({...gpForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50" placeholder="e.g. Arjun Mehta"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Target Role</label><input value={gpForm.target} onChange={e => setGpForm({...gpForm, target: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50" placeholder="e.g. Senior Engineer"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Timeline</label>
                      <select value={gpForm.time} onChange={e => setGpForm({...gpForm, time: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 appearance-none">
                        <option className="bg-[#08080f]">6 months</option>
                        <option className="bg-[#08080f]">12 months</option>
                        <option className="bg-[#08080f]">18 months</option>
                        <option className="bg-[#08080f]">24 months</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Primary Motivation</label><input value={gpForm.mot} onChange={e => setGpForm({...gpForm, mot: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50" placeholder="e.g. Leadership, technical mastery, salary..."/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Current Strengths</label><textarea value={gpForm.str} onChange={e => setGpForm({...gpForm, str: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 min-h-[100px]" placeholder="e.g. Strong in React, great problem-solver..."/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Skill Gaps</label><textarea value={gpForm.gaps} onChange={e => setGpForm({...gpForm, gaps: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 min-h-[80px]" placeholder="e.g. System design, public speaking, mentoring..."/></div>
                  </div>
                )}

                {growthSubTab === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={prForm.name} onChange={e => setPrForm({...prForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50" placeholder="e.g. Neha Joshi"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Target Promotion</label><input value={prForm.target} onChange={e => setPrForm({...prForm, target: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50" placeholder="e.g. Principal Designer"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Tenure in Role</label>
                      <select value={prForm.tenure} onChange={e => setPrForm({...prForm, tenure: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 appearance-none">
                        <option className="bg-[#08080f]">Less than 1 year</option>
                        <option className="bg-[#08080f]">1–2 years</option>
                        <option className="bg-[#08080f]">2–3 years</option>
                        <option className="bg-[#08080f]">3+ years</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Evidence of Readiness</label><textarea value={prForm.ev} onChange={e => setPrForm({...prForm, ev: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 min-h-[100px]" placeholder="e.g. Led Q1 brand refresh independently, mentored 2 juniors..."/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">What's Still Missing?</label><textarea value={prForm.miss} onChange={e => setPrForm({...prForm, miss: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 min-h-[80px]" placeholder="e.g. Strategic thinking, cross-functional influence..."/></div>
                  </div>
                )}

                {growthSubTab === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={upForm.name} onChange={e => setUpForm({...upForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50" placeholder="e.g. Samira Khan"/></div>
                    <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Learning Style</label>
                      <select value={upForm.style} onChange={e => setUpForm({...upForm, style: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 appearance-none">
                        <option className="bg-[#08080f]">Online courses (self-paced)</option>
                        <option className="bg-[#08080f]">Hands-on projects</option>
                        <option className="bg-[#08080f]">Mentorship / Coaching</option>
                        <option className="bg-[#08080f]">Workshops / Bootcamps</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Skills to Build</label><textarea value={upForm.skills} onChange={e => setUpForm({...upForm, skills: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 min-h-[100px]" placeholder="e.g. Python for data analysis, executive communication..."/></div>
                    <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Business Need / Context</label><textarea value={upForm.biz} onChange={e => setUpForm({...upForm, biz: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF6B6B]/50 min-h-[80px]" placeholder="e.g. Moving towards AI-driven workflows, need more data literacy..."/></div>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-8">
                  <button onClick={handleGrowth} disabled={loading.growth} className="btn-glow px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 disabled:opacity-40">
                    {loading.growth ? <RefreshCw className="animate-spin" size={16} /> : '🌱 Generate Plan'}
                  </button>
                </div>
                {growthResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FF6B6B]/5 border border-[#FF6B6B]/15 rounded-2xl p-6 mt-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B6B] mb-4 flex items-center gap-2">
                      AI Career Intelligence
                      <button onClick={() => copyToClipboard(growthResult)} className="ml-auto bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#FF6B6B] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><Copy size={10} /> Copy</button>
                    </div>
                    <div className="text-sm leading-relaxed text-[#B4C4F0]/80 whitespace-pre-wrap font-light">{growthResult}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ONBOARDING */}
          {activeTab === 'onboard' && (
            <motion.div key="onboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="scard">
              <div className="p-8 border-b border-white/8 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-linear-to-br from-[#FF3CAC]/25 to-[#784BA0]/25 border border-[#FF3CAC]/25 shrink-0">🚀</div>
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">Generate 30-Day Onboarding Plan</h3>
                  <p className="text-sm text-[#B4C4F0]/35 leading-relaxed">AI builds a laser-focused, role-specific onboarding journey.</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={onboardForm.name} onChange={e => setOnboardForm({...onboardForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF3CAC]/50" placeholder="e.g. Sarah Johnson"/></div>
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Job Title</label><input value={onboardForm.role} onChange={e => setOnboardForm({...onboardForm, role: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF3CAC]/50" placeholder="e.g. Senior Marketing Manager"/></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Key Goals</label><textarea value={onboardForm.goals} onChange={e => setOnboardForm({...onboardForm, goals: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FF3CAC]/50 min-h-[100px]" placeholder="e.g. Learn product, meet stakeholders..."/></div>
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <button onClick={handleOnboard} disabled={loading.onboard} className="btn-glow px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 disabled:opacity-40">
                    {loading.onboard ? <RefreshCw className="animate-spin" size={16} /> : '✨ Generate Plan'}
                  </button>
                </div>
                {onboardResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FF3CAC]/5 border border-[#FF3CAC]/15 rounded-2xl p-6 mt-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF3CAC] mb-4 flex items-center gap-2">
                      AI Onboarding Plan
                      <button onClick={() => copyToClipboard(onboardResult)} className="ml-auto bg-[#FF3CAC]/10 border border-[#FF3CAC]/20 text-[#FF3CAC] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><Copy size={10} /> Copy</button>
                    </div>
                    <div className="text-sm leading-relaxed text-[#B4C4F0]/80 whitespace-pre-wrap font-light">{onboardResult}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* EXIT INTELLIGENCE */}
          {activeTab === 'exit' && (
            <motion.div key="exit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="scard">
              <div className="p-8 border-b border-white/8 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-linear-to-br from-[#2B86C5]/25 to-[#00F5D4]/25 border border-[#2B86C5]/25 shrink-0">🚪</div>
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">Exit Intelligence</h3>
                  <p className="text-sm text-[#B4C4F0]/35 leading-relaxed">AI turns exit notes into a structured handover and risk signals.</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={exitForm.name} onChange={e => setExitForm({...exitForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#2B86C5]/50" placeholder="e.g. Rahul Mehta"/></div>
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Role</label><input value={exitForm.role} onChange={e => setExitForm({...exitForm, role: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#2B86C5]/50" placeholder="e.g. Lead Developer"/></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Exit Notes</label><textarea value={exitForm.notes} onChange={e => setExitForm({...exitForm, notes: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#2B86C5]/50 min-h-[120px]" placeholder="Paste exit interview notes here..."/></div>
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <button onClick={handleExit} disabled={loading.exit} className="btn-glow px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 disabled:opacity-40">
                    {loading.exit ? <RefreshCw className="animate-spin" size={16} /> : '📋 Generate Report'}
                  </button>
                </div>
                {exitResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FF3CAC]/5 border border-[#FF3CAC]/15 rounded-2xl p-6 mt-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF3CAC] mb-4 flex items-center gap-2">
                      AI Exit Report
                      <button onClick={() => copyToClipboard(exitResult)} className="ml-auto bg-[#FF3CAC]/10 border border-[#FF3CAC]/20 text-[#FF3CAC] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><Copy size={10} /> Copy</button>
                    </div>
                    <div className="text-sm leading-relaxed text-[#B4C4F0]/80 whitespace-pre-wrap font-light">{exitResult}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* RETENTION RISK */}
          {activeTab === 'risk' && (
            <motion.div key="risk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="scard">
              <div className="p-8 border-b border-white/8 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-linear-to-br from-[#FFE14D]/20 to-[#FF3CAC]/20 border border-[#FFE14D]/20 shrink-0">📊</div>
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">Retention Risk Score</h3>
                  <p className="text-sm text-[#B4C4F0]/35 leading-relaxed">Predictive analysis to identify who might be at risk before they leave.</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Employee Name</label><input value={riskForm.name} onChange={e => setRiskForm({...riskForm, name: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FFE14D]/50" placeholder="e.g. Priya Sharma"/></div>
                  <div className="flex flex-col gap-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Role</label><input value={riskForm.role} onChange={e => setRiskForm({...riskForm, role: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FFE14D]/50" placeholder="e.g. Account Manager"/></div>
                  <div className="flex flex-col gap-2 md:col-span-2"><label className="text-[11px] font-bold text-[#B4C4F0]/35 uppercase tracking-wider">Observations</label><textarea value={riskForm.obs} onChange={e => setRiskForm({...riskForm, obs: e.target.value})} className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white outline-hidden focus:border-[#FFE14D]/50 min-h-[100px]" placeholder="What have you noticed lately?..."/></div>
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <button onClick={handleRisk} disabled={loading.risk} className="btn-glow px-8 py-3 rounded-full font-semibold text-sm flex items-center gap-2 disabled:opacity-40">
                    {loading.risk ? <RefreshCw className="animate-spin" size={16} /> : '🎯 Analyze Risk'}
                  </button>
                </div>
                {riskResult.full && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                      <div className="lg:col-span-1 bg-white/4 border border-white/8 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                        <div className="rring w-[100px] h-[100px] rounded-full flex flex-col items-center justify-center relative mb-4" style={{ '--rc': riskResult.score >= 65 ? '#FF3CAC' : riskResult.score >= 35 ? '#FFE14D' : '#00F5D4', '--rp': `${riskResult.score}%` } as any}>
                          <span className="font-display text-3xl font-extrabold" style={{ color: riskResult.score >= 65 ? '#FF3CAC' : riskResult.score >= 35 ? '#FFE14D' : '#00F5D4' }}>{riskResult.score}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-tighter text-[#B4C4F0]/35">Risk Score</span>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-3 ${riskResult.level === 'High' ? 'bg-[#FF3CAC]/10 border border-[#FF3CAC]/30 text-[#FF3CAC]' : riskResult.level === 'Medium' ? 'bg-[#FFE14D]/10 border border-[#FFE14D]/30 text-[#FFE14D]' : 'bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]'}`}>{riskResult.level} Risk</div>
                        <h4 className="font-display text-lg font-extrabold leading-tight">{riskResult.headline}</h4>
                      </div>

                      <div className="lg:col-span-2 bg-white/4 border border-white/8 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#B4C4F0]/35 mb-4 flex items-center gap-2">
                          <TrendingUp size={14} className="text-[#FF3CAC]" /> Risk Trend Analysis
                        </div>
                        <div className="h-[180px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={riskScores}>
                              <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#FF3CAC" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#FF3CAC" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis hide domain={[0, 100]} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#16162a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#FF3CAC' }}
                              />
                              <Area type="monotone" dataKey="score" stroke="#FF3CAC" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/4 border border-white/8 rounded-2xl p-6 mt-6 backdrop-blur-xl">
                      <p className="text-sm text-white/65 leading-relaxed italic">"{riskResult.summary}"</p>
                    </div>

                    <div className="bg-[#00F5D4]/5 border border-[#00F5D4]/15 rounded-2xl p-6 mt-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#00F5D4] mb-4 flex items-center gap-2">AI Analysis & Action Plan <button onClick={() => copyToClipboard(riskResult.full)} className="ml-auto bg-[#00F5D4]/10 border border-[#00F5D4]/20 text-[#00F5D4] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><Copy size={10} /> Copy</button></div>
                      <div className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap font-light">{riskResult.full}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
