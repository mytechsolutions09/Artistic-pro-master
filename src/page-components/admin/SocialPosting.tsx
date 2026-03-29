'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Trash2,
  Save,
  X,
  Zap,
  Calendar,
  Circle,
  Mail,
  ChevronLeft,
  ChevronRight,
  AtSign,
  Camera,
  Share2,
  Pin,
  PlayCircle,
  Building2,
  Plus,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import SocialPostingSecondaryNav, {
  type SocialPostingTabId,
} from '../../components/admin/SocialPostingSecondaryNav';

const DRAFT_KEY = 'admin_social_posting_draft_v2';
const QUEUE_KEY = 'admin_social_posting_queue_v1';
const STATS_KEY = 'admin_social_posting_stats_v1';
const SAVED_DRAFTS_KEY = 'admin_social_posting_saved_drafts_v1';
const ACTIVITY_KEY = 'admin_social_posting_activity_v1';

type ActivityKind = 'scheduled' | 'published' | 'draft_saved' | 'removed';

type ActivityEntry = {
  id: string;
  at: string;
  kind: ActivityKind;
  label: string;
};

export type PlatformId =
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'pinterest'
  | 'youtube'
  | 'linkedin';

type QueueItem = {
  id: string;
  createdAt: string;
  body: string;
  linkUrl: string;
  imageUrl: string;
  tags?: string;
  platforms: string[];
  scheduledForLabel?: string;
  /** YYYY-MM-DD — target day on the calendar (from Compose schedule date) */
  scheduledOn?: string;
  mediaFileName?: string;
};

type Stats = { copyCount: number; publishedCount: number };

type SavedDraftSnapshot = {
  id: string;
  savedAt: string;
  body: string;
  tags: string;
  platforms: PlatformId[];
  scheduleDate: string;
  scheduleTime: string;
  timezoneId: string;
};

const PLATFORMS: { id: PlatformId; label: string }[] = [
  { id: 'twitter', label: 'Twitter' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'linkedin', label: 'LinkedIn' },
];

const LEGACY_PLATFORM_LABELS: Record<string, string> = {
  x: 'X (Twitter)',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
};

const TIMEZONES = [
  { id: 'Asia/Kolkata', label: 'IST (UTC+5:30)' },
  { id: 'UTC', label: 'UTC' },
  { id: 'Europe/London', label: 'GMT / BST' },
  { id: 'America/New_York', label: 'US Eastern' },
  { id: 'America/Los_Angeles', label: 'US Pacific' },
  { id: 'Asia/Tokyo', label: 'Japan (JST)' },
  { id: 'Australia/Sydney', label: 'Australia Eastern' },
];

function formatDateForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function itemScheduleDateKey(item: QueueItem): string {
  if (item.scheduledOn && /^\d{4}-\d{2}-\d{2}$/.test(item.scheduledOn)) {
    return item.scheduledOn;
  }
  return item.createdAt.slice(0, 10);
}

type CalendarCell = { date: Date; inMonth: boolean };

function getCalendarGrid(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === monthIndex });
  }
  return cells;
}

function platformLabel(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.label ?? LEGACY_PLATFORM_LABELS[id] ?? id;
}

const DOW_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

// ---------------------------------------------------------------------------
// API Credentials — loaded from / saved to Supabase
// ---------------------------------------------------------------------------

import {
  SocialApiSettingsService,
  defaultSocialApiCredentials,
  type SocialApiCredentials,
} from '../../services/socialApiSettingsService';

type ApiCredentials = SocialApiCredentials;

function bucketPlatformId(raw: string): PlatformId | null {
  if (PLATFORMS.some((p) => p.id === raw)) return raw as PlatformId;
  if (raw === 'x') return 'twitter';
  return null;
}

const defaultSelected = (): Record<PlatformId, boolean> => ({
  twitter: true,
  instagram: true,
  facebook: false,
  pinterest: false,
  youtube: false,
  linkedin: false,
});

const loadQueue = (): QueueItem[] => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is QueueItem =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as QueueItem).id === 'string' &&
        typeof (row as QueueItem).createdAt === 'string'
    );
  } catch {
    return [];
  }
};

