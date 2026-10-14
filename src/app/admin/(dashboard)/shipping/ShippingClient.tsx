"use client";

import React, { useState } from "react";
import { ShippingArea } from "@/types";
import {
  saveShippingAreaAction,
  toggleShippingAreaStatusAction,
  deleteShippingAreaAction,
} from "./actions";
import {
  MapPin,
  Plus,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";

export function ShippingClient({
  initialAreas,
}: {
  initialAreas: ShippingArea[];
}) {
  const [areas, setAreas] = useState<ShippingArea[]>(initialAreas);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // New Area Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNameAr, setNewNameAr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newFee, setNewFee] = useState<number>(40);
  const [newDaysMin, setNewDaysMin] = useState<number>(1);
  const [newDaysMax, setNewDaysMax] = useState<number>(2);
  const [adding, setAdding] = useState(false);

  // Toggle active/inactive
  const handleToggle = async (area: ShippingArea) => {
    setLoadingId(area.id);
    setErrorMessage("");

    try {
    const res = await toggleShippingAreaStatusAction(area.id, !area.is_enabled);
    if (res.success && res.area) {
      setAreas((prev) =>
        prev.map((a) => (a.id === area.id ? res.area! : a))
      );
    } else {
      setErrorMessage(res.error || "فشل تغيير حالة المنطقة.");
    }
    } catch { setErrorMessage("تعذر الاتصال. أعيدي المحاولة."); }
    finally { setLoadingId(null); }
  };

  // Update Fee & Days
  const handleUpdate = async (
    area: ShippingArea,
    fee: number,
    minDays: number,
    maxDays: number
  ) => {
    setLoadingId(area.id);
    setErrorMessage("");

    try {
    const res = await saveShippingAreaAction({
      id: area.id,
      delivery_fee: fee,
      estimated_days_min: minDays,
      estimated_days_max: maxDays,
    });

    if (res.success && res.area) {
      setAreas((prev) =>
        prev.map((a) => (a.id === area.id ? res.area! : a))
      );
      setSavedId(area.id);
      setTimeout(() => setSavedId(null), 2000);
    } else {
      setErrorMessage(res.error || "فشل حفظ التعديلات.");
    }
    } catch { setErrorMessage("تعذر الاتصال. أعيدي المحاولة."); }
    finally { setLoadingId(null); }
  };

  // Delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنتِ متأكدة من حذف منطقة "${name}"؟`)) return;

    setLoadingId(id);
    setErrorMessage("");
    try {
    const res = await deleteShippingAreaAction(id);
    if (res.success) {
      setAreas((prev) => prev.filter((a) => a.id !== id));
    } else {
      setErrorMessage(res.error || "فشل حذف المنطقة.");
    }
    } catch { setErrorMessage("تعذر الاتصال. أعيدي المحاولة."); }
    finally { setLoadingId(null); }
  };

  // Add new area
  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim()) return;

    setAdding(true);
    setErrorMessage("");

    try {
    const res = await saveShippingAreaAction({
      name_ar: newNameAr.trim(),
      name_en: newNameEn.trim() || newNameAr.trim(),
      delivery_fee: newFee,
      estimated_days_min: newDaysMin,
      estimated_days_max: newDaysMax,
      is_enabled: true,
      sort_order: areas.length + 1,
    });

    if (res.success && res.area) {
      setAreas((prev) => [...prev, res.area!]);
      setNewNameAr("");
      setNewNameEn("");
      setShowAddForm(false);
    } else {
      setErrorMessage(res.error || "فشل إضافة المنطقة.");
    }
    } catch { setErrorMessage("تعذر الاتصال. أعيدي المحاولة."); }
    finally { setAdding(false); }
  };

  const enabledCount = areas.filter((a) => a.is_enabled).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#291D11]">
              مناطق التوصيل بمحافظة دمياط ({areas.length})
            </h2>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              مفعّل: {enabledCount} منطقة
            </span>
          </div>
          <p className="text-xs text-[#8A7968] mt-1">
            يقتصر التوصيل حصرياً على مدن ومراكز وقرى محافظة دمياط. يمكنكِ تفعيل أو إيقاف أي منطقة وتحديد سعر الشحن لكل منها.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#C8692F] hover:bg-[#B35822] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-warm-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منطقة بدمياط</span>
        </button>
      </div>

      {/* Damietta Governorate Policy Alert */}
      <div className="bg-[#FAF7F2] p-4 rounded-3xl border border-[#E8DED1] text-xs text-[#6E5F50] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#C8692F] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#291D11] block mb-0.5">
            نطاق التوصيل الحصري (محافظة دمياط فقط):
          </span>
          <p className="leading-relaxed">
            المنصة مصممة لمنع أي طلبات خارج نطاق محافظة دمياط لحماية جودة المشغولات اليدوية وسرعة وصولها. يختار العميل أثناء الدفع فقط من المناطق المفعّلة أدناه وتُحتسب رسوم التوصيل تلقائياً في الإجمالي.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Add New Area Modal / Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddNew}
          className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-sm space-y-4"
        >
          <h3 className="font-serif font-bold text-base text-[#291D11]">
            إضافة مدينة أو قرية جديدة داخل دمياط
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#291D11]">
                الاسم بالعربية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: شطا، كفر البطيخ..."
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8692F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#291D11]">
                الاسم بالإنجليزية
              </label>
              <input
                type="text"
                placeholder="e.g. Shata"
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8692F]"
                dir="ltr"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#291D11]">
                رسوم التوصيل (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={newFee}
                onChange={(e) => setNewFee(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C8692F] font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#291D11]">
                مدة التوصيل (أيام: من - إلى)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={newDaysMin}
                  onChange={(e) => setNewDaysMin(Number(e.target.value))}
                  className="w-1/2 bg-[#FAF7F2] border border-[#E8DED1] rounded-xl px-2 py-2 text-xs text-center focus:outline-none focus:border-[#C8692F]"
                />
                <input
                  type="number"
                  min="1"
                  value={newDaysMax}
                  onChange={(e) => setNewDaysMax(Number(e.target.value))}
                  className="w-1/2 bg-[#FAF7F2] border border-[#E8DED1] rounded-xl px-2 py-2 text-xs text-center focus:outline-none focus:border-[#C8692F]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={adding}
              className="bg-[#C8692F] hover:bg-[#B35822] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {adding ? "جارٍ الحفظ..." : "إضافة المنطقة الآن"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-[#FAF7F2] text-[#6E5F50] text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#E8DED1] cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Areas List */}
      <div className="bg-white rounded-3xl border border-[#E8DED1] shadow-warm-xs overflow-hidden">
        <div className="divide-y divide-[#F0EAE1]">
          {areas.map((area) => (
            <AreaRow
              key={area.id}
              area={area}
              isLoading={loadingId === area.id}
              isSaved={savedId === area.id}
              onToggle={() => handleToggle(area)}
              onUpdate={(fee, min, max) => handleUpdate(area, fee, min, max)}
              onDelete={() => handleDelete(area.id, area.name_ar)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AreaRow({
  area,
  isLoading,
  isSaved,
  onToggle,
  onUpdate,
  onDelete,
}: {
  area: ShippingArea;
  isLoading: boolean;
  isSaved: boolean;
  onToggle: () => void;
  onUpdate: (fee: number, min: number, max: number) => void;
  onDelete: () => void;
}) {
  const [fee, setFee] = useState<number>(area.delivery_fee);
  const [minDays, setMinDays] = useState<number>(area.estimated_days_min);
  const [maxDays, setMaxDays] = useState<number>(area.estimated_days_max);

  const hasChanges =
    fee !== area.delivery_fee ||
    minDays !== area.estimated_days_min ||
    maxDays !== area.estimated_days_max;

  return (
    <div
      className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        !area.is_enabled ? "bg-stone-50/70 opacity-60" : "hover:bg-[#FAF7F2]/40"
      }`}
    >
      {/* Area Name & Status */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8DED1] text-[#C8692F] flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#291D11]">
              {area.name_ar}
            </span>
            <span className="text-xs text-[#8A7968]">({area.name_en})</span>
          </div>
          <span className="text-[11px] text-[#8A7968]">محافظة دمياط</span>
        </div>
      </div>

      {/* Editable Fee & Days */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Fee Input */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E8DED1]">
          <span className="text-[11px] text-[#8A7968]">رسوم الشحن:</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-16 font-mono font-bold text-xs text-[#291D11] bg-transparent text-center focus:outline-none"
          />
          <span className="text-[11px] text-[#291D11] font-semibold">ج.م</span>
        </div>

        {/* Days Input */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E8DED1] text-xs">
          <Clock className="w-3.5 h-3.5 text-[#7A7452]" />
          <span className="text-[11px] text-[#8A7968]">المدة:</span>
          <input
            type="number"
            min="1"
            value={minDays}
            onChange={(e) => setMinDays(Number(e.target.value))}
            className="w-8 font-mono text-xs text-center bg-transparent focus:outline-none"
          />
          <span>-</span>
          <input
            type="number"
            min="1"
            value={maxDays}
            onChange={(e) => setMaxDays(Number(e.target.value))}
            className="w-8 font-mono text-xs text-center bg-transparent focus:outline-none"
          />
          <span className="text-[11px] text-[#8A7968]">أيام</span>
        </div>
      </div>

      {/* Actions: Save, Toggle Active, Delete */}
      <div className="flex items-center gap-2 self-end md:self-auto">
        {hasChanges && (
          <button
            type="button"
            onClick={() => onUpdate(fee, minDays, maxDays)}
            disabled={isLoading}
            className="flex items-center gap-1 bg-[#C8692F] hover:bg-[#B35822] text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ</span>
          </button>
        )}

        {isSaved && (
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>تم الحفظ!</span>
          </span>
        )}

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={onToggle}
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
            area.is_enabled
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
          }`}
        >
          {area.is_enabled ? "مفعّلة للطلب" : "معطّلة حالياً"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isLoading}
          className="p-2 text-[#8A7968] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          title="حذف المنطقة"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
