const FALLBACK_TIMEZONE = "America/Los_Angeles";

function formatDetails(event) {
  const parts = [];

  if (event.start?.dateTime) {
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: event.start.timeZone || FALLBACK_TIMEZONE,
    }).format(new Date(event.start.dateTime));
    parts.push(time);
  }

  if (event.location) {
    parts.push(event.location);
  }

  return parts.join(" · ");
}

function toDateString(event) {
  if (event.start?.date) {
    return event.start.date;
  }
  if (event.start?.dateTime) {
    return event.start.dateTime.slice(0, 10);
  }
  return null;
}

function jsonResponse(body, cacheSeconds) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
    },
  });
}

export default async (req, context) => {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

  if (!calendarId || !apiKey) {
    console.error("events function: missing GOOGLE_CALENDAR_ID or GOOGLE_CALENDAR_API_KEY");
    return jsonResponse([], 60);
  }

  const requestUrl = new URL(req.url);
  const timeMin = requestUrl.searchParams.get("timeMin") || new Date().toISOString();
  const timeMax = requestUrl.searchParams.get("timeMax");
  const requestedMax = parseInt(requestUrl.searchParams.get("maxResults"), 10);
  const maxResults =
    Number.isInteger(requestedMax) && requestedMax > 0 ? Math.min(requestedMax, 250) : 7;

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("timeMin", timeMin);
  if (timeMax) {
    url.searchParams.set("timeMax", timeMax);
  }
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", String(maxResults));

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`events function: Google Calendar API returned ${res.status}`);
      return jsonResponse([], 60);
    }

    const data = await res.json();
    const events = (data.items || [])
      .map((event) => ({
        date: toDateString(event),
        title: event.summary || "",
        details: formatDetails(event),
      }))
      .filter((event) => event.date && event.title);

    return jsonResponse(events, 300);
  } catch (err) {
    console.error("events function: failed to fetch Google Calendar", err);
    return jsonResponse([], 60);
  }
};

export const config = {
  path: "/api/events",
};