const saveQueue = (items: QueueItem[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

const loadStats = (): Stats => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { copyCount: 0, publishedCount: 0 };
    const parsed = JSON.parse(raw) as Stats;
    return {
      copyCount: typeof parsed.copyCount === 'number' ? parsed.copyCount : 0,
      publishedCount: typeof parsed.publishedCount === 'number' ? parsed.publishedCount : 0,
    };
  } catch {
    return { copyCount: 0, publishedCount: 0 };
  }
};

const saveStats = (s: Stats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
};

const loadSavedDrafts = (): SavedDraftSnapshot[] => {
  try {
    const raw = localStorage.getItem(SAVED_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is SavedDraftSnapshot =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as SavedDraftSnapshot).id === 'string'
    );
  } catch {
    return [];
  }
};

const saveSavedDraftsList = (items: SavedDraftSnapshot[]) => {
  try {
    localStorage.setItem(SAVED_DRAFTS_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {
    /* ignore */
  }
};

const loadActivity = (): ActivityEntry[] => {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is ActivityEntry =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as ActivityEntry).id === 'string' &&
        typeof (row as ActivityEntry).at === 'string'
    );
  } catch {
    return [];
  }
};

const PLATFORM_ANALYTICS: {
  id: PlatformId;
  label: string;
  Icon: typeof AtSign;
  textClass: string;
  barClass: string;
}[] = [
  { id: 'twitter', label: 'Twitter / X', Icon: AtSign, textClass: 'text-sky-600', barClass: 'bg-sky-500' },
  { id: 'instagram', label: 'Instagram', Icon: Camera, textClass: 'text-pink-600', barClass: 'bg-pink-500' },
  { id: 'facebook', label: 'Facebook', Icon: Share2, textClass: 'text-blue-600', barClass: 'bg-blue-600' },
  { id: 'pinterest', label: 'Pinterest', Icon: Pin, textClass: 'text-red-600', barClass: 'bg-red-600' },
  { id: 'youtube', label: 'YouTube', Icon: PlayCircle, textClass: 'text-red-600', barClass: 'bg-red-600' },
  { id: 'linkedin', label: 'LinkedIn', Icon: Building2, textClass: 'text-blue-800', barClass: 'bg-blue-800' },
];

