import { useState } from "react";
import { Alert } from "@arc/alert/alert";
import { Badge } from "@arc/badge/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@arc/tabs/tabs";
import { ThemeSwitch } from "@arc/theme-switch/theme-switch";
import { Logo } from "@shared/brand/Logo";
import { applyTheme, type Theme } from "@shared/brand/setup";
import { SwapScreen } from "./screens/Swap";
import { PoolsScreen } from "./screens/Pools";
import { LiquidityScreen } from "./screens/Liquidity";
import { DashboardScreen } from "./screens/Dashboard";
import { CHAIN_MESSAGE } from "./copy";
import styles from "./App.module.css";

export type ScreenId = "swap" | "pools" | "lp" | "dashboard";

const screens: { value: ScreenId; label: string }[] = [
  { value: "swap", label: "Swap" },
  { value: "pools", label: "Pools" },
  { value: "lp", label: "Liquidity" },
  { value: "dashboard", label: "Dashboard" },
];

export interface InitialState {
  theme: Theme;
  screen: ScreenId;
  params: URLSearchParams;
}

export default function App({ initial }: { initial: InitialState }) {
  const [theme, setTheme] = useState<Theme>(initial.theme);
  const [screen, setScreen] = useState<ScreenId>(initial.screen);

  return (
    <div className={styles.app}>
      <Tabs value={screen} onValueChange={value => setScreen(value as ScreenId)}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.brand}>
              <Logo variant="mark" height={28} title="" />
              <span className={styles.brandName}>Inference Finance</span>
              <Badge tone="neutral" size="sm">Working name</Badge>
            </div>
            <TabsList aria-label="Screens" className={styles.nav}>
              {screens.map(s => <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>)}
            </TabsList>
            <div className={styles.headerEnd}>
              <Badge tone="warning" dot>HyperEVM testnet 998, TEST mocks</Badge>
              <Badge tone="info">Read-only preview</Badge>
              <ThemeSwitch
                theme={theme}
                onThemeChange={next => { setTheme(next); applyTheme(next); }}
                iconOnly
                label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              />
            </div>
          </div>
        </header>
        <div className={styles.banner}>
          <Alert tone="warning" title="Design mock with static data">{CHAIN_MESSAGE} These screens never connect, sign or send.</Alert>
        </div>
        <main className={styles.main}>
          <TabsContent value="swap"><SwapScreen initialState={initial.params.get("state") === "stale" ? "stale" : "quote"} /></TabsContent>
          <TabsContent value="pools">
            <PoolsScreen initialState={(["loading", "empty", "error"] as const).find(v => v === initial.params.get("state")) ?? "loaded"} />
          </TabsContent>
          <TabsContent value="lp">
            <LiquidityScreen
              initialTab={initial.params.get("tab") === "remove" ? "remove" : "add"}
              initialPool={initial.params.get("pool") ?? "stable-t2"}
              initialMode={initial.params.get("mode") ?? "proportional"}
            />
          </TabsContent>
          <TabsContent value="dashboard"><DashboardScreen /></TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
