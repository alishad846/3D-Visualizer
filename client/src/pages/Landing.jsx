import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Edges, ContactShadows, Sparkles } from '@react-three/drei';
import { QrCode, Mic, View, Sparkles as SparklesIcon, ChevronRight, Smartphone, Cuboid, Zap, Github, Twitter, Box } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// Hero 3D Abstract Object
const HeroObject = () => {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t / 4) / 2;
    groupRef.current.rotation.x = Math.cos(t / 4) / 2;
    groupRef.current.position.y = Math.sin(t / 1.5) / 10;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh>
          <octahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial 
            color="#050505" 
            metalness={0.9} 
            roughness={0.1} 
            clearcoat={1} 
            emissive="#00F0FF"
            emissiveIntensity={0.05}
          />
          <Edges linewidth={2} threshold={15} color="#00F0FF" />
        </mesh>
      </Float>
      {/* Orbiting rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.01, 16, 100]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[2.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#0055FF" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: QrCode, title: "Instant QR Recognition", desc: "Lightning-fast camera scanning without downloading an app." },
    { icon: Cuboid, title: "Photorealistic 3D", desc: "Interact, rotate, and zoom with buttery smooth 60fps rendering." },
    { icon: Mic, title: "Aria Voice Assistant", desc: "Real-time intelligent TTS explains the product naturally." },
    { icon: Box, title: "WebXR AR Mode", desc: "Place the product in your room with native Augmented Reality." },
  ];

  const steps = [
    { title: "Scan", desc: "Point your camera at a ScanVista QR code.", icon: Smartphone },
    { title: "Visualize", desc: "The product materializes in stunning 3D.", icon: Cuboid },
    { title: "Interact", desc: "Talk to Aria and explore the features.", icon: Mic }
  ];

  return (
    <div className="relative min-h-screen bg-[#020202] text-white overflow-x-hidden font-sans selection:bg-[#00F0FF]/30">
      
      {/* Dynamic Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full px-6 md:px-12 py-4 flex justify-between items-center z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}
      >
        <div className="text-xl font-display font-bold tracking-wider flex items-center gap-2 cursor-pointer">
          <View className="text-[#00F0FF] w-6 h-6" />
          <span>SCAN<span className="text-[#00F0FF]">VISTA</span></span>
        </div>
        <div className="hidden md:flex gap-8 items-center font-medium text-sm text-[#A0A0A0]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button>
        </div>
        <button 
          onClick={() => navigate('/scan')}
          className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
        >
          Try Now
        </button>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        
        {/* Background 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <color attach="background" args={['#020202']} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <Suspense fallback={null}>
              <HeroObject />
              <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={15} blur={2} color="#00F0FF" />
              <Sparkles count={100} scale={10} size={2} speed={0.4} opacity={0.2} color="#00F0FF" />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI/2} />
          </Canvas>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020202]/50 to-[#020202] pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#00F0FF] mb-8 backdrop-blur-md">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>The Future of Product Discovery</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold leading-tight mb-6 tracking-tight">
              Bridge the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0055FF]">Physical</span> <br/> and Digital.
            </h1>
            
            <p className="text-lg md:text-xl text-[#A0A0A0] max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Scan any QR code to instantly spawn interactive 3D products, complete with a voice-guided AI assistant. No apps. Zero friction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/scan')}
                className="w-full sm:w-auto px-8 py-4 bg-[#00F0FF] text-black rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-[#00D0DD] hover:scale-105 shadow-[0_0_30px_rgba(0,240,255,0.3)]"
              >
                <QrCode className="w-5 h-5" />
                <span>Scan Product</span>
              </button>
              <button 
                onClick={() => navigate('/view/demo')}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <View className="w-5 h-5" />
                <span>View Live Demo</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-14 flex flex-col items-center gap-4">
              <p className="text-xs text-[#555] uppercase tracking-widest">Trusted by innovative teams</p>
              <div className="flex items-center gap-8 opacity-40">
                {['Shopify', 'Nike', 'IKEA', 'Samsung', 'Adidas'].map((brand) => (
                  <span key={brand} className="text-sm font-display font-bold tracking-wider">{brand}</span>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative py-32 px-6 bg-[#020202]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-semibold mb-4">A seamless <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-white">experience.</span></h2>
            <p className="text-[#A0A0A0]">Transform a simple label into a spatial computing masterpiece in three steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/30 to-transparent -translate-y-1/2 z-0" />
            
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center p-8 bg-[#0A0A0A] border border-white/5 rounded-3xl"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F0FF]/20 to-transparent border border-[#00F0FF]/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                  <step.icon className="w-7 h-7 text-[#00F0FF]" />
                </div>
                <div className="text-[#00F0FF] font-display font-bold text-sm tracking-widest mb-2">STEP 0{idx + 1}</div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-[#888888] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-[#050505] relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0055FF]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-semibold mb-4">Built for the <br/> <span className="text-[#00F0FF]">spatial era.</span></h2>
            <p className="text-[#A0A0A0] max-w-lg">ScanVista leverages modern web APIs to deliver native-like augmented reality and AI integration directly in the browser.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#020202] border border-white/5 hover:border-[#00F0FF]/50 transition-colors rounded-3xl p-8 flex flex-col group cursor-default"
              >
                <feat.icon className="w-8 h-8 text-[#A0A0A0] group-hover:text-[#00F0FF] transition-colors mb-6" />
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-[#777777] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-[#020202] relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0055FF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-semibold mb-4">Simple, transparent <span className="text-[#00F0FF]">pricing.</span></h2>
            <p className="text-[#A0A0A0] max-w-lg mx-auto">Start for free. Scale when you need to.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', period: '/month', desc: 'Perfect for trying out ScanVista', features: ['5 3D Models', '100 QR Scans/mo', 'Basic AR Viewer', 'Community Support'], cta: 'Get Started', highlight: false },
              { name: 'Pro', price: '$29', period: '/month', desc: 'For growing brands and creators', features: ['Unlimited Models', 'Unlimited Scans', 'HD Textures & AR', 'AI Voice Assistant', 'Priority Support', 'Custom Branding'], cta: 'Start Free Trial', highlight: true },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large-scale deployments', features: ['Everything in Pro', 'SSO & Team Access', 'API Access', 'Dedicated Account Manager', 'SLA Guarantee', 'On-Premise Option'], cta: 'Contact Sales', highlight: false },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`rounded-3xl p-8 flex flex-col ${plan.highlight ? 'bg-gradient-to-b from-[#00F0FF]/10 to-[#0055FF]/5 border-2 border-[#00F0FF]/30 shadow-[0_0_40px_rgba(0,240,255,0.1)] relative' : 'bg-[#0A0A0A] border border-white/5'}`}
              >
                {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00F0FF] text-black text-xs font-bold rounded-full">Most Popular</div>}
                <h3 className="text-lg font-display font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className="text-[#888] text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-[#888] mb-8">{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-[#ccc]">
                      <div className="w-5 h-5 rounded-full bg-[#00F0FF]/10 flex items-center justify-center shrink-0">
                        <ChevronRight className="w-3 h-3 text-[#00F0FF]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all ${plan.highlight ? 'bg-[#00F0FF] text-black hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-semibold mb-4">Loved by <span className="text-[#00F0FF]">creators.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Chen', role: 'Product Designer at Luminary', quote: 'ScanVista transformed how we present our catalog. Clients can literally see furniture in their living room before buying.' },
              { name: 'Marcus Rivera', role: 'E-Commerce Lead, NovaTech', quote: 'Our product return rate dropped 34% after integrating ScanVista QR codes. The 3D previews set real expectations.' },
              { name: 'Priya Sharma', role: 'Founder, ArtisanCraft', quote: 'The AI voice assistant is a game-changer. It\'s like having a personal sales rep for every single product on our shelf.' },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-[#020202] border border-white/5 rounded-3xl p-8"
              >
                <p className="text-sm text-[#ccc] leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F0FF]/30 to-[#0055FF]/30 flex items-center justify-center text-sm font-bold text-[#00F0FF]">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[#888]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F0FF]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-display font-semibold mb-6">Ready to visualize?</h2>
          <p className="text-xl text-[#A0A0A0] mb-10">Join the next generation of product interaction. No sign-up required to test.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="px-10 py-5 bg-[#00F0FF] text-black rounded-full font-bold text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(0,240,255,0.2)]"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/scan')}
              className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-bold text-xl hover:bg-white/10 transition-all"
            >
              Launch Scanner
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#020202]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-display font-bold">
            <View className="text-[#00F0FF] w-5 h-5" />
            <span>SCAN<span className="text-[#00F0FF]">VISTA</span></span>
          </div>
          <div className="flex gap-6 text-[#777777] text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
