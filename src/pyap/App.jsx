import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { LOGO_B64, PRESETS, GRANTABLE_FEATURES, SNAPSHOT_LIMIT } from "./constants.js";
import { useAuthSession } from "./hooks/useAuthSession.jsx";
import { useAnnouncements } from "./hooks/useAnnouncements.jsx";
import { useSuggestions } from "./hooks/useSuggestions.jsx";
import { useMembers } from "./hooks/useMembers.jsx";
import { useEvents } from "./hooks/useEvents.jsx";
import { useAttendance } from "./hooks/useAttendance.jsx";
import { useFinance } from "./hooks/useFinance.jsx";
import { useWelcomeContent } from "./hooks/useWelcomeContent.jsx";
import { useDashboardSettings } from "./hooks/useDashboardSettings.jsx";
import { useAchievements } from "./hooks/useAchievements.jsx";
import { useAccounts } from "./hooks/useAccounts.jsx";
import { useAccountBirthdays } from "./hooks/useAccountBirthdays.jsx";
import { useRoleFeatures } from "./hooks/useRoleFeatures.jsx";
import { useSnapshots } from "./hooks/useSnapshots.jsx";
import { useAvatar } from "./hooks/useAvatar.jsx";
import { Dashboard } from "./components/DashboardPage.jsx";
import { MembersList, MemberProfile, MemberFormModal } from "./components/MembersPage.jsx";
import { EventsList, EventFormModal } from "./components/EventsPage.jsx";
import { AttendanceSelect, AttendanceHistoryDetail, AttendanceMark } from "./components/AttendancePage.jsx";
import { Finance, FinanceFormModal } from "./components/FinancePage.jsx";
import { Certificates, CertFormModal, CertPreviewModal } from "./components/CertificatesPage.jsx";
import { Achievements, AchievementFormModal } from "./components/AchievementsPage.jsx";
import { Announcements, AnnounceFormModal } from "./components/AnnouncementsPage.jsx";
import { Suggestions } from "./components/SuggestionsPage.jsx";
import { Snapshots, SnapshotUploadModal } from "./components/SnapshotsPage.jsx";
import { BackupExport, DonateBox, AboutModal, WelcomePage } from "./components/SettingsPage.jsx";
import { PendingUsers, AccountRequests, FeatureAccess, UserManagement } from "./components/AccountsPage.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { MyProfile } from "./components/MyProfilePage.jsx";
import { EventCalendar } from "./components/EventCalendarPage.jsx";
import { Leaderboard } from "./components/LeaderboardPage.jsx";
import { AttendanceReport } from "./components/AttendanceReportPage.jsx";
import { BirthdayGreetings } from "./components/BirthdayPage.jsx";
import { LoginModal, RequestAccountModal, LoginDetailsCard } from "./components/LoginForm.jsx";

// Case/space-insensitive compare para sa pangalan at email.
const normText = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

