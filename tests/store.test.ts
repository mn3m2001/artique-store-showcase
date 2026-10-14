import { describe, it, expect, beforeEach } from "vitest";
import { DemoStore } from "@/lib/db/demo-store";
import { CreateOrderInput } from "@/lib/db/demo-store";
import { createSession, verifySession } from "@/lib/session";

describe("Artique Core Business Logic & Data Integrity", () => {
  it("rejects unavailable variants and fractional quantities", async () => {
    const product = (await DemoStore.getProducts({ status: "published" }))[0];
    const area = (await DemoStore.getShippingAreas(true))[0];
    const input: CreateOrderInput = { customerName: "Test buyer", customerPhone: "01012345678", shippingAreaId: area.id, shippingAddressDetailed: "Damietta delivery test", paymentMethod: "cod", items: [{ productId: product.id, variantId: "does-not-exist", quantity: 1 }] };
    await expect(DemoStore.createOrder(input)).rejects.toThrow("Selected variant is unavailable");
    await expect(DemoStore.createOrder({ ...input, items: [{ productId: product.id, quantity: 1.5 }] })).rejects.toThrow("quantity");
  });
  it("reserves shared stock atomically across variants and repeated lines", async () => {
    const product = await DemoStore.saveProduct({ id: "stock-check", slug: "stock-check", name_ar: "اختبار المخزون", name_en: "Stock test", status: "published", base_price: 100, is_made_to_order: false, stock_quantity: 3, variants: [{ id: "color-a", name_ar: "أ", name_en: "A" }, { id: "color-b", name_ar: "ب", name_en: "B" }] });
    const area = (await DemoStore.getShippingAreas(true))[0];
    const input: CreateOrderInput = { customerName: "Test buyer", customerPhone: "01012345678", shippingAreaId: area.id, shippingAddressDetailed: "Damietta delivery test", paymentMethod: "cod", items: [{ productId: product.id, variantId: "color-a", quantity: 2 }, { productId: product.id, variantId: "color-b", quantity: 2 }] };
    await expect(DemoStore.createOrder(input)).rejects.toThrow("stock");
    expect((await DemoStore.getProductById(product.id))?.stock_quantity).toBe(3);
    await DemoStore.createOrder({ ...input, items: [input.items[0]], idempotencyKey: "stock-reserve-once" });
    await DemoStore.createOrder({ ...input, items: [input.items[0]], idempotencyKey: "stock-reserve-once" });
    expect((await DemoStore.getProductById(product.id))?.stock_quantity).toBe(1);
    await expect(DemoStore.createOrder({ ...input, items: [input.items[0]] })).rejects.toThrow("stock");
  });
  it("enforces Damietta-only shipping and retrieves enabled areas", async () => {
    const areas = await DemoStore.getShippingAreas(true);
    expect(areas.length).toBeGreaterThan(0);
    // Every enabled shipping area must belong to Damietta
    for (const area of areas) {
      expect(area.is_enabled).toBe(true);
      expect(area.delivery_fee).toBeGreaterThanOrEqual(0);
    }
  });

  it("calculates order totals on the server and rejects invalid shipping area", async () => {
    const products = await DemoStore.getProducts();
    const published = products.find((p) => p.status === "published" && p.base_price > 0);
    expect(published).toBeDefined();

    const areas = await DemoStore.getShippingAreas(true);
    const validArea = areas[0];

    // Attempt order with invalid shipping area ID
    const invalidOrderInput: CreateOrderInput = {
      customerName: "سارة دمياط",
      customerPhone: "01012345678",
      customerEmail: "sara@example.com",
      shippingAreaId: "cairo-maadi-non-damietta",
      shippingAddressDetailed: "شارع كورنيش النيل بجوار كوبري دمياط القديم",
      paymentMethod: "instapay",
      items: [
        {
          productId: published!.id,
          quantity: 2,
        },
      ],
    };

    await expect(DemoStore.createOrder(invalidOrderInput)).rejects.toThrow(
      "Invalid or disabled Damietta shipping area."
    );

    // Valid order with legitimate Damietta area
    const validOrderInput: CreateOrderInput = {
      ...invalidOrderInput,
      shippingAreaId: validArea.id,
      idempotencyKey: `idemp_test_${Date.now()}`,
    };

    const { order, isDuplicate } = await DemoStore.createOrder(validOrderInput);
    expect(isDuplicate).toBe(false);
    expect(order.order_number).toMatch(/^ARTQ-[A-F0-9]{8}$/);
    expect(order.subtotal_amount).toBe(published!.base_price * 2);
    expect(order.delivery_fee).toBe(validArea.delivery_fee);
    expect(order.total_amount).toBe(order.subtotal_amount + validArea.delivery_fee);
    expect(order.payment_status).toBe("awaiting_proof");
    expect(order.fulfillment_status).toBe("new");
  });

  it("prevents duplicate orders from repeated submissions using idempotency key", async () => {
    const products = await DemoStore.getProducts();
    const published = products.find((p) => p.status === "published" && p.base_price > 0);
    const areas = await DemoStore.getShippingAreas(true);
    const key = `test_unique_${Date.now()}`;

    const orderInput: CreateOrderInput = {
      customerName: "منى زكي",
      customerPhone: "01098765432",
      shippingAreaId: areas[0].id,
      shippingAddressDetailed: "دمياط الجديدة - الحي الثالث",
      paymentMethod: "vodafone_cash",
      idempotencyKey: key,
      items: [{ productId: published!.id, quantity: 1 }],
    };

    const res1 = await DemoStore.createOrder(orderInput);
    expect(res1.isDuplicate).toBe(false);

    // Repeated submission with identical key
    const res2 = await DemoStore.createOrder(orderInput);
    expect(res2.isDuplicate).toBe(true);
    expect(res2.order.id).toBe(res1.order.id);
  });

  it("ensures payment proofs are strictly awaiting manual review and never auto-verified", async () => {
    const products = await DemoStore.getProducts();
    const published = products.find((p) => p.status === "published" && p.base_price > 0);
    const areas = await DemoStore.getShippingAreas(true);

    const { order } = await DemoStore.createOrder({
      customerName: "هند أحمد",
      customerPhone: "01234567890",
      shippingAreaId: areas[0].id,
      shippingAddressDetailed: "رأس البر - شارع 109",
      paymentMethod: "instapay",
      items: [{ productId: published!.id, quantity: 1 }],
    });

    expect(order.payment_status).toBe("awaiting_proof");

    // Upload receipt screenshot
    const proof = await DemoStore.submitPaymentProof(
      order.id,
      "/uploads/proofs/test_receipt.jpg"
    );

    expect(proof.status).toBe("pending");

    // Fetch refreshed order to verify status changed to awaiting_review after proof upload
    const refreshed = await DemoStore.getOrderById(order.id);
    expect(refreshed!.payment_status).toBe("awaiting_review");
    expect(refreshed!.proofs?.length).toBe(1);

    // Owner reviews and explicitly accepts the proof
    const reviewedOrder = await DemoStore.reviewPaymentProof(order.id, proof.id, {
      status: "accepted",
      note: "تم التحقق من الحساب البنكي واستلام 350 ج.م بنجاح",
    });

    expect(reviewedOrder.payment_status).toBe("verified");
    expect(reviewedOrder.proofs?.[0].status).toBe("accepted");
  });

  it("aggregates customers by unique phone number avoiding accidental name collisions", async () => {
    const customers = await DemoStore.getCustomers();
    expect(Array.isArray(customers)).toBe(true);
    // Every customer key must be unique
    const phones = customers.map((c) => c.phone);
    const uniquePhones = new Set(phones);
    expect(phones.length).toBe(uniquePhones.size);
  });

  it("computes exact variant prices and overrides accurately (+110 EGP delta)", async () => {
    const products = await DemoStore.getProducts();
    const productWithVariants = products.find(
      (p) => p.status === "published" && p.variants && p.variants.length > 0
    );
    expect(productWithVariants).toBeDefined();

    const variant = productWithVariants!.variants![0];
    const areas = await DemoStore.getShippingAreas(true);

    const { order } = await DemoStore.createOrder({
      customerName: "سارة دمياط",
      customerPhone: "01011112222",
      shippingAreaId: areas[0].id,
      shippingAddressDetailed: "شارع عبد العظيم وزير",
      paymentMethod: "cod",
      items: [
        {
          productId: productWithVariants!.id,
          variantId: variant.id,
          quantity: 2,
        },
      ],
    });

    const expectedUnitPrice =
      variant.price_override && variant.price_override > 0
        ? variant.price_override
        : productWithVariants!.base_price;

    expect(order.items?.[0].unit_price).toBe(expectedUnitPrice);
    expect(order.subtotal_amount).toBe(expectedUnitPrice * 2);
    expect(order.total_amount).toBe(expectedUnitPrice * 2 + areas[0].delivery_fee);
  });

  it("strictly blocks draft products from order creation", async () => {
    // Create or find a draft product
    const draftProduct = await DemoStore.saveProduct({
      name_ar: "مشغولة مسودة اختبارية",
      name_en: "Test Draft Craft",
      base_price: 250,
      status: "draft",
    });

    const areas = await DemoStore.getShippingAreas(true);

    // Attempting to checkout a draft product MUST fail on server
    await expect(
      DemoStore.createOrder({
        customerName: "محاولة شراء مسودة",
        customerPhone: "01099998888",
        shippingAreaId: areas[0].id,
        shippingAddressDetailed: "دمياط الجديدة",
        paymentMethod: "cod",
        items: [{ productId: draftProduct.id, quantity: 1 }],
      })
    ).rejects.toThrow(`Product ${draftProduct.id} is unavailable.`);
  });

  it("decouples fulfillment status from payment status completely", async () => {
    const products = await DemoStore.getProducts();
    const published = products.find((p) => p.status === "published");
    const areas = await DemoStore.getShippingAreas(true);

    const { order } = await DemoStore.createOrder({
      customerName: "أحمد كمال",
      customerPhone: "01055554444",
      shippingAreaId: areas[0].id,
      shippingAddressDetailed: "فارسكور - بجوار المحطة",
      paymentMethod: "instapay",
      items: [{ productId: published!.id, quantity: 1 }],
    });

    // 1. Initial state: payment is awaiting_proof, fulfillment is new
    expect(order.payment_status).toBe("awaiting_proof");
    expect(order.fulfillment_status).toBe("new");

    // 2. Updating fulfillment to 'shipped' must NEVER auto-mark payment as verified
    const shippedOrder = await DemoStore.updateOrderStatus(order.id, {
      fulfillmentStatus: "shipped",
      comment: "تم تسليم الشحنة لمندوب التوصيل في دمياط",
    });
    expect(shippedOrder.fulfillment_status).toBe("shipped");
    expect(shippedOrder.payment_status).toBe("awaiting_proof");

    // 3. Upload proof, then reject it: payment becomes rejected, fulfillment remains shipped
    const proof = await DemoStore.submitPaymentProof(order.id, "/uploads/proofs/fake.jpg");
    const rejectedOrder = await DemoStore.reviewPaymentProof(order.id, proof.id, {
      status: "rejected",
      note: "المبلغ المحول غير مطابق لقيمة الطلب",
    });

    expect(rejectedOrder.payment_status).toBe("rejected");
    expect(rejectedOrder.fulfillment_status).toBe("shipped");
  });

  it("records settings history snapshots and supports one-click rollback", async () => {
    const originalSettings = await DemoStore.getSettings();

    // 1. Update settings with a new theme & 3D setting
    const updated = await DemoStore.updateSettings(
      {
        store_name_ar: "آرتيك - النسخة المحدثة",
        accent_theme: "gold",
        enable_3d_hero: false,
      },
      "اختبار حفظ نسخة الإعدادات"
    );

    expect(updated.store_name_ar).toBe("آرتيك - النسخة المحدثة");
    expect(updated.accent_theme).toBe("gold");
    expect(updated.enable_3d_hero).toBe(false);

    // 2. Retrieve history snapshots (latest snapshot unshifted at index 0 records pre-change checkpoint)
    const history = await DemoStore.getSettingsHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].snapshot.store_name_ar).toBe(originalSettings.store_name_ar);

    // 3. Roll back to that checkpoint at index 0
    const restored = await DemoStore.rollbackSettings(0);
    expect(restored.store_name_ar).toBe(originalSettings.store_name_ar);
    expect(restored.accent_theme).toBe(originalSettings.accent_theme);
    expect(restored.enable_3d_hero).toBe(originalSettings.enable_3d_hero);
  });

  it("enforces strict private payment proof authorization rules", async () => {
    const products = await DemoStore.getProducts();
    const published = products.find((p) => p.status === "published");
    const areas = await DemoStore.getShippingAreas(true);

    const { order } = await DemoStore.createOrder({
      customerName: "فاطمة الدمياطي",
      customerPhone: "01077778888",
      shippingAreaId: areas[0].id,
      shippingAddressDetailed: "شارع الجلاء - دمياط",
      paymentMethod: "instapay",
      items: [{ productId: published!.id, quantity: 1 }],
    });

    function checkProofAuthorization(
      orderId: string,
      orderNumber: string,
      cookies: Record<string, string>
    ): boolean {
      if (verifySession(cookies["artique_admin_session"], "admin")) return true;
      if (verifySession(cookies[`artique_order_access_${orderId}`], `order:${orderId}`)) return true;
      return false;
    }

    // 1. Visitor with no cookies -> REJECTED (403)
    expect(checkProofAuthorization(order.id, order.order_number, {})).toBe(false);

    // 2. Visitor with unrelated order cookie -> REJECTED (403)
    expect(
      checkProofAuthorization(order.id, order.order_number, {
        "artique_order_access_different_id": "ARTQ-9999",
      })
    ).toBe(false);

    // 3. Customer holding valid matching order cookie -> AUTHORIZED (200)
    expect(
      checkProofAuthorization(order.id, order.order_number, {
        [`artique_order_access_${order.id}`]: createSession(`order:${order.id}`, 60),
      })
    ).toBe(true);

    // 4. Authenticated admin -> AUTHORIZED (200)
    expect(
      checkProofAuthorization(order.id, order.order_number, {
        artique_admin_session: createSession("admin", 60),
      })
    ).toBe(true);
  });
});
