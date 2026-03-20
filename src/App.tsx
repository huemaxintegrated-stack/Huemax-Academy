import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Cpu, 
  Briefcase, 
  CheckCircle, 
  Star, 
  Phone, 
  Mail, 
  X, 
  Menu, 
  Award, 
  Users, 
  ChevronRight, 
  CreditCard,
  Check,
  MessageSquare,
  Send,
  Loader2,
  Brain,
  Sparkles,
  Rocket
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const HUEMAX_SYSTEM_INSTRUCTION = `
You are the friendly and helpful AI assistant for Huemax Academy. Your goal is to help kids, teens, and parents learn about our amazing academy!

Academy Details:
- Name: Huemax Academy
- Mission: Master the Future of Work through AI Literacy, Prompt Engineering, and Employable Skills. We make learning AI fun and easy!

Detailed Curriculum:
1. AI Literacy:
   - Fundamentals of Generative AI vs Predictive AI.
   - Understanding Large Language Models (LLMs).
   - Ethical AI usage and industry-specific AI impacts.
2. Prompt Engineering:
   - Master techniques like Zero-shot, Few-shot, and Chain-of-thought prompting.
   - Role-playing and persona-based prompting.
   - Advanced parameter tuning for professional outputs.
3. Employable Skills & Monetization:
   - Freelancing strategies for Upwork, Fiverr, and LinkedIn.
   - Building an AI-driven content strategy.
   - Business process automation for small and medium enterprises (SMEs).

Prerequisites:
- No prior coding or technical experience required.
- Basic computer literacy (browsing, typing).
- A laptop or PC with a stable internet connection.
- A passion for learning and adapting to new technologies.

Pricing & Payments:
- Course Fee: Exactly ₦15,000 per month.
- Payment Method: Only Bank Transfer is accepted.
  Account Details:
  - Account Number: 6539516562
  - Bank: Opay
  - Account Name: Huemax Integrated Solutions
- After payment, students are automatically redirected to WhatsApp to confirm their booking.
- Refund Policy: Contact support for specific cases, but generally, fees cover the monthly intensive training.

Schedule & Logistics:
- Days: Weekends Only (Saturdays & Sundays).
- Time: 10:00 AM - 2:00 PM West Africa Time (WAT).
- Format: Live Virtual Classes with interactive Q&A sessions.
- Duration: The training is structured as a monthly intensive program.

Post-Certification Opportunities:
- Freelance AI Consultant or Prompt Engineer.
- Content Strategist for digital agencies.
- Efficiency Expert for businesses looking to integrate AI.
- Access to the Huemax Alumni Community for ongoing networking and job leads.

Achievements:
- Over 400 students trained with a 100% certification rate.
- Students receive a verifiable Professional Certificate upon completion.

Contact Info:
- Phone: 09162870191
- Email: huemaxintegrated@gmail.com

Tone: Professional, encouraging, helpful, and concise.
If asked about topics outside of Huemax Academy, politely redirect them to academy-related inquiries.
Always be precise about the ₦15,000 fee and the weekend-only schedule.
`;

