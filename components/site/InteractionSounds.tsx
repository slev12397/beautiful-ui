"use client";

import { useEffect } from "react";
import { play, setEnabled, setVolume, sounds, type SoundName } from "cuelume";

const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "summary",
  "[role='button']",
  "[role='checkbox']",
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='menuitemradio']",
  "[role='option']",
  "[role='radio']",
  "[role='switch']",
  "[role='tab']",
].join(",");

const DISMISS_WORDS = /close|dismiss|remove|delete|collapse|cancel|clear/i;
const PRIMARY_WORDS = /send|save|submit|calculate|create|add|upgrade|replay/i;

function soundFor(element: Element): SoundName {
  const override = element.getAttribute("data-cuelume-sound");
  if (override && (sounds as readonly string[]).includes(override)) return override as SoundName;

  const label = `${element.getAttribute("aria-label") ?? ""} ${element.textContent ?? ""}`.trim();
  if (DISMISS_WORDS.test(label)) return "droplet";
  if (element.matches("input[type='checkbox'], input[type='radio'], select, [role='checkbox'], [role='radio'], [role='switch'], [role='tab']")) return "toggle";
  if (element.matches("a[href]")) return "page";
  if (PRIMARY_WORDS.test(label)) return "pulse";
  if (element.matches("input, textarea")) return "tick";
  return "release";
}

/** One quiet, delegated audio layer for interactive clicks across every route. */
export function InteractionSounds() {
  useEffect(() => {
    setVolume(0.32);

    try {
      setEnabled(localStorage.getItem("bui-sounds") !== "off");
    } catch {
      setEnabled(true);
    }

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest(INTERACTIVE_SELECTOR);
      if (!control || control.closest("[data-cuelume-silent]")) return;
      if (control.matches(":disabled, [aria-disabled='true']")) return;
      play(soundFor(control));
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
