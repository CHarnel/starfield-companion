import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ErrorCode,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';

const PRODUCT_IDS = ['tip_small', 'tip_large'];

export type TipProduct = {
  id: string;
  localizedPrice: string;
};

export function useTipJar() {
  const [products, setProducts] = useState<TipProduct[]>([]);
  const [loading, setLoading] = useState(Platform.OS !== 'web');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [thankedId, setThankedId] = useState<string | null>(null);
  const thankedTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let mounted = true;

    async function setup() {
      try {
        await initConnection();
        const fetched = await fetchProducts({ skus: PRODUCT_IDS });
        if (!mounted || !fetched) return;
        const mapped = PRODUCT_IDS.map((id) => {
          const p = fetched.find((f) => f.id === id);
          return p ? { id, localizedPrice: p.displayPrice } : null;
        }).filter((p): p is TipProduct => p !== null);
        setProducts(mapped);
      } catch (e) {
        console.warn('IAP init failed:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    setup();

    const purchaseListener = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        try {
          await finishTransaction({ purchase, isConsumable: true });
        } catch (e) {
          console.warn('finishTransaction error:', e);
        }
        if (!mounted) return;
        setPurchasingId(null);
        setThankedId(purchase.productId);
        thankedTimer.current = setTimeout(() => {
          if (mounted) setThankedId(null);
        }, 2000);
      },
    );

    const errorListener = purchaseErrorListener((error: PurchaseError) => {
      if (error.code !== ErrorCode.UserCancelled) {
        console.warn('Purchase error:', error.message);
      }
      if (mounted) setPurchasingId(null);
    });

    return () => {
      mounted = false;
      purchaseListener.remove();
      errorListener.remove();
      if (thankedTimer.current) clearTimeout(thankedTimer.current);
      endConnection();
    };
  }, []);

  const purchase = useCallback(
    (productId: string) => {
      if (Platform.OS === 'web' || purchasingId) return;
      setPurchasingId(productId);
      requestPurchase({
        type: 'in-app',
        request: {
          apple: { sku: productId },
          google: { skus: [productId] },
        },
      }).catch(() => {
        setPurchasingId(null);
      });
    },
    [purchasingId],
  );

  return { products, purchase, loading, purchasingId, thankedId };
}