const Logo = ({ className = "", showTagline = false }: { className?: string, showTagline?: boolean }) => (
  <div className={`flex flex-col ${className}`}>
    <div className="flex items-center gap-2">
      <motion.div 
        animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-10 h-10 bg-brand-navy rounded-2xl flex items-center justify-center text-white shadow-lg relative"
      >
        <Brain size={24} />
        <motion.div 
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 text-brand-red"
        >
          <Star size={12} fill="currentColor" />
        </motion.div>
      </motion.div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <div className="flex items-baseline font-serif">
            <span className="text-brand-navy lowercase text-2xl md:text-3xl font-bold tracking-tight">huema</span>
            <span className="text-brand-red lowercase text-2xl md:text-3xl font-bold tracking-tight">x</span>
          </div>
          <div className="bg-brand-red px-2 py-0.5 rounded-sm transform -rotate-1">
            <span className="text-white font-sans text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">Academy</span>
          </div>
        </div>
      </div>
    </div>
    {showTagline && (
      <p className="text-[8px] md:text-[10px] text-brand-navy font-serif italic mt-1 opacity-80 leading-none pl-12">
        .....Nurturing Young Minds, Building Business Leaders, and Mastering Technology.
      </p>
    )}
  </div>
);

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Payment Form State
  const [paymentStep, setPaymentStep] = useState<'form' | 'transfer' | 'receipt'>('form');
  const [paymentForm, setPaymentForm] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [receiptId, setReceiptId] = useState('');
  const [paymentErrors, setPaymentErrors] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hello! I'm the Huemax Academy Assistant. How can I help you master the future of work today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handlePaymentSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    let isValid = true;
    const newErrors = { fullName: '', email: '', phone: '' };

    if (!paymentForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    } else if (!/^[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(paymentForm.fullName.trim())) {
      newErrors.fullName = 'Please enter your first and last name (letters only)';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!paymentForm.email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!emailRegex.test(paymentForm.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (paymentForm.phone && (paymentForm.phone.length < 10 || paymentForm.phone.length > 15)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
      isValid = false;
    }

    setPaymentErrors(newErrors);

    if (isValid) {
      setPaymentStep('transfer');
    }
  };

  const handleConfirmTransfer = () => {
    const id = 'HMX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setReceiptId(id);
    setPaymentStep('receipt');
  };

  const handleCompletePayment = () => {
    const message = encodeURIComponent("Payment made");
    const whatsappUrl = `https://wa.me/2349162870191?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setIsModalOpen(false);
    // Reset form
    setTimeout(() => {
      setPaymentStep('form');
      setPaymentForm({ fullName: '', email: '', phone: '' });
      setReceiptId('');
    }, 500);
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Thank you! We will get back to you soon.");
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: HUEMAX_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const modelText = response.text || "I'm sorry, I couldn't process that. Please try again or contact us directly.";
      setChatMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Courses', href: '#courses' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen font-sans">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand-red z-[100] origin-left"
        style={{ scaleX: scrollProgress / 100 }}
      />

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'glass py-3 shadow-lg' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Logo className="transform hover:scale-105 transition-transform cursor-pointer" />
                </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-brand-navy/80 hover:text-brand-red px-3 py-2 rounded-xl text-sm font-bold transition-all hover:bg-soft-blue"
                  >
                    {link.name}
                  </a>
                ))}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-red hover:bg-brand-red/90 text-white px-8 py-2.5 rounded-2xl text-sm font-black transition-all transform hover:scale-110 shadow-lg hover:shadow-brand-red/40"
                >
                  Book Now 🚀
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${scrolled ? 'text-brand-navy' : 'text-brand-navy'} hover:text-brand-red p-2`}
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-soft-blue"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-brand-navy hover:text-brand-red block px-3 py-2 rounded-md text-base font-bold"
                  >
                    {link.name}
                  </a>
                ))}
                <button 
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-brand-navy text-white px-6 py-3 rounded-xl text-base font-black mt-4 shadow-lg"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-soft-blue overflow-hidden pt-20">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 50, 0], 
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-navy/10 rounded-full blur-[100px]"
          ></motion.div>
          <motion.div 
            animate={{ 
              x: [0, -50, 0], 
              y: [0, 30, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[120px]"
          ></motion.div>
          
          {/* Playful Floating Elements */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.5, 0.2], 
                scale: [1, 1.2, 1],
                y: [0, -60, 0],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 8 + i * 2, 
                repeat: Infinity, 
                delay: i * 1 
              }}
              className={`absolute rounded-3xl flex items-center justify-center text-white shadow-xl ${
                i % 4 === 0 ? 'bg-brand-navy' : 
                i % 4 === 1 ? 'bg-brand-red' : 
                i % 4 === 2 ? 'bg-brand-navy/80' : 'bg-brand-red/80'
              }`}
              style={{
                width: 50 + i * 10,
                height: 50 + i * 10,
                left: `${5 + i * 12}%`,
                top: `${15 + i * 10}%`,
              }}
            >
              {i % 4 === 0 ? <Star size={24} /> : 
               i % 4 === 1 ? <Cpu size={24} /> : 
               i % 4 === 2 ? <Award size={24} /> : <BookOpen size={24} />}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-white text-brand-navy text-sm font-black mb-6 shadow-sm border border-brand-navy/10"
              >
                <span className="animate-wiggle inline-block">👋</span> Hey Future Leader!
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-black text-brand-navy mb-6 leading-tight font-serif">
                Master the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-navy to-brand-red">Future of Work</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed font-medium">
                Unlock your potential with AI Literacy, Prompt Engineering, and Employable Skills. We nurture young minds to become tomorrow's business leaders. 🌟
              </p>
              <div className="flex flex-col sm:flex-row justify-start gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0, 0, 102, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-navy text-white px-10 py-5 rounded-[24px] text-lg font-black transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  Start Your Journey
                  <ChevronRight size={20} />
                </motion.button>
                <motion.a 
                  whileHover={{ backgroundColor: "white", scale: 1.05 }}
                  href="#courses"
                  className="bg-white/50 backdrop-blur-sm border-2 border-brand-navy/20 text-brand-navy px-10 py-5 rounded-[24px] text-lg font-black transition-all flex items-center justify-center"
                >
                  Explore Courses
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring" }}
              className="hidden lg:block relative"
            >
              <div className="relative animate-float">
                <div className="absolute -inset-8 bg-brand-navy/20 rounded-[60px] blur-3xl"></div>
                <img 
                  src="https://picsum.photos/seed/happy-robot-learning/800/800" 
                  alt="Happy Robot Learning" 
                  referrerPolicy="no-referrer"
                  className="relative rounded-[60px] shadow-2xl border-8 border-white transform hover:scale-105 transition-transform duration-500"
                />
                
                {/* Playful Overlays */}
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-12 -right-12 bg-brand-red p-6 rounded-3xl shadow-2xl border-4 border-white text-white"
                >
                  <Star size={40} fill="white" />
                </motion.div>
                
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-8 -left-8 bg-white p-5 rounded-3xl shadow-xl border-2 border-soft-blue flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-white">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-brand-navy font-black text-sm">Super Student</p>
                    <p className="text-slate-500 text-xs">Badge Earned!</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Playful blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-soft-amber rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-soft-rose rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-brand-navy mb-4 font-serif">Our Super Powers ⚡</h2>
            <p className="text-slate-500 font-bold">What you'll learn at Huemax Academy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Literacy",
                desc: "Learn how robots think and how they can help you do amazing things!",
                icon: <Cpu className="text-brand-navy w-12 h-12" />,
                color: "bg-soft-blue",
                borderColor: "border-brand-navy/20"
              },
              {
                title: "Prompt Engineering",
                desc: "Become a Robot Whisperer! Learn the secret language to talk to AI.",
                icon: <BookOpen className="text-brand-red w-12 h-12" />,
                color: "bg-soft-amber",
                borderColor: "border-brand-red/20"
              },
              {
                title: "Employable Skills",
                desc: "Turn your new skills into real-world success and start your own journey!",
                icon: <Briefcase className="text-brand-navy w-12 h-12" />,
                color: "bg-soft-blue",
                borderColor: "border-brand-navy/20"
              }
            ].map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.05,
                }}
                className={`${pillar.color} p-10 rounded-[40px] border-4 ${pillar.borderColor} transition-all shadow-xl hover:shadow-2xl`}
              >
                <div className="mb-8 bg-white w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg animate-bounce-slow">
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-black text-brand-navy mb-4 font-serif">{pillar.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course & Pricing Section */}
      <section id="courses" className="py-24 bg-soft-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-black text-brand-navy mb-6 font-serif">Your Learning Journey 🌈</h2>
              <p className="text-xl text-slate-600 mb-8 font-medium">
                Join our professional weekend program! It's designed to fit perfectly into your life while giving you amazing new skills.
              </p>
              
              <ul className="space-y-5 mb-10">
                {[
                  "Live Virtual Classes",
                  "Professional Certification",
                  "Real-world Projects",
                  "Alumni Community Access",
                  "Career Mentorship"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-brand-navy rounded-full flex items-center justify-center text-white shadow-md">
                      <Check size={18} strokeWidth={4} />
                    </div>
                    <span className="text-slate-700 font-bold text-lg">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-white p-8 rounded-[32px] shadow-xl border-t-8 border-brand-red">
                <h4 className="font-black text-brand-navy text-xl mb-3">Class Times:</h4>
                <p className="text-slate-600 font-bold text-lg">Every Saturday & Sunday</p>
                <p className="text-brand-red font-black text-2xl">10:00 AM - 2:00 PM</p>
              </div>
            </div>

            <div className="lg:w-1/2 w-full max-w-md">
              <motion.div 
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-brand-navy rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden border-8 border-white"
              >
                <div className="absolute top-0 right-0 bg-brand-red text-white px-8 py-3 rounded-bl-3xl font-black shadow-lg animate-pulse">
                  BEST VALUE!
                </div>
                <h3 className="text-3xl font-black mb-6 font-serif">Professional Pass</h3>
                <div className="flex items-baseline mb-10">
                  <span className="text-6xl font-black text-brand-red">₦15,000</span>
                  <span className="text-slate-400 ml-2 font-bold">/ month</span>
                </div>
                
                <div className="space-y-5 mb-12">
                  {[
                    "Everything Included!",
                    "Weekly Intensive Tasks",
                    "Direct Mentor Support"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <Check className="text-brand-red" size={20} strokeWidth={3} />
                      </div>
                      <span className="text-lg font-bold">{text}</span>
                    </div>
                  ))}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "#FF0000" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-brand-red text-white py-5 rounded-3xl font-black text-xl transition-all shadow-xl"
                >
                  Join Now! 🚀
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex flex-col md:flex-row justify-around items-center gap-16">
            {[
              { icon: <Users size={64} />, count: "400+", label: "Trained Students" },
              { icon: <Award size={64} />, count: "100%", label: "Certification Rate" },
              { icon: <Star size={64} />, count: "4.9/5", label: "Student Rating" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 5 : -5 }}
                className="text-white"
              >
                <div className="flex justify-center mb-6 drop-shadow-lg">{stat.icon}</div>
                <div className="text-7xl font-black mb-2 tracking-tighter drop-shadow-md">{stat.count}</div>
                <div className="text-2xl font-black uppercase tracking-widest opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-brand-navy mb-4 font-serif">Success Stories 💬</h2>
            <p className="text-slate-500 font-bold">Hear from our professional alumni</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: "Chidi Okafor",
                role: "AI Consultant",
                text: "The prompt engineering techniques I learned at Huemax have completely transformed my workflow. I'm now much more efficient and productive.",
                stars: 5,
                color: "bg-soft-blue",
                iconColor: "text-brand-navy"
              },
              {
                name: "Aisha Bello",
                role: "Digital Strategist",
                text: "As a creative, I was skeptical about AI, but Huemax showed me how to use it as a powerful tool for innovation. The classes are top-notch.",
                stars: 5,
                color: "bg-soft-rose",
                iconColor: "text-brand-red"
              },
              {
                name: "Samuel Etim",
                role: "Freelance Specialist",
                text: "The monetization strategies shared in the course helped me land my first high-paying international gig on Upwork. Highly recommended!",
                stars: 5,
                color: "bg-soft-indigo",
                iconColor: "text-brand-navy"
              }
            ].map((testimonial, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className={`${testimonial.color} p-10 rounded-[40px] shadow-lg border-4 border-white relative`}
              >
                <div className="flex text-brand-red mb-6">
                  {[...Array(testimonial.stars)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
                </div>
                <p className="text-slate-700 font-bold text-lg italic mb-8 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 ${testimonial.iconColor} bg-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-md`}>
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-brand-navy text-xl">{testimonial.name}</h4>
                    <p className="text-slate-500 font-bold">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-brand-navy text-white relative overflow-hidden">
        {/* Animated Background for Contact */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/4 w-full h-full border-[1px] border-white/30 rounded-full"
          ></motion.div>
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/4 w-full h-full border-[1px] border-brand-red/20 rounded-full"
          ></motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.h2 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-black mb-6 font-serif"
              >
                Get in <span className="text-brand-red">Touch</span> 👋
              </motion.h2>
              <p className="text-slate-400 mb-10 text-xl font-bold leading-relaxed">
                Have questions about our curriculum or enrollment? Reach out to us today.
              </p>

              <div className="space-y-8">
                {[
                  { icon: <Phone size={28} />, label: "Call Us", value: "09162870191", color: "bg-brand-red" },
                  { icon: <Mail size={28} />, label: "Email Us", value: "huemaxintegrated@gmail.com", color: "bg-brand-red" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10, scale: 1.05 }}
                    className="flex items-center gap-6 group cursor-pointer"
                  >
                    <div className={`w-16 h-16 ${item.color} rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-all duration-300`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 uppercase tracking-widest font-black">{item.label}</p>
                      <p className="text-2xl font-black">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md p-10 md:p-14 rounded-[50px] border-4 border-white/10 shadow-2xl"
            >
              <form onSubmit={handleContactSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-black mb-3 text-brand-red uppercase tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white/5 border-2 border-white/10 px-6 py-5 rounded-3xl focus:border-brand-red focus:ring-4 focus:ring-brand-red/20 outline-none transition-all text-white placeholder:text-slate-500 font-bold"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black mb-3 text-brand-red uppercase tracking-wider">Your Email</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-white/5 border-2 border-white/10 px-6 py-5 rounded-3xl focus:border-brand-red focus:ring-4 focus:ring-brand-red/20 outline-none transition-all text-white placeholder:text-slate-500 font-bold"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black mb-3 text-brand-red uppercase tracking-wider">Your Message</label>
                  <textarea 
                    rows={4}
                    required
                    className="w-full bg-white/5 border-2 border-white/10 px-6 py-5 rounded-3xl focus:border-brand-red focus:ring-4 focus:ring-brand-red/20 outline-none transition-all text-white placeholder:text-slate-500 font-bold"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "#FF0000" }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-brand-red text-white py-6 rounded-3xl font-black text-2xl transition-all shadow-xl"
                >
                  Send Message 🚀
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white text-slate-500 border-t-8 border-soft-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10 flex flex-col items-center">
            <Logo className="mb-4" showTagline={true} />
          </div>
          <p className="mb-6 font-bold text-lg">&copy; {new Date().getFullYear()} Huemax Academy. Nurturing Future Leaders.</p>
          <div className="w-24 h-2 bg-brand-red/20 mx-auto rounded-full mb-6"></div>
          <p className="text-sm font-black uppercase tracking-widest">
            Built with ❤️ by <span className="text-brand-navy">Huemax Integrated Solutions</span>
          </p>
        </div>
      </footer>

      {/* Chatbot Floating Button & Window */}
      <div className="fixed bottom-8 right-8 z-[60]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white w-[350px] md:w-[400px] h-[550px] rounded-[40px] shadow-2xl overflow-hidden flex flex-col mb-6 border-4 border-brand-navy/10"
            >
              {/* Chat Header */}
              <div className="bg-brand-navy p-6 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-navy shadow-lg">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg font-serif">Huemax Bot</h4>
                    <p className="text-xs font-bold text-white/80">Ready to help! ✨</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/20 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-soft-blue/30">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl font-bold text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-brand-navy text-white rounded-tr-none' 
                        : 'bg-white text-brand-navy rounded-tl-none border-2 border-soft-blue'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border-2 border-soft-blue flex items-center gap-3">
                      <div className="flex gap-1">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-brand-red rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-brand-red rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-brand-red rounded-full" />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t-4 border-soft-blue flex gap-3">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="How can I help you today?"
                  className="flex-1 px-6 py-4 rounded-2xl bg-soft-blue/50 text-brand-navy font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-navy/20 placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={isTyping || !chatInput.trim()}
                  className="w-14 h-14 bg-brand-navy text-white rounded-2xl flex items-center justify-center hover:scale-110 disabled:opacity-50 transition-all shadow-lg"
                >
                  <Send size={24} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-20 h-20 bg-brand-navy text-white rounded-[28px] shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 group border-4 border-white"
        >
          {isChatOpen ? <X size={40} /> : <MessageSquare size={40} className="group-hover:rotate-12 transition-transform" />}
        </button>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-navy/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[50px] shadow-2xl overflow-hidden border-8 border-soft-blue"
            >
              <div className="bg-brand-navy p-10 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black font-serif">Enroll Now 🚀</h3>
                  <p className="text-white/80 text-sm font-black uppercase tracking-widest">Huemax Academy • Future Leader</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="relative z-10 p-3 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="p-10">
                <AnimatePresence mode="wait">
                  {paymentStep === 'form' && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex justify-between items-center mb-10 pb-8 border-b-4 border-soft-blue">
                        <span className="text-slate-400 font-black uppercase tracking-widest text-sm">Professional Pass:</span>
                        <span className="text-4xl font-black text-brand-navy">₦15,000</span>
                      </div>

                      <form onSubmit={handlePaymentSubmit} className="space-y-8">
                        <div>
                          <label className="block text-sm font-black text-brand-navy mb-3 uppercase tracking-wider">Full Name</label>
                          <input 
                            type="text" 
                            value={paymentForm.fullName}
                            onChange={(e) => setPaymentForm({...paymentForm, fullName: e.target.value})}
                            className={`w-full px-6 py-4 rounded-2xl border-4 ${paymentErrors.fullName ? 'border-brand-red' : 'border-soft-blue'} focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/20 outline-none transition-all font-bold text-brand-navy placeholder:text-slate-300`}
                            placeholder="First and Last Name"
                          />
                          {paymentErrors.fullName && <p className="text-brand-red text-xs font-black mt-2 uppercase tracking-wider">{paymentErrors.fullName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-black text-brand-navy mb-3 uppercase tracking-wider">Email Address</label>
                          <input 
                            type="email" 
                            value={paymentForm.email}
                            onChange={(e) => setPaymentForm({...paymentForm, email: e.target.value})}
                            className={`w-full px-6 py-4 rounded-2xl border-4 ${paymentErrors.email ? 'border-brand-red' : 'border-soft-blue'} focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/20 outline-none transition-all font-bold text-brand-navy placeholder:text-slate-300`}
                            placeholder="email@example.com"
                          />
                          {paymentErrors.email && <p className="text-brand-red text-xs font-black mt-2 uppercase tracking-wider">{paymentErrors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-black text-brand-navy mb-3 uppercase tracking-wider">Phone Number (Optional)</label>
                          <input 
                            type="tel" 
                            value={paymentForm.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setPaymentForm({...paymentForm, phone: val});
                            }}
                            className={`w-full px-6 py-4 rounded-2xl border-4 ${paymentErrors.phone ? 'border-brand-red' : 'border-soft-blue'} focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/20 outline-none transition-all font-bold text-brand-navy placeholder:text-slate-300`}
                            placeholder="Digits only please!"
                          />
                          {paymentErrors.phone && <p className="text-brand-red text-xs font-black mt-2 uppercase tracking-wider">{paymentErrors.phone}</p>}
                        </div>

                        <div className="p-5 bg-soft-blue/30 rounded-3xl border-2 border-soft-blue">
                          <p className="text-[10px] text-brand-navy font-black uppercase tracking-widest mb-2">Payment Method:</p>
                          <p className="text-sm text-brand-navy font-black flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white">
                              <Briefcase size={16} />
                            </div>
                            Bank Transfer
                          </p>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-brand-navy text-white py-6 rounded-3xl font-black text-2xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                        >
                          Next Step
                          <ChevronRight size={28} />
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {paymentStep === 'transfer' && (
                    <motion.div
                      key="transfer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm mb-2">Send exactly:</p>
                        <h4 className="text-5xl font-black text-brand-navy">₦15,000</h4>
                      </div>

                      <div className="bg-soft-blue/20 rounded-[40px] p-8 border-4 border-soft-blue space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Account Number</span>
                          <span className="text-brand-navy font-black text-2xl tracking-tighter">6539516562</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Bank Name</span>
                          <span className="text-brand-red font-black text-2xl">Opay</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400 font-black uppercase tracking-widest text-xs mb-1">Account Name</span>
                          <span className="text-brand-navy font-black text-lg text-right leading-tight">Huemax Integrated Solutions</span>
                        </div>
                      </div>

                      <div className="p-6 bg-brand-red/10 rounded-3xl border-2 border-brand-red/20">
                        <p className="text-sm text-brand-red font-bold leading-relaxed text-center">
                          ✨ <strong>Almost there!</strong> After sending the money, click the button below to confirm your payment.
                        </p>
                      </div>

                      <button 
                        onClick={handleConfirmTransfer}
                        className="w-full bg-brand-navy text-white py-6 rounded-3xl font-black text-2xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        I've Paid! 🚀
                        <Check size={28} />
                      </button>
                      
                      <button 
                        onClick={() => setPaymentStep('form')}
                        className="w-full text-slate-400 font-black uppercase tracking-widest text-sm py-2 hover:text-brand-navy transition-colors"
                      >
                        Go back
                      </button>
                    </motion.div>
                  )}

                  {paymentStep === 'receipt' && (
                    <motion.div
                      key="receipt"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8"
                    >
                      <div className="bg-white border-4 border-dashed border-soft-blue rounded-[40px] p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                          <Award size={120} />
                        </div>
                        
                        <div className="text-center mb-10">
                          <div className="w-20 h-20 bg-brand-navy rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce-slow">
                            <Check className="text-white" size={40} />
                          </div>
                          <h4 className="text-3xl font-black text-brand-navy font-serif">Payment Receipt 🏆</h4>
                          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Huemax Academy Alumni</p>
                        </div>

                        <div className="space-y-5 border-t-4 border-soft-blue/30 pt-8">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-black uppercase tracking-widest">ID:</span>
                            <span className="text-brand-navy font-mono font-black">{receiptId}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-black uppercase tracking-widest">Student:</span>
                            <span className="text-brand-navy font-black">{paymentForm.fullName}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-black uppercase tracking-widest">Amount:</span>
                            <span className="text-brand-red font-black">₦15,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-black uppercase tracking-widest">Date:</span>
                            <span className="text-brand-navy font-black">{new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-black uppercase tracking-widest text-sm">Status:</span>
                            <span className="bg-brand-navy text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">Verified! ✨</span>
                          </div>
                        </div>

                        <div className="mt-10 pt-8 border-t-4 border-soft-blue/30 text-center">
                          <p className="text-xs font-bold text-slate-400">Welcome to the future of work! See you in class! 🌈</p>
                        </div>
                      </div>

                      <button 
                        onClick={handleCompletePayment}
                        className="w-full bg-brand-navy text-white py-6 rounded-3xl font-black text-2xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        Finish & Confirm 👋
                        <MessageSquare size={28} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
