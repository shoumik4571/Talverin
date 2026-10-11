import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Goal, NavView, Profile, Routine, Step } from "./types";
import { AppDock } from "./layout/AppDock";
import { AssistantInspector } from "./layout/AssistantInspector";
import { TopWindowBar } from "./layout/TopWindowBar";
import { Step1Profile } from "./steps/Step1Profile";
import { Step2Routine } from "./steps/Step2Routine";
import { Step3GoalStudio } from "./steps/Step3GoalStudio";
import { Step4Calendar } from "./steps/Step4Calendar";
import { Step5Dashboard } from "./steps/Step5Dashboard";

export const TalverinLaptop = (): JSX.Element => {
  const [step, setStep] = useState<Step>(0);
  const [navView, setNavView] = useState<NavView>(0);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    focusNote: "",
    role: null,
  });
  const [routine, setRoutine] = useState<Routine>({
    capacity: null,
    wakeTime: "07:00",
    sleepTime: "23:00",
    fixedHours: true,
    habits: ["breakfast", "lunch", "gym", "dinner", "night-review"],
  });
  const [goals, setGoals] = useState<Goal[]>([]);

  // Alarm state
  const [alarmOpen, setAlarmOpen] = useState(false);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const completedSteps: Step[] = [];
  if (profile.name.trim() && profile.role) completedSteps.push(0);
  if (routine.capacity) completedSteps.push(1);
  if (goals.length > 0) completedSteps.push(2);
  if (goals.length > 0 && goals.every((g) => g.date)) completedSteps.push(3);

  const isDashboard = navView === "schedule" || navView === "syllabus" || navView === "roadmap" || navView === "engine";

  const handleNavigate = (view: NavView) => {
    if (view === 0 || view === 1 || view === 2 || view === 3) {
      setStep(view as Step);
      setNavView(view);
    } else {
      setNavView(view);
    }
  };

  const handleStepContinue = (next: Step) => {
    setStep(next);
    setNavView(next);
  };

  const launchDashboard = () => {
    setNavView("schedule");
  };

  const restart = () => {
    setStep(0);
    setNavView(0);
    setProfile({ name: "", focusNote: "", role: null });
    setRoutine({
      capacity: null,
      wakeTime: "07:00",
      sleepTime: "23:00",
      fixedHours: true,
      habits: ["breakfast", "lunch", "gym", "dinner", "night-review"],
    });
    setGoals([]);
  };

  // Alarm audio
  const stopAlarm = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch { /* already stopped */ }
      oscillatorRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.disconnect();
      gainRef.current = null;
    }
    setAlarmPlaying(false);
  };

  const playAlarm = () => {
    if (alarmPlaying) {
      stopAlarm();
      return;
    }
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctor();
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(660, now + 0.3);
    osc.frequency.setValueAtTime(880, now + 0.6);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 5);
    osc.onended = () => stopAlarm();
    oscillatorRef.current = osc;
    gainRef.current = gain;
    setAlarmPlaying(true);
  };

  useEffect(() => {
    return () => stopAlarm();
  }, []);

  const viewLabel =
    navView === 0 ? "1. Identity & Role" :
    navView === 1 ? "2. Daily Hours & Rhythm" :
    navView === 2 ? "3. AI Goal Studio" :
    navView === 3 ? "4. Deadlines & Tavily" :
    navView === "schedule" ? "Full-Day Schedule" :
    navView === "syllabus" ? "Tavily Syllabus" :
    navView === "roadmap" ? "7-Day Roadmap" :
    navView === "engine" ? "AI Engine Status" : "Dashboard";

  const currentStep: Step = (typeof navView === "number" ? navView : 4) as Step;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7F9] text-slate-900">
      {/* LEFT PANE */}
      <AppDock
        currentView={navView}
        onNavigate={handleNavigate}
        completedSteps={completedSteps}
        profile={profile}
        onRingAlarm={() => setAlarmOpen(true)}
      />

      {/* CENTER PANE */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopWindowBar viewLabel={viewLabel} />

        <div className="relative flex flex-1 overflow-hidden">
          <div className="flex flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={navView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex w-full flex-col"
              >
                {!isDashboard && step === 0 && (
                  <Step1Profile
                    profile={profile}
                    setProfile={setProfile}
                    onContinue={() => handleStepContinue(1)}
                  />
                )}
                {!isDashboard && step === 1 && (
                  <Step2Routine
                    routine={routine}
                    setRoutine={setRoutine}
                    onContinue={() => handleStepContinue(2)}
                    onBack={() => handleStepContinue(0)}
                  />
                )}
                {!isDashboard && step === 2 && (
                  <Step3GoalStudio
                    profile={profile}
                    goals={goals}
                    setGoals={setGoals}
                    onContinue={() => handleStepContinue(3)}
                    onBack={() => handleStepContinue(1)}
                  />
                )}
                {!isDashboard && step === 3 && (
                  <Step4Calendar
                    goals={goals}
                    setGoals={setGoals}
                    routine={routine}
                    onLaunch={launchDashboard}
                    onBack={() => handleStepContinue(2)}
                  />
                )}
                {isDashboard && (
                  <Step5Dashboard
                    profile={profile}
                    routine={routine}
                    goals={goals}
                    activeView={navView}
                    onNavigate={setNavView}
                    onRingAlarm={() => setAlarmOpen(true)}
                    alarmOpen={alarmOpen}
                    alarmPlaying={alarmPlaying}
                    onPlayAlarm={playAlarm}
                    onStopAlarm={stopAlarm}
                    onCloseAlarm={() => setAlarmOpen(false)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <AssistantInspector
        profile={profile}
        routine={routine}
        goals={goals}
        alarmArmed={alarmPlaying}
      />
    </div>
  );
};
