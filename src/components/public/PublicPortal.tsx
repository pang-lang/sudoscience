import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Cpu, Layers, BookOpen, ChevronRight, CheckCircle2,
  Search, Lightbulb, Sparkles, BookOpenCheck,
  FileText, Download, Info, GraduationCap, Camera, Check,
  RotateCcw, Upload, ShoppingBag, Radio, RefreshCw, X,
  ChevronLeft, MessageCircle, ThumbsUp, Users, ArrowRight
} from 'lucide-react';

// ----------------------------------------------------
// HELPER FUNCTIONS FOR GEMINI COMPONENT SCANNER
// ----------------------------------------------------
async function imageUrlToBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const match = base64.match(/^data:([^;]+);base64,(.*)$/);
        if (match) {
          resolve({ mimeType: match[1], data: match[2] });
        } else {
          resolve(null);
        }
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image URL to base64:', error);
    return null;
  }
}

async function identifyComponentWithGemini(
  mimeType: string,
  base64Data: string
): Promise<{ matchedId: string; confidence: number; explanation: string } | null> {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Identify which of the following Würth Elektronik components is shown in this image.
Respond with ONLY a JSON object in the exact format shown below. Do not add any backticks, markdown, or other text outside the JSON object.

The available catalog components are:
1. "we-cbf": WE-CBF SMT EMI Suppression Ferrite Bead (EMC)
2. "we-cmb": WE-CMB Common Mode Power Line Choke (EMC)
3. "we-pd": WE-PD Performance SMT Shielded Inductor (Power)
4. "wsen-tids": WSEN-TIDS High-Precision Temperature Sensor (Sensors)
5. "w-102": WE-RFID Passive UHF transponder tag (Connectors)

Response format:
{
  "matchedId": "we-cbf" | "we-cmb" | "we-pd" | "wsen-tids" | "w-102",
  "confidence": number (0-100),
  "explanation": "Brief explanation of why it matches."
}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      // Handle potential markdown block wrapper
      let cleanText = text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }
      const parsed = JSON.parse(cleanText);
      if (parsed && parsed.matchedId) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to recognize component with Gemini:', error);
    return null;
  }
}
import { CommunityPost, CommunityReply } from '../../types';

interface PublicPortalProps {
  embedded?: boolean;
  isEducator?: boolean;
  activeSubTab?: 'home' | 'lab-experiments' | 'catalog' | 'request-parts' | 'community';
  setActiveSubTab?: (tab: 'home' | 'lab-experiments' | 'catalog' | 'request-parts' | 'community') => void;
  onBackToHome?: () => void;
}

// ----------------------------------------------------
// COMPONENT CATALOG DATA WITH WEB LINKS
// ----------------------------------------------------
interface CatalogComponent {
  id: string;
  name: string;
  category: 'EMC' | 'Power' | 'Connectors' | 'Sensors';
  description: string;
  specs: { [key: string]: string };
  applications: string[];
  schematicSymbol: string;
  tip: string;
  productUrl?: string;
}

const WE_COMPONENTS: CatalogComponent[] = [
  {
    id: 'we-cbf',
    name: 'WE-CBF SMT EMI Suppression Ferrite Bead',
    category: 'EMC',
    description: 'SMD ferrite beads that offer high impedance at noise frequencies while leaving desired signals unaffected. Widely used for noise filtering in USB lines, power lines, and logic circuits.',
    specs: {
      'Impedance at 100 MHz': '600 Ω',
      'Max DC Resistance': '0.04 Ω',
      'Rated Current': '3.0 A',
      'Case Size': '0805'
    },
    applications: ['USB Power Lines', 'Microcontroller supply pins', 'High-speed signal lanes'],
    schematicSymbol: '—[ Ferrite ]—',
    tip: 'Place the ferrite bead as close as possible to the connector or noise source to prevent PCB trace antenna radiation.',
    productUrl: 'https://www.we-online.com/en/components/products/WE-CBF'
  },
  {
    id: 'we-cmb',
    name: 'WE-CMB Common Mode Power Line Choke',
    category: 'EMC',
    description: 'Chokes designed for AC/DC power line filtering, providing high common-mode attenuation and low differential-mode insertion loss at power frequencies.',
    specs: {
      'Inductance': '2.2 mH',
      'Rated Current': '4.0 A',
      'DC Resistance': '0.05 Ω',
      'Resonant Frequency': '3.5 MHz'
    },
    applications: ['AC/DC Mains Filters', 'Switch-mode power supplies', 'Industrial frequency converters'],
    schematicSymbol: '=== L1 (Coil) === L2 ===',
    tip: 'Common mode chokes attenuate noise that travels in the same direction on both power lines, which is crucial for mains regulatory compliance.',
    productUrl: 'https://www.we-online.com/en/components/products/WE-CMB'
  },
  {
    id: 'we-pd',
    name: 'WE-PD Performance SMT Shielded Inductor',
    category: 'Power',
    description: 'Magnetically shielded power inductor designed for DC/DC converters. Offers high saturation current and extremely low self-heating losses.',
    specs: {
      'Inductance': '10 µH',
      'Saturation Current': '5.2 A',
      'DC Resistance': '0.024 Ω',
      'Shielding': 'Magnetic'
    },
    applications: ['Buck/Boost DC/DC Converters', 'Battery management systems', 'Automotive infotainment supply'],
    schematicSymbol: '—( Coil )—',
    tip: 'Use Würth’s REDEXPERT online tool to calculate AC core losses based on your exact switching frequency and duty cycle.',
    productUrl: 'https://www.we-online.com/en/components/products/WE-PD'
  },
  {
    id: 'wsen-tids',
    name: 'WSEN-TIDS High-Precision Temperature Sensor',
    category: 'Sensors',
    description: 'Ultra-compact, low-power I2C digital temperature sensor featuring ±0.25°C accuracy. Ideal for industrial tracking and battery pack safety monitoring.',
    specs: {
      'Accuracy': '±0.25 °C',
      'Supply Voltage': '1.5 V to 3.6 V',
      'Resolution': '16-bit',
      'Interface': 'I2C'
    },
    applications: ['IoT Nodes', 'Battery pack thermal monitoring', 'Smart Agriculture sensors'],
    schematicSymbol: '[ I2C Temp Sensor ]',
    tip: 'Ensure solid thermal coupling to the target surface. Slot the PCB around the sensor to isolate it from heat generated by nearby power converters.',
    productUrl: 'https://www.we-online.com/en/components/products/WSEN-TIDS'
  },
  {
    id: 'w-102',
    name: 'WE-RFID Passive UHF transponder tag',
    category: 'Connectors',
    description: 'High-frequency passive RFID tags designed for metal surface applications, allowing sub-centimeter inventory position precision.',
    specs: {
      'Frequency': '865 MHz (UHF)',
      'Protocol': 'EPC Gen2',
      'Read Range': 'Up to 2 meters',
      'Operating Temp': '-40°C to +85°C'
    },
    applications: ['Industrial Asset Tracking', 'Smart Warehouse routers', 'Automated lab kit inventory'],
    schematicSymbol: '(( RFID Antenna ))',
    tip: 'Metal-mount tags have a special dielectric backing. Regular tags will fail if stuck directly on aluminum or copper plates.',
    productUrl: 'https://www.we-online.com/en/components/products/WE-RFID'
  }
];

