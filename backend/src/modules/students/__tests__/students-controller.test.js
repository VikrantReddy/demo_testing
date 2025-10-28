const {
  handleGetAllStudents,
  handleAddStudent,
  handleUpdateStudent,
  handleGetStudentDetail,
  handleStudentStatus,
  handleDeleteStudent,
} = require("../students-controller");

const {
  getAllStudents,
  addNewStudent,
  getStudentDetail,
  setStudentStatus,
  updateStudent,
  deleteStudent,
} = require("../students-service");

jest.mock("../students-service");
jest.mock("../students-repository");
jest.mock("../../../shared/repository");
jest.mock("../../../utils", () => ({
  ApiError: jest.requireActual("../../../utils/api-error").ApiError,
  sendAccountVerificationEmail: jest.fn(),
}));

describe("Students Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, user: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), end: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("handleGetAllStudents should call getAllStudents and return 200", async () => {
    const mockStudents = [{ id: 1, name: "John" }];
    getAllStudents.mockResolvedValue(mockStudents);
    req.query = { name: "John" };

    await handleGetAllStudents(req, res, next);

    expect(getAllStudents).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockStudents,
      count: mockStudents.length
    });
  });

  it("handleGetStudentDetail should call getStudentDetail and return 200", async () => {
    const mockStudent = { id: 1, name: "John" };
    getStudentDetail.mockResolvedValue(mockStudent);
    req.params = { id: "1" };

    await handleGetStudentDetail(req, res, next);

    expect(getStudentDetail).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockStudent
    });
  });

  it("handleAddStudent should call addNewStudent and return 201", async () => {
    const payload = { name: "New Student", email: "new@test.com" };
    const result = { message: "Success" };
    addNewStudent.mockResolvedValue(result);
    req.body = payload;

    await handleAddStudent(req, res, next);

    expect(addNewStudent).toHaveBeenCalledWith(payload);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: result
    });
  });

  it("handleUpdateStudent should call updateStudent and return 200", async () => {
    const bodyPayload = { name: "Updated", email: "updated@test.com" };
    const expectedPayload = { id: "1", ...bodyPayload };
    const result = { message: "Updated" };
    updateStudent.mockResolvedValue(result);
    req.params = { id: "1" };
    req.body = bodyPayload;

    await handleUpdateStudent(req, res, next);

    expect(updateStudent).toHaveBeenCalledWith(expectedPayload);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: result
    });
  });

  it("handleStudentStatus should call setStudentStatus and return 200", async () => {
    const result = { message: "Status changed" };
    setStudentStatus.mockResolvedValue(result);
    req.params = { id: "1" };
    req.body = { status: true };
    req.user = { id: 2 };

    await handleStudentStatus(req, res, next);

    expect(setStudentStatus).toHaveBeenCalledWith({
      userId: "1",
      status: true,
      reviewerId: 2,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: result
    });
  });

  it("handleDeleteStudent should call deleteStudent and return 204", async () => {
    const result = { message: "Student deleted successfully" };
    deleteStudent.mockResolvedValue(result);
    req.params = { id: "1" };
    req.user = { id: 2 };

    await handleDeleteStudent(req, res, next);

    expect(deleteStudent).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  describe("Validation Tests", () => {
    const { ApiError } = require("../../../utils/api-error");

    it("handleAddStudent should validate email is provided", async () => {
      const payload = { name: "New Student" };
      req.body = payload;

      await handleAddStudent(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("Email is required");
    });

    it("handleAddStudent should validate email is not empty string", async () => {
      const payload = { name: "New Student", email: "   " };
      req.body = payload;

      await handleAddStudent(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("Email is required");
    });

    it("handleGetStudentDetail should validate positive ID", async () => {
      req.params = { id: "-1" };

      await handleGetStudentDetail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("Invalid student ID");
    });

    it("handleUpdateStudent should validate positive ID", async () => {
      req.params = { id: "-1" };
      req.body = { name: "Updated" };

      await handleUpdateStudent(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("Invalid student ID");
    });

    it("handleUpdateStudent should validate body is not empty", async () => {
      req.params = { id: "1" };
      req.body = {};

      await handleUpdateStudent(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("Student data is required");
    });

    it("handleUpdateStudent should validate email is not empty string", async () => {
      req.params = { id: "1" };
      req.body = { email: "   " };

      await handleUpdateStudent(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("Email must be a non-empty string");
    });

    it("handleStudentStatus should validate authentication", async () => {
      req.params = { id: "1" };
      req.body = { status: true };
      req.user = null;

      await handleStudentStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("User authentication required");
    });

    it("handleStudentStatus should validate status is boolean", async () => {
      req.params = { id: "1" };
      req.body = { status: "true" };
      req.user = { id: 2 };

      await handleStudentStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("Status must be a boolean");
    });

    it("handleDeleteStudent should validate authentication", async () => {
      req.params = { id: "1" };
      req.user = null;

      await handleDeleteStudent(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("User authentication required");
    });
  });
});
