/**
 * v6.0 포인트 상점 + 배지 페이지
 * 포인트로 테마/프레임/음원/칭호 구매 + 배지 목록 + 포인트 이력
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ReadingLock } from '@/components/ui/ReadingLock';
import { usePointStore, SHOP_ITEMS, BADGES } from '@/stores';

type ShopTab = 'shop' | 'badges' | 'history';

export default function ShopPage() {
  const { totalPoints, history, earnedBadges, spendPoints, isFeatureUnlocked } = usePointStore();
  const [activeTab, setActiveTab] = useState<ShopTab>('shop');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [shopCategory, setShopCategory] = useState<string>('all');

  const unlocked = isFeatureUnlocked();

  const handlePurchase = (item: typeof SHOP_ITEMS[number]) => {
    const success = spendPoints(item.price, 'shop_purchase', `${item.name} 구매`);
    if (success) {
      setPurchaseMessage(`✓ ${item.name}을(를) 획득했습니다!`);
      setTimeout(() => setPurchaseMessage(''), 3000);
    } else {
      setPurchaseMessage(`포인트가 부족합니다 (필요: ${item.price}P)`);
      setTimeout(() => setPurchaseMessage(''), 3000);
    }
  };

  const filteredItems = shopCategory === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.category === shopCategory);

  return (
    <ReadingLock featureName="포인트 상점">
      <div className="mx-auto min-h-screen max-w-lg bg-slate-50 px-4 pb-24 pt-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">포인트 상점</h1>
            <p className="text-sm text-slate-500">포인트로 특별한 아이템을 획득하세요</p>
          </div>
          <div className="rounded-2xl bg-amber-100 px-5 py-3 text-center">
            <div className="text-xs text-amber-700">보유 포인트</div>
            <div className="text-2xl font-bold text-amber-600">{totalPoints}P</div>
          </div>
        </div>

        {/* 알림 */}
        {purchaseMessage && (
          <div className={cn(
            'mb-4 rounded-xl px-4 py-3 text-sm font-medium',
            purchaseMessage.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {purchaseMessage}
          </div>
        )}

        {/* 탭 */}
        <div className="mb-6 flex rounded-xl bg-white p-1 shadow-sm">
          {[
            { key: 'shop' as ShopTab, label: '상점' },
            { key: 'badges' as ShopTab, label: '배지' },
            { key: 'history' as ShopTab, label: '포인트 이력' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
                activeTab === tab.key ? 'bg-blue-500 text-white shadow' : 'text-slate-500'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 상점 탭 */}
        {activeTab === 'shop' && (
          <div>
            {/* 카테고리 필터 */}
            <div className="mb-4 flex gap-2 overflow-x-auto">
              {[
                { key: 'all', label: '전체' },
                { key: 'theme', label: '테마' },
                { key: 'frame', label: '프레임' },
                { key: 'music', label: '음원' },
                { key: 'title', label: '칭호' },
                { key: 'donation', label: '기부' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setShopCategory(cat.key)}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                    shopCategory === cat.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-2 text-3xl">{item.icon}</div>
                  <div className="mb-1 text-sm font-semibold text-slate-800">{item.name}</div>
                  <div className="mb-3 text-xs text-slate-400">{item.description}</div>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!unlocked || totalPoints < item.price}
                    className={cn(
                      'w-full rounded-xl py-2 text-xs font-bold transition-all',
                      totalPoints >= item.price && unlocked
                        ? 'bg-amber-500 text-white hover:bg-amber-400 active:scale-95'
                        : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {item.price}P
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 배지 탭 */}
        {activeTab === 'badges' && (
          <div className="space-y-3">
            {BADGES.map((badge) => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl p-4',
                    earned ? 'bg-white shadow-sm' : 'bg-slate-100 opacity-60'
                  )}
                >
                  <span className={cn('text-3xl', !earned && 'grayscale')}>{badge.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-800">{badge.name}</div>
                    <div className="text-xs text-slate-400">{badge.description}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{badge.condition}</div>
                  </div>
                  {earned && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                      획득
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 이력 탭 */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="rounded-2xl bg-white py-12 text-center shadow-sm">
                <div className="mb-2 text-3xl">📋</div>
                <p className="text-sm text-slate-500">포인트 이력이 없습니다</p>
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{entry.description}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(entry.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={cn(
                    'text-sm font-bold',
                    entry.amount > 0 ? 'text-green-600' : 'text-red-500'
                  )}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}P
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </ReadingLock>
  );
}