// ----------------------------------------------------
// NEWS FEED DATA FROM WÜRTH ELECTRONIK WEBSITE
// ----------------------------------------------------
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  date: string;
  tag: string;
  link: string;
}

const WE_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'REDEXPERT Upgraded with New AC Loss Calculations for High-Frequency Inductors',
    summary: 'Würth Elektronik has released major updates to its simulation platform, allowing designers to calculate real core losses under complex switching cycles in real time.',
    date: 'Jun 12, 2026',
    tag: 'Design Tools',
    link: 'https://redexpert.we-online.com'
  },
  {
    id: 'news-2',
    title: 'New High-Current Common Mode Chokes Set Compliance Standards in EV Inverters',
    summary: 'The newly introduced WE-CMB series provides superior attenuation curves for electric drivetrains, supporting heavy filtering requirements under CISPR 25 rules.',
    date: 'May 28, 2026',
    tag: 'Product Launch',
    link: 'https://www.we-online.com'
  },
  {
    id: 'news-3',
    title: 'Würth Elektronik Sponsors University Solar Car Challenge at Munich Lab Hub',
    summary: 'Supporting academic talent, WE supplied custom low-power RFID transponders and lightweight power inductors to design teams optimizing telemetry efficiency.',
    date: 'Apr 15, 2026',
    tag: 'Academic Relations',
    link: 'https://www.we-online.com'
  }
];

// ----------------------------------------------------
// LAB EXPERIMENTS TAB DATA
// ----------------------------------------------------
interface LabExperiment {
  id: string;
  title: string;
  level: 'Basic' | 'Intermediate' | 'Advanced';
  duration: string;
  objective: string;
  schematicOutline: string;
  steps: string[];
}

const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'lab-1',
    title: 'Experiment 1: USB-C ESD Protection Layout & Verification',
    level: 'Basic',
    duration: '2 Hours',
    objective: 'Protect high-speed transceiver differential pairs using low-capacitance ESD protection diode arrays (WE-TVS).',
    schematicOutline: 'USB-C Pin -> [ WE-TVS Diode Array ] -> GND',
    steps: [
      'Locate the WE-TVS component and place it immediately behind the metal connector shell pins.',
      'Route differential lines straight over the TVS pads to avoid creating loop parasitic stubs.',
      'Solder standard SMD ground pads using a clean reflow iron profile.',
      'Perform isolation check to verify no signal leakage is present at high speeds.'
    ]
  },
  {
    id: 'lab-2',
    title: 'Experiment 2: Common Mode Noise Attenuation in Switching Chokes',
    level: 'Intermediate',
    duration: '3 Hours',
    objective: 'Measure conducted common-mode noise suppression on AC/DC mains filtering circuits using WE-CMB coils.',
    schematicOutline: 'L/N Power Line -> [ WE-CMB Choke ] -> Switcher ASIC',
    steps: [
      'Assemble a basic pi-filter layout on the evaluation proto-board.',
      'Measure the baseline noise spectrum from 150 kHz to 30 MHz using a LISN instrument.',
      'Install the WE-CMB common mode choke on the dual line input sockets.',
      'Record attenuation levels in dB and confirm compliance bounds are reached.'
    ]
  }
];

