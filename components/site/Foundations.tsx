import { Button } from "@/components/atoms/Button";
import { StatusPill } from "@/components/atoms/StatusPill";
import { Chip } from "@/components/atoms/Chip";
import { TextRow } from "@/components/atoms/TextRow";

/* The token layer, made visible — type, color, shadow, spacing, buttons, text rows. */

function Tile({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-surface shadow-card">
      <div className="border-b border-line px-4 py-2.5">
        <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-4">{children}</div>
    </div>
  );
}

export function Foundations() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-14">
      <div className="mb-4 flex items-baseline gap-2 px-0.5">
        <h2 className="text-sm font-semibold text-ink">Foundations</h2>
        <span className="text-[13px] text-ink-3">
          the tokens everything above is built from
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Tile title="Type">
          <div className="flex flex-col gap-1.5">
            <span className="text-2xl font-semibold tracking-[-0.02em] text-ink">
              Inter, tuned
            </span>
            <span className="text-sm text-ink">
              Body at 14px, line-height 1.5
            </span>
            <span className="text-[13px] text-ink-2">
              Secondary gets color, not weight
            </span>
            <span className="text-xs text-ink-3">
              Captions at 12px · <span className="tabular-nums">1,234.56</span>{" "}
              tabular · <Chip>mono_chip</Chip>
            </span>
          </div>
        </Tile>

        <Tile title="Color">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {["bg-ink", "bg-ink-2", "bg-ink-3", "bg-line-strong", "bg-inset"].map(
                (c) => (
                  <span
                    key={c}
                    className={`size-7 rounded-full shadow-hairline ${c}`}
                  />
                ),
              )}
              <span className="size-7 rounded-full bg-accent shadow-hairline" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <StatusPill tone="green">Completed</StatusPill>
              <StatusPill tone="orange">Needs review</StatusPill>
              <StatusPill tone="red">Failed</StatusPill>
              <StatusPill tone="accent">Active</StatusPill>
            </div>
            <p className="text-xs text-ink-3">
              Color is a condiment — dots, pills and one primary action.
            </p>
          </div>
        </Tile>

        <Tile title="Shadow">
          <div className="flex items-center justify-around py-2">
            {(
              [
                ["hairline", "shadow-hairline"],
                ["card", "shadow-card"],
                ["overlay", "shadow-overlay"],
              ] as const
            ).map(([name, cls]) => (
              <div key={name} className="flex flex-col items-center gap-2.5">
                <span className={`size-14 rounded-card bg-surface ${cls}`} />
                <span className="text-xs text-ink-3">{name}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-3">
            Layered, ambient, single-digit opacities. Never harsh.
          </p>
        </Tile>

        <Tile title="Spacing & radius">
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-1.5">
              {[4, 8, 12, 16, 24, 32].map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <span
                    className="w-5 rounded-sm bg-accent-tint"
                    style={{ height: s }}
                  />
                  <span className="text-[10px] text-ink-3 tabular-nums">{s}</span>
                </div>
              ))}
              <span className="mb-4 ml-1 text-xs text-ink-3">4px grid</span>
            </div>
            <div className="flex items-center gap-2">
              {(
                [
                  ["8", "rounded-chip"],
                  ["10", "rounded-control"],
                  ["16", "rounded-card"],
                  ["999", "rounded-full"],
                ] as const
              ).map(([r, cls]) => (
                <span
                  key={r}
                  className={`flex h-8 items-center bg-inset px-3 text-xs text-ink-2 shadow-hairline ${cls}`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </Tile>

        <Tile title="Buttons">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" size="sm">Accept</Button>
              <Button variant="accent" size="sm">Accept</Button>
              <Button variant="secondary" size="sm">Alternatives</Button>
              <Button variant="ghost" size="sm">Skip</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary">Send</Button>
              <Button variant="secondary">Configure</Button>
            </div>
            <p className="text-xs text-ink-3">
              Scales to 0.96 on press. One filled action per surface.
            </p>
          </div>
        </Tile>

        <Tile title="Text rows">
          <div className="flex flex-col divide-y divide-line">
            <TextRow label="Current value" value="780,704 USD" meta="+8%" />
            <TextRow label="Logs" value="0.0125 of 1 GB" />
            <TextRow label="In portfolio since" value="02/28/2023" />
          </div>
        </Tile>
      </div>
    </section>
  );
}
