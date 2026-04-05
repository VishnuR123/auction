import TournamentSwitcher from "../../components/TournamentSwitcher.jsx";
import "./ipl24Archive.css";
import ExcelUploader from "./ExcelUploader.jsx";

export default function Ipl24Shell() {
  return (
    <div className="ipl24-archive-root">
      <div
        className="ipl24-archive-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        <TournamentSwitcher variant="compact" />
      </div>
      <div className="ipl24-archive">
        <h1>Points Table</h1>
        <ExcelUploader />
      </div>
    </div>
  );
}
