import { Alert } from "@arc/alert/alert";
import { Badge } from "@arc/badge/badge";
import { BarChart } from "@arc/bar-chart/bar-chart";
import { CopyButton } from "@arc/copy-button/copy-button";
import { DonutChart } from "@arc/donut-chart/donut-chart";
import { EmptyState } from "@arc/empty-state/empty-state";
import { MetricCard } from "@arc/metric-card/metric-card";
import { NumberField } from "@arc/number-field/number-field";
import { Progress } from "@arc/progress/progress";
import { Timeline } from "@arc/timeline/timeline";
import { UsageMeter } from "@arc/usage-meter/usage-meter";
import { MOCK_NOW, activity, rewards } from "../mock/sdk";
import { num } from "../format";
import styles from "./screens.module.css";

export function DashboardScreen() {
  const r = rewards;
  const cap = Number(r.spendCap.capOmer);
  const elapsed = (r.epochBlocks - r.blocksLeft) / r.epochBlocks;
  const streams = [
    { key: "spend", label: "Verified spend", value: Number(r.streams.spend), color: "var(--series-1)" },
    { key: "lp", label: "Liquidity", value: Number(r.streams.lp), color: "var(--series-2)" },
    { key: "fees", label: "Fees paid", value: Number(r.streams.fees), color: "var(--series-3)" },
  ];

  return (
    <div className={styles.screen}>
      <div className={styles.heading}>
        <div className={styles.headingText}>
          <h1 className={styles.title}>Agent dashboard</h1>
          <p className={styles.description}>What one agent ID spent this epoch, how close it is to its cap, and the reward points it earned. Anyone can read this without signing.</p>
        </div>
      </div>

      <section className={styles.panel} aria-labelledby="agent-title">
        <div className={styles.panelHead}>
          <div className={styles.identity}>
            <h2 id="agent-title" className={styles.panelTitle}>{r.label}</h2>
            <Badge tone="neutral" size="sm">TEST</Badge>
          </div>
          <div className={styles.identity}>
            <span className={styles.muted}>Agent ID</span>
            <code className={styles.agentId}>{r.agentId}</code>
            <CopyButton value={r.agentId} label="Copy agent ID" iconOnly variant="plain" />
          </div>
        </div>
        <Progress
          value={Math.round(elapsed * 100)}
          label={`Epoch ${num(r.epoch, 0)}: ${num(r.blocksLeft, 0)} of ${num(r.epochBlocks, 0)} blocks left`}
          showValue
        />
      </section>

      <div className={styles.dashGrid}>
        <section className={styles.panel} aria-labelledby="cap-title">
          <div className={styles.panelHead}>
            <h2 id="cap-title" className={styles.panelTitle}>Spend cap this epoch</h2>
            <Badge tone="info" size="sm">Pending: {r.spendCap.pendingCapOmer} OMER from epoch {num(r.spendCap.pendingFromEpoch, 0)}</Badge>
          </div>
          <UsageMeter
            label="OMER spent by credit"
            segments={r.spendByCoin.map(s => ({ id: s.symbol, label: s.symbol, value: Number(s.omer) }))}
            limit={cap}
            unit=" OMER"
            freeLabel="Left this epoch"
            overLabel="Over cap"
            warnAt={.9}
          />
          <Alert tone="info" title="Raising a cap takes one epoch">
            A higher cap applies from the next epoch, so a compromised key cannot lift the limit and spend it in the same epoch. The pending cap of {r.spendCap.pendingCapOmer} OMER starts at epoch {num(r.spendCap.pendingFromEpoch, 0)}.
          </Alert>
          <NumberField
            label="Requested cap"
            value={Number(r.spendCap.pendingCapOmer)}
            suffix="OMER"
            disabled
            description="Read-only preview. Changing a cap needs a signed transaction from the agent's operator."
          />
        </section>

        <section className={styles.panel} aria-labelledby="rewards-title">
          <div className={styles.panelHead}>
            <h2 id="rewards-title" className={styles.panelTitle}>Reward points this epoch</h2>
            <Badge tone="neutral" size="sm">Not a token</Badge>
          </div>
          <DonutChart data={streams} label="Reward points by stream" unit=" pts" formatValue={v => num(v, 1)} totalLabel="Points" size={184} thickness={22} />
          <p className={styles.muted}>Points accrue toward the reward token (TBD). It has no name, ticker or supply, does not exist and is not for sale. Points have no price.</p>
        </section>
      </div>

      <div className={styles.metrics}>
        <MetricCard label="Spend stream" value={Math.round(Number(r.streams.spend))} suffix={"\u00a0pts"} context="1 point per OMER of attested inference" />
        <MetricCard label="Liquidity stream" value={Math.round(Number(r.streams.lp))} suffix={"\u00a0pts"} context="Shares held, weighted by time" />
        <MetricCard label="Fees stream" value={Math.round(Number(r.streams.fees))} suffix={"\u00a0pts"} context="Swap fees paid, in OMER" />
      </div>

      <div className={styles.dashGrid}>
        <section className={styles.panel} aria-labelledby="history-title">
          <h2 id="history-title" className={styles.panelTitle}>Spend by epoch</h2>
          <BarChart
            data={r.history.map(h => ({ key: String(h.epoch), label: `Epoch ${num(h.epoch, 0)}`, axisLabel: String(h.epoch), value: Number(h.spendOmer) }))}
            label="OMER spend per epoch"
            period="Last 7 epochs"
            unit=" OMER"
            averageLabel="Epoch average"
            categoryLabel="Epoch"
            formatValue={v => num(v, 1)}
          />
        </section>

        <section className={styles.panel} aria-labelledby="later-title">
          <div className={styles.panelHead}>
            <h2 id="later-title" className={styles.panelTitle}>Gauge votes and ve-lock</h2>
            <Badge tone="neutral" size="sm">Later</Badge>
          </div>
          <EmptyState
            title="A later state, not in the first design"
            description="Gauge votes and an optional ve-lock may follow once rewards exist. There is nothing to lock: the reward token (TBD) does not exist."
          />
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="activity-title">
        <h2 id="activity-title" className={styles.panelTitle}>Attributed activity</h2>
        <Timeline
          events={activity.map(a => ({ id: a.id, at: a.at, title: a.title, meta: a.meta, tone: a.tone }))}
          now={MOCK_NOW}
          label="Recent activity for this agent ID"
          headingLevel={3}
        />
      </section>
    </div>
  );
}
