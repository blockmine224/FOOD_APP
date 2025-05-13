export async function translateText(text, targetLang = "vi", sourceLang = "en") {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: "text"
    }),
  });
  const data = await res.json();
  console.log("Translation API raw result:", data);
  if (!res.ok) throw new Error(data.error || "Failed to translate");
  if (data.translatedText) return data.translatedText;
  throw new Error(data.error || "Failed to translate");
}