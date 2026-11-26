import { useState } from "react";
import { Alert } from "@arc/alert/alert";
import { Badge } from "@arc/badge/badge";
import { Button } from "@arc/button/button";
import { NumberField } from "@arc/number-field/number-field";
import { RadioCards } from "@arc/radio-cards/radio-cards";
import SegmentedControl from "@arc/segmented-control/segmented-control";
import { Select } from "@arc/select/select";
import { Slider } from "@arc/slider/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@arc/tabs/tabs";
import { poolById, pools, position, rateFor, type PoolInfo } from "../mock/sdk";
import { age, num, pct, sum } from "../format";
import { NO_LP_TOKEN, PREVIEW_ACTION, PREVIEW_ACTION_HINT, PROPORTIONAL_EXIT } from "../copy";
import styles from "./screens.module.css";

type Mode = "proportional" | "one-coin" | "imbalanced";

const modeOptions = [
  { value: "proportional", label: "Proportional" },
  { value: "one-coin", label: "One coin" },
  { value: "imbalanced", label: "Imbalanced" },
];

const statusLabel = { active: "active", "rates-stale": "rates stale", paused: "paused" } as const;
const poolOptions = pools.map(p => ({ value: p.id, label: `${p.id}, ${p.kind}${p.status === "active" ? "" : `, ${statusLabel[p.status]}`}` }));

/** Placeholder imbalance fee for one-coin and imbalanced paths: half the base fee, as in Curve. */
const imbalanceFee = (pool: PoolInfo) => pool.fee.baseBps / 2 / 10_000;

function PreviewAction({ label, disabled }: { label: string; disabled?: string }) {
  return (
    <div className={styles.action}>
      <Button variant="primary" size="lg" disabled style={{ width: "100%" }}>{disabled ?? label}</Button>
      <p className={styles.actionHint}>{PREVIEW_ACTION_HINT}</p>
    </div>
  );
}

function needsRate(pool: PoolInfo) {
  if (pool.status === "paused") return "Paused pools accept no deposits and only proportional exits.";
  if (pool.status === "rates-stale") {
    const oldest = Math.max(...pool.coins.map(c => rateFor(c).ageSeconds));
    return `Rates are ${age(oldest)} old, past the limit. This path needs a fresh rate and comes back when a keeper updates the oracle.`;
  }
  return null;
}

