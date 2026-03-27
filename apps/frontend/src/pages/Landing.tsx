import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-6"
      style={{
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "var(--font-heading)",
      }}
    >
      <main className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold">työn alla!!!!!</h1>
        <p className="mt-6 text-lg md:text-2xl">
          etusivu uusitaan ennen julkaisua. se oli aika mid
        </p>
        <Link
          to="/app"
          className="mt-8 inline-block text-base md:text-lg underline"
        >
          siirry onboardingiin / kalenteriin
        </Link>
      </main>
    </div>
  );
}
