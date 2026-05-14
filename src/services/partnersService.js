import axiosInstance from "./axiosInstance";

const partnersService = {
  // GET /partners
  async getPartners(lang = "ar") {
    try {
      const response = await axiosInstance.get("/partners", {
        params: { lang },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Fetch both Arabic and English data and merge them
  async getPartnersBoth() {
    const [arRes, enRes] = await Promise.allSettled([
      this.getPartners("ar"),
      this.getPartners("en"),
    ]);

    const arData =
      arRes.status === "fulfilled" ? arRes.value.data || arRes.value : null;
    const enData =
      enRes.status === "fulfilled" ? enRes.value.data || enRes.value : null;

    if (!arData && !enData) {
      throw new Error("Failed to fetch Partners data from both languages.");
    }

    return {
      // Merge Services
      services:
        arData?.services?.map((service, i) => ({
          ...service,
          title_en: enData?.services?.[i]?.title || "",
        })) || [],

      // Merge Feature
      feature: arData?.feature
        ? {
            ...arData.feature,
            title_en: enData?.feature?.title || "",
            points_en: enData?.feature?.points || [],
          }
        : enData?.feature
        ? {
            ...enData.feature,
            title_ar: "",
            points_ar: [],
          }
        : null,
    };
  },

  // ── Features Admin ──────────────────────────────────────────────────

  // GET /admin/partner-features
  async getFeatures(lang = "ar") {
    try {
      const response = await axiosInstance.get("/admin/partner-features", {
        params: { lang },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Fetch both Arabic and English features and merge them
  async getFeaturesBoth() {
    const [arRes, enRes] = await Promise.allSettled([
      this.getFeatures("ar"),
      this.getFeatures("en"),
    ]);

    const arData =
      arRes.status === "fulfilled" ? arRes.value.data || arRes.value : null;
    const enData =
      enRes.status === "fulfilled" ? enRes.value.data || enRes.value : null;

    if (!arData && !enData) {
      throw new Error("Failed to fetch Features data from both languages.");
    }

    return {
      id: arData?.id || enData?.id || 1,
      title: arData?.title || "",
      title_en: enData?.title || "",
      points: arData?.points || [""],
      points_en: enData?.points || [""],
      image_url: arData?.image_url || enData?.image_url || "",
      is_active: arData?.is_active ?? enData?.is_active ?? true,
    };
  },

  // POST /admin/partner-features/:id/update
  // Body (form-data): title, title_en, points[0], points_en[0], ..., image (File)
  async updateFeatures(id, form) {
    try {
      const formData = new FormData();
      formData.append("title", form.title || "");
      formData.append("title_en", form.title_en || "");

      // Arabic points
      (form.points || [])
        .filter((p) => p.trim() !== "")
        .forEach((p, i) => {
          formData.append(`points[${i}]`, p);
        });

      // English points (_en suffix)
      (form.points_en || [])
        .filter((p) => p.trim() !== "")
        .forEach((p, i) => {
          formData.append(`points_en[${i}]`, p);
        });

      if (form.image_file) {
        formData.append("image", form.image_file);
      }

      const response = await axiosInstance.post(
        `/admin/partner-features/${id}/update`,
        formData,
      );
      return response.data;
    } catch (error) {
      console.error("[partnersService.updateFeatures] ERROR:", error);
      throw error.response?.data || error.message;
    }
  },

  // ── Services Admin ──────────────────────────────────────────────────

  // GET /admin/partner-services
  async getServices(lang = "ar") {
    try {
      const response = await axiosInstance.get("/admin/partner-services", {
        params: { lang },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Fetch both Arabic and English services and merge them
  async getServicesBoth() {
    const [arRes, enRes] = await Promise.allSettled([
      this.getServices("ar"),
      this.getServices("en"),
    ]);

    const arData =
      arRes.status === "fulfilled" ? arRes.value.data || arRes.value : [];
    const enData =
      enRes.status === "fulfilled" ? enRes.value.data || enRes.value : [];

    // Merge by index, assuming sorting is consistent
    return (arData || []).map((service, i) => ({
      ...service,
      title_en: enData?.[i]?.title || "",
    }));
  },

  // POST /admin/partner-services
  async addService(form) {
    try {
      const formData = new FormData();
      formData.append("title", form.title || "");
      formData.append("title_en", form.title_en || "");
      formData.append("sort_order", form.sort_order ?? 0);
      if (form.image_file) {
        formData.append("image", form.image_file);
      }

      const response = await axiosInstance.post(
        "/admin/partner-services",
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /admin/partner-services/:id/update
  async updateService(id, form) {
    try {
      const formData = new FormData();
      formData.append("title", form.title || "");
      formData.append("title_en", form.title_en || "");
      formData.append("sort_order", form.sort_order ?? 0);
      if (form.image_file) {
        formData.append("image", form.image_file);
      }

      const response = await axiosInstance.post(
        `/admin/partner-services/${id}/update`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ── Page Content Admin ──────────────────────────────────────────────────────

  // GET /admin/partner-page/content
  async getPageContent() {
    try {
      const response = await axiosInstance.get("/admin/partner-page/content");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /admin/partner-page/content
  async updatePageContent(form) {
    try {
      const formData = new FormData();
      formData.append("title_ar", form.title_ar || "");
      formData.append("title_en", form.title_en || "");
      formData.append("description_ar", form.description_ar || "");
      formData.append("description_en", form.description_en || "");

      const response = await axiosInstance.post(
        "/admin/partner-page/content",
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /admin/partner-services/:id
  async deleteService(id) {
    try {
      const response = await axiosInstance.delete(
        `/admin/partner-services/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default partnersService;