function AddPanel({ pool, mode }: { pool: PoolInfo; mode: Mode }) {
  const [omer, setOmer] = useState(1000);
  const [coin, setCoin] = useState(pool.coins[0]);
  const [amounts, setAmounts] = useState<number[]>(pool.coins.map((_, i) => (i === 0 ? 800 : 200)));
  const total = sum(pool.balancesOmer);
  const blocked = needsRate(pool);
  const fee = mode === "proportional" ? 0 : imbalanceFee(pool);

  let valueOmer = omer;
  if (mode === "one-coin") valueOmer = omer;
  if (mode === "imbalanced") valueOmer = sum(amounts.map((a, i) => a * Number(rateFor(pool.coins[i]).omerPerUnit)));
  const shares = valueOmer / total * Number(pool.totalShares) * (1 - fee);

  return (
    <div className={styles.stack}>
      {blocked && <Alert tone={pool.status === "paused" ? "warning" : "danger"} title="Deposits disabled">{blocked}</Alert>}
      {mode === "proportional" && (
        <>
          <NumberField label="Deposit value" value={omer} onValueChange={setOmer} min={0} step={50} suffix="OMER" disabled={!!blocked} description="Split across coins in the pool's current ratio." />
          <dl className={styles.facts}>
            {pool.coins.map((c, i) => (
              <div key={c} className={styles.fact}>
                <dt>{c}</dt>
                <dd>{num(omer * Number(pool.balancesOmer[i]) / total / Number(rateFor(c).omerPerUnit), 4)}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      {mode === "one-coin" && (
        <div className={styles.fieldRow}>
          <NumberField label="Deposit value" value={omer} onValueChange={setOmer} min={0} step={50} suffix="OMER" disabled={!!blocked} />
          <Select label="Coin" value={coin} onValueChange={setCoin} options={pool.coins.map(c => ({ value: c, label: c }))} disabled={!!blocked} />
        </div>
      )}
      {mode === "imbalanced" && (
        <div className={styles.fieldRow3}>
          {pool.coins.map((c, i) => (
            <NumberField
              key={c}
              label={c}
              value={amounts[i]}
              onValueChange={v => setAmounts(prev => prev.map((a, j) => (j === i ? v : a)))}
              min={0}
              step={10}
              disabled={!!blocked}
            />
          ))}
        </div>
      )}
      <dl className={styles.facts}>
        <div className={styles.fact}><dt>Shares to receive (estimate)</dt><dd>{blocked ? "Not available" : num(shares, 2)}</dd></div>
        <div className={styles.fact}><dt>Imbalance fee</dt><dd>{mode === "proportional" ? "None" : pct(fee, 2)}</dd></div>
        <div className={styles.fact}><dt>Minimum shares at 0.5% slippage</dt><dd>{blocked ? "Not available" : num(shares * .995, 2)}</dd></div>
      </dl>
      <PreviewAction label={PREVIEW_ACTION} disabled={blocked ? "Deposit disabled" : undefined} />
    </div>
  );
}

function RemovePanel({ pool, mode }: { pool: PoolInfo; mode: Mode }) {
  const [percent, setPercent] = useState(50);
  const [coin, setCoin] = useState(pool.coins[0]);
  const [amounts, setAmounts] = useState<number[]>(pool.coins.map(() => 200));
  const mine = pool.id === position.pool ? position : { pool: pool.id, shares: "1200.00", shareOfPoolBps: Math.round(1200 / Number(pool.totalShares) * 10_000), underlying: pool.balances.map(b => String(Number(b) * 1200 / Number(pool.totalShares))) };
  const total = sum(pool.balancesOmer);
  const shares = Number(mine.shares) * percent / 100;
  const blocked = mode === "proportional" ? null : needsRate(pool);
  const fee = imbalanceFee(pool);

  return (
    <div className={styles.stack}>
      {mode === "proportional" && (
        <>
          <Slider label="Shares to remove" value={percent} onValueChange={v => setPercent(v as number)} min={0} max={100} step={1} marks={[0, 25, 50, 75, 100]} format={v => `${v}%`} />
          <dl className={styles.facts}>
            <div className={styles.fact}><dt>Shares burned</dt><dd>{num(shares, 2)}</dd></div>
            {pool.coins.map((c, i) => (
              <div key={c} className={styles.fact}><dt>{c} received</dt><dd>{num(Number(mine.underlying[i]) * percent / 100, 4)}</dd></div>
            ))}
            <div className={styles.fact}><dt>Fee</dt><dd>None</dd></div>
            <div className={styles.fact}><dt>Rate needed</dt><dd>No</dd></div>
          </dl>
          <PreviewAction label={PREVIEW_ACTION} />
        </>
      )}
      {mode === "one-coin" && (
        <>
          {blocked && <Alert tone="danger" title="One-coin exit disabled">{blocked} Proportional exit is still available.</Alert>}
          <Slider label="Shares to remove" value={percent} onValueChange={v => setPercent(v as number)} min={0} max={100} step={1} format={v => `${v}%`} disabled={!!blocked} />
          <RadioCards
            aria-label="Coin to receive"
            value={coin}
            onValueChange={setCoin}
            layout="grid"
            minColumnWidth={180}
            disabled={!!blocked}
            options={pool.coins.map(c => {
              const out = shares / Number(pool.totalShares) * total * (1 - fee) / Number(rateFor(c).omerPerUnit);
              return { value: c, label: c, description: blocked ? "Needs a fresh rate" : `${num(out, 4)} (estimate)` };
            })}
          />
          <dl className={styles.facts}>
            <div className={styles.fact}><dt>Imbalance fee</dt><dd>{pct(fee, 2)}</dd></div>
          </dl>
          <PreviewAction label={PREVIEW_ACTION} disabled={blocked ? "Exit disabled: use proportional" : undefined} />
        </>
      )}
      {mode === "imbalanced" && (
        <>
          {blocked && <Alert tone="danger" title="Imbalanced exit disabled">{blocked} Proportional exit is still available.</Alert>}
          <div className={styles.fieldRow3}>
            {pool.coins.map((c, i) => (
              <NumberField key={c} label={`${c} to receive`} value={amounts[i]} onValueChange={v => setAmounts(prev => prev.map((a, j) => (j === i ? v : a)))} min={0} step={10} disabled={!!blocked} />
            ))}
          </div>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Maximum shares burned</dt>
              <dd>{blocked ? "Not available" : num(sum(amounts.map((a, i) => a * Number(rateFor(pool.coins[i]).omerPerUnit))) / total * Number(pool.totalShares) * (1 + fee) * 1.005, 2)}</dd>
            </div>
            <div className={styles.fact}><dt>Imbalance fee</dt><dd>{pct(fee, 2)}</dd></div>
          </dl>
          <PreviewAction label={PREVIEW_ACTION} disabled={blocked ? "Exit disabled: use proportional" : undefined} />
        </>
      )}
    </div>
  );
}

export function LiquidityScreen({ initialTab, initialPool, initialMode }: { initialTab: "add" | "remove"; initialPool: string; initialMode: string }) {
  const [tab, setTab] = useState(initialTab);
  const [poolId, setPoolId] = useState(pools.some(p => p.id === initialPool) ? initialPool : "stable-t2");
  const [mode, setMode] = useState<Mode>(modeOptions.some(m => m.value === initialMode) ? initialMode as Mode : "proportional");
  const pool = poolById(poolId);
  const mine = pool.id === position.pool ? position : null;

  return (
    <div className={styles.screen}>
      <div className={styles.heading}>
        <div className={styles.headingText}>
          <h1 className={styles.title}>Liquidity</h1>
          <p className={styles.description}>Add or remove credits proportionally, as one coin, or in any mix. {NO_LP_TOKEN}</p>
        </div>
      </div>

      <Alert tone="info" title="Proportional exit always works">{PROPORTIONAL_EXIT}</Alert>

      <div className={styles.split}>
        <section className={styles.panel} aria-label="Add or remove liquidity">
          <Tabs value={tab} onValueChange={value => setTab(value as "add" | "remove")}>
            <div className={styles.stack}>
              <div className={styles.panelHead}>
                <TabsList aria-label="Direction">
                  <TabsTrigger value="add">Add</TabsTrigger>
                  <TabsTrigger value="remove">Remove</TabsTrigger>
                </TabsList>
                <Badge tone="neutral" size="sm" outline>{pool.kind}</Badge>
              </div>
              <Select label="Pool" value={poolId} onValueChange={setPoolId} options={poolOptions} />
              <SegmentedControl label="Method" options={modeOptions} value={mode} onValueChange={value => setMode(value as Mode)} fullWidth />
              <TabsContent value="add"><AddPanel key={`${poolId}-${mode}`} pool={pool} mode={mode} /></TabsContent>
              <TabsContent value="remove"><RemovePanel key={`${poolId}-${mode}`} pool={pool} mode={mode} /></TabsContent>
            </div>
          </Tabs>
        </section>

        <div className={styles.stack}>
          <section className={styles.panel} aria-labelledby="position-title">
            <div className={styles.panelHead}>
              <h2 id="position-title" className={styles.panelTitle}>Your position</h2>
              <Badge tone="neutral" size="sm">Shares, no LP token</Badge>
            </div>
            {mine ? (
              <dl className={styles.facts}>
                <div className={styles.fact}><dt>Shares</dt><dd>{num(mine.shares, 2)}</dd></div>
                <div className={styles.fact}><dt>Share of pool</dt><dd>{pct(mine.shareOfPoolBps / 10_000, 2)}</dd></div>
                {pool.coins.map((c, i) => <div key={c} className={styles.fact}><dt>{c} claim</dt><dd>{num(mine.underlying[i], 2)}</dd></div>)}
              </dl>
            ) : (
              <dl className={styles.facts}>
                <div className={styles.fact}><dt>Shares (sample)</dt><dd>1,200.00</dd></div>
                <div className={styles.fact}><dt>Share of pool</dt><dd>{pct(1200 / Number(pool.totalShares), 2)}</dd></div>
              </dl>
            )}
            <p className={styles.muted}>{NO_LP_TOKEN} Shares are recorded by the pool and cannot be transferred in this design.</p>
          </section>

          <section className={styles.panel} aria-labelledby="pool-state-title">
            <div className={styles.panelHead}>
              <h2 id="pool-state-title" className={styles.panelTitle}>Pool state</h2>
              <Badge size="sm" tone={pool.status === "active" ? "success" : pool.status === "paused" ? "warning" : "danger"} dot>
                {pool.status === "active" ? "Active" : pool.status === "paused" ? "Paused" : "Rates stale"}
              </Badge>
            </div>
            <dl className={styles.facts}>
              <div className={styles.fact}><dt>Proportional exit</dt><dd>Available</dd></div>
              <div className={styles.fact}><dt>One-coin and imbalanced paths</dt><dd>{pool.status === "active" ? "Available" : "Disabled"}</dd></div>
              <div className={styles.fact}><dt>Deposits</dt><dd>{pool.status === "active" ? "Available" : "Disabled"}</dd></div>
              {pool.coins.map(c => <div key={c} className={styles.fact}><dt>{c} rate</dt><dd>{rateFor(c).omerPerUnit} OMER, {age(rateFor(c).ageSeconds)} old</dd></div>)}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
