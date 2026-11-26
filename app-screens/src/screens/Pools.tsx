import { useMemo, useState } from "react";
import { Alert } from "@arc/alert/alert";
import { Badge } from "@arc/badge/badge";
import { Button } from "@arc/button/button";
import { Skeleton } from "@arc/skeleton/skeleton";
import { EmptyState } from "@arc/empty-state/empty-state";
import { MetricCard } from "@arc/metric-card/metric-card";
import { Progress } from "@arc/progress/progress";
import SegmentedControl from "@arc/segmented-control/segmented-control";
import { SortableDataTable, type DataColumn } from "@arc/sortable-data-table/sortable-data-table";
import { poolById, pools, rateFor, rates, type PoolInfo, type PoolStatus } from "../mock/sdk";
import { age, bps, num, sum } from "../format";
import { PLACEHOLDER_RATES } from "../copy";
import styles from "./screens.module.css";

type Row = {
  id: string;
  kind: PoolInfo["kind"];
  liquidityOmer: number;
  maxRateAge: number;
  baseFee: number;
  status: PoolStatus;
  pool: PoolInfo;
};

const statusBadge: Record<PoolStatus, { tone: "success" | "warning" | "danger"; label: string }> = {
  active: { tone: "success", label: "Active" },
  "rates-stale": { tone: "danger", label: "Rates stale" },
  paused: { tone: "warning", label: "Paused" },
};

const rows: Row[] = pools.map(pool => ({
  id: pool.id,
  kind: pool.kind,
  liquidityOmer: sum(pool.balancesOmer),
  maxRateAge: Math.max(...pool.coins.map(c => rateFor(c).ageSeconds)),
  baseFee: pool.fee.baseBps,
  status: pool.status,
  pool,
}));

const columns: DataColumn<Row>[] = [
  {
    key: "id", label: "Pool", sortable: true,
    render: (_, row) => (
      <div className={styles.cellStack}>
        <span className={styles.mono}>{row.id}</span>
        <span className={styles.muted}>{row.pool.coins.join(" / ")}</span>
      </div>
    ),
  },
  { key: "kind", label: "Type", sortable: true, render: value => <Badge size="sm" tone="neutral" outline>{String(value)}</Badge> },
  {
    key: "balances", label: "Balances",
    render: (_, row) => (
      <div className={styles.cellStack}>
        {row.pool.coins.map((coin, i) => (
          <span key={coin} className={styles.coinLine}><span className={styles.muted}>{coin}</span><span>{num(row.pool.balances[i], 0)}</span></span>
        ))}
      </div>
    ),
  },
  {
    key: "rates", label: "OMER rate",
    render: (_, row) => (
      <div className={styles.cellStack}>
        {row.pool.coins.map(coin => <span key={coin}>{rateFor(coin).omerPerUnit}</span>)}
      </div>
    ),
  },
  { key: "liquidityOmer", label: "Liquidity (OMER)", sortable: true, numeric: true, render: value => num(value as number, 0) },
  {
    key: "maxRateAge", label: "Rate age", sortable: true, numeric: true,
    render: (value, row) => <span className={row.status === "rates-stale" ? styles.secondary : undefined}>{age(value as number)}</span>,
  },
  { key: "baseFee", label: "Base fee", sortable: true, numeric: true, render: value => bps(value as number) },
  { key: "status", label: "Status", sortable: true, render: value => { const s = statusBadge[value as PoolStatus]; return <Badge size="sm" tone={s.tone} dot>{s.label}</Badge>; } },
];

function PoolDetail({ pool }: { pool: PoolInfo }) {
  const total = sum(pool.balancesOmer);
  return (
    <section className={styles.panel} aria-labelledby="pool-detail-title">
      <div className={styles.panelHead}>
        <div className={styles.identity}>
          <h2 id="pool-detail-title" className={styles.panelTitle}>{pool.id}</h2>
          <Badge size="sm" tone="neutral" outline>{pool.kind}</Badge>
          <Badge size="sm" tone={statusBadge[pool.status].tone} dot>{statusBadge[pool.status].label}</Badge>
        </div>
        <span className={styles.muted}>{num(pool.totalShares, 2)} shares outstanding</span>
      </div>
      <div className={styles.dashGrid}>
        <div className={styles.balances}>
          {pool.coins.map((coin, i) => {
            const r = rateFor(coin);
            const share = Number(pool.balancesOmer[i]) / total;
            return (
              <div key={coin} className={styles.balance}>
                <div className={styles.balanceHead}>
                  <span className={styles.mono}>{coin}</span>
                  <span>{num(pool.balances[i], 2)} = {num(pool.balancesOmer[i], 2)} OMER</span>
                </div>
                <Progress value={Math.round(share * 1000) / 10} label={`${coin} share of pool value`} showValue />
                <span className={styles.muted}>Rate {r.omerPerUnit} OMER per unit, updated {age(r.ageSeconds)} ago (limit {age(r.maxAgeSeconds)})</span>
              </div>
            );
          })}
        </div>
        <dl className={styles.params}>
          {pool.kind === "StablePool"
            ? <div className={styles.fact}><dt>Amplification (A)</dt><dd>{pool.A}</dd></div>
            : <div className={styles.fact}><dt>Gamma</dt><dd>{pool.gamma}</dd></div>}
          <div className={styles.fact}><dt>Base fee</dt><dd>{bps(pool.fee.baseBps)}</dd></div>
          <div className={styles.fact}><dt>Fee slope</dt><dd>{num(pool.fee.slopeBpsPerBps, 2, 0)} bps per bps</dd></div>
          <div className={styles.fact}><dt>Fee cap</dt><dd>{bps(pool.fee.maxBps)}</dd></div>
          <div className={styles.fact}><dt>Oracle deviation</dt><dd>{bps(pool.oracleDeviationBps)}</dd></div>
          <div className={styles.fact}><dt>Total value</dt><dd>{num(total, 0)} OMER</dd></div>
        </dl>
      </div>
    </section>
  );
}

