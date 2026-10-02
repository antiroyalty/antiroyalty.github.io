const number = new Intl.NumberFormat("en-US", {maximumFractionDigits: 1});
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};

// Each bar is one observation. Never sum repeated snapshots of the same projects.
export function renderQueueHistoryChart(container, readout, bars, statuses, onSelect, minimumBarWidthPx = 112) {
  const maximum = Math.max(1, ...bars.map(bar => bar.total ?? 0));
  const magnitude = 10 ** Math.floor(Math.log10(maximum / 5));
  const tickStep = Math.max(1, [1, 2, 5, 10].find(step => step * magnitude >= maximum / 5) * magnitude);
  const axisMaximum = Math.ceil(maximum / tickStep) * tickStep;
  const plotHeightPx = 240;
  const minimumLabelHeightPx = 14;
  const buttons = new Map();
  const axis = element("div", undefined, "queue-history-axis");
  axis.setAttribute("aria-hidden", "true");
  const viewport = element("div", undefined, "queue-history-viewport");
  const plot = element("div", undefined, "queue-history-plot");
  plot.style.minWidth = `${bars.length * minimumBarWidthPx}px`;
  plot.style.setProperty("--queue-bar-width", `${minimumBarWidthPx}px`);
  const grid = element("div", undefined, "queue-history-grid");
  grid.setAttribute("aria-hidden", "true");
  for (let count = 0; count <= axisMaximum; count += tickStep) {
    const tick = element("span", number.format(count));
    tick.style.top = `${32 + plotHeightPx * (1 - count / axisMaximum)}px`;
    axis.append(tick);
    const line = element("span");
    line.style.bottom = `${count / axisMaximum * 100}%`;
    grid.append(line);
  }
  plot.append(grid);
  viewport.append(plot);
  container.replaceChildren(axis, viewport);
  const clearHover = () => { readout.textContent = ""; };
  clearHover();
  for (const entry of bars) {
    const bar = element(entry.counts ? "button" : "div", undefined, "queue-week");
    const track = element("span", undefined, "queue-week-track");
    if (entry.counts) {
      bar.type = "button";
      const {total, counts} = entry;
      const summary = `${entry.periodLabel} · ${statuses.map(status => `${number.format(counts[status])} ${status.toLowerCase()}`).join(" · ")}`;
      const stack = element("span", undefined, "queue-week-stack");
      stack.setAttribute("aria-hidden", "true");
      stack.style.height = `${plotHeightPx * total / axisMaximum}px`;
      stack.append(element("span", number.format(total), "queue-week-total"));
      for (const status of statuses) {
        const count = counts[status];
        const segment = element("span", undefined, `queue-week-segment queue-status-${status.toLowerCase()}`);
        segment.style.height = `${total ? count / total * 100 : 0}%`;
        if (plotHeightPx * count / axisMaximum >= minimumLabelHeightPx) {
          segment.append(element("span", number.format(count), "queue-week-count"));
        }
        const statusLabel = status[0] + status.slice(1).toLowerCase();
        const hoverText = `${statusLabel} · ${number.format(count)} ${count === 1 ? "project" : "projects"} · ${number.format(total ? count / total * 100 : 0)}% of ${number.format(total)} · ${entry.periodLabel}`;
        segment.addEventListener("pointerenter", () => { readout.textContent = hoverText; });
        segment.addEventListener("pointerleave", clearHover);
        stack.append(segment);
      }
      bar.setAttribute("aria-label", `${summary}. ${entry.description}`);
      bar.addEventListener("click", () => onSelect(entry.id));
      bar.addEventListener("focus", () => { readout.textContent = summary; });
      bar.addEventListener("blur", clearHover);
      track.append(stack);
      buttons.set(entry.id, bar);
    } else {
      track.append(element("span", entry.gapLabel, "queue-week-gap"));
    }
    bar.append(track, element("span", entry.label, "queue-week-label"));
    plot.append(bar);
  }
  return buttons;
}
