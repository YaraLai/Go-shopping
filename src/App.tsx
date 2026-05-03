import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  ListTodo,
  Gift,
  History as HistoryIcon,
  PlusCircle,
  TrendingDown,
  Plus,
  ClipboardList,
  ShoppingCart,
  CheckCircle,
  Store,
  ExternalLink,
  LineChart,
  Trash2,
  PackageOpen,
  Edit,
  MapPin,
  Calendar,
  X,
  TrendingUp,
  Heart,
  Tags,
} from "lucide-react";

type Category = "食物" | "日常生活用品";
type Currency = "TWD" | "JPY" | "USD";

interface PlanItem {
  id: string;
  name: string;
  location: string;
  category: string;
  price: string;
  checked: boolean;
}

interface WishItem {
  id: string;
  name: string;
  store: string;
  currency: Currency;
  budget: number | "";
  link: string;
  category: string;
  checked: boolean;
  actualPrice: string;
}

interface HistoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  date: string;
}

const defaultHistory: HistoryItem[] = [
  {
    id: "h1",
    name: "鮮乳 (全脂 1858ml)",
    category: "食物",
    location: "全聯",
    price: 189,
    date: "2026-04-01",
  },
  {
    id: "h2",
    name: "鮮乳 (全脂 1858ml)",
    category: "食物",
    location: "家樂福",
    price: 175,
    date: "2026-03-15",
  },
  {
    id: "h3",
    name: "衛生紙 (110抽x72包)",
    category: "日常生活用品",
    location: "好市多",
    price: 359,
    date: "2026-03-20",
  },
  {
    id: "h4",
    name: "洗選蛋 (10入)",
    category: "食物",
    location: "傳統市場",
    price: 60,
    date: "2026-04-03",
  },
];

const exchangeRates = {
  TWD: 1,
  JPY: 0.21,
  USD: 32.5,
};

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

