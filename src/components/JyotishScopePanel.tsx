import { Link } from "react-router-dom";
import {
  featuresForPage,
  type JyotishFeature,
  type JyotishFeatureStatus,
  type JyotishPageId,
} from "../data/jyotishScope";

const STATUS_LABEL: Record<JyotishFeatureStatus, string> = {
  implemented: "Implemented",
  partial: "Partial",
  "not-planned": "Not in this app",
};

const STATUS_CLASS: Record<JyotishFeatureStatus, string> = {
  implemented: "pass",
  partial: "jyotish-scope__status--partial",
  "not-planned": "fail",
};

function FeatureRow({ feature }: { feature: JyotishFeature }) {
  return (
    <li className="jyotish-scope__item">
      <span className={`jyotish-scope__status ${STATUS_CLASS[feature.status]}`}>
        {STATUS_LABEL[feature.status]}
      </span>
      <strong>{feature.name}</strong>
      <span className="jyotish-scope__summary"> — {feature.summary}</span>
      {feature.detail && (
        <p className="jyotish-scope__detail">{feature.detail}</p>
      )}
    </li>
  );
}

export default function JyotishScopePanel({
  pageId,
  title = "Scope & limitations",
  showFullCatalogLink = true,
}: {
  pageId?: JyotishPageId;
  title?: string;
  showFullCatalogLink?: boolean;
}) {
  const items = pageId ? featuresForPage(pageId) : featuresForPage("global");

  return (
    <section className="card jyotish-scope">
      <h3 className="jyotish-scope__title">{title}</h3>
      <ul className="jyotish-scope__list">
        {items.map((f) => (
          <FeatureRow key={f.id} feature={f} />
        ))}
      </ul>
      {showFullCatalogLink && pageId && pageId !== "global" && (
        <p className="jyotish-scope__footer">
          <Link to="/jyotish-scope">Full Jyotish depth catalog</Link>
        </p>
      )}
    </section>
  );
}