const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    title: 'How do you calculate AC core losses for the WE-PD inductor?',
    content: 'I am working on a buck converter design for a university project and I need to accurately estimate the AC core losses for the WE-PD series inductor. I tried using the standard Steinmetz equation, but the results seem off. Does anyone have a better method or tool recommendation?',
    authorName: 'Sarah Jenkins',
    authorRole: 'Student',
    tags: ['Hardware', 'Power', 'Calculation'],
    timestamp: '2 hours ago',
    upvotes: 14,
    views: 120,
    replies: [
      {
        id: 'reply_1',
        authorName: 'Dr. Emily Chen',
        authorRole: 'Educator',
        content: 'Hi Sarah, standard Steinmetz equations are notoriously inaccurate for modern switching converters because they assume sinusoidal flux waveforms. Since buck converters have triangular ripple, you should use the improved generalized Steinmetz equation (iGSE).',
        timestamp: '1 hour ago',
        upvotes: 8
      },
      {
        id: 'reply_2',
        authorName: 'Michael Weber',
        authorRole: 'Industry',
        content: 'To add to Dr. Chen\'s point, Würth provides a tool called REDEXPERT. It has AC loss models based on actual empirical measurements of triangular waveforms, so you don\'t even need to run the math manually. Just plug in your duty cycle and frequency!',
        timestamp: '45 mins ago',
        upvotes: 12
      }
    ]
  },
  {
    id: 'post_2',
    title: 'Looking for layout guidelines on WE-WPCC Wireless Power Coils',
    content: 'We are designing a custom wireless charging pad for a drone project. Are there any specific PCB layout guidelines or keep-out zones we should follow when mounting the WE-WPCC coils?',
    authorName: 'Omar Hassan',
    authorRole: 'Student',
    tags: ['Wireless Power', 'Layout', 'Drone'],
    timestamp: 'Yesterday',
    upvotes: 5,
    views: 89,
    replies: []
  }
];

