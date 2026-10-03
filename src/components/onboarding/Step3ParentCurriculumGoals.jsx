import React from "react";
import { FaBookOpen, FaArrowLeft } from "react-icons/fa";

const Step3ParentCurriculumGoals = ({ onBack = null }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center max-w-lg mx-auto space-y-4">
    <div className="w-16 h-16 rounded-2xl bg-[#015575]/10 text-[#015575] flex items-center justify-center mx-auto text-2xl">
      <FaBookOpen />
    </div>
    <h2 className="text-xl font-lilita text-slate-900">Step 3: Curriculum & Learning Goals</h2>
    <p className="text-sm font-josefin text-slate-500">Scheduled for implementation in next phase.</p>
    {onBack && (
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-5 py-2 border border-slate-200 text-xs font-josefin font-semibold rounded-xl text-slate-600 hover:bg-slate-50"
      >
        <FaArrowLeft className="text-xs" />
        <span>Back to Step 2</span>
      </button>
    )}
  </div>
);

export default Step3ParentCurriculumGoals;
