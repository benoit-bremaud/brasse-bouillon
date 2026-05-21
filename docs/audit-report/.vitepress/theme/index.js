import DefaultTheme from "vitepress/theme";
import "./style.css";

import VerdictHero from "./components/VerdictHero.vue";
import ScoreGauge from "./components/ScoreGauge.vue";
import SeverityBadge from "./components/SeverityBadge.vue";
import FindingCard from "./components/FindingCard.vue";
import CoverageMatrix from "./components/CoverageMatrix.vue";
import StatRow from "./components/StatRow.vue";
import StatusBadge from "./components/StatusBadge.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("VerdictHero", VerdictHero);
    app.component("ScoreGauge", ScoreGauge);
    app.component("SeverityBadge", SeverityBadge);
    app.component("FindingCard", FindingCard);
    app.component("CoverageMatrix", CoverageMatrix);
    app.component("StatRow", StatRow);
    app.component("StatusBadge", StatusBadge);
  }
};
