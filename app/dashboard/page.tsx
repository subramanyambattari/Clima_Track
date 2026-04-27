import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { loadDashboardData } from "@/services/dashboard-service";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";
import { CitySearch } from "@/components/city-search";
import { LocationDetect } from "@/components/location-detect";
import { WeatherSummary } from "@/components/weather-summary";
import { WeatherForecastPanel } from "@/components/weather-forecast";
import { OutfitSuggestions } from "@/components/outfit-suggestions";
import { PreferencesForm } from "@/components/preferences-form";
import { SavedOutfits } from "@/components/saved-outfits";
import { SearchHistory } from "@/components/search-history";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ city?: string; lat?: string; lon?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const params = (await searchParams) ?? {};

  const data = await loadDashboardData({
    userId: session.user.id,
    city: params.city,
    lat: params.lat !== undefined ? Number(params.lat) : undefined,
    lon: params.lon !== undefined ? Number(params.lon) : undefined,
  });

  const serializedOutfits = data.savedOutfits.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString()
  }));

  const serializedHistory = data.history.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString()
  }));

  const serializedPreferences = data.preferences
    ? {
        ...data.preferences,
        createdAt: data.preferences.createdAt.toISOString(),
        updatedAt: data.preferences.updatedAt.toISOString()
      }
    : null;

  return (
    <main className="min-h-screen">
      <AppSidebar />
      <div className="md:pl-72">
        <Navbar />
        <div className="px-4 py-6 md:px-6 lg:px-8">
          <section id="overview" className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <div className="space-y-6">
              <CitySearch defaultValue={params.city} />
              <LocationDetect />
              <WeatherSummary weather={data.weather} />
            </div>
            <OutfitSuggestions suggestion={data.suggestion} weather={data.weather} />
          </section>

          <section className="mt-6">
            <WeatherForecastPanel weather={data.weather} forecast={data.forecast} />
          </section>

          <section id="preferences" className="mt-6">
            <PreferencesForm
              preferences={
                serializedPreferences
                  ? {
                      stylePreference: serializedPreferences.stylePreference.toLowerCase(),
                      homeCity: serializedPreferences.homeCity,
                      units: serializedPreferences.units,
                      weatherAlerts: serializedPreferences.weatherAlerts,
                      favoriteWeather: serializedPreferences.favoriteWeather
                    }
                  : null
              }
            />
          </section>

          <section id="saved" className="mt-6">
            <SavedOutfits outfits={serializedOutfits} />
          </section>

          <section id="history" className="mt-6 pb-8">
            <SearchHistory items={serializedHistory} />
          </section>
        </div>
      </div>
    </main>
  );
}
