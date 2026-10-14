"use client";
import { uploadProductImageAction } from "../../media-actions";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product, Category, ProductImage, ProductVariant } from "@/types";
import { saveProductAction } from "./actions";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Star,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Upload,
} from "lucide-react";

export function ProductFormClient({
  initialProduct,
  categories,
}: {
  initialProduct: Partial<Product> | null;
  categories: Category[];
}) {
  const router = useRouter();
  const isNew = !initialProduct || !initialProduct.id;

  const [nameAr, setNameAr] = useState(initialProduct?.name_ar || "");
  const [nameEn, setNameEn] = useState(initialProduct?.name_en || "");
  const [descriptionAr, setDescriptionAr] = useState(
    initialProduct?.description_ar || ""
  );
  const [descriptionEn, setDescriptionEn] = useState(
    initialProduct?.description_en || ""
  );
  const [specs, setSpecs] = useState({ material_ar: initialProduct?.material_ar || "", material_en: initialProduct?.material_en || "", dimensions_ar: initialProduct?.dimensions_ar || "", dimensions_en: initialProduct?.dimensions_en || "", care_instructions_ar: initialProduct?.care_instructions_ar || "", care_instructions_en: initialProduct?.care_instructions_en || "" });
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id || (categories[0]?.id || "baskets")
  );
  const [basePrice, setBasePrice] = useState<number | "">(
    initialProduct?.base_price ?? ""
  );
  const [isMadeToOrder, setIsMadeToOrder] = useState<boolean>(
    initialProduct?.is_made_to_order ?? true
  );
  const [preparationDays, setPreparationDays] = useState<number>(
    initialProduct?.preparation_days ?? 3
  );
  const [stockQuantity, setStockQuantity] = useState<number | "">(
    initialProduct?.stock_quantity ?? 5
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    initialProduct?.is_featured ?? false
  );
  const [allowCustomNotes, setAllowCustomNotes] = useState<boolean>(
    initialProduct?.allow_custom_notes ?? true
  );
  const [status, setStatus] = useState<"published" | "draft">(
    initialProduct?.status === "published" ? "published" : "draft"
  );

  // Images list
  const [images, setImages] = useState<ProductImage[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : [
          {
            id: "img-default-cover",
            url: "/demo-media/5415cb931ba250dc.webp",
            is_cover: true,
            sort_order: 1,
          },
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variants list
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants || []
  );
  const [newVariantAr, setNewVariantAr] = useState("");
  const [newVariantEn, setNewVariantEn] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState<number | "">("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Set Cover Image
  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_cover: img.id === id,
      }))
    );
  };

  // Remove Image
  const handleRemoveImage = (id: string) => {
    if (images.length <= 1) {
      alert("يجب الاحتفاظ بصورة واحدة على الأقل للمشغولة.");
      return;
    }
    const remaining = images.filter((img) => img.id !== id);
    if (!remaining.some((img) => img.is_cover)) {
      remaining[0].is_cover = true;
    }
    setImages(remaining);
  };

  // Add Image URL
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const newImg: ProductImage = {
      id: `img-${Date.now()}`,
      url: newImageUrl.trim(),
      is_cover: images.length === 0,
      sort_order: images.length + 1,
    };
    setImages([...images, newImg]);
    setNewImageUrl("");
  };

  // Add Variant
  const handleAddVariant = () => {
    if (!newVariantAr.trim()) return;
    const variant: ProductVariant = {
      id: `var-${Date.now()}`,
      product_id: initialProduct?.id || "",
      name_ar: newVariantAr.trim(),
      name_en: newVariantEn.trim() || newVariantAr.trim(),
      price_override: typeof newVariantPrice === "number" && newVariantPrice > 0 ? newVariantPrice : null,
      stock_quantity: null,
      sort_order: variants.length + 1,
    };
    setVariants([...variants, variant]);
    setNewVariantAr("");
    setNewVariantEn("");
    setNewVariantPrice("");
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!nameAr.trim()) {
      setErrorMessage("اسم المشغولة بالعربية مطلوب.");
      return;
    }

    const priceNum = typeof basePrice === "number" ? basePrice : 0;
    if (status === "published" && priceNum <= 0) {
      setErrorMessage("لا يمكن نشر المشغولة بدون تحديد سعر بيع (أكبر من صفر).");
      return;
    }

    setSaving(true);

    try {
      const payload: Partial<Product> & { id?: string } = {
        ...specs,
        id: initialProduct?.id,
        name_ar: nameAr.trim(),
        name_en: nameEn.trim() || nameAr.trim(),
        description_ar: descriptionAr.trim(),
        description_en: descriptionEn.trim(),
        category_id: categoryId,
        base_price: priceNum,
        is_made_to_order: isMadeToOrder,
        preparation_days: isMadeToOrder ? preparationDays : 0,
        stock_quantity: !isMadeToOrder ? (typeof stockQuantity === "number" ? stockQuantity : 1) : null,
        is_featured: isFeatured,
        allow_custom_notes: allowCustomNotes,
        status,
        images,
        variants,
      };

      const res = await saveProductAction(payload);
      if (res.success) {
        setSuccessMessage("تم حفظ المشغولة بنجاح!");
        setTimeout(() => {
          router.push("/admin/products");
          router.refresh();
        }, 1200);
      } else {
        setErrorMessage(res.error || "فشل حفظ المشغولة.");
        setSaving(false);
      }
    } catch (err: unknown) {
      setErrorMessage((err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "حدث خطأ غير متوقع.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0EAE1] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-[#8A7968] hover:text-[#291D11] hover:bg-[#FAF7F2] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#291D11]">
              {isNew ? "إضافة مشغولة جديدة" : `تعديل: ${nameAr || "مشغولة"}`}
            </h2>
            <p className="text-xs text-[#8A7968]">
              {isNew
                ? "أدخلي تفاصيل القطعة والصور والسعر وحالة التنفيذ"
                : "تعديل الأسعار والمواصفات والصور وملاحظات التخصيص"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="text-xs text-[#6E5F50] hover:text-[#291D11] px-4 py-2.5 rounded-xl border border-[#E8DED1] transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
          disabled={saving || uploadingImage}
            className="flex items-center gap-2 bg-[#C8692F] hover:bg-[#B35822] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-warm-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جارٍ الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Basic Info & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Titles Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              بيانات المشغولة
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#291D11]">
                اسم المشغولة بالعربية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: شنطة يد كروشيه وردي فاخرة"
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2.5 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#291D11]">
                اسم المشغولة بالإنجليزية
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Pink Handcrafted Crochet Handbag"
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2.5 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#291D11]">
                  القسم <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2.5 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_ar} ({c.name_en})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#291D11]">
                  سعر البيع الأساسي (ج.م){" "}
                  {status === "published" && (
                    <span className="text-rose-500">* (مطلوب للنشر)</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) =>
                    setBasePrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="0 (اتركيه فارغاً إذا كانت مسودة غير مسعرة)"
                  className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2.5 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F] font-mono font-bold"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-[#291D11]">
                الوصف وخامات الغزل بالعربية
              </label>
              <textarea
                rows={3}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="اكتبي تفاصيل القطعة: نوع الخيوط (قطن/صوف/مكرمية)، الأبعاد، نصائح العناية..."
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl p-4 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F] leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#291D11]">
                الوصف بالإنجليزية
              </label>
              <textarea
                rows={2}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Product description in English..."
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl p-4 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F] leading-relaxed"
                dir="ltr"
              />
            </div>
          </div>

          {/* Photo Gallery & Cover Selection */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#291D11]">
                معرض صور القطعة ({images.length})
              </h3>
              <span className="text-[11px] text-[#8A7968]">
                اضغطي على النجمة لتحديد صورة الغلاف
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${
                    img.is_cover
                      ? "border-[#C8692F] shadow-warm-xs"
                      : "border-[#E8DED1] hover:border-[#8A7968]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt="Product preview"
                    fill
                    className="object-cover"
                  />
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/10 sm:bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetCover(img.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        img.is_cover
                          ? "bg-[#C8692F] text-white"
                          : "bg-white text-[#291D11] hover:bg-[#FAF7F2]"
                      }`}
                      title="تعيين كصورة غلاف رئيسية"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="p-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {img.is_cover && (
                    <div className="absolute bottom-2 right-2 bg-[#C8692F] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                      الغلاف
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Image by Path / URL */}
            <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C8692F] bg-[#FAF7F2] p-4 text-sm font-semibold text-[#C8692F] cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploadingImage ? "جارٍ رفع الصورة…" : "رفع صورة من الجهاز"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingImage} onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const input = event.target;
                setUploadingImage(true);
                setErrorMessage("");
                const formData = new FormData();
                formData.set("file", file);
                try {
                  const result = await uploadProductImageAction(formData);
                  if (result.success && result.url) setImages((previous) => [...previous, { id: crypto.randomUUID(), url: result.url!, is_cover: previous.length === 0, sort_order: previous.length + 1 }]);
                  else setErrorMessage(result.error || "تعذر رفع الصورة");
                } finally { setUploadingImage(false); input.value = ""; }
              }} />
            </label>
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="أدخلي مسار أو رابط الصورة (مثل /demo-media/...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-[#291D11] hover:bg-[#402F1E] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                إضافة صورة
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] space-y-4"><h3 className="font-bold">الخامة والمقاس والعناية</h3><p className="text-xs text-[#8A7968]">اكتبي البيانات المؤكدة لكل قطعة؛ ستظهر في صفحة المنتج والمعاينة السريعة.</p>{([
            ["material_ar", "الخامة بالعربية"], ["material_en", "الخامة بالإنجليزية"], ["dimensions_ar", "الأبعاد والمقاس بالعربية"], ["dimensions_en", "الأبعاد والمقاس بالإنجليزية"], ["care_instructions_ar", "العناية بالعربية"], ["care_instructions_en", "العناية بالإنجليزية"],
          ] as const).map(([key, label]) => <label className="block text-xs font-semibold" key={key}>{label}<textarea rows={key.startsWith("care") ? 3 : 1} maxLength={1000} className="w-full mt-2 border border-[#E8DED1] rounded-xl p-3 bg-[#FAF7F2]" value={specs[key]} onChange={(event) => setSpecs((previous) => ({ ...previous, [key]: event.target.value }))} /></label>)}</div>
          {/* Variants Card (Colors / Sizes) */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              خيارات وألوان المشغولة (Variants)
            </h3>
            <p className="text-xs text-[#8A7968]">
              أضيفي ألواناً أو أحجاماً مختلفة مع إمكانية تحديد سعر خاص لكل خيار.
            </p>

            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DED1] text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#291D11]">{v.name_ar}</span>
                      {v.name_en && (
                        <span className="text-[#8A7968] mr-2">({v.name_en})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {v.price_override && (
                        <span className="font-mono font-bold text-[#C8692F]">
                          {v.price_override} ج.م
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Variant Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <input
                type="text"
                placeholder="الخيار بالعربية (مثال: كافيه غامق)"
                value={newVariantAr}
                onChange={(e) => setNewVariantAr(e.target.value)}
                className="bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
              />
              <input
                type="text"
                placeholder="بالإنجليزية (Dark Latte)"
                value={newVariantEn}
                onChange={(e) => setNewVariantEn(e.target.value)}
                className="bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
                dir="ltr"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="سعر خاص (اختياري)"
                  value={newVariantPrice}
                  onChange={(e) =>
                    setNewVariantPrice(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
                />
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="bg-[#7A7452] hover:bg-[#635E42] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Status, Production & Publishing Controls */}
        <div className="space-y-6">
          {/* Status & Visibility Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              حالة النشر والظهور
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#E8DED1] cursor-pointer hover:bg-[#FAF7F2]">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === "published"}
                  onChange={() => setStatus("published")}
                  className="accent-[#C8692F]"
                />
                <div>
                  <span className="font-bold text-xs text-[#291D11] block">
                    منشور على المتجر
                  </span>
                  <span className="text-[11px] text-[#8A7968]">
                    يظهر للعملاء ومتاح للإضافة للسلة
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#E8DED1] cursor-pointer hover:bg-[#FAF7F2]">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === "draft"}
                  onChange={() => setStatus("draft")}
                  className="accent-[#C8692F]"
                />
                <div>
                  <span className="font-bold text-xs text-[#291D11] block">
                    مسودة خاصة
                  </span>
                  <span className="text-[11px] text-[#8A7968]">
                    محفوظ للإدارة فقط ولا يظهر في المتجر
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2 border-t border-[#F0EAE1] space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded accent-[#C8692F]"
                />
                <span className="text-xs font-semibold text-[#291D11]">
                  عرض في قسم &quot;المشغولات المميزة&quot; بالرئيسية
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCustomNotes}
                  onChange={(e) => setAllowCustomNotes(e.target.checked)}
                  className="rounded accent-[#C8692F]"
                />
                <span className="text-xs font-semibold text-[#291D11]">
                  السماح للعميل بكتابة طلبات خاصة وألوان مفضلة
                </span>
              </label>
            </div>
          </div>

          {/* Production Type Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              طبيعة الصنع والمخزون
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#E8DED1] cursor-pointer hover:bg-[#FAF7F2]">
                <input
                  type="radio"
                  name="isMadeToOrder"
                  checked={isMadeToOrder}
                  onChange={() => setIsMadeToOrder(true)}
                  className="accent-[#C8692F]"
                />
                <div>
                  <span className="font-bold text-xs text-[#291D11] block">
                    صناعة يدوية بالطلب (Made to Order)
                  </span>
                  <span className="text-[11px] text-[#8A7968]">
                    يتم البدء في حياكتها خصيصاً بعد تأكيد الطلب
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#E8DED1] cursor-pointer hover:bg-[#FAF7F2]">
                <input
                  type="radio"
                  name="isMadeToOrder"
                  checked={!isMadeToOrder}
                  onChange={() => setIsMadeToOrder(false)}
                  className="accent-[#C8692F]"
                />
                <div>
                  <span className="font-bold text-xs text-[#291D11] block">
                    قطعة جاهزة للشحن فوراً (Ready to Ship)
                  </span>
                  <span className="text-[11px] text-[#8A7968]">
                    متوفرة بالفعل في المخزون
                  </span>
                </div>
              </label>
            </div>

            {isMadeToOrder ? (
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-[#291D11]">
                  مدة التجهيز والحياكة (بالأيام)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={preparationDays}
                  onChange={(e) => setPreparationDays(Number(e.target.value))}
                  className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2.5 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
                />
                <span className="text-[11px] text-[#8A7968]">
                  تظهر للعميل في تفاصيل القطعة لمعرفة وقت التسليم المتوقع.
                </span>
              </div>
            ) : (
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-[#291D11]">
                  الكمية المتاحة في المخزون
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stockQuantity}
                  onChange={(e) =>
                    setStockQuantity(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2.5 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="sticky bottom-3 z-20 bg-white/95 backdrop-blur border border-[#E8DED1] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg"><span role="status" className={`text-xs ${errorMessage ? "text-red-700" : "text-[#8A7968]"}`}>{errorMessage || successMessage || (uploadingImage ? "انتظري اكتمال رفع الصورة قبل الحفظ." : "احفظي التعديلات لتظهر في الكتالوج.")}</span><button type="submit" disabled={saving || uploadingImage} className="bg-[#C8692F] text-white rounded-xl px-5 py-2.5 text-xs font-semibold disabled:opacity-50">{saving ? "جارٍ الحفظ…" : "حفظ المشغولة"}</button></div>
    </form>
  );
}
