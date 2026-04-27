import type { OutfitSuggestion, StylePreference, WeatherMood } from "@/types/outfit";
import type { WeatherData } from "@/types/weather";

function deriveMood(weather: WeatherData): WeatherMood {
  const description = `${weather.condition.main} ${weather.condition.description}`.toLowerCase();
  const temp = weather.temperature;
  const wind = weather.windSpeed;
  const humidity = weather.humidity;

  if (description.includes("rain") || description.includes("drizzle") || description.includes("thunder")) {
    return "rain";
  }

  if (description.includes("snow") || temp <= 1) {
    return "snow";
  }

  if (wind >= 9) {
    return "windy";
  }

  if (humidity >= 82 && temp >= 24) {
    return "humid";
  }

  if (temp >= 30) {
    return "hot";
  }

  if (temp >= 24) {
    return "warm";
  }

  if (temp >= 17) {
    return "mild";
  }

  if (temp >= 9) {
    return "cool";
  }

  return "cold";
}

function styleItems(style: StylePreference, mood: WeatherMood) {
  const templates: Record<StylePreference, Record<WeatherMood, { items: string[]; accessories: string[]; palette: string[]; tip: string }>> = {
    casual: {
      hot: {
        items: ["Breathable T-shirt", "Light shorts", "Canvas sneakers"],
        accessories: ["Sunglasses", "Cap"],
        palette: ["White", "Sand", "Sky blue"],
        tip: "Keep fabrics light and breathable to avoid overheating."
      },
      warm: {
        items: ["Relaxed tee", "Chino shorts or light jeans", "Low-top sneakers"],
        accessories: ["Light watch", "Compact tote"],
        palette: ["Olive", "Cream", "Denim blue"],
        tip: "A single light layer is enough for warm afternoon weather."
      },
      mild: {
        items: ["Overshirt or sweatshirt", "Straight jeans", "Sneakers"],
        accessories: ["Crossbody bag", "Cap"],
        palette: ["Navy", "Stone", "Rust"],
        tip: "A soft layer keeps you comfortable as temperatures shift."
      },
      cool: {
        items: ["Long-sleeve tee", "Overshirt", "Denim or cargo pants"],
        accessories: ["Light scarf", "Beanie"],
        palette: ["Charcoal", "Forest", "Grey"],
        tip: "Add a layer that can be removed if the day warms up."
      },
      cold: {
        items: ["Thermal base layer", "Puffer or wool coat", "Jeans or lined pants"],
        accessories: ["Gloves", "Beanie"],
        palette: ["Black", "Deep green", "Burgundy"],
        tip: "Prioritize insulation and wind protection."
      },
      rain: {
        items: ["Water-resistant jacket", "Quick-dry top", "Dark trousers"],
        accessories: ["Umbrella", "Waterproof sneakers"],
        palette: ["Navy", "Charcoal", "Slate"],
        tip: "Choose water-friendly materials and keep hems off the ground."
      },
      snow: {
        items: ["Thermal top", "Insulated jacket", "Warm pants"],
        accessories: ["Insulated boots", "Scarf"],
        palette: ["Ivory", "Steel blue", "Graphite"],
        tip: "Layer for warmth and keep extremities covered."
      },
      windy: {
        items: ["Windbreaker", "Fitted tee", "Slim joggers"],
        accessories: ["Sneakers", "Cap with strap"],
        palette: ["Blue-grey", "Black", "Lime accent"],
        tip: "Keep layers secure and avoid overly loose pieces."
      },
      humid: {
        items: ["Moisture-wicking tee", "Linen shorts or trousers", "Breathable sneakers"],
        accessories: ["Microfiber towel", "Minimal jewelry"],
        palette: ["Off-white", "Olive", "Soft tan"],
        tip: "Prioritize airflow and quick-drying materials."
      }
    },
    formal: {
      hot: {
        items: ["Linen shirt", "Tailored trousers", "Loafers"],
        accessories: ["Slim belt", "Minimal watch"],
        palette: ["Ivory", "Taupe", "Sand"],
        tip: "Use breathable tailoring instead of heavy fabrics."
      },
      warm: {
        items: ["Oxford shirt", "Lightweight chinos", "Leather loafers"],
        accessories: ["Leather strap watch", "Pocket square"],
        palette: ["Light blue", "Stone", "Navy"],
        tip: "Keep the silhouette sharp while staying seasonally light."
      },
      mild: {
        items: ["Button-down shirt", "Blazer", "Dress trousers"],
        accessories: ["Dress shoes", "Leather belt"],
        palette: ["Charcoal", "White", "Bordeaux"],
        tip: "Mild weather is ideal for balanced layers and structure."
      },
      cool: {
        items: ["Oxford shirt", "Merino sweater", "Wool-blend trousers"],
        accessories: ["Derby shoes", "Scarf"],
        palette: ["Midnight", "Grey", "Camel"],
        tip: "Add warmth through knitwear without losing formality."
      },
      cold: {
        items: ["Turtleneck", "Overcoat", "Tailored trousers"],
        accessories: ["Leather gloves", "Chelsea boots"],
        palette: ["Black", "Charcoal", "Mocha"],
        tip: "Use one strong outer layer and keep everything else refined."
      },
      rain: {
        items: ["Water-resistant trench coat", "Dress shirt", "Wool trousers"],
        accessories: ["Umbrella", "Weatherproof derby shoes"],
        palette: ["Navy", "Slate", "Taupe"],
        tip: "Keep formal lines clean with weatherproof finishing."
      },
      snow: {
        items: ["Wool coat", "Turtleneck", "Thick trousers"],
        accessories: ["Insulated boots", "Gloves"],
        palette: ["Graphite", "Ink", "Camel"],
        tip: "Choose polished outerwear with enough insulation for long stretches outside."
      },
      windy: {
        items: ["Structured blazer", "Fitted shirt", "Weighted trousers"],
        accessories: ["Muted tie", "Closed-toe shoes"],
        palette: ["Slate", "Navy", "Olive"],
        tip: "Heavier fabrics keep your outfit in place when the wind picks up."
      },
      humid: {
        items: ["Unlined blazer", "Breathable shirt", "Tailored chinos"],
        accessories: ["Low-shine shoes", "Pocket square"],
        palette: ["Cream", "Dusty blue", "Olive"],
        tip: "Use lighter tailoring and avoid clingy fabrics."
      }
    },
    sporty: {
      hot: {
        items: ["Performance tee", "Running shorts", "Training sneakers"],
        accessories: ["Sunglasses", "Hydration bottle"],
        palette: ["Electric blue", "Black", "White"],
        tip: "Moisture-wicking layers and lighter colors help in heat."
      },
      warm: {
        items: ["Athletic tee", "Joggers or shorts", "Training shoes"],
        accessories: ["Cap", "Sweatband"],
        palette: ["Red", "Grey", "White"],
        tip: "Keep the fit streamlined for easy movement."
      },
      mild: {
        items: ["Long-sleeve performance top", "Joggers", "Light trainers"],
        accessories: ["Zip hoodie", "Sports watch"],
        palette: ["Teal", "Grey", "Black"],
        tip: "Mild weather works well for versatile training layers."
      },
      cool: {
        items: ["Tech-fleece hoodie", "Training joggers", "Running shoes"],
        accessories: ["Beanie", "Gloves"],
        palette: ["Navy", "Graphite", "Neon accent"],
        tip: "Add a warm-up layer that can be removed in activity."
      },
      cold: {
        items: ["Thermal base layer", "Insulated hoodie", "Joggers"],
        accessories: ["Thermal gloves", "Trail shoes"],
        palette: ["Black", "Slate", "Volt"],
        tip: "Focus on warmth while keeping mobility high."
      },
      rain: {
        items: ["Water-repellent shell", "Quick-dry top", "Training joggers"],
        accessories: ["Trail runners", "Cap"],
        palette: ["Blue", "Black", "Silver"],
        tip: "Pick running-friendly outerwear that sheds water quickly."
      },
      snow: {
        items: ["Thermal hoodie", "Insulated jacket", "Warm joggers"],
        accessories: ["Waterproof trainers", "Neck gaiter"],
        palette: ["White", "Black", "Ice blue"],
        tip: "Keep your core warm and your footing stable."
      },
      windy: {
        items: ["Windbreaker", "Compression tee", "Joggers"],
        accessories: ["Runners cap", "Lightweight gloves"],
        palette: ["Black", "Cobalt", "White"],
        tip: "Use close-fitting layers that won’t flap during movement."
      },
      humid: {
        items: ["Mesh performance tee", "Light shorts", "Breathable trainers"],
        accessories: ["Cooling towel", "Cap"],
        palette: ["Mint", "White", "Grey"],
        tip: "Prioritize ventilation and fast-drying materials."
      }
    }
  };

  return templates[style][mood];
}

