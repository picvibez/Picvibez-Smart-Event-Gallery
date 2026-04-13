import { ChevronLeft, ShieldCheck, CreditCard, Building2, Smartphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const amount = location.state?.amount || 49;
  const eventName = location.state?.eventName || 'Summer Gala 2024';

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0A0A0A] overflow-y-auto pb-24 md:pb-12 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="p-6 md:max-w-2xl md:mx-auto md:w-full">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">Secure Payment</h1>
            <p className="text-[10px] text-[#a855f7] font-bold uppercase tracking-wider">PICVIBEZ PREMIUM</p>
          </div>
          <ShieldCheck size={24} className="text-gray-400 dark:text-gray-500" />
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 mb-8 border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">Event Sharing Access</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{eventName} - Full Resolution</p>
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">₹{amount}.00</span>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">UPI PAYMENTS</h3>
              <span className="text-[10px] bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">FASTEST</span>
            </div>
            
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
              <label className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white flex items-center justify-center p-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="GPay" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Google Pay</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pay directly from bank</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-[#a855f7] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                </div>
              </label>

              <label className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#5f259f] flex items-center justify-center p-2">
                    <Smartphone size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">PhonePe</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">UPI & Wallet</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
              </label>

              <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white flex items-center justify-center p-2">
                    <span className="text-[#002970] font-bold text-xs">Paytm</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Paytm</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pay with Paytm Wallet</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">OTHER METHODS</h3>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
              <button className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center">
                    <CreditCard size={20} className="text-gray-500 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Credit / Debit Cards</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, RuPay</p>
                  </div>
                </div>
                <ChevronLeft size={20} className="text-gray-400 dark:text-gray-500 rotate-180" />
              </button>

              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center">
                    <Building2 size={20} className="text-gray-500 dark:text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Netbanking</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">All major Indian banks</p>
                  </div>
                </div>
                <ChevronLeft size={20} className="text-gray-400 dark:text-gray-500 rotate-180" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => navigate('/payment-success')}
            className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-xl py-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Pay ₹{amount}.00
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <p className="text-[10px] text-gray-500 dark:text-gray-500 text-center mt-4">
            By clicking pay, you agree to PicVibez Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
