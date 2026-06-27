// سكربت تثبيت تلقائي - ينسخ كل ملفات شاشة تسجيل الدخول لمكانها الصحيح
// يُشغَّل من داخل مجلد app (نفس مكان package.json)

const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "files-data.json");

if (!fs.existsSync(dataFile)) {
  console.error("❌ خطأ: ملف files-data.json غير موجود في نفس المجلد");
  process.exit(1);
}

// تأكيد إننا داخل مجلد app الصحيح (فيه package.json)
if (!fs.existsSync(path.join(process.cwd(), "package.json"))) {
  console.error(
    "❌ خطأ: شغّل هذا السكربت من داخل مجلد app (نفس مكان package.json)"
  );
  process.exit(1);
}

const files = JSON.parse(fs.readFileSync(dataFile, "utf8"));

let count = 0;
for (const [relativePath, base64Content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), relativePath);
  const dir = path.dirname(fullPath);

  fs.mkdirSync(dir, { recursive: true });

  const content = Buffer.from(base64Content, "base64").toString("utf8");
  fs.writeFileSync(fullPath, content, "utf8");

  console.log("✅ تم إنشاء/تحديث:", relativePath);
  count++;
}

console.log(`\n🎉 تم تثبيت ${count} ملف بنجاح`);
console.log("\nالخطوة التالية: شغّل هذا الأمر لتثبيت مكتبة jose:");
console.log("  npm install jose");
