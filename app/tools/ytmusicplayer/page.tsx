"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type QueueItem = {
  id: string;
  title: string;
  thumbnail: string;
};

type RepeatMode = "off" | "all" | "one";

type YTPlayer = {
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getVideoData?: () => { video_id?: string; title?: string };
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      height: string;
      width: string;
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: (event: { data: number }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const STORAGE_KEY = "vgb-ytmusicplayer-v1";
const MAX_QUEUE = 200;

const DEFAULT_SETTINGS = {
  volume: 80,
  shuffle: false,
  repeat: "off" as RepeatMode,
};

function extractYouTubeId(value: string): string | null {
  const input = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);

    if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube.com" ||
      url.hostname === "m.youtube.com"
    ) {
      const watchId = url.searchParams.get("v");
      if (watchId && /^[a-zA-Z0-9_-]{11}$/.test(watchId)) {
        return watchId;
      }

      const parts = url.pathname.split("/").filter(Boolean);

      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
        const id = parts[1];
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function thumbnailFor(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

let youtubeApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeAPI(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube player requires a browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API loaded without a player."));
      }
    };

    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () =>
        reject(new Error("Could not load the YouTube player."));
      document.head.appendChild(script);
    } else if (window.YT?.Player) {
      resolve(window.YT);
    }
  });

  return youtubeApiPromise;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "play"
    | "pause"
    | "prev"
    | "next"
    | "shuffle"
    | "repeat"
    | "volume"
    | "volumeOff"
    | "plus"
    | "trash"
    | "grip"
    | "x"
    | "chevron"
    | "music";
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "play":
      return (
        <svg {...common}>
          <path d="M8 5.2v13.6L19 12 8 5.2Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path d="M8 6v12M16 6v12" />
        </svg>
      );
    case "prev":
      return (
        <svg {...common}>
          <path d="m15 6-6 6 6 6M9 6v12" />
        </svg>
      );
    case "next":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6M15 6v12" />
        </svg>
      );
    case "shuffle":
      return (
        <svg {...common}>
          <path d="M3.5 7h2.2c4.2 0 5.1 10 10.4 10h4.4" />
          <path d="m17.5 14 3 3-3 3" />
          <path d="M3.5 17h2.2c1.7 0 2.8-1.4 3.7-2.9M14 9.9c.7-1.4 1.5-2.9 3.1-2.9h3.4" />
          <path d="m17.5 4 3 3-3 3" />
        </svg>
      );
    case "repeat":
      return (
        <svg {...common}>
          <path d="M17 2.8 20 6l-3 3.2" />
          <path d="M4 9V7.5A2.5 2.5 0 0 1 6.5 5H20" />
          <path d="m7 21.2-3-3.2 3-3.2" />
          <path d="M20 15v1.5a2.5 2.5 0 0 1-2.5 2.5H4" />
        </svg>
      );
    case "volume":
      return (
        <svg {...common}>
          <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
          <path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11" />
        </svg>
      );
    case "volumeOff":
      return (
        <svg {...common}>
          <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
          <path d="m18 9-5 6M13 9l5 6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M10 11v6M14 11v6M6.5 7l.7 13h9.6l.7-13M9 7l.8-3h4.4l.8 3" />
        </svg>
      );
    case "grip":
      return (
        <svg {...common}>
          <circle cx="9" cy="7" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
          <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="9" cy="17" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="17" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m7 10 5 5 5-5" />
        </svg>
      );
    case "music":
      return (
        <svg {...common}>
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      );
  }
}

export default function YouTubeMusicPlayerPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [url, setUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_SETTINGS.volume);
  const [shuffle, setShuffle] = useState(DEFAULT_SETTINGS.shuffle);
  const [repeat, setRepeat] = useState<RepeatMode>(DEFAULT_SETTINGS.repeat);
  const [isMuted, setIsMuted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [apiError, setApiError] = useState("");
  const [inputError, setInputError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const playerMountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const currentIndexRef = useRef(0);
  const repeatRef = useRef<RepeatMode>("off");
  const shuffleRef = useRef(false);
  const hydratedRef = useRef(false);

  const current = queue[currentIndex];

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const saved = JSON.parse(raw);

        if (Array.isArray(saved.queue)) {
          const restoredQueue = saved.queue
            .filter(
              (item: unknown): item is QueueItem =>
                typeof item === "object" &&
                item !== null &&
                typeof (item as QueueItem).id === "string" &&
                /^[a-zA-Z0-9_-]{11}$/.test((item as QueueItem).id)
            )
            .slice(0, MAX_QUEUE)
            .map((item: QueueItem) => ({
              id: item.id,
              title: item.title || "YouTube video",
              thumbnail: item.thumbnail || thumbnailFor(item.id),
            }));

          setQueue(restoredQueue);
          queueRef.current = restoredQueue;
        }

        const savedIndex =
          typeof saved.currentIndex === "number" ? saved.currentIndex : 0;
        setCurrentIndex(Math.max(0, Math.min(savedIndex, Math.max(0, (saved.queue?.length || 1) - 1))));

        if (saved.settings) {
          if (typeof saved.settings.volume === "number") {
            setVolume(Math.max(0, Math.min(100, saved.settings.volume)));
          }
          if (typeof saved.settings.shuffle === "boolean") {
            setShuffle(saved.settings.shuffle);
            shuffleRef.current = saved.settings.shuffle;
          }
          if (
            saved.settings.repeat === "off" ||
            saved.settings.repeat === "all" ||
            saved.settings.repeat === "one"
          ) {
            setRepeat(saved.settings.repeat);
            repeatRef.current = saved.settings.repeat;
          }
        }
      }
    } catch {
      // Corrupt local storage should not prevent the player from loading.
    } finally {
      hydratedRef.current = true;
      hydratedRef.current = true;
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const payload = {
      queue,
      currentIndex,
      settings: { volume, shuffle, repeat },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, queue, currentIndex, volume, shuffle, repeat]);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();

    progressTimerRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      const currentTime = player.getCurrentTime();
      const total = player.getDuration();

      if (Number.isFinite(total) && total > 0) {
        setProgress(currentTime);
        setDuration(total);
      }
    }, 500);
  }, [stopProgressTimer]);

  const playIndex = useCallback(
    (index: number, autoplay = false) => {
      const item = queueRef.current[index];
      if (!item) return;

      setCurrentIndex(index);
      currentIndexRef.current = index;
      setProgress(0);
      setDuration(0);

      const player = playerRef.current;

      if (player) {
        if (autoplay) {
          player.loadVideoById(item.id);
        } else {
          player.cueVideoById(item.id);
        }
      }
    },
    []
  );

  const chooseNextIndex = useCallback(() => {
    const items = queueRef.current;
    const index = currentIndexRef.current;

    if (!items.length) return null;

    if (shuffleRef.current && items.length > 1) {
      const candidates = items
        .map((_, itemIndex) => itemIndex)
        .filter((itemIndex) => itemIndex !== index);

      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    if (index < items.length - 1) {
      return index + 1;
    }

    return repeatRef.current === "all" ? 0 : null;
  }, []);

  const goNext = useCallback(() => {
    const next = chooseNextIndex();

    if (next === null) {
      setIsPlaying(false);
      stopProgressTimer();
      return;
    }

    playIndex(next, true);
  }, [chooseNextIndex, playIndex, stopProgressTimer]);

  const goPrevious = useCallback(() => {
    const player = playerRef.current;

    if (player && player.getCurrentTime() > 4) {
      player.seekTo(0, true);
      return;
    }

    const items = queueRef.current;
    if (!items.length) return;

    const index = currentIndexRef.current;
    const previous =
      index > 0 ? index - 1 : repeatRef.current === "all" ? items.length - 1 : 0;

    playIndex(previous, true);
  }, [playIndex]);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeAPI()
      .then((YT) => {
        if (!cancelled) setApiReady(Boolean(YT.Player));
      })
      .catch((error: Error) => {
        if (!cancelled) setApiError(error.message || "YouTube player unavailable.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!apiReady || !playerMountRef.current || playerRef.current || !queue[0]) {
      return;
    }

    const YT = window.YT;
    if (!YT?.Player) return;

    const firstItem = queueRef.current[currentIndexRef.current] || queueRef.current[0];

    playerRef.current = new YT.Player(playerMountRef.current, {
      height: "100%",
      width: "100%",
      videoId: firstItem.id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        playsinline: 1,
        modestbranding: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          const player = playerRef.current;
          if (!player) return;

          player.setVolume(volume);
          setDuration(player.getDuration() || 0);
        },
        onStateChange: (event) => {
          const player = playerRef.current;

          if (event.data === YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startProgressTimer();

            if (player?.getVideoData) {
              const data = player.getVideoData();
              const videoId = data.video_id;
              const title = data.title?.trim();

              if (videoId && title) {
                setQueue((items) =>
                  items.map((item) =>
                    item.id === videoId && item.title !== title
                      ? { ...item, title }
                      : item
                  )
                );
              }
            }
          }

          if (event.data === YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopProgressTimer();
          }

          if (event.data === YT.PlayerState.ENDED) {
            stopProgressTimer();

            if (repeatRef.current === "one") {
              player?.seekTo(0, true);
              player?.playVideo();
              return;
            }

            goNext();
          }
        },
        onError: () => {
          setIsPlaying(false);
          stopProgressTimer();
          setApiError(
            "YouTube could not play this video. It may be unavailable, private, age-restricted, or blocked from embedding."
          );
        },
      },
    });

    return () => {
      stopProgressTimer();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // Player should only be created once after API readiness and queue hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, hydrated]);

  useEffect(() => {
    return () => stopProgressTimer();
  }, [stopProgressTimer]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    player.setVolume(volume);
  }, [volume]);

  const addVideo = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      const id = extractYouTubeId(url);

      if (!id) {
        setInputError("Paste a valid YouTube video URL.");
        return;
      }

      if (queueRef.current.some((item) => item.id === id)) {
        setInputError("That video is already in your DJ queue.");
        return;
      }

      if (queueRef.current.length >= MAX_QUEUE) {
        setInputError(`The queue is limited to ${MAX_QUEUE} videos.`);
        return;
      }

      const newItem: QueueItem = {
        id,
        title: "YouTube video",
        thumbnail: thumbnailFor(id),
      };

      const wasEmpty = queueRef.current.length === 0;
      const nextQueue = [...queueRef.current, newItem];

      setQueue(nextQueue);
      queueRef.current = nextQueue;
      setInputError("");
      setUrl("");

      if (wasEmpty) {
        setCurrentIndex(0);
        currentIndexRef.current = 0;
      }
    },
    [url]
  );

  const removeItem = useCallback(
    (index: number) => {
      const player = playerRef.current;
      const oldItems = queueRef.current;
      const nextQueue = oldItems.filter((_, itemIndex) => itemIndex !== index);

      setQueue(nextQueue);
      queueRef.current = nextQueue;

      if (!nextQueue.length) {
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
        stopProgressTimer();
        player?.stopVideo();
        return;
      }

      if (index < currentIndexRef.current) {
        const nextIndex = currentIndexRef.current - 1;
        setCurrentIndex(nextIndex);
        currentIndexRef.current = nextIndex;
      } else if (index === currentIndexRef.current) {
        const nextIndex = Math.min(currentIndexRef.current, nextQueue.length - 1);
        setCurrentIndex(nextIndex);
        currentIndexRef.current = nextIndex;

        if (player) {
          player.loadVideoById(nextQueue[nextIndex].id);
        }
      }
    },
    [stopProgressTimer]
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
    queueRef.current = [];
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    stopProgressTimer();
    playerRef.current?.stopVideo();
  }, [stopProgressTimer]);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      if (draggedIndex === null || draggedIndex === targetIndex) {
        setDraggedIndex(null);
        return;
      }

      const items = [...queueRef.current];
      const [moved] = items.splice(draggedIndex, 1);
      items.splice(targetIndex, 0, moved);

      const oldCurrentItem = queueRef.current[currentIndexRef.current];
      const newCurrentIndex = Math.max(
        0,
        items.findIndex((item) => item.id === oldCurrentItem?.id)
      );

      setQueue(items);
      queueRef.current = items;
      setCurrentIndex(newCurrentIndex);
      currentIndexRef.current = newCurrentIndex;
      setDraggedIndex(null);
    },
    [draggedIndex]
  );

  const progressPercent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  const queueLabel = useMemo(() => {
    if (!queue.length) return "No tracks";
    return `${queue.length} ${queue.length === 1 ? "track" : "tracks"}`;
  }, [queue.length]);

  const togglePlay = () => {
    const player = playerRef.current;

    if (!player) {
      if (current) {
        setApiError("The YouTube player is still loading.");
      }
      return;
    }

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;

    if (isMuted) {
      player.unMute();
      player.setVolume(volume);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const cycleRepeat = () => {
    setRepeat((mode) => {
      if (mode === "off") return "all";
      if (mode === "all") return "one";
      return "off";
    });
  };

    useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (typing) return;

      const key = event.key.toLowerCase();

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (key === "j") {
        event.preventDefault();

        const player = playerRef.current;
        if (player) {
          const currentTime = player.getCurrentTime();

          player.seekTo(Math.max(0, currentTime - 10), true);
          setProgress(Math.max(0, currentTime - 10));
        }
      } else if (key === "l") {
        event.preventDefault();

        const player = playerRef.current;
        if (player) {
          const currentTime = player.getCurrentTime();
          const totalDuration = player.getDuration();

          const nextTime = Math.min(
            totalDuration || currentTime + 10,
            currentTime + 10
          );

          player.seekTo(nextTime, true);
          setProgress(nextTime);
        }
      } else if (key === "m") {
        event.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                VGB Tools · Media
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                YouTube Music Player
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                A persistent DJ queue for YouTube videos. Your queue is saved in
                this browser, so a refresh does not wipe the set.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:self-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {queueLabel}
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="border-b border-slate-200 bg-slate-950 lg:border-b-0 lg:border-r">
              <div className="relative aspect-video min-h-[300px] w-full overflow-hidden bg-black">
                {current ? (
                  <div ref={playerMountRef} className="absolute inset-0 h-full w-full" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                      <Icon name="music" className="h-8 w-8 text-white/80" />
                    </div>
                    <h2 className="mt-5 text-lg font-semibold">Your DJ queue is empty</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
                      Add YouTube videos on the right. The first video becomes
                      your current track.
                    </p>
                  </div>
                )}

                {current && !apiReady && !apiError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">
                    Loading YouTube player…
                  </div>
                )}

                {apiError && current && (
                  <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-black/80 p-3 text-xs leading-5 text-white/80 backdrop-blur">
                    {apiError}
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 bg-slate-950 px-5 pb-5 pt-4 sm:px-7">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {current?.title || "Nothing playing"}
                    </p>
                    <p className="mt-1 text-[11px] text-white/40">
                      {current ? `${currentIndex + 1} of ${queue.length}` : "Add a video to begin"}
                    </p>
                  </div>

                  <div className="shrink-0 text-[11px] tabular-nums text-white/45">
                    {formatTime(progress)} / {formatTime(duration)}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Seek"
                  className="group relative block h-1.5 w-full cursor-pointer rounded-full bg-white/10"
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(
                      0,
                      Math.min(1, (event.clientX - rect.left) / rect.width)
                    );
                    if (playerRef.current && duration > 0) {
                      playerRef.current.seekTo(duration * ratio, true);
                      setProgress(duration * ratio);
                    }
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </button>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShuffle((value) => !value)}
                    className={`rounded-lg p-2 transition ${
                      shuffle ? "bg-white/15 text-white" : "text-white/45 hover:bg-white/10 hover:text-white"
                    }`}
                    aria-label="Toggle shuffle"
                    title="Shuffle"
                  >
                    <Icon name="shuffle" />
                  </button>

                  <button
                    type="button"
                    onClick={goPrevious}
                    disabled={!queue.length}
                    className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                    aria-label="Previous"
                    title="Previous"
                  >
                    <Icon name="prev" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    disabled={!current}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 transition hover:bg-slate-100 disabled:opacity-30"
                    aria-label={isPlaying ? "Pause" : "Play"}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    <Icon name={isPlaying ? "pause" : "play"} className="h-6 w-6" />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!queue.length}
                    className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                    aria-label="Next"
                    title="Next"
                  >
                    <Icon name="next" />
                  </button>

                  <button
                    type="button"
                    onClick={cycleRepeat}
                    className={`relative rounded-lg p-2 transition ${
                      repeat !== "off"
                        ? "bg-white/15 text-white"
                        : "text-white/45 hover:bg-white/10 hover:text-white"
                    }`}
                    aria-label="Change repeat mode"
                    title={
                      repeat === "off"
                        ? "Repeat off"
                        : repeat === "all"
                          ? "Repeat queue"
                          : "Repeat current"
                    }
                  >
                    <Icon name="repeat" />
                    {repeat === "one" && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-0.5 text-[8px] font-bold text-slate-950">
                        1
                      </span>
                    )}
                  </button>

                  <div className="hidden items-center gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="rounded-lg p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      <Icon name={isMuted ? "volumeOff" : "volume"} />
                    </button>
                    <input
                      aria-label="Volume"
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(event) => {
                        const nextVolume = Number(event.target.value);
                        setVolume(nextVolume);
                        if (nextVolume > 0 && isMuted) {
                          playerRef.current?.unMute();
                          setIsMuted(false);
                        }
                      }}
                      className="w-20 accent-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside className="flex min-h-[520px] flex-col bg-white">
              <div className="border-b border-slate-200 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      DJ queue
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">Your playlist</h2>
                  </div>

                  <button
                    type="button"
                    onClick={clearQueue}
                    disabled={!queue.length}
                    className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    Clear
                  </button>
                </div>

                <form onSubmit={addVideo} className="mt-5">
                  <div className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <input
                        value={url}
                        onChange={(event) => {
                          setUrl(event.target.value);
                          if (inputError) setInputError("");
                        }}
                        placeholder="Paste a YouTube URL…"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                        aria-label="YouTube URL"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {inputError && (
                    <p className="mt-2 text-xs font-medium text-red-600">{inputError}</p>
                  )}
                </form>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {queue.length ? (
                  <div className="divide-y divide-slate-100">
                    {queue.map((item, index) => {
                      const active = index === currentIndex;

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedIndex(index)}
                          onDragEnd={() => setDraggedIndex(null)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleDrop(index)}
                          className={`group flex cursor-grab items-center gap-2.5 px-4 py-3 transition active:cursor-grabbing ${
                            active ? "bg-slate-50" : "hover:bg-slate-50/70"
                          } ${draggedIndex === index ? "opacity-40" : ""}`}
                        >
                          <div className="w-5 shrink-0 text-center text-[10px] font-semibold tabular-nums text-slate-400">
                            {active && isPlaying ? (
                              <span className="inline-flex items-end gap-0.5">
                                <span className="h-3 w-0.5 animate-pulse bg-slate-950" />
                                <span className="h-2 w-0.5 animate-pulse bg-slate-950 [animation-delay:100ms]" />
                                <span className="h-4 w-0.5 animate-pulse bg-slate-950 [animation-delay:200ms]" />
                              </span>
                            ) : (
                              String(index + 1).padStart(2, "0")
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => playIndex(index, true)}
                            className="relative h-12 w-[76px] shrink-0 overflow-hidden rounded-lg bg-slate-100"
                            aria-label={`Play ${item.title}`}
                          >
                            <img
                              src={item.thumbnail}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/65">
                                <Icon name="play" className="h-3.5 w-3.5" />
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => playIndex(index, true)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p
                              className={`truncate text-xs font-semibold ${
                                active ? "text-slate-950" : "text-slate-700"
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              youtube.com
                            </p>
                          </button>

                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="rounded-md p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                              aria-label={`Remove ${item.title}`}
                              title="Remove"
                            >
                              <Icon name="trash" className="h-3.5 w-3.5" />
                            </button>
                            <span className="hidden text-slate-300 sm:block">
                              <Icon name="grip" className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Icon name="plus" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                      Build your set
                    </h3>
                    <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
                      Paste a YouTube video URL above. Your queue is stored
                      locally and survives page refreshes.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3.5 text-[10px] leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <span>
              Playback uses the official YouTube embedded player. Ads and
              playback restrictions are controlled by YouTube.
            </span>
            <span className="shrink-0">
              Space Play/Pause · ← → Previous/Next · M Mute
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