type PreviewState = "loaded" | "loading" | "empty" | "error";

export function PoolsScreen({ initialState = "loaded" }: { initialState?: PreviewState }) {
  const [kind, setKind] = useState("all");
  const [state, setState] = useState<PreviewState>(initialState);
  const visible = useMemo(() => (state === "empty" ? [] : rows.filter(r => kind === "all" || r.kind === kind)), [kind, state]);
  const totalOmer = sum(rows.map(r => r.liquidityOmer));
  const fresh = rates.filter(r => !r.stale).length;
  const oldest = Math.max(...rates.map(r => r.ageSeconds));

  return (
    <div className={styles.screen}>
      <div className={styles.heading}>
        <div className={styles.headingText}>
          <h1 className={styles.title}>Pools</h1>
          <p className={styles.description}>A StablePool holds credits that should trade near 1:1 in OMER. A CryptoPool holds pairs that drift, such as a credit against the cash-like numeraire. All balances are TEST mocks. {PLACEHOLDER_RATES}</p>
        </div>
        <div className={styles.identity}>
          <SegmentedControl
            label="Preview state"
            options={[{ value: "loaded", label: "Loaded" }, { value: "loading", label: "Loading" }, { value: "empty", label: "Empty" }, { value: "error", label: "Error" }]}
            value={state}
            onValueChange={value => setState(value as PreviewState)}
          />
          <SegmentedControl
            label="Pool type"
          options={[{ value: "all", label: "All" }, { value: "StablePool", label: "StablePool" }, { value: "CryptoPool", label: "CryptoPool" }]}
          value={kind}
            onValueChange={setKind}
          />
        </div>
      </div>

      <div className={styles.metrics}>
        <MetricCard label="Liquidity in OMER (TEST)" value={Math.round(totalOmer)} context={`Across ${rows.length} mock pools`} />
        <MetricCard label="Rates within limit" value={fresh} suffix={`\u00a0of ${rates.length}`} context="Limit is 15 min per rate" />
        <MetricCard label="Oldest rate" value={Math.round(oldest / 60)} suffix={"\u00a0min"} context="Tier 3 rates, swaps disabled" />
      </div>

      <section className={styles.panel} aria-labelledby="pools-table-title">
        <div className={styles.panelHead}>
          <h2 id="pools-table-title" className={styles.panelTitle}>All pools</h2>
          {state === "loaded" && <span className={styles.muted}>{visible.length} shown</span>}
        </div>
        {state === "loading" && <Skeleton label="Loading pools" lines={6} />}
        {state === "error" && (
          <Alert tone="danger" title="Could not read pools">
            The config points at chain 31337, and no local node answered. Start the local rehearsal node and read again.
            <div style={{ marginTop: "var(--space-3)" }}><Button variant="secondary" size="sm" onClick={() => setState("loaded")}>Read pools again</Button></div>
          </Alert>
        )}
        {(state === "loaded" || state === "empty") && (visible.length === 0
          ? <EmptyState title="No pools in this config" description="Pools appear here once the config lists a deployment. On HyperEVM testnet the address list is still unset." />
          : (
            <div className={styles.tableWrap}>
              <SortableDataTable
                rows={visible}
                columns={columns}
                rowKey="id"
                caption="Mock pools with balances, OMER rates and rate age"
                defaultSort={{ key: "liquidityOmer", direction: "desc" }}
                itemName={{ one: "pool", other: "pools" }}
              />
            </div>
          ))}
      </section>

      <PoolDetail pool={poolById("stable-t2")} />
    </div>
  );
}
