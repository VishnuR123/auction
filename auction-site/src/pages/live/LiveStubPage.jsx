import { useParams } from "react-router-dom";

export default function LiveStubPage({ title }) {
  const { tournamentId } = useParams();
  return (
    <div className="live-page">
      <h1 className="live-page__title">{title}</h1>
      <p className="live-page__text">
        Placeholder for <strong>{tournamentId}</strong>. Content will mirror the
        IPL&nbsp;25 frontend page for this route.
      </p>
    </div>
  );
}
