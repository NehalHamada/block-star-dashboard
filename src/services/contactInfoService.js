import axiosInstance from "./axiosInstance";

const contactInfoService = {
  // GET /contact-info
  async get() {
    try {
      const response = await axiosInstance.get("/contact-info");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /contact-info/update
  // Backend expects FormData with indexed keys:
  //   phones[0], phones[1], ...
  //   social_links[0][name], social_links[0][url], ...
  async update(form) {
    try {
      const formData = new FormData();

      formData.append("title", form.title || "");
      formData.append("email", form.email || "");

      // phones
      (form.phones || []).forEach((phone, i) => {
        formData.append(`phones[${i}]`, phone);
      });

      // social_links
      (form.social_links || []).forEach((link, i) => {
        if (link.id) formData.append(`social_links[${i}][id]`, link.id);
        formData.append(`social_links[${i}][name]`, link.name || "");
        formData.append(`social_links[${i}][url]`, link.url || "");
      });

      const response = await axiosInstance.post(
        "/contact-info/update",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default contactInfoService;
