import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "parkfly_cookie_consent";

type ConsentState = {
  analytics: boolean;
  ads: boolean;
  timestamp: number;
  version: 1;
};

type ConsentUpdate = {
  analytics_storage: "granted" | "denied";
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function pushConsent(update: ConsentUpdate) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(["consent", "update", update]);
  // Also push using gtag-style function arguments object for GTM compatibility
  window.dataLayer.push(function (this: unknown) {
    // no-op; ensures dataLayer flush
  });
}

function applyConsent(analytics: boolean, ads: boolean) {
  const state: ConsentUpdate = {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: ads ? "granted" : "denied",
    ad_user_data: ads ? "granted" : "denied",
    ad_personalization: ads ? "granted" : "denied",
  };
  pushConsent(state);
}

function saveAndApply(analytics: boolean, ads: boolean) {
  const record: ConsentState = {
    analytics,
    ads,
    timestamp: Date.now(),
    version: 1,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore
  }
  applyConsent(analytics, ads);
}

export function CookieConsent() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsentState;
        // Re-apply saved consent on every load so GTM sees current state
        applyConsent(!!parsed.analytics, !!parsed.ads);
        return;
      }
    } catch {
      // ignore
    }
    // No record — show banner shortly after mount
    const tmo = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(tmo);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    saveAndApply(true, true);
    setVisible(false);
  };

  const handleNecessaryOnly = () => {
    saveAndApply(false, false);
    setVisible(false);
  };

  const handleSave = () => {
    saveAndApply(analytics, false);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label={t("cookies.title")}
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border bg-card p-5 text-card-foreground shadow-hero sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:p-6"
    >
      <h2 className="text-base font-semibold sm:text-lg">{t("cookies.title")}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{t("cookies.text")}</p>

      {showSettings && (
        <div className="mt-4 space-y-3 rounded-xl border bg-muted/40 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{t("cookies.necessary")}</div>
              <div className="text-xs text-muted-foreground">{t("cookies.necessaryDesc")}</div>
            </div>
            <Switch checked disabled />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{t("cookies.analytics")}</div>
              <div className="text-xs text-muted-foreground">{t("cookies.analyticsDesc")}</div>
            </div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {showSettings ? (
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            {t("cookies.save")}
          </Button>
        ) : (
          <Button onClick={handleAcceptAll} className="flex-1 sm:flex-none">
            {t("cookies.acceptAll")}
          </Button>
        )}
        <Button variant="outline" onClick={handleNecessaryOnly} className="flex-1 sm:flex-none">
          {t("cookies.necessaryOnly")}
        </Button>
        {!showSettings && (
          <Button variant="ghost" onClick={() => setShowSettings(true)} className="flex-1 sm:flex-none">
            {t("cookies.settings")}
          </Button>
        )}
      </div>
    </div>
  );
}