export default function App() {
  const [planItems, setPlanItems] = useLocalStorage<PlanItem[]>(
    "shoppingPlanV2",
    [],
  );
  const [historyItems, setHistoryItems] = useLocalStorage<HistoryItem[]>(
    "shoppingHistoryV2",
    defaultHistory,
  );
  const [wishItems, setWishItems] = useLocalStorage<WishItem[]>(
    "shoppingWishV2",
    [],
  );

  const [currentMainTab, setCurrentMainTab] = useLocalStorage(
    "shoppingAppCurrentMainTab",
    "shopping-list",
  );
  const [currentCategoryTab, setCurrentCategoryTab] = useLocalStorage(
    "shoppingAppCurrentCategoryTab",
    "食物",
  );

  const [draftPlan, setDraftPlan] = useLocalStorage("shoppingAppDraft", {
    name: "",
    location: "",
    category: "食物",
  });
  const [draftWish, setDraftWish] = useLocalStorage("shoppingAppWishDraft", {
    name: "",
    store: "",
    currency: "TWD",
    budget: "",
    link: "",
    category: "食物",
  });

  const [modalItemName, setModalItemName] = useState<string | null>(null);
  const [editingPlanItem, setEditingPlanItem] = useState<PlanItem | null>(null);
  const [editingWishItem, setEditingWishItem] = useState<WishItem | null>(null);

  // Computed History Hints
  const planNameQuery = draftPlan.name.trim();
  const planHistoryHint = useMemo(() => {
    if (!planNameQuery) return null;
    const matches = historyItems.filter(
      (item) =>
        item.name.includes(planNameQuery) || planNameQuery.includes(item.name),
    );
    if (matches.length > 0) {
      return matches.reduce(
        (min, p) => (p.price < min.price ? p : min),
        matches[0],
      );
    }
    return null;
  }, [planNameQuery, historyItems]);

  const wishNameQuery = draftWish.name.trim();
  const wishHistoryHint = useMemo(() => {
    if (!wishNameQuery) return null;
    const matches = historyItems.filter(
      (item) =>
        item.name.includes(wishNameQuery) || wishNameQuery.includes(item.name),
    );
    if (matches.length > 0) {
      return matches.reduce(
        (min, p) => (p.price < min.price ? p : min),
        matches[0],
      );
    }
    return null;
  }, [wishNameQuery, historyItems]);

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPlan.name.trim()) return;
    setPlanItems([
      ...planItems,
      {
        id: "p" + Date.now(),
        name: draftPlan.name.trim(),
        location: draftPlan.location.trim(),
        category: draftPlan.category,
        price: "",
        checked: false,
      },
    ]);
    setDraftPlan({ name: "", location: "", category: draftPlan.category });
  };

  const savePlanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlanItem) {
      setPlanItems(
        planItems.map((item) =>
          item.id === editingPlanItem.id ? editingPlanItem : item,
        ),
      );
      setEditingPlanItem(null);
    }
  };

  const saveWishEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWishItem) {
      setWishItems(
        wishItems.map((item) =>
          item.id === editingWishItem.id ? editingWishItem : item,
        ),
      );
      setEditingWishItem(null);
    }
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(draftWish.budget as string);
    if (!draftWish.name.trim() || !draftWish.store.trim() || isNaN(budgetNum))
      return;
    setWishItems([
      ...wishItems,
      {
        id: "w" + Date.now(),
        name: draftWish.name.trim(),
        store: draftWish.store.trim(),
        currency: draftWish.currency as Currency,
        budget: budgetNum,
        link: draftWish.link.trim(),
        category: draftWish.category,
        checked: false,
        actualPrice: "",
      },
    ]);
    setDraftWish({
      name: "",
      store: "",
      currency: draftWish.currency,
      budget: "",
      link: "",
      category: draftWish.category,
    });
  };

  const togglePlanItem = (id: string, checked: boolean) => {
    setPlanItems(
      planItems.map((item) => (item.id === id ? { ...item, checked } : item)),
    );
  };

  const updatePlanPrice = (id: string, price: string) => {
    setPlanItems(
      planItems.map((item) => {
        if (item.id === id) {
          const checked =
            parseFloat(price) > 0 && !item.checked ? true : item.checked;
          return { ...item, price, checked };
        }
        return item;
      }),
    );
  };

  const deletePlanItem = (id: string) => {
    setPlanItems(planItems.filter((item) => item.id !== id));
  };

  const checkoutSelectedPlan = () => {
    const checkedItems = planItems.filter((i) => i.checked);
    const invalidItems = checkedItems.filter(
      (i) => !i.price || parseFloat(i.price) <= 0,
    );
    if (invalidItems.length > 0) {
      alert("請確認所有勾選的物品都已填寫實際購買金額！");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const newHistory = checkedItems.map((item) => ({
      id: "h" + Date.now() + Math.random().toString(36).substr(2, 5),
      name: item.name,
      category: item.category,
      location: item.location || "未指定地點",
      price: parseFloat(item.price),
      date: today,
    }));

    setHistoryItems([...historyItems, ...newHistory]);
    setPlanItems(planItems.filter((i) => !i.checked));
    alert("已成功儲存至歷史紀錄！");
    setCurrentMainTab("history-list");
  };

  const toggleWishItem = (id: string, checked: boolean) => {
    setWishItems(
      wishItems.map((item) => {
        if (item.id === id) {
          const actualPrice =
            checked &&
            (item.actualPrice === undefined || item.actualPrice === "")
              ? String(item.budget)
              : item.actualPrice;
          return { ...item, checked, actualPrice };
        }
        return item;
      }),
    );
  };

  const updateWishPrice = (id: string, actualPrice: string) => {
    setWishItems(
      wishItems.map((item) => {
        if (item.id === id) {
          const checked =
            parseFloat(actualPrice) > 0 && !item.checked ? true : item.checked;
          return { ...item, actualPrice, checked };
        }
        return item;
      }),
    );
  };

  const deleteWishItem = (id: string) => {
    if (window.confirm("確定要從非必要清單刪除此物品嗎？")) {
      setWishItems(wishItems.filter((item) => item.id !== id));
    }
  };

  const checkoutSelectedWish = () => {
    const checkedItems = wishItems.filter((i) => i.checked);
    const invalidItems = checkedItems.filter((i) => {
      const p =
        i.actualPrice !== undefined && i.actualPrice !== ""
          ? parseFloat(i.actualPrice)
          : parseFloat(String(i.budget));
      return isNaN(p) || p <= 0;
    });

    if (invalidItems.length > 0) {
      alert("請確認所有勾選的物品都已填寫金額！");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const newHistory = checkedItems.map((item) => {
      const finalPriceLocal =
        item.actualPrice !== undefined && item.actualPrice !== ""
          ? parseFloat(item.actualPrice)
          : parseFloat(String(item.budget));
      const finalPriceTWD = Math.round(
        finalPriceLocal * exchangeRates[item.currency],
      );
      return {
        id: "h" + Date.now() + Math.random().toString(36).substr(2, 5),
        name: item.name,
        category: item.category || "日常生活用品",
        location: item.store || "未指定地點",
        price: finalPriceTWD,
        date: today,
      };
    });

    setHistoryItems([...historyItems, ...newHistory]);
    setWishItems(wishItems.filter((i) => !i.checked));
    alert("已成功儲存至歷史紀錄！(外幣金額已自動轉換為台幣儲存)");
    setCurrentMainTab("history-list");
  };

  const deleteHistoryItem = (id: string) => {
    if (window.confirm("確定要刪除這筆歷史紀錄嗎？無法復原喔！")) {
      setHistoryItems(historyItems.filter((i) => i.id !== id));
    }
  };

  const planCheckedAmount = planItems.reduce(
    (sum, item) =>
      item.checked && item.price ? sum + parseFloat(item.price) : sum,
    0,
  );
  const planHasChecked = planItems.some((i) => i.checked);

  const wishTotalTwd = wishItems.reduce((sum, item) => {
    if (item.checked) {
      const currentPrice =
        item.actualPrice !== undefined && item.actualPrice !== ""
          ? parseFloat(item.actualPrice)
          : parseFloat(String(item.budget));
      return sum + Math.round(currentPrice * exchangeRates[item.currency]);
    }
    return sum;
  }, 0);
  const wishHasChecked = wishItems.some((i) => i.checked);

  const modalHistoryRecords = useMemo(() => {
    if (!modalItemName) return [];
    return historyItems
      .filter((item) => item.name === modalItemName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [historyItems, modalItemName]);

  const modalPriceStats = useMemo(() => {
    if (modalHistoryRecords.length === 0) return { min: 0, max: 0, avg: 0 };
    const prices = modalHistoryRecords.map((r) => r.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    };
  }, [modalHistoryRecords]);

  return (
    <div className="bg-[#F2E8DF] text-[#4A525A] font-sans pb-24 selection:bg-[#E5DACE] selection:text-[#4a4a35] min-h-screen flex flex-col">
      <header className="bg-[#F2E8DF] text-[#4A525A] sticky top-0 z-20 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="py-4 flex items-center justify-center relative">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6" />
              <h1 className="text-xl font-serif italic tracking-wide text-[#5A5A40]">
                Go shopping
              </h1>
            </div>
          </div>
          <div className="flex border-b border-[#E5DACE] text-center uppercase tracking-widest text-sm">
            <button
              onClick={() => setCurrentMainTab("shopping-list")}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${currentMainTab === "shopping-list" ? "border-[#C97D60] text-[#C97D60]" : "border-transparent text-[#828E7D] hover:text-[#F2E8DF]"}`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ListTodo className="w-4 h-4" />
                <span>預計採買</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentMainTab("wish-list")}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${currentMainTab === "wish-list" ? "border-[#C97D60] text-[#C97D60]" : "border-transparent text-[#828E7D] hover:text-[#F2E8DF]"}`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Gift className="w-4 h-4" />
                <span>非必要清單</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentMainTab("history-list")}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${currentMainTab === "history-list" ? "border-[#C97D60] text-[#C97D60]" : "border-transparent text-[#828E7D] hover:text-[#F2E8DF]"}`}
            >
              <div className="flex items-center justify-center space-x-2">
                <HistoryIcon className="w-4 h-4" />
                <span>歷史紀錄</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex-1 w-full relative">
        {currentMainTab === "shopping-list" && (
          <div className="fade-in space-y-4">
            <div className="bg-[#FDFBF7] p-5 rounded-[32px]  border border-[#E5DACE] mb-6">
              <h2 className="text-lg font-bold text-[#5A5A40] flex items-center mb-4">
                <PlusCircle className="w-5 h-5 mr-2 text-[#828E7D]" />{" "}
                新增預計採買
              </h2>
              <form onSubmit={handleAddPlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="物品名稱 (例：鮮乳 1858ml)"
                      required
                      value={draftPlan.name}
                      onChange={(e) =>
                        setDraftPlan({ ...draftPlan, name: e.target.value })
                      }
                      className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#828E7D] outline-none transition text-sm"
                    />
                    {planHistoryHint && (
                      <div className="absolute -bottom-6 left-1 text-[11px] font-medium text-[#828E7D] flex items-center bg-[#F9F4F0] px-2 py-0.5 rounded-full border border-[#E5DACE]">
                        <TrendingDown className="w-3 h-3 mr-1" /> 歷史最低: $
                        {planHistoryHint.price} ({planHistoryHint.location})
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="地點 (選填)"
                      value={draftPlan.location}
                      onChange={(e) =>
                        setDraftPlan({ ...draftPlan, location: e.target.value })
                      }
                      className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#828E7D] outline-none transition text-sm flex-1"
                    />
                    <button
                      type="submit"
                      className="bg-[#5A5A40] text-[#F2E8DF] p-3 rounded-[16px] hover:bg-[#4a4a35] transition active:scale-95 shrink-0 flex items-center justify-center w-12 cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="plan-category"
                      value="食物"
                      className="peer sr-only"
                      checked={draftPlan.category === "食物"}
                      onChange={() =>
                        setDraftPlan({ ...draftPlan, category: "食物" })
                      }
                    />
                    <div className="text-center p-2 rounded-[16px] border border-[#E5DACE] peer-checked:bg-[#FDFBF7] peer-checked:border-[#C97D60] peer-checked:text-[#C97D60] text-sm font-medium transition cursor-pointer">
                      🍔 食物
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="plan-category"
                      value="日常生活用品"
                      className="peer sr-only"
                      checked={draftPlan.category === "日常生活用品"}
                      onChange={() =>
                        setDraftPlan({ ...draftPlan, category: "日常生活用品" })
                      }
                    />
                    <div className="text-center p-2 rounded-[16px] border border-[#E5DACE] peer-checked:bg-[#FDFBF7] peer-checked:border-[#5A5A40] peer-checked:text-[#4A525A] text-sm font-medium transition cursor-pointer">
                      🧻 日用品
                    </div>
                  </label>
                </div>
              </form>
            </div>

            <h2 className="text-lg font-bold text-[#5A5A40] flex items-center">
              <ClipboardList className="w-5 h-5 mr-2" /> 待買清單
            </h2>

            {planItems.length === 0 && (
              <div className="text-center py-10 text-[#8C7A6B] bg-[#FDFBF7] rounded-[32px] border border-[#E5DACE] border-dashed">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">目前沒有預計採買的物品</p>
              </div>
            )}

            <div className="space-y-3">
              {planItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-[#FDFBF7] p-4 rounded-[32px]  border ${item.checked ? "border-[#E5DACE] ring-1 ring-[#E5DACE] bg-[#F9F4F0]" : "border-[#E5DACE]"} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <label className="relative cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        className="custom-checkbox peer sr-only"
                        checked={item.checked}
                        onChange={(e) =>
                          togglePlanItem(item.id, e.target.checked)
                        }
                      />
                      <div className="w-6 h-6 rounded-md border-2 border-[#E5DACE] flex items-center justify-center bg-[#FDFBF7] transition-colors peer-checked:bg-[#5A5A40] peer-checked:border-[#5A5A40]">
                        <svg
                          className="w-4 h-4 text-white hidden peer-checked:block pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </label>

                    <div className="flex-1 min-w-0 pr-2">
                      <h3
                        className={`font-bold text-[#4A525A] break-words leading-snug ${item.checked ? "line-through text-[#828E7D]" : ""}`}
                      >
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center text-xs text-[#7C8578] mt-2 gap-2">
                        <span
                          className={`${item.category === "食物" ? "text-[#C97D60] bg-[#FDFBF7]" : "text-[#5A5A40] bg-[#FDFBF7]"} px-2 py-0.5 rounded-md font-medium`}
                        >
                          {item.category}
                        </span>
                        {item.location && (
                          <span className="flex items-center bg-[#E5DACE] px-2 py-0.5 rounded-md max-w-full">
                            <MapPin className="w-3 h-3 mr-0.5 shrink-0" />
                            <span className="break-all">{item.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center space-x-1">
                      <span className="text-[#828E7D] font-medium">$</span>
                      <input
                        type="number"
                        value={item.price}
                        placeholder="0"
                        min="0"
                        onChange={(e) =>
                          updatePlanPrice(item.id, e.target.value)
                        }
                        className={`w-16 sm:w-20 border-b-2 ${item.checked ? "border-[#828E7D] bg-[#FDFBF7]" : "border-[#E5DACE] bg-[#F2E8DF]"} p-1 text-center font-bold text-[#4A525A] outline-none focus:border-[#5A5A40] transition-colors`}
                      />
                      <button
                        onClick={() => setEditingPlanItem(item)}
                        className="text-[#8C7A6B] hover:text-[#5A5A40] p-1 shrink-0 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePlanItem(item.id)}
                        className="text-[#8C7A6B] hover:text-[#C97D60] p-1 shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`fixed bottom-0 left-0 right-0 bg-[#FDFBF7] border-t border-[#E5DACE] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 transition-transform duration-300 z-10 flex justify-between items-center px-4 md:px-auto max-w-4xl mx-auto ${planHasChecked ? "translate-y-0" : "translate-y-full"}`}
            >
              <div>
                <div className="text-xs text-[#828E7D] font-medium">
                  已勾選合計
                </div>
                <div className="text-2xl font-black text-[#5A5A40]">
                  ${planCheckedAmount}
                </div>
              </div>
              <button
                onClick={checkoutSelectedPlan}
                className="bg-[#5A5A40] text-[#F2E8DF] px-6 py-3 rounded-[16px] font-medium hover:bg-[#4a4a35] active:scale-95 transition-transform flex items-center shadow-md shadow-[#5a5a4033] cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 mr-2" /> 一鍵儲存至紀錄
              </button>
            </div>
          </div>
        )}

        {currentMainTab === "wish-list" && (
          <div className="fade-in space-y-4">
            <div className="bg-[#FDFBF7] p-5 rounded-[32px]  border border-[#E5DACE] mb-6">
              <h2 className="text-lg font-bold text-[#5A5A40] flex items-center mb-4">
                <Gift className="w-5 h-5 mr-2 text-[#C97D60]" /> 新增非必要購物
              </h2>
              <form onSubmit={handleAddWish} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="物品名稱 (可自由輸入長度)"
                      required
                      value={draftWish.name}
                      onChange={(e) =>
                        setDraftWish({ ...draftWish, name: e.target.value })
                      }
                      className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none transition text-sm"
                    />
                    {wishHistoryHint && (
                      <div className="absolute -bottom-6 left-1 text-[11px] font-medium text-[#828E7D] flex items-center bg-[#F9F4F0] px-2 py-0.5 rounded-full border border-[#E5DACE]">
                        <TrendingDown className="w-3 h-3 mr-1" /> 歷史最低: $
                        {wishHistoryHint.price} ({wishHistoryHint.location})
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="店家名稱 (自訂)"
                      required
                      value={draftWish.store}
                      onChange={(e) =>
                        setDraftWish({ ...draftWish, store: e.target.value })
                      }
                      className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none transition text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex space-x-2">
                    <select
                      value={draftWish.currency}
                      onChange={(e) =>
                        setDraftWish({ ...draftWish, currency: e.target.value })
                      }
                      className="border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none transition text-sm bg-[#FDFBF7] cursor-pointer"
                    >
                      <option value="TWD">台幣 (TWD)</option>
                      <option value="JPY">日圓 (JPY)</option>
                      <option value="USD">美元 (USD)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="預算金額"
                      min="0"
                      step="any"
                      required
                      value={draftWish.budget}
                      onChange={(e) =>
                        setDraftWish({ ...draftWish, budget: e.target.value })
                      }
                      className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none transition text-sm flex-1"
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="商品連結 (選填) https://..."
                      value={draftWish.link}
                      onChange={(e) =>
                        setDraftWish({ ...draftWish, link: e.target.value })
                      }
                      className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none transition text-sm"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="wish-category"
                      value="食物"
                      className="peer sr-only"
                      checked={draftWish.category === "食物"}
                      onChange={() =>
                        setDraftWish({ ...draftWish, category: "食物" })
                      }
                    />
                    <div className="text-center p-2 rounded-[16px] border border-[#E5DACE] peer-checked:bg-[#FDFBF7] peer-checked:border-[#C97D60] peer-checked:text-[#C97D60] text-sm font-medium transition cursor-pointer">
                      🍔 食物
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="wish-category"
                      value="日常生活用品"
                      className="peer sr-only"
                      checked={draftWish.category === "日常生活用品"}
                      onChange={() =>
                        setDraftWish({ ...draftWish, category: "日常生活用品" })
                      }
                    />
                    <div className="text-center p-2 rounded-[16px] border border-[#E5DACE] peer-checked:bg-[#FDFBF7] peer-checked:border-[#5A5A40] peer-checked:text-[#4A525A] text-sm font-medium transition cursor-pointer">
                      🧻 日用品
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C97D60] text-[#F2E8DF] p-3 rounded-[16px] hover:bg-[#A86146] transition active:scale-95 flex items-center justify-center shadow-md shadow-[#c97d6033] font-medium cursor-pointer"
                >
                  <Plus className="w-5 h-5 mr-2" /> 加入清單
                </button>
              </form>
            </div>

            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-[#5A5A40] flex items-center">
                <Heart className="w-5 h-5 mr-2" /> 購物清單{" "}
                <span className="text-xs text-[#8C7A6B] ml-2 font-normal">
                  (依店家排序)
                </span>
              </h2>
            </div>

            {wishItems.length === 0 && (
              <div className="text-center py-10 text-[#8C7A6B] bg-[#FDFBF7] rounded-[32px] border border-[#E5DACE] border-dashed">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">目前沒有非必要購物的物品</p>
              </div>
            )}

            <div className="space-y-3">
              {[...wishItems]
                .sort((a, b) => a.store.localeCompare(b.store))
                .map((item) => {
                  const currentPrice =
                    item.actualPrice !== undefined && item.actualPrice !== ""
                      ? parseFloat(item.actualPrice)
                      : parseFloat(String(item.budget));
                  const twdAmount = Math.round(
                    currentPrice * exchangeRates[item.currency],
                  );
                  const currencySymbol =
                    item.currency === "JPY"
                      ? "¥"
                      : item.currency === "USD"
                        ? "$"
                        : "NT$";

                  return (
                    <div
                      key={item.id}
                      className={`bg-[#FDFBF7] p-4 rounded-[32px]  border ${item.checked ? "border-[#C97D60] ring-1 ring-[#E5DACE] bg-[#F9F4F0]" : "border-[#E5DACE]"} transition-all hover:shadow-md flex flex-col`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <label className="relative cursor-pointer shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            className="custom-checkbox peer sr-only"
                            checked={item.checked}
                            onChange={(e) =>
                              toggleWishItem(item.id, e.target.checked)
                            }
                          />
                          <div className="w-6 h-6 rounded-md border-2 border-[#E5DACE] flex items-center justify-center bg-[#FDFBF7] transition-colors peer-checked:bg-[#C97D60] peer-checked:border-[#C97D60]">
                            <svg
                              className="w-4 h-4 text-white hidden peer-checked:block pointer-events-none"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </label>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-[#4A525A] break-words leading-snug ${item.checked ? "line-through text-[#828E7D]" : ""}`}
                          >
                            {item.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#7C8578]">
                            <span
                              className={`${!item.category || item.category === "食物" ? "text-[#C97D60] bg-[#FDFBF7]" : "text-[#5A5A40] bg-[#FDFBF7]"} font-medium px-2 py-0.5 rounded-md`}
                            >
                              {item.category || "食物"}
                            </span>
                            <span className="flex items-center bg-[#E5DACE] px-2 py-0.5 rounded-md max-w-full">
                              <Store className="w-4 h-4 mr-1 text-[#8C7A6B] shrink-0" />
                              <span className="font-medium break-all">
                                {item.store}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end space-x-1">
                            <span className="text-sm font-medium text-[#828E7D]">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              value={currentPrice}
                              placeholder="0"
                              min="0"
                              step="any"
                              onChange={(e) =>
                                updateWishPrice(item.id, e.target.value)
                              }
                              className={`w-16 sm:w-20 border-b-2 ${item.checked ? "border-[#C97D60] bg-[#FDFBF7] text-[#C97D60]" : "border-[#E5DACE] bg-[#F2E8DF] text-[#4A525A]"} p-1 text-right font-bold outline-none focus:border-[#C97D60] transition-colors`}
                            />
                          </div>
                          <div className="text-xs text-[#828E7D] mt-1">
                            (約 NT$ {twdAmount})
                          </div>
                        </div>
                      </div>

                      <div
                        className={`mt-2 pt-3 border-t ${item.checked ? "border-[#E5DACE]" : "border-slate-50"} flex flex-wrap justify-between items-center gap-2`}
                      >
                        <div className="flex flex-wrap gap-2 flex-1">
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#5A5A40] hover:text-[#4a4a35] flex items-center justify-center text-sm font-medium bg-[#FDFBF7] hover:bg-[#F9F4F0] px-2 py-1.5 rounded-lg transition-colors truncate max-w-[150px] sm:max-w-full"
                            >
                              <ExternalLink className="w-4 h-4 mr-1 shrink-0" />{" "}
                              <span className="truncate">開啟連結</span>
                            </a>
                          ) : (
                            <span className="text-sm text-[#8C7A6B] px-2 py-1.5 bg-[#F2E8DF] rounded-lg shrink-0">
                              無連結
                            </span>
                          )}
                          <button
                            onClick={() => setModalItemName(item.name)}
                            className="text-[#5A5A40] flex items-center text-sm font-medium hover:text-[#4a4a35] bg-[#F9F4F0] hover:bg-[#E5DACE] px-2 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                          >
                            <LineChart className="w-4 h-4 mr-1" /> 歷史比價
                          </button>
                        </div>
                        <button
                          onClick={() => setEditingWishItem(item)}
                          className="text-[#C97D60] hover:text-[#A86146] p-1.5 bg-[#FDFBF7] hover:bg-[#E5DACE] rounded-lg transition-colors shrink-0 ml-auto cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteWishItem(item.id)}
                          className="text-[#C97D60] hover:text-[#C97D60] p-1.5 bg-[#FDFBF7] hover:bg-[#E5DACE] rounded-lg transition-colors shrink-0 ml-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div
              className={`fixed bottom-0 left-0 right-0 bg-[#FDFBF7] border-t border-[#E5DACE] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 transition-transform duration-300 z-10 flex justify-between items-center px-4 md:px-auto max-w-4xl mx-auto ${wishHasChecked ? "translate-y-0" : "translate-y-full"}`}
            >
              <div>
                <div className="text-xs text-[#828E7D] font-medium">
                  已勾選合計 (約略台幣)
                </div>
                <div className="text-2xl font-black text-[#C97D60]">
                  NT$ {wishTotalTwd}
                </div>
              </div>
              <button
                onClick={checkoutSelectedWish}
                className="bg-[#C97D60] text-[#F2E8DF] px-6 py-3 rounded-[16px] font-medium hover:bg-[#A86146] active:scale-95 transition-transform flex items-center shadow-md shadow-[#c97d6033] cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 mr-2" /> 儲存至紀錄
              </button>
            </div>
          </div>
        )}

        {currentMainTab === "history-list" && (
          <div className="fade-in space-y-4">
            <div className="bg-[#FDFBF7] rounded-[16px] p-1  border border-[#E5DACE] flex mb-4">
              <button
                onClick={() => setCurrentCategoryTab("食物")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentCategoryTab === "食物" ? "bg-[#F9F4F0] text-[#C97D60]" : "text-[#828E7D] hover:text-[#5A5A40] bg-transparent"}`}
              >
                🍔 食物
              </button>
              <button
                onClick={() => setCurrentCategoryTab("日常生活用品")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentCategoryTab === "日常生活用品" ? "bg-[#F9F4F0] text-[#4A525A]" : "text-[#828E7D] hover:text-[#5A5A40] bg-transparent"}`}
              >
                🧻 日常用品
              </button>
            </div>

            {historyItems.filter((item) => item.category === currentCategoryTab)
              .length === 0 && (
              <div className="text-center py-12 text-[#8C7A6B] bg-[#FDFBF7] rounded-[32px] border border-[#E5DACE] border-dashed">
                <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">這個分類目前沒有紀錄</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyItems
                .filter((item) => item.category === currentCategoryTab)
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FDFBF7] p-4 rounded-[32px]  border border-[#E5DACE] relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-2">
                        <h3 className="font-bold text-[#4A525A] break-words leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      <div className="text-xl font-black text-[#4A525A] shrink-0">
                        ${item.price}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-[#828E7D] gap-3 mt-2">
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />{" "}
                        <span className="break-all">{item.location}</span>
                      </div>
                      <div className="flex items-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 mr-1" /> {item.date}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                      <button
                        onClick={() => setModalItemName(item.name)}
                        className="text-[#5A5A40] flex items-center text-sm font-medium hover:text-[#4a4a35] active:scale-95 bg-[#F9F4F0] px-2 py-1 rounded-lg cursor-pointer"
                      >
                        <LineChart className="w-4 h-4 mr-1" /> 歷史比價
                      </button>
                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="text-[#E5DACE] hover:text-[#C97D60] p-1 bg-[#FDFBF7] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {modalItemName && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 fade-in font-sans pb-safe">
          <div className="bg-[#F2E8DF] sm:rounded-3xl rounded-t-3xl w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col slide-up">
            <div className="bg-[#FDFBF7] p-4 border-b flex justify-between items-center sticky top-0 z-10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#4A525A]">
                  {modalItemName}
                </h2>
                <p className="text-sm text-[#828E7D]">歷史價格分析</p>
              </div>
              <button
                onClick={() => setModalItemName(null)}
                className="bg-[#E5DACE] hover:bg-[#C97D60] hover:text-[#F2E8DF] p-2 rounded-full transition text-[#7C8578] active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 no-scrollbar">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#F9F4F0] border border-[#E5DACE] rounded-[32px] p-2 sm:p-3 text-center">
                  <div className="text-[#828E7D] text-[10px] sm:text-xs font-bold mb-1 flex justify-center items-center">
                    <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{" "}
                    最低價
                  </div>
                  <div className="text-lg sm:text-xl font-black text-[#5A5A40]">
                    ${modalPriceStats.min}
                  </div>
                </div>
                <div className="bg-[#E5DACE] border border-[#E5DACE] rounded-[32px] p-2 sm:p-3 text-center">
                  <div className="text-[#828E7D] text-[10px] sm:text-xs font-bold mb-1">
                    平均價
                  </div>
                  <div className="text-lg sm:text-xl font-black text-[#5A5A40]">
                    ${modalPriceStats.avg}
                  </div>
                </div>
                <div className="bg-[#FDFBF7] border border-[#E5DACE] rounded-[32px] p-2 sm:p-3 text-center">
                  <div className="text-[#C97D60] text-[10px] sm:text-xs font-bold mb-1 flex justify-center items-center">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 最高價
                  </div>
                  <div className="text-lg sm:text-xl font-black text-[#A86146]">
                    ${modalPriceStats.max}
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-[#5A5A40] mb-3 flex items-center">
                <Tags className="w-5 h-5 mr-2" /> 購買紀錄 (
                {modalHistoryRecords.length}筆)
              </h3>
              <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E5DACE] before:to-transparent pb-6">
                {modalHistoryRecords.map((record) => {
                  const isLowest = record.price === modalPriceStats.min;
                  return (
                    <div
                      key={record.id}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2  z-10 ${isLowest ? "bg-[#828E7D]" : "bg-[#E5DACE]"}`}
                      >
                        {isLowest && (
                          <TrendingDown className="w-4 h-4 text-[#F2E8DF]" />
                        )}
                      </div>
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-[32px] border bg-[#FDFBF7]  ml-4 md:ml-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[#4A525A] break-words pr-2">
                            {record.location}
                          </span>
                          <span
                            className={`text-lg font-black shrink-0 ${isLowest ? "text-[#828E7D]" : "text-[#5A5A40]"}`}
                          >
                            ${record.price}
                          </span>
                        </div>
                        <div className="text-sm text-[#828E7D]">
                          {record.date}
                        </div>
                        {isLowest && (
                          <div className="mt-2 text-xs font-medium text-[#828E7D] bg-[#F9F4F0] inline-block px-2 py-1 rounded-md">
                            歷史最低價！✨
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPlanItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in font-sans">
          <div className="bg-[#FDFBF7] p-6 rounded-[32px] w-full max-w-md shadow-2xl relative slide-up border border-[#E5DACE]">
            <button onClick={() => setEditingPlanItem(null)} className="absolute right-4 top-4 text-[#8C7A6B] hover:text-[#5A5A40] p-2 hover:bg-[#E5DACE] rounded-full transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#5A5A40] mb-4">編輯預計採買</h2>
            <form onSubmit={savePlanEdit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#7C8578] mb-1">名稱</label>
                <input type="text" value={editingPlanItem.name} onChange={e => setEditingPlanItem({...editingPlanItem, name: e.target.value})} className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#5A5A40] outline-none" required />
              </div>
              <div>
                <label className="block text-sm text-[#7C8578] mb-1">地點 (選填)</label>
                <input type="text" value={editingPlanItem.location} onChange={e => setEditingPlanItem({...editingPlanItem, location: e.target.value})} className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#5A5A40] outline-none" />
              </div>
              <div className="flex space-x-3 mt-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" value="食物" checked={editingPlanItem.category === '食物'} onChange={() => setEditingPlanItem({...editingPlanItem, category: '食物'})} className="peer sr-only" />
                  <div className="text-center p-2 rounded-[16px] border border-[#E5DACE] peer-checked:bg-[#FDFBF7] peer-checked:border-[#C97D60] peer-checked:text-[#C97D60] text-sm font-medium transition">🍔 食物</div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" value="日常生活用品" checked={editingPlanItem.category === '日常生活用品'} onChange={() => setEditingPlanItem({...editingPlanItem, category: '日常生活用品'})} className="peer sr-only" />
                  <div className="text-center p-2 rounded-[16px] border border-[#E5DACE] peer-checked:bg-[#FDFBF7] peer-checked:border-[#5A5A40] peer-checked:text-[#4A525A] text-sm font-medium transition">🧻 日用品</div>
                </label>
              </div>
              <button type="submit" className="w-full mt-4 bg-[#5A5A40] text-[#F2E8DF] p-3 rounded-[16px] hover:bg-[#4a4a35] transition font-medium cursor-pointer">儲存變更</button>
            </form>
          </div>
        </div>
      )}
      
      {editingWishItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in font-sans pb-safe">
          <div className="bg-[#FDFBF7] p-6 rounded-[32px] w-full max-w-md shadow-2xl relative slide-up border border-[#E5DACE] max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setEditingWishItem(null)} className="absolute right-4 top-4 text-[#8C7A6B] hover:text-[#5A5A40] p-2 hover:bg-[#E5DACE] rounded-full transition-colors cursor-pointer top-sticky z-10 bg-[#FDFBF7]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#5A5A40] mb-4">編輯購物清單</h2>
            <form onSubmit={saveWishEdit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#7C8578] mb-1">名稱</label>
                <input type="text" value={editingWishItem.name} onChange={e => setEditingWishItem({...editingWishItem, name: e.target.value})} className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none" required />
              </div>
              <div>
                <label className="block text-sm text-[#7C8578] mb-1">店家</label>
                <input type="text" value={editingWishItem.store} onChange={e => setEditingWishItem({...editingWishItem, store: e.target.value})} className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#7C8578] mb-1">幣值</label>
                  <select value={editingWishItem.currency} onChange={e => setEditingWishItem({...editingWishItem, currency: e.target.value as 'TWD' | 'JPY' | 'USD'})} className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none bg-[#FDFBF7]">
                    <option value="TWD">台幣 (TWD)</option>
                    <option value="JPY">日圓 (JPY)</option>
                    <option value="USD">美元 (USD)</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm text-[#7C8578] mb-1">預算</label>
                   <input type="number" value={editingWishItem.budget} onChange={e => setEditingWishItem({...editingWishItem, budget: parseFloat(e.target.value) || 0})} className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none" min="0" step="any" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#7C8578] mb-1">連結</label>
                <input type="url" value={editingWishItem.link} onChange={e => setEditingWishItem({...editingWishItem, link: e.target.value})} className="w-full border border-[#E5DACE] rounded-[16px] p-3 focus:ring-2 focus:ring-[#C97D60] outline-none" />
              </div>
              <div className="flex space-x-3 mt-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" value="食物" checked={editingWishItem.category === '食物'} onChange={() => setEditingWishItem({...editingWishItem, category: '食物'})} className="peer sr-only" />
                  <div className="text-center p-2 rounded-[16px] border border-[#E5DACE] peer-checked:bg-[#FDFBF7] peer-checked:border-[#C97D60] peer-checked:text-[#C97D60] text-sm font-medium transition">🍔 食物</div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" value="日常生活用品" checked={editingWishItem.category === '日常生活用品'} onChange={() => setEditingWishItem({...editingWishItem, category: '日常生活用品'})} className="peer sr-only" />
                  <div className="text-center p-2 rounded-[16px] border border-[#E5DACE] peer-checked:bg-[#FDFBF7] peer-checked:border-[#5A5A40] peer-checked:text-[#4A525A] text-sm font-medium transition">🧻 日用品</div>
                </label>
              </div>
              <button type="submit" className="w-full mt-4 bg-[#C97D60] text-[#F2E8DF] p-3 rounded-[16px] hover:bg-[#A86146] transition font-medium cursor-pointer">儲存變更</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
