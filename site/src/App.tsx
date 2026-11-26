import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Alert } from "@arc/alert/alert";
import { Badge } from "@arc/badge/badge";
import { CodeBlock } from "@arc/code-block/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@arc/tabs/tabs";
import { ThemeSwitch } from "@arc/theme-switch/theme-switch";
import { SiteHeader } from "@arc/blocks/site-header/site-header";
import { SiteFooter } from "@arc/blocks/site-footer/site-footer";
import { HeroContent } from "@arc/blocks/hero-section/hero-content";
import { FaqSection } from "@arc/blocks/faq-section/faq-section";
import { Logo } from "@shared/brand/Logo";
import { Illustration } from "@shared/brand/Illustration";
import { applyTheme, type Theme } from "@shared/brand/setup";
import { CHAIN_MESSAGE, agents, fairLaunch, faq, feeRule, footer, gaps, hero, links, nav, omerPanel, repos, steps } from "./content";
import styles from "./App.module.css";

function OmerPanel() {
  return (
    <figure className={styles.omer}>
      <p className={styles.equation}>
        <span className={styles.equationHead}>{omerPanel.head}</span>{" "}
        <span className={styles.equationTail}>{omerPanel.tail}</span>
      </p>
      <Illustration name="omer-unit" />
      <figcaption className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.swatchInput} aria-hidden="true" />{omerPanel.input}</span>
        <span className={styles.legendItem}><span className={styles.swatchOutput} aria-hidden="true" />{omerPanel.output}</span>
        <span className={styles.legendNote}>{omerPanel.cell}</span>
      </figcaption>
    </figure>
  );
}

function SectionHeading({ id, title, description }: { id: string; title: string; description?: string }) {
  return (
    <div className={styles.sectionHeading}>
      <h2 id={`${id}-title`} className={styles.sectionTitle}>{title}</h2>
      {description && <p className={styles.sectionDescription}>{description}</p>}
    </div>
  );
}

