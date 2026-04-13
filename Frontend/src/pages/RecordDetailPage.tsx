import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';

/// <summary>
/// 動作細節填寫頁面
/// 根據記錄類型顯示對應的輸入表單
/// </summary>
export const RecordDetailPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [volume, setVolume] = useState('180');

  const getRecordConfig = () => {
    switch (type) {
      case 'feed':
        return {
          title: '餵奶紀錄',
          icon: '🍼',
          color: 'blue',
        };
      case 'diaper':
        return {
          title: '換尿布',
          icon: '💩',
          color: 'green',
        };
      case 'sleep':
        return {
          title: '睡眠紀錄',
          icon: '🌙',
          color: 'purple',
        };
      case 'mood':
        return {
          title: '心情記錄',
          icon: '😊',
          color: 'yellow',
        };
      case 'food':
        return {
          title: '副食品紀錄',
          icon: '🍎',
          color: 'orange',
        };
      case 'medical':
        return {
          title: '醫療紀錄',
          icon: '💊',
          color: 'red',
        };
      default:
        return {
          title: '記錄',
          icon: '📝',
          color: 'gray',
        };
    }
  };

  const config = getRecordConfig();

  const quickAmounts = [120, 150, 180, 210];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 頭部 */}
      <header className="px-6 pt-6 pb-4 flex items-center gap-4 border-b border-gray-50">
        <button
          onClick={() => navigate('/quick-record')}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-babo-text" />
        </button>
        <h2 className="text-2xl font-bold text-babo-text flex-1">
          {config.icon} {config.title}
        </h2>
        <div className="w-10"></div>
      </header>

      {type === 'feed' && (
        <FeedDetailForm volume={volume} setVolume={setVolume} quickAmounts={quickAmounts} />
      )}
      {type === 'diaper' && <DiaperDetailForm />}
      {type === 'sleep' && <SleepDetailForm />}
      {type === 'mood' && <MoodDetailForm />}
      {type === 'food' && <FoodDetailForm />}
      {type === 'medical' && <MedicalDetailForm />}

      {/* 確認按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-50 p-6">
        <button className="w-full py-5 bg-babo-primary text-white font-bold text-lg rounded-[32px] shadow-lg shadow-blue-200 active:scale-95 transition-transform">
          確認發布
        </button>
      </div>
    </div>
  );
};

// 餵奶詳情表單
const FeedDetailForm = ({
  volume,
  setVolume,
  quickAmounts,
}: {
  volume: string;
  setVolume: (v: string) => void;
  quickAmounts: number[];
}) => (
  <div className="px-8 flex flex-col items-center pt-12">
    {/* 巨大數字顯示 */}
    <div className="text-center mb-10">
      <div className="flex items-baseline justify-center gap-2">
        <span className="text-7xl font-bold tracking-tighter text-babo-primary">{volume}</span>
        <span className="text-2xl text-babo-text-light font-medium">ml</span>
      </div>
      <p className="text-babo-text-light mt-2">目前選取的奶量</p>
    </div>

    {/* 滑桿 */}
    <div className="w-full mb-10 px-4">
      <input
        type="range"
        min="0"
        max="300"
        step="10"
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
      />
      <div className="flex justify-between mt-4 text-[10px] text-babo-text-light font-bold uppercase tracking-widest">
        <span>0 ml</span>
        <span>150 ml</span>
        <span>300 ml</span>
      </div>
    </div>

    {/* 快捷選項 */}
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      {quickAmounts.map((amount) => (
        <button
          key={amount}
          onClick={() => setVolume(amount.toString())}
          className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
            volume === amount.toString()
              ? 'bg-babo-primary text-white'
              : 'bg-gray-100 text-babo-text hover:bg-gray-200'
          }`}
        >
          {amount}
        </button>
      ))}
    </div>

    {/* 奶的類型 */}
    <div className="w-full flex p-1 bg-gray-100 rounded-[32px] mb-8">
      <button className="flex-1 py-4 bg-white shadow-sm rounded-[28px] font-bold text-sm text-babo-text">
        配方奶
      </button>
      <button className="flex-1 py-4 text-babo-text-light font-bold text-sm hover:text-babo-text transition-colors">
        母奶
      </button>
    </div>

    {/* 拍照與備註 */}
    <div className="w-full grid grid-cols-2 gap-4 mb-8">
      <button className="p-6 bg-gray-50 rounded-[32px] flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors">
        <span className="text-3xl">📷</span>
        <span className="text-xs text-babo-text-light">拍攝照片</span>
      </button>
      <button className="p-6 bg-gray-50 rounded-[32px] flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors">
        <span className="text-3xl">✏️</span>
        <span className="text-xs text-babo-text-light">添加備註</span>
      </button>
    </div>
  </div>
);

// 換尿布詳情表單
const DiaperDetailForm = () => (
  <div className="px-6 pt-8 space-y-6">
    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">尿布類型</label>
      <div className="flex gap-3">
        {['小便', '大便', '兩者都有'].map((type) => (
          <button
            key={type}
            className="flex-1 py-3 rounded-full bg-gray-100 text-sm font-medium text-babo-text hover:bg-babo-primary hover:text-white transition-colors"
          >
            {type}
          </button>
        ))}
      </div>
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">質地</label>
      <div className="flex gap-3 flex-wrap">
        {['正常', '偏硬', '偏軟', '腹瀉'].map((texture) => (
          <button
            key={texture}
            className="px-4 py-2 rounded-full bg-gray-100 text-xs font-medium text-babo-text hover:bg-babo-primary hover:text-white transition-colors"
          >
            {texture}
          </button>
        ))}
      </div>
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">備註</label>
      <textarea
        placeholder="記錄任何特殊情況..."
        className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:border-babo-primary focus:outline-none"
        rows={4}
      />
    </div>
  </div>
);

// 睡眠詳情表單
const SleepDetailForm = () => (
  <div className="px-6 pt-8 space-y-6">
    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">睡眠時間</label>
      <div className="flex gap-3">
        <input type="time" className="flex-1 p-3 border border-gray-200 rounded-2xl" placeholder="開始時間" />
        <input type="time" className="flex-1 p-3 border border-gray-200 rounded-2xl" placeholder="結束時間" />
      </div>
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">睡眠質量</label>
      <div className="flex gap-3">
        {['很好', '正常', '不太好', '很差'].map((quality) => (
          <button
            key={quality}
            className="flex-1 py-3 rounded-full bg-gray-100 text-sm font-medium text-babo-text hover:bg-purple-400 hover:text-white transition-colors"
          >
            {quality}
          </button>
        ))}
      </div>
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">備註</label>
      <textarea
        placeholder="例如：夜間哭鬧、尿布需要更換等..."
        className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:border-babo-primary focus:outline-none"
        rows={4}
      />
    </div>
  </div>
);

// 心情詳情表單
const MoodDetailForm = () => (
  <div className="px-6 pt-8 space-y-6">
    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-4">心情狀態</label>
      <div className="flex justify-around">
        {['😢', '😕', '😐', '🙂', '😄'].map((emoji) => (
          <button
            key={emoji}
            className="text-4xl p-3 rounded-full hover:bg-yellow-100 transition-colors active:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">備註</label>
      <textarea
        placeholder="記錄引起心情變化的原因..."
        className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:border-babo-primary focus:outline-none"
        rows={4}
      />
    </div>
  </div>
);

// 副食品詳情表單
const FoodDetailForm = () => (
  <div className="px-6 pt-8 space-y-6">
    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">食物種類</label>
      <input
        type="text"
        placeholder="例如：米粉、南瓜泥等"
        className="w-full p-4 border border-gray-200 rounded-2xl focus:border-babo-primary focus:outline-none"
      />
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">進食量</label>
      <select className="w-full p-4 border border-gray-200 rounded-2xl focus:border-babo-primary focus:outline-none">
        <option>- 選擇進食量 -</option>
        <option>很少</option>
        <option>一些</option>
        <option>適量</option>
        <option>很多</option>
      </select>
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">過敏反應</label>
      <div className="flex gap-3">
        {['無', '輕微', '明顯'].map((reaction) => (
          <button
            key={reaction}
            className="flex-1 py-3 rounded-full bg-gray-100 text-sm font-medium text-babo-text hover:bg-orange-400 hover:text-white transition-colors"
          >
            {reaction}
          </button>
        ))}
      </div>
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">備註</label>
      <textarea
        placeholder="記錄寶寶的反應..."
        className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:border-babo-primary focus:outline-none"
        rows={4}
      />
    </div>
  </div>
);

// 醫療詳情表單
const MedicalDetailForm = () => (
  <div className="px-6 pt-8 space-y-6">
    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">醫療事項</label>
      <input
        type="text"
        placeholder="例如：測體溫、擦藥、打針等"
        className="w-full p-4 border border-gray-200 rounded-2xl focus:border-babo-primary focus:outline-none"
      />
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">溫度/數值</label>
      <input
        type="number"
        placeholder="例如：36.5°C"
        className="w-full p-4 border border-gray-200 rounded-2xl focus:border-babo-primary focus:outline-none"
      />
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">嚴重度</label>
      <select className="w-full p-4 border border-gray-200 rounded-2xl focus:border-babo-primary focus:outline-none">
        <option>- 選擇嚴重度 -</option>
        <option>輕微</option>
        <option>中度</option>
        <option>嚴重（需就醫）</option>
      </select>
    </div>

    <div className="ios-card p-6">
      <label className="block text-sm font-bold text-babo-text mb-3">備註</label>
      <textarea
        placeholder="記錄醫療處置和結果..."
        className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:border-babo-primary focus:outline-none"
        rows={4}
      />
    </div>
  </div>
);
