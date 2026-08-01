import fs from "fs";
import translate from "@vitalets/google-translate-api";
import en from "../frontend/src/lang/en.js";

const hi = {};

async function translateAll() {
  for (const key in en) {
    const res = await translate(en[key], { to: "hi" });
    hi[key] = res.text;
    console.log(`Translated: ${key}`);
  }

  fs.writeFileSync(
    "../frontend/src/lang/hi.js",
    `const hi = ${JSON.stringify(hi, null, 2)};\n\nexport default hi;`
  );

  console.log("✅ Hindi file generated successfully");
}

translateAll();
