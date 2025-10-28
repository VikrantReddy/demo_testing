const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent, deleteStudent } = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const students = await getAllStudents(req.query);
    res.status(200).json({
        success: true,
        data: students,
        count: students.length
    });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    const result = await addNewStudent(req.body);
    res.status(201).json({
        success: true,
        data: result
    });
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const result = await updateStudent(req.body);
    res.status(200).json({
        success: true,
        data: result
    });
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await getStudentDetail(id);
    return res.status(200).json({
        success: true,
        data: student
    });
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const payload = { userId: req.params.id, status: req.body.status, reviewerId: req.user.id };
    const result = await setStudentStatus(payload);
    return res.status(200).json({
        success: true,
        data: result
    });
});

const handleDeleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await deleteStudent(id);
    return res.status(200).json({
        success: true,
        data: result
    });
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent,
};
