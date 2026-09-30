import { Link } from "react-router-dom";
import {
  ArrowRight,
  Terminal,
  Users,
  Lightbulb,
  Send,
  Network,
  GitMerge,
  ChevronDown,
} from "lucide-react";
import AnimatedCounter from "../../components/AnimatedCounter";
import SectionHeading from "../../components/SectionHeading";
import Reveal from "../../components/Reveal";
import FlowConnector from "../../components/FlowConnector";
import RouteTransition from "../../components/RouteTransition";
import StepVisual from "../../components/StepVisual";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const PIPELINE = [
  { label: "People", icon: Users },
  { label: "Teams", icon: Network },
  { label: "Ideas", icon: Lightbulb },
  { label: "Collaboration", icon: GitMerge },
  { label: "Submission", icon: Send },
];

const STEPS = [
  {
    number: "01",
    label: "Form",
    title: "Build your squad",
    description:
      "Create a team or join an existing one. Set your team size, define your mission, and get ready to build.",
  },
  {
    number: "02",
    label: "Collaborate",
    title: "Work together",
    description:
      "Coordinate with your team members, share ideas, and align on a project direction that wins.",
  },
  {
    number: "03",
    label: "Build",
    title: "Ship your project",
    description:
      "Turn your idea into reality. Track progress, manage tasks, and build something that matters.",
  },
  {
    number: "04",
    label: "Submit",
    title: "Present your work",
    description:
      "Submit your project for review. Get feedback from admins and iterate toward approval.",
  },
];

// Facts about the platform itself (they mirror the backend rules), not usage data.
const FACTS = [
  { label: "Workflow States", value: 5 },
  { label: "Pipeline Stages", value: 4 },
  { label: "User Roles", value: 2 },
  { label: "Max Team Size", value: 10 },
];

