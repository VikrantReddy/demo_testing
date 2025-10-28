const asyncHandler = require("express-async-handler");
const { ApiError } = require("../../utils");
const log = require("../../utils/log");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent, deleteStudent } = require("./students-service");

// Validation helpers
const validateIdParam = (id) => {
    const numId = parseInt(id, 10);
    if (!Number.isInteger(numId) || numId <= 0) {
        throw new ApiError(400, "Invalid student ID. ID must be a positive integer.");
    }
};

const validateStudentPayload = (body, operation = "create") => {
    if (!body || Object.keys(body).length === 0) {
        throw new ApiError(400, `Student data is required for ${operation} operation.`);
    }

    // Email is required for create operations
    if (operation === "create") {
        if (!body.email || typeof body.email !== "string" || body.email.trim() === "") {
            throw new ApiError(400, "A non-empty email is required for student creation.");
        }
        validateEmail(body.email.trim());
    }

    // Email is optional for update, but validate if provided
    if (operation === "update" && body.email) {
        if (typeof body.email !== "string" || body.email.trim() === "") {
            throw new ApiError(400, "Email must be a non-empty string.");
        }
        validateEmail(body.email.trim());
    }
};

const validateEmail = (email) => {
    // RFC 5321/5322 compliant basic email validation
    // This is a simplified validation - use library for production
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format provided.");
    }
};

const validateStatusPayload = (body) => {
    if (body.status === undefined || body.status === null) {
        throw new ApiError(400, "Status field is required.");
    }

    if (typeof body.status !== "boolean") {
        throw new ApiError(400, "Status must be a boolean value (true/false).");
    }
};

const validateUserAuthentication = (user) => {
    if (!user || !user.id) {
        throw new ApiError(401, "User authentication required for this operation.");
    }
};

const handleGetAllStudents = asyncHandler(async (req, res) => {
    log.info("Fetching all students", { filters: req.query });
    const students = await getAllStudents(req.query);
    log.success(`Retrieved ${students.length} students`, { count: students.length });
    res.status(200).json({
        success: true,
        data: students,
        count: students.length
    });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    // Validate request body
    validateStudentPayload(req.body, "create");

    // Trim email before passing to service
    const payload = { ...req.body, email: req.body.email.trim() };

    log.info("Creating new student", { email: payload.email });
    const result = await addNewStudent(payload);
    log.success("Student created successfully", { studentId: result.id, email: result.email });

    res.status(201).json({
        success: true,
        data: result
    });
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID parameter from URL
    validateIdParam(id);

    // Validate request body
    validateStudentPayload(req.body, "update");

    // Use URL parameter as the single source of truth for student ID
    // Trim email if provided
    const payload = { id, ...req.body };
    if (payload.email) {
        payload.email = payload.email.trim();
    }

    log.info("Updating student", { studentId: id });
    const result = await updateStudent(payload);
    log.success("Student updated successfully", { studentId: result.id });

    res.status(200).json({
        success: true,
        data: result
    });
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID parameter
    validateIdParam(id);

    log.debug("Fetching student details", { studentId: id });
    const student = await getStudentDetail(id);
    log.info("Student details retrieved", { studentId: id });

    return res.status(200).json({
        success: true,
        data: student
    });
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID parameter
    validateIdParam(id);

    // Validate status payload
    validateStatusPayload(req.body);

    // Validate user authentication and authorization
    validateUserAuthentication(req.user);

    log.info("Updating student status", { studentId: id, status: req.body.status, reviewerId: req.user.id });
    const payload = { userId: id, status: req.body.status, reviewerId: req.user.id };
    const result = await setStudentStatus(payload);
    log.success("Student status updated", { studentId: id, newStatus: req.body.status });

    return res.status(200).json({
        success: true,
        data: result
    });
});

const handleDeleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID parameter
    validateIdParam(id);

    // Validate user authentication and authorization
    validateUserAuthentication(req.user);

    // TODO: Add role-based access control
    // Only admin/teachers should be able to delete students
    // if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    //     throw new ApiError(403, "You do not have permission to delete students.");
    // }

    log.info("Deleting student", { studentId: id, deletedBy: req.user.id });
    const result = await deleteStudent(id);
    log.success("Student deleted successfully", { studentId: id });

    return res.status(204).end();
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent,
};
