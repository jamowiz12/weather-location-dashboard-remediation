"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("London");
  const [cityInput, setCityInput] = useState("London");
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState("");
  const [weatherError, setWeatherError] = useState("");

  async function loadWeather(selectedCity) {
    setWeatherLoading(true);
    setWeatherError("");

    try {
      const dashboardData = await apiFetch(`/dashboard?city=${encodeURIComponent(selectedCity)}`);
      setWeather(dashboardData.weather);
      setCity(selectedCity);
    } catch (err) {
      setWeatherError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const userData = await apiFetch("/user");
        setUser(userData.user);
        await loadWeather("London");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleLogout() {
    try {
      await apiFetch("/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCitySubmit(event) {
    event.preventDefault();
    const selectedCity = cityInput.trim();
    if (!selectedCity) return;
    await loadWeather(selectedCity);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-xl text-cyan-300">Loading dashboard...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-lg rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-red-200">
          <h1 className="text-2xl font-bold">Unable to load dashboard</h1>
          <p className="mt-2">{error}</p>
          <Link href="/login" className="mt-4 inline-block text-cyan-300">Go back to login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.name || "User"}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/settings/security" className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-slate-500">Security</Link>
            <button onClick={handleLogout} className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400">Log out</button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Profile</p>
            <p className="mt-3 text-xl font-semibold">{user?.name}</p>
            <p className="text-slate-300">{user?.email}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Weather status</p>
            <p className="mt-3 text-3xl font-bold text-cyan-300">{weather?.temperature_celsius ?? "--"}°C</p>
            <p className="text-slate-300">{weather?.description ?? weather?.message ?? "No weather data yet"}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Location</p>
            <p className="mt-3 text-2xl font-semibold">{weather?.city || city}</p>
            <p className="text-slate-300">{weather?.country || "Country unavailable"}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Map</h2>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">{city}</span>
            </div>
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <iframe
                title={`Map of ${city}`}
                src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)}&q=${encodeURIComponent(city)}`}
                className="h-[360px] w-full rounded-2xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950 text-center">
                <p className="text-slate-300">Configure a Google Maps key to show the embedded map.</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city)}`} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">Open {city} in Google Maps</a>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Weather details</h2>
            <form onSubmit={handleCitySubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="weather-city" className="sr-only">City</label>
              <input id="weather-city" value={cityInput} onChange={(event) => setCityInput(event.target.value)} maxLength={100} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-cyan-400" placeholder="Enter a city" />
              <button type="submit" disabled={weatherLoading} className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60">{weatherLoading ? "Loading..." : "Update"}</button>
            </form>
            {weatherError ? <p role="alert" className="mt-3 text-sm text-red-300">{weatherError}</p> : null}
            {weather?.status === "not_configured" || weather?.status === "error" ? <p role="status" className="mt-3 text-sm text-amber-300">{weather.message}</p> : null}
            <div className="mt-4 space-y-3 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2"><span>City</span><strong>{weather?.city || city}</strong></div>
              <div className="flex justify-between border-b border-slate-800 pb-2"><span>Country</span><strong>{weather?.country || "--"}</strong></div>
              <div className="flex justify-between border-b border-slate-800 pb-2"><span>Humidity</span><strong>{weather?.humidity ?? "--"}%</strong></div>
              <div className="flex justify-between"><span>Wind</span><strong>{weather?.wind_speed ?? "--"} m/s</strong></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
