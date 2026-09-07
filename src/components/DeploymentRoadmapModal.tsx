import React from 'react';
import { X, Rocket, Globe, Database, Server, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, Zap } from 'lucide-react';

interface DeploymentRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentRoadmapModal: React.FC<DeploymentRoadmapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const STEPS = [
    {
      number: '01',
      title: 'Domain & SSL Provisioning',
      icon: Globe,
      status: 'Ready to Deploy',
      color: 'from-amber-500 to-rose-500',
      description: 'Register and assign custom apex domains and subdomains with automatic managed SSL certificates:',
      details: [
        '🐱 instameow.app (The Catwalk)',
        '🐶 instawoof.app (The Dog Park)',
        '🔒 Automatic Let\'s Encrypt SSL via Cloud Run Custom Domains / Cloud DNS'
      ]
    },
    {
      number: '02',
      title: 'Isolated Microservices & Multi-Tenant Databases',
      icon: Database,
      status: 'Architected',
      color: 'from-purple-500 to-indigo-500',
      description: 'Isolate cat and dog datasets while sharing serverless infrastructure for optimal cost efficiency:',
      details: [
        '🗄️ Firestore / Cloud SQL with `species_type` multi-tenant collection indexing',
        '🔑 Isolated Firebase Auth tenants for The Catwalk & The Dog Park accounts',
        '⚡ Independent Redis cache namespaces (`thecatwalk:*` vs `thedogpark:*`)'
      ]
    },
    {
      number: '03',
      title: 'Containerization & Cloud Run Dual Deployments',
      icon: Server,
      status: 'Build Verified',
      color: 'from-sky-500 to-blue-600',
      description: 'Deploy standalone container instances on Google Cloud Run with environment variable branding:',
      details: [
        '🐳 Docker build with `APP_MODE=thecatwalk` and `APP_MODE=thedogpark` flags',
        '🚀 Auto-scaling from 0 to 100+ instances with sub-second cold starts',
        '⚙️ NGINX reverse proxy routing port 3000 to primary container ingress'
      ]
    },
    {
      number: '04',
      title: 'Affiliate & Social OAuth Synchronization',
      icon: Zap,
      status: 'Integrated',
      color: 'from-emerald-500 to-teal-600',
      description: 'Monetize both platforms with unified affiliate tracking and single sign-on:',
      details: [
        '🛒 Amazon Associates, Chewy, BarkBox & KONG affiliate redirect hooks',
        '🌐 Google, Amazon, Instagram & TikTok OAuth credentials configured per domain',
        '💰 Multi-brand treat & bone commission conversion portal'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <span>Live Joint Deployment Roadmap</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-zinc-950 rounded-full">
                  2 Independent Platforms
                </span>
              </h2>
              <p className="text-xs text-zinc-300">
                Step-by-step blueprint to launch The Catwalk & The Dog Park live to production
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Info Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-sky-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <Globe className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                Dual Domain Architecture: <span className="text-rose-500">instameow.app</span> + <span className="text-amber-500">instawoof.app</span>
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                The Catwalk and The Dog Park operate as completely distinct, standalone sister platforms with isolated feeds, branding, local storage, and AI utilities, hosted on high-performance Cloud Run containers.
              </p>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 space-y-3 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl bg-gradient-to-r ${step.color} text-white font-extrabold text-xs flex items-center justify-center shadow-xs`}>
                        {step.number}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-amber-500" />
                        <span>{step.title}</span>
                      </h3>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{step.status}</span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                    {step.description}
                  </p>

                  <ul className="space-y-1.5 pl-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Ready for Production Cloud Run Deployment</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Got It!
          </button>
        </div>

      </div>
    </div>
  );
};
