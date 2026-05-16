import axiosInstance from "./axiosInstance";

const governorateService = {
  /**
   * GET /governorates
   * Fetches all governorates with both Arabic and English names merged
   */
  async getAll() {
    // Fetch both languages in parallel
    const [arRes, enRes] = await Promise.all([
      axiosInstance.get("/governorates", { headers: { "Accept-Language": "ar" } }),
      axiosInstance.get("/governorates", { headers: { "Accept-Language": "en" } }),
    ]);

    const arData = arRes.data.data || [];
    const enData = enRes.data.data || [];

    // Merge by ID
    return {
      success: true,
      data: arData.map((item) => {
        const enItem = enData.find((en) => en.id === item.id);
        return {
          ...item,
          name_ar: item.name,
          name_en: enItem ? enItem.name : item.name,
        };
      }),
    };
  },

  /**
   * GET /governorates/:id
   * Fetches a single governorate with both names merged
   */
  async getById(id) {
    const [arRes, enRes] = await Promise.all([
      axiosInstance.get(`/governorates/${id}`, { headers: { "Accept-Language": "ar" } }),
      axiosInstance.get(`/governorates/${id}`, { headers: { "Accept-Language": "en" } }),
    ]);

    const arData = arRes.data.data;
    const enData = enRes.data.data;

    return {
      success: true,
      data: {
        ...arData,
        name_ar: arData.name,
        name_en: enData.name,
      },
    };
  },

  /**
   * POST /governorates
   * Adds a new governorate
   */
  async create(data) {
    // data: { name_ar, name_en, shipping_cost }
    const response = await axiosInstance.post("/governorates", data);
    return response.data;
  },

  /**
   * PUT /governorates/:id
   * Updates an existing governorate
   */
  async update(id, data) {
    // data: { name_ar, name_en, shipping_cost }
    const response = await axiosInstance.put(`/governorates/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /governorates/:id
   * Deletes a governorate
   */
  async delete(id) {
    const response = await axiosInstance.delete(`/governorates/${id}`);
    return response.data;
  },
};

export default governorateService;
