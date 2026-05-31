import type { EnvironmentId } from "../engine/types";

export interface EnvironmentProse {
  weather: string;
  light: string;
  temp: string;
  activity: string;
}

const WEATHER_BY_ENV: Record<EnvironmentId, string> = {
  clear: "Clear sky holds the horizon open",
  scorching_heat: "Heat shimmers off every hull and hides distance in mirage",
  dust_storm: "Dust cuts sight to the tank ahead and grit finds every seal",
  heavy_rain: "Rain hammers steel and turns the trace into running brown water",
  deep_mud: "Deep mud sucks at treads with every halt",
  thick_fog: "Fog folds the column into grey that eats sound and depth",
  light_snow: "Light snow dusts the ground and erases yesterday's tread marks",
  blizzard: "Blizzard needles strip visibility to an arm's reach",
  hard_freeze: "Hard freeze makes metal ping and fuel lines hesitate",
  ice: "Ice turns every slope into a slide the driver hates",
  thaw_mud: "Thaw turns frozen ruts into soup that argues with spring",
  overcast: "Overcast sky flattens light until every ditch looks the same distance away",
};

function lightForTime(timeOfDay: string, env: EnvironmentId): string {
  const dampened =
    env === "thick_fog" ||
    env === "blizzard" ||
    env === "heavy_rain" ||
    env === "overcast" ||
    env === "dust_storm";

  switch (timeOfDay) {
    case "Dawn":
      return dampened ? "grey dawn barely separates ground from sky" : "pale dawn light catches dust on the glacis";
    case "Morning":
      return dampened ? "flat morning light hides depth in the folds" : "morning sun throws long shadows across the trace";
    case "Midday":
      return dampened ? "midday glare diffused to a washed photograph" : "hard midday light leaves nowhere to hide";
    case "Afternoon":
      return dampened ? "afternoon stays dull and close" : "afternoon slant light turns treelines into silhouettes";
    case "Dusk":
      return dampened ? "dusk arrives early under a lid of cloud" : "dusk gold lasts minutes before the sector goes flat";
    case "Night":
      return "dark enough that exhaust glow marks the column";
    default:
      return dampened ? "flat light kills depth" : "light holds steady on open ground";
  }
}

function tempForEnv(env: EnvironmentId): string {
  switch (env) {
    case "scorching_heat":
      return "metal hot enough to blister through gloves";
    case "dust_storm":
      return "dry heat that cracks lips before noon";
    case "heavy_rain":
    case "deep_mud":
    case "thaw_mud":
      return "damp cold that climbs through boot seams";
    case "light_snow":
    case "blizzard":
    case "hard_freeze":
    case "ice":
      return "cold that turns grease to paste and breath to fog";
    case "clear":
    case "overcast":
      return "air cool enough to keep you awake and miserable";
    default:
      return "temperature that punishes halt more than movement";
  }
}

function activityForEnv(env: EnvironmentId): string {
  switch (env) {
    case "blizzard":
    case "thick_fog":
    case "hard_freeze":
      return "the sector feels emptied by weather";
    case "heavy_rain":
    case "deep_mud":
      return "movement clogs the trace with stuck vehicles and shouted curses";
    case "clear":
    case "overcast":
      return "distant traffic noise and radio chatter mark other units nearby";
    default:
      return "the column owns the silence between engine idles";
  }
}

export function deriveEnvironmentProse(env: EnvironmentId, timeOfDay: string): EnvironmentProse {
  return {
    weather: WEATHER_BY_ENV[env],
    light: lightForTime(timeOfDay, env),
    temp: tempForEnv(env),
    activity: activityForEnv(env),
  };
}
