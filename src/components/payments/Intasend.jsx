import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FHOST } from '../constants/Functions';
import 'intasend-inlinejs-sdk';

const Intasend = ({ fetchTransactionHistory, userInfo }) => {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const previousResponseRef = useRef(null);
  const isProcessingRef = useRef(false);
  const handleCompleteRef = useRef(null);
  const handleFailedRef = useRef(null);
  const handleInProgressRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const intasend = new window.IntaSend({
      publicAPIKey: "ISPubKey_live_ed588544-fa80-4cdc-aa41-ce38b0ae59fd",
      live: true
    });

    const handleComplete = async (response) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      if (previousResponseRef.current && response.tracking_id === previousResponseRef.current.tracking_id) {
        console.log("Duplicate response detected. Submission prevented.");
        isProcessingRef.current = false;
        return;
      }

      previousResponseRef.current = response;
      
      try {
        await axios.post(`${FHOST}/payments/api/intasend/deposit`, {
          response: response,
          user_id: userInfo?.id,
          transaction_id: response.tracking_id,
        });
        fetchTransactionHistory();
      } catch (error) {
        console.error("There was an error sending the data:", error);
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    };

    const handleFailed = (response) => {
      console.log("Payment failed:", response);
      setIsProcessing(false);
    };

    const handleInProgress = (response) => {
      console.log("Payment in progress:", response);
    };

    handleCompleteRef.current = handleComplete;
    handleFailedRef.current = handleFailed;
    handleInProgressRef.current = handleInProgress;

    intasend.on("COMPLETE", handleCompleteRef.current);
    intasend.on("FAILED", handleFailedRef.current);
    intasend.on("IN-PROGRESS", handleInProgressRef.current);

    return () => {
      handleCompleteRef.current = null;
      handleFailedRef.current = null;
      handleInProgressRef.current = null;
      intasend.exitPay();
    };
  }, [userInfo, navigate, fetchTransactionHistory]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleRefresh = () => {
    setAmount("");
    setIsProcessing(false);
    previousResponseRef.current = null;
    isProcessingRef.current = false;
  };

  return (
    <div className="flex justify-center items-center w-full font-josefin">
      <div className="w-full max-w-md bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
          <h2 className="text-3xl font-lilita text-white text-center">Add Funds</h2>
          <p className="text-indigo-100 text-center mt-2">Secure deposit via IntaSend</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-semibold">
              Enter Amount (KES)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">KES</span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all text-lg font-medium"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <button
              onClick={handleRefresh}
              disabled={isProcessing}
              className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                isProcessing 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              Reset
            </button>
            
            <button
              className="intaSendPayButton py-3 px-4 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              data-amount={amount}
              data-currency="KES"
              data-email={userInfo?.email}
              data-first_name={userInfo?.name?.split(' ')[0]}
              data-last_name={userInfo?.name?.split(' ').slice(1).join(' ')}
              data-country="KE"
              onClick={() => setIsProcessing(true)}
              disabled={isProcessing || !amount || parseFloat(amount) <= 0}
              style={{
                background: isProcessing 
                  ? 'linear-gradient(to right, #9ca3af, #6b7280)' 
                  : 'linear-gradient(to right, #4f46e5, #7c3aed)'
              }}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </div>
              ) : 'Deposit Now'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Secure</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Instant</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intasend;