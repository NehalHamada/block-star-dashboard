import axiosInstance from "./axiosInstance";

const aboutAsService = {
  // Fetch Arabic and English data in parallel
  async getAboutBoth() {
    const results = await Promise.allSettled([
      axiosInstance.get("/about-us", { params: { lang: "ar" } }),
      axiosInstance.get("/about-us", { params: { lang: "en" } }),
    ]);

    const arData =
      results[0].status === "fulfilled" ? results[0].value.data.data : null;
    const enData =
      results[1].status === "fulfilled" ? results[1].value.data.data : null;

    // If both failed, we might want to throw to let the UI show a major error
    if (!arData && !enData) {
      throw new Error("Failed to fetch About Us data from both languages.");
    }

    // Build a unified flat object like homeService
    return {
      id: arData?.id || enData?.id || 1,

      // Main
      title: arData?.title || "",
      title_en: enData?.title || "",
      description: arData?.description || "",
      description_en: enData?.description || "",
      image_url: arData?.image_url || enData?.image_url || "",

      // Intro
      intro_title: arData?.intro?.title || "",
      intro_title_en: enData?.intro?.title || "",
      intro_description: arData?.intro?.description || "",
      intro_description_en: enData?.intro?.description || "",

      // Stats
      products_stat: arData?.stats?.products?.value || "",
      products_stat_description: arData?.stats?.products?.description || "",
      products_stat_description_en: enData?.stats?.products?.description || "",
      clients_stat: arData?.stats?.clients?.value || "",
      clients_stat_description: arData?.stats?.clients?.description || "",
      clients_stat_description_en: enData?.stats?.clients?.description || "",

      // Store / Vision / Mission
      store_image_url: arData?.store_representation?.image_url || "",
      vision_title: arData?.store_representation?.vision?.title || "",
      vision_title_en: enData?.store_representation?.vision?.title || "",
      vision_description:
        arData?.store_representation?.vision?.description || "",
      vision_description_en:
        enData?.store_representation?.vision?.description || "",
      mission_title: arData?.store_representation?.mission?.title || "",
      mission_title_en: enData?.store_representation?.mission?.title || "",
      mission_description:
        arData?.store_representation?.mission?.description || "",
      mission_description_en:
        enData?.store_representation?.mission?.description || "",
    };
  },

  // POST /about-us/update
  // Accepts a flattened object with interleaved Arabic and English fields.
  async update(form) {
    try {
      const formData = new FormData();

      // Scalar fields
      formData.append("title", form.title || "");
      formData.append("title_en", form.title_en || "");
      formData.append("description", form.description || "");
      formData.append("description_en", form.description_en || "");

      formData.append("intro_title", form.intro_title || "");
      formData.append("intro_title_en", form.intro_title_en || "");
      formData.append("intro_description", form.intro_description || "");
      formData.append("intro_description_en", form.intro_description_en || "");

      formData.append("products_stat", form.products_stat || "");
      formData.append(
        "products_stat_description",
        form.products_stat_description || "",
      );
      formData.append(
        "products_stat_description_en",
        form.products_stat_description_en || "",
      );

      formData.append("clients_stat", form.clients_stat || "");
      formData.append(
        "clients_stat_description",
        form.clients_stat_description || "",
      );
      formData.append(
        "clients_stat_description_en",
        form.clients_stat_description_en || "",
      );

      formData.append("vision_title", form.vision_title || "");
      formData.append("vision_title_en", form.vision_title_en || "");
      formData.append("vision_description", form.vision_description || "");
      formData.append(
        "vision_description_en",
        form.vision_description_en || "",
      );

      formData.append("mission_title", form.mission_title || "");
      formData.append("mission_title_en", form.mission_title_en || "");
      formData.append("mission_description", form.mission_description || "");
      formData.append(
        "mission_description_en",
        form.mission_description_en || "",
      );

      // Images
      if (form.image_file) {
        formData.append("image", form.image_file);
      }
      if (form.store_image_file) {
        formData.append("store_image", form.store_image_file);
      }
      console.log(formData);

      const response = await axiosInstance.post("/admin/about-us", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("[aboutAsService.update] ERROR:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default aboutAsService;
