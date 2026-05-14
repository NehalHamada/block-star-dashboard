import { Type } from "lucide-react";
import { SectionCard, Field, DisplayValue } from "./HomeUI";

/**
 * MainInfoSection
 * Displays / edits main_title and main_description (AR + EN).
 */
const MainInfoSection = ({ editing, activeLang, form, data, onChange }) => {
  const langField = (base) => (activeLang === "en" ? `${base}_en` : base);
  const langDir = activeLang === "ar" ? "rtl" : "ltr";

  return (
    <SectionCard icon={Type} title="المعلومات الرئيسية">
      {editing ? (
        <div className="space-y-5">
          <Field
            label={activeLang === "ar" ? "العنوان الرئيسي" : "Main Title"}
            name={langField("main_title")}
            value={form?.[langField("main_title")]}
            onChange={onChange}
            dir={langDir}
          />
          <Field
            label={activeLang === "ar" ? "الوصف الرئيسي" : "Main Description"}
            name={langField("main_description")}
            value={form?.[langField("main_description")]}
            onChange={onChange}
            multiline
            dir={langDir}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DisplayValue label="العنوان الرئيسي (AR)" value={data?.main_title} large />
            <DisplayValue label="Main Title (EN)" value={data?.main_title_en} large />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DisplayValue label="الوصف الرئيسي (AR)" value={data?.main_description} />
            <DisplayValue label="Main Description (EN)" value={data?.main_description_en} />
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default MainInfoSection;
