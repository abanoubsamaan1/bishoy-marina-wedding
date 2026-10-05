import { useEffect, useState } from "react";
import { startEngine } from "./lib/scroll";
import { autoScroll } from "./lib/autoscroll";
import { music } from "./lib/audio";
import { cn } from "./utils/cn";
import { Loader } from "./components/Loader";
import { Dust } from "./components/Dust";
import { Nav } from "./components/Nav";
import { MusicControl } from "./components/MusicControl";
import { Hero } from "./scenes/Hero";
import { DateReveal } from "./scenes/DateReveal";
import { Countdown } from "./scenes/Countdown";
import { Wedding } from "./scenes/Wedding";
import { Ceremony } from "./scenes/Ceremony";
import { Reception } from "./scenes/Reception";
import { Story } from "./scenes/Story";
import { Gallery } from "./scenes/Gallery";
import { Details } from "./scenes/Details";
import { Message } from "./scenes/Message";
import { Finale } from "./scenes/Finale";
import { GuestMessages } from "./scenes/GuestMessages";

type Stage = "loading" | "open" | "done";

export default function App() {
  const [stage, setStage] = useState<Stage>("loading");
  const opened = stage !== "loading";

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    startEngine();
    // the music starts on its own; if the browser blocks it we retry on the
    // visitor's first interaction with the page
    music.prime();
    return () => autoScroll.stop();
  }, []);

  // the film starts from the very beginning: scrolling is locked until the
  // invitation has opened by itself
  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = stage === "loading" ? "hidden" : "";
    if (stage === "open") {
      window.scrollTo(0, 0);
      music.begin();
      // the slow cinematic drift begins with the invitation
      autoScroll.start();
    }
  }, [stage]);

  // music gently ducks whenever an interactive element is activated
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("button, a, [role='button']")) music.duck(2200, 0.45);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div className={cn("relative min-h-screen bg-[#060504]", opened && "is-open")}>
      <main>
        <Hero />
        <DateReveal />
        <Countdown />
        <Wedding />
        <Ceremony />
        <Reception />
        <Story />
        <Gallery />
        <Details />
        <Message />
        <Finale />
        <GuestMessages />
      </main>

      <Dust />
      <Nav visible={opened} />
      <MusicControl visible={opened} />

      {stage !== "done" && (
        <Loader onOpen={() => setStage("open")} onDone={() => setStage("done")} />
      )}
    </div>
  );
}
