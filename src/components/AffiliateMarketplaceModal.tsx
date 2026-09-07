import React, { useState } from 'react';
import { X, ShoppingBag, ExternalLink, Copy, Check, DollarSign, Sparkles, ShieldCheck, Tag, TrendingUp, Gift, Award } from 'lucide-react';
import { AFFILIATE_DEALS, DOG_AFFILIATE_DEALS } from '../data/affiliateData';
import { CatProfile } from '../types';
import { playMeowSound, playTreatSound, playPurrSound, playWoofSound } from '../utils/audio';

interface AffiliateMarketplaceModalProps {
  isDog?: boolean;
  isOpen: boolean;
  onClose: () => void;
  activeProfile: CatProfile;
  speciesMode?: 'cat' | 'dog';
}

export const AffiliateMarketplaceModal: React.FC<AffiliateMarketplaceModalProps> = ({
  isDog = false,
  isOpen,
  onClose,
  activeProfile,
  speciesMode = 'cat',
}) => {
  const playSound = isDog ? playWoofSound : playMeowSound;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [redirectToast, setRedirectToast] = useState<{ brand: string; url: string } | null>(null);

  // Simulated Pet Influencer Affiliate Commissions
  const [treatsCommission, setTreatsCommission] = useState(1420);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemedSuccess, setRedeemedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = isDog
    ? ['All', 'Food & Bones', 'Leashes & Tech', 'Toys & Balls', 'Grooming & Health']
    : ['All', 'Food & Treats', 'Litter & Tech', 'Toys & Boxes', 'Grooming & Health'];

  const allDealsList = speciesMode === 'dog' ? [...DOG_AFFILIATE_DEALS, ...AFFILIATE_DEALS] : [...AFFILIATE_DEALS, ...DOG_AFFILIATE_DEALS];

  const filteredDeals = allDealsList.filter(
    (deal) => selectedCategory === 'All' || deal.category === selectedCategory
  );

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCodeId(id);
    playTreatSound();
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleShopLink = (brandName: string, url: string) => {
    playSound(1.2);
    setRedirectToast({ brand: brandName, url });
    // Simulate tracking click & earnings increase
    setTreatsCommission((prev) => prev + 10);
    setTimeout(() => setRedirectToast(null), 4000);
  };

  const handleRedeemGiftCard = (providerName: string, amount: string) => {
    setIsRedeeming(true);
    playPurrSound();
    setTimeout(() => {
      setIsRedeeming(false);
      setRedeemedSuccess(`Successfully converted ${treatsCommission} ${isDog ? 'Bones' : 'Fish Treats'} into a $28.40 ${providerName} e-Gift Card sent to ${activeProfile.handle}@instameow.app!`);
      setTreatsCommission(0);
      playSound(1.3);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
        
        {/* Header Banner */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold flex items-center gap-1.5">
                  <span>Pawprint Network Affiliate & Partner Market</span>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </h2>
              </div>
              <p className="text-xs text-white/90">
                Monetization Hub & Cat Supply Discount Deals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Redirect Toast Notice */}
        {redirectToast && (
          <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>Redirecting to {redirectToast.brand} with affiliate code <code className="bg-black/20 px-1.5 py-0.5 rounded">{isDog ? 'ref=thedogpark_dog_affiliate' : 'ref=thecatwalk_cat_affiliate'}</code></span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">+10 Treat Clicks Logged!</span>
          </div>
        )}

        {/* Content Container */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Active Cat Influencer Commission Dashboard Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/50 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      @{activeProfile.handle}'s Affiliate Earnings
                    </span>
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Verified Partner</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Earn treats when humans purchase supplies through your affiliate links!
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Available Commissions</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>🐟 {treatsCommission} Treats</span>
                  <span className="text-xs text-zinc-400 font-normal">(${(treatsCommission * 0.02).toFixed(2)} USD)</span>
                </p>
              </div>
            </div>

            {redeemedSuccess ? (
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 font-semibold flex items-center justify-between">
                <span>{redeemedSuccess}</span>
                <button
                  onClick={() => setRedeemedSuccess(null)}
                  className="text-[10px] underline text-emerald-600 font-bold ml-2"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>243 Referral Clicks Logged This Month</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRedeemGiftCard('Amazon', '$28.40')}
                    disabled={isRedeeming || treatsCommission <= 0}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-extrabold text-[11px] rounded-xl shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{isRedeeming ? 'Processing...' : 'Redeem Amazon Card'}</span>
                  </button>

                  <button
                    onClick={() => handleRedeemGiftCard('Chewy', '$28.40')}
                    disabled={isRedeeming || treatsCommission <= 0}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Redeem Chewy Card</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Categories Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  playSound(1.0);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Affiliate Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-32 w-full overflow-hidden bg-zinc-950">
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {deal.discountPercentage}
                    </div>

                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-white">
                      <span className="text-lg">{deal.logo}</span>
                      <span className="text-xs font-extrabold">{deal.brandName}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {deal.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-normal">
                      {deal.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  {/* Code & Shop Row */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(deal.id, deal.discountCode)}
                      className="flex-1 flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 hover:border-emerald-500 transition-colors"
                      title="Click to copy discount promo code"
                    >
                      <span>Code: {deal.discountCode}</span>
                      {copiedCodeId === deal.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>

                    <a
                      href={deal.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShopLink(deal.brandName, deal.affiliateUrl);
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0"
                    >
                      <span>Shop</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                    <span>Category: {deal.category}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{deal.commissionRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Affiliate Transparency Disclosure Footer */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
            <p className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Affiliate Integration Transparency Notice</span>
            </p>
            <p className="leading-relaxed">
              {isDog ? 'The Dog Park partners with trusted dog suppliers (Amazon, Chewy, BarkBox, KONG, PetSafe). When you buy using these affiliate links, The Dog Park earns a small bone commission at no extra cost to you. 🦴' : 'The Catwalk partners with trusted cat suppliers (Amazon, Chewy, Litter-Robot, MeowBox, Inaba Churu). When you buy using these affiliate links, The Catwalk earns a small treat commission at no extra cost to you. 🐾'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
