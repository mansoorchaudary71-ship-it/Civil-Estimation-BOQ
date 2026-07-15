import React, { useState } from 'react';
import { Building2, Pickaxe, Factory, Home, CheckCircle2, ChevronRight, HardHat, GraduationCap, Calculator, Ruler, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSettings, UserRole, ProjectType } from '../../context/SettingsContext';

export function WelcomeModal() {
  const { settings, updateSettings, trackToolUse } = useSettings();
  
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState<ProjectType>(settings.projectType);
  const [role, setRole] = useState<UserRole>(settings.role);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  if (settings.onboardingComplete) return null;

  const handleComplete = () => {
    updateSettings({
      role,
      projectType,
      onboardingComplete: true
    });
    if (selectedTool) {
      trackToolUse(selectedTool);
    }
  };

  const projectTypes = [
    { id: 'Residential', icon: <Home className="w-6 h-6" />, label: 'Residential', desc: 'Homes & Housing' },
    { id: 'Commercial', icon: <Building2 className="w-6 h-6" />, label: 'Commercial', desc: 'Offices & Retail' },
    { id: 'Infrastructure', icon: <Pickaxe className="w-6 h-6" />, label: 'Infrastructure', desc: 'Roads & Bridges' },
    { id: 'Industrial', icon: <Factory className="w-6 h-6" />, label: 'Industrial', desc: 'Warehouses & Plants' }
  ];

  const roles = [
    { id: 'Civil Engineer', icon: <HardHat className="w-6 h-6" />, label: 'Engineer' },
    { id: 'Contractor', icon: <Ruler className="w-6 h-6" />, label: 'Contractor' },
    { id: 'Architect', icon: <Building2 className="w-6 h-6" />, label: 'Architect' },
    { id: 'Student', icon: <GraduationCap className="w-6 h-6" />, label: 'Student' }
  ];

  const getRecommendedTools = () => {
    if (role === 'Student') return [
      { id: 'concrete-mix', name: 'Concrete Mix Design', desc: 'IS/ACI standard mix calculations' },
      { id: 'bbs-generator', name: 'BBS Generator', desc: 'Learn standard bar bending schedules' },
      { id: 'unit-converter', name: 'Unit Converter', desc: 'Essential engineering conversions' }
    ];
    if (role === 'Contractor') return [
      { id: 'quick-rough', name: 'Rough Estimator', desc: 'Quick quotes for clients' },
      { id: 'house', name: 'House Estimator', desc: 'Full residential breakdown' },
      { id: 'brickwork', name: 'Brickwork Calc', desc: 'Fast material ordering' }
    ];
    if (projectType === 'Infrastructure') return [
      { id: 'road-pavement', name: 'Road Estimator', desc: 'Pavement layers & materials' },
      { id: 'chainage-volume', name: 'Chainage Volume', desc: 'Earthwork cross-sections' },
      { id: 'earthworks', name: 'Grid Earthwork', desc: 'Cut/fill mass haul' }
    ];
    return [
      { id: 'master-quantity', name: 'Master Quantity', desc: 'Comprehensive material takeoffs' },
      { id: 'boq-generator', name: 'BOQ Generator', desc: 'Professional bill of quantities' },
      { id: 'concrete-mix', name: 'Concrete Design', desc: 'Detailed structural mix' }
    ];
  };

  const recommendedTools = getRecommendedTools();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#F5F5F7] backdrop-blur-md p-4 animate-in fade-in duration-300 font-sans">
      <div className="bg-white border border-slate-100 rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        
        <div className="p-8 pb-4">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100 '}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100 '}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-100 '}`} />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2" >
            {step === 1 && "What do you work on?"}
            {step === 2 && "What's your role?"}
            {step === 3 && "Pick your first tool."}
          </h1>
          <p className="text-slate-500 font-medium">
            {step === 1 && "Start by telling us what type of projects you estimate most often."}
            {step === 2 && "This helps us personalize your dashboard and recommendations."}
            {step === 3 && "Based on your answers, here are the best tools to start with."}
          </p>
        </div>

        <div className="px-8 pb-8 flex-1">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {projectTypes.map(pt => (
                <button
                  key={pt.id}
                  onClick={() => setProjectType(pt.id as ProjectType)}
                  className={`flex flex-col items-start gap-4 p-5 rounded-[24px] border-2 text-left transition-all group ${
                    projectType === pt.id 
                      ? 'border-indigo-600 bg-indigo-50/50 ' 
                      : 'border-slate-100  hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-[24px] flex items-center justify-center transition-colors ${
                    projectType === pt.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'bg-slate-100  text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  }`}>
                    {pt.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${projectType === pt.id ? 'text-indigo-900 ' : 'text-slate-900 '}`}>{pt.label}</h3>
                    <p className={`text-sm ${projectType === pt.id ? 'text-indigo-700 ' : 'text-slate-500 '}`}>{pt.desc}</p>
                  </div>
                  {projectType === pt.id && <CheckCircle2 className="w-5 h-5 absolute top-5 right-5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id as UserRole)}
                  className={`flex items-center gap-4 p-5 rounded-[24px] border-2 text-left transition-all relative ${
                    role === r.id 
                      ? 'border-indigo-600 bg-indigo-50/50 ' 
                      : 'border-slate-100  hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === r.id ? 'bg-indigo-100 text-indigo-600  ' : 'bg-slate-100 text-slate-400 '}`}>
                    {r.icon}
                  </div>
                  <span className={`font-bold ${role === r.id ? 'text-indigo-900 ' : 'text-slate-900 '}`}>{r.label}</span>
                  {role === r.id && <CheckCircle2 className="w-5 h-5 absolute right-5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3 mt-4">
              {recommendedTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`flex items-center justify-between p-5 rounded-[24px] border-2 text-left transition-all group ${
                    selectedTool === tool.id 
                      ? 'border-indigo-600 bg-indigo-50/50  shadow-[0_0_0_4px_rgba(79,70,229,0.1)]' 
                      : 'border-slate-100  hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${selectedTool === tool.id ? 'text-indigo-900 ' : 'text-slate-900 '}`}>{tool.name}</h3>
                    <p className={`text-sm ${selectedTool === tool.id ? 'text-indigo-700 ' : 'text-slate-500 '}`}>{tool.desc}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedTool === tool.id ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-slate-200 text-transparent'}`}>
                    {selectedTool === tool.id && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50">
          {step > 1 ? (
             <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
             >
               <ArrowLeft className="w-4 h-4" /> Back
             </button>
          ) : (
             <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !projectType) || (step === 2 && !role)}
              className="flex items-center gap-2 bg-[#F5F5F7] hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-8 py-3 rounded-[24px] font-bold transition-all shadow-sm hover:shadow-md overflow-hidden"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-[24px] font-bold transition-all shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 overflow-hidden"
            >
              Let's Build It
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
