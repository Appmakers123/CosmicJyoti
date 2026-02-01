import React from 'react';
import type { KundaliFormData, Language } from '../../types';

export const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</label>
    {children}
  </div>
);

interface BirthFormProps {
  data: KundaliFormData;
  setData: React.Dispatch<React.SetStateAction<KundaliFormData>>;
  prefix: string;
  language: Language;
}

const BirthForm = React.memo<BirthFormProps>(({ data, setData, prefix, language }) => (
  <div className="space-y-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
    <FieldRow label={language === 'hi' ? 'नाम' : 'Name'}>
      <input
        type="text"
        value={data.name}
        onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
        placeholder={language === 'hi' ? 'पूरा नाम' : 'Full name'}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-amber-500 outline-none"
      />
    </FieldRow>
    <div className="grid grid-cols-2 gap-3">
      <FieldRow label={language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}>
        <input
          type="date"
          value={data.date}
          onChange={(e) => setData((p) => ({ ...p, date: e.target.value }))}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 [color-scheme:dark]"
        />
      </FieldRow>
      <FieldRow label={language === 'hi' ? 'जन्म समय' : 'Time of Birth'}>
        <input
          type="time"
          value={data.time}
          onChange={(e) => setData((p) => ({ ...p, time: e.target.value }))}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 [color-scheme:dark]"
        />
      </FieldRow>
    </div>
    <FieldRow label={language === 'hi' ? 'जन्म स्थान' : 'Place of Birth'}>
      <input
        type="text"
        value={data.location}
        onChange={(e) => setData((p) => ({ ...p, location: e.target.value }))}
        placeholder="City, Country"
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-amber-500 outline-none"
      />
    </FieldRow>
    <FieldRow label={language === 'hi' ? 'लिंग' : 'Gender'}>
      <div className="flex gap-3">
        {(['male', 'female', 'other'] as const).map((g) => (
          <label key={g} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`gender-${prefix}`}
              value={g}
              checked={data.gender === g}
              onChange={() => setData((p) => ({ ...p, gender: g }))}
              className="w-3.5 h-3.5 rounded-full border-amber-500/50 bg-slate-800 text-amber-500"
            />
            <span className="text-xs text-slate-300">
              {language === 'hi' ? (g === 'male' ? 'पुरुष' : g === 'female' ? 'महिला' : 'अन्य') : g}
            </span>
          </label>
        ))}
      </div>
    </FieldRow>
  </div>
));

BirthForm.displayName = 'BirthForm';

export default BirthForm;
