/**
 * 설정 페이지
 */

'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { exportData, importData, clearAllData } from '@/lib/db';
import { SPEED_OPTIONS } from '@/lib/constants';

export default function SettingsPage() {
  const [defaultSpeed, setDefaultSpeed] = useState(1.5);
  const [autoExpandText, setAutoExpandText] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lazy-bible-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('내보내기 실패:', error);
      alert('내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importData(data);
        alert('데이터를 성공적으로 가져왔습니다.');
        window.location.reload();
      } catch (error) {
        console.error('가져오기 실패:', error);
        alert('가져오기에 실패했습니다. 파일을 확인해주세요.');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (!confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await clearAllData();
      alert('모든 데이터가 삭제되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <Header title="설정" />

      <div className="page-container space-y-6 pt-4">
        {/* 재생 설정 */}
        <section>
          <h2 className="section-title">재생 설정</h2>
          <Card className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">기본 재생 속도</label>
              <Select
                value={defaultSpeed.toString()}
                onChange={(e) => setDefaultSpeed(parseFloat(e.target.value))}
              >
                {SPEED_OPTIONS.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">본문 자동 펼침</p>
                <p className="text-sm text-muted-foreground">플레이어에서 본문을 기본으로 펼침</p>
              </div>
              <button
                onClick={() => setAutoExpandText(!autoExpandText)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  autoExpandText ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    autoExpandText ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </Card>
        </section>

        {/* 데이터 관리 */}
        <section>
          <h2 className="section-title">데이터 관리</h2>
          <Card className="space-y-3">
            <Button
              fullWidth
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? '내보내는 중...' : '데이터 내보내기 (JSON)'}
            </Button>

            <Button
              fullWidth
              variant="outline"
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? '가져오는 중...' : '데이터 가져오기'}
            </Button>

            <Button
              fullWidth
              variant="ghost"
              onClick={handleClearData}
              className="text-destructive hover:bg-destructive/10"
            >
              모든 데이터 삭제
            </Button>
          </Card>
        </section>

        {/* 앱 정보 */}
        <section>
          <h2 className="section-title">앱 정보</h2>
          <Card>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">게을러도성경일독</span> v0.1.0
              </p>
              <p>최소 입력 · 최대 은혜</p>
              <p className="pt-2">
                문의:{' '}
                <a href="mailto:support@example.com" className="text-primary underline">
                  support@example.com
                </a>
              </p>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
