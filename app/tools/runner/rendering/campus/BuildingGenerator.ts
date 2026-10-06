private buildCampusArchitecture() {
  const academicLeft =
    createAcademicBlock({
      width: 20,
      depth: 11,
      floors: 2,
      name: "ACADEMIC BLOCK A",
    });

  academicLeft.position.set(
    -18,
    0,
    38,
  );

  academicLeft.rotation.y =
    Math.PI / 2;

  this.campusBuildings.add(
    academicLeft,
  );

  const academicRight =
    createAcademicBlock({
      width: 22,
      depth: 11,
      floors: 2,
      name: "ACADEMIC BLOCK B",
    });

  academicRight.position.set(
    18,
    0,
    52,
  );

  academicRight.rotation.y =
    -Math.PI / 2;

  this.campusBuildings.add(
    academicRight,
  );

  const academicRear =
    createAcademicBlock({
      width: 24,
      depth: 10,
      floors: 2,
      name: "ACADEMIC BLOCK C",
    });

  academicRear.position.set(
    0,
    0,
    82,
  );

  this.campusBuildings.add(
    academicRear,
  );

  const hostelLeft =
    createHostelBlock({
      width: 18,
      depth: 13,
      floors: 3,
      name: "HOSTEL",
    });

  hostelLeft.position.set(
    -25,
    0,
    105,
  );

  hostelLeft.rotation.y =
    Math.PI / 2;

  this.campusBuildings.add(
    hostelLeft,
  );

  const administration =
    createAdministrationBlock({
      width: 17,
      depth: 11,
      floors: 2,
      name: "ADMINISTRATION",
    });

  administration.position.set(
    25,
    0,
    120,
  );

  administration.rotation.y =
    -Math.PI / 2;

  this.campusBuildings.add(
    administration,
  );

  const service =
    createServiceBlock({
      width: 11,
      depth: 8,
      name: "CAMPUS SERVICES",
    });

  service.position.set(
    -21,
    0,
    145,
  );

  this.campusBuildings.add(
    service,
  );
}
