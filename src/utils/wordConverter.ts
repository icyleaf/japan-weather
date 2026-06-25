export function japaneseToChineseWeather(japanese: string): string {
  const weatherMap: Record<string, string> = {
    晴れ: "晴",
    曇り: "多云",
    雷: "雷",
    霧: "雾",
    霰: "雹",
    曇: "阴",
    霙: "雨夹雪",
    暴風雨: "暴风雨",
    豪雨: "暴雨",
    のち: "转",
    時々: "时阵",
    一時: "短时",
    東: "东",
  };

  // Use a regular expression to replace all occurrences of the Japanese weather terms with their Chinese equivalents
  const regex = new RegExp(Object.keys(weatherMap).join("|"), "g");
  return japanese.replace(regex, (match) => weatherMap[match] || match);
}
