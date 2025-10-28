const {
  handleGetAllStudents,
  handleAddStudent,
  handleUpdateStudent,
  handleGetStudentDetail,
  handleStudentStatus,
} = require("../students-controller");

const {
  getAllStudents,
  addNewStudent,
  getStudentDetail,
  setStudentStatus,
  updateStudent,
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
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
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
    expect(res.json).toHaveBeenCalledWith(mockStudents);
  });

  it("handleGetStudentDetail should call getStudentDetail and return 200", async () => {
    const mockStudent = { id: 1, name: "John" };
    getStudentDetail.mockResolvedValue(mockStudent);
    req.params = { id: "1" };

    await handleGetStudentDetail(req, res, next);

    expect(getStudentDetail).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStudent);
  });

  it("handleAddStudent should call addNewStudent and return 201", async () => {
    const payload = { name: "New Student", email: "new@test.com" };
    const result = { message: "Success" };
    addNewStudent.mockResolvedValue(result);
    req.body = payload;

    await handleAddStudent(req, res, next);

    expect(addNewStudent).toHaveBeenCalledWith(payload);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("handleUpdateStudent should call updateStudent and return 200", async () => {
    const payload = { id: 1, name: "Updated" };
    const result = { message: "Updated" };
    updateStudent.mockResolvedValue(result);
    req.body = payload;

    await handleUpdateStudent(req, res, next);

    expect(updateStudent).toHaveBeenCalledWith(payload);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
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
    expect(res.json).toHaveBeenCalledWith(result);
  });
});
