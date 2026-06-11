import axiosInstance from "./axiosInstance";

const artisticBoardsService = {
  // GET /my-artistic-boards
  async getAll() {
    try {
      const response = await axiosInstance.get("/my-artistic-boards");
      // console.log(response.data);

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // PATCH /my-artistic-boards/:id/approve  — sends toggled is_approved
  async approve(id, currentApproved) {
    try {
      const response = await axiosInstance.post(
        `/my-artistic-boards/${id}/approve`,
        { is_approved: !currentApproved },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /my-artistic-boards/:id
  async remove(id) {
    try {
      const response = await axiosInstance.delete(`/my-artistic-boards/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default artisticBoardsService;