export default function App() {
  const auth = useAuthSession();
  const userActive = !!auth.session;
  const role = auth.role;
  const isLeader = ["superadmin", "president", "secretary", "organizer"].includes(role);
  const announce = useAnnouncements();
  const suggest = useSuggestions(isLeader);
  const membersApi = useMembers(userActive);
  const eventsApi = useEvents(userActive);
  const attendanceApi = useAttendance(userActive);
  const financeApi = useFinance(userActive);
  const [guestMode, setGuestMode] = useState(false);
  const [screen, setScreen] = useState("dashboard");
  const [selectedMember, setSelectedMember] = useState(null);
  const [profileFromBirthday, setProfileFromBirthday] = useState(false);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);
  const [viewHistoryEvent, setViewHistoryEvent] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);
  const [certPreview, setCertPreview] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestBusy, setRequestBusy] = useState(false);
  const [requestDone, setRequestDone] = useState(null);
  const [accountRequests, setAccountRequests] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingRoleSelection, setPendingRoleSelection] = useState({});
  const [pendingLoading, setPendingLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const welcomeApi = useWelcomeContent();
  const dashApi = useDashboardSettings();
  const achievementsApi = useAchievements(userActive);
  const accountsApi = useAccounts(userActive);
  const snapshotsApi = useSnapshots();
  const avatarApi = useAvatar();
  const accountBirthdaysApi = useAccountBirthdays(!!auth.session);
  const roleFeaturesApi = useRoleFeatures(!!auth.session);
  const welcomeContent = welcomeApi.content;
  const dashboardWidgets = dashApi.widgets;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [installEvt, setInstallEvt] = useState(null);
  const [iosInstallHint, setIosInstallHint] = useState(false);
  const memberLinkAttempted = useRef(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch((err) => console.error("Service worker registration failed:", err));
    }
  }, []);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallEvt(e); };
    const onInstalled = () => setInstallEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || navigator.standalone === true;
    if (isIOS && !standalone) setIosInstallHint(true);
  }, []);

  const isSignedIn = !!auth.session;
  const isGuest = !isSignedIn && guestMode;
  const displayName = auth.name || auth.session?.user?.email?.split("@")[0] || "";
  const session = isSignedIn ? { name: displayName, role } : (isGuest ? { guest: true } : null);

  const announcements = announce.items;
  const suggestions = suggest.items;
  const members = membersApi.items;
  const events = eventsApi.items;
  const attendance = attendanceApi.records;
  const attendanceNotes = attendanceApi.notes;
  const finance = financeApi.items;
  const achievements = achievementsApi.items;
  const accounts = accountsApi.accounts;
  const snapshots = snapshotsApi.items;
  const suggestionCount = suggestions.length;
  const pendingCount = pendingUsers.length;
  const accountRequestCount = accountRequests.length;
  const canManageSnapshots = role === "superadmin" || role === "president";
  const myUserId = auth.session?.user?.id || null;
  // Una, hanapin sa user_id. Kung wala (hal. manual na naidagdag ang member
  // bago ma-approve ang account), mag-fallback sa email/name para makita pa
  // rin ang sariling record habang nagse-self-heal ang link.
  const myMember = !isSignedIn || !myUserId ? null : (
    members.find((m) => m.userId === myUserId)
    || members.find((m) => !m.userId && !!auth.session?.user?.email && normText(m.email) === normText(auth.session.user.email))
    || members.find((m) => !m.userId && !!auth.name && normText(m.name) === normText(auth.name))
    || null
  );

  const installButton = installEvt || iosInstallHint ? (
    <button
      aria-label="Install app"
      onClick={async () => {
        if (installEvt) {
          try {
            installEvt.prompt();
            await installEvt.userChoice;
          } catch { /* ignore */ }
          setInstallEvt(null);
        } else {
          toast.info("To install: tap the Share button in Safari (square with an arrow), then choose 'Add to Home Screen'.");
        }
      }}
      className="fixed bottom-4 right-4 z-40 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold pl-3 pr-4 py-3 rounded-full shadow-lg flex items-center gap-2"
    >
      <Smartphone size={15} /> Install App
    </button>
  ) : null;

  const featureAccess = isGuest
    ? { dashboard: true, announcements: true, snapshots: true, suggestions: true, donate: true }
    : role === "superadmin"
    ? { dashboard: true, members: true, attendance: true, events: true, announcements: true, snapshots: true, finance: true, certificates: true, achievements: true, users: true, access: true, backup: true, suggestions: true, welcome: true, donate: true, calendar: true, leaderboard: true, report: true }
    : { ...(PRESETS[role] || {}) };

  // Ang mga role na may attendance access (tulad ng leaders) ay may
  // calendar / leaderboard / report views din.
  if (featureAccess.attendance) {
    featureAccess.calendar = true;
    featureAccess.leaderboard = true;
    featureAccess.report = true;
  }

  if (!isGuest && role !== "superadmin") {
    for (const f of roleFeaturesApi.extras[role] || []) {
      if (GRANTABLE_FEATURES.some((g) => g.key === f)) featureAccess[f] = true;
    }
  }

  if (isLeader) {
    featureAccess.pendingUsers = true;
    featureAccess.accountRequests = true;
  }

  // "My Profile" — para sa LAHAT ng naka-login (member man o leader).
  // Dito sila pwedeng mag-upload ng sariling profile photo nang hindi
  // kailangang i-grant ang buong Members screen.
  if (isSignedIn) featureAccess.myprofile = true;

  // "Birthdays" — makikita rin ng lahat ng naka-login.
  if (isSignedIn) featureAccess.birthday = true;

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginBusy(true);
    const fd = new FormData(e.target);
    const email = (fd.get("email") || "").trim();
    const password = fd.get("password") || "";
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setLoginError(error.message); return; }
      setShowLoginModal(false);
      setScreen("dashboard");
      setSelectedMember(null);
      setProfileFromBirthday(false);
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleRequestAccount(e) {
    e.preventDefault();
    setRequestError("");
    setRequestDone(null);
    setRequestBusy(true);
    const fd = new FormData(e.target);
    const name = (fd.get("requestName") || "").trim();
    const email = (fd.get("requestEmail") || "").trim();
    const password = (fd.get("requestPassword") || "").trim();
    const age = (fd.get("requestAge") || "").trim();
    const sex = (fd.get("requestSex") || "").trim();
    const address = (fd.get("requestAddress") || "").trim();
    const birthday = (fd.get("requestBirthday") || "").trim();

    if (!name || !email || !password || !age || !sex || !address || !birthday) {
      setRequestError("Please fill out all fields before sending the request.");
      setRequestBusy(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, age, sex, address, birthday },
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) {
        setRequestError("Account request failed: " + error.message);
        return;
      }
      setRequestDone({ email, password });
      // With email confirmation ON there is no session yet: keep the modal
      // open so the credentials panel is visible. If the user is signed in
      // right away, the Pending Approval screen shows the same panel.
      if (data?.session) setShowRequestModal(false);
    } catch (err) {
      console.error("Failed to send account request:", err);
      setRequestError("Account request failed: " + (err?.message || "Please try again."));
    } finally {
      setRequestBusy(false);
    }
  }

  function handleGuest() {
    setGuestMode(true);
    setScreen("dashboard");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setGuestMode(false);
    setScreen("dashboard");
    setSelectedMember(null);
    setProfileFromBirthday(false);
    setRequestDone(null);
  }

  async function fetchPendingUsers() {
    if (!isLeader) {
      setPendingUsers([]);
      setPendingLoading(false);
      return;
    }
    setPendingLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").eq("status", "pending");
    if (error) {
      console.error("Failed to load pending users:", error);
      setPendingUsers([]);
    } else {
      setPendingUsers(data || []);
    }
    setPendingLoading(false);
  }

  async function fetchAccountRequests() {
    if (!isLeader) {
      setAccountRequests([]);
      return;
    }
    const { data, error } = await supabase.from("account_requests").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load account requests:", error);
      setAccountRequests([]);
    } else {
      setAccountRequests(data || []);
    }
  }

  useEffect(() => {
    fetchPendingUsers();
    fetchAccountRequests();
    membersApi.refresh();
    suggest.refresh();
    eventsApi.refresh();
    attendanceApi.refresh();
    financeApi.refresh();
    welcomeApi.refresh();
    dashApi.refresh();
    achievementsApi.refresh();
    accountsApi.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Self-heal: kung may active account pero wala pang linked member row,
  // i-link ito (o gumawa ng row) para gumana agad ang My Profile.
  useEffect(() => {
    if (!isSignedIn || !myUserId || membersApi.loading) return;
    if (myMember?.userId === myUserId) return;
    if (memberLinkAttempted.current === myUserId) return;
    memberLinkAttempted.current = myUserId;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("link_my_member");
      if (cancelled) return;
      if (error) {
        // Baka hindi pa na-a-apply ang migration — huwag hadlangan ang screen.
        console.warn("Could not auto-link member account:", error.message);
        return;
      }
      if (data) await membersApi.refresh();
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, myUserId, membersApi.loading, myMember?.id, myMember?.userId]);

  async function ensureMemberForUser(userId, applicant = {}) {
    const name = (applicant.full_name || "").trim() || (applicant.email || "").split("@")[0];
    if (!name) return;

    const { data: linked } = await supabase.from("members").select("id").eq("user_id", userId).limit(1);
    if ((linked || []).length > 0) return;

    const { data: rows, error } = await supabase.from("members").select("id, user_id, full_name, email");
    if (error) console.error("Failed to load members for linking:", error);
    const candidates = rows || [];
    const email = (applicant.email || "").trim();
    const match =
      candidates.find((m) => !m.user_id && email && normText(m.email) === normText(email))
      || candidates.find((m) => !m.user_id && normText(m.full_name) === normText(name));

    if (match) {
      await membersApi.link(match.id, userId);
      return;
    }

    await membersApi.add({
      name,
      email,
      birthday: (applicant.birthday || "").slice(0, 10),
      address: applicant.address || "",
    }, true, userId);
  }

  // Bago mag-upload o mag-edit sa My Profile, siguraduhing linked na ang
  // member row para pumasa sa RLS (members_update_own).
  async function linkOwnMember(member) {
    if (!member || !myUserId || member.userId === myUserId) return member;
    const { data, error } = await supabase.rpc("link_my_member");
    if (error) {
      console.warn("Could not link own member account:", error.message);
      return member;
    }
    if (!data) return member;
    await membersApi.refresh();
    return { ...member, userId: myUserId };
  }

  async function approvePendingUser(userId, roleSelection) {
    const roleToSet = roleSelection || "member";
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: roleToSet }, { onConflict: "user_id" });
    if (roleError) { toast.error("Failed to assign role: " + roleError.message); return; }
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ status: "active" })
      .eq("user_id", userId);
    if (profileError) { toast.error("Failed to approve user: " + profileError.message); return; }

    // Also keep the Members list in sync. Kung may existing member row na
    // kapareho ng pangalan/email, i-link ito sa bagong account — hindi lang
    // basta i-skip (iyon ang dati pang dahilan ng "no linked member record").
    const applicant = pendingUsers.find(u => u.user_id === userId) || {};
    await ensureMemberForUser(userId, applicant);

    await fetchPendingUsers();
    membersApi.refresh();
    accountBirthdaysApi.refresh();
    toast.success("Account approved.");
  }

  async function rejectPendingUser(userId) {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "rejected" })
      .eq("user_id", userId);
    if (error) { toast.error("Failed to reject user: " + error.message); return; }
    await fetchPendingUsers();
    toast.success("Request rejected.");
  }

  async function handleSetRole(userId, role) {
    if (userId === auth.session?.user?.id) { toast.error("Hindi mo mababago ang sarili mong role."); return; }
    const target = accounts.find(a => a.userId === userId);
    const activeSuperadmins = accounts.filter(a => a.role === "superadmin" && a.status === "active").length;
    if (target?.role === "superadmin" && target?.status === "active" && role !== "superadmin" && activeSuperadmins <= 1) {
      toast.error("Hindi pwede — ito na lang ang aktibong superadmin.");
      return;
    }
    await accountsApi.setRole(userId, role);
  }

  async function handleSetStatus(userId, status) {
    if (userId === auth.session?.user?.id) { toast.error("Hindi mo maaaring i-deactivate ang sarili mong account."); return; }
    const target = accounts.find(a => a.userId === userId);
    const activeSuperadmins = accounts.filter(a => a.role === "superadmin" && a.status === "active").length;
    if (target?.role === "superadmin" && target?.status === "active" && status !== "active" && activeSuperadmins <= 1) {
      toast.error("Hindi pwede — ito na lang ang aktibong superadmin.");
      return;
    }
    await accountsApi.setStatus(userId, status);
    accountBirthdaysApi.refresh();
  }

  async function handleSetBirthday(userId, birthday) {
    const ok = await accountsApi.setBirthday(userId, birthday);
    if (ok) accountBirthdaysApi.refresh();
  }

  const isPending = auth.status === "pending";
  const isRejected = auth.status === "rejected";
  const isInactive = auth.status === "inactive";

  // Loading state while auth boots
  if (auth.loading && !isSignedIn && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500 text-sm">Loading…</div>
    );
  }

  // ---------- WELCOME / LOGIN SCREEN ----------
  if (!session) {
    return (
      <>
        <WelcomePage
          content={welcomeContent}
          logo={LOGO_B64}
          isSuperAdmin={false}
          onLoginClick={() => { setLoginError(""); setShowLoginModal(true); }}
          onRequestClick={() => { setShowLoginModal(false); setShowRequestModal(true); setRequestDone(null); }}
          onGuestClick={handleGuest}
          onSave={welcomeApi.save}
        />
        {showLoginModal && (
          <LoginModal
            logo={LOGO_B64}
            error={loginError}
            busy={loginBusy}
            onSubmit={handleLogin}
            onClose={() => setShowLoginModal(false)}
            onRequestClick={() => { setShowLoginModal(false); setShowRequestModal(true); setRequestDone(null); }}
            onGuestClick={() => { setShowLoginModal(false); handleGuest(); }}
          />
        )}
        {showRequestModal && (
          <RequestAccountModal
            error={requestError}
            busy={requestBusy}
            done={requestDone}
            onSubmit={handleRequestAccount}
            onClose={() => setShowRequestModal(false)}
          />
        )}
      </>
    );
  }



  if (isPending || isRejected || isInactive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        {installButton}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 max-w-xl text-center">
          <div className="text-emerald-900 text-3xl font-bold mb-4">{isPending ? "Account Pending Approval" : isInactive ? "Account Deactivated" : "Account Rejected"}</div>
          <p className="text-sm text-stone-600 mb-5">
            {isPending
              ? "Your account is currently pending approval. Please wait for a leader to activate your account before accessing the dashboard."
              : isInactive
              ? "Your account has been deactivated. Please contact a leader if you believe this is a mistake."
              : "Your account has been rejected. Please contact a leader if you believe this is a mistake."
            }
          </p>
          {isPending && requestDone && (
            <div className="mb-6">
              <LoginDetailsCard email={requestDone.email} password={requestDone.password} />
            </div>
          )}
          <button onClick={handleLogout} className="bg-emerald-700 text-white rounded-full px-6 py-3 text-sm font-semibold">Logout</button>
        </div>
      </div>
    );
  }
  if (screen === "welcome") {
    return (
      <WelcomePage
        content={welcomeContent}
        logo={LOGO_B64}
        isSuperAdmin={session?.role === "superadmin"}
        onLoginClick={() => setScreen("dashboard")}
        onGuestClick={() => setScreen("dashboard")}
        onSave={welcomeApi.save}
        installButton={installButton}
      />
    );
  }


  // ---------- SHELL ----------

  return (
    <div className="min-h-dvh w-full flex bg-stone-50 text-stone-800 font-sans relative">
      <Sidebar
        featureAccess={featureAccess}
        screen={screen}
        isGuest={isGuest}
        displayName={session.name}
        role={session.role}
        suggestionCount={suggestionCount}
        pendingCount={pendingCount}
        accountRequestCount={accountRequestCount}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onNavigate={(key) => { setScreen(key); setSelectedMember(null); setProfileFromBirthday(false); setSelectedEventForAttendance(null); setSidebarOpen(false); }}
        onLogout={handleLogout}
        onShowAbout={() => setShowAbout(true)}
      />

      {/* Main content */}
      <div className="flex-1 p-5 md:p-8 pt-20 md:pt-8 max-w-5xl overflow-y-auto w-full">
        {screen === "dashboard" && <Dashboard members={members} events={events} attendance={attendance} announcements={announcements} finance={finance} snapshots={snapshots} accountBirthdays={accountBirthdaysApi.items} isSuperAdmin={role === "superadmin"} widgets={dashboardWidgets} onSaveWidgets={dashApi.save} onViewSnapshots={() => setScreen("snapshots")} onViewAnnouncements={() => setScreen("announcements")} onViewEvents={() => setScreen("events")} isGuest={isGuest} onLoginClick={() => { setGuestMode(false); setShowLoginModal(true); setLoginError(""); }} />}
        {screen === "announcements" && (
          <Announcements
            announcements={announcements}
            isGuest={isGuest}
            canPost={!isGuest && role !== "member"}
            onAdd={() => setShowAnnounceForm(true)}
            onDelete={announce.remove}
          />
        )}
        {screen === "members" && !selectedMember && (
          <MembersList
            members={members}
            onSelect={(member) => { setProfileFromBirthday(false); setSelectedMember(member); }}
            onAdd={isLeader ? () => setShowMemberForm(true) : undefined}
          />
        )}
        {screen === "members" && selectedMember && (
          <MemberProfile
            member={selectedMember}
            events={events}
            attendance={attendance}
            backLabel={profileFromBirthday ? "Back to Birthdays" : "Back to Members"}
            onBack={() => {
              if (profileFromBirthday) {
                setProfileFromBirthday(false);
                setScreen("birthday");
              }
              setSelectedMember(null);
            }}
            onDelete={isLeader ? (id) => {
              membersApi.remove(id);
              setSelectedMember(null);
              if (profileFromBirthday) {
                setProfileFromBirthday(false);
                setScreen("birthday");
              }
            } : undefined}
            canEditPhoto={!!auth.session && (isLeader || selectedMember.userId === auth.session?.user?.id)}
            photoBusy={avatarApi.busy}
            onPhotoChange={async (file) => {
              const url = await avatarApi.upload(selectedMember, file);
              if (url) {
                setSelectedMember((m) => (m ? { ...m, avatarUrl: url } : m));
                membersApi.refresh();
              }
            }}
            onPhotoRemove={async () => {
              const ok = await avatarApi.remove(selectedMember);
              if (ok) {
                setSelectedMember((m) => (m ? { ...m, avatarUrl: "" } : m));
                membersApi.refresh();
              }
            }}
          />
        )}
        {screen === "myprofile" && (
          <MyProfile
            member={myMember}
            accountName={displayName}
            accountEmail={auth.session?.user?.email || ""}
            photoBusy={avatarApi.busy}
            onPhotoChange={async (file) => {
              const target = await linkOwnMember(myMember);
              const url = await avatarApi.upload(target, file);
              if (url) membersApi.refresh();
            }}
            onPhotoRemove={async () => {
              const target = await linkOwnMember(myMember);
              const ok = await avatarApi.remove(target);
              if (ok) membersApi.refresh();
            }}
            onSave={async (fields) => {
              await linkOwnMember(myMember);
              return membersApi.update(myMember.id, fields);
            }}
          />
        )}
        {screen === "attendance" && !selectedEventForAttendance && !viewHistoryEvent && (
          <AttendanceSelect events={events} members={members} attendance={attendance} canManage={isLeader} onSelect={setSelectedEventForAttendance} onViewHistory={setViewHistoryEvent} />
        )}
        {screen === "attendance" && viewHistoryEvent && (
          <AttendanceHistoryDetail
            event={viewHistoryEvent}
            members={members}
            record={attendance[viewHistoryEvent.id] || {}}
            noteRecord={attendanceNotes[viewHistoryEvent.id] || {}}
            onBack={() => setViewHistoryEvent(null)}
          />
        )}
        {screen === "attendance" && selectedEventForAttendance && (
          <AttendanceMark
            event={selectedEventForAttendance}
            members={members}
            record={attendance[selectedEventForAttendance.id] || {}}
            noteRecord={attendanceNotes[selectedEventForAttendance.id] || {}}
            onBack={() => setSelectedEventForAttendance(null)}
            onSave={(status, notes) => attendanceApi.save(selectedEventForAttendance.id, status, notes)}
          />
        )}
        {screen === "events" && <EventsList events={events} onAdd={isLeader ? () => setShowEventForm(true) : undefined} onDelete={isLeader ? (id) => eventsApi.remove(id) : undefined} />}
        {screen === "calendar" && <EventCalendar events={events} />}
        {screen === "leaderboard" && <Leaderboard members={members} events={events} attendance={attendance} currentUserId={auth.session?.user?.id} />}
        {screen === "report" && <AttendanceReport members={members} events={events} attendance={attendance} attendanceNotes={attendanceNotes} />}
        {screen === "birthday" && (
          <BirthdayGreetings
            members={members}
            accountBirthdays={accountBirthdaysApi.items}
            onViewProfile={featureAccess.members ? (member) => {
              setProfileFromBirthday(true);
              setSelectedMember(member);
              setScreen("members");
            } : undefined}
          />
        )}
        {screen === "certificates" && (
          <Certificates members={members} onGenerate={isLeader ? () => setShowCertForm(true) : undefined} onPreview={setCertPreview} />
        )}
        {screen === "achievements" && (
          <Achievements
            members={members}
            achievements={achievements}
            onAdd={isLeader ? () => setShowAchievementForm(true) : undefined}
            onDelete={isLeader ? (id) => achievementsApi.remove(id) : undefined}
          />
        )}
        {screen === "finance" && <Finance finance={finance} onAdd={isLeader ? () => setShowFinanceForm(true) : undefined} onDelete={isLeader ? (id) => financeApi.remove(id) : undefined} />}
        {screen === "suggestions" && (
          <Suggestions
            canRead={isLeader}
            suggestions={suggestions}
            loading={suggest.loading}
            onSubmit={(msg) => suggest.add(msg)}
            onDelete={(id) => suggest.remove(id)}
          />
        )}
        {screen === "snapshots" && (
          <Snapshots
            items={snapshots}
            loading={snapshotsApi.loading}
            canManage={canManageSnapshots}
            onAdd={() => setShowSnapshotForm(true)}
            onDelete={(id) => snapshotsApi.remove(id)}
          />
        )}
        {screen === "backup" && (
          <BackupExport
            members={members}
            events={events}
            attendance={attendance}
            attendanceNotes={attendanceNotes}
            finance={finance}
            achievements={achievements}
            announcements={announcements}
            suggestions={suggestions}
            snapshots={snapshots}
          />
        )}
        {screen === "donate" && <DonateBox />}
        {screen === "access" && role === "superadmin" && (
          <FeatureAccess extras={roleFeaturesApi.extras} onSave={roleFeaturesApi.save} />
        )}
        {screen === "users" && (
          <UserManagement
            accounts={accounts}
            loading={accountsApi.loading}
            selfId={auth.session?.user?.id || null}
            onSetRole={handleSetRole}
            onSetStatus={handleSetStatus}
            onSetBirthday={handleSetBirthday}
          />
        )}
        {screen === "pendingUsers" && isLeader && (
          <PendingUsers
            pendingUsers={pendingUsers}
            loading={pendingLoading}
            roleSelection={pendingRoleSelection}
            onRoleChange={(userId, roleValue) => setPendingRoleSelection(prev => ({ ...prev, [userId]: roleValue }))}
            onApprove={(userId) => approvePendingUser(userId, pendingRoleSelection[userId] || "member")}
            onReject={rejectPendingUser}
          />
        )}
        {screen === "accountRequests" && isLeader && (
          <AccountRequests requests={accountRequests} />
        )}
      </div>

      {installButton}

      {/* Modals */}
      {showMemberForm && <MemberFormModal onClose={() => setShowMemberForm(false)} onSave={async (m) => { const ok = await membersApi.add(m); if (ok) setShowMemberForm(false); }} />}
      {showEventForm && <EventFormModal onClose={() => setShowEventForm(false)} onSave={async (ev) => { const ok = await eventsApi.add(ev); if (ok) setShowEventForm(false); }} />}
      {showAnnounceForm && <AnnounceFormModal onClose={() => setShowAnnounceForm(false)} onSave={async (a) => { const ok = await announce.add(a); if (ok) setShowAnnounceForm(false); }} />}
      {showFinanceForm && <FinanceFormModal onClose={() => setShowFinanceForm(false)} onSave={async (f) => { const ok = await financeApi.add(f); if (ok) setShowFinanceForm(false); }} />}
      {showCertForm && <CertFormModal members={members} events={events} onClose={() => setShowCertForm(false)} onGenerate={(c) => { setShowCertForm(false); setCertPreview(c); }} />}
      {showAchievementForm && (
        <AchievementFormModal
          members={members}
          onClose={() => setShowAchievementForm(false)}
          onSave={async (a) => { const ok = await achievementsApi.add(a); if (ok) setShowAchievementForm(false); }}
        />
      )}
      {certPreview && <CertPreviewModal cert={certPreview} onClose={() => setCertPreview(null)} />}
      {showSnapshotForm && (
        <SnapshotUploadModal onClose={() => setShowSnapshotForm(false)} remaining={Math.max(0, SNAPSHOT_LIMIT - snapshots.length)} onSave={async (files, meta) => { const ok = await snapshotsApi.add(files, meta); if (ok) setShowSnapshotForm(false); }} />
      )}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}
