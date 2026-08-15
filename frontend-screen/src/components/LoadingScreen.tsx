import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        Gym<span>Rats</span>
      </div>

      <div className="loading-spinner" />

      <p className="loading-text">
        로딩 중...
      </p>
    </div>
  );
}