import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;

// 🧠 GET API endpoint
app.get("/api/getChartJson", (req, res) => {
  const SECONDS = 10800; // You can increase (like 10800 for 3 hours)
  const LABEL_COUNT = 52;
  const START_LAT = 28.6139;
  const START_LNG = 77.2090;

  const chartTypes = ["digital", "analog"];
  const labelColors = ["#FF5733", "#33FF66", "#335BFF", "#FFC133", "#FF33A8", "#33FFF9"];
  const chartColors = ["#33C1FF", "#FFC133", "#9D33FF", "#33FF77", "#FF3333", "#3385FF"];

  // ✅ Digital sensor fixed colors
  const DIGITAL_SENSORS = {
    "On-Track Status": "#FF0000",
    "Park Brake Output": "#00FF00",
    "Front Rail Gear Down": "#1E90FF",
    "Front Rail Gear Up": "#FFD700",
    "EWP Stowed": "#FF69B4",
  };

  const startDate = new Date("2025-11-01T00:00:00Z");
  let lat = START_LAT;
  let lng = START_LNG;

  const randomBetween = (min, max) => +(min + Math.random() * (max - min)).toFixed(2);

  const data = [];

  for (let sec = 0; sec < SECONDS; sec++) {
    lat += (Math.random() - 0.5) * 0.0001;
    lng += (Math.random() - 0.5) * 0.0001;

    // ✅ Prepare digital status values
    const digitalStatus = {};
    for (const [key, color] of Object.entries(DIGITAL_SENSORS)) {
      const value = Math.random() > 0.5 ? "ON" : "OFF";
      digitalStatus[key] = value;
      digitalStatus[`${key}_color`] = color;
    }

    // ✅ Create labels
    const labels = Array.from({ length: LABEL_COUNT }, (_, i) => {
      const maxValue =
        sec > 200 && sec < 2000 ? 50 : sec > 6000 && sec < 7000 ? 25 : 0;
      const minValue = 0;
      const avgValue = +(minValue + (maxValue - minValue) / 2).toFixed(2);
      const chartType = sec === 0 ? "digital" : "analog";
      const labelColor = labelColors[i % labelColors.length];
      const chartColor = chartColors[i % chartColors.length];

      return {
        time: sec,
        title: `Sensor ${i + 1}`,
        maxValue,
        minValue,
        avgValue,
        chartType,
        labelColor,
        chartColor,
        digitalStatus,
      };
    });

    data.push({
      second: sec,
      timestamp: new Date(startDate.getTime() + sec * 1000).toISOString(),
      latitude: +lat.toFixed(6),
      longitude: +lng.toFixed(6),
      label: labels,
    });
  }

  const telemetryJson = {
    date: startDate.toISOString().split("T")[0],
    startTime: startDate.toISOString(),
    endTime: new Date(startDate.getTime() + SECONDS * 1000).toISOString(),
    totalSeconds: SECONDS,
    labelCount: LABEL_COUNT,
    digitalSensors: Object.keys(DIGITAL_SENSORS),
    data,
  };

  console.log(`✅ Generated ${SECONDS} seconds × ${LABEL_COUNT} labels`);
  res.json(telemetryJson);
});

// 🚀 Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