export function createOutfitSuggestion(
  weather: WeatherData,
  stylePreference: StylePreference
): OutfitSuggestion {
  const mood = deriveMood(weather);
  const data = styleItems(stylePreference, mood);

  const titleMap: Record<WeatherMood, string> = {
    hot: "Heat-smart essential",
    warm: "Light and balanced",
    mild: "Layer-ready combo",
    cool: "Comfortably layered",
    cold: "Cold-weather armor",
    rain: "Rain-proof kit",
    snow: "Snow-ready layers",
    windy: "Wind-block outfit",
    humid: "Breathable comfort"
  };

  const summaryMap: Record<WeatherMood, string> = {
    hot: "Stay cool with breathable pieces and sun protection.",
    warm: "Light layers keep the look relaxed without overheating.",
    mild: "A flexible middle-ground outfit that adapts through the day.",
    cool: "Add structure and warmth while keeping the silhouette clean.",
    cold: "Insulation and coverage matter most in freezing conditions.",
    rain: "Water-resistant materials and practical footwear are the priority.",
    snow: "Insulated pieces and covered skin keep you comfortable outdoors.",
    windy: "Close-fitting layers reduce drag and keep your outfit in place.",
    humid: "Quick-dry fabric and airflow are the best defense against sticky weather."
  };

  return {
    title: titleMap[mood],
    summary: summaryMap[mood],
    weatherMood: mood,
    stylePreference,
    unit: weather.unit,
    temperature: weather.temperature,
    condition: weather.condition.main,
    items: data.items,
    accessories: data.accessories,
    layeringTip: data.tip,
    colorPalette: data.palette
  };
}
