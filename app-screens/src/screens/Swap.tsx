import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Alert } from "@arc/alert/alert";
import { Badge } from "@arc/badge/badge";
import { Button } from "@arc/button/button";
import { Input } from "@arc/input/input";
import { Select } from "@arc/select/select";
import SegmentedControl from "@arc/segmented-control/segmented-control";
import { Tooltip } from "@arc/tooltip/tooltip";
import { coins, quote, rateFor, type Quote, type QuoteHop } from "../mock/sdk";
import { age, bps, num, sum } from "../format";
import { PLACEHOLDER_RATES, PREVIEW_ACTION, PREVIEW_ACTION_HINT } from "../copy";
import styles from "./screens.module.css";

type SwapState = "quote" | "stale";

const staleQuote: Quote = {
  chainId: 31337,
  from: "tFLOP-T3",
  to: "tPEARL-T3",
  amountIn: "40.000000",
  amountOut: "0",
  minAmountOut: "0",
  slippageBps: 50,
  deadlineSeconds: 600,
  priceImpactBps: 0,
  ratesMaxAgeSeconds: 1840,
  stale: true,
  placeholder: true,
  route: [
    { pool: "stable-t3", kind: "StablePool", from: "tFLOP-T3", to: "tPEARL-T3", amountIn: "40.000000", amountOut: "0", fee: { direction: "toward", baseBps: 4, slopeBpsPerBps: 0.5, deviationBps: 0, effectiveBps: 4 } },
  ],
};

const coinOptions = Object.values(coins).map(c => ({ value: c.symbol, label: `${c.symbol}, ${c.name}` }));

function FeeReadout({ fee }: { fee: QuoteHop["fee"] }) {
  if (fee.direction === "toward") {
    return <span className={styles.formula}>fee = base = {bps(fee.baseBps)}</span>;
  }
  return <span className={styles.formula}>fee = {num(fee.baseBps, 1, 0)} + {num(fee.slopeBpsPerBps, 2, 0)} × {num(fee.deviationBps, 0)} = {bps(fee.effectiveBps)}</span>;
}

