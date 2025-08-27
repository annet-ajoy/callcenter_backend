function getIdDepartmentFromToken(req) {
  const { token, method, body } = req;

  let idDepartmentArray = [];
  let idDepartmentString = "";
  let idDepartment;
  let role = "";

  if (method === "GET") {
    if (token?.isDept) {
      idDepartmentArray = [token.id];
      idDepartmentString = `(${token.id})`;
      role = "department";
    } else if (token?.isSubAdmin) {
      idDepartmentArray = token.id_department?.split(",") || [];
      idDepartmentString = `(${token.id_department || ""})`;
      role = "subadmin";
    } else if (token?.isAdmin) {
      idDepartmentArray = [0];
      idDepartmentString = "(0)";
      role = "admin";
    }
  } else {
    if (token?.isDept) {
      idDepartment = token.id;
    } else if (body?.id_department) {
      idDepartment = body.id_department;
    } else if (token?.isAdmin) {
      idDepartment = 0;
    }
  }

  return {
    idDepartmentArray,
    idDepartmentString,
    idDepartment,
    role,
  };
}

module.exports = { getIdDepartmentFromToken };
