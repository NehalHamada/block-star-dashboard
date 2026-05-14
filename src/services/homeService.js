import axiosInstance from "./axiosInstance";

const homeService = {
  // GET /site-intro
  async getHome(lang = "ar") {
    try {
      const response = await axiosInstance.get("/site-intro", {
        params: { lang },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Fetch both Arabic and English to populate edit form
  async getHomeBoth() {
    const [arRes, enRes] = await Promise.all([
      this.getHome("ar"),
      this.getHome("en"),
    ]);

    const arData = arRes.data ?? arRes;
    const enData = enRes.data ?? enRes;

    return {
      ...arData,
      main_title_en: enData.main_title || "",
      main_description_en: enData.main_description || "",
      rows:
        arData.rows?.map((row, i) => ({
          ...row,
          title_en: enData.rows?.[i]?.title || "",
          description_en: enData.rows?.[i]?.description || "",
        })) || [],
      media: arData.media || [],
    };
  },

  // POST /site-intro
  // video_url accepts either a File object OR a plain URL string
  async update(form) {
    try {
      const formData = new FormData();

      formData.append("main_title", form.main_title || "");
      formData.append("main_title_en", form.main_title_en || "");
      formData.append("main_description", form.main_description || "");
      formData.append("main_description_en", form.main_description_en || "");

      // Video: only send a new file if the user actually picked one.
      // If no new file was chosen we skip the field entirely so the backend
      // keeps the existing video (avoids "video_url must be a file" error).
      if (form.video_file) {
        formData.append("video_url", form.video_file);
      }

      // Row 1 (rows[0])
      const row0 = form.rows?.[0] ?? {};
      formData.append("row1_title", row0.title || "");
      formData.append("row1_title_en", row0.title_en || "");
      formData.append("row1_description", row0.description || "");
      formData.append("row1_description_en", row0.description_en || "");
      if (form.row0_image_file) {
        formData.append("row1_image", form.row0_image_file);
      }

      // Row 2 (rows[1])
      const row1 = form.rows?.[1] ?? {};
      formData.append("row2_title", row1.title || "");
      formData.append("row2_title_en", row1.title_en || "");
      formData.append("row2_description", row1.description || "");
      formData.append("row2_description_en", row1.description_en || "");
      if (form.row1_image_file) {
        formData.append("row2_image", form.row1_image_file);
      }

      // Existing slot replacements (media[0], media[1], …)
      const existingCount = (form.media_files ?? []).length;
      (form.media_files ?? []).forEach((file, i) => {
        if (file) {
          formData.append(`media[${i}]`, file);
        }
      });

      // Brand-new items appended after existing slots (media[N], media[N+1], …)
      (form.new_media_files ?? []).forEach((file, i) => {
        if (file) {
          formData.append(`media[${existingCount + i}]`, file);
        }
      });

      const response = await axiosInstance.post("/site-intro", formData);
      return response.data;
    } catch (error) {
      console.error("[homeService.update] ERROR:", error);
      throw error.response?.data || error.message;
    }
  },

  // DELETE /site-intro/media/{index}
  async deleteMedia(index) {
    try {
      const response = await axiosInstance.delete(`/site-intro/media/${index}`);
      return response.data;
    } catch (error) {
      console.error("[homeService.deleteMedia] ERROR:", error);
      throw error.response?.data || error.message;
    }
  },

  // GET /site-sections/home
  async getSiteSection() {
    try {
      const response = await axiosInstance.get("/site-sections/home");
      return response.data?.data ?? response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /admin/site-sections/1/update
  async updateSiteSection(form, imageFile) {
    try {
      const formData = new FormData();
      formData.append("title_ar", form.title_ar || "");
      formData.append("title_en", form.title_en || "");
      formData.append("description_ar", form.description_ar || "");
      formData.append("description_en", form.description_en || "");

      // Buttons
      const buttons = form.buttons ?? [];
      buttons.forEach((btn, i) => {
        formData.append(`buttons[${i}][text_ar]`, btn.text_ar || "");
        formData.append(`buttons[${i}][text_en]`, btn.text_en || "");
      });

      // Image — only send a new file if picked, otherwise keep existing
      if (imageFile) {
        formData.append("images[0]", imageFile);
      }

      const response = await axiosInstance.post(
        "/admin/site-sections/1/update",
        formData,
      );
      return response.data;
    } catch (error) {
      console.error("[homeService.updateSiteSection] ERROR:", error);
      throw error.response?.data || error.message;
    }
  },

  // GET /site-sections/company_orders
  async getCompanyOrdersSection() {
    try {
      const response = await axiosInstance.get("/site-sections/company_orders");
      return response.data?.data ?? response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /admin/site-sections/4/update
  async updateCompanyOrdersSection(form, imageFile) {
    try {
      const formData = new FormData();
      formData.append("title_ar", form.title_ar || "");
      formData.append("title_en", form.title_en || "");
      formData.append("description_ar", form.description_ar || "");
      formData.append("description_en", form.description_en || "");

      // Buttons
      const buttons = form.buttons ?? [];
      buttons.forEach((btn, i) => {
        formData.append(`buttons[${i}][text_ar]`, btn.text_ar || "");
        formData.append(`buttons[${i}][text_en]`, btn.text_en || "");
      });

      // Image — only send new file if picked
      if (imageFile) {
        formData.append("images[0]", imageFile);
      }

      const response = await axiosInstance.post(
        "/admin/site-sections/4/update",
        formData,
      );
      return response.data;
    } catch (error) {
      console.error("[homeService.updateCompanyOrdersSection] ERROR:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default homeService;