const SocialPosting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SocialPostingTabId>('compose');
  const [composeMode, setComposeMode] = useState<'write' | 'preview'>('write');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selected, setSelected] = useState<Record<PlatformId, boolean>>(defaultSelected);
  const [scheduleDate, setScheduleDate] = useState(() => formatDateForInput(new Date()));
  const [scheduleTime, setScheduleTime] = useState('15:00');
  const [timezoneId, setTimezoneId] = useState('Asia/Kolkata');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<Stats>({ copyCount: 0, publishedCount: 0 });
  const [savedDrafts, setSavedDrafts] = useState<SavedDraftSnapshot[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [apiCreds, setApiCreds] = useState<ApiCredentials>(defaultSocialApiCredentials);
  const [credsLoading, setCredsLoading] = useState(false);
  const [credsSaving, setCredsSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postResults, setPostResults] = useState<{ platform: string; success: boolean; message: string }[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedDayKey, setSelectedDayKey] = useState(() => formatDateForInput(new Date()));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  useEffect(() => {
    setQueue(loadQueue());
    setStats(loadStats());
    setSavedDrafts(loadSavedDrafts());
    setActivityLog(loadActivity());
  }, []);

  // Load credentials from Supabase on mount
  useEffect(() => {
    setCredsLoading(true);
    SocialApiSettingsService.loadCredentials()
      .then((creds) => setApiCreds(creds))
      .finally(() => setCredsLoading(false));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        body?: string;
        tags?: string;
        linkUrl?: string;
        imageUrl?: string;
        selected?: Partial<Record<PlatformId, boolean>>;
        scheduleDate?: string;
        scheduleTime?: string;
        timezoneId?: string;
      };
      if (typeof parsed.body === 'string') setBody(parsed.body);
      if (typeof parsed.tags === 'string') setTags(parsed.tags);
      if (typeof parsed.linkUrl === 'string') setLinkUrl(parsed.linkUrl);
      if (typeof parsed.imageUrl === 'string') setImageUrl(parsed.imageUrl);
      if (parsed.selected && typeof parsed.selected === 'object') {
        setSelected((prev) => ({ ...prev, ...parsed.selected }));
      }
      if (typeof parsed.scheduleDate === 'string') setScheduleDate(parsed.scheduleDate);
      if (typeof parsed.scheduleTime === 'string') setScheduleTime(parsed.scheduleTime);
      if (typeof parsed.timezoneId === 'string') setTimezoneId(parsed.timezoneId);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  const persistDraft = useCallback(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          body,
          tags,
          linkUrl,
          imageUrl,
          selected,
          scheduleDate,
          scheduleTime,
          timezoneId,
        })
      );
    } catch {
      /* ignore */
    }
  }, [body, tags, linkUrl, imageUrl, selected, scheduleDate, scheduleTime, timezoneId]);

  useEffect(() => {
    const t = window.setTimeout(persistDraft, 400);
    return () => window.clearTimeout(t);
  }, [persistDraft]);

  const selectedPlatformIds = useMemo(
    () => PLATFORMS.filter((p) => selected[p.id]).map((p) => p.id),
    [selected]
  );

  const platformsActiveCount = selectedPlatformIds.length;

  const composed = useMemo(() => {
    const lines: string[] = [];
    if (body.trim()) lines.push(body.trim());
    if (tags.trim()) lines.push(tags.trim());
    if (linkUrl.trim()) lines.push(linkUrl.trim());
    if (imageUrl.trim()) lines.push(imageUrl.trim());
    return lines.join('\n\n');
  }, [body, tags, linkUrl, imageUrl]);

  const scheduleSummary = useMemo(() => {
    const tz = TIMEZONES.find((t) => t.id === timezoneId)?.label ?? timezoneId;
    return `${scheduleDate} · ${scheduleTime} · ${tz}`;
  }, [scheduleDate, scheduleTime, timezoneId]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const appendActivity = useCallback((kind: ActivityKind, label: string) => {
    setActivityLog((prev) => {
      const row: ActivityEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        at: new Date().toISOString(),
        kind,
        label,
      };
      const next = [row, ...prev].slice(0, 40);
      try {
        localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const togglePlatform = (id: PlatformId) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const buildQueueItem = (opts?: { scheduledForLabel?: string; scheduledOn?: string }): QueueItem => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    body: body.trim(),
    linkUrl: linkUrl.trim(),
    imageUrl: imageUrl.trim(),
    tags: tags.trim(),
    platforms: [...selectedPlatformIds],
    scheduledForLabel: opts?.scheduledForLabel,
    scheduledOn: opts?.scheduledOn,
    mediaFileName: mediaFile?.name,
  });

  const addToQueue = (opts?: { scheduledForLabel?: string; scheduledOn?: string }) => {
    const item = buildQueueItem(opts);
    if (!item.body && !item.linkUrl && !item.imageUrl && !item.tags && !item.mediaFileName) {
      showToast('Add caption, tags, link, image, or media before scheduling.');
      return;
    }
    setQueue((prev) => {
      const next = [item, ...prev];
      saveQueue(next);
      return next;
    });
    appendActivity(
      'scheduled',
      opts?.scheduledOn
        ? `Post queued · ${opts.scheduledOn}`
        : 'Post added to queue'
    );
    setActiveTab('queue');
    showToast(opts?.scheduledForLabel ? 'Post added to queue with schedule.' : 'Post added to queue.');
  };

  const handleSchedule = () => {
    addToQueue({ scheduledForLabel: scheduleSummary, scheduledOn: scheduleDate });
  };

  const handlePostNow = async () => {
    const item = buildQueueItem({ scheduledForLabel: 'Immediate' });
    if (!item.body && !item.linkUrl && !item.imageUrl && !item.tags && !item.mediaFileName) {
      showToast('Add content before posting.');
      return;
    }
    if (selectedPlatformIds.length === 0) {
      showToast('Select at least one platform.');
      return;
    }
    setPosting(true);
    setPostResults([]);
    try {
      const res = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: item.body,
          tags: item.tags ?? '',
          linkUrl: item.linkUrl,
          imageUrl: item.imageUrl,
          platforms: selectedPlatformIds,
          // credentials are read server-side from Supabase — not sent over the wire
        }),
      });
      const json = await res.json() as { results?: typeof postResults };
      const results = json.results ?? [];
      setPostResults(results);
      const allOk = results.every((r) => r.success);
      const okCount = results.filter((r) => r.success).length;
      if (allOk) {
        setStats((prev) => {
          const next = { ...prev, publishedCount: prev.publishedCount + results.length };
          saveStats(next);
          return next;
        });
        appendActivity('published', `Posted to ${results.map((r) => r.platform).join(', ')}`);
        showToast(`Posted to ${okCount} platform${okCount !== 1 ? 's' : ''} successfully.`);
      } else {
        showToast(`${okCount}/${results.length} platforms succeeded — see results below.`);
      }
    } catch (e: unknown) {
      showToast(`Request failed: ${(e as Error).message}`);
    } finally {
      setPosting(false);
    }
  };

  const handleSaveDraft = () => {
    const snap: SavedDraftSnapshot = {
      id: `${Date.now()}`,
      savedAt: new Date().toISOString(),
      body,
      tags,
      platforms: [...selectedPlatformIds],
      scheduleDate,
      scheduleTime,
      timezoneId,
    };
    setSavedDrafts((prev) => {
      const next = [snap, ...prev].slice(0, 50);
      saveSavedDraftsList(next);
      return next;
    });
    persistDraft();
    appendActivity('draft_saved', 'Draft saved on this device');
    showToast('Draft saved on this device.');
  };

  const removeFromQueue = (id: string) => {
    setQueue((prev) => {
      const next = prev.filter((q) => q.id !== id);
      saveQueue(next);
      return next;
    });
    appendActivity('removed', 'Removed a post from the queue');
  };

  const clearDraft = () => {
    setBody('');
    setTags('');
    setLinkUrl('');
    setImageUrl('');
    setMediaFile(null);
    setSelected(defaultSelected());
    setScheduleDate(formatDateForInput(new Date()));
    setScheduleTime('15:00');
    setTimezoneId('Asia/Kolkata');
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  const onFilePick = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setMediaFile(f);
  };

  const postCountByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of queue) {
      const key = itemScheduleDateKey(item);
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [queue]);

  const calendarCells = useMemo(
    () => getCalendarGrid(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth]
  );

  const postsOnSelectedDay = useMemo(
    () => queue.filter((item) => itemScheduleDateKey(item) === selectedDayKey),
    [queue, selectedDayKey]
  );

  const monthLabel = useMemo(
    () =>
      calendarMonth.toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      }),
    [calendarMonth]
  );

  const last7DaysChart = useMemo(() => {
    const today = new Date();
    const days: { key: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = formatDateForInput(d);
      const count = queue.filter((q) => q.createdAt.slice(0, 10) === key).length;
      days.push({ key, label: DOW_SHORT[d.getDay()], count });
    }
    return days;
  }, [queue]);

  const platformPostCounts = useMemo(() => {
    const m = new Map<PlatformId, number>();
    for (const p of PLATFORMS) m.set(p.id, 0);
    for (const item of queue) {
      for (const raw of item.platforms) {
        const id = bucketPlatformId(raw);
        if (id) m.set(id, (m.get(id) ?? 0) + 1);
      }
    }
    return m;
  }, [queue]);

  const maxPlatformBar = useMemo(() => {
    let max = 1;
    for (const v of platformPostCounts.values()) if (v > max) max = v;
    return max;
  }, [platformPostCounts]);

  const maxDailyPosts = useMemo(
    () => Math.max(1, ...last7DaysChart.map((d) => d.count)),
    [last7DaysChart]
  );

  const totalPostsTracked = queue.length + stats.publishedCount + savedDrafts.length;

  const statClass =
    'rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm text-center sm:text-left';

  const composePanel = (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={statClass}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Scheduled</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{queue.length}</p>
          <p className="text-xs text-gray-600 mt-0.5">posts queued</p>
        </div>
        <div className={statClass}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Drafts</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{savedDrafts.length}</p>
          <p className="text-xs text-gray-600 mt-0.5">saved locally</p>
        </div>
        <div className={statClass}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Published</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{stats.publishedCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">all time</p>
        </div>
        <div className={statClass}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Platforms active</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{platformsActiveCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">selected now</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 bg-gray-50/80">
          <div className="flex items-center gap-2 text-gray-900">
            <Circle className="h-2 w-2 fill-gray-900 text-gray-900" />
            <h2 className="text-sm font-semibold">New Post</h2>
          </div>
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setComposeMode('write')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                composeMode === 'write'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setComposeMode('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                composeMode === 'preview'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          {composeMode === 'write' ? (
            <>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Post to
                </p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const on = selected[p.id];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          on
                            ? 'border-gray-900 bg-gray-100 text-gray-900'
                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Caption / Post Content
                </p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={7}
                  placeholder="What do you want to share? Use #hashtags, @mentions…"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                <p className="mt-1 text-right text-xs text-gray-500 tabular-nums">{body.length}</p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,video/mp4"
                  className="hidden"
                  onChange={(e) => onFilePick(e.target.files)}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={() => {
                    dragDepth.current += 1;
                  }}
                  onDragLeave={() => {
                    dragDepth.current = Math.max(0, dragDepth.current - 1);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    dragDepth.current = 0;
                    onFilePick(e.dataTransfer.files);
                  }}
                  className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-4 py-8 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  {mediaPreviewUrl && mediaFile?.type.startsWith('image/') ? (
                    <img
                      src={mediaPreviewUrl}
                      alt={mediaFile?.name ? `Media preview: ${mediaFile.name}` : 'Media preview'}
                      className="max-h-32 max-w-full rounded-lg object-contain mb-2"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  )}
                  <p className="text-sm font-medium text-gray-800">
                    Add media — click to browse or drag & drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF, MP4 · Max 100MB</p>
                  {mediaFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaFile(null);
                      }}
                      className="mt-3 text-xs font-medium text-gray-600 underline"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                    Schedule Date
                  </p>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                    Schedule Time
                  </p>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                    Timezone
                  </p>
                  <select
                    value={timezoneId}
                    onChange={(e) => setTimezoneId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.id} value={tz.id}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Tags / Keywords (optional)
                </p>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="#marketing #brand #launch"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/80 p-4 text-sm text-gray-800">
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-500">Post to</p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedPlatformIds.length
                    ? selectedPlatformIds.map(platformLabel).join(', ')
                    : 'No platforms selected'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-500">Caption</p>
                <p className="mt-1 whitespace-pre-wrap">{body.trim() || '—'}</p>
              </div>
              {tags.trim() && (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-gray-500">Tags</p>
                  <p className="mt-1">{tags}</p>
                </div>
              )}
              {(linkUrl || imageUrl) && (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-gray-500">Links / URLs</p>
                  <p className="mt-1 break-all">{[linkUrl, imageUrl].filter(Boolean).join(' · ')}</p>
                </div>
              )}
              {mediaFile && (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-gray-500">Media</p>
                  <p className="mt-1">{mediaFile.name}</p>
                  {mediaPreviewUrl && mediaFile.type.startsWith('image/') && (
                    <img
                      src={mediaPreviewUrl}
                      alt={mediaFile?.name ? `Media preview: ${mediaFile.name}` : 'Media preview'}
                      className="mt-2 max-h-40 rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-500">Schedule</p>
                <p className="mt-1">{scheduleSummary}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                onClick={handlePostNow}
                disabled={posting}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {posting ? 'Posting…' : 'Post Now'}
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post results from last "Post Now" call */}
      {postResults.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 bg-gray-50/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Post results</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {postResults.map((r) => (
              <li key={r.platform} className="flex items-start gap-3 px-4 py-3">
                {r.success
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                  : <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />}
                <div className="min-w-0">
                  <p className="text-xs font-semibold capitalize text-gray-800">{r.platform}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const queuePanel =
    queue.length === 0 ? (
      <div className="max-w-5xl rounded-xl border border-gray-200 bg-gray-50/90 shadow-sm">
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
            <Mail className="h-6 w-6 text-blue-600" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="flex-1 text-sm leading-relaxed text-gray-600">
            No posts yet. Compose your first post!
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Post
          </button>
        </div>
      </div>
    ) : (
      <ul className="space-y-3 max-w-5xl">
        {queue.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              {item.scheduledForLabel && (
                <p className="text-xs font-medium text-gray-700">Schedule: {item.scheduledForLabel}</p>
              )}
              {item.platforms.length > 0 && (
                <p className="text-xs font-medium text-gray-600">
                  {item.platforms.map(platformLabel).join(', ')}
                </p>
              )}
              {item.mediaFileName && (
                <p className="text-xs text-gray-600">Media: {item.mediaFileName}</p>
              )}
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                {[item.body, item.tags, item.linkUrl, item.imageUrl].filter(Boolean).join('\n\n') || '(empty)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeFromQueue(item.id)}
              className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </li>
        ))}
      </ul>
    );

  const weekdayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const calendarPanel = (
    <div className="max-w-5xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Calendar</h2>
          <p className="mt-0.5 text-sm text-gray-500">Visual overview of your schedule.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="min-w-[6.5rem] text-center text-sm font-semibold text-gray-900">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() =>
              setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
          {weekdayLabels.map((w) => (
            <div
              key={w}
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarCells.map(({ date, inMonth }) => {
            const dayKey = formatDateForInput(date);
            const count = postCountByDay.get(dayKey) ?? 0;
            const isSelected = selectedDayKey === dayKey;
            return (
              <button
                key={`${dayKey}-${inMonth}`}
                type="button"
                onClick={() => setSelectedDayKey(dayKey)}
                className={`flex min-h-[4.5rem] sm:min-h-[5.25rem] flex-col rounded-lg border p-1.5 text-left transition-colors sm:p-2 ${
                  inMonth
                    ? 'bg-gray-100 text-gray-900 border-gray-200/80 hover:bg-gray-200/60'
                    : 'bg-gray-50 text-gray-400 border-gray-100'
                } ${
                  isSelected
                    ? 'ring-2 ring-gray-900 ring-offset-2 ring-offset-white border-gray-900'
                    : ''
                }`}
              >
                <span className="text-xs font-semibold tabular-nums sm:text-sm">{date.getDate()}</span>
                {count > 0 && (
                  <span className="mt-auto flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-900" title={`${count} post(s)`} />
                    {count > 1 && (
                      <span className="text-[10px] font-medium text-gray-600">{count}</span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Posts on {selectedDayKey} ({postsOnSelectedDay.length})
          </h3>
        </div>
        <div className="p-4">
          {postsOnSelectedDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <Mail className="h-10 w-10 text-gray-300 mb-3" strokeWidth={1.25} />
              <p className="text-sm">No posts on this day.</p>
              <p className="mt-1 text-xs text-gray-400">
                Schedule from Compose to see them here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {postsOnSelectedDay.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    {item.scheduledForLabel && (
                      <p className="text-xs font-medium text-gray-700">{item.scheduledForLabel}</p>
                    )}
                    {item.platforms.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {item.platforms.map(platformLabel).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {(item.body || item.tags || item.linkUrl || '(no caption)').slice(0, 200)}
                      {(item.body || item.tags || item.linkUrl || '').length > 200 ? '…' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(item.id)}
                    className="flex-shrink-0 self-start inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  const analyticsPanel = (
    <div className="max-w-5xl space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-medium text-gray-500">Total Posts</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">{totalPostsTracked}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-medium text-gray-500">Scheduled</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">{queue.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-medium text-gray-500">Published</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">{stats.publishedCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-medium text-gray-500">Drafts</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">{savedDrafts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900">Posts per day (last 7 days)</p>
          <p className="mt-1 text-xs text-gray-500">Queued posts by the day they were added</p>
          <div className="mt-6 flex h-48 items-end justify-between gap-1 sm:gap-2">
            {last7DaysChart.map((d) => {
              const chartH = 160;
              const hPx =
                d.count === 0 ? 0 : Math.max(6, Math.round((d.count / maxDailyPosts) * chartH));
              return (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center rounded-md bg-gray-100 px-0.5">
                    <div
                      className="w-full max-w-[2.5rem] rounded-t bg-gray-900 transition-all"
                      style={{ height: `${hPx}px` }}
                      title={`${d.count} post(s)`}
                    />
                  </div>
                  <span className="text-[10px] font-medium uppercase text-gray-500 sm:text-xs">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-gray-900">Posts by platform</p>
          <p className="mt-1 text-xs text-gray-500">From your current queue</p>
          <ul className="mt-4 space-y-4">
            {PLATFORM_ANALYTICS.map(({ id, label, Icon, textClass, barClass }) => {
              const count = platformPostCounts.get(id) ?? 0;
              const pct = Math.round((count / maxPlatformBar) * 100);
              return (
                <li key={id}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${textClass}`} strokeWidth={2} />
                    <span className={`min-w-0 flex-1 text-sm font-medium ${textClass}`}>{label}</span>
                    <span className="text-sm font-semibold tabular-nums text-gray-900">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${barClass} transition-all`}
                      style={{ width: `${count > 0 ? Math.max(8, pct) : 0}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-5">
          <h3 className="text-sm font-semibold text-gray-900">Recent activity</h3>
        </div>
        <div className="p-4 sm:p-5">
          {activityLog.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No activity yet — compose, schedule, or save a draft.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activityLog.slice(0, 15).map((row) => (
                <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0">
                  <p className="text-sm text-gray-800">{row.label}</p>
                  <time
                    className="text-xs text-gray-400 tabular-nums"
                    dateTime={row.at}
                  >
                    {new Date(row.at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  // Helper to update a nested cred field
  const setCredField = <P extends keyof ApiCredentials, F extends keyof ApiCredentials[P]>(
    platform: P,
    field: F,
    value: string
  ) => {
    setApiCreds((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value },
    }));
  };

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const toggleSecret = (key: string) => setShowSecrets((s) => ({ ...s, [key]: !s[key] }));

  const SecretInput = ({
    id, value, onChange,
  }: { id: string; value: string; onChange: (v: string) => void }) => (
    <div className="relative">
      <input
        type={showSecrets[id] ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => toggleSecret(id)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showSecrets[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  const apisPanel = (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
        <strong>Security note:</strong> credentials are stored in your Supabase database (authenticated-only
        access via RLS). When you click <em>Post Now</em>, the server reads them directly from Supabase —
        they are <strong>never sent from the browser to the API route</strong>.
        Use long-lived page tokens / access tokens for each platform.
      </div>

      {/* Twitter / X */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-gray-50/80">
          <AtSign className="h-4 w-4 text-sky-500" />
          <p className="text-sm font-semibold text-gray-800">Twitter / X</p>
          <span className="ml-auto text-[10px] text-gray-400">OAuth 1.0a — requires Write permission</span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {([
            ['API Key', 'apiKey', false],
            ['API Secret', 'apiSecret', true],
            ['Access Token', 'accessToken', false],
            ['Access Token Secret', 'accessTokenSecret', true],
          ] as [string, keyof TwitterCreds, boolean][]).map(([label, field, secret]) => (
            <div key={field}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</p>
              {secret
                ? <SecretInput id={`tw-${field}`} value={apiCreds.twitter[field]} onChange={(v) => setCredField('twitter', field, v)} />
                : <input type="text" value={apiCreds.twitter[field]} onChange={(e) => setCredField('twitter', field, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    autoComplete="off" spellCheck={false} />}
            </div>
          ))}
        </div>
      </div>

      {/* Facebook */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-gray-50/80">
          <Share2 className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-gray-800">Facebook</p>
          <span className="ml-auto text-[10px] text-gray-400">Page access token</span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {([
            ['Page ID', 'pageId', false],
            ['Page Access Token', 'pageAccessToken', true],
          ] as [string, keyof FacebookCreds, boolean][]).map(([label, field, secret]) => (
            <div key={field}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</p>
              {secret
                ? <SecretInput id={`fb-${field}`} value={apiCreds.facebook[field]} onChange={(v) => setCredField('facebook', field, v)} />
                : <input type="text" value={apiCreds.facebook[field]} onChange={(e) => setCredField('facebook', field, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    autoComplete="off" spellCheck={false} />}
            </div>
          ))}
        </div>
      </div>

      {/* Instagram */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-gray-50/80">
          <Camera className="h-4 w-4 text-pink-500" />
          <p className="text-sm font-semibold text-gray-800">Instagram</p>
          <span className="ml-auto text-[10px] text-gray-400">Meta Graph API — image required for posts</span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {([
            ['IG User ID', 'igUserId', false],
            ['User Access Token', 'userAccessToken', true],
          ] as [string, keyof InstagramCreds, boolean][]).map(([label, field, secret]) => (
            <div key={field}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</p>
              {secret
                ? <SecretInput id={`ig-${field}`} value={apiCreds.instagram[field]} onChange={(v) => setCredField('instagram', field, v)} />
                : <input type="text" value={apiCreds.instagram[field]} onChange={(e) => setCredField('instagram', field, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    autoComplete="off" spellCheck={false} />}
            </div>
          ))}
        </div>
      </div>

      {/* LinkedIn */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-gray-50/80">
          <Building2 className="h-4 w-4 text-blue-800" />
          <p className="text-sm font-semibold text-gray-800">LinkedIn</p>
          <span className="ml-auto text-[10px] text-gray-400">UGC Posts API — OAuth 2.0 bearer token</span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {([
            ['Person URN (urn:li:person:…)', 'personUrn', false],
            ['Access Token', 'accessToken', true],
          ] as [string, keyof LinkedInCreds, boolean][]).map(([label, field, secret]) => (
            <div key={field}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</p>
              {secret
                ? <SecretInput id={`li-${field}`} value={apiCreds.linkedin[field]} onChange={(v) => setCredField('linkedin', field, v)} />
                : <input type="text" value={apiCreds.linkedin[field]} onChange={(e) => setCredField('linkedin', field, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    autoComplete="off" spellCheck={false} />}
            </div>
          ))}
        </div>
      </div>

      {/* Pinterest */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-gray-50/80">
          <Pin className="h-4 w-4 text-red-600" />
          <p className="text-sm font-semibold text-gray-800">Pinterest</p>
          <span className="ml-auto text-[10px] text-gray-400">API v5 — image required for pins</span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {([
            ['Board ID', 'boardId', false],
            ['Access Token', 'accessToken', true],
          ] as [string, keyof PinterestCreds, boolean][]).map(([label, field, secret]) => (
            <div key={field}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</p>
              {secret
                ? <SecretInput id={`pi-${field}`} value={apiCreds.pinterest[field]} onChange={(v) => setCredField('pinterest', field, v)} />
                : <input type="text" value={apiCreds.pinterest[field]} onChange={(e) => setCredField('pinterest', field, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    autoComplete="off" spellCheck={false} />}
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {credsLoading && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading…
          </span>
        )}
        <button
          type="button"
          disabled={credsSaving || credsLoading}
          onClick={async () => {
            setCredsSaving(true);
            const { success, error } = await SocialApiSettingsService.saveCredentials(apiCreds);
            setCredsSaving(false);
            if (success) {
              showToast('API credentials saved to Supabase.');
            } else {
              showToast(`Save failed: ${error ?? 'unknown error'}`);
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {credsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {credsSaving ? 'Saving…' : 'Save credentials'}
        </button>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Multi-platform social media posting" noHeader>
      <SocialPostingSecondaryNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        queueCount={queue.length}
      />
      <div className="flex-1 overflow-auto ml-24 min-h-0">
        <div className="p-5 space-y-6">
          {toast && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-gray-200 bg-gray-900 px-4 py-2 text-sm text-white shadow-lg sm:left-auto sm:right-8 sm:translate-x-0">
              {toast}
            </div>
          )}

          <div>
            {activeTab === 'analytics' ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="mt-1 text-sm text-gray-500">Your posting insights</p>
              </>
            ) : activeTab === 'apis' ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                  API Keys
                </h1>
                <p className="mt-1 text-sm text-gray-500">Connect your social media accounts to enable real posting.</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800">Multi-platform social media posting</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'compose' && 'Write, preview & schedule your post'}
                  {activeTab === 'queue' && 'Scheduled posts and queue.'}
                  {activeTab === 'calendar' && 'See queued posts by day.'}
                </p>
              </>
            )}
          </div>

          {activeTab === 'compose' && composePanel}
          {activeTab === 'queue' && queuePanel}
          {activeTab === 'calendar' && calendarPanel}
          {activeTab === 'analytics' && analyticsPanel}
          {activeTab === 'apis' && apisPanel}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SocialPosting;