export default function Landing() {
  const reduced = useReducedMotion();

  const scrollToSystem = () => {
    document
      .getElementById("system")
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <RouteTransition>
      <div className="min-h-screen">
        {/* Header */}
        <header className="fixed top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 shadow-[0_0_14px_rgba(59,130,246,0.2)]">
                <Terminal className="h-4 w-4 text-accent" />
              </div>
              <span className="font-display text-sm font-bold tracking-tight text-text-primary">
                HACKTRACK
              </span>
              <span className="font-mono text-[10px] font-medium text-text-tertiary">// 26</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary sm:px-4"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-accent px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover sm:px-4"
              >
                Register
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-24 pt-24 sm:px-6">
          {/* corner HUD ticks */}
          <div className="pointer-events-none absolute inset-x-4 bottom-6 top-20 hidden sm:block" aria-hidden="true">
            <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-accent/40" />
            <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-accent/40" />
            <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-accent/40" />
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-accent/40" />
            <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.2em] text-text-tertiary">
              SYS//HACKTRACK.26
            </span>
            <span className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.2em] text-text-tertiary">
              PROTOCOL_26
            </span>
          </div>

          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <div
              className="boot-in mb-8 inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent/5 px-4 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-accent-bright sm:text-[11px]"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="status-dot is-pulsing h-1.5 w-1.5 rounded-full bg-status-approved text-status-approved" />
              <span className="caret">SYSTEM INITIALIZED</span>
            </div>

            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-text-primary sm:text-7xl lg:text-8xl">
              <span className="boot-in block" style={{ animationDelay: "0.25s" }}>
                HACKTRACK
              </span>
              <span
                className="boot-in block text-accent [text-shadow:0_0_40px_rgba(59,130,246,0.55)]"
                style={{ animationDelay: "0.45s" }}
              >
                // 26
              </span>
            </h1>

            <p
              className="boot-in mt-8 max-w-xl font-mono text-xs font-medium uppercase leading-relaxed tracking-[0.22em] text-text-secondary sm:text-sm"
              style={{ animationDelay: "0.7s" }}
            >
              Hackathon Team Formation
              <br className="sm:hidden" /> &amp; Idea Tracker
            </p>
            <p
              className="boot-in mt-3 font-mono text-[11px] tracking-[0.28em] text-text-tertiary sm:text-xs"
              style={{ animationDelay: "0.85s" }}
            >
              FORM · COLLABORATE · BUILD · SUBMIT
            </p>

            <div
              className="boot-in mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
              style={{ animationDelay: "1s" }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-accent-hover"
              >
                Enter Platform
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
              <button
                type="button"
                onClick={scrollToSystem}
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/40 px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
              >
                Explore System
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
              </button>
            </div>
          </div>

          <div
            className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
            aria-hidden="true"
          >
            <span className="font-mono text-[9px] tracking-[0.3em] text-text-tertiary">SCROLL</span>
            <span className="scroll-cue block h-8 w-px bg-gradient-to-b from-accent to-transparent" />
          </div>
        </section>

        {/* System pipeline */}
        <section id="system" className="scroll-mt-16 border-y border-border bg-surface/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <Reveal className="mb-12">
              <SectionHeading
                number="SYS"
                label="Pipeline"
                title="People → Teams → Ideas → Submission"
                description="One connected system carries a student from first login to a reviewed, approved project."
              />
            </Reveal>

            <div className="flex flex-col items-stretch gap-0 lg:flex-row lg:items-center">
              {PIPELINE.map((step, i) => (
                <div key={step.label} className="flex flex-1 flex-col items-center lg:flex-row">
                  <Reveal delay={i * 120} border className="w-full">
                    <div className="group hud-frame flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-4 transition-colors hover:border-accent/30 lg:flex-col lg:gap-2 lg:text-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 lg:w-full">
                        <p className="font-mono text-[9px] tracking-[0.24em] text-text-tertiary">
                          {String(i + 1).padStart(2, "0")}
                        </p>
                        <p className="truncate font-display text-sm font-semibold uppercase tracking-wider text-text-primary">
                          {step.label}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                  {i < PIPELINE.length - 1 && (
                    <div className="flex items-center justify-center lg:shrink-0">
                      <FlowConnector direction="v" className="h-8 lg:hidden" lit flow />
                      <FlowConnector direction="h" className="hidden w-10 lg:block" lit flow />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform facts */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {FACTS.map((fact, i) => (
                <Reveal key={fact.label} delay={i * 100} className="text-center">
                  <p className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                    <AnimatedCounter value={fact.value} pad={2} />
                  </p>
                  <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
                    {fact.label}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Process sections */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="space-y-10 sm:space-y-16">
            {STEPS.map((section) => (
              <Reveal key={section.number} border>
                <div className="group grid gap-8 rounded-2xl border border-border bg-surface p-6 transition-all hover:border-border-strong hover:bg-surface-elevated sm:p-12 lg:grid-cols-2 lg:items-center">
                  <div className="min-w-0 space-y-4">
                    <SectionHeading number={section.number} label={section.label} />
                    <h3 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                      {section.title}
                    </h3>
                    <p className="max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
                      {section.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <StepVisual id={section.number} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-surface/60">
          <div className="relative mx-auto max-w-7xl overflow-hidden px-4 py-24 text-center sm:px-6">
            <Reveal className="relative space-y-6">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
                Ready to start?
              </span>
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                Build something that matters
              </h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-text-secondary">
                Join HACKTRACK today. Form your team, submit your idea, and track your hackathon
                journey from draft to approval.
              </p>
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-accent-hover"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
                >
                  Sign In
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-background/60">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent" />
              <span className="font-display text-sm font-bold text-text-primary">HACKTRACK</span>
              <span className="font-mono text-[10px] text-text-tertiary">// 26</span>
            </div>
            <p className="text-center font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              Hackathon Team Formation &amp; Idea Tracker
            </p>
          </div>
        </footer>
      </div>
    </RouteTransition>
  );
}
