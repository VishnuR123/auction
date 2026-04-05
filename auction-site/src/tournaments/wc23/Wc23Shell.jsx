import TournamentSwitcher from "../../components/TournamentSwitcher.jsx";
import "./wc23Archive.css";
import ExcelUploader from "./ExcelUploader.jsx";

export default function Wc23Shell() {
  return (
    <div className="wc23-archive-root">
      <div
        className="wc23-archive-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        <TournamentSwitcher variant="compact" />
      </div>
      <div className="wc23-archive">
        <h1>Points Table</h1>
        <ExcelUploader />
      </div>
    </div>
  );
}
