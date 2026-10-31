import React, { useEffect, useState } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  CheckCircle2,
  Server,
  Layers,
  Copy,
  Check,
  ArrowLeftRight,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import {
  fetchFirebaseMysqlBridgeStatus,
  syncFirebaseWithMySqlBridge,
  saveMySqlBridgeConnectionConfig,
  downloadMySqlDatabaseDump,
  FirebaseMysqlStatusResponse,
  DATA_JSON_SYNC_EVENT,
} from '../services/dataJsonService';

export const AdminMysqlBridgePanel: React.FC = () => {
  const [status, setStatus] = useState<FirebaseMysqlStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // MySQL Connection Form State
  const [host, setHost] = useState<string>('127.0.0.1');
  const [port, setPort] = useState<number>(3306);
  const [user, setUser] = useState<string>('root');
  const [password, setPassword] = useState<string>('');
  const [database, setDatabase] = useState<string>('mweb_firebase_mysql_db');
  const [connectionUri, setConnectionUri] = useState<string>('');
  const [ssl, setSsl] = useState<boolean>(false);

  const loadBridgeStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetchFirebaseMysqlBridgeStatus();
      setStatus(res);
      if (res.mysql) {
        setHost(res.mysql.host || '127.0.0.1');
        setPort(res.mysql.port || 3306);
        setUser(res.mysql.user || 'root');
        setDatabase(res.mysql.database || 'mweb_firebase_mysql_db');
        setSsl(Boolean(res.mysql.ssl));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBridgeStatus();
    const handleSyncEvent = () => {
      loadBridgeStatus();
    };
    window.addEventListener(DATA_JSON_SYNC_EVENT, handleSyncEvent);
    return () => {
      window.removeEventListener(DATA_JSON_SYNC_EVENT, handleSyncEvent);
    };
  }, []);

  const handleInstantSync = async (
    direction: 'firebase_to_mysql' | 'mysql_to_firebase' | 'bidirectional' = 'bidirectional'
  ) => {
    setIsSyncing(true);
    setNotice(null);
    try {
      const updated = await syncFirebaseWithMySqlBridge(direction);
      setStatus(updated);
      setNotice(
        `تم ربط ومزامنة جميع مجموعات Firebase مع جداول MySQL بنجاح (${updated.totalRows} سجل علاقاتي نشط) ✓`
      );
      setTimeout(() => setNotice(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!database.trim()) return;
    setIsSavingConfig(true);
    setNotice(null);
    try {
      const updated = await saveMySqlBridgeConnectionConfig({
        host: host.trim() || '127.0.0.1',
        port: Number(port) || 3306,
        user: user.trim() || 'root',
        password: password || undefined,
        database: database.trim(),
        connectionUri: connectionUri.trim() || undefined,
        ssl,
      });
      setStatus(updated);
      setNotice(
        updated.livePoolConnected
          ? `تم الاتصال المباشر بخادم MySQL (${updated.mysql.host}:${updated.mysql.port}/${updated.mysql.database}) ومزامنة بيانات Firebase فوراً ✓`
          : `تم حفظ إعدادات ربط MySQL (${updated.mysql.database}) وتحديث جداول database.sql وربطها مع Firebase بنجاح ✓`
      );
      setTimeout(() => setNotice(null), 5000);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleCopySql = () => {
    if (!status?.sqlPreview) return;
    navigator.clipboard?.writeText(status.sqlPreview);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div data-testid="admin-mysql-bridge-panel" className="space-y-6 text-right">
      {notice && (
        <div
          data-testid="mysql-bridge-sync-notice"
          className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 shrink-0">
            Firebase ↔ MySQL Synced
          </span>
        </div>
      )}

      {/* Top Architecture Bridge Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-950 to-indigo-950/70 border border-cyan-500/40 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm sm:text-base font-black text-white">
                جسر الربط الثنائي المباشر: Firebase Firestore ↔ MySQL Database
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/60">
                متصل ومُفعّل تلقائياً
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تعمل هذه الوحدة على ربط قاعدة بيانات Firebase الموجودة لديك بقاعدة بيانات MySQL علائقية (7 جداول SQL قياسية + ملف{' '}
              <code className="text-cyan-300 font-mono">database.sql</code> + محرك{' '}
              <code className="text-cyan-300 font-mono">mysql2</code>) بحيث يتم تحويل ومزامنة أي تعديل في الموقع أو لوحة التحكم فوراً بين Firebase و MySQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="sync-firebase-mysql-now-btn"
              disabled={isSyncing}
              onClick={() => handleInstantSync('bidirectional')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing ? 'جاري مزامنة Firebase ↔ MySQL...' : 'مزامنة فورية (Firebase ↔ MySQL)'}
              </span>
            </button>

            <button
              type="button"
              data-testid="download-mysql-dump-btn"
              onClick={downloadMySqlDatabaseDump}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>تحميل database.sql</span>
            </button>
          </div>
        </div>

        {/* Visual Connection Endpoints Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
              <span>قاعدة بيانات Firebase Firestore</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs font-mono text-white truncate" dir="ltr">
              {status?.firebase.firestoreDatabaseId ||
                'ai-studio-mweb-9784d1ea-1fec-4441-8f06-0f6c5fb8dcb5'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono" dir="ltr">
              Project: {status?.firebase.projectId || 'gen-lang-client-0338286610'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-col items-center justify-center text-center space-y-1">
            <div className="flex items-center gap-2 text-cyan-300 font-black text-xs">
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
              <span>مزامنة لحظية ثنائية الاتجاه</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-bold" data-testid="mysql-total-rows-badge">
              إجمالي السجلات المربوطة: {status?.totalRows ?? 0} سجل SQL
            </p>
            <p className="text-[10px] text-slate-400 font-mono" dir="ltr">
              {status?.lastSyncedAt
                ? `Last Sync: ${new Date(status.lastSyncedAt).toLocaleString('ar-EG')}`
                : 'Ready & Active'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold">
              <span>قاعدة بيانات MySQL العلائقية</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xs font-mono text-white truncate" dir="ltr">
              {status?.mysql.database || database} ({status?.mysql.host || host}:
              {status?.mysql.port || port})
            </p>
            <p className="text-[10px] text-emerald-400 font-mono" dir="ltr">
              Engine: InnoDB • utf8mb4_unicode_ci
            </p>
          </div>
        </div>
      </div>

      {/* Relational Tables Mapped from Firebase Collections */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>جداول قاعدة بيانات MySQL المربوطة بمجموعات Firebase (7 جداول علائقية)</span>
            </h5>
            <p className="text-xs text-slate-400 mt-0.5">
              يتم تحويل كل وثيقة في Firebase تلقائياً إلى صفوف علائقية منظمة داخل جداول MySQL التالية:
            </p>
          </div>
          {isLoading && (
            <span className="text-xs text-cyan-400 font-semibold animate-pulse">
              جاري قراءة الجداول...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(status?.summaries || []).map((tbl) => (
            <div
              key={tbl.tableName}
              data-testid={`mysql-table-card-${tbl.tableName}`}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-black text-cyan-300" dir="ltr">
                    {tbl.tableName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                    {tbl.rowCount} سجل
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-semibold">{tbl.descriptionAr}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Firebase Path:</span>
                <span className="text-amber-300" dir="ltr">
                  {tbl.firebaseCollection}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MySQL Server Connection Settings Form */}
      <form
        onSubmit={handleSaveConfig}
        className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h5 className="text-sm font-black text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>إعدادات اتصال خادم MySQL (MySQL Connection Pool & Database Settings)</span>
            </h5>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك استخدام اسم قاعدة البيانات الافتراضي للمزامنة المباشرة أو إدخال بيانات استضافة MySQL خارجية (مثل cPanel / Hostinger / AWS RDS / PlanetScale).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label
              htmlFor="mysql-host-input"
              className="block text-[11px] font-semibold text-slate-300 mb-1"
            >
              عنوان مضيف MySQL (Host)
            </label>
            <input
              id="mysql-host-input"
              type="text"
              dir="ltr"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="127.0.0.1"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="mysql-port-input"
              className="block text-[11px] font-semibold text-slate-300 mb-1"
            >
              المنفذ (Port)
            </label>
            <input
              id="mysql-port-input"
              type="number"
              dir="ltr"
              value={port}
              onChange={(e) => setPort(Number(e.target.value) || 3306)}
              placeholder="3306"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="mysql-db-input"
              className="block text-[11px] font-semibold text-slate-300 mb-1"
            >
              اسم قاعدة بيانات MySQL *
            </label>
            <input
              id="mysql-db-input"
              type="text"
              required
              dir="ltr"
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              placeholder="mweb_firebase_mysql_db"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="mysql-user-input"
              className="block text-[11px] font-semibold text-slate-300 mb-1"
            >
              اسم المستخدم (User)
            </label>
            <input
              id="mysql-user-input"
              type="text"
              dir="ltr"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="root"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="mysql-pass-input"
              className="block text-[11px] font-semibold text-slate-300 mb-1"
            >
              كلمة مرور MySQL (Password - اختياري)
            </label>
            <input
              id="mysql-pass-input"
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="mysql-uri-input"
              className="block text-[11px] font-semibold text-slate-300 mb-1"
            >
              أو رابط اتصال MySQL المباشر (Connection URI - اختياري)
            </label>
            <input
              id="mysql-uri-input"
              type="text"
              dir="ltr"
              value={connectionUri}
              onChange={(e) => setConnectionUri(e.target.value)}
              placeholder="mysql://user:password@host:3306/mweb_firebase_mysql_db"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={ssl}
              onChange={(e) => setSsl(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
            />
            <span>تفعيل تشفير الاتصال الآمن (SSL / TLS) لخادم MySQL</span>
          </label>

          <button
            type="submit"
            data-testid="save-mysql-config-btn"
            disabled={isSavingConfig}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
          >
            {isSavingConfig
              ? 'جاري حفظ واختبار ربط MySQL...'
              : 'حفظ إعدادات MySQL ومزامنة الجداول مع Firebase'}
          </button>
        </div>
      </form>

      {/* Live SQL Schema & Upsert Statements Preview */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h5 className="text-xs sm:text-sm font-black text-white">
              معاينة كود قاعدة بيانات MySQL المولد تلقائياً من Firebase (<code className="text-cyan-300 font-mono">database.sql</code>)
            </h5>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">تم نسخ كود SQL</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ استعلامات SQL</span>
              </>
            )}
          </button>
        </div>

        <pre
          dir="ltr"
          className="p-4 rounded-xl bg-slate-900/95 border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-64 leading-relaxed"
        >
          {status?.sqlPreview || '-- Loading MySQL relational dump preview...'}
        </pre>
      </div>
    </div>
  );
};