export default function App({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const changeTheme = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <>
      <div className={styles.notice}>
        <div className={styles.noticeInner}>
          <Alert tone="warning" title="Testnet rehearsal only" className={styles.noticeAlert}>{CHAIN_MESSAGE}</Alert>
          <ThemeSwitch theme={theme} variant="reveal" onThemeChange={changeTheme} iconOnly label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} />
        </div>
      </div>

      <SiteHeader
        variant="simple"
        brand={{ name: "Inference Finance", href: "#top", mark: <Logo variant="mark" height={24} title="" /> }}
        items={nav}
        secondaryAction={null}
        primaryAction={{ label: "Read the code", href: "#code" }}
        sticky
      />

      <main id="top" className={styles.main}>
        <HeroContent
          layout="split"
          announcement={{ label: hero.announcement, href: "#gaps" }}
          title={hero.title}
          description={hero.description}
          primaryAction={{ label: hero.primary, href: links.stableswap, external: true }}
          secondaryAction={{ label: hero.secondary, href: "#how" }}
          meta={hero.meta}
          media={<OmerPanel />}
        />

        <section id="how" aria-labelledby="how-title" className={styles.section}>
          <SectionHeading id="how" title="How it works" description="Four pieces take a provider's credit to a quote an agent can act on." />
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <div className={styles.stepHead}>
                  <Illustration name={step.glyph} size="glyph" />
                  <span className={styles.stepIndex}>{index + 1}</span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.fee}>
            <div className={styles.feeIntro}>
              <h3 className={styles.stepTitle}>{feeRule.title}</h3>
              <p className={styles.stepBody}>{feeRule.description}</p>
            </div>
            <dl className={styles.feeRules}>
              <div className={styles.feeRule}>
                <dt>{feeRule.toward.label}</dt>
                <dd><code>{feeRule.toward.formula}</code></dd>
              </div>
              <div className={styles.feeRule}>
                <dt>{feeRule.away.label}</dt>
                <dd><code>{feeRule.away.formula}</code></dd>
              </div>
            </dl>
            <p className={styles.feeNote}>{feeRule.note}</p>
          </div>
        </section>

        <section id="gaps" aria-labelledby="gaps-title" className={styles.section}>
          <SectionHeading id="gaps" title={gaps.title} description={gaps.description} />
          <ul className={styles.gaps}>
            {gaps.items.map(item => (
              <li key={item.title} className={styles.gap}>
                <Badge tone="warning" dot>{item.title}</Badge>
                <p className={styles.stepBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="agents" aria-labelledby="agents-title" className={styles.section}>
          <SectionHeading id="agents" title={agents.title} description={agents.description} />
          <div className={styles.agents}>
            <ul className={styles.points}>
              {agents.points.map(point => (
                <li key={point.title}>
                  <h3 className={styles.stepTitle}>{point.title}</h3>
                  <p className={styles.stepBody}>{point.body}</p>
                </li>
              ))}
            </ul>
            <div className={styles.code}>
              <Tabs defaultValue="cli">
                <TabsList aria-label="Quote example">
                  <TabsTrigger value="cli">CLI</TabsTrigger>
                  <TabsTrigger value="mcp">MCP tool call</TabsTrigger>
                  <TabsTrigger value="output">Quote output</TabsTrigger>
                </TabsList>
                <TabsContent value="cli"><CodeBlock code={agents.cli} filename="terminal" language="bash" /></TabsContent>
                <TabsContent value="mcp"><CodeBlock code={agents.mcp} filename="inference_finance_quote" language="json" /></TabsContent>
                <TabsContent value="output"><CodeBlock code={agents.output} filename="quote.json" language="json" /></TabsContent>
              </Tabs>
              <p className={styles.codeNote}>{agents.outputNote}</p>
            </div>
          </div>
        </section>

        <section id="fair-launch" aria-labelledby="fair-launch-title" className={styles.section}>
          <SectionHeading id="fair-launch" title={fairLaunch.title} description={fairLaunch.description} />
          <Alert tone="warning" title={fairLaunch.alertTitle}>{fairLaunch.alertBody}</Alert>
          <div className={styles.launch}>
            <div className={styles.launchRules}>
              {fairLaunch.rules.map(rule => (
                <div key={rule.title} className={styles.rule}>
                  <h3 className={styles.ruleTitle}>{rule.title}</h3>
                  <p className={styles.stepBody}>{rule.body}</p>
                </div>
              ))}
            </div>
            <div className={styles.streams}>
              <Illustration name="reward-streams" className={styles.streamsArt} />
              <ul className={styles.streamList}>
                {fairLaunch.streams.map(stream => (
                  <li key={stream.key} className={styles.stream} data-stream={stream.key}>
                    <span className={styles.streamDot} aria-hidden="true" />
                    <span><span className={styles.streamTitle}>{stream.title}.</span> {stream.body}</span>
                  </li>
                ))}
                <li className={styles.stream} data-stream="tbd">
                  <span className={styles.streamDot} aria-hidden="true" />
                  <span><span className={styles.streamTitle}>Reward token (TBD).</span> Unnamed, no ticker, no supply.</span>
                </li>
              </ul>
              <p className={styles.codeNote}>{fairLaunch.later}</p>
            </div>
          </div>
        </section>

        <FaqSection
          variant="accordion"
          title="Questions people ask first"
          description="Short answers. The repositories have the long ones."
          items={faq}
          defaultValue={["token"]}
          contact={null}
        />

        <section id="code" aria-labelledby="code-title" className={styles.section}>
          <SectionHeading id="code" title="Read the code" description="Everything is open source and unaudited." />
          <ul className={styles.repos}>
            {repos.map(repo => (
              <li key={repo.title} className={styles.repo}>
                <h3 className={styles.repoTitle}>{repo.title}</h3>
                <p className={styles.stepBody}>{repo.description}</p>
                <a className={styles.repoLink} href={repo.href} target="_blank" rel="noopener noreferrer">
                  {repo.label}<ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <div className={styles.footer}>
      <SiteFooter
        variant="columns"
        brand={{ name: "Inference Finance", href: "#top", mark: <Logo variant="mark" height={22} title="" /> }}
        tagline={footer.tagline}
        columns={[
          { title: "Design", links: nav.slice(0, 4).map(item => ({ label: item.label, href: item.href })) },
          { title: "Code", links: repos.map(repo => ({ label: repo.title, href: repo.href, external: true })) },
          { title: "Licenses", links: [{ label: "Code: MIT" }, { label: "Brand assets: CC BY 4.0" }, { label: "Fonts: SIL OFL 1.1" }] },
        ]}
        legal={[]}
        socials={[]}
        newsletter={null}
        status={{ label: footer.status, tone: "warning", href: "#gaps" }}
        year={2026}
      />
      </div>
    </>
  );
}