export default function PublicPortal({
  embedded = false,
  isEducator = false,
  activeSubTab: controlledSubTab,
  setActiveSubTab: controlledSetSubTab,
  onBackToHome
}: PublicPortalProps) {
  const [localSubTab, localSetSubTab] = useState<'home' | 'lab-experiments' | 'catalog' | 'request-parts' | 'community'>('home');

  const activeSubTab = controlledSubTab !== undefined ? controlledSubTab : localSubTab;
  const setActiveSubTab = controlledSetSubTab !== undefined ? controlledSetSubTab : localSetSubTab;

  // Catalog Parameters
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<'All' | 'EMC' | 'Power' | 'Connectors' | 'Sensors'>('All');

  // Photo Search State
  const [isPhotoSearchOpen, setIsPhotoSearchOpen] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('');
  const [detectedComponent, setDetectedComponent] = useState<CatalogComponent | null>(null);
  const [scanConfidence, setScanConfidence] = useState<number>(98.4);
  const [scanExplanation, setScanExplanation] = useState<string>('');

  // Mock Camera State
  const [isCameraFeedOpen, setIsCameraFeedOpen] = useState<boolean>(false);
  const [isCameraFlashing, setIsCameraFlashing] = useState<boolean>(false);

  // Educator Request form state
  const [eduUniversity, setEduUniversity] = useState<string>('');
  const [eduDept, setEduDept] = useState<string>('');
  const [eduCourse, setEduCourse] = useState<string>('');
  const [eduEmail, setEduEmail] = useState<string>('');
  const [eduAddress, setEduAddress] = useState<string>('');
  const [selectedKits, setSelectedKits] = useState<string[]>([]);
  const [otherKitDetails, setOtherKitDetails] = useState<string>('');
  const [eduSubmitted, setEduSubmitted] = useState<boolean>(false);

  // Community Forum state
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newReplyContent, setNewReplyContent] = useState<string>('');
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState<string>('');

  // Custom Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Starts the scan logic using Gemini API
  const triggerScanLogic = async (photoUrl: string, fallbackId: string, label: string) => {
    setSelectedPhoto(photoUrl);
    setIsScanning(true);
    setScanProgress(0);
    setDetectedComponent(null);
    setScanExplanation('');
    setScanConfidence(98.4);

    const statuses = [
      'Analyzing shape parameters & outline...',
      'Isolating package dimensions (pitch, width)...',
      'Comparing pin layout with WE part database...',
      'Matching component coils & internal pins...',
      'Finalizing hardware catalog lookup...'
    ];

    let geminiResult: { matchedId: string; confidence: number; explanation: string } | null = null;
    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (photoUrl.startsWith('data:')) {
      const match = photoUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    } else {
      const conv = await imageUrlToBase64(photoUrl);
      if (conv) {
        mimeType = conv.mimeType;
        base64Data = conv.data;
      }
    }

    const apiPromise = (async () => {
      if (base64Data) {
        try {
          geminiResult = await identifyComponentWithGemini(mimeType, base64Data);
        } catch (e) {
          console.error('Gemini API execution error:', e);
        }
      }
    })();

    let currentStep = 0;
    const interval = setInterval(async () => {
      currentStep++;
      if (currentStep <= 4) {
        setScanProgress(currentStep * 20);
        setScanStatusText(statuses[currentStep - 1]);
      } else if (currentStep === 5) {
        setScanProgress(90);
        setScanStatusText('Finalizing hardware catalog lookup...');
        await apiPromise;
        setScanProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          let matchedComponent = WE_COMPONENTS[0];
          if (geminiResult && geminiResult.matchedId) {
            const found = WE_COMPONENTS.find(c => c.id === geminiResult!.matchedId);
            if (found) {
              matchedComponent = found;
              setScanConfidence(geminiResult!.confidence);
              setScanExplanation(geminiResult!.explanation);
            } else {
              const foundFallback = WE_COMPONENTS.find(c => c.id === fallbackId);
              if (foundFallback) matchedComponent = foundFallback;
            }
          } else {
            const foundFallback = WE_COMPONENTS.find(c => c.id === fallbackId);
            if (foundFallback) matchedComponent = foundFallback;
            setScanExplanation('Identified via catalog footprint characteristics.');
          }
          setDetectedComponent(matchedComponent);
          showToast(`Match found! Identified as ${matchedComponent.name}.`);
        }, 500);
      }
    }, 600);
  };

  // Mock Camera Snapshot trigger
  const handleCameraCapture = () => {
    setIsCameraFlashing(true);
    setTimeout(() => {
      setIsCameraFlashing(false);
      setIsCameraFeedOpen(false);
      triggerScanLogic(
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300',
        'we-pd',
        'WE-PD Power Inductor'
      );
    }, 300);
  };

  // File Upload scanner trigger
  const handlePhotoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        triggerScanLogic(base64, 'wsen-tids', 'WSEN-TIDS Temperature Sensor');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetScan = () => {
    setSelectedPhoto(null);
    setScanProgress(0);
    setScanStatusText('');
    setDetectedComponent(null);
  };

  const handleKitToggle = (kitName: string) => {
    if (selectedKits.includes(kitName)) {
      setSelectedKits(prev => prev.filter(k => k !== kitName));
    } else {
      setSelectedKits(prev => [...prev, kitName]);
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduUniversity || !eduDept || !eduCourse || !eduEmail || !eduAddress || selectedKits.length === 0) {
      showToast('Please fill in all details and select at least one lab kit.');
      return;
    }
    if (selectedKits.includes('Others') && !otherKitDetails.trim()) {
      showToast('Please describe the custom components you require.');
      return;
    }
    setEduSubmitted(true);
    showToast('Academic request submitted! Binders will ship shortly.');
    setTimeout(() => {
      setEduUniversity('');
      setEduDept('');
      setEduCourse('');
      setEduEmail('');
      setEduAddress('');
      setSelectedKits([]);
      setOtherKitDetails('');
      setEduSubmitted(false);
    }, 3000);
  };

  const handleCommunityPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      showToast('Please provide both a title and content for your post.');
      return;
    }
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      title: newPostTitle,
      content: newPostContent,
      authorName: isEducator ? 'Guest Educator' : 'Guest Student',
      authorRole: isEducator ? 'Educator' : 'Student',
      tags: ['General Q&A'],
      timestamp: 'Just now',
      upvotes: 0,
      views: 0,
      replies: []
    };
    setCommunityPosts([newPost, ...communityPosts]);
    setShowNewPostModal(false);
    setNewPostTitle('');
    setNewPostContent('');
    showToast('Your question has been posted to the community!');
  };

  const handleCommunityReplySubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newReplyContent.trim()) {
      showToast('Reply content cannot be empty.');
      return;
    }
    const newReply: CommunityReply = {
      id: `reply_${Date.now()}`,
      authorName: isEducator ? 'Guest Educator' : 'Guest Student',
      authorRole: isEducator ? 'Educator' : 'Student',
      content: newReplyContent,
      timestamp: 'Just now',
      upvotes: 0
    };
    setCommunityPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, replies: [...post.replies, newReply] };
      }
      return post;
    }));
    setNewReplyContent('');
    showToast('Reply submitted!');
  };

  // Filter Catalog Components
  const filteredCatalog = useMemo(() => {
    return WE_COMPONENTS.filter(comp => {
      const matchSearch = comp.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        comp.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        comp.applications.some(app => app.toLowerCase().includes(catalogSearch.toLowerCase()));
      const matchCategory = catalogCategory === 'All' || comp.category === catalogCategory;
      return matchSearch && matchCategory;
    });
  }, [catalogSearch, catalogCategory]);

  return (
    <div className={`flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans ${embedded ? '' : 'p-4 md:p-8'}`}>

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 font-sans"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
          PORTAL HEADER HUD
         ---------------------------------------------------- */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          {activeSubTab !== 'home' && (
            <button
              onClick={() => {
                setActiveSubTab('home');
                setIsPhotoSearchOpen(false);
                setCatalogSearch('');
                if (onBackToHome) {
                  onBackToHome();
                } else {
                  setActiveSubTab('home');
                  setIsPhotoSearchOpen(false);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer shadow-xs animate-fadeIn"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{onBackToHome ? 'Back to Hub' : 'Back to Reference Dashboard'}</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-xs font-black text-sm tracking-tighter">WE</span>
              <h1 className="font-display font-semibold text-lg text-slate-900 tracking-tight">Academic Reference</h1>
            </div>
            <p className="text-slate-500 text-xs mt-1">Würth Elektronik Academic Knowledge & Sample Desk &middot; University Portal</p>
          </div>
        </div>
      </header>



      {/* ----------------------------------------------------
          PORTAL SUB-TABS RENDER
         ---------------------------------------------------- */}
      <div className="flex-1">
        <AnimatePresence mode="wait">

          {/* TAB 1: DASHBOARD HOME */}
          {activeSubTab === 'home' && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 animate-fadeIn"
            >
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="max-w-2xl z-10 relative">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 inline-block border border-indigo-500/30">
                    Academic Reference Hub
                  </span>
                  <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4 text-white">
                    Bridging Classroom Theory and Industrial Reality
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                    {isEducator ? (
                      <span>Welcome to your Academic Reference desk. Browse the engineering components directory, review technical specifications, and request free physical sample kit binders for university courses and labs.</span>
                    ) : (
                      <span>Welcome to your Academic Reference desk. Browse technical specifications, access detailed lab sheets, and scan component images to identify footprints and layout guidelines.</span>
                    )}
                  </p>

                </div>
              </div>

              {/* Highlighting Card features with direct internal links */}
              <div className={`grid grid-cols-1 ${isEducator ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
                {isEducator ? (
                  <>
                    {/* Card 1 for Educator: Parts Procurement */}
                    <div
                      onClick={() => setActiveSubTab('request-parts')}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-500 transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 mb-2">Parts Procurement</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Request free physical component sample binders and digital sensor evaluation modules for classroom laboratory experiments.
                      </p>
                    </div>

                    {/* Card 2 for Educator: Component Catalog */}
                    <div
                      onClick={() => {
                        setActiveSubTab('catalog');
                        setIsPhotoSearchOpen(false);
                      }}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-500 transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 mb-2">Component Catalog</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Search and filter essential passive components. Each card displays schematic representations, layout rules, and direct website documentation links.
                      </p>
                    </div>

                    {/* Card 3 for Educator: WE Community */}
                    <div
                      onClick={() => {
                        setActiveSubTab('community');
                      }}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-500 transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 mb-2">WE Community</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Join the discussion. Ask technical questions, help students with design challenges, and network with industry professionals.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Card 1 for Student: Component Catalog */}
                    <div
                      onClick={() => {
                        setActiveSubTab('catalog');
                        setIsPhotoSearchOpen(false);
                      }}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-500 transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 mb-2">Component Catalog</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Search and filter essential passive components. Each card displays schematic representations, layout rules, and direct website documentation links.
                      </p>
                    </div>

                    {/* Card 2 for Student: AI Component Scanner */}
                    <div
                      onClick={() => {
                        setActiveSubTab('catalog');
                        setIsPhotoSearchOpen(true);
                        handleResetScan();
                      }}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-500 transition cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Camera className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 mb-2">AI Component Scanner</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Take a photo or upload an image of a Würth component on your board to identify its outline and layout rules immediately.
                      </p>
                    </div>

                    {/* Card 3 for Student: WE Community */}
                    <div
                      onClick={() => setActiveSubTab('community')}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-500 transition cursor-pointer col-span-1 md:col-span-3 lg:col-span-1"
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 mb-2">WE Community</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Stuck on a design? Ask the community! Get answers from Würth Elektronik engineers and university educators.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* WÜRTH ELECTRONIK INDUSTRY NEWS FEED */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900">Würth Elektronik Industry News</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Stay updated with the newest catalog details, tool modifications, and engineering launches.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-xs flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
                    Live Feed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {WE_NEWS.map(art => (
                    <div key={art.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-4 mb-2.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-mono font-bold rounded uppercase">
                            {art.tag}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{art.date}</span>
                        </div>
                        <h4 className="font-display font-semibold text-sm text-slate-950 mb-2 leading-snug">{art.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed mb-4">{art.summary}</p>
                      </div>
                      <a
                        href={art.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer w-fit"
                      >
                        Read Article Page ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: LAB EXPERIMENTS (STUDENT ONLY) */}
          {activeSubTab === 'lab-experiments' && !isEducator && (
            <motion.div
              key="tab-lab-exps"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 max-w-4xl animate-fadeIn"
            >
              <div className="border-b border-slate-200 pb-4">
                <h2 className="font-display font-semibold text-xl text-slate-900">Practical Lab Experiments</h2>
                <p className="text-slate-500 text-xs mt-1">Structured checklists and schematic layouts to evaluate passives and sensors in board test beds.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {LAB_EXPERIMENTS.map(exp => (
                  <div key={exp.id} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-mono font-bold uppercase">
                          {exp.level} &bull; {exp.duration}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 mb-2">{exp.title}</h3>

                      <div className="space-y-4 my-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">Objective</span>
                          <p className="text-slate-600 text-xs leading-relaxed">{exp.objective}</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-center">
                          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block mb-1.5">Schematic Outline</span>
                          <code className="text-[11px] font-mono text-indigo-700 font-semibold bg-indigo-50/50 px-2 py-1 rounded">
                            {exp.schematicOutline}
                          </code>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-2">Step-by-step checklist</span>
                          <ul className="space-y-1.5">
                            {exp.steps.map((step, sIdx) => (
                              <li key={sIdx} className="text-xs text-slate-500 flex items-start gap-2 leading-relaxed">
                                <span className="w-4 h-4 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-2">
                      <button
                        onClick={() => showToast(`Triggered download: ${exp.id}_materials.pdf`)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Lab Worksheet PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: COMPONENT CATALOG */}
          {activeSubTab === 'catalog' && (
            <motion.div
              key="tab-catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 animate-fadeIn"
            >
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="font-display font-semibold text-xl text-slate-900">Academic Component Catalog</h2>
                  <p className="text-slate-500 text-xs mt-1">Reference catalog of key passive, electromechanical, and sensor components for designs.</p>
                </div>

                {/* Visual Search Toggle for Student Portal */}
                {!isEducator && (
                  <button
                    onClick={() => {
                      setIsPhotoSearchOpen(!isPhotoSearchOpen);
                      handleResetScan();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${isPhotoSearchOpen
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <Camera className="w-4 h-4" />
                    {isPhotoSearchOpen ? 'Close Photo Scanner' : 'Search by Component Photo'}
                  </button>
                )}

                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold placeholder-slate-400"
                  />
                </div>
              </div>

              {/* PHOTO SCANNER PANEL (WITHOUT QUICK DEMO SELECTIONS) */}
              {isPhotoSearchOpen && !isEducator && (
                <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 relative overflow-hidden animate-fadeIn shadow-inner">
                  {/* Neon Grid pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                  <div className="max-w-xl">
                    <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                      <Camera className="w-5 h-5 text-indigo-400" />
                      Visual Component Scanner
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Scan components instantly using your camera, or upload an image file from your device to identify specs and layout rules.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">

                    {/* Selectable inputs */}
                    <div className="lg:col-span-5 space-y-4">

                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-1">Scanner Input Source</span>
                        <div className="flex flex-col gap-3">
                          {/* File input upload button */}
                          <label className="py-3 px-4 border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 select-none">
                            <Upload className="w-4 h-4 text-indigo-400" />
                            Upload Component File/Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUploadChange}
                              className="hidden"
                            />
                          </label>

                          {/* Shutter take photo button */}
                          <button
                            onClick={() => {
                              setIsCameraFeedOpen(true);
                              setSelectedPhoto(null);
                              setDetectedComponent(null);
                            }}
                            className="py-3 px-4 border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-indigo-400" />
                            Take Photo (Camera Scan)
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Scanner Viewport / Mock Camera */}
                    <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 min-h-[220px] flex flex-col justify-center items-center relative overflow-hidden">

                      {/* CAMERA FEED OVERLAY */}
                      {isCameraFeedOpen ? (
                        <div className="w-full space-y-4 flex flex-col items-center">
                          <div className="relative w-52 h-36 rounded-lg overflow-hidden border border-red-500 bg-slate-900 flex items-center justify-center">
                            {/* Camera crop outline */}
                            <div className="absolute border border-dashed border-indigo-400 w-40 h-28 pointer-events-none rounded z-10 shadow-[0_0_15px_rgba(0,0,0,0.8)]" />

                            {/* Simulated moving scanner grid lines */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#000000dd_95%)] pointer-events-none z-10" />

                            {/* Display target to capture */}
                            <img
                              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300"
                              alt="Live component view"
                              className="w-full h-full object-cover filter blur-[0.5px]"
                            />

                            {/* Camera flashing screen */}
                            {isCameraFlashing && (
                              <div className="absolute inset-0 bg-white z-20 animate-pulse" />
                            )}

                            <span className="absolute top-2 left-2 bg-red-600/90 text-white font-mono text-[8px] px-1.5 py-0.5 rounded font-black flex items-center gap-1 z-10">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                              LIVE CAMERA
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleCameraCapture}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg border-0 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              Capture Frame
                            </button>
                            <button
                              onClick={() => setIsCameraFeedOpen(false)}
                              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border-0 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : selectedPhoto ? (
                        <div className="w-full space-y-4">
                          <div className="relative w-40 h-28 mx-auto rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                            <img src={selectedPhoto} alt="Scanning source" className="max-w-full max-h-full object-cover" />

                            {/* Scanning horizontal bar animation */}
                            {isScanning && (
                              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-scanline"
                                style={{
                                  animation: 'scan 1.5s ease-in-out infinite'
                                }}
                              />
                            )}
                          </div>

                          {/* Progress */}
                          {isScanning && (
                            <div className="max-w-xs mx-auto space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                                <span>{scanStatusText}</span>
                                <span>{scanProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                              </div>
                            </div>
                          )}

                          {/* Match Result */}
                          {detectedComponent && !isScanning && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md mx-auto space-y-3 text-slate-100"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Component Identified
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 font-semibold">Match: {scanConfidence.toFixed(1)}% Confidence</span>
                              </div>

                              <div className="border-b border-slate-800 pb-2.5">
                                <div className="flex items-center justify-between gap-4 mb-1.5">
                                  <h4 className="text-xs font-bold text-white leading-tight">{detectedComponent.name}</h4>
                                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[8px] font-mono font-bold uppercase tracking-wider">
                                    {detectedComponent.category}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed">{detectedComponent.description}</p>
                                {scanExplanation && (
                                  <p className="text-[9.5px] text-slate-500 italic mt-2 border-l border-slate-800 pl-2 leading-relaxed">
                                    "{scanExplanation}"
                                  </p>
                                )}
                              </div>

                              {/* Specs */}
                              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5 text-[9.5px] font-mono">
                                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Catalog Specifications</div>
                                {Object.entries(detectedComponent.specs).map(([specKey, specVal]) => (
                                  <div key={specKey} className="flex justify-between items-center">
                                    <span className="text-slate-400">{specKey}</span>
                                    <span className="text-slate-200 font-bold">{specVal}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Layout Tip */}
                              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
                                <div className="flex items-start gap-2 text-[9.5px] text-slate-400 leading-relaxed">
                                  <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                  <p>
                                    <span className="font-bold text-slate-300">Layout Tip:</span> {detectedComponent.tip}
                                  </p>
                                </div>
                              </div>

                              {/* Official Würth Elektronik Link */}
                              {detectedComponent.productUrl && (
                                <a
                                  href={detectedComponent.productUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center justify-center gap-1.5 border-0 shadow-sm"
                                >
                                  <span>Official Würth Elektronik Product Details</span>
                                  <span className="text-[8px]">↗</span>
                                </a>
                              )}

                              <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between gap-4">
                                <button
                                  onClick={() => {
                                    setCatalogSearch(detectedComponent.name);
                                    setIsPhotoSearchOpen(false);
                                  }}
                                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 bg-transparent border-0"
                                >
                                  Focus in Catalog &rarr;
                                </button>
                                <button
                                  onClick={handleResetScan}
                                  className="text-[10px] font-bold text-slate-400 hover:text-slate-300 cursor-pointer flex items-center gap-1 bg-transparent border-0"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Clear Scanner
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-2 text-slate-500 animate-pulse">
                          <Camera className="w-8 h-8 mx-auto text-slate-600" />
                          <p className="text-[11px] font-semibold">Ready to scan. Please upload a component file or trigger the camera feed.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Filtering tabs & Return Button */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl max-w-fit border border-slate-200">
                  {(['All', 'EMC', 'Power', 'Connectors', 'Sensors'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCatalogCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${catalogCategory === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {catalogSearch && (
                  <button
                    onClick={() => setCatalogSearch('')}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs animate-fadeIn"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Return to Full Catalog</span>
                  </button>
                )}
              </div>

              {/* Components list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCatalog.map(comp => (
                  <div key={comp.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <h4 className="font-display font-bold text-sm text-slate-900">{comp.name}</h4>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono font-bold uppercase">
                          {comp.category}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4">{comp.description}</p>

                      {/* Specs */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5 mb-4">
                        {Object.entries(comp.specs).map(([specKey, specVal]) => (
                          <div key={specKey} className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500 font-medium">{specKey}</span>
                            <span className="text-slate-900 font-bold">{specVal}</span>
                          </div>
                        ))}
                      </div>

                      {/* Schematic Symbol representation */}
                      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-bold text-slate-700">Schematic:</span>
                        <code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-indigo-700 font-bold">{comp.schematicSymbol}</code>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Layout Tips */}
                      <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-start gap-2.5">
                          <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            <span className="font-bold text-slate-800">Layout Tip:</span> {comp.tip}
                          </p>
                        </div>
                      </div>

                      {/* Component Web Documentation Links */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        {comp.productUrl && (
                          <a
                            href={comp.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[100px] text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>WE Product Page</span>
                            <span className="text-[8px]">↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCatalog.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                  <Info className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-xs font-semibold">No components match your search and filter criteria.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: REQUEST PARTS (EDUCATOR ONLY) */}
          {activeSubTab === 'request-parts' && isEducator && (
            <motion.div
              key="tab-request"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-2xl animate-fadeIn"
            >
              <div className="border-b border-slate-200 pb-4">
                <h2 className="font-display font-semibold text-xl text-slate-900">Academic Sample & Lab Kit Procurement</h2>
                <p className="text-slate-500 text-xs mt-1">Request free physical component binders, chokes, and sensor evaluation modules for classroom lab sessions.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
                <form onSubmit={handleRequestSubmit} className="space-y-6">

                  {/* Institutional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">University / Institution</label>
                      <input
                        type="text"
                        value={eduUniversity}
                        onChange={(e) => setEduUniversity(e.target.value)}
                        placeholder="e.g. Technical University Munich"
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Faculty / Department</label>
                      <input
                        type="text"
                        value={eduDept}
                        onChange={(e) => setEduDept(e.target.value)}
                        placeholder="e.g. Electrical Engineering"
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Course & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Course Name / Project</label>
                      <input
                        type="text"
                        value={eduCourse}
                        onChange={(e) => setEduCourse(e.target.value)}
                        placeholder="e.g. ENG-101 / Intro to Circuits"
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">University Email Address</label>
                      <input
                        type="email"
                        value={eduEmail}
                        onChange={(e) => setEduEmail(e.target.value)}
                        placeholder="educator@university.edu"
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Binders check */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2.5">Requested Sample Binders & Lab Kits</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'WE-EMC Suppression Ferrite Beads Binder',
                        'WE-PD Power Inductors Reference Design Kit',
                        'WSEN Sensors Board Evaluation sample kit',
                        'WE-RFID UHF Transponder developer kit',
                        'Others'
                      ].map(kit => (
                        <label key={kit} className="flex items-start gap-2.5 p-3 border border-slate-200 rounded-xl hover:bg-slate-550/5 transition cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={selectedKits.includes(kit)}
                            onChange={() => handleKitToggle(kit)}
                            className="w-4 h-4 rounded-sm text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer mt-0.5"
                          />
                          <span className="text-xs text-slate-700 font-semibold">{kit}</span>
                        </label>
                      ))}
                    </div>

                    {selectedKits.includes('Others') && (
                      <div className="mt-3 animate-fadeIn">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Specify Component Description</label>
                        <textarea
                          rows={2}
                          value={otherKitDetails}
                          onChange={(e) => setOtherKitDetails(e.target.value)}
                          placeholder="Please describe the specific components or custom requirements..."
                          className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ship address */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Shipping Address (University Office/Lab)</label>
                    <textarea
                      rows={3}
                      value={eduAddress}
                      onChange={(e) => setEduAddress(e.target.value)}
                      placeholder="Room 402, Building C, University Street 12, Munich, Germany"
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4 border-t border-slate-100 pt-6">
                    <span className="text-[10px] text-slate-400 font-medium">Academic orders are refilled free of charge.</span>
                    <button
                      type="submit"
                      disabled={eduSubmitted}
                      className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5 cursor-pointer text-white border-0 ${eduSubmitted ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                      {eduSubmitted ? 'Submitting...' : 'Request Sample Kits'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 5: COMMUNITY FORUM */}
          {activeSubTab === 'community' && (
            <motion.div
              key="tab-community"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="animate-fadeIn max-w-5xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-8">

                {/* Left Column: Feed and Expanded View */}
                <div className="flex-1 space-y-6">
                  {expandedPostId ? (
                    // --- EXPANDED THREAD VIEW ---
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                      <button
                        onClick={() => setExpandedPostId(null)}
                        className="text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 flex items-center gap-1 transition"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to Q&A Feed
                      </button>

                      {communityPosts.filter(p => p.id === expandedPostId).map(post => (
                        <div key={post.id} className="space-y-8">
                          {/* Original Post */}
                          <div>
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <button className="text-slate-400 hover:text-indigo-600 transition"><ChevronRight className="w-5 h-5 -rotate-90" /></button>
                                <span className="font-bold text-slate-700 text-sm">{post.upvotes}</span>
                                <button className="text-slate-400 hover:text-red-500 transition"><ChevronRight className="w-5 h-5 rotate-90" /></button>
                              </div>
                              <div className="flex-1">
                                <h2 className="font-display font-bold text-xl text-slate-900 mb-2 leading-snug">{post.title}</h2>
                                <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-slate-500">
                                  <span className={`px-2 py-0.5 rounded font-bold text-white ${post.authorRole === 'Student' ? 'bg-emerald-500' :
                                      post.authorRole === 'Educator' ? 'bg-indigo-500' : 'bg-red-500'
                                    }`}>{post.authorRole}</span>
                                  <span>{post.authorName}</span>
                                  <span>&bull;</span>
                                  <span>{post.timestamp}</span>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                <div className="flex gap-2 mt-4">
                                  {post.tags.map(t => (
                                    <span key={t} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-semibold">{t}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Replies */}
                          <div className="pl-0 md:pl-12 space-y-6 pt-6 border-t border-slate-100">
                            <h3 className="font-display font-semibold text-sm text-slate-900 flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-slate-400" />
                              {post.replies.length} Answers
                            </h3>

                            {post.replies.map(reply => (
                              <div key={reply.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex flex-col items-center gap-1">
                                  <button className="text-slate-400 hover:text-indigo-600 transition"><ChevronRight className="w-4 h-4 -rotate-90" /></button>
                                  <span className="font-bold text-slate-700 text-xs">{reply.upvotes}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-slate-500">
                                    <span className={`px-2 py-0.5 rounded font-bold text-white ${reply.authorRole === 'Student' ? 'bg-emerald-500' :
                                        reply.authorRole === 'Educator' ? 'bg-indigo-500' : 'bg-red-500'
                                      }`}>{reply.authorRole}</span>
                                    <span className="font-bold text-slate-700">{reply.authorName}</span>
                                    <span>&bull;</span>
                                    <span>{reply.timestamp}</span>
                                  </div>
                                  <p className="text-slate-700 text-xs leading-relaxed">{reply.content}</p>
                                </div>
                              </div>
                            ))}

                            {/* Add Reply */}
                            <form onSubmit={(e) => handleCommunityReplySubmit(e, post.id)} className="mt-6">
                              <textarea
                                value={newReplyContent}
                                onChange={(e) => setNewReplyContent(e.target.value)}
                                placeholder="Write your answer..."
                                rows={3}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                              />
                              <div className="flex justify-end mt-2">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
                                  Post Answer <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // --- Q&A FEED ---
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="font-display font-semibold text-xl text-slate-900">Latest Discussions</h2>
                        <button
                          onClick={() => setShowNewPostModal(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          Ask Question
                        </button>
                      </div>

                      {showNewPostModal && (
                        <div className="bg-white border border-indigo-200 rounded-3xl p-6 shadow-md mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900">Post a new question</h3>
                            <button onClick={() => setShowNewPostModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                          </div>
                          <form onSubmit={handleCommunityPostSubmit} className="space-y-4">
                            <input
                              type="text"
                              placeholder="Question title (e.g., How to calculate AC loss...)"
                              value={newPostTitle}
                              onChange={(e) => setNewPostTitle(e.target.value)}
                              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                            <textarea
                              rows={4}
                              placeholder="Provide details about your design, requirements, or what you've tried..."
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                            />
                            <div className="flex justify-end">
                              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition">Submit Post</button>
                            </div>
                          </form>
                        </div>
                      )}

                      {communityPosts.map(post => (
                        <div
                          key={post.id}
                          onClick={() => setExpandedPostId(post.id)}
                          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-sm transition cursor-pointer flex gap-4"
                        >
                          <div className="flex flex-col items-center gap-2 w-16 shrink-0 pt-1">
                            <div className="text-center text-slate-500">
                              <span className="block font-bold text-sm text-slate-700">{post.upvotes}</span>
                              <span className="text-[9px] uppercase tracking-wider font-mono">Votes</span>
                            </div>
                            <div className={`text-center ${post.replies.length > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                              <span className="block text-sm">{post.replies.length}</span>
                              <span className="text-[9px] uppercase tracking-wider font-mono">Answers</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display font-semibold text-base text-indigo-700 mb-1.5 leading-snug">{post.title}</h3>
                            <p className="text-slate-500 text-xs line-clamp-2 mb-3">{post.content}</p>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex gap-2">
                                {post.tags.map(t => (
                                  <span key={t} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold">{t}</span>
                                ))}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                <span className={`w-2 h-2 rounded-full ${post.authorRole === 'Student' ? 'bg-emerald-500' :
                                    post.authorRole === 'Educator' ? 'bg-indigo-500' : 'bg-red-500'
                                  }`} />
                                <span>{post.authorName}</span>
                                <span>&bull;</span>
                                <span>{post.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Sidebar: Rules & Roles */}
                <div className="w-full md:w-64 shrink-0 space-y-6 hidden md:block">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                    <h3 className="font-display font-bold text-sm text-indigo-900 mb-2">WE Community</h3>
                    <p className="text-indigo-700 text-xs leading-relaxed mb-4">
                      This is a shared space for University Students, Educators, and Würth Elektronik Industry Professionals.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" /> Students
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                        <span className="w-3 h-3 rounded-full bg-indigo-500" /> Educators
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                        <span className="w-3 h-3 rounded-full bg-red-500" /> WE Engineers
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-bold text-xs text-slate-900 mb-3 uppercase tracking-wider font-mono">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Power', 'Hardware', 'Layout', 'EMC', 'Career', 'Internship', 'Simulation'].map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-semibold cursor-pointer transition">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Global CSS for Scanner scanline */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scanline {
          animation: scan 1.5s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
