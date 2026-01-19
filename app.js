const { useState, useEffect, useMemo } = React;

// Simple Icon Components
const IconWrapper = ({ children, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        {children}
    </svg>
);

const Calendar = ({ className }) => (
    <IconWrapper className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </IconWrapper>
);

const MapPin = ({ className }) => (
    <IconWrapper className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </IconWrapper>
);

const ExternalLink = ({ className }) => (
    <IconWrapper className={className}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
    </IconWrapper>
);

const AlertTriangle = ({ className }) => (
    <IconWrapper className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </IconWrapper>
);

const Check = ({ className }) => (
    <IconWrapper className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </IconWrapper>
);

const Plus = ({ className }) => (
    <IconWrapper className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </IconWrapper>
);

const CalendarPlus = ({ className }) => (
    <IconWrapper className={className}>
        <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"></path>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <line x1="19" y1="16" x2="19" y2="22"></line>
        <line x1="16" y1="19" x2="22" y2="19"></line>
    </IconWrapper>
);

const Smartphone = ({ className }) => (
    <IconWrapper className={className}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </IconWrapper>
);

const X = ({ className }) => (
    <IconWrapper className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </IconWrapper>
);

const COMPETITIONS = window.COMPETITIONS_DATA || [];
const SERVER_URL = window.SERVER_URL || 'http://localhost:8000';

const MONTHS = [
    { value: 'all', label: '所有月份' },
    { value: '01', label: '一月' },
    { value: '02', label: '二月' },
    { value: '03', label: '三月' },
    { value: '04', label: '四月' },
    { value: '05', label: '五月' },
    { value: '06', label: '六月' },
    { value: '07', label: '七月' },
    { value: '08', label: '八月' },
    { value: '09', label: '九月' },
    { value: '10', label: '十月' },
    { value: '11', label: '十一月' },
    { value: '12', label: '十二月' },
];

const REGIONS = [
    { value: 'all', label: '所有地區' },
    { value: 'Global', label: '全球 (Global)' },
    { value: 'North America', label: '北美 (North America)' },
    { value: 'Asia', label: '亞洲 (Asia)' },
    { value: 'Europe', label: '歐洲 (Europe)' },
];

// Helper: Check date overlap
const doDatesOverlap = (start1, end1, start2, end2) => {
    return start1 <= end2 && start2 <= end1;
};

// Helper: Generate Google Calendar Link
const getGoogleCalendarUrl = (event) => {
    // Format: YYYYMMDD
    const formatDate = (dateStr) => dateStr.replace(/-/g, '');
    const start = formatDate(event.date);
    // Google Calendar end date is exclusive, so technically should add 1 day if it's an all-day event,
    // but for simplicity we'll assume the end date provided is inclusive and we might need to handle it.
    // Usually +1 day for all day events.
    // Let's just use the provided dates for now.
    const end = event.endDate ? formatDate(event.endDate) : start;
    
    // Add 1 day to end date for Google Calendar all-day event correctness if needed, 
    // but here we will just use the string.
    
    const details = encodeURIComponent(`${event.description}\n\n適合年級: ${event.grades}\n連結: ${event.link}`);
    const location = encodeURIComponent(event.region);
    const title = encodeURIComponent(event.name);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

const App = () => {
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterRegion, setFilterRegion] = useState('all');
    const [showQRCode, setShowQRCode] = useState(false);
    const [followedIds, setFollowedIds] = useState(() => {
        const saved = localStorage.getItem('followedCompetitions');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('followedCompetitions', JSON.stringify(followedIds));
    }, [followedIds]);

    const toggleFollow = (id) => {
        setFollowedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Filter logic
    const filteredCompetitions = useMemo(() => {
        return COMPETITIONS.filter(comp => {
            const date = new Date(comp.date);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            
            const matchMonth = filterMonth === 'all' || month === filterMonth;
            const matchRegion = filterRegion === 'all' || comp.region === filterRegion || (filterRegion === 'Global' && comp.region === 'Global'); // Simplify logic

            return matchMonth && matchRegion;
        });
    }, [filterMonth, filterRegion]);

    // Conflict detection logic
    const conflicts = useMemo(() => {
        const followedComps = COMPETITIONS.filter(c => followedIds.includes(c.id));
        const conflictMap = {}; // id -> [conflicting_names]

        for (let i = 0; i < followedComps.length; i++) {
            for (let j = i + 1; j < followedComps.length; j++) {
                const a = followedComps[i];
                const b = followedComps[j];
                
                if (doDatesOverlap(a.date, a.endDate || a.date, b.date, b.endDate || b.date)) {
                    if (!conflictMap[a.id]) conflictMap[a.id] = [];
                    if (!conflictMap[b.id]) conflictMap[b.id] = [];
                    
                    conflictMap[a.id].push(b.name);
                    conflictMap[b.id].push(a.name);
                }
            }
        }
        return conflictMap;
    }, [followedIds]);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">全球學生競賽日程 (Grade 3-12)</h1>
                    <p className="text-slate-600">收集全世界適合中小學生的競賽資訊，輕鬆追蹤並加入日曆。</p>
                </div>
                <button 
                    onClick={() => setShowQRCode(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm self-center md:self-auto"
                >
                    <Smartphone className="w-5 h-5" />
                    <span>手機版</span>
                </button>
            </header>

            {/* QR Code Modal */}
            {showQRCode && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQRCode(false)}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setShowQRCode(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">掃描 QR Code</h3>
                            <p className="text-slate-500 mb-6 text-sm">請確保您的手機與電腦連接至相同的 Wi-Fi 網路</p>
                            
                            <div className="bg-slate-50 p-4 rounded-lg inline-block mb-4 border border-slate-200">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(SERVER_URL)}`} 
                                    alt="QR Code" 
                                    className="w-48 h-48 mix-blend-multiply"
                                />
                            </div>
                            
                            <div className="bg-slate-100 p-3 rounded text-xs text-slate-600 font-mono break-all select-all">
                                {SERVER_URL}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 sticky top-4 z-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <select 
                            className="p-2 border rounded-md bg-slate-50 min-w-[120px]"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                        >
                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-slate-500" />
                        <select 
                            className="p-2 border rounded-md bg-slate-50 min-w-[120px]"
                            value={filterRegion}
                            onChange={(e) => setFilterRegion(e.target.value)}
                        >
                            {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="text-sm text-slate-500">
                    已追蹤: <span className="font-bold text-primary">{followedIds.length}</span> 個活動
                </div>
            </div>

            {/* Global Conflict Warning */}
            {Object.keys(conflicts).length > 0 && (
                <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-orange-800">行程衝突提示</h3>
                        <p className="text-orange-700 text-sm mt-1">
                            您追蹤的活動中有部分時間重疊，請檢查行程安排。
                        </p>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompetitions.map(comp => {
                    const isFollowed = followedIds.includes(comp.id);
                    const hasConflict = isFollowed && conflicts[comp.id];
                    
                    return (
                        <div key={comp.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md flex flex-col ${hasConflict ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-200'}`}>
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${comp.region === 'Global' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {comp.region}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">
                                        {comp.category}
                                    </span>
                                </div>
                                
                                <h3 className="font-bold text-lg text-slate-800 mb-2 leading-snug">
                                    {comp.name}
                                </h3>
                                
                                <div className="text-sm text-slate-500 mb-4 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{comp.date} {comp.endDate && comp.endDate !== comp.date ? ` - ${comp.endDate}` : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-600">Grades:</span>
                                        <span>{comp.grades}</span>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                    {comp.description}
                                </p>

                                {hasConflict && (
                                    <div className="mb-4 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 flex items-start gap-1">
                                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span>衝突: 與 {conflicts[comp.id].join(', ')} 時間重疊</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50 rounded-b-xl">
                                <button 
                                    onClick={() => toggleFollow(comp.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isFollowed 
                                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                                        : 'bg-primary text-white hover:bg-blue-600'
                                    }`}
                                >
                                    {isFollowed ? (
                                        <>
                                            <Check className="w-4 h-4" /> 已追蹤
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" /> Follow
                                        </>
                                    )}
                                </button>
                                
                                {isFollowed && (
                                    <a 
                                        href={getGoogleCalendarUrl(comp)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors flex items-center justify-center"
                                        title="加入 Google 日曆"
                                    >
                                        <CalendarPlus className="w-5 h-5" />
                                    </a>
                                )}
                                
                                <a 
                                    href={comp.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors flex items-center justify-center"
                                    title="訪問官方網站"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {filteredCompetitions.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p>沒有找到符合條件的競賽。</p>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