function Route({ q }: { q: Quote }) {
  return (
    <ol className={styles.hops} aria-label={`Route, ${q.route.length} of up to 4 hops`}>
      {q.route.map((hop, index) => (
        <li key={hop.pool} className={styles.hop}>
          <span className={styles.hopIndex}>{index + 1}</span>
          <div className={styles.hopLine}>
            <span className={styles.hopPair}>{hop.from} → {hop.to}</span>
          </div>
          <div className={styles.hopLine}>
            <span className={styles.hopMeta}>{hop.pool}</span>
            <Badge size="sm" tone="neutral" outline>{hop.kind}</Badge>
            {q.stale
              ? <Badge size="sm" tone="danger" dot>Rates stale</Badge>
              : <Badge size="sm" tone={hop.fee.direction === "toward" ? "info" : "warning"} dot>{hop.fee.direction === "toward" ? "Toward oracle price" : "Away from oracle price"}</Badge>}
          </div>
          <div className={styles.hopLine}>
            {q.stale ? <span className={styles.hopMeta}>No quote while the rate is stale</span> : <FeeReadout fee={hop.fee} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SwapScreen({ initialState }: { initialState: SwapState }) {
  const [state, setState] = useState<SwapState>(initialState);
  const [slippage, setSlippage] = useState("50");
  const [deadline, setDeadline] = useState("600");
  const q = state === "stale" ? staleQuote : quote;
  const totalFeeBps = sum(q.route.map(h => h.fee.effectiveBps));
  const routeSymbols = Array.from(new Set(q.route.flatMap(h => [h.from, h.to])));
  const outRate = rateFor(q.to);
  const minOut = Number(q.amountOut) * (1 - Number(slippage) / 10_000);

  return (
    <div className={styles.screen}>
      <div className={styles.heading}>
        <div className={styles.headingText}>
          <h1 className={styles.title}>Swap credits</h1>
          <p className={styles.description}>Quote a route of up to four hops between FLOP and Pearl inference credits, priced in OMER. {PLACEHOLDER_RATES}</p>
        </div>
        <SegmentedControl
          label="Preview state"
          options={[{ value: "quote", label: "Quote" }, { value: "stale", label: "Rates stale" }]}
          value={state}
          onValueChange={value => setState(value as SwapState)}
        />
      </div>

      <div className={styles.split}>
        <section className={styles.panel} aria-labelledby="swap-form-title">
          <div className={styles.panelHead}>
            <h2 id="swap-form-title" className={styles.panelTitle}>Quote</h2>
            <Badge tone="neutral" size="sm">Chain {q.chainId}, local rehearsal</Badge>
          </div>

          {q.stale && (
            <Alert tone="danger" title="Rates stale, swap disabled">
              The {q.from} and {q.to} rates are {age(q.ratesMaxAgeSeconds)} old, past the {age(rateFor(q.from).maxAgeSeconds)} limit. Quotes that need them are disabled until a keeper updates the oracle. Proportional exits from the pool still work.
            </Alert>
          )}

          <div className={styles.stack}>
            <div className={styles.fieldRow}>
              <Input label="You pay" defaultValue={num(q.amountIn, 2)} inputMode="decimal" disabled={q.stale} />
              <Select label="Credit" options={coinOptions} defaultValue={q.from} key={`from-${q.from}`} />
            </div>
            <div className={styles.flip}><ArrowDown size={20} strokeWidth={1.75} aria-hidden="true" /></div>
            <div className={styles.receive} aria-live="polite">
              <span className={styles.receiveLabel}>You receive (estimate)</span>
              <span className={styles.receiveValue}>{q.stale ? "Not available" : `${num(q.amountOut, 6)} ${q.to}`}</span>
              <span className={styles.receiveMeta}>
                {q.stale ? "No quote while rates are stale" : `${num(Number(q.amountOut) * Number(outRate.omerPerUnit), 2)} OMER at a placeholder rate of ${outRate.omerPerUnit} OMER per ${q.to}`}
              </span>
            </div>
          </div>

          <div className={styles.settings}>
            <div>
              <span className={styles.settingLabel} id="slippage-label">Slippage limit</span>
              <SegmentedControl
                label="Slippage limit"
                options={[{ value: "10", label: "0.1%" }, { value: "50", label: "0.5%" }, { value: "100", label: "1%" }]}
                value={slippage}
                onValueChange={setSlippage}
                fullWidth
              />
            </div>
            <Select
              label="Deadline"
              value={deadline}
              onValueChange={setDeadline}
              options={[{ value: "300", label: "5 minutes" }, { value: "600", label: "10 minutes" }, { value: "1200", label: "20 minutes" }]}
            />
          </div>

          <dl className={styles.facts}>
            <div className={styles.fact}><dt>Minimum received</dt><dd>{q.stale ? "Not available" : `${num(minOut, 6)} ${q.to}`}</dd></div>
            <div className={styles.fact}><dt>Price impact</dt><dd>{q.stale ? "Not available" : bps(q.priceImpactBps)}</dd></div>
            <div className={styles.fact}><dt>Fees across {q.route.length} {q.route.length === 1 ? "hop" : "hops"}</dt><dd>{q.stale ? "Not available" : bps(totalFeeBps)}</dd></div>
            <div className={styles.fact}><dt>Deadline</dt><dd>{Number(deadline) / 60} minutes after signing</dd></div>
            <div className={styles.fact}><dt>Oldest rate used</dt><dd>{age(q.ratesMaxAgeSeconds)}</dd></div>
          </dl>

          <div className={styles.action}>
            <Tooltip content={PREVIEW_ACTION_HINT}>
              <span>
                <Button variant="primary" size="lg" disabled aria-describedby="swap-hint" style={{ width: "100%" }}>
                  {q.stale ? "Swap disabled: rates stale" : PREVIEW_ACTION}
                </Button>
              </span>
            </Tooltip>
            <p id="swap-hint" className={styles.actionHint}>{PREVIEW_ACTION_HINT}</p>
          </div>
        </section>

        <div className={styles.stack}>
          <section className={styles.panel} aria-labelledby="route-title">
            <div className={styles.panelHead}>
              <h2 id="route-title" className={styles.panelTitle}>Route</h2>
              <span className={styles.muted}>{q.route.length} of up to 4 hops</span>
            </div>
            <Route q={q} />
          </section>

          <section className={styles.panel} aria-labelledby="fee-title">
            <h2 id="fee-title" className={styles.panelTitle}>Dynamic fee</h2>
            <div className={styles.feeKey}>
              <div className={styles.feeKeyItem}>
                <span className={styles.secondary}>Trade moves the pool toward the oracle price</span>
                <span className={styles.formula}>fee = base</span>
              </div>
              <div className={styles.feeKeyItem}>
                <span className={styles.secondary}>Trade moves the pool away from it</span>
                <span className={styles.formula}>fee = base + slope × deviation</span>
              </div>
            </div>
            <p className={styles.muted}>Deviation is in bps between the pool price and the oracle price after the trade. Base, slope and the fee cap are placeholders.</p>
          </section>

          <section className={styles.panel} aria-labelledby="rates-title">
            <div className={styles.panelHead}>
              <h2 id="rates-title" className={styles.panelTitle}>OMER rates on this route</h2>
              <Badge tone="neutral" size="sm">Placeholder</Badge>
            </div>
            <ul className={styles.rateList}>
              {routeSymbols.map(symbol => {
                const r = rateFor(symbol);
                return (
                  <li key={symbol} className={styles.rateRow}>
                    <span className={styles.mono}>{symbol}</span>
                    <span>{r.omerPerUnit} OMER</span>
                    {r.stale ? <Badge size="sm" tone="danger" dot>{age(r.ageSeconds)} old</Badge> : <Badge size="sm" tone="success" dot>{age(r.ageSeconds)} old</Badge>}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
