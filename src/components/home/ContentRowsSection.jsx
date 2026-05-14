import { LayoutList } from "lucide-react";
import { SectionCard, Field, DisplayValue, ImageField } from "./HomeUI";

const ROW_LABELS = [
  { ar: "القسم الأول", en: "Section 1" },
  { ar: "القسم الثاني", en: "Section 2" },
];

/**
 * ContentRowsSection
 * Renders both content rows (rows[0] and rows[1]).
 * Each row has bilingual text fields + an image upload/preview.
 */
const ContentRowsSection = ({
  editing,
  activeLang,
  form,
  data,
  onRowChange,
  onImageChange,
}) => {
  const langField = (base) => (activeLang === "en" ? `${base}_en` : base);
  const langDir = activeLang === "ar" ? "rtl" : "ltr";

  return (
    <>
      {[0, 1].map((rowIndex) => {
        const rowKey = `row${rowIndex}`;
        const labels = ROW_LABELS[rowIndex];

        return (
          <SectionCard key={rowIndex} icon={LayoutList} title={labels.ar}>
            {editing ? (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Text fields */}
                <div className="flex-1 space-y-5">
                  <Field
                    label={
                      activeLang === "ar"
                        ? `عنوان ${labels.ar}`
                        : `${labels.en} Title`
                    }
                    value={form?.rows?.[rowIndex]?.[langField("title")]}
                    onChange={(e) =>
                      onRowChange(rowIndex, langField("title"), e.target.value)
                    }
                    dir={langDir}
                  />
                  <Field
                    label={
                      activeLang === "ar"
                        ? `وصف ${labels.ar}`
                        : `${labels.en} Description`
                    }
                    value={form?.rows?.[rowIndex]?.[langField("description")]}
                    onChange={(e) =>
                      onRowChange(
                        rowIndex,
                        langField("description"),
                        e.target.value,
                      )
                    }
                    multiline
                    dir={langDir}
                  />
                </div>

                {/* Image */}
                <div className="flex-shrink-0">
                  <ImageField
                    label={`صورة ${labels.ar}`}
                    currentImage={data?.rows?.[rowIndex]?.image_url}
                    previewUrl={form?.[`${rowKey}_image_preview`]}
                    onFileChange={(e) => onImageChange(e, rowKey)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DisplayValue
                      label="العنوان (AR)"
                      value={data?.rows?.[rowIndex]?.title}
                      large
                    />
                    <DisplayValue
                      label="Title (EN)"
                      value={data?.rows?.[rowIndex]?.title_en}
                      large
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DisplayValue
                      label="الوصف (AR)"
                      value={data?.rows?.[rowIndex]?.description}
                    />
                    <DisplayValue
                      label="Description (EN)"
                      value={data?.rows?.[rowIndex]?.description_en}
                    />
                  </div>
                </div>
                {data?.rows?.[rowIndex]?.image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={data.rows[rowIndex].image_url}
                      alt={`Row ${rowIndex + 1}`}
                      className="h-40 w-auto object-cover rounded-xl border border-gray-100 shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        );
      })}
    </>
  );
};

export default ContentRowsSection;
